"""Testes da API Morada: autenticação e imóveis."""

import base64

import pytest


def test_home(client):
    res = client.get("/")
    assert res.status_code == 200
    assert res.json() == {"message": "Backend funcionando!", "status": "success"}


class TestDocumentacao:
    def test_docs_exige_basic_auth(self, client):
        assert client.get("/docs").status_code == 401

    def test_docs_com_credenciais(self, client):
        cred = base64.b64encode(b"admin:admin").decode()
        res = client.get("/docs", headers={"Authorization": f"Basic {cred}"})
        assert res.status_code == 200

    def test_openapi_exige_basic_auth(self, client):
        assert client.get("/openapi.json").status_code == 401


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
        assert body["usuario"]["email"] == "maria@example.com"
        assert body["access_token"]
        assert body["usuario"]["tipo_usuario"] == "interessado"
        assert "senha_hash" not in body["usuario"]

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

    def test_token_oauth2_sucesso(self, client, usuario):
        res = client.post("/auth/token", data={
            "username": usuario["email"],
            "password": "Minha Senha 123",
        })
        assert res.status_code == 200
        assert res.json()["access_token"]
        assert res.json()["token_type"] == "bearer"

    def test_token_oauth2_senha_errada(self, client, usuario):
        res = client.post("/auth/token", data={
            "username": usuario["email"],
            "password": "Senha Errada 123",
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
    def test_listar_exige_login(self, client):
        assert client.get("/imoveis").status_code == 401

    def test_listar_vazio(self, client, auth_headers):
        res = client.get("/imoveis", headers=auth_headers)
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
        return res.json()["usuario"]

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
        res = client.get("/imoveis", headers=anunciante_headers, params={"finalidade": "venda", "cidade": "Natal"})
        assert res.status_code == 200
        assert len(res.json()) == 1

        res = client.get("/imoveis", headers=anunciante_headers, params={"finalidade": "aluguel"})
        assert res.json() == []

        res = client.get("/imoveis", headers=anunciante_headers, params={"quartos_min": 5})
        assert res.json() == []

    def test_detalhe(self, client, auth_headers, imovel):
        res = client.get(f"/imoveis/{imovel['id']}", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["id"] == imovel["id"]

    def test_detalhe_inexistente(self, client, auth_headers):
        assert client.get("/imoveis/9999", headers=auth_headers).status_code == 404

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
        res = client.get("/imoveis", headers=anunciante_headers)
        assert res.json() == []  # inativos não aparecem na listagem

    def test_demonstrar_interesse_sucesso(self, client, auth_headers, usuario, imovel):
        res = client.post(f"/imoveis/{imovel['id']}/contatos", headers=auth_headers, json={
            "mensagem": "Gostaria de agendar uma visita.",
        })
        assert res.status_code == 201, res.text
        body = res.json()
        assert body["imovel_id"] == imovel["id"]
        assert body["imovel_titulo"] == imovel["titulo"]
        assert body["interessado_nome"] == usuario["nome"]
        assert body["interessado_email"] == usuario["email"]
        assert body["mensagem"] == "Gostaria de agendar uma visita."

    def test_demonstrar_interesse_sem_mensagem(self, client, auth_headers, imovel):
        res = client.post(f"/imoveis/{imovel['id']}/contatos", headers=auth_headers, json={})
        assert res.status_code == 201, res.text
        assert res.json()["mensagem"] is None

    def test_demonstrar_interesse_duplicado(self, client, auth_headers, imovel):
        primeiro = client.post(f"/imoveis/{imovel['id']}/contatos", headers=auth_headers, json={})
        assert primeiro.status_code == 201
        segundo = client.post(f"/imoveis/{imovel['id']}/contatos", headers=auth_headers, json={})
        assert segundo.status_code == 409

    def test_demonstrar_interesse_exige_login(self, client, imovel):
        res = client.post(f"/imoveis/{imovel['id']}/contatos", json={})
        assert res.status_code == 401

    def test_demonstrar_interesse_no_proprio_imovel(self, client, anunciante_headers, imovel):
        res = client.post(f"/imoveis/{imovel['id']}/contatos", headers=anunciante_headers, json={})
        assert res.status_code == 400

    def test_listar_contatos_do_anunciante(self, client, auth_headers, anunciante_headers, imovel):
        criacao = client.post(
            f"/imoveis/{imovel['id']}/contatos",
            headers=auth_headers,
            json={"mensagem": "Tenho interesse!"},
        )
        assert criacao.status_code == 201
        res = client.get("/imoveis/contatos", headers=anunciante_headers)
        assert res.status_code == 200, res.text
        contatos = res.json()
        assert len(contatos) == 1
        assert contatos[0]["imovel_id"] == imovel["id"]
        assert contatos[0]["imovel_titulo"] == imovel["titulo"]
        assert contatos[0]["mensagem"] == "Tenho interesse!"

    def test_listar_contatos_exige_anunciante(self, client, auth_headers):
        res = client.get("/imoveis/contatos", headers=auth_headers)
        assert res.status_code == 403
