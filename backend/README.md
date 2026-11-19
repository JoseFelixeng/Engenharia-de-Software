# Backend — Morada

API REST em FastAPI (Python 3.12+) para a plataforma de aluguel e venda de imóveis.

## O que foi feito

- **Autenticação**: cadastro (`POST /auth/cadastro`) e login (`POST /auth/login`) com senha hash bcrypt (custo 12) e token JWT (HS256, expiração 7 dias). Valida: nome com sobrenome, e-mail único, senha ≥ 8 caracteres, conta inativa bloqueada.
- **Usuário logado**: `GET /usuario/me` retorna os dados do autenticado (401 sem token).
- **Imóveis**:
  - `GET /imoveis` — listagem com filtros (finalidade, cidade, bairro, tipo, quartos_min, preço_min/máx, anunciante_id); exclui imóveis inativos.
  - `GET /imoveis/{id}` — detalhe com fotos e histórico de preços.
  - `POST /imoveis` — criar anúncio (apenas `administrador`, `proprietario` e `corretor`); registra histórico inicial de preço.
  - `PATCH /imoveis/{id}` — atualizar anúncio (apenas dono ou administrador); mudança de preço gera registro em `historico_preco` e preenche `preco_anterior`.
  - `DELETE /imoveis/{id}` — soft delete (situação `inativo`); não aparece mais na listagem.
- **Modelos**: alinhados a `morada_postgres.sql` (usuario, imovel, foto_imovel, historico_preco, favorito, contato) via SQLAlchemy 2.0 / SQLModel.
- **Testes**: `tests/test_api.py` com `pytest`, executados em SQLite temporário, cobrindo autenticação, usuário e imóveis.

## Como rodar

### Pré-requisitos
- Python 3.12+
- PostgreSQL (produção) ou qualquer banco compatível com SQLAlchemy (testes usam SQLite)

### Instalação

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements-dev.txt
pip install -e .
```

### Variáveis de ambiente

Crie um `.env` (ou exporte as variáveis):

```
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/morada
SECRET_KEY=sua-chave-secreta-alterar-em-producao
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

### Execução (desenvolvimento)

```bash
python -m uvicorn backend.app:app --reload
```

A API fica disponível em `http://localhost:8000` e a documentação automática em `/docs`.

Ou via Docker:

```bash
docker build -f Dockerfile.dev -t morada-backend .
docker run -p 8082:8082 --env-file .env morada-backend
```

### Testes

```bash
pytest
```

O `conftest.py` sobe um banco SQLite temporário e recria as tabelas a cada teste.

### Banco de dados (produção)

O esquema de referência está em `morada_postgres.sql` na raiz do repositório. No backend, `postgres/create-databases.sh` contém o mesmo SQL. Use Alembic para migrações em produção (o projeto ainda não possui migrações geradas; `db.criar_tabelas()` cria via `create_all` para desenvolvimento).

## Estrutura

```
backend/
  backend/
    app.py          # aplicação FastAPI e routers
    auth.py         # dependências de autenticação
    db.py           # sessão e engine do banco
    config.py       # variáveis de ambiente
    security.py     # hash bcrypt e JWT
    cli.py          # comandos typer
    schemas.py      # Pydantic (entrada/saída)
    models/         # SQLModel: user.py, post.py
    routes/         # FastAPI: auth.py, user.py, post.py
  tests/
    conftest.py     # banco SQLite temporário e fixtures
    test_api.py     # testes da API
  Dockerfile.dev
  requirements-dev.txt / requirements-dev.in
  setup.py
```
