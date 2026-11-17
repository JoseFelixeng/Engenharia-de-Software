"""Configuração da aplicação Morada."""

import os

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg2://postgres:postgres@localhost:5432/morada"
)
SECRET_KEY = os.getenv("SECRET_KEY", "morada-dev-chave-secreta-alterar-em-producao")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 dias
