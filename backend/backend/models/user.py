"""Modelo USUARIO — segue morada_postgres.sql (fonte da verdade)."""

from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, String
from sqlmodel import Field, Relationship, SQLModel


class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"

    __table_args__ = (
        CheckConstraint(
            "tipo_usuario IN ('administrador', 'proprietario', 'corretor', 'interessado')",
            name="ck_usuario_tipo",
        ),
        CheckConstraint("situacao IN ('ativa', 'inativa')", name="ck_usuario_situacao"),
    )

    id: int | None = Field(default=None, primary_key=True)
    nome: str = Field(max_length=100)
    email: str = Field(max_length=150, unique=True, index=True)
    telefone: str | None = Field(default=None, max_length=20)
    senha_hash: str
    tipo_usuario: str = Field(max_length=20)
    data_cadastro: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))
    situacao: str = Field(default="ativa", max_length=10)

    imoveis: list["Imovel"] = Relationship(back_populates="anunciante")
