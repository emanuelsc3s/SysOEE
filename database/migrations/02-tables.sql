-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Script: 02-tables.sql
-- Descrição: Criação de todas as tabelas
-- Versão: 1.0
-- Data: 2025-10-25
-- =====================================================

-- PRÉ-REQUISITO: Execute 01-enums.sql antes deste script

-- =====================================================
-- CADASTROS (ENTIDADES MESTRES)
-- =====================================================

-- ----------------------------------------------------
-- TBDEPARTAMENTO
-- Departamentos da empresa (SPEP, SPPV, CPHD, Líquidos, etc)
-- ----------------------------------------------------
CREATE TABLE tbdepartamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(10) NOT NULL UNIQUE,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,

  -- Gestão do departamento
  gerente_id BIGINT REFERENCES tbusuario(id) ON DELETE SET NULL,
  gerente_email VARCHAR(100),
  aprovador_pedido_id BIGINT REFERENCES tbusuario(id) ON DELETE SET NULL,

  -- Status
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  bloqueado BOOLEAN NOT NULL DEFAULT FALSE,

  -- Integração com TOTVS/SICFAR
  sync VARCHAR(1),
  sync_data TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),

  -- Auditoria básica do registro (ALCOA+)
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  created_by BIGINT REFERENCES tbusuario(id),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  updated_by BIGINT REFERENCES tbusuario(id),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by BIGINT REFERENCES tbusuario(id)
);

COMMENT ON TABLE tbdepartamento IS 'Departamentos da empresa (SPEP, SPPV, CPHD, Líquidos, etc)';
COMMENT ON COLUMN tbdepartamento.codigo IS 'Código único do departamento (ex: SPEP, SPPV)';
COMMENT ON COLUMN tbdepartamento.gerente_id IS 'Gerente responsável pelo departamento';
COMMENT ON COLUMN tbdepartamento.aprovador_pedido_id IS 'Usuário aprovador de pedidos do departamento';
COMMENT ON COLUMN tbdepartamento.bloqueado IS 'Departamento bloqueado para novos registros';

-- ----------------------------------------------------
-- TBLINHA
-- Linhas de produção (37 linhas no MVP)
-- ----------------------------------------------------
CREATE TABLE tblinha (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  departamento_id UUID NOT NULL REFERENCES tbdepartamento(id) ON DELETE RESTRICT,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nome VARCHAR(100) NOT NULL,
  tipo tipo_linha_enum NOT NULL,
  localizacao VARCHAR(200),

  -- Integração com CLPs
  tem_clp BOOLEAN NOT NULL DEFAULT FALSE,
  tipo_clp VARCHAR(50),  -- Ex: 'Bottelpack', 'Pró Maquia', 'Bausch Strobbel'

  -- Meta de OEE padrão (use tbmetaoee para histórico)
  meta_oee_padrao DECIMAL(5,2) CHECK (meta_oee_padrao >= 0 AND meta_oee_padrao <= 100),

  ativo BOOLEAN NOT NULL DEFAULT TRUE,

  -- Integração com TOTVS/SICFAR
  sync VARCHAR(1),
  sync_data TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),

  -- Auditoria básica do registro (ALCOA+)
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  created_by BIGINT REFERENCES tbusuario(id),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  updated_by BIGINT REFERENCES tbusuario(id),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by BIGINT REFERENCES tbusuario(id)
);

COMMENT ON TABLE tblinha IS 'Linhas de produção (envase e embalagem). MVP: 37 linhas';
COMMENT ON COLUMN tblinha.tipo_clp IS 'Fabricante do CLP se tem_clp=true';
COMMENT ON COLUMN tblinha.meta_oee_padrao IS 'Meta padrão de OEE (%). Use tbmetaoee para histórico';

