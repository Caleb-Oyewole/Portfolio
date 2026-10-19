from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./portfolio.db"
    secret_key: str = "dev-secret-change-me"
    access_token_minutes: int = 60 * 12
    frontend_url: str = "http://localhost:5173"
    cors_origins: str = "http://localhost:5173"

    admin_email: str = "admin@example.com"
    admin_password: str = "change-me-now"

    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    mail_from: str = "no-reply@example.com"
    contact_inbox: str = ""

    @property
    def origins(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
