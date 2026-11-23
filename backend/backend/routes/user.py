"""Rotas do usuário autenticado."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from backend.auth import exigir_tipo, obter_usuario_atual
from backend.db import get_db
from backend.models.post import Contato, Imovel
from backend.models.user import Usuario
from backend.security import hash_senha
from backend.schemas import (
    EstatisticaInteresse,
    InteresseItem,
    UsuarioRead,
    UsuarioUpdate,
)

router = APIRouter(prefix="/usuario", tags=["usuário"])


@router.patch("/{usuario_id}/reset-senha", response_model=UsuarioRead)
def resetar_senha(
    usuario_id: int,
    admin: Usuario = Depends(exigir_tipo("administrador")),
    db: Session = Depends(get_db),
):
    alvo = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if alvo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
    alvo.senha_hash = hash_senha("00000000")
    db.commit()
    db.refresh(alvo)
    return alvo


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
    if alvo.tipo_usuario == "administrador":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Não é possível alterar a situação do administrador")
    alvo.situacao = "inativa" if alvo.situacao == "ativa" else "ativa"
    db.commit()
    db.refresh(alvo)
    return alvo


@router.patch("/{usuario_id}", response_model=UsuarioRead)
def editar_usuario(
    usuario_id: int,
    dados: UsuarioUpdate,
    actor: Usuario = Depends(obter_usuario_atual),
    db: Session = Depends(get_db),
):
    """Edita dados de um usuário. Administrador edita qualquer um; o próprio usuário edita a si mesmo."""
    alvo = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if alvo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")

    eh_admin = actor.tipo_usuario == "administrador"
    eh_proprio = actor.id == usuario_id
    if not eh_admin and not eh_proprio:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão para editar este usuário")

    valores = dados.model_dump(exclude_unset=True)

    if "senha" in valores:
        valores["senha_hash"] = hash_senha(valores.pop("senha"))

    if "email" in valores and valores["email"] != alvo.email:
        existente = db.query(Usuario).filter(Usuario.email == valores["email"]).first()
        if existente is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Já existe uma conta com este e-mail.")

    if not eh_admin:
        valores.pop("tipo_usuario", None)
        valores.pop("situacao", None)

    for campo, valor in valores.items():
        setattr(alvo, campo, valor)

    db.commit()
    db.refresh(alvo)
    return alvo


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_usuario(
    usuario_id: int,
    admin: Usuario = Depends(exigir_tipo("administrador")),
    db: Session = Depends(get_db),
):
    """Exclui um usuário (apenas administrador, não pode excluir a si mesmo)."""
    alvo = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if alvo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
    if alvo.id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Não é possível excluir o próprio administrador")
    db.delete(alvo)
    db.commit()


@router.get("/me/interesses", response_model=list[InteresseItem])
def listar_meus_interesses(
    usuario: Usuario = Depends(obter_usuario_atual),
    db: Session = Depends(get_db),
):
    """Lista os imóveis nos quais o usuário logado demonstrou interesse."""
    contatos = (
        db.query(Contato)
        .options(selectinload(Contato.imovel))
        .filter(Contato.interessado_id == usuario.id)
        .order_by(Contato.data.desc())
        .all()
    )
    resultado = []
    for c in contatos:
        imovel = c.imovel
        if imovel is None:
            continue
        resultado.append(
            InteresseItem(
                imovel_id=imovel.id,
                imovel_titulo=imovel.titulo,
                imovel_tipo=imovel.tipo,
                imovel_finalidade=imovel.finalidade,
                imovel_preco=imovel.preco,
                imovel_cidade=imovel.cidade,
                imovel_estado=imovel.estado,
                imovel_bairro=imovel.bairro,
                imovel_situacao=imovel.situacao,
                interessado_id=c.interessado_id,
                mensagem=c.mensagem,
                data=c.data,
            )
        )
    return resultado