# Requisitos de Banco de Dados Supabase - Sistema OEE SicFar

## Visão Geral

Este documento especifica todas as tabelas, relacionamentos e estruturas de dados necessárias no Supabase para persistir os dados do sistema de Apontamento de OEE, baseado na análise do arquivo `ApontamentoOEE.tsx` e na documentação do projeto.

## Princípios ALCOA+ (Requisito Regulatório)

Todas as tabelas devem seguir os princípios ALCOA+ para conformidade com BPF (Boas Práticas de Fabricação):

- **A - Atribuível**: Campos `created_by`, `updated_by`, `deleted_by` (ID do usuário)
- **L - Legível**: Dados estruturados e claros
- **C - Contemporâneo**: Timestamps automáticos (`created_at`, `updated_at`)
- **O - Original**: Soft delete (não excluir fisicamente)
- **A - Exato**: Validações e constraints
- **+ Completo**: Todos os campos relevantes presentes
- **+ Consistente**: Foreign keys e integridade referencial
- **+ Durável**: Backup automático do Supabase
- **+ Disponível**: Acessível para auditorias

## Campos de Auditoria Padrão

Todas as tabelas devem incluir:

```sql
-- Campos de auditoria ALCOA+
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
created_by INTEGER REFERENCES tbusuario(usuario_id),
updated_at TIMESTAMP WITH TIME ZONE,
updated_by INTEGER REFERENCES tbusuario(usuario_id),
deleted_at TIMESTAMP WITH TIME ZONE,
deleted_by INTEGER REFERENCES tbusuario(usuario_id),
deletado CHAR(1) DEFAULT 'N' CHECK (deletado IN ('S', 'N'))
```

## 1. Tabelas de Cadastro Base

### 1.1. tbdepartamento (Setores Produtivos)

Armazena os 4 setores produtivos do escopo MVP.

```sql
CREATE TABLE tbdepartamento (
  departamento_id SERIAL PRIMARY KEY,
  departamento VARCHAR(100) NOT NULL,
  sigla VARCHAR(10) NOT NULL UNIQUE, -- SPEP, SPPV, Líquidos, CPHD
  descricao TEXT,
  ativo CHAR(1) DEFAULT 'S' CHECK (ativo IN ('S', 'N')),
  
  -- Auditoria ALCOA+
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by INTEGER REFERENCES tbusuario(usuario_id),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by INTEGER REFERENCES tbusuario(usuario_id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by INTEGER REFERENCES tbusuario(usuario_id),
  deletado CHAR(1) DEFAULT 'N' CHECK (deletado IN ('S', 'N'))
);

-- Índices
CREATE INDEX idx_departamento_sigla ON tbdepartamento(sigla);
CREATE INDEX idx_departamento_ativo ON tbdepartamento(ativo) WHERE deletado = 'N';

-- Comentários
COMMENT ON TABLE tbdepartamento IS 'Setores produtivos (SPEP, SPPV, Líquidos, CPHD)';
COMMENT ON COLUMN tbdepartamento.sigla IS 'Sigla única do setor (ex: SPEP, SPPV)';
```

**Dados iniciais (4 setores do MVP)**:
- SPEP - Soluções Parenterais de Embalagem Plástica
- SPPV - Soluções Parenterais de Pequeno Volume (Vidros)
- Líquidos - Líquidos Orais
- CPHD - Concentrado Polieletrolítico para Hemodiálise

### 1.2. tblinhaproducao (Linhas de Produção)

Armazena as 37 linhas de produção do escopo MVP.

```sql
CREATE TABLE tblinhaproducao (
  linhaproducao_id SERIAL PRIMARY KEY,
  linhaproducao VARCHAR(100) NOT NULL,
  departamento_id INTEGER NOT NULL REFERENCES tbdepartamento(departamento_id),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Envase', 'Embalagem')),
  meta_oee NUMERIC(5,2) DEFAULT 75.00 CHECK (meta_oee >= 0 AND meta_oee <= 100),
  ativo CHAR(1) DEFAULT 'S' CHECK (ativo IN ('S', 'N')),
  
  -- Auditoria ALCOA+
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by INTEGER REFERENCES tbusuario(usuario_id),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by INTEGER REFERENCES tbusuario(usuario_id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by INTEGER REFERENCES tbusuario(usuario_id),
  deletado CHAR(1) DEFAULT 'N' CHECK (deletado IN ('S', 'N')),
  
  -- Constraint única: não pode haver duas linhas com mesmo nome no mesmo departamento
  CONSTRAINT uk_linha_departamento UNIQUE (linhaproducao, departamento_id, deletado)
);

-- Índices
CREATE INDEX idx_linhaproducao_departamento ON tblinhaproducao(departamento_id);
CREATE INDEX idx_linhaproducao_tipo ON tblinhaproducao(tipo);
CREATE INDEX idx_linhaproducao_ativo ON tblinhaproducao(ativo) WHERE deletado = 'N';

-- Comentários
COMMENT ON TABLE tblinhaproducao IS 'Linhas de produção (37 linhas do MVP)';
COMMENT ON COLUMN tblinhaproducao.tipo IS 'Tipo da linha: Envase ou Embalagem';
COMMENT ON COLUMN tblinhaproducao.meta_oee IS 'Meta de OEE para a linha (percentual 0-100)';
```

