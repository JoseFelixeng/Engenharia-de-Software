"""Rotas de imóveis: listagem com busca/filtros, detalhe e gerenciamento pelo anunciante."""

import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session, selectinload

from backend.auth import obter_usuario_atual
from backend.config import MEDIA_DIR
from backend.db import get_db
from backend.models.post import Contato, FotoImovel, HistoricoPreco, Imovel
from backend.models.user import Usuario
from backend.schemas import (
    ContatoCreate,
    ContatoRead,
    EstatisticaInteresse,
    Finalidade,
    ImovelCreate,
    ImovelRead,
    ImovelUpdate,
)

router = APIRouter(prefix="/imoveis", tags=["imóveis"])

PERFIS_ANUNCIANTE = ("administrador", "proprietario", "corretor")

# Imagens aceitas e tamanho máximo (5 MB).
EXTENSOES_FOTO = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
TIPO_PARA_EXTENSAO = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
TAMANHO_MAX_FOTO = 5 * 1024 * 1024

_COM_RELACIONAMENTOS = (
    selectinload(Imovel.fotos),
    selectinload(Imovel.historico),
)


def _buscar_imovel(db: Session, imovel_id: int) -> Imovel:
    imovel = db.get(Imovel, imovel_id, options=list(_COM_RELACIONAMENTOS))
    if imovel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imóvel não encontrado.")
    return imovel


def _exigir_dono_ou_admin(imovel: Imovel, usuario: Usuario) -> None:
    if usuario.tipo_usuario != "administrador" and imovel.anunciante_id != usuario.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você só pode alterar os seus próprios anúncios.",
        )


@router.get("", response_model=list[ImovelRead])
def listar(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual),
    finalidade: Finalidade | None = None,
    cidade: str | None = Query(default=None, max_length=80),
    bairro: str | None = Query(default=None, max_length=80),
    tipo: str | None = Query(default=None, max_length=50),
    quartos_min: int | None = Query(default=None, ge=0),
    preco_min: float | None = Query(default=None, ge=0),
    preco_max: float | None = Query(default=None, ge=0),
    anunciante_id: int | None = None,
):
    """Lista imóveis disponíveis com filtros de busca (MVP)."""
    consulta = db.query(Imovel).filter(Imovel.situacao != "inativo")
    if finalidade:
        consulta = consulta.filter(Imovel.finalidade == finalidade)
    if cidade:
        consulta = consulta.filter(Imovel.cidade.ilike(f"%{cidade}%"))
    if bairro:
        consulta = consulta.filter(Imovel.bairro.ilike(f"%{bairro}%"))
    if tipo:
        consulta = consulta.filter(Imovel.tipo == tipo)
    if quartos_min is not None:
        consulta = consulta.filter(Imovel.quartos >= quartos_min)
    if preco_min is not None:
        consulta = consulta.filter(Imovel.preco >= preco_min)
    if preco_max is not None:
        consulta = consulta.filter(Imovel.preco <= preco_max)
    if anunciante_id is not None:
        consulta = consulta.filter(Imovel.anunciante_id == anunciante_id)
    return (
        consulta.options(*_COM_RELACIONAMENTOS)
        .order_by(Imovel.data_cadastro.desc())
        .all()
    )


@router.get("/contatos", response_model=list[ContatoRead])
def listar_contatos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual),
):
    """Lista os interessados que entraram em contato com os imóveis do anunciante."""
    if usuario.tipo_usuario not in PERFIS_ANUNCIANTE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas anunciantes podem ver os interessados.",
        )
    contatos = (
        db.query(Contato)
        .join(Imovel, Contato.imovel_id == Imovel.id)
        .filter(Imovel.anunciante_id == usuario.id)
        .order_by(Contato.data.desc())
        .all()
    )
    resultado = []
    for c in contatos:
        interessado = db.query(Usuario).filter(Usuario.id == c.interessado_id).first()
        imovel = db.get(Imovel, c.imovel_id)
        resultado.append(
            ContatoRead(
                id=c.id,
                imovel_id=c.imovel_id,
                imovel_titulo=imovel.titulo if imovel else None,
                interessado_id=c.interessado_id,
                interessado_nome=interessado.nome if interessado else None,
                interessado_email=interessado.email if interessado else None,
                mensagem=c.mensagem,
                data=c.data,
            )
        )
    return resultado


@router.get("/estatisticas-interesse", response_model=list[EstatisticaInteresse])
def estatisticas_interesse(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual),
):
    """Retorna o total de interessados (contatos) por imóvel do anunciante logado (gráfico)."""
    if usuario.tipo_usuario not in PERFIS_ANUNCIANTE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas anunciantes podem ver estatísticas de interesse.",
        )
    estatisticas = (
        db.query(Imovel.id, Imovel.titulo, db.func.count(Contato.id).label("total_contatos"))
        .outerjoin(Contato, Contato.imovel_id == Imovel.id)
        .filter(Imovel.anunciante_id == usuario.id)
        .group_by(Imovel.id, Imovel.titulo)
        .order_by(db.func.count(Contato.id).desc())
        .all()
    )
    return [
        EstatisticaInteresse(
            imovel_id=e.id,
            imovel_titulo=e.titulo,
            total_contatos=e.total_contatos,
        )
        for e in estatisticas
    ]