-- ----------------------------------------------------
-- TB_PRODUTO
-- Unifica SKUs e Insumos em uma única tabela de produtos
-- ----------------------------------------------------
CREATE TABLE tbproduto (
  produto_id SERIAL PRIMARY KEY,
  empresa_id INTEGER,
  usuario_id INTEGER,
  referencia VARCHAR(20),
  descricao VARCHAR(80),
  codbarra VARCHAR(20),
  ipi NUMERIC(10,2),
  icms NUMERIC(10,2),
  unidade VARCHAR(3),
  peso_bruto NUMERIC(10,4),
  peso_liquido NUMERIC(10,4),
  estoque_minimo NUMERIC(10,4),
  foto BYTEA,
  deletado CHAR(1),
  comissao NUMERIC(10,2),
  estoque_id INTEGER,
  tipoproduto_id INTEGER,
  grupo_id INTEGER,
  subgrupo_id INTEGER,
  ncm VARCHAR(10),
  obs TEXT,
  erp_codigo VARCHAR(10),
  qtde_caixa NUMERIC(15,4),
  preco_maximo NUMERIC(15,4),
  bloqueado VARCHAR(3), -- Sim/Não

  -- Integração com TOTVS/SICFAR
  sync VARCHAR(1),
  sync_data TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),

  -- Auditoria básica do registro (ALCOA+)
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  created_by BIGINT REFERENCES tbusuario(id),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  updated_by BIGINT REFERENCES tbusuario(id),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by BIGINT REFERENCES tbusuario(id)
);

-- ----------------------------------------------------
-- TBLOTEINSUMO
-- Lotes de insumos recebidos
-- ----------------------------------------------------
CREATE TABLE tbloteinsumo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_lote VARCHAR(50) NOT NULL UNIQUE,
  produto_id INTEGER NOT NULL REFERENCES tbproduto(produto_id) ON DELETE RESTRICT,
  quantidade DECIMAL(12,3) NOT NULL CHECK (quantidade >= 0),
  data_fabricacao DATE,
  data_validade DATE,
  fornecedor VARCHAR(200),
  status status_insumo_enum NOT NULL DEFAULT 'EM_ESTOQUE',

  -- Integração com TOTVS/SICFAR
  sync VARCHAR(1),
  sync_data TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),

  -- Auditoria básica do registro (ALCOA+)
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  created_by BIGINT REFERENCES tbusuario(id),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  updated_by BIGINT REFERENCES tbusuario(id),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by BIGINT REFERENCES tbusuario(id)
);

COMMENT ON TABLE tbloteinsumo IS 'Lotes de insumos recebidos de Compras/TOTVS';

-- ----------------------------------------------------
-- TBVELOCIDADENOMINAL
-- Velocidade de produção (Und/h) por SKU por Linha
-- CRÍTICO: Base para cálculo de Performance
-- ----------------------------------------------------
CREATE TABLE tbvelocidadenominal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linha_id UUID NOT NULL REFERENCES tblinha(id) ON DELETE RESTRICT,
  produto_id INTEGER NOT NULL REFERENCES tbproduto(produto_id) ON DELETE RESTRICT,

  velocidade_nominal DECIMAL(10,2) NOT NULL CHECK (velocidade_nominal > 0),

  -- Vigência (histórico de velocidades)
  data_inicio_vigencia DATE NOT NULL,
  data_fim_vigencia DATE,  -- NULL = vigente

  observacao TEXT,

  -- Aprovação (Diretoria)
  aprovado_por BIGINT REFERENCES tbusuario(id),
  aprovado_em TIMESTAMPTZ,

  -- Integração com TOTVS/SICFAR
  sync VARCHAR(1),
  sync_data TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),

  -- Auditoria básica do registro (ALCOA+)
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  created_by BIGINT REFERENCES tbusuario(id),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  updated_by BIGINT REFERENCES tbusuario(id),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by BIGINT REFERENCES tbusuario(id),

  -- Constraint: apenas uma velocidade vigente por linha+SKU
  CONSTRAINT uq_velocidade_vigente UNIQUE (linha_id, produto_id, data_inicio_vigencia),

  -- Validação: fim >= inicio
  CONSTRAINT ck_vigencia CHECK (data_fim_vigencia IS NULL OR data_fim_vigencia >= data_inicio_vigencia)
);

COMMENT ON TABLE tbvelocidadenominal IS 'Velocidade nominal (Und/h) por Produto por Linha. CRÍTICO para cálculo de Performance';
COMMENT ON COLUMN tbvelocidadenominal.velocidade_nominal IS 'Unidades por hora (Und/h) após qualificação';
COMMENT ON COLUMN tbvelocidadenominal.data_fim_vigencia IS 'NULL = velocidade ainda vigente';