**Dados iniciais (37 linhas)**:
- SPEP: 10 envase + 10 embalagem = 20 linhas
- SPPV: 5 envase + 5 embalagem = 10 linhas
- Líquidos: 3 envase + 2 embalagem = 5 linhas
- CPHD: 2 linhas (Linha Ácida e Linha Básica)

### 1.3. tbturno (Turnos de Produção)

Armazena os turnos de trabalho (2 turnos de 12 horas cada).

```sql
CREATE TABLE tbturno (
  turno_id SERIAL PRIMARY KEY,
  codigo VARCHAR(10) NOT NULL UNIQUE, -- D1, N1, etc
  turno VARCHAR(50) NOT NULL, -- 1º Turno, 2º Turno
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  duracao_horas NUMERIC(4,2) GENERATED ALWAYS AS (
    CASE 
      WHEN hora_fim > hora_inicio THEN EXTRACT(EPOCH FROM (hora_fim - hora_inicio)) / 3600
      ELSE EXTRACT(EPOCH FROM (hora_fim - hora_inicio + INTERVAL '24 hours')) / 3600
    END
  ) STORED,
  meta_oee NUMERIC(5,2) DEFAULT 85.00 CHECK (meta_oee >= 0 AND meta_oee <= 100),
  
  -- Auditoria ALCOA+
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by INTEGER REFERENCES tbusuario(usuario_id),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by INTEGER REFERENCES tbusuario(usuario_id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by INTEGER REFERENCES tbusuario(usuario_id),
  deletado CHAR(1) DEFAULT 'N' CHECK (deletado IN ('S', 'N'))
);

-- Índices
CREATE INDEX idx_turno_codigo ON tbturno(codigo);

-- Comentários
COMMENT ON TABLE tbturno IS 'Turnos de produção (2 turnos de 12 horas)';
COMMENT ON COLUMN tbturno.duracao_horas IS 'Duração calculada automaticamente (suporta turnos que cruzam meia-noite)';
```

### 1.4. tbsku (Produtos/SKUs)

Armazena os produtos (SKUs) com suas velocidades nominais por linha.

```sql
CREATE TABLE tbsku (
  sku_id SERIAL PRIMARY KEY,
  codigo_sku VARCHAR(50) NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  codigo_totvs VARCHAR(50), -- C2_PRODUTO do TOTVS
  descricao_totvs TEXT, -- B1_DESC do TOTVS
  registro_anvisa VARCHAR(50), -- B1_YREGANS
  codigo_barras VARCHAR(50), -- B1_CODBAR
  ativo CHAR(1) DEFAULT 'S' CHECK (ativo IN ('S', 'N')),

  -- Auditoria ALCOA+
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by INTEGER REFERENCES tbusuario(usuario_id),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by INTEGER REFERENCES tbusuario(usuario_id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by INTEGER REFERENCES tbusuario(usuario_id),
  deletado CHAR(1) DEFAULT 'N' CHECK (deletado IN ('S', 'N'))
);

-- Índices
CREATE INDEX idx_sku_codigo ON tbsku(codigo_sku);
CREATE INDEX idx_sku_codigo_totvs ON tbsku(codigo_totvs);
CREATE INDEX idx_sku_ativo ON tbsku(ativo) WHERE deletado = 'N';

-- Comentários
COMMENT ON TABLE tbsku IS 'Produtos (SKUs) produzidos nas linhas';
COMMENT ON COLUMN tbsku.codigo_totvs IS 'Código do produto no TOTVS (C2_PRODUTO)';
```

### 1.5. tbsku_velocidade_nominal (Velocidades Nominais por Linha)

**CRÍTICO**: Cada linha possui velocidade nominal diferente para cada SKU.

```sql
CREATE TABLE tbsku_velocidade_nominal (
  sku_velocidade_id SERIAL PRIMARY KEY,
  sku_id INTEGER NOT NULL REFERENCES tbsku(sku_id),
  linhaproducao_id INTEGER NOT NULL REFERENCES tblinhaproducao(linhaproducao_id),
  velocidade_nominal INTEGER NOT NULL CHECK (velocidade_nominal > 0), -- unidades/hora
  data_vigencia_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vigencia_fim DATE,
  observacao TEXT,

  -- Auditoria ALCOA+
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by INTEGER REFERENCES tbusuario(usuario_id),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by INTEGER REFERENCES tbusuario(usuario_id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by INTEGER REFERENCES tbusuario(usuario_id),
  deletado CHAR(1) DEFAULT 'N' CHECK (deletado IN ('S', 'N')),

  -- Constraint: não pode haver duas velocidades vigentes ao mesmo tempo para mesma linha+SKU
  CONSTRAINT uk_sku_linha_vigencia UNIQUE (sku_id, linhaproducao_id, data_vigencia_inicio, deletado)
);

-- Índices
CREATE INDEX idx_sku_velocidade_sku ON tbsku_velocidade_nominal(sku_id);
CREATE INDEX idx_sku_velocidade_linha ON tbsku_velocidade_nominal(linhaproducao_id);
CREATE INDEX idx_sku_velocidade_vigencia ON tbsku_velocidade_nominal(data_vigencia_inicio, data_vigencia_fim);

-- Comentários
COMMENT ON TABLE tbsku_velocidade_nominal IS 'Velocidades nominais de cada SKU por linha (base para cálculo de Performance)';
COMMENT ON COLUMN tbsku_velocidade_nominal.velocidade_nominal IS 'Unidades por hora sob condições perfeitas (após qualificação)';
COMMENT ON COLUMN tbsku_velocidade_nominal.data_vigencia_inicio IS 'Data de início da vigência desta velocidade';
COMMENT ON COLUMN tbsku_velocidade_nominal.data_vigencia_fim IS 'Data de fim da vigência (NULL = vigente)';
```

