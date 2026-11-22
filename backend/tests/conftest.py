"""Conexão do banco para testes: SQLite em arquivo temporário (compartilhado).

Em produção o banco é PostgreSQL (psycopg2). Aqui usamos SQLite para rodar
testes sem precisar de um banco vivo, mantendo os mesmos modelos e rotas.
Cada teste recria as tabelas (drop/create) para isolamento.
"""

import os
import tempfile

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from backend.app import app
from backend.db import get_db

_db_fd, _db_path = tempfile.mkstemp(suffix=".db")
os.close(_db_fd)
TEST_DATABASE_URL = f"sqlite:///{_db_path}"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db():
    SQLModel.metadata.create_all(engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        SQLModel.metadata.drop_all(engine)


def _override_get_db(db):
    def _get_db():
        try:
            yield db
        finally:
            pass

    return _get_db


@pytest.fixture()
def client(db):
    app.dependency_overrides[get_db] = _override_get_db(db)
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def usuario(client):
    res = client.post("/auth/cadastro", json={
        "nome": "João da Silva",
        "email": "joao@example.com",
        "tipo_usuario": "interessado",
        "senha": "Minha Senha 123",
    })
    assert res.status_code == 201, res.text
    return res.json()["usuario"]


@pytest.fixture()
def token(client, usuario):
    res = client.post("/auth/login", json={
        "email": "joao@example.com",
        "senha": "Minha Senha 123",
    })
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


@pytest.fixture()
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}