-- ----------------------------------------------------
-- TBCODIGOPARADA
-- Códigos de paradas com hierarquia de 5 níveis (TPM)
-- Cada linha tem seu "book" de paradas
-- ----------------------------------------------------
CREATE TABLE tbcodigoparada (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linha_id UUID REFERENCES tblinha(id) ON DELETE RESTRICT,  -- NULL = parada global
  codigo VARCHAR(20) NOT NULL,
  descricao VARCHAR(200) NOT NULL,

  -- Hierarquia de 5 níveis (conforme Atividade 02)
  nivel_1_classe VARCHAR(50) NOT NULL,           -- Ex: 'Planejada', 'Não Planejada', 'Estratégica'
  nivel_2_grande_parada VARCHAR(100) NOT NULL,   -- Ex: 'Manutenção', 'Falta de Insumo'
  nivel_3_apontamento VARCHAR(100),              -- Ex: 'Quebra/Falhas'
  nivel_4_grupo VARCHAR(100),                    -- Ex: 'Mecânica', 'Elétrica'
  nivel_5_detalhamento VARCHAR(200),             -- Ex: 'Extrusão, Sopro e Formação'

  -- Tipo de parada
  tipo_parada tipo_parada_enum NOT NULL,

  -- Regra de negócio: paradas < 10 min afetam Performance, não Disponibilidade
  impacta_disponibilidade BOOLEAN NOT NULL DEFAULT TRUE,
  tempo_minimo_registro INTEGER DEFAULT 1,  -- Minutos (padrão: registrar todas)

  ativo BOOLEAN NOT NULL DEFAULT TRUE,

  -- Integração com TOTVS/SICFAR
  sync VARCHAR(1),
  sync_data TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),

  -- Auditoria básica do registro (ALCOA+)
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  created_by BIGINT REFERENCES tbusuario(id),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  updated_by BIGINT REFERENCES tbusuario(id),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by BIGINT REFERENCES tbusuario(id),

  -- Constraint: código único por linha (ou global se linha_id NULL)
  CONSTRAINT uq_codigo_parada_linha UNIQUE (linha_id, codigo)
);

COMMENT ON TABLE tbcodigoparada IS 'Códigos de paradas com hierarquia de 5 níveis (TPM 16 perdas)';
COMMENT ON COLUMN tbcodigoparada.linha_id IS 'NULL = parada global (todas linhas)';
COMMENT ON COLUMN tbcodigoparada.impacta_disponibilidade IS 'FALSE = afeta Performance (ex: pequenas paradas < 10 min)';

-- ----------------------------------------------------
-- TBTURNO
-- Turnos de trabalho (D1, N1, etc.)
-- ----------------------------------------------------
CREATE TABLE tbturno (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(10) NOT NULL UNIQUE,
  nome VARCHAR(50) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  duracao_horas DECIMAL(4,2) NOT NULL CHECK (duracao_horas > 0),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,

  -- Integração com TOTVS/SICFAR
  sync VARCHAR(1),
  sync_data TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),

  -- Auditoria básica do registro (ALCOA+)
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  created_by BIGINT REFERENCES tbusuario(id),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  updated_by BIGINT REFERENCES tbusuario(id),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by BIGINT REFERENCES tbusuario(id)
);

COMMENT ON TABLE tbturno IS 'Turnos de trabalho da produção';
COMMENT ON COLUMN tbturno.duracao_horas IS 'Duração real considerando virada de dia';

-- ----------------------------------------------------
-- TBUSUARIO
-- Usuários do sistema
-- ----------------------------------------------------
CREATE TABLE tbusuario (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  nome_completo VARCHAR(200) NOT NULL,
  matricula VARCHAR(20) UNIQUE,
  senha_hash VARCHAR(255),  -- Hash bcrypt da senha
  tipo_usuario tipo_usuario_enum NOT NULL DEFAULT 'OPERADOR',

  -- Relacionamento opcional com departamento/linha
  departamento_id UUID REFERENCES tbdepartamento(id) ON DELETE SET NULL,
  linha_id UUID REFERENCES tblinha(id) ON DELETE SET NULL,

  ativo BOOLEAN NOT NULL DEFAULT TRUE,

  -- Integração com TOTVS/SICFAR
  sync VARCHAR(1),  -- 'S' = sincronizado, 'N' = pendente, NULL = não aplicável
  sync_data TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),

  -- Auditoria básica do registro (ALCOA+ - sem created_by/updated_by para evitar recursão)
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by BIGINT REFERENCES tbusuario(id)
);