## 2. Tabelas de Hierarquia de Paradas

### 2.1. tbcodigo_parada (Códigos de Paradas - 5 Níveis)

Armazena a hierarquia de paradas em 5 níveis conforme especificação.

```sql
CREATE TABLE tbcodigo_parada (
  codigo_parada_id SERIAL PRIMARY KEY,
  linhaproducao_id INTEGER REFERENCES tblinhaproducao(linhaproducao_id), -- NULL = parada global
  codigo VARCHAR(20) NOT NULL,
  descricao TEXT NOT NULL,

  -- Hierarquia de 5 níveis
  nivel_1_classe VARCHAR(50) NOT NULL, -- Planejada, Não Planejada, Estratégica
  nivel_2_grande_parada VARCHAR(100) NOT NULL, -- Manutenção, Falta de Insumo, etc
  nivel_3_apontamento VARCHAR(100),
  nivel_4_grupo VARCHAR(100),
  nivel_5_detalhamento VARCHAR(100),

  -- Classificação para cálculo de OEE
  tipo_parada VARCHAR(20) NOT NULL CHECK (tipo_parada IN ('ESTRATEGICA', 'PLANEJADA', 'NAO_PLANEJADA')),
  impacta_disponibilidade BOOLEAN DEFAULT TRUE,
  tempo_minimo_registro INTEGER DEFAULT 10, -- minutos

  ativo CHAR(1) DEFAULT 'S' CHECK (ativo IN ('S', 'N')),

  -- Auditoria ALCOA+
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by INTEGER REFERENCES tbusuario(usuario_id),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by INTEGER REFERENCES tbusuario(usuario_id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by INTEGER REFERENCES tbusuario(usuario_id),
  deletado CHAR(1) DEFAULT 'N' CHECK (deletado IN ('S', 'N')),

  -- Constraint: código único por linha (ou global se linha NULL)
  CONSTRAINT uk_codigo_parada_linha UNIQUE (codigo, linhaproducao_id, deletado)
);

-- Índices
CREATE INDEX idx_codigo_parada_linha ON tbcodigo_parada(linhaproducao_id);
CREATE INDEX idx_codigo_parada_codigo ON tbcodigo_parada(codigo);
CREATE INDEX idx_codigo_parada_tipo ON tbcodigo_parada(tipo_parada);
CREATE INDEX idx_codigo_parada_nivel1 ON tbcodigo_parada(nivel_1_classe);
CREATE INDEX idx_codigo_parada_ativo ON tbcodigo_parada(ativo) WHERE deletado = 'N';

-- Comentários
COMMENT ON TABLE tbcodigo_parada IS 'Códigos de paradas com hierarquia de 5 níveis (Book de Paradas)';
COMMENT ON COLUMN tbcodigo_parada.linhaproducao_id IS 'NULL = parada global (todas as linhas)';
COMMENT ON COLUMN tbcodigo_parada.impacta_disponibilidade IS 'FALSE = afeta Performance (paradas < 10 min)';
COMMENT ON COLUMN tbcodigo_parada.tempo_minimo_registro IS 'Tempo mínimo para registro (minutos)';
```

## 3. Tabelas de Apontamento de Produção

### 3.1. tblote (Lotes de Produção)

Armazena os lotes de produção (contexto do apontamento).

