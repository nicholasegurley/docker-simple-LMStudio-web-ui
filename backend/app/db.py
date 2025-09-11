from sqlmodel import SQLModel, create_engine
from pathlib import Path

DB_PATH = Path("/app/data/app.db")
DB_PATH.parent.mkdir(parents=True, exist_ok=True)
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})


def init_db():
    SQLModel.metadata.create_all(engine)
