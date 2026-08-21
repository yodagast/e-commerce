"""初始化种子数据：默认管理员、示例分类与商品（幂等）"""
from __future__ import annotations

from decimal import Decimal

from sqlalchemy import select

from app.database import async_session_factory
from app.models import AdminRole, AdminUser, Category, Product, SKU
from app.security import hash_password


async def seed_all() -> None:
    """写入默认数据，已存在则跳过，保证可重复执行"""
    async with async_session_factory() as db:
        # 1) 默认管理员
        exists = await db.execute(
            select(AdminUser).where(AdminUser.username == "admin")
        )
        if not exists.scalar_one_or_none():
            db.add(
                AdminUser(
                    username="admin",
                    password_hash=hash_password("admin123"),
                    full_name="超级管理员",
                    role=AdminRole.SUPERADMIN,
                    is_active=True,
                )
            )
            print("[seed] 创建默认管理员 admin / admin123")

        # 2) 分类
        categories_data = [
            ("electronics", {"zh": "电子产品", "en": "Electronics"}, 1),
            ("clothing", {"zh": "服装鞋帽", "en": "Clothing"}, 2),
            ("home", {"zh": "家居生活", "en": "Home & Living"}, 3),
            ("books", {"zh": "图书文娱", "en": "Books"}, 4),
        ]
        categories: dict[str, Category] = {}
        for code, name_i18n, sort_order in categories_data:
            result = await db.execute(select(Category).where(Category.code == code))
            cat = result.scalar_one_or_none()
            if not cat:
                cat = Category(code=code, name_i18n=name_i18n, sort_order=sort_order)
                db.add(cat)
                await db.flush()
            categories[code] = cat

        # 3) 商品与 SKU
        products_data = [
            {
                "category": "electronics",
                "sku_code": "PHONE-001",
                "name_i18n": {"zh": "智能手机 Pro", "en": "Smartphone Pro"},
                "description_i18n": {
                    "zh": "6.7 英寸全面屏，超清三摄，旗舰性能。",
                    "en": "6.7-inch full screen, triple camera, flagship performance.",
                },
                "main_image": "https://picsum.photos/seed/phone/600/400",
                "images": [],
                "base_price": "4999.00",
                "brand": "PythonPhone",
                "is_featured": True,
                "skus": [
                    {"sku_code": "PHONE-001-BLK-256", "attributes": {"颜色": "黑色", "存储": "256GB"}, "price": "4999.00", "stock": 100},
                    {"sku_code": "PHONE-001-WHT-512", "attributes": {"颜色": "白色", "存储": "512GB"}, "price": "5599.00", "stock": 50},
                ],
            },
            {
                "category": "electronics",
                "sku_code": "LAPTOP-001",
                "name_i18n": {"zh": "轻薄笔记本", "en": "Ultrabook"},
                "description_i18n": {
                    "zh": "1.2kg 轻薄机身，全天候续航。",
                    "en": "1.2kg slim body, all-day battery life.",
                },
                "main_image": "https://picsum.photos/seed/laptop/600/400",
                "images": [],
                "base_price": "6999.00",
                "brand": "PythonBook",
                "is_featured": True,
                "skus": [
                    {"sku_code": "LAPTOP-001-SLV", "attributes": {"颜色": "银色", "内存": "16GB"}, "price": "6999.00", "stock": 30},
                ],
            },
            {
                "category": "clothing",
                "sku_code": "TSHIRT-001",
                "name_i18n": {"zh": "纯棉圆领T恤", "en": "Cotton Crew T-Shirt"},
                "description_i18n": {
                    "zh": "100% 纯棉，舒适透气。",
                    "en": "100% cotton, soft and breathable.",
                },
                "main_image": "https://picsum.photos/seed/tshirt/600/400",
                "images": [],
                "base_price": "99.00",
                "brand": "PythonWear",
                "is_featured": False,
                "skus": [
                    {"sku_code": "TSHIRT-001-L", "attributes": {"颜色": "白色", "尺码": "L"}, "price": "99.00", "stock": 200},
                    {"sku_code": "TSHIRT-001-XL", "attributes": {"颜色": "白色", "尺码": "XL"}, "price": "99.00", "stock": 180},
                ],
            },
            {
                "category": "home",
                "sku_code": "CUP-001",
                "name_i18n": {"zh": "陶瓷马克杯", "en": "Ceramic Mug"},
                "description_i18n": {
                    "zh": "简约陶瓷马克杯，容量 350ml。",
                    "en": "Minimalist ceramic mug, 350ml.",
                },
                "main_image": "https://picsum.photos/seed/mug/600/400",
                "images": [],
                "base_price": "39.90",
                "brand": "PythonHome",
                "is_featured": False,
                "skus": [
                    {"sku_code": "CUP-001-WHT", "attributes": {"颜色": "白色"}, "price": "39.90", "stock": 500},
                ],
            },
            {
                "category": "books",
                "sku_code": "BOOK-001",
                "name_i18n": {"zh": "Python 编程入门", "en": "Python for Beginners"},
                "description_i18n": {
                    "zh": "从零开始学习 Python 编程。",
                    "en": "Learn Python programming from scratch.",
                },
                "main_image": "https://picsum.photos/seed/book/600/400",
                "images": [],
                "base_price": "59.00",
                "brand": "PythonPress",
                "is_featured": False,
                "skus": [
                    {"sku_code": "BOOK-001-P", "attributes": {"版本": "平装"}, "price": "59.00", "stock": 80},
                ],
            },
        ]

        for pdata in products_data:
            result = await db.execute(
                select(Product).where(Product.sku_code == pdata["sku_code"])
            )
            product = result.scalar_one_or_none()
            if not product:
                product = Product(
                    category_id=categories[pdata["category"]].id,
                    sku_code=pdata["sku_code"],
                    name_i18n=pdata["name_i18n"],
                    description_i18n=pdata["description_i18n"],
                    main_image=pdata["main_image"],
                    images=pdata["images"],
                    base_price=Decimal(pdata["base_price"]),
                    brand=pdata["brand"],
                    status="active",
                    is_featured=pdata["is_featured"],
                )
                db.add(product)
                await db.flush()
                for sku_data in pdata["skus"]:
                    db.add(
                        SKU(
                            product_id=product.id,
                            sku_code=sku_data["sku_code"],
                            attributes=sku_data["attributes"],
                            price=Decimal(sku_data["price"]),
                            cost_price=Decimal(sku_data["price"]) * Decimal("0.6"),
                            stock=sku_data["stock"],
                            locked_stock=0,
                            low_stock_threshold=10,
                            is_active=True,
                        )
                    )

        await db.commit()
        print("[seed] 种子数据初始化完成")