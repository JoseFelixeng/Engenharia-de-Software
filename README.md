# Morada — Plataforma Imobiliária

Aplicação web full stack para **venda e aluguel de imóveis**, com interface em React e API REST em FastAPI. O projeto reúne busca de imóveis, comparador, painel do anunciante, gestão de usuários e documentação interativa protegida.

> **Stack:** React 19 + Vite + React Router (frontend) · FastAPI + SQLModel/SQLAlchemy 2.0 (backend) · PostgreSQL 16 (produção) / SQLite (testes) · Docker Compose.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades Implementadas](#funcionalidades-implementadas)
- [Stack e Ferramentas](#stack-e-ferramentas)
- [Arquitetura e Estrutura](#arquitetura-e-estrutura)
- [Pré-requisitos](#pré-requisitos)
- [Como Executar](#como-executar)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Rotas e Endpoints](#rotas-e-endpoints)
- [Autenticação e Segurança](#autenticação-e-segurança)
- [Testes e Qualidade](#testes-e-qualidade)
- [Scripts](#scripts)
- [Time de Desenvolvimento](#time-de-desenvolvimento)

---

## Visão Geral

A **Morada** conecta pessoas a imóveis. O usuário pode se cadastrar como **interessado** (buscar, comparar e favoritar imóveis) ou como **anunciante** (publicar e gerenciar imóveis), enquanto o **administrador** gerencia usuários e a plataforma.

A interface é responsiva, com tema profissional (navy + azul + dourado), animações sutis e ilustrações SVG para os imóveis.

---

## Funcionalidades Implementadas

### Backend (API REST)

- **Autenticação**
  - `POST /auth/cadastro` — cadastro com validação (nome + sobrenome, e-mail único, senha ≥ 8 caracteres). Retorna **token JWT + usuário** (login automático).
  - `POST /auth/login` — login com senha hash **bcrypt (custo 12)** e **JWT HS256** (expiração de 7 dias).
  - `POST /auth/google` — login/cadastro via token do Google (modo desenvolvimento).
  - Bloqueio de contas **inativas** no login.
- **Usuários**
  - `GET /usuario/me` — dados do usuário autenticado.
  - `GET /usuario` — listagem completa (apenas administrador).
  - `PATCH /usuario/{id}/situacao` — ativar/desativar usuário (protege o próprio administrador).
  - `PATCH /usuario/{id}/reset-senha` — redefine a senha para `00000000` (administrador).
- **Imóveis**
  - `GET /imoveis` — listagem com filtros (finalidade, cidade, bairro, tipo, quartos mínimos, preço mín./máx., anunciante).
  - `GET /imoveis/{id}` — detalhe com fotos e histórico de preços.
  - `GET /imoveis/contatos` — interessados que contataram os imóveis do anunciante.
  - `POST /imoveis` — criar anúncio (apenas anunciantes: administrador, proprietário, corretor).
  - `PATCH /imoveis/{id}` — atualizar anúncio (dono ou administrador). Mudança de preço registra **histórico** e preenche `preco_anterior`.
  - `DELETE /imoveis/{id}` — remoção lógica (soft delete, situação `inativo`).
- **Documentação**
  - `/docs`, `/redoc` e `/openapi.json` protegidos por **Basic Auth** (`admin` / `admin`).
- **Persistência**
  - Modelos alinhados ao esquema `morada_postgres.sql`: `usuario`, `imovel`, `foto_imovel`, `historico_preco`, `favorito`, `contato`.
  - Criação automática de tabelas e seed do administrador padrão no startup.

### Frontend (SPA)

- **Páginas**
  - `/` — Home com hero, catálogo de imóveis (logados), benefícios, "como funciona" e CTA. Visitantes veem cards bloqueados e convite para cadastro.
  - `/login` — login com e-mail/senha, "lembrar de mim", links de recuperação e Google.
  - `/cadastro` — cadastro com tipo de uso, máscara de telefone, medidor de força de senha e aceite de termos.
  - `/comprador` — busca de imóveis com filtros, cards e **comparador** (bandeja + modal).
  - `/vendedor` — painel do anunciante: listagem, cadastro/edição de anúncios (modal) e aba de interessados.
  - `/admin` — gestão de usuários com filtros, ativar/desativar e resetar senha.
  - `/perfil` — dados da conta e atalhos conforme o papel.
- **Estado de autenticação**
  - `AuthContext` (`services/auth.jsx`) centraliza usuário, carregamento e logout.
  - Guards de rota por papel (interessado, anunciante, administrador) e redirecionamento para login.
  - `Navbar` reflete o login (avatar, nome, sair, links por papel).
- **Componentes**
  - `Field` (label flutuante, ícone, erro animado, mostrar/ocultar senha), `PropertyCard`, `PropertyArt` (ilustração SVG), `Icons`, `Navbar`, `Footer`, `AuthLayout`.
- **Integração**
  - Camada `services/mockApi.js` com `fetch` real contra a API, token JWT automático e tratamento de erros.

### Correções e melhorias recentes

- Login/cadastro agora **mantêm a sessão** (AuthContext) sem redirecionar indevidamente.
- `GET /imoveis` e `GET /imoveis/{id}` passaram a **exigir autenticação**.
- `/docs` protegido com **Basic Auth**.
- Rota `GET /imoveis/contatos` corrigida (ordem de rotas no FastAPI).
- Edição de anúncios **preenche o formulário** corretamente.
- Comparador de imóveis implementado.
- Correção de sobreposição visual no formulário de anúncio (vazamento de CSS) e tema profissional.

---

## Stack e Ferramentas

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React 19, Vite 8, React Router 7, JavaScript (ES Modules), CSS com design tokens |
| **Qualidade (FE)** | Oxlint (lint), Vitest + Testing Library + jsdom (testes) |
| **Backend** | Python 3.12+, FastAPI 0.162, Uvicorn, SQLModel / SQLAlchemy 2.1, Pydantic 2 |
| **Segurança** | bcrypt (hash de senha), python-jose (JWT HS256), Basic Auth (docs) |
| **Banco de dados** | PostgreSQL 16 (produção/Docker), SQLite (testes) |
| **Infra** | Docker, Docker Compose, psycopg2-binary (driver PostgreSQL) |
| **Testes (BE)** | pytest + TestClient (FastAPI) |

---

## Arquitetura e Estrutura

```
.
├── docker-compose.yaml          # Orquestra db + backend + frontend
├── morada_postgres.sql          # Esquema de referência (fonte da verdade)
├── docker/db/init.sql           # Script SQL de inicialização do banco
├── backend/                     # API FastAPI
│   ├── backend/
│   │   ├── app.py               # Aplicação + middleware (docs Basic Auth)
│   │   ├── auth.py              # Dependências de autenticação/autorização
│   │   ├── config.py            # Variáveis de ambiente
│   │   ├── db.py                # Engine e sessão
│   │   ├── security.py          # bcrypt + JWT
│   │   ├── admin_seed.py        # Seed do administrador padrão
│   │   ├── schemas.py           # Pydantic (entrada/saída)
│   │   ├── models/              # usuario.py, post.py (imovel, etc.)
│   │   └── routes/              # auth.py, user.py, post.py
│   └── tests/                   # conftest.py + test_api.py (pytest)
├── frontend/                    # SPA React
│   ├── src/
│   │   ├── pages/               # Home, Login, Cadastro, BuscaComprador, DashboardVendedor, Admin, Perfil
│   │   ├── components/          # Navbar, Field, PropertyCard, PropertyArt, Icons, Footer, AuthLayout
│   │   ├── services/            # mockApi.js (API) e auth.jsx (contexto)
│   │   ├── data/imoveis.js      # Dados de exemplo
│   │   └── styles/              # index.css (tokens) + auth/home/components/dashboard.css
│   └── Dockerfile.dev
└── README.md
```

---

## Pré-requisitos

- **Docker** e **Docker Compose** (recomendado), **ou**
- **Node.js 20+** e **npm** (frontend)
- **Python 3.12+** (backend)
- **PostgreSQL 16** (opcional; os testes podem ser feito usando o SQLite)

---

## Como Executar

### Opção 1 — Docker Compose (recomendado)

Na raiz do repositório:

```bash
docker compose up -d --build
```

Serviços e portas:

| Serviço | URL / Porta |
|---------|-------------|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Documentação | http://localhost:8000/docs (Basic Auth: `admin` / `admin`) |
| PostgreSQL | localhost:5433 |

Parar:

```bash
docker compose down
```

### Opção 2 — Execução manual

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements-dev.txt
pip install -e .
```

Configure o `.env` (ou exporte as variáveis) e inicie:

```bash
python -m uvicorn backend.app:app --reload
```

API em `http://localhost:8000` · docs em `http://localhost:8000/docs`.

> Sem PostgreSQL local, é possível usar SQLite para desenvolvimento/testes:
> `DATABASE_URL="sqlite:///./morada.db" python -m uvicorn backend.app:app --reload`

#### Frontend

```bash
cd frontend
npm install
```

Crie o `.env` (exemplo em `.env.example`):

```
VITE_API_BASE=http://localhost:8000
```

Inicie:

```bash
npm run dev
```

Frontend em `http://localhost:5173`.

### Credenciais padrão

| Acesso | Usuário | Senha |
|--------|---------|-------|
| App (administrador) | `admin@morada.com` | `admin` |
| Documentação (`/docs`) | `admin` | `admin` |

---

## Variáveis de Ambiente

### Backend

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `DATABASE_URL` | `postgresql+psycopg2://postgres:postgres@localhost:5432/morada` | Conexão com o banco |
| `SECRET_KEY` | `morada-dev-chave-secreta-alterar-em-producao` | Chave de assinatura do JWT |
| `ALGORITHM` | `HS256` | Algoritmo do JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` | Validade do token (7 dias) |
| `DOCS_USER` | `admin` | Usuário do Basic Auth da documentação |
| `DOCS_PASS` | `admin` | Senha do Basic Auth da documentação |

### Frontend

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `VITE_API_BASE` | `http://localhost:8000` | URL base da API |

---

## Rotas e Endpoints

### Frontend (React Router)

| Caminho | Página | Acesso |
|---------|--------|--------|
| `/` | Home | Público |
| `/login` | Login | Público |
| `/cadastro` | Cadastro | Público |
| `/comprador` | Busca de imóveis | Autenticado |
| `/vendedor` | Painel do anunciante | Anunciante |
| `/admin` | Gestão de usuários | Administrador |
| `/perfil` | Perfil | Autenticado |

### Backend (API)

| Método | Endpoint | Acesso |
|--------|----------|--------|
| `POST` | `/auth/cadastro` | Público |
| `POST` | `/auth/login` | Público |
| `POST` | `/auth/google` | Público (dev) |
| `GET` | `/usuario/me` | Autenticado |
| `GET` | `/usuario` | Administrador |
| `PATCH` | `/usuario/{id}/situacao` | Administrador |
| `PATCH` | `/usuario/{id}/reset-senha` | Administrador |
| `GET` | `/imoveis` | Autenticado |
| `GET` | `/imoveis/{id}` | Autenticado |
| `GET` | `/imoveis/contatos` | Anunciante |
| `POST` | `/imoveis` | Anunciante |
| `PATCH` | `/imoveis/{id}` | Dono / Administrador |
| `DELETE` | `/imoveis/{id}` | Dono / Administrador |
| `GET` | `/docs`, `/redoc`, `/openapi.json` | Basic Auth (`admin`/`admin`) |
| `GET` | `/` | Público (healthcheck) |

---

## Autenticação e Segurança

- **Senhas**: hash **bcrypt** com custo 12.
- **Tokens**: **JWT HS256**, expiração de 7 dias, enviados no header `Authorization: Bearer <token>`.
- **Autorização por papel**: `administrador`, `proprietario`, `corretor`, `interessado` (via dependência `exigir_tipo`).
- **Documentação protegida**: `/docs`, `/redoc` e `/openapi.json` exigem **Basic Auth** (`admin`/`admin`, configurável).
- **Boas práticas**: mensagens de erro genéricas no login (não revelam se o e-mail existe), bloqueio de contas inativas, validação de entrada no servidor (Pydantic).

---

## Testes e Qualidade

### Backend

```bash
cd backend
pytest
```

> O `conftest.py` sobe um banco **SQLite temporário** e recria as tabelas a cada teste. Para forçar SQLite:
> `DATABASE_URL="sqlite:///./test.db" pytest`

### Frontend

```bash
cd frontend
npm run lint     # Oxlint
npm run test     # Vitest + Testing Library
npm run build    # Build de produção (dist/)
```

---

## Scripts

| Comando | Onde | Descrição |
|---------|------|-----------|
| `docker compose up -d --build` | raiz | Sobe banco, backend e frontend |
| `docker compose down` | raiz | Para os containers |
| `npm run dev` | frontend | Servidor de desenvolvimento |
| `npm run build` | frontend | Build de produção |
| `npm run preview` | frontend | Prévia do build |
| `npm run lint` | frontend | Executa o Oxlint |
| `npm run test` | frontend | Executa os testes (Vitest) |
| `uvicorn backend.app:app --reload` | backend | Servidor de desenvolvimento |
| `pytest` | backend | Testes da API |

---

## Time de Desenvolvimento

**Grupo de Engenharia de Software**

| Integrante | GitHub |
|------------|--------|
| **José Felix** | [@JoseFelixeng](https://github.com/JoseFelixeng) |
| **Moises Frederico** | [@fredericomoi](https://github.com/fredericomoi) |

---

Projeto acadêmico de Engenharia de Software — Morada © 2026.