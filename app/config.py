"""应用配置模块"""
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """全局配置，可通过环境变量或 .env 覆盖"""
    APP_NAME: str = "PythonShop 电商独立站"
    DEBUG: bool = True

    # 数据库连接（asyncpg 异步驱动）
    DATABASE_URL: str = "postgresql+asyncpg://huangyong@localhost:5432/ecommerce"

    # 安全
    SECRET_KEY: str = "pythonshop-dev-secret-key-change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # 多语言
    DEFAULT_LANGUAGE: str = "zh"
    SUPPORTED_LANGUAGES: list[str] = ["zh", "en"]

    # 支付回调地址
    BASE_URL: str = "http://127.0.0.1:8010"

    # 各支付通道是否已开通（未开通的通道不允许下单）
    PAYMENT_GATEWAY_ENABLED: dict[str, bool] = {
        "mock": True,
        "alipay": False,
        "wechat": False,
        "stripe": False,
    }

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()