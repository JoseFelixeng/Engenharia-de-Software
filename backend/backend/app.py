"""Aplicação FastAPI da plataforma Morada."""

from fastapi import FastAPI

from backend.routes import auth, post, user

app = FastAPI(title="Morada API", version="0.1.0")

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(post.router)


@app.get("/")
def home():
    return {
        "message": "Backend funcionando!",
        "status": "success",
    }
