-- morada_postgres.sql
-- Esquema de referência da plataforma Morada (aluguel e venda de imóveis).
-- Fonte da verdade para nomes de tabelas, colunas e valores permitidos.
-- Identificadores e valores em português, conforme AGENTS.md.

-- ============================================================================
-- Tabelas
-- ============================================================================

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    senha_hash TEXT NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('administrador', 'proprietario', 'corretor', 'interessado')),
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    situacao VARCHAR(10) NOT NULL DEFAULT 'ativa' CHECK (situacao IN ('ativa', 'inativa'))
);

CREATE TABLE imovel (
    id SERIAL PRIMARY KEY,
    anunciante_id INTEGER NOT NULL REFERENCES usuario(id),
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) NOT NULL, -- ex.: Casa, Apartamento, Cobertura, Studio
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

CREATE TABLE foto_imovel (
    id SERIAL PRIMARY KEY,
    imovel_id INTEGER NOT NULL REFERENCES imovel(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE historico_preco (
    id SERIAL PRIMARY KEY,
    imovel_id INTEGER NOT NULL REFERENCES imovel(id) ON DELETE CASCADE,
    preco NUMERIC(12, 2) NOT NULL CHECK (preco >= 0),
    data TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favorito (
    usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    imovel_id INTEGER NOT NULL REFERENCES imovel(id) ON DELETE CASCADE,
    data TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, imovel_id)
);

CREATE TABLE contato (
    id SERIAL PRIMARY KEY,
    imovel_id INTEGER NOT NULL REFERENCES imovel(id) ON DELETE CASCADE,
    interessado_id INTEGER NOT NULL REFERENCES usuario(id),
    mensagem TEXT,
    data TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Índices úteis para buscas e listagens
-- ============================================================================

CREATE INDEX idx_imovel_anunciante ON imovel(anunciante_id);
CREATE INDEX idx_imovel_finalidade ON imovel(finalidade);
CREATE INDEX idx_imovel_situacao ON imovel(situacao);
CREATE INDEX idx_imovel_cidade ON imovel(cidade);
CREATE INDEX idx_imovel_bairro ON imovel(bairro);
CREATE INDEX idx_imovel_preco ON imovel(preco);
CREATE INDEX idx_historico_imovel ON historico_preco(imovel_id, data);
CREATE INDEX idx_favorito_usuario ON favorito(usuario_id);

-- ============================================================================
-- Comentários de documentação (valores permitidos)
-- ============================================================================

COMMENT ON TABLE usuario IS 'Usuários da plataforma (perfis: interessado, anunciante, administrador, corretor).';
COMMENT ON COLUMN usuario.tipo_usuario IS 'Valores: administrador | proprietario | corretor | interessado.';
COMMENT ON COLUMN usuario.situacao IS 'Valores: ativa | inativa.';
COMMENT ON TABLE imovel IS 'Imóveis anunciados.';
COMMENT ON COLUMN imovel.finalidade IS 'Valores: venda | aluguel.';
COMMENT ON COLUMN imovel.situacao IS 'Valores: disponivel | reservado | negociado | locado | inativo.';
COMMENT ON TABLE historico_preco IS 'Registro de cada alteração de preço, para o diferencial histórico de preços.';
COMMENT ON TABLE favorito IS 'Imóveis salvos por cada interessado.';
COMMENT ON TABLE contato IS 'Mensagens de interessados aos anunciantes (propostas digitais).';
