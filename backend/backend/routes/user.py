"""Rotas do usuário autenticado."""

from fastapi import APIRouter, Depends

from backend.models.user import Usuario
from backend.auth import obter_usuario_atual
from backend.schemas import UsuarioRead

router = APIRouter(prefix="/usuario", tags=["usuário"])


@router.get("/me", response_model=UsuarioRead)
def me(usuario: Usuario = Depends(obter_usuario_atual)):
    """Retorna os dados do usuário autenticado."""
    return usuario
