"""Rotas de cadastro e autenticação."""

import json
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.security import criar_token_acesso, hash_senha, verificar_senha
from backend.db import get_db
from backend.models.user import Usuario
from backend.schemas import (
    LoginRequest,
    TokenResponse,
    UsuarioCreate,
    UsuarioRead,
    GoogleLoginRequest,
)

router = APIRouter(prefix="/auth", tags=["autenticação"])

@router.post("/cadastro", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def cadastrar(dados: UsuarioCreate, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.email == dados.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe uma conta com este e-mail.",
        )
    usuario = Usuario( nome=dados.nome, email=dados.email, telefone=dados.telefone, senha_hash=hash_senha(dados.senha), tipo_usuario=dados.tipo_usuario, situacao="ativa",)

    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    token = criar_token_acesso({"sub": str(usuario.id)})
    return TokenResponse(access_token=token, usuario=UsuarioRead.model_validate(usuario))


@router.post("/login", response_model=TokenResponse)
def login(dados: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == dados.email).first()
    # Mensagem genérica: não revelar se o e-mail existe.
    if usuario is None or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
        )
    if usuario.situacao != "ativa":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conta inativa. Procure o administrador.",
        )
    token = criar_token_acesso({"sub": str(usuario.id)})
    return TokenResponse(access_token=token, usuario=UsuarioRead.model_validate(usuario))


@router.post("/token", response_model=TokenResponse)
def emitir_token(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Emite token JWT no padrão OAuth2 (form `username`/`password`).

    Existe para o botão **Authorize** do Swagger (`/docs`), que envia
    `application/x-www-form-urlencoded` em vez de JSON. O campo `username`
    recebe o e-mail do usuário.
    """
    email = form.username.strip().lower()
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if usuario is None or not verificar_senha(form.password, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if usuario.situacao != "ativa":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conta inativa. Procure o administrador.",
        )
    token = criar_token_acesso({"sub": str(usuario.id)})
    return TokenResponse(access_token=token, usuario=UsuarioRead.model_validate(usuario))


@router.post("/google", response_model=TokenResponse)
def login_google(dados: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Cadastro/Login via Conta Google.

    Recebe o credential (ID token) retornado pelo Google, extrai os dados do
    perfil e cria a conta (se ainda não existir) ou faz login. O usuário é
    criado como `interessado` por padrão.
    """
   

    # Decodifica o payload do ID token do Google (sem verificação de assinatura
    # em desenvolvimento; em produção use a biblioteca google-auth para validar).
    try:
        payload = dados.credential.split(".")[1]
        # Adiciona padding se necessário
        padding = "=" * (-len(payload) % 4)
        decoded = json.loads(__import__("base64").b64decode(payload + padding))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token do Google inválido.",
        )

    email = decoded.get("email")
    nome = decoded.get("name") or email or "Usuário Google"
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token do Google não contém e-mail.",
        )

    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if usuario is None:
        usuario = Usuario(
            nome=nome,
            email=email,
            telefone=None,
            senha_hash=hash_senha("google-" + dados.credential[:32]),
            tipo_usuario="interessado",
            situacao="ativa",
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)

    if usuario.situacao != "ativa":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conta inativa. Procure o administrador.",
        )

    token = criar_token_acesso({"sub": str(usuario.id)})
    return TokenResponse(access_token=token, usuario=UsuarioRead.model_validate(usuario))