COMMENT ON TABLE tbusuario IS 'Usuários do sistema OEE';
COMMENT ON COLUMN tbusuario.id IS 'ID auto-incrementado do usuário';
COMMENT ON COLUMN tbusuario.matricula IS 'Matrícula do funcionário na Farmace';

-- ----------------------------------------------------
-- TBMETAOEE
-- Metas de OEE por linha com histórico de vigência
-- ----------------------------------------------------
CREATE TABLE tbmetaoee (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linha_id UUID NOT NULL REFERENCES tblinha(id) ON DELETE RESTRICT,
  meta_oee DECIMAL(5,2) NOT NULL CHECK (meta_oee >= 0 AND meta_oee <= 100),

  -- Vigência
  data_inicio_vigencia DATE NOT NULL,
  data_fim_vigencia DATE,  -- NULL = vigente

  observacao TEXT,

  -- Aprovação
  aprovado_por BIGINT REFERENCES tbusuario(id),
  aprovado_em TIMESTAMPTZ,

  ativo BOOLEAN NOT NULL DEFAULT TRUE,

  -- Integração com TOTVS/SICFAR
  sync VARCHAR(1),
  sync_data TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),

  -- Auditoria básica do registro (ALCOA+)
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  created_by BIGINT REFERENCES tbusuario(id),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  updated_by BIGINT REFERENCES tbusuario(id),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by BIGINT REFERENCES tbusuario(id),

  -- Constraint: apenas uma meta vigente por linha
  CONSTRAINT uq_meta_vigente UNIQUE (linha_id, data_inicio_vigencia),
  CONSTRAINT ck_vigencia_meta CHECK (data_fim_vigencia IS NULL OR data_fim_vigencia >= data_inicio_vigencia)
);

COMMENT ON TABLE tbmetaoee IS 'Metas de OEE por linha com histórico de vigência';

-- =====================================================
-- TRANSAÇÕES (DADOS OPERACIONAIS)
-- =====================================================

-- ----------------------------------------------------
-- TBLOTE
-- Lotes de produção (nasce quando OP é aberta no TOTVS)
-- ----------------------------------------------------
CREATE TABLE tblote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_lote VARCHAR(50) NOT NULL UNIQUE,
  linha_id UUID NOT NULL REFERENCES tblinha(id) ON DELETE RESTRICT,
  produto_id INTEGER NOT NULL REFERENCES tbproduto(produto_id) ON DELETE RESTRICT,
  turno_id UUID REFERENCES tbturno(id) ON DELETE SET NULL,

  data_producao DATE NOT NULL,
  hora_inicio TIME,
  hora_fim TIME,

  -- Produção (conforme Diário de Bordo)
  producao_inicial INTEGER DEFAULT 0 CHECK (producao_inicial >= 0),
  producao_atual INTEGER DEFAULT 0 CHECK (producao_atual >= 0),

  -- Campos calculados (atualizados por triggers)
  unidades_produzidas INTEGER DEFAULT 0 CHECK (unidades_produzidas >= 0),
  unidades_boas INTEGER DEFAULT 0 CHECK (unidades_boas >= 0),
  unidades_refugo INTEGER DEFAULT 0 CHECK (unidades_refugo >= 0),
  tempo_retrabalho_minutos INTEGER DEFAULT 0 CHECK (tempo_retrabalho_minutos >= 0),

  status status_lote_enum NOT NULL DEFAULT 'EM_ANDAMENTO',
  observacoes TEXT,

  -- Integração TOTVS
  origem_totvs_op VARCHAR(50),  -- Número da Ordem de Produção
  totvs_sincronizado_em TIMESTAMPTZ,

  -- Assinatura eletrônica (Diário de Bordo)
  conferido_por_supervisor BIGINT REFERENCES tbusuario(id),
  conferido_em TIMESTAMPTZ,

  -- PDF do Diário de Bordo
  pdf_url TEXT,
  pdf_gerado_em TIMESTAMPTZ,

  -- Integração com TOTVS/SICFAR
  sync VARCHAR(1),
  sync_data TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),

  -- Auditoria básica do registro (ALCOA+)
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  created_by BIGINT REFERENCES tbusuario(id),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  updated_by BIGINT REFERENCES tbusuario(id),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by BIGINT REFERENCES tbusuario(id),

  -- Validação: fim >= inicio
  CONSTRAINT ck_horario_lote CHECK (hora_fim IS NULL OR hora_fim >= hora_inicio)
);

