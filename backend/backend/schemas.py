"""Schemas (Pydantic) de entrada e saída da API Morada.

A validação de toda entrada do usuário acontece aqui, no servidor,
mesmo que o frontend já valide (AGENTS.md).
"""

from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

TipoUsuario = Literal["administrador", "proprietario", "corretor", "interessado"]
TipoUsuarioCadastro = Literal["proprietario", "corretor", "interessado"]
Finalidade = Literal["venda", "aluguel"]
SituacaoImovel = Literal["disponivel", "reservado", "negociado", "locado", "inativo"]


def _validar_email(v: str) -> str:
    v = v.strip().lower()
    if "@" not in v or "." not in v.split("@")[-1] or " " in v:
        raise ValueError("Digite um e-mail válido.")
    return v


# ---------------------------------------------------------------- Usuário

class UsuarioCreate(BaseModel):
    nome: str = Field(min_length=3, max_length=100)
    email: str = Field(max_length=150)
    telefone: str | None = Field(default=None, max_length=20)
    tipo_usuario: TipoUsuarioCadastro = "interessado"
    senha: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def email_valido(cls, v: str) -> str:
        return _validar_email(v)

    @field_validator("nome")
    @classmethod
    def nome_completo(cls, v: str) -> str:
        v = " ".join(v.split())
        if len(v.split(" ")) < 2:
            raise ValueError("Informe nome e sobrenome.")
        return v


class UsuarioRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    email: str
    telefone: str | None
    tipo_usuario: TipoUsuario
    data_cadastro: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    situacao: Literal["ativa", "inativa"]


class LoginRequest(BaseModel):
    email: str
    senha: str

    @field_validator("email")
    @classmethod
    def email_valido(cls, v: str) -> str:
        return _validar_email(v)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioRead


# ---------------------------------------------------------------- Imóvel

class FotoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    ordem: int


class HistoricoPrecoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    preco: float
    data: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ImovelCreate(BaseModel):
    titulo: str = Field(min_length=3, max_length=150)
    descricao: str | None = None
    tipo: str = Field(min_length=1, max_length=50)
    finalidade: Finalidade
    preco: float = Field(gt=0)
    cidade: str = Field(min_length=1, max_length=80)
    estado: str = Field(min_length=2, max_length=2)
    bairro: str = Field(min_length=1, max_length=80)
    area_m2: float = Field(gt=0)
    quartos: int = Field(default=0, ge=0)
    banheiros: int = Field(default=0, ge=0)
    vagas_garagem: int = Field(default=0, ge=0)
    fotos: list[str] = Field(default_factory=list, max_length=20)

    @field_validator("estado")
    @classmethod
    def estado_maiusculo(cls, v: str) -> str:
        return v.upper()


class ImovelUpdate(BaseModel):
    titulo: str | None = Field(default=None, min_length=3, max_length=150)
    descricao: str | None = None
    tipo: str | None = Field(default=None, min_length=1, max_length=50)
    finalidade: Finalidade | None = None
    preco: float | None = Field(default=None, gt=0)
    cidade: str | None = Field(default=None, min_length=1, max_length=80)
    estado: str | None = Field(default=None, min_length=2, max_length=2)
    bairro: str | None = Field(default=None, min_length=1, max_length=80)
    area_m2: float | None = Field(default=None, gt=0)
    quartos: int | None = Field(default=None, ge=0)
    banheiros: int | None = Field(default=None, ge=0)
    vagas_garagem: int | None = Field(default=None, ge=0)
    situacao: SituacaoImovel | None = None


class ImovelRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    anunciante_id: int
    titulo: str
    descricao: str | None
    tipo: str
    finalidade: Finalidade
    preco: float
    preco_anterior: float | None
    cidade: str
    estado: str
    bairro: str
    area_m2: float
    quartos: int
    banheiros: int
    vagas_garagem: int
    situacao: SituacaoImovel
    data_cadastro: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    fotos: list[FotoRead] = []
    historico: list[HistoricoPrecoRead] = []