```sql
CREATE TABLE tblote (
  lote_id SERIAL PRIMARY KEY,
  numero_lote VARCHAR(50) NOT NULL UNIQUE,
  linhaproducao_id INTEGER NOT NULL REFERENCES tblinhaproducao(linhaproducao_id),
  sku_id INTEGER NOT NULL REFERENCES tbsku(sku_id),
  turno_id INTEGER NOT NULL REFERENCES tbturno(turno_id),
  data_producao DATE NOT NULL,

  -- Horários do lote
  hora_inicio TIME NOT NULL,
  hora_fim TIME,

  -- Dados de produção
  producao_inicial INTEGER DEFAULT 0, -- Quantidade quando turno iniciou
  producao_atual INTEGER DEFAULT 0, -- Produzido no turno

  -- Dados calculados (atualizados por triggers)
  unidades_produzidas INTEGER DEFAULT 0,
  unidades_boas INTEGER DEFAULT 0,
  unidades_refugo INTEGER DEFAULT 0,
  tempo_retrabalho_minutos INTEGER DEFAULT 0,

  -- Status do lote
  status VARCHAR(20) DEFAULT 'EM_ANDAMENTO' CHECK (status IN ('PLANEJADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')),

  -- Integração TOTVS
  ordem_producao_totvs VARCHAR(50), -- C2_NUM
  dossie VARCHAR(50), -- C2_YDOSSIE
  totvs_sincronizado_em TIMESTAMP WITH TIME ZONE,

  -- Conferência (assinatura eletrônica)
  conferido_por_supervisor INTEGER REFERENCES tbusuario(usuario_id),
  conferido_em TIMESTAMP WITH TIME ZONE,

  -- Auditoria ALCOA+
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by INTEGER REFERENCES tbusuario(usuario_id),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by INTEGER REFERENCES tbusuario(usuario_id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by INTEGER REFERENCES tbusuario(usuario_id),
  deletado CHAR(1) DEFAULT 'N' CHECK (deletado IN ('S', 'N'))
);

-- Índices
CREATE INDEX idx_lote_numero ON tblote(numero_lote);
CREATE INDEX idx_lote_linha ON tblote(linhaproducao_id);
CREATE INDEX idx_lote_sku ON tblote(sku_id);
CREATE INDEX idx_lote_turno ON tblote(turno_id);
CREATE INDEX idx_lote_data ON tblote(data_producao);
CREATE INDEX idx_lote_status ON tblote(status);
CREATE INDEX idx_lote_op_totvs ON tblote(ordem_producao_totvs);

-- Comentários
COMMENT ON TABLE tblote IS 'Lotes de produção (contexto do apontamento de OEE)';
COMMENT ON COLUMN tblote.producao_inicial IS 'Quantidade já produzida quando turno iniciou';
COMMENT ON COLUMN tblote.producao_atual IS 'Quantidade produzida no turno atual';
COMMENT ON COLUMN tblote.unidades_produzidas IS 'Total produzido (calculado)';
COMMENT ON COLUMN tblote.conferido_por_supervisor IS 'Assinatura eletrônica do supervisor (ALCOA+)';
```

### 3.2. tbapontamento_producao (Apontamentos de Produção)

Armazena os apontamentos de produção por intervalo de tempo.

```sql
CREATE TABLE tbapontamento_producao (
  apontamento_producao_id SERIAL PRIMARY KEY,
  lote_id INTEGER NOT NULL REFERENCES tblote(lote_id),
  linhaproducao_id INTEGER NOT NULL REFERENCES tblinhaproducao(linhaproducao_id),
  sku_id INTEGER NOT NULL REFERENCES tbsku(sku_id),
  turno_id INTEGER NOT NULL REFERENCES tbturno(turno_id),

  -- Data e horários
  data_apontamento DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,

  -- Produção
  quantidade_produzida INTEGER NOT NULL CHECK (quantidade_produzida >= 0),
  velocidade_nominal INTEGER NOT NULL CHECK (velocidade_nominal > 0), -- unidades/hora (snapshot)

  -- Tempos calculados (em horas)
  tempo_operacao NUMERIC(10,4) NOT NULL, -- Diferença entre hora_fim e hora_inicio
  tempo_disponivel NUMERIC(10,4) NOT NULL, -- Tempo do turno

  -- Origem dos dados (ALCOA+: Rastreabilidade)
  origem_dados VARCHAR(20) DEFAULT 'MANUAL' CHECK (origem_dados IN ('CLP_AUTOMATICO', 'MANUAL', 'TOTVS')),

  -- Auditoria ALCOA+
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by INTEGER REFERENCES tbusuario(usuario_id),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by INTEGER REFERENCES tbusuario(usuario_id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by INTEGER REFERENCES tbusuario(usuario_id),
  deletado CHAR(1) DEFAULT 'N' CHECK (deletado IN ('S', 'N'))
);

-- Índices
CREATE INDEX idx_apontamento_producao_lote ON tbapontamento_producao(lote_id);
CREATE INDEX idx_apontamento_producao_linha ON tbapontamento_producao(linhaproducao_id);
CREATE INDEX idx_apontamento_producao_sku ON tbapontamento_producao(sku_id);
CREATE INDEX idx_apontamento_producao_turno ON tbapontamento_producao(turno_id);
CREATE INDEX idx_apontamento_producao_data ON tbapontamento_producao(data_apontamento);
CREATE INDEX idx_apontamento_producao_origem ON tbapontamento_producao(origem_dados);

-- Comentários
COMMENT ON TABLE tbapontamento_producao IS 'Apontamentos de produção por intervalo de tempo (base para cálculo de OEE)';
COMMENT ON COLUMN tbapontamento_producao.velocidade_nominal IS 'Snapshot da velocidade nominal no momento do apontamento';
COMMENT ON COLUMN tbapontamento_producao.tempo_operacao IS 'Tempo de operação em horas (hora_fim - hora_inicio)';
COMMENT ON COLUMN tbapontamento_producao.origem_dados IS 'Origem: CLP_AUTOMATICO, MANUAL ou TOTVS (ALCOA+)';
```

