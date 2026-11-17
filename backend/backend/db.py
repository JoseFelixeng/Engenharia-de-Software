"""Banco de dados: engine, sessão e base declarativa (SQLAlchemy 2.0)."""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from backend.config import DATABASE_URL

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Gera uma sessão do banco de dados para uso nas rotas (dependency do FastAPI)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
