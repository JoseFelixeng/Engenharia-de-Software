"""Aplicação FastAPI da plataforma Morada."""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend.db import criar_tabelas
from backend.routes import auth, post, user


@asynccontextmanager
async def lifespan(app: FastAPI):
    criar_tabelas()
    yield


app = FastAPI(title="Morada API", version="0.1.0", lifespan=lifespan)

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(post.router)


@app.get("/")
def home():
    return {
        "message": "Backend funcionando!",
        "status": "success",
    }
