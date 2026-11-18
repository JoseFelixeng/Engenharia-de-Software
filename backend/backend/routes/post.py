"""Rotas de imóveis: listagem com busca/filtros, detalhe e gerenciamento pelo anunciante."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, selectinload

from backend.auth import obter_usuario_atual
from backend.db import get_db
from backend.models.post import FotoImovel, HistoricoPreco, Imovel
from backend.models.user import Usuario
from backend.schemas import Finalidade, ImovelCreate, ImovelRead, ImovelUpdate

router = APIRouter(prefix="/imoveis", tags=["imóveis"])

PERFIS_ANUNCIANTE = ("administrador", "proprietario", "corretor")

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


@router.get("/{imovel_id}", response_model=ImovelRead)
def detalhe(imovel_id: int, db: Session = Depends(get_db)):
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
