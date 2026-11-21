"""Rotas do usuário autenticado."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth import exigir_tipo, obter_usuario_atual
from backend.db import get_db
from backend.models.user import Usuario
from backend.schemas import UsuarioRead

router = APIRouter(prefix="/usuario", tags=["usuário"])


@router.get("/me", response_model=UsuarioRead)
def me(usuario: Usuario = Depends(obter_usuario_atual)):
    """Retorna os dados do usuário autenticado."""
    return usuario


@router.get("", response_model=list[UsuarioRead])
def listar_usuarios(
    usuario: Usuario = Depends(exigir_tipo("administrador")),
    db: Session = Depends(get_db),
):
    """Lista todos os usuários (apenas administrador)."""
    return db.query(Usuario).all()


@router.patch("/{usuario_id}/situacao", response_model=UsuarioRead)
def alternar_situacao(
    usuario_id: int,
    admin: Usuario = Depends(exigir_tipo("administrador")),
    db: Session = Depends(get_db),
):
    """Alterna a situação (ativa/inativa) de um usuário."""
    alvo = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if alvo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
    alvo.situacao = "inativa" if alvo.situacao == "ativa" else "ativa"
    db.commit()
    db.refresh(alvo)
    return alvo
