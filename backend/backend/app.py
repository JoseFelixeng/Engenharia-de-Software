"""Aplicação FastAPI da plataforma Morada."""

import base64
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.admin_seed import garantir_admin
from backend.config import MEDIA_DIR
from backend.db import criar_tabelas
from backend.routes import auth, post, user

# Credenciais de acesso à documentação (/docs, /redoc, /openapi.json).
DOCS_USER = os.getenv("DOCS_USER", "admin")
DOCS_PASS = os.getenv("DOCS_PASS", "admin")
DOCS_PREFIXOS = ("/docs", "/redoc", "/openapi.json")


@asynccontextmanager
async def lifespan(app: FastAPI):
    criar_tabelas()
    garantir_admin()
    yield


app = FastAPI(title="Morada API", version="0.1.0", lifespan=lifespan)

# Fotos de imóveis enviadas ficam em MEDIA_DIR e são servidas em /media.
os.makedirs(MEDIA_DIR, exist_ok=True)
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def proteger_documentacao(request: Request, call_next):
    """Exige Basic Auth (admin/admin) para acessar a documentação interativa."""
    caminho = request.url.path
    if caminho.startswith(DOCS_PREFIXOS):
        credencial = base64.b64encode(f"{DOCS_USER}:{DOCS_PASS}".encode()).decode()
        esperado = f"Basic {credencial}"
        if request.headers.get("authorization", "") != esperado:
            return JSONResponse(
                status_code=401,
                content={"detail": "Autentique-se para acessar a documentação."},
                headers={"WWW-Authenticate": 'Basic realm="Morada Docs"'},
            )
    return await call_next(request)


app.include_router(auth.router)
app.include_router(user.router)
app.include_router(post.router)


@app.get("/")
def home():
    return {
        "message": "Backend funcionando!",
        "status": "success",
    }