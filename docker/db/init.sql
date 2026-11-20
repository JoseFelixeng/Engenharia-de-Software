-- Script de inicialização do banco de dados Morada (Docker)
-- Fonte da verdade: morada_postgres.sql na raiz do repositório

CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    senha_hash TEXT NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('administrador', 'proprietario', 'corretor', 'interessado')),
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    situacao VARCHAR(10) NOT NULL DEFAULT 'ativa' CHECK (situacao IN ('ativa', 'inativa'))
);

CREATE TABLE IF NOT EXISTS imovel (
    id SERIAL PRIMARY KEY,
    anunciante_id INTEGER NOT NULL REFERENCES usuario(id),
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) NOT NULL,
    finalidade VARCHAR(10) NOT NULL CHECK (finalidade IN ('venda', 'aluguel')),
    preco NUMERIC(12, 2) NOT NULL CHECK (preco >= 0),
    preco_anterior NUMERIC(12, 2) CHECK (preco_anterior >= 0),
    cidade VARCHAR(80) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    bairro VARCHAR(80) NOT NULL,
    area_m2 NUMERIC(8, 2) NOT NULL CHECK (area_m2 > 0),
    quartos INTEGER NOT NULL DEFAULT 0 CHECK (quartos >= 0),
    banheiros INTEGER NOT NULL DEFAULT 0 CHECK (banheiros >= 0),
    vagas_garagem INTEGER NOT NULL DEFAULT 0 CHECK (vagas_garagem >= 0),
    situacao VARCHAR(15) NOT NULL DEFAULT 'disponivel' CHECK (situacao IN ('disponivel', 'reservado', 'negociado', 'locado', 'inativo')),
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS foto_imovel (
    id SERIAL PRIMARY KEY,
    imovel_id INTEGER NOT NULL REFERENCES imovel(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS historico_preco (
    id SERIAL PRIMARY KEY,
    imovel_id INTEGER NOT NULL REFERENCES imovel(id) ON DELETE CASCADE,
    preco NUMERIC(12, 2) NOT NULL CHECK (preco >= 0),
    data TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorito (
    usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    imovel_id INTEGER NOT NULL REFERENCES imovel(id) ON DELETE CASCADE,
    data TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, imovel_id)
);

CREATE TABLE IF NOT EXISTS contato (
    id SERIAL PRIMARY KEY,
    imovel_id INTEGER NOT NULL REFERENCES imovel(id) ON DELETE CASCADE,
    interessado_id INTEGER NOT NULL REFERENCES usuario(id),
    mensagem TEXT,
    data TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_imovel_anunciante ON imovel(anunciante_id);
CREATE INDEX IF NOT EXISTS idx_imovel_finalidade ON imovel(finalidade);
CREATE INDEX IF NOT EXISTS idx_imovel_situacao ON imovel(situacao);
CREATE INDEX IF NOT EXISTS idx_imovel_cidade ON imovel(cidade);
CREATE INDEX IF NOT EXISTS idx_imovel_bairro ON imovel(bairro);
CREATE INDEX IF NOT EXISTS idx_imovel_preco ON imovel(preco);
CREATE INDEX IF NOT EXISTS idx_historico_imovel ON historico_preco(imovel_id, data);
CREATE INDEX IF NOT EXISTS idx_favorito_usuario ON favorito(usuario_id);
