"""Modelos de imóvel e tabelas relacionadas — segue morada_postgres.sql."""

from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, ForeignKey, String
from sqlmodel import Field, Relationship, SQLModel


class Imovel(SQLModel, table=True):
    __tablename__ = "imovel"

    __table_args__ = (
        CheckConstraint("finalidade IN ('venda', 'aluguel')", name="ck_imovel_finalidade"),
        CheckConstraint(
            "situacao IN ('disponivel', 'reservado', 'negociado', 'locado', 'inativo')",
            name="ck_imovel_situacao",
        ),
        CheckConstraint("preco >= 0", name="ck_imovel_preco"),
    )

    id: int | None = Field(default=None, primary_key=True)
    anunciante_id: int = Field(foreign_key="usuario.id", index=True)
    titulo: str = Field(max_length=150)
    descricao: str | None = None
    tipo: str = Field(max_length=50)
    finalidade: str = Field(max_length=10)
    preco: float
    preco_anterior: float | None = None
    cidade: str = Field(max_length=80)
    estado: str = Field(max_length=2)
    bairro: str = Field(max_length=80)
    area_m2: float
    quartos: int = 0
    banheiros: int = 0
    vagas_garagem: int = 0
    situacao: str = Field(default="disponivel", max_length=15)
    data_cadastro: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))

    anunciante: "Usuario" = Relationship(back_populates="imoveis")
    fotos: list["FotoImovel"] = Relationship(back_populates="imovel", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    historico: list["HistoricoPreco"] = Relationship(back_populates="imovel", sa_relationship_kwargs={"cascade": "all, delete-orphan"})


class FotoImovel(SQLModel, table=True):
    __tablename__ = "foto_imovel"

    id: int | None = Field(default=None, primary_key=True)
    imovel_id: int = Field(foreign_key="imovel.id", index=True)
    url: str = Field(max_length=500)
    ordem: int = 0

    imovel: Imovel = Relationship(back_populates="fotos")


class HistoricoPreco(SQLModel, table=True):
    __tablename__ = "historico_preco"

    id: int | None = Field(default=None, primary_key=True)
    imovel_id: int = Field(foreign_key="imovel.id", index=True)
    preco: float
    data: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))

    imovel: Imovel = Relationship(back_populates="historico")


class Favorito(SQLModel, table=True):
    __tablename__ = "favorito"

    usuario_id: int = Field(foreign_key="usuario.id", primary_key=True)
    imovel_id: int = Field(foreign_key="imovel.id", primary_key=True)
    data: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))

    usuario: "Usuario" = Relationship()
    imovel: Imovel = Relationship()


class Contato(SQLModel, table=True):
    __tablename__ = "contato"

    id: int | None = Field(default=None, primary_key=True)
    imovel_id: int = Field(foreign_key="imovel.id", index=True)
    interessado_id: int = Field(foreign_key="usuario.id", index=True)
    mensagem: str | None = None
    data: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))