COMMENT ON TABLE tblote IS 'Lotes de produção. Criado automaticamente quando OP é aberta no TOTVS';
COMMENT ON COLUMN tblote.producao_inicial IS 'Quantidade já produzida quando turno iniciou (Diário de Bordo)';
COMMENT ON COLUMN tblote.producao_atual IS 'Quantidade produzida no turno (Diário de Bordo)';
COMMENT ON COLUMN tblote.unidades_produzidas IS 'Total produzido (atualizado por trigger)';
COMMENT ON COLUMN tblote.conferido_por_supervisor IS 'Supervisor que assinou digitalmente o Diário de Bordo';

-- ----------------------------------------------------
-- TBAPONTAMENTOPARADA
-- Apontamentos de paradas (CONTEMPORÂNEO - ALCOA+)
-- ----------------------------------------------------
CREATE TABLE tbapontamentoparada (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linha_id UUID NOT NULL REFERENCES tblinha(id) ON DELETE RESTRICT,
  lote_id UUID REFERENCES tblote(id) ON DELETE SET NULL,  -- NULL se parada sem lote
  codigo_parada_id UUID NOT NULL REFERENCES tbcodigoparada(id) ON DELETE RESTRICT,
  turno_id UUID NOT NULL REFERENCES tbturno(id) ON DELETE RESTRICT,

  data_parada DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME,  -- NULL se parada ainda em andamento
  duracao_minutos INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN hora_fim IS NULL THEN NULL
      ELSE EXTRACT(EPOCH FROM (hora_fim - hora_inicio)) / 60
    END
  ) STORED,

  observacao TEXT,

  -- ALCOA+: Atribuível + Contemporâneo
  criado_por_operador BIGINT NOT NULL REFERENCES tbusuario(id),

  -- Conferência/Assinatura
  conferido_por_supervisor BIGINT REFERENCES tbusuario(id),
  conferido_em TIMESTAMPTZ,

  -- Integração com TOTVS/SICFAR
  sync VARCHAR(1),
  sync_data TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),

  -- Auditoria básica do registro (ALCOA+)
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  created_by BIGINT REFERENCES tbusuario(id),  -- Normalmente = criado_por_operador
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  updated_by BIGINT REFERENCES tbusuario(id),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by BIGINT REFERENCES tbusuario(id),

  -- Validação: fim >= inicio
  CONSTRAINT ck_horario_parada CHECK (hora_fim IS NULL OR hora_fim >= hora_inicio)
);

COMMENT ON TABLE tbapontamentoparada IS 'Apontamentos de paradas. CRÍTICO: Registro contemporâneo (ALCOA+)';
COMMENT ON COLUMN tbapontamentoparada.duracao_minutos IS 'Calculado automaticamente (hora_fim - hora_inicio)';
COMMENT ON COLUMN tbapontamentoparada.criado_por_operador IS 'Operador que registrou a parada (ALCOA+: Atribuível)';

