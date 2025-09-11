from sqlmodel import SQLModel, create_engine
from pathlib import Path
import os

DB_PATH = Path("/app/data/app.db")
DB_PATH.parent.mkdir(parents=True, exist_ok=True)
# Ensure the directory is writable
os.chmod(DB_PATH.parent, 0o755)
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})


def init_db():
    try:
        SQLModel.metadata.create_all(engine)
        print(f"Database initialized successfully at {DB_PATH}")
    except Exception as e:
        print(f"Error initializing database: {e}")
        raise