## 4. Tabelas de Apontamento de Paradas

### 4.1. tbapontamento_parada (Apontamentos de Paradas)

Armazena os apontamentos de paradas (contemporâneos).

```sql
CREATE TABLE tbapontamento_parada (
  apontamento_parada_id SERIAL PRIMARY KEY,
  linhaproducao_id INTEGER NOT NULL REFERENCES tblinhaproducao(linhaproducao_id),
  lote_id INTEGER REFERENCES tblote(lote_id), -- NULL se parada sem lote
  codigo_parada_id INTEGER NOT NULL REFERENCES tbcodigo_parada(codigo_parada_id),
  turno_id INTEGER NOT NULL REFERENCES tbturno(turno_id),

  -- Data e horários (ALCOA+: Contemporâneo)
  data_parada DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME, -- NULL se parada em andamento

  -- Duração calculada automaticamente
  duracao_minutos INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN hora_fim IS NOT NULL THEN
        EXTRACT(EPOCH FROM (hora_fim - hora_inicio)) / 60
      ELSE NULL
    END
  ) STORED,

  -- Observações
  observacao TEXT,

  -- Status da parada
  status VARCHAR(20) DEFAULT 'EM_ANDAMENTO' CHECK (status IN ('EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA')),

  -- Auditoria ALCOA+ (Atribuível: quem registrou a parada)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by INTEGER REFERENCES tbusuario(usuario_id),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by INTEGER REFERENCES tbusuario(usuario_id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by INTEGER REFERENCES tbusuario(usuario_id),
  deletado CHAR(1) DEFAULT 'N' CHECK (deletado IN ('S', 'N'))
);

-- Índices
CREATE INDEX idx_apontamento_parada_linha ON tbapontamento_parada(linhaproducao_id);
CREATE INDEX idx_apontamento_parada_lote ON tbapontamento_parada(lote_id);
CREATE INDEX idx_apontamento_parada_codigo ON tbapontamento_parada(codigo_parada_id);
CREATE INDEX idx_apontamento_parada_turno ON tbapontamento_parada(turno_id);
CREATE INDEX idx_apontamento_parada_data ON tbapontamento_parada(data_parada);
CREATE INDEX idx_apontamento_parada_status ON tbapontamento_parada(status);

-- Comentários
COMMENT ON TABLE tbapontamento_parada IS 'Apontamentos de paradas (registro contemporâneo - ALCOA+)';
COMMENT ON COLUMN tbapontamento_parada.hora_fim IS 'NULL = parada em andamento';
COMMENT ON COLUMN tbapontamento_parada.duracao_minutos IS 'Calculado automaticamente (hora_fim - hora_inicio)';
COMMENT ON COLUMN tbapontamento_parada.created_by IS 'Operador que registrou a parada (ALCOA+: Atribuível)';
```

## 5. Tabelas de Apontamento de Qualidade

### 5.1. tbapontamento_perdas (Perdas de Qualidade - Refugo)

Armazena apontamentos de perdas por refugo, desvios e bloqueios.

```sql
CREATE TABLE tbapontamento_perdas (
  apontamento_perdas_id SERIAL PRIMARY KEY,
  lote_id INTEGER NOT NULL REFERENCES tblote(lote_id),
  linhaproducao_id INTEGER NOT NULL REFERENCES tblinhaproducao(linhaproducao_id),
  sku_id INTEGER NOT NULL REFERENCES tbsku(sku_id),
  turno_id INTEGER NOT NULL REFERENCES tbturno(turno_id),

  -- Data do apontamento
  data_apontamento DATE NOT NULL,

  -- Tipo de perda
  tipo_perda VARCHAR(20) NOT NULL CHECK (tipo_perda IN ('REFUGO', 'DESVIO', 'BLOQUEIO')),

  -- Quantidade perdida
  unidades_refugadas INTEGER NOT NULL CHECK (unidades_refugadas > 0),

  -- Motivo da perda
  motivo TEXT NOT NULL,

  -- Origem dos dados (ALCOA+: Rastreabilidade)
  origem_dados VARCHAR(20) DEFAULT 'MANUAL' CHECK (origem_dados IN ('CLP_AUTOMATICO', 'MANUAL', 'TOTVS')),
  totvs_integrado BOOLEAN DEFAULT FALSE,
  totvs_sincronizado_em TIMESTAMP WITH TIME ZONE,

  -- Observações
  observacao TEXT,

  -- Auditoria ALCOA+
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by INTEGER REFERENCES tbusuario(usuario_id),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by INTEGER REFERENCES tbusuario(usuario_id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by INTEGER REFERENCES tbusuario(usuario_id),
  deletado CHAR(1) DEFAULT 'N' CHECK (deletado IN ('S', 'N'))
);

-- Índices
CREATE INDEX idx_apontamento_perdas_lote ON tbapontamento_perdas(lote_id);
CREATE INDEX idx_apontamento_perdas_linha ON tbapontamento_perdas(linhaproducao_id);
CREATE INDEX idx_apontamento_perdas_sku ON tbapontamento_perdas(sku_id);
CREATE INDEX idx_apontamento_perdas_turno ON tbapontamento_perdas(turno_id);
CREATE INDEX idx_apontamento_perdas_data ON tbapontamento_perdas(data_apontamento);
CREATE INDEX idx_apontamento_perdas_tipo ON tbapontamento_perdas(tipo_perda);
CREATE INDEX idx_apontamento_perdas_totvs ON tbapontamento_perdas(totvs_integrado);

-- Comentários
COMMENT ON TABLE tbapontamento_perdas IS 'Apontamentos de perdas de qualidade (refugo, desvios, bloqueios)';
COMMENT ON COLUMN tbapontamento_perdas.tipo_perda IS 'REFUGO, DESVIO ou BLOQUEIO';
COMMENT ON COLUMN tbapontamento_perdas.totvs_integrado IS 'TRUE se já foi sincronizado com TOTVS';
```