-- ----------------------------------------------------
-- TBAPONTAMENTOPRODUCAO
-- Apontamentos de produção (CLP ou manual)
-- ----------------------------------------------------
CREATE TABLE tbapontamentoproducao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id UUID NOT NULL REFERENCES tblote(id) ON DELETE CASCADE,
  linha_id UUID NOT NULL REFERENCES tblinha(id) ON DELETE RESTRICT,
  turno_id UUID NOT NULL REFERENCES tbturno(id) ON DELETE RESTRICT,

  data_apontamento DATE NOT NULL,
  hora_apontamento TIME NOT NULL,
  unidades_produzidas INTEGER NOT NULL CHECK (unidades_produzidas >= 0),

  -- Fonte de dados
  fonte_dados fonte_dados_enum NOT NULL,
  clp_timestamp TIMESTAMPTZ,  -- Timestamp original do CLP (ALCOA+: Original)

  observacao TEXT,

  -- Integração com TOTVS/SICFAR
  sync VARCHAR(1),
  sync_data TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),

  -- Auditoria básica do registro (ALCOA+)
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  created_by BIGINT REFERENCES tbusuario(id),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  updated_by BIGINT REFERENCES tbusuario(id),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by BIGINT REFERENCES tbusuario(id)
);

COMMENT ON TABLE tbapontamentoproducao IS 'Apontamentos de produção. Fonte: CLP (automático) ou Manual';
COMMENT ON COLUMN tbapontamentoproducao.clp_timestamp IS 'Timestamp original do CLP (ALCOA+: Original)';

-- ----------------------------------------------------
-- TBAPONTAMENTOQUALIDADE
-- Apontamentos de qualidade (refugo, retrabalho)
-- ----------------------------------------------------
CREATE TABLE tbapontamentoqualidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id UUID NOT NULL REFERENCES tblote(id) ON DELETE CASCADE,
  linha_id UUID NOT NULL REFERENCES tblinha(id) ON DELETE RESTRICT,
  turno_id UUID NOT NULL REFERENCES tbturno(id) ON DELETE RESTRICT,

  data_apontamento DATE NOT NULL,
  tipo_perda tipo_perda_qualidade_enum NOT NULL,

  -- Refugo ou Retrabalho
  unidades_refugadas INTEGER CHECK (unidades_refugadas >= 0),
  tempo_retrabalho_minutos INTEGER CHECK (tempo_retrabalho_minutos >= 0),

  motivo TEXT,

  -- Integração TOTVS
  origem_dados fonte_dados_enum NOT NULL DEFAULT 'MANUAL',
  totvs_integrado BOOLEAN NOT NULL DEFAULT FALSE,
  totvs_timestamp TIMESTAMPTZ,

  observacao TEXT,

  -- Integração com TOTVS/SICFAR
  sync VARCHAR(1),
  sync_data TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),

  -- Auditoria básica do registro (ALCOA+)
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  created_by BIGINT REFERENCES tbusuario(id),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  updated_by BIGINT REFERENCES tbusuario(id),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by BIGINT REFERENCES tbusuario(id),

  -- Validação: refugo OU retrabalho deve estar preenchido
  CONSTRAINT ck_qualidade CHECK (
    (tipo_perda = 'REFUGO' AND unidades_refugadas > 0) OR
    (tipo_perda = 'RETRABALHO' AND tempo_retrabalho_minutos > 0) OR
    (tipo_perda IN ('DESVIO', 'BLOQUEIO'))
  )
);

COMMENT ON TABLE tbapontamentoqualidade IS 'Apontamentos de perdas de qualidade (refugo, retrabalho)';
COMMENT ON COLUMN tbapontamentoqualidade.totvs_integrado IS 'TRUE quando sincronizado com TOTVS';

-- =====================================================
-- CACHE E AUDITORIA
-- =====================================================

