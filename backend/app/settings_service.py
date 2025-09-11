from sqlmodel import Session, select
from app.models import Setting

DEFAULT_URL = "http://192.168.4.70:1234/v1"


def get_lm_studio_base_url(session: Session) -> str:
    stmt = select(Setting).where(Setting.key == "lm_studio_base_url")
    row = session.exec(stmt).first()
    return row.value if row else DEFAULT_URL


def set_lm_studio_base_url(session: Session, url: str) -> None:
    stmt = select(Setting).where(Setting.key == "lm_studio_base_url")
    row = session.exec(stmt).first()
    if row:
        row.value = url
    else:
        row = Setting(key="lm_studio_base_url", value=url)
        session.add(row)
    session.commit()

