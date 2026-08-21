"""ERP 后台路由：管理员登录、仪表盘、商品/订单/库存管理"""
from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import require_admin
from app.i18n import get_lang
from app.models import (
    AdminUser,
    AdminRole,
    Category,
    Customer,
    Order,
    OrderStatus,
    Payment,
    Product,
    Review,
    ReviewStatus,
    SKU,
    StockMovement,
)
from app.schemas import (
    AdminLoginIn,
    AdminTokenOut,
    CategoryOut,
    DashboardOut,
    Message,
    OrderOut,
    ProductCreateIn,
    ProductOut,
    ProductUpdateIn,
    SKUIn,
)
from app.security import create_access_token, hash_password, verify_password
from app.routers.orders import _order_to_out

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/login", response_model=AdminTokenOut)
async def admin_login(payload: AdminLoginIn, db: AsyncSession = Depends(get_db)):
    """管理员登录"""
    result = await db.execute(
        select(AdminUser).where(AdminUser.username == payload.username)
    )
    admin = result.scalar_one_or_none()
    if not admin or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    if not admin.is_active:
        raise HTTPException(status_code=403, detail="账号已禁用")

    admin.last_login = datetime.now(timezone.utc).replace(tzinfo=None)
    await db.commit()

    token = create_access_token(subject=str(admin.id), extra={"type": "admin", "role": admin.role.value})
    return AdminTokenOut(
        access_token=token,
        username=admin.username,
        role=admin.role.value,
        full_name=admin.full_name,
    )


@router.get("/dashboard", response_model=DashboardOut)
async def dashboard(
    admin: AdminUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """ERP 仪表盘统计"""
    products_count = (await db.execute(select(func.count(Product.id)))).scalar() or 0
    orders_count = (await db.execute(select(func.count(Order.id)))).scalar() or 0
    customers_count = (await db.execute(select(func.count(Customer.id)))).scalar() or 0

    revenue = (await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0)).where(
            Order.status.in_([OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.COMPLETED])
        )
    )).scalar() or Decimal("0")

    pending_orders = (await db.execute(
        select(func.count(Order.id)).where(Order.status == OrderStatus.PENDING)
    )).scalar() or 0

    low_stock = (await db.execute(
        select(func.count(SKU.id)).where(SKU.stock <= SKU.low_stock_threshold)
    )).scalar() or 0

    return DashboardOut(
        products_count=int(products_count),
        orders_count=int(orders_count),
        customers_count=int(customers_count),
        revenue=Decimal(str(revenue)),
        pending_orders=int(pending_orders),
        low_stock=int(low_stock),
    )