-- ----------------------------------------------------
-- TBOEECALCULADO
-- Cache de cálculos de OEE (performance)
-- ----------------------------------------------------
CREATE TABLE tboeecalculado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dimensões
  linha_id UUID NOT NULL REFERENCES tblinha(id) ON DELETE CASCADE,
  lote_id UUID REFERENCES tblote(id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES tbproduto(produto_id) ON DELETE RESTRICT,
  turno_id UUID REFERENCES tbturno(id) ON DELETE SET NULL,
  data_referencia DATE NOT NULL,

  -- Tempos (em horas)
  tempo_calendario DECIMAL(6,2) NOT NULL,
  tempo_disponivel DECIMAL(6,2) NOT NULL,
  tempo_operacao DECIMAL(6,2) NOT NULL,
  tempo_operacional_liquido DECIMAL(6,2) NOT NULL,
  tempo_valioso DECIMAL(6,2) NOT NULL,
  tempo_paradas_estrategicas DECIMAL(6,2) DEFAULT 0,
  tempo_paradas_planejadas DECIMAL(6,2) DEFAULT 0,
  tempo_paradas_nao_planejadas DECIMAL(6,2) DEFAULT 0,
  tempo_retrabalho DECIMAL(6,2) DEFAULT 0,

  -- Unidades
  unidades_produzidas INTEGER NOT NULL,
  unidades_boas INTEGER NOT NULL,
  unidades_refugadas INTEGER DEFAULT 0,
  velocidade_nominal DECIMAL(10,2) NOT NULL,

  -- Componentes OEE (%)
  disponibilidade DECIMAL(5,2) NOT NULL CHECK (disponibilidade >= 0 AND disponibilidade <= 100),
  performance DECIMAL(5,2) NOT NULL CHECK (performance >= 0 AND performance <= 100),
  qualidade DECIMAL(5,2) NOT NULL CHECK (qualidade >= 0 AND qualidade <= 100),

  -- OEE Final (%)
  oee DECIMAL(5,2) NOT NULL CHECK (oee >= 0 AND oee <= 100),

  -- Meta (snapshot da meta vigente na data)
  meta_oee DECIMAL(5,2),
  atingiu_meta BOOLEAN GENERATED ALWAYS AS (oee >= meta_oee) STORED,

  -- Cache control
  calculado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recalcular BOOLEAN DEFAULT FALSE,  -- Flag para invalidar cache

  -- Integração com TOTVS/SICFAR
  sync VARCHAR(1),
  sync_data TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),

  -- Auditoria básica do registro (ALCOA+)
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  created_by BIGINT REFERENCES tbusuario(id),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
  updated_by BIGINT REFERENCES tbusuario(id),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by BIGINT REFERENCES tbusuario(id),

  -- Constraint: um cache por lote
  CONSTRAINT uq_oee_lote UNIQUE (lote_id)
);

COMMENT ON TABLE tboeecalculado IS 'Cache de cálculos de OEE. Populado quando lote é concluído';
COMMENT ON COLUMN tboeecalculado.recalcular IS 'TRUE = cache inválido, precisa recalcular';
COMMENT ON COLUMN tboeecalculado.atingiu_meta IS 'Calculado automaticamente: oee >= meta_oee';

-- ----------------------------------------------------
-- TBAUDITLOG
-- Log de auditoria (ALCOA+ Compliance)
-- Tabela APPEND-ONLY (sem UPDATE/DELETE)
-- ----------------------------------------------------
CREATE TABLE tbauditlog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dados da operação
  tabela VARCHAR(100) NOT NULL,
  registro_id UUID NOT NULL,
  operacao operacao_audit_enum NOT NULL,

  -- Mudanças (relacional, não JSONB)
  campo_alterado VARCHAR(100),        -- NULL se INSERT/DELETE de registro completo
  valor_anterior TEXT,                -- NULL se INSERT
  valor_novo TEXT,                    -- NULL se DELETE

  -- ALCOA+: Atribuível
  usuario_id BIGINT NOT NULL REFERENCES tbusuario(id),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Contexto
  ip_address INET,
  user_agent TEXT,
  motivo_alteracao TEXT,  -- Obrigatório para UPDATE/DELETE de dados críticos

  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tbauditlog IS 'Log de auditoria (ALCOA+). Tabela APPEND-ONLY (imutável)';
COMMENT ON COLUMN tbauditlog.campo_alterado IS 'NULL = operação no registro completo (INSERT/DELETE)';
COMMENT ON COLUMN tbauditlog.motivo_alteracao IS 'Obrigatório para UPDATE/DELETE em dados críticos';

-- Prevenir UPDATE/DELETE na tabela de auditoria
CREATE RULE audit_log_no_update AS ON UPDATE TO tbauditlog DO INSTEAD NOTHING;
CREATE RULE audit_log_no_delete AS ON DELETE TO tbauditlog DO INSTEAD NOTHING;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- Próximo script: 03-functions.sql
