from sqlmodel import Session
from .db import engine


def get_session():
    with Session(engine) as s:
        yield s
