"""Testes da API Morada: autenticação e imóveis."""

import pytest


def test_home(client):
    res = client.get("/")
    assert res.status_code == 200
    assert res.json() == {"message": "Backend funcionando!", "status": "success"}


class TestAuth:
    def test_cadastro_sucesso(self, client):
        res = client.post("/auth/cadastro", json={
            "nome": "Maria Souza",
            "email": "maria@example.com",
            "tipo_usuario": "interessado",
            "senha": "Outra Senha 123",
        })
        assert res.status_code == 201
        body = res.json()
        assert body["email"] == "maria@example.com"
        assert body["tipo_usuario"] == "interessado"
        assert "senha_hash" not in body

    def test_cadastro_email_duplicado(self, client, usuario):
        res = client.post("/auth/cadastro", json={
            "nome": "Outro Nome",
            "email": usuario["email"],
            "senha": "Outra Senha 123",
        })
        assert res.status_code == 409

    def test_cadastro_senha_curta(self, client):
        res = client.post("/auth/cadastro", json={
            "nome": "Nome Sobrenome",
            "email": "curto@example.com",
            "senha": "12345",
        })
        assert res.status_code == 422

    def test_cadastro_nome_sem_sobrenome(self, client):
        res = client.post("/auth/cadastro", json={
            "nome": "ApenasNome",
            "email": "sobrenome@example.com",
            "senha": "Outra Senha 123",
        })
        assert res.status_code == 422

    def test_login_sucesso(self, client, usuario):
        res = client.post("/auth/login", json={
            "email": usuario["email"],
            "senha": "Minha Senha 123",
        })
        assert res.status_code == 200
        assert res.json()["access_token"]

    def test_login_senha_errada(self, client, usuario):
        res = client.post("/auth/login", json={
            "email": usuario["email"],
            "senha": "Senha Errada 123",
        })
        assert res.status_code == 401

    def test_login_email_inexistente(self, client):
        res = client.post("/auth/login", json={
            "email": "naoexiste@example.com",
            "senha": "Qualquer Senha 123",
        })
        assert res.status_code == 401


class TestUsuario:
    def test_me_sem_token(self, client):
        assert client.get("/usuario/me").status_code == 401

    def test_me_com_token(self, client, auth_headers, usuario):
        res = client.get("/usuario/me", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["id"] == usuario["id"]


class TestImoveis:
    def test_listar_vazio(self, client):
        res = client.get("/imoveis")
        assert res.status_code == 200
        assert res.json() == []

    def test_criar_exige_login(self, client):
        res = client.post("/imoveis", json={
            "titulo": "Casa bonita",
            "tipo": "Casa",
            "finalidade": "venda",
            "preco": 500000,
            "cidade": "Natal",
            "estado": "RN",
            "bairro": "Ponta Negra",
            "area_m2": 200,
        })
        assert res.status_code == 401

    def test_interessado_nao_pode_anunciar(self, client, auth_headers):
        res = client.post("/imoveis", headers=auth_headers, json={
            "titulo": "Casa bonita",
            "tipo": "Casa",
            "finalidade": "venda",
            "preco": 500000,
            "cidade": "Natal",
            "estado": "RN",
            "bairro": "Ponta Negra",
            "area_m2": 200,
        })
        assert res.status_code == 403

    @pytest.fixture()
    def anunciante(self, client):
        res = client.post("/auth/cadastro", json={
            "nome": "Carlos Corretor",
            "email": "carlos@example.com",
            "tipo_usuario": "corretor",
            "senha": "Corretor 123456",
        })
        assert res.status_code == 201
        return res.json()

    @pytest.fixture()
    def anunciante_headers(self, client, anunciante):
        res = client.post("/auth/login", json={
            "email": "carlos@example.com",
            "senha": "Corretor 123456",
        })
        assert res.status_code == 200
        return {"Authorization": f"Bearer {res.json()['access_token']}"}

    @pytest.fixture()
    def imovel(self, client, anunciante_headers):
        res = client.post("/imoveis", headers=anunciante_headers, json={
            "titulo": "Casa moderna com piscina",
            "tipo": "Casa",
            "finalidade": "venda",
            "preco": 1250000,
            "cidade": "Natal",
            "estado": "rn",
            "bairro": "Ponta Negra",
            "area_m2": 280,
            "quartos": 4,
            "banheiros": 3,
            "vagas_garagem": 3,
            "fotos": ["https://exemplo.com/foto1.jpg"],
        })
        assert res.status_code == 201, res.text
        return res.json()

    def test_criar_imovel(self, client, anunciante_headers, imovel):
        assert imovel["titulo"] == "Casa moderna com piscina"
        assert imovel["estado"] == "RN"  # normalizado para maiúsculo
        assert imovel["situacao"] == "disponivel"
        assert imovel["preco_anterior"] is None
        assert len(imovel["historico"]) == 1  # preço inicial registrado
        assert len(imovel["fotos"]) == 1

    def test_listar_e_filtrar(self, client, anunciante_headers, imovel):
        res = client.get("/imoveis", params={"finalidade": "venda", "cidade": "Natal"})
        assert res.status_code == 200
        assert len(res.json()) == 1

        res = client.get("/imoveis", params={"finalidade": "aluguel"})
        assert res.json() == []

        res = client.get("/imoveis", params={"quartos_min": 5})
        assert res.json() == []

    def test_detalhe(self, client, imovel):
        res = client.get(f"/imoveis/{imovel['id']}")
        assert res.status_code == 200
        assert res.json()["id"] == imovel["id"]

    def test_detalhe_inexistente(self, client):
        assert client.get("/imoveis/9999").status_code == 404

    def test_atualizar_preco_gera_historico(self, client, anunciante_headers, imovel):
        res = client.patch(f"/imoveis/{imovel['id']}", headers=anunciante_headers, json={
            "preco": 1100000,
        })
        assert res.status_code == 200
        body = res.json()
        assert body["preco"] == 1100000
        assert body["preco_anterior"] == 1250000
        assert len(body["historico"]) == 2

    def test_outro_usuario_nao_altera(self, client, auth_headers, imovel):
        res = client.patch(f"/imoveis/{imovel['id']}", headers=auth_headers, json={
            "preco": 1,
        })
        assert res.status_code == 403

    def test_remover_inativa(self, client, anunciante_headers, imovel):
        res = client.delete(f"/imoveis/{imovel['id']}", headers=anunciante_headers)
        assert res.status_code == 204
        res = client.get("/imoveis")
        assert res.json() == []  # inativos não aparecem na listagem