@router.get("/products", response_model=list[ProductOut])
async def admin_list_products(
    q: str | None = None,
    admin: AdminUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """商品列表（后台含下架）"""
    stmt = select(Product).options(selectinload(Product.skus)).order_by(Product.id.desc())
    if q:
        stmt = stmt.where(Product.sku_code.ilike(f"%{q}%"))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/products", response_model=ProductOut, status_code=201)
async def admin_create_product(
    payload: ProductCreateIn,
    admin: AdminUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """新增商品（使用 Pydantic 校验，避免裸 dict 传入非法字段导致 Decimal 异常）"""
    # 校验分类存在
    if payload.category_id is not None:
        cat_exists = await db.execute(
            select(Category).where(Category.id == payload.category_id)
        )
        if not cat_exists.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="分类不存在")

    product = Product(
        sku_code=payload.sku_code,
        name_i18n={"zh": payload.name_zh, "en": payload.name_en or ""},
        description_i18n={"zh": payload.description_zh, "en": payload.description_en or ""},
        category_id=payload.category_id,
        main_image=payload.main_image,
        images=payload.images,
        base_price=payload.base_price,
        status=payload.status,
        is_featured=payload.is_featured,
    )
    db.add(product)
    await db.flush()

    for sku_data in payload.skus:
        db.add(
            SKU(
                product_id=product.id,
                sku_code=sku_data.get("sku_code") or "",
                price=Decimal(str(sku_data.get("price", 0))),
                cost_price=(
                    Decimal(str(sku_data["cost_price"]))
                    if sku_data.get("cost_price") is not None else None
                ),
                stock=int(sku_data.get("stock", 0)),
                attributes=sku_data.get("attributes", {}),
                is_active=sku_data.get("is_active", True),
            )
        )
    await db.commit()

    result = await db.execute(
        select(Product).options(selectinload(Product.skus)).where(Product.id == product.id)
    )
    return result.scalar_one()


@router.put("/products/{product_id}", response_model=ProductOut)
async def admin_update_product(
    product_id: int,
    payload: ProductUpdateIn,
    admin: AdminUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """更新商品（文字/图片/价格/状态等；None 字段表示不修改）"""
    result = await db.execute(
        select(Product).options(selectinload(Product.skus)).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")

    if payload.category_id is not None:
        cat_exists = await db.execute(select(Category).where(Category.id == payload.category_id))
        if not cat_exists.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="分类不存在")
        product.category_id = payload.category_id

    if payload.name_zh is not None or payload.name_en is not None:
        name = dict(product.name_i18n or {})
        if payload.name_zh is not None:
            name["zh"] = payload.name_zh
        if payload.name_en is not None:
            name["en"] = payload.name_en
        product.name_i18n = name

    if payload.description_zh is not None or payload.description_en is not None:
        desc = dict(product.description_i18n or {})
        if payload.description_zh is not None:
            desc["zh"] = payload.description_zh
        if payload.description_en is not None:
            desc["en"] = payload.description_en
        product.description_i18n = desc

    if payload.main_image is not None:
        product.main_image = payload.main_image or None
    if payload.images is not None:
        product.images = [i for i in payload.images if i]
    if payload.base_price is not None:
        product.base_price = payload.base_price
    if payload.status is not None:
        product.status = payload.status
    if payload.is_featured is not None:
        product.is_featured = payload.is_featured

    await db.commit()
    await db.refresh(product)
    return product


@router.post("/products/{product_id}/skus", status_code=201)
async def admin_add_sku(
    product_id: int,
    payload: SKUIn,
    admin: AdminUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """为商品新增 SKU"""
    result = await db.execute(select(Product).where(Product.id == product_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="商品不存在")

    sku = SKU(
        product_id=product_id,
        sku_code=payload.sku_code,
        price=payload.price,
        cost_price=payload.cost_price,
        stock=payload.stock,
        attributes=payload.attributes,
        is_active=payload.is_active,
    )
    db.add(sku)
    await db.commit()
    return {"id": sku.id, "sku_code": sku.sku_code}


@router.put("/skus/{sku_id}/stock")
async def admin_update_stock(
    sku_id: int,
    payload: dict,
    admin: AdminUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """调整 SKU 库存"""
    result = await db.execute(select(SKU).where(SKU.id == sku_id))
    sku = result.scalar_one_or_none()
    if not sku:
        raise HTTPException(status_code=404, detail="SKU 不存在")

    new_stock = int(payload.get("stock", sku.stock))
    delta = new_stock - sku.stock
    sku.stock = new_stock
    db.add(
        StockMovement(
            sku_id=sku.id,
            change_qty=delta,
            balance_after=new_stock,
            reason=payload.get("reason", "admin_adjust"),
            reference="",
            operator=admin.username,
        )
    )
    await db.commit()
    return {"sku_id": sku.id, "stock": sku.stock, "available_stock": sku.available_stock}


@router.get("/orders", response_model=list[OrderOut])
async def admin_list_orders(
    request: Request,
    status: str | None = None,
    admin: AdminUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """订单列表（后台）"""
    stmt = select(Order).options(selectinload(Order.items)).order_by(Order.id.desc())
    if status and status in OrderStatus._value2member_map_:
        stmt = stmt.where(Order.status == OrderStatus(status))
    result = await db.execute(stmt)
    return [_order_to_out(o, get_lang(request)) for o in result.scalars().all()]


@router.post("/orders/{order_no}/ship", response_model=Message)
async def admin_ship_order(
    order_no: str,
    admin: AdminUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """发货"""
    result = await db.execute(select(Order).where(Order.order_no == order_no))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    if order.status != OrderStatus.PAID:
        raise HTTPException(status_code=400, detail="仅已支付订单可发货")

    order.status = OrderStatus.SHIPPED
    order.shipped_at = datetime.now(timezone.utc).replace(tzinfo=None)
    await db.commit()
    return Message(message="已发货")


@router.get("/categories", response_model=list[CategoryOut])
async def admin_list_categories(
    admin: AdminUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Category).order_by(Category.sort_order, Category.id))
    return result.scalars().all()


@router.post("/categories", response_model=CategoryOut, status_code=201)
async def admin_create_category(
    payload: dict,
    admin: AdminUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    cat = Category(
        code=payload.get("code", ""),
        parent_id=payload.get("parent_id"),
        name_i18n=payload.get("name_i18n", {"zh": "", "en": ""}),
        sort_order=int(payload.get("sort_order", 0)),
        is_active=payload.get("is_active", True),
    )
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat


@router.get("/stock-movements")
async def stock_movements(
    limit: int = Query(50, ge=1, le=200),
    admin: AdminUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StockMovement).order_by(StockMovement.id.desc()).limit(limit)
    )
    return result.scalars().all()


# ---------- 评价审核 ----------
@router.get("/reviews", response_model=list[dict])
async def admin_list_reviews(
    request: Request,
    status: str | None = None,
    admin: AdminUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """评价列表（最新优先，可按状态过滤 pending/approved/rejected）"""
    stmt = (
        select(Review)
        .options(selectinload(Review.customer), selectinload(Review.product))
        .order_by(Review.id.desc())
    )
    if status and status in ReviewStatus._value2member_map_:
        stmt = stmt.where(Review.status == ReviewStatus(status))
    result = await db.execute(stmt)
    out = []
    for r in result.scalars().all():
        out.append(
            {
                "id": r.id,
                "product_id": r.product_id,
                "product_name": r.product.name(get_lang(request)) if r.product else "",
                "customer_id": r.customer_id,
                "customer_name": (
                    (r.customer.full_name or r.customer.email)
                    if r.customer else "匿名"
                ),
                "rating": r.rating,
                "title": r.title,
                "content": r.content,
                "status": r.status.value,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
        )
    return out


@router.post("/reviews/{review_id}/moderate")
async def moderate_review(
    review_id: int,
    payload: dict,
    admin: AdminUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """审核评价：approved 通过 / rejected 拒绝"""
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="评价不存在")

    new_status = payload.get("status", "")
    if new_status not in ReviewStatus._value2member_map_:
        raise HTTPException(status_code=400, detail="非法状态")
    review.status = ReviewStatus(new_status)
    await db.commit()
    return {"id": review.id, "status": review.status.value}