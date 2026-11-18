"""Autorização no servidor: dependências de autenticação para rotas protegidas."""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.models.user import Usuario
from backend.security import decodificar_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def obter_usuario_atual(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> Usuario:
    credenciais = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decodificar_token(token)
    if payload is None:
        raise credenciais
    usuario_id = payload.get("sub")
    if usuario_id is None:
        raise credenciais
    usuario = db.query(Usuario).filter(Usuario.id == int(usuario_id)).first()
    if usuario is None or usuario.situacao != "ativa":
        raise credenciais
    return usuario


def exigir_tipo(*tipos_permitidos: str):
    """Retorna uma dependência que exige um tipo_usuario específico."""

    def verificador(usuario: Usuario = Depends(obter_usuario_atual)) -> Usuario:
        if usuario.tipo_usuario not in tipos_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para este recurso",
            )
        return usuario

    return verificador
