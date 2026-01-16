import os
import subprocess
import sys

# Attempt to import SQLAlchemy, install if missing
try:
    from sqlalchemy import create_engine
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "sqlalchemy"])
    from sqlalchemy import create_engine

from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite database file in backend folder
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'logs.db')}"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
