"""Banco de dados: engine, sessão e base declarativa (SQLAlchemy 2.0 via SQLModel)."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from backend.config import DATABASE_URL

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Gera uma sessão do banco de dados para uso nas rotas (dependency do FastAPI)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def criar_tabelas():
    """Cria as tabelas no banco (útil para desenvolvimento; em produção use Alembic)."""
    SQLModel.metadata.create_all(engine)