@router.post("/{imovel_id}/contatos", response_model=ContatoRead, status_code=status.HTTP_201_CREATED)
def demonstrar_interesse(
    imovel_id: int,
    dados: ContatoCreate | None = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual),
):
    """Registra o interesse de um usuário em um imóvel.

    O interessado passa a aparecer na aba "Interessados" do painel do anunciante.
    """
    imovel = _buscar_imovel(db, imovel_id)
    if imovel.situacao == "inativo":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este imóvel não está disponível para interesse.",
        )
    if imovel.anunciante_id == usuario.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode demonstrar interesse no seu próprio imóvel.",
        )
    ja_existe = (
        db.query(Contato)
        .filter(Contato.imovel_id == imovel_id, Contato.interessado_id == usuario.id)
        .first()
    )
    if ja_existe:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Você já demonstrou interesse neste imóvel.",
        )
    contato = Contato(
        imovel_id=imovel_id,
        interessado_id=usuario.id,
        mensagem=(dados.mensagem if dados else None),
    )
    db.add(contato)
    db.commit()
    db.refresh(contato)
    return ContatoRead(
        id=contato.id,
        imovel_id=contato.imovel_id,
        imovel_titulo=imovel.titulo,
        interessado_id=contato.interessado_id,
        interessado_nome=usuario.nome,
        interessado_email=usuario.email,
        mensagem=contato.mensagem,
        data=contato.data,
    )


@router.get("/{imovel_id}", response_model=ImovelRead)
def detalhe(
    imovel_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual),
):
    return _buscar_imovel(db, imovel_id)


@router.post("", response_model=ImovelRead, status_code=status.HTTP_201_CREATED)
def criar(
    dados: ImovelCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual),
):
    """Cria um anúncio. Somente anunciantes (administrador, proprietario, corretor)."""
    if usuario.tipo_usuario not in PERFIS_ANUNCIANTE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas anunciantes podem publicar imóveis.",
        )
    imovel = Imovel(
        anunciante_id=usuario.id,
        titulo=dados.titulo,
        descricao=dados.descricao,
        tipo=dados.tipo,
        finalidade=dados.finalidade,
        preco=dados.preco,
        preco_anterior=None,
        cidade=dados.cidade,
        estado=dados.estado,
        bairro=dados.bairro,
        area_m2=dados.area_m2,
        quartos=dados.quartos,
        banheiros=dados.banheiros,
        vagas_garagem=dados.vagas_garagem,
        situacao="disponivel",
    )
    imovel.fotos = [FotoImovel(url=url, ordem=i) for i, url in enumerate(dados.fotos)]
    imovel.historico = [HistoricoPreco(preco=dados.preco)]
    db.add(imovel)
    db.commit()
    return _buscar_imovel(db, imovel.id)


@router.patch("/{imovel_id}", response_model=ImovelRead)
def atualizar(
    imovel_id: int,
    dados: ImovelUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual),
):
    """Atualiza um anúncio. Mudança de preço gera registro no histórico."""
    imovel = _buscar_imovel(db, imovel_id)
    _exigir_dono_ou_admin(imovel, usuario)

    valores = dados.model_dump(exclude_unset=True)
    novo_preco = valores.get("preco")
    if novo_preco is not None and novo_preco != float(imovel.preco):
        imovel.preco_anterior = imovel.preco
        imovel.historico.append(HistoricoPreco(preco=novo_preco))

    for campo, valor in valores.items():
        setattr(imovel, campo, valor)
    db.commit()
    return _buscar_imovel(db, imovel_id)


@router.delete("/{imovel_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover(
    imovel_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual),
):
    """Remove (inativa) um anúncio."""
    imovel = _buscar_imovel(db, imovel_id)
    _exigir_dono_ou_admin(imovel, usuario)
    imovel.situacao = "inativo"
    db.commit()


@router.post("/{imovel_id}/fotos", response_model=ImovelRead, status_code=status.HTTP_201_CREATED)
def enviar_foto(
    imovel_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual),
):
    """Envia uma foto para o imóvel (apenas dono ou administrador)."""
    imovel = _buscar_imovel(db, imovel_id)
    _exigir_dono_ou_admin(imovel, usuario)

    conteudo = file.file.read()
    if len(conteudo) > TAMANHO_MAX_FOTO:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="A imagem excede o tamanho máximo de 5 MB.",
        )
    if not conteudo:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Arquivo vazio.")

    extensao = os.path.splitext(file.filename or "")[1].lower()
    if extensao not in EXTENSOES_FOTO:
        extensao = TIPO_PARA_EXTENSAO.get((file.content_type or "").lower(), "")
    if extensao not in EXTENSOES_FOTO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de imagem não suportado. Use JPG, PNG, WEBP ou GIF.",
        )

    nome_arquivo = f"{uuid.uuid4().hex}{extensao}"
    caminho = os.path.join(MEDIA_DIR, nome_arquivo)
    with open(caminho, "wb") as destino:
        destino.write(conteudo)

    foto = FotoImovel(
        imovel_id=imovel_id,
        url=f"/media/{nome_arquivo}",
        ordem=len(imovel.fotos),
    )
    db.add(foto)
    db.commit()
    return _buscar_imovel(db, imovel_id)


@router.delete("/{imovel_id}/fotos/{foto_id}", response_model=ImovelRead)
def remover_foto(
    imovel_id: int,
    foto_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual),
):
    """Remove uma foto do imóvel (apenas dono ou administrador)."""
    imovel = _buscar_imovel(db, imovel_id)
    _exigir_dono_ou_admin(imovel, usuario)
    foto = db.get(FotoImovel, foto_id)
    if foto is None or foto.imovel_id != imovel_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Foto não encontrada.")
    nome_arquivo = os.path.basename(foto.url)
    try:
        os.remove(os.path.join(MEDIA_DIR, nome_arquivo))
    except OSError:
        pass
    db.delete(foto)
    db.commit()
    return _buscar_imovel(db, imovel_id)
