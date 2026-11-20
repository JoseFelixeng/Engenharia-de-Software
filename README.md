# Morada — Aluguel e Venda de Imóveis

Plataforma imobiliária com frontend em React 19 + Vite + React Router e backend em FastAPI + SQLAlchemy 2.0.

## O que está funcionando

- **Banco de dados**: PostgreSQL 16 com esquema completo (`usuario`, `imovel`, `foto_imovel`, `historico_preco`, `favorito`, `contato`) inicializado automaticamente via Docker.
- **Backend (FastAPI)**:
  - `POST /auth/cadastro` — cadastro de usuário com validação (nome+sobrenome, e-mail único, senha ≥ 8 chars)
  - `POST /auth/login` — login com senha hash bcrypt (custo 12) e JWT (expiração 7 dias)
  - `GET /usuario/me` — dados do usuário autenticado (protegido)
  - `GET /imoveis` — listagem com filtros (finalidade, cidade, bairro, tipo, quartos_min, preço_min/máx, anunciante_id)
  - `GET /imoveis/{id}` — detalhe com fotos e histórico de preços
  - `POST /imoveis` — criar anúncio (apenas anunciantes)
  - `PATCH /imoveis/{id}` — atualizar anúncio (dono ou admin; mudança de preço gera histórico)
  - `DELETE /imoveis/{id}` — soft delete (situação `inativo`)
- **Frontend (React 19)**:
  - `/` — Home com busca, cards de imóveis, diferencials (compatibilidade, histórico de preços, comparador)
  - `/login` — login com e-mail/senha e "Continuar com Google"
  - `/cadastro` — cadastro com tipo de usuário, validação e medidor de força de senha
  - `/comprador` — busca de imóveis para interessados
  - `/vendedor` — meus anúncios + cadastro de novo imóvel (proprietario/corretor)
  - `/admin` — gestão de usuários (administrador)

## Como rodar

### Opção 1: Docker Compose (recomendado)

Sobe banco, backend e frontend em um único comando:

```bash
# Na raiz do projeto
docker compose up -d --build
```

Serviços disponíveis:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000` (docs em `/docs`)
- Banco PostgreSQL: `localhost:5433`

Para parar:
```bash
docker compose down
```

### Opção 2: Rodar manualmente

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements-dev.txt
pip install -e .
```

Crie um `.env` (exemplo em `backend/README.md`):

```
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/morada
SECRET_KEY=sua-chave-secreta-alterar-em-producao
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

Rode o banco (se não estiver usando Docker) e inicie o backend:

```bash
python -m uvicorn backend.app:app --reload
```

API disponível em `http://localhost:8000`.

#### Frontend

```bash
cd frontend
npm install
```

Crie um `.env` (exemplo em `frontend/.env.example`):

```
VITE_API_BASE=http://localhost:8000
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Frontend disponível em `http://localhost:5173`.

## Estrutura do repositório

```
.
├── docker-compose.yaml          # Orquestração (db + backend + frontend)
├── docker/db/init.sql           # Script SQL de criação do banco
├── morada_postgres.sql          # Esquema de referência (fonte da verdade)
├── backend/                     # FastAPI + SQLAlchemy 2.0
│   ├── backend/
│   │   ├── app.py               # Aplicação e lifespan (cria tabelas no startup)
│   │   ├── db.py                # Engine e sessão SQLAlchemy
│   │   ├── config.py            # Variáveis de ambiente
│   │   ├── security.py          # bcrypt + JWT
│   │   ├── schemas.py           # Pydantic (entrada/saída)
│   │   ├── models/              # SQLModel: usuario, imovel, foto_imovel, etc.
│   │   └── routes/              # auth, post, user
│   └── tests/                   # Testes com pytest
├── frontend/                    # React 19 + Vite + React Router
│   ├── src/
│   │   ├── pages/               # Home, Login, Cadastro, Comprador, Vendedor, Admin
│   │   ├── components/          # Navbar, Field, PropertyCard, Icons, etc.
│   │   ├── services/mockApi.js  # Camada de API (fetch real)
│   │   ├── data/imoveis.js      # Dados mock
│   │   └── styles/              # Design tokens e estilos por página
│   ├── Dockerfile.dev
│   └── .env.example
└── README.md
```

## Scripts úteis

| Comando | Onde | O que faz |
|---------|------|-----------|
| `docker compose up -d --build` | raiz | Sobe tudo (banco, backend, frontend) |
| `docker compose down` | raiz | Para e remove containers |
| `npm run dev` | frontend | Servidor de desenvolvimento |
| `npm run lint` | frontend | Executa oxlint |
| `pytest` | backend | Executa testes da API |
