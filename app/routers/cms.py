"""站点内容管理（CMS）：首页轮播、页面文字区块的管理与公开读取

- 公开接口：GET /api/banners?placement=home_hero 返回启用中的轮播
- 管理接口（require_admin）：
  - GET  /api/admin/banners                 轮播列表（含停用）
  - POST /api/admin/banners                 新增轮播
  - PUT  /api/admin/banners/{id}            更新轮播
  - DELETE /api/admin/banners/{id}          删除轮播
  - GET/PUT /api/admin/cms-content          页面文字内容（K-V，多语言 JSON）
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import require_admin
from app.i18n import get_lang
from app.models import AdminUser, SiteBanner, SiteContent

router = APIRouter(prefix="/api", tags=["cms"])

# 默认页面文字内容（首页/关于页等区块文字，ERP 后台可修改）
DEFAULT_CMS_CONTENT = {
    "home": {
        "benefits": {
            "free_ship": {"zh": "全场包邮", "en": "Free Shipping"},
            "free_ship_desc": {"zh": "满 99 元免运费", "en": "Free over $99"},
            "safe_pay": {"zh": "安全支付", "en": "Secure Payment"},
            "safe_pay_desc": {"zh": "多种支付方式保障", "en": "Multi-way protected"},
            "easy_return": {"zh": "无忧退货", "en": "Easy Return"},
            "easy_return_desc": {"zh": "7 天无理由退换", "en": "7-day free returns"},
            "support": {"zh": "贴心服务", "en": "24/7 Support"},
            "support_desc": {"zh": "在线客服 7x24 小时", "en": "Online service 24/7"},
        },
        "sections": {
            "hot_categories_title": {"zh": "热门分类", "en": "Hot Categories"},
            "featured_title": {"zh": "为你推荐", "en": "Featured"},
            "banner_slogan": {"zh": "潮流新主张", "en": "New Trend Statement"},
        },
    },
    "about": {
        "hero_title": {"zh": "关于我们", "en": "About Us"},
        "hero_subtitle": {"zh": "以热爱与匠心，连接全球潮流生活", "en": "Connect global trend life with passion"},
        "story_title": {"zh": "品牌故事", "en": "Brand Story"},
        "story_content": {
            "zh": "我们创立于 2020 年，坚信好设计应被更多人拥有。从一针一线到极致细节，每一件商品都承载着对品质的执着与对潮流的理解。",
            "en": "Founded in 2020, we believe great design should reach more people. Every product carries our dedication to quality and understanding of trends.",
        },
        "mission_title": {"zh": "我们的使命", "en": "Our Mission"},
        "mission_content": {
            "zh": "让每一次购物都成为愉悦的体验，让每一件商品都物超所值。",
            "en": "Make every purchase delightful and every product worth its value.",
        },
    },
}


def _banner_to_dict(b: SiteBanner, lang: str) -> dict:
    return {
        "id": b.id,
        "placement": b.placement,
        "title": b.title(lang),
        "title_i18n": b.title_i18n,
        "subtitle": b.subtitle(lang),
        "subtitle_i18n": b.subtitle_i18n,
        "button_text": b.button_text(lang),
        "button_text_i18n": b.button_text_i18n,
        "image_url": b.image_url,
        "video_url": b.video_url,
        "link_url": b.link_url,
        "sort_order": b.sort_order,
        "is_active": b.is_active,
    }


# ---------- 公开读取 ----------
@router.get("/banners")
async def list_banners(
    request: Request,
    placement: str = Query("home_hero"),
    db: AsyncSession = Depends(get_db),
):
    """前台公开：读取启用中的轮播/内容，按 sort_order 排序"""
    lang = get_lang(request)
    result = await db.execute(
        select(SiteBanner)
        .where(SiteBanner.placement == placement, SiteBanner.is_active.is_(True))
        .order_by(SiteBanner.sort_order, SiteBanner.id)
    )
    return [_banner_to_dict(b, lang) for b in result.scalars().all()]


@router.get("/site-content")
async def get_site_content(
    request: Request,
    page: str = Query("home"),
    db: AsyncSession = Depends(get_db),
):
    """前台公开：读取页面文字内容（DB 持久化内容优先，未配置时回退默认值）"""
    return await _load_page_content_async(db, page)


# ---------- 页面内容持久化（SiteContent） ----------

def _flatten_content(page: str, content: dict, prefix: str = "") -> list[tuple[str, dict | str]]:
    """递归把页面内容扁平化为 (key, value)。

    叶子规则：
    - dict 且键 ⊆ {zh, en} → 多语言内容，整体保存
    - dict（其他键）→ 容器，递归展开（key 用 '.' 连接）
    - 标量（str/int/bool/URL）→ 直接保存原值
    """
    out: list[tuple[str, dict | str]] = []
    for k, v in content.items():
        key = f"{page}:{prefix}{k}" if prefix else f"{page}:{k}"
        if isinstance(v, dict):
            # 多语言叶子：{"zh","en"} → 整体保存
            if set(v.keys()) <= {"zh", "en"} and v:
                out.append((key, v))
            else:
                out.extend(_flatten_content(page, v, prefix=f"{key.split(':', 1)[1]}."))
        else:
            out.append((key, v))
    return out


def _unflatten_content(rows, page: str) -> dict:
    """把 DB 行 (key, value) 还原为页面嵌套 dict"""
    merged: dict = {}
    for r in rows:
        parts = r.key.split(":")
        if len(parts) < 2:
            continue
        rest = parts[1]  # "story_title" 或 "benefits.free_ship" 或 "story.image"
        segments = rest.split(".")
        node = merged
        for i, seg in enumerate(segments[:-1]):
            node = node.setdefault(seg, {})
        node[segments[-1]] = r.value
    return merged


async def _load_page_content_async(db: AsyncSession, page: str) -> dict:
    """从 SiteContent 表加载页面内容，DB 值覆盖默认值"""
    defaults = DEFAULT_CMS_CONTENT.get(page, {})
    if page not in DEFAULT_CMS_CONTENT:
        return defaults

    result = await db.execute(
        select(SiteContent).where(SiteContent.key.like(f"{page}:%"))
    )
    rows = result.scalars().all()
    if not rows:
        return defaults

    merged = _unflatten_content(rows, page)

    # DB 值覆盖默认值（默认值兜底未配置部分）
    def _overlay(base, patch):
        if isinstance(base, dict) and isinstance(patch, dict):
            out = dict(base)
            for k, v in patch.items():
                out[k] = _overlay(base.get(k), v) if isinstance(v, dict) and isinstance(base.get(k), dict) else v
            return out
        return patch

    return _overlay(defaults, merged)


async def _save_page_content(db: AsyncSession, page: str, content: dict) -> None:
    """将页面内容扁平化写入 SiteContent 表（幂等 upsert）"""
    existing_result = await db.execute(
        select(SiteContent).where(SiteContent.key.like(f"{page}:%"))
    )
    existing = {r.key: r for r in existing_result.scalars().all()}

    pending = _flatten_content(page, content)
    keys_seen: set[str] = set()
    for key, val in pending:
        keys_seen.add(key)
        if key in existing:
            existing[key].value = val
        else:
            db.add(SiteContent(key=key, value=val))

    for key, row in existing.items():
        if key not in keys_seen:
            await db.delete(row)
    await db.commit()


# ---------- 管理接口 ----------
@router.get("/admin/banners")
async def admin_list_banners(
    placement: str | None = None,
    admin: AdminUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(SiteBanner).order_by(SiteBanner.placement, SiteBanner.sort_order, SiteBanner.id)
    if placement:
        stmt = stmt.where(SiteBanner.placement == placement)
    result = await db.execute(stmt)
    return [_banner_to_dict(b, "zh") for b in result.scalars().all()]


@router.post("/admin/banners", status_code=201)
async def admin_create_banner(
    payload: dict,
    admin: AdminUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    banner = SiteBanner(
        placement=str(payload.get("placement") or "home_hero"),
        title_i18n=payload.get("title_i18n") or {"zh": "", "en": ""},
        subtitle_i18n=payload.get("subtitle_i18n") or {"zh": "", "en": ""},
        button_text_i18n=payload.get("button_text_i18n") or {"zh": "", "en": ""},
        image_url=payload.get("image_url") or None,
        video_url=payload.get("video_url") or None,
        link_url=payload.get("link_url") or None,
        sort_order=int(payload.get("sort_order") or 0),
        is_active=bool(payload.get("is_active", True)),
    )
    db.add(banner)
    await db.commit()
    await db.refresh(banner)
    return _banner_to_dict(banner, "zh")


@router.put("/admin/banners/{banner_id}")
async def admin_update_banner(
    banner_id: int,
    payload: dict,
    admin: AdminUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SiteBanner).where(SiteBanner.id == banner_id))
    banner = result.scalar_one_or_none()
    if not banner:
        raise HTTPException(status_code=404, detail="轮播不存在")

    if "placement" in payload:
        banner.placement = str(payload["placement"])
    if "title_i18n" in payload:
        banner.title_i18n = payload["title_i18n"]
    if "subtitle_i18n" in payload:
        banner.subtitle_i18n = payload["subtitle_i18n"]
    if "button_text_i18n" in payload:
        banner.button_text_i18n = payload["button_text_i18n"]
    if "image_url" in payload:
        banner.image_url = payload["image_url"] or None
    if "video_url" in payload:
        banner.video_url = payload["video_url"] or None
    if "link_url" in payload:
        banner.link_url = payload["link_url"] or None
    if "sort_order" in payload:
        banner.sort_order = int(payload["sort_order"])
    if "is_active" in payload:
        banner.is_active = bool(payload["is_active"])
    await db.commit()
    await db.refresh(banner)
    return _banner_to_dict(banner, "zh")


@router.delete("/admin/banners/{banner_id}")
async def admin_delete_banner(
    banner_id: int,
    admin: AdminUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SiteBanner).where(SiteBanner.id == banner_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="轮播不存在")
    await db.execute(delete(SiteBanner).where(SiteBanner.id == banner_id))
    await db.commit()
    return {"message": "已删除"}


# ---------- 页面文字内容管理 ----------
@router.get("/admin/cms-content")
async def admin_get_cms_content(
    page: str = Query("home"),
    admin: AdminUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """后台读取：DB 持久化内容优先，未配置回退默认值"""
    return await _load_page_content_async(db, page)


@router.put("/admin/cms-content")
async def admin_put_cms_content(
    payload: dict,
    admin: AdminUser = Depends(require_admin({"superadmin", "operator"})),
    db: AsyncSession = Depends(get_db),
):
    """保存页面文字/图片内容（持久化到 SiteContent 表，重启不丢失）"""
    page = str(payload.get("page") or "home")
    content = payload.get("content") or {}
    # 合并：仅覆盖传入的字段，其余保留 DB/默认值
    base = await _load_page_content_async(db, page)
    merged = _deep_merge(base, content)
    await _save_page_content(db, page, merged)
    return {"message": "已保存", "page": page}


def _deep_merge(base: dict, patch: dict) -> dict:
    """递归合并，patch 覆盖 base 的叶子值，返回新 dict"""
    result = dict(base)
    for k, v in patch.items():
        if isinstance(v, dict) and isinstance(result.get(k), dict):
            result[k] = _deep_merge(result[k], v)
        else:
            result[k] = v
    return result