### 5.2. tbapontamento_retrabalho (Retrabalho)

Armazena apontamentos de retrabalho (tempo perdido).

```sql
CREATE TABLE tbapontamento_retrabalho (
  apontamento_retrabalho_id SERIAL PRIMARY KEY,
  lote_id INTEGER NOT NULL REFERENCES tblote(lote_id),
  linhaproducao_id INTEGER NOT NULL REFERENCES tblinhaproducao(linhaproducao_id),
  sku_id INTEGER NOT NULL REFERENCES tbsku(sku_id),
  turno_id INTEGER NOT NULL REFERENCES tbturno(turno_id),

  -- Data do apontamento
  data_apontamento DATE NOT NULL,

  -- Tempo de retrabalho
  tempo_retrabalho_minutos INTEGER NOT NULL CHECK (tempo_retrabalho_minutos > 0),

  -- Motivo do retrabalho
  motivo TEXT NOT NULL,

  -- Observações
  observacao TEXT,

  -- Auditoria ALCOA+
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by INTEGER REFERENCES tbusuario(usuario_id),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by INTEGER REFERENCES tbusuario(usuario_id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by INTEGER REFERENCES tbusuario(usuario_id),
  deletado CHAR(1) DEFAULT 'N' CHECK (deletado IN ('S', 'N'))
);

-- Índices
CREATE INDEX idx_apontamento_retrabalho_lote ON tbapontamento_retrabalho(lote_id);
CREATE INDEX idx_apontamento_retrabalho_linha ON tbapontamento_retrabalho(linhaproducao_id);
CREATE INDEX idx_apontamento_retrabalho_sku ON tbapontamento_retrabalho(sku_id);
CREATE INDEX idx_apontamento_retrabalho_turno ON tbapontamento_retrabalho(turno_id);
CREATE INDEX idx_apontamento_retrabalho_data ON tbapontamento_retrabalho(data_apontamento);

-- Comentários
COMMENT ON TABLE tbapontamento_retrabalho IS 'Apontamentos de retrabalho (tempo perdido - afeta Qualidade)';
COMMENT ON COLUMN tbapontamento_retrabalho.tempo_retrabalho_minutos IS 'Tempo gasto em retrabalho (minutos)';
```

## 6. Tabela de Cálculo de OEE

### 6.1. tboee_calculado (OEE Calculado e Consolidado)

Armazena os cálculos de OEE consolidados por período.

