"""客户认证路由：注册、登录、当前用户"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_customer
from app.models import Customer
from app.schemas import CustomerOut, LoginIn, RegisterIn, TokenOut
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

_NOW = lambda: datetime.now(timezone.utc).replace(tzinfo=None)


@router.post("/register", response_model=TokenOut, status_code=201)
async def register(payload: RegisterIn, db: AsyncSession = Depends(get_db)):
    """注册新客户"""
    existing = await db.execute(select(Customer).where(Customer.email == payload.email.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="邮箱已被注册")

    customer = Customer(
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        phone=payload.phone,
        language=payload.language or "zh",
    )
    db.add(customer)
    await db.commit()
    await db.refresh(customer)

    token = create_access_token(subject=str(customer.id), extra={"type": "customer"})
    return TokenOut(access_token=token, customer=CustomerOut.model_validate(customer))


@router.post("/login", response_model=TokenOut)
async def login(payload: LoginIn, db: AsyncSession = Depends(get_db)):
    """客户登录"""
    result = await db.execute(select(Customer).where(Customer.email == payload.email.lower()))
    customer = result.scalar_one_or_none()
    if not customer or not verify_password(payload.password, customer.password_hash):
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    if not customer.is_active:
        raise HTTPException(status_code=403, detail="账号已被禁用")

    customer.last_login = _NOW()
    await db.commit()

    token = create_access_token(subject=str(customer.id), extra={"type": "customer"})
    return TokenOut(access_token=token, customer=CustomerOut.model_validate(customer))


@router.get("/me", response_model=CustomerOut)
async def me(customer: Customer = Depends(get_current_customer)):
    """获取当前登录客户信息"""
    return CustomerOut.model_validate(customer)