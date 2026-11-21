"""Seed do usuário administrador padrão (senha: admin)."""

from sqlalchemy.orm import Session

from backend.db import SessionLocal
from backend.models.user import Usuario

ADMIN_EMAIL = "admin@morada.com"
ADMIN_SENHA_HASH = "$2b$12$pNaGfI9GN3oIyXCQv7dIje6f9F7.TmW3/z6JPAGQtJ/1iE5DyJ6j2"


def garantir_admin() -> None:
    db: Session = SessionLocal()
    try:
        existente = db.query(Usuario).filter(Usuario.email == ADMIN_EMAIL).first()
        if existente is not None:
            return
        admin = Usuario(
            nome="Administrador",
            email=ADMIN_EMAIL,
            tipo_usuario="administrador",
            senha_hash=ADMIN_SENHA_HASH,
            situacao="ativa",
        )
        db.add(admin)
        db.commit()
    finally:
        db.close()
"""