```sql
CREATE TABLE tboee_calculado (
  oee_id SERIAL PRIMARY KEY,
  linhaproducao_id INTEGER NOT NULL REFERENCES tblinhaproducao(linhaproducao_id),
  lote_id INTEGER REFERENCES tblote(lote_id), -- NULL para consolidações sem lote específico
  sku_id INTEGER REFERENCES tbsku(sku_id),
  turno_id INTEGER REFERENCES tbturno(turno_id),

  -- Período de referência
  data_referencia DATE NOT NULL,
  tipo_periodo VARCHAR(20) NOT NULL CHECK (tipo_periodo IN ('TURNO', 'DIA', 'SEMANA', 'MES', 'TRIMESTRE', 'ANO')),

  -- Tempos (em horas)
  tempo_calendario NUMERIC(10,4) NOT NULL,
  tempo_disponivel NUMERIC(10,4) NOT NULL,
  tempo_operacao NUMERIC(10,4) NOT NULL,
  tempo_operacional_liquido NUMERIC(10,4) NOT NULL,
  tempo_valioso NUMERIC(10,4) NOT NULL,

  -- Breakdown de paradas (em horas)
  tempo_paradas_estrategicas NUMERIC(10,4) DEFAULT 0,
  tempo_paradas_planejadas NUMERIC(10,4) DEFAULT 0,
  tempo_paradas_nao_planejadas NUMERIC(10,4) DEFAULT 0,
  tempo_retrabalho NUMERIC(10,4) DEFAULT 0,

  -- Unidades
  unidades_produzidas INTEGER NOT NULL,
  unidades_boas INTEGER NOT NULL,
  unidades_refugadas INTEGER DEFAULT 0,
  velocidade_nominal INTEGER NOT NULL,

  -- Componentes do OEE (percentuais 0-100)
  disponibilidade NUMERIC(5,2) NOT NULL CHECK (disponibilidade >= 0 AND disponibilidade <= 100),
  performance NUMERIC(5,2) NOT NULL CHECK (performance >= 0 AND performance <= 100),
  qualidade NUMERIC(5,2) NOT NULL CHECK (qualidade >= 0 AND qualidade <= 100),
  oee NUMERIC(5,2) NOT NULL CHECK (oee >= 0 AND oee <= 100),

  -- Meta e atingimento
  meta_oee NUMERIC(5,2),
  atingiu_meta BOOLEAN GENERATED ALWAYS AS (oee >= COALESCE(meta_oee, 0)) STORED,

  -- Controle de cálculo
  calculado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  recalcular BOOLEAN DEFAULT FALSE, -- Flag para invalidar cache

  -- Auditoria ALCOA+
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by INTEGER REFERENCES tbusuario(usuario_id),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by INTEGER REFERENCES tbusuario(usuario_id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by INTEGER REFERENCES tbusuario(usuario_id),
  deletado CHAR(1) DEFAULT 'N' CHECK (deletado IN ('S', 'N'))
);

-- Índices
CREATE INDEX idx_oee_calculado_linha ON tboee_calculado(linhaproducao_id);
CREATE INDEX idx_oee_calculado_lote ON tboee_calculado(lote_id);
CREATE INDEX idx_oee_calculado_sku ON tboee_calculado(sku_id);
CREATE INDEX idx_oee_calculado_turno ON tboee_calculado(turno_id);
CREATE INDEX idx_oee_calculado_data ON tboee_calculado(data_referencia);
CREATE INDEX idx_oee_calculado_tipo_periodo ON tboee_calculado(tipo_periodo);
CREATE INDEX idx_oee_calculado_recalcular ON tboee_calculado(recalcular) WHERE recalcular = TRUE;

-- Comentários
COMMENT ON TABLE tboee_calculado IS 'OEE calculado e consolidado por período (cache de cálculos)';
COMMENT ON COLUMN tboee_calculado.tipo_periodo IS 'TURNO, DIA, SEMANA, MES, TRIMESTRE, ANO';
COMMENT ON COLUMN tboee_calculado.tempo_calendario IS 'Tempo total do período (horas)';
COMMENT ON COLUMN tboee_calculado.tempo_disponivel IS 'Tempo Calendário - Paradas Estratégicas';
COMMENT ON COLUMN tboee_calculado.tempo_operacao IS 'Tempo Disponível - Paradas de Indisponibilidade';
COMMENT ON COLUMN tboee_calculado.tempo_operacional_liquido IS 'Unidades Produzidas / Velocidade Nominal';
COMMENT ON COLUMN tboee_calculado.tempo_valioso IS '(Qualidade × Tempo Operacional Líquido) / 100';
COMMENT ON COLUMN tboee_calculado.recalcular IS 'TRUE = cache inválido, precisa recalcular';
```

## 7. Tabelas de Indicadores Secundários

### 7.1. tbindicador_mtbf (MTBF - Mean Time Between Failures)

Armazena cálculos de MTBF por equipamento/linha.

```sql
CREATE TABLE tbindicador_mtbf (
  mtbf_id SERIAL PRIMARY KEY,
  linhaproducao_id INTEGER NOT NULL REFERENCES tblinhaproducao(linhaproducao_id),
  codigo_parada_id INTEGER REFERENCES tbcodigo_parada(codigo_parada_id), -- NULL = todas as falhas

  -- Período de referência
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,

  -- Cálculo MTBF
  tempo_total_operacao NUMERIC(10,4) NOT NULL, -- horas
  numero_falhas INTEGER NOT NULL,
  mtbf NUMERIC(10,4) GENERATED ALWAYS AS (
    CASE
      WHEN numero_falhas > 0 THEN tempo_total_operacao / numero_falhas
      ELSE NULL
    END
  ) STORED,

  -- Controle de cálculo
  calculado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Auditoria ALCOA+
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by INTEGER REFERENCES tbusuario(usuario_id),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by INTEGER REFERENCES tbusuario(usuario_id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by INTEGER REFERENCES tbusuario(usuario_id),
  deletado CHAR(1) DEFAULT 'N' CHECK (deletado IN ('S', 'N'))
);

-- Índices
CREATE INDEX idx_mtbf_linha ON tbindicador_mtbf(linhaproducao_id);
CREATE INDEX idx_mtbf_codigo_parada ON tbindicador_mtbf(codigo_parada_id);
CREATE INDEX idx_mtbf_periodo ON tbindicador_mtbf(data_inicio, data_fim);

-- Comentários
COMMENT ON TABLE tbindicador_mtbf IS 'MTBF - Tempo Médio Entre Falhas (indicador secundário)';
COMMENT ON COLUMN tbindicador_mtbf.mtbf IS 'Tempo Total Operação / Número de Falhas (horas)';
```

### 7.2. tbindicador_mttr (MTTR - Mean Time to Repair)

Armazena cálculos de MTTR por equipamento/linha.

```sql
CREATE TABLE tbindicador_mttr (
  mttr_id SERIAL PRIMARY KEY,
  linhaproducao_id INTEGER NOT NULL REFERENCES tblinhaproducao(linhaproducao_id),
  codigo_parada_id INTEGER REFERENCES tbcodigo_parada(codigo_parada_id), -- NULL = todas as falhas

  -- Período de referência
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,

  -- Cálculo MTTR
  tempo_total_reparo NUMERIC(10,4) NOT NULL, -- horas
  numero_falhas INTEGER NOT NULL,
  mttr NUMERIC(10,4) GENERATED ALWAYS AS (
    CASE
      WHEN numero_falhas > 0 THEN tempo_total_reparo / numero_falhas
      ELSE NULL
    END
  ) STORED,

  -- Controle de cálculo
  calculado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Auditoria ALCOA+
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by INTEGER REFERENCES tbusuario(usuario_id),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by INTEGER REFERENCES tbusuario(usuario_id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by INTEGER REFERENCES tbusuario(usuario_id),
  deletado CHAR(1) DEFAULT 'N' CHECK (deletado IN ('S', 'N'))
);

-- Índices
CREATE INDEX idx_mttr_linha ON tbindicador_mttr(linhaproducao_id);
CREATE INDEX idx_mttr_codigo_parada ON tbindicador_mttr(codigo_parada_id);
CREATE INDEX idx_mttr_periodo ON tbindicador_mttr(data_inicio, data_fim);

-- Comentários
COMMENT ON TABLE tbindicador_mttr IS 'MTTR - Tempo Médio para Reparo (indicador secundário)';
COMMENT ON COLUMN tbindicador_mttr.mttr IS 'Tempo Total Reparo / Número de Falhas (horas)';
```

## 8. Resumo de Tabelas Criadas

### Cadastros Base (6 tabelas)
1. `tbdepartamento` - Setores produtivos (4 setores)
2. `tblinhaproducao` - Linhas de produção (37 linhas)
3. `tbturno` - Turnos de trabalho (2 turnos)
4. `tbsku` - Produtos/SKUs
5. `tbsku_velocidade_nominal` - Velocidades nominais por linha+SKU
6. `tbcodigo_parada` - Códigos de paradas (hierarquia 5 níveis)

### Apontamentos (5 tabelas)
7. `tblote` - Lotes de produção
8. `tbapontamento_producao` - Apontamentos de produção
9. `tbapontamento_parada` - Apontamentos de paradas
10. `tbapontamento_perdas` - Apontamentos de perdas (refugo)
11. `tbapontamento_retrabalho` - Apontamentos de retrabalho

### Cálculos e Indicadores (3 tabelas)
12. `tboee_calculado` - OEE calculado e consolidado
13. `tbindicador_mtbf` - MTBF (Tempo Médio Entre Falhas)
14. `tbindicador_mttr` - MTTR (Tempo Médio para Reparo)

**Total: 14 tabelas**

## 9. Próximos Passos

1. **Criar arquivo de relacionamentos e constraints** (`02-relacionamentos-constraints.md`)
2. **Criar arquivo de triggers e functions** (`03-triggers-functions.md`)
3. **Criar arquivo de views e queries** (`04-views-queries.md`)
4. **Criar arquivo de políticas RLS** (`05-row-level-security.md`)
5. **Criar arquivo de dados iniciais** (`06-dados-iniciais.md`)
6. **Criar arquivo de migração** (`07-migration-script.sql`)

## 10. Observações Importantes

### Velocidade Nominal
- **CRÍTICO**: Cada linha possui velocidade nominal diferente para cada SKU
- Não usar capacidade nominal da máquina
- Usar performance qualificada (após validações)
- Tabela `tbsku_velocidade_nominal` permite histórico de velocidades

### Paradas Estratégicas
- **NÃO** entram no tempo disponível para cálculo do OEE
- Fórmula: `Tempo Disponível = Tempo Calendário - Paradas Estratégicas`

### Pequenas Paradas (< 10 minutos)
- Afetam **Performance**, não Disponibilidade
- Campo `impacta_disponibilidade = FALSE` em `tbcodigo_parada`

### Princípios ALCOA+
- Todas as tabelas possuem campos de auditoria completos
- Soft delete obrigatório (`deletado = 'S'`)
- Rastreabilidade de quem criou/atualizou/excluiu
- Timestamps automáticos

### Integridade de Dados
- Foreign keys em todas as relações
- Constraints de validação (CHECK)
- Índices para performance
- Campos calculados (GENERATED ALWAYS AS)


