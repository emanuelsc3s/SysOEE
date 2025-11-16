-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Script: 08-tbfuncionario.sql
-- Descrição: Cadastro de funcionários (integração RH)
-- Versão: 1.0
-- Data: 2025-11-16
-- =====================================================

-- =====================================================
-- TBFUNCIONARIO
-- Cadastro completo de funcionários da empresa
-- Origem: Sistema de RH / Integração TOTVS
-- =====================================================

CREATE TABLE IF NOT EXISTS tbfuncionario (
  funcionario_id SERIAL NOT NULL,

  -- ========================================
  -- IDENTIFICAÇÃO PESSOAL
  -- ========================================
  emp_codigo TEXT NULL,  -- Código da empresa (multi-empresa)
  matricula TEXT NULL,
  nome TEXT NULL,
  nome_social TEXT NULL,
  cpf VARCHAR(14) NOT NULL,
  pis VARCHAR(15) NULL,
  dtnascimento DATE NULL,
  sexo TEXT NULL,

  -- Estado civil
  estadocivil_id INTEGER NULL,
  estadocivil_descricao VARCHAR(50) NULL,

  -- Filiação
  mae_nome TEXT NULL,
  pai_nome TEXT NULL,

  -- ========================================
  -- CONTATO
  -- ========================================
  email TEXT NULL,
  ddd VARCHAR(3) NULL,
  fone VARCHAR(15) NULL,
  celular VARCHAR(15) NULL,

  -- ========================================
  -- ENDEREÇO
  -- ========================================
  endereco TEXT NULL,
  numero TEXT NULL,
  complemento TEXT NULL,
  bairro TEXT NULL,
  cep VARCHAR(9) NULL,
  cidade_id INTEGER NULL,
  cidade_nome VARCHAR(100) NULL,
  cidade_uf VARCHAR(2) NULL,

  -- ========================================
  -- DOCUMENTAÇÃO TRABALHISTA
  -- ========================================

  -- CTPS
  ctps_numero VARCHAR(20) NULL,
  ctps_serie VARCHAR(10) NULL,
  ctps_dv VARCHAR(2) NULL,
  uf_ctps VARCHAR(2) NULL,
  ctps_dtexpedicao DATE NULL,

  -- RG
  identidade_numero VARCHAR(20) NULL,
  identidade_orgao_expedidor VARCHAR(20) NULL,
  identidade_dtexpedicao DATE NULL,

  -- Título de Eleitor
  titulo VARCHAR(20) NULL,
  zona VARCHAR(10) NULL,
  secao VARCHAR(10) NULL,

  -- ========================================
  -- DADOS ADMISSIONAIS
  -- ========================================
  admissao_data DATE NULL,
  admissao_tipo VARCHAR(2) NULL,
  admissao_tipo_esocial VARCHAR(2) NULL,
  admissao_vinculo VARCHAR(2) NULL,
  dt_rescisao DATE NULL,

  -- ========================================
  -- DEFICIÊNCIA (PCD)
  -- ========================================
  tem_deficiencia BOOLEAN NULL DEFAULT FALSE,
  preenche_cota_deficiencia BOOLEAN NULL DEFAULT FALSE,
  deficiencia_fisica BOOLEAN NULL DEFAULT FALSE,
  deficiencia_visual BOOLEAN NULL DEFAULT FALSE,
  deficiencia_auditiva BOOLEAN NULL DEFAULT FALSE,
  deficiencia_mental BOOLEAN NULL DEFAULT FALSE,
  deficiencia_intelectual BOOLEAN NULL DEFAULT FALSE,

  -- ========================================
  -- FORMAÇÃO E CARGO
  -- ========================================
  grau_instrucao VARCHAR(2) NULL,
  grauinstrucao_desc TEXT NULL,

  -- Cargo
  cargo_id INTEGER NULL,
  cargo TEXT NULL,
  cargo_codigo TEXT NULL,

  -- Função
  funcao_id INTEGER NULL,
  funcao TEXT NULL,
  funcao_codigo TEXT NULL,

  -- Lotação/Setor
  lotacao_id INTEGER NULL,
  lotacao TEXT NULL,
  lotacao_codigo TEXT NULL,

  -- ========================================
  -- STATUS
  -- ========================================
  ativo BOOLEAN NULL DEFAULT TRUE,

  -- ========================================
  -- AUDITORIA
  -- ========================================
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL,

  -- ========================================
  -- CONSTRAINTS
  -- ========================================
  CONSTRAINT tbfuncionario_pkey PRIMARY KEY (funcionario_id)
);

-- ========================================
-- COMENTÁRIOS
-- ========================================

COMMENT ON TABLE tbfuncionario IS 'Cadastro completo de funcionários (integração RH/TOTVS)';
COMMENT ON COLUMN tbfuncionario.funcionario_id IS 'ID único do funcionário';
COMMENT ON COLUMN tbfuncionario.emp_codigo IS 'Código da empresa (para ambientes multi-empresa)';
COMMENT ON COLUMN tbfuncionario.matricula IS 'Matrícula do funcionário na empresa';
COMMENT ON COLUMN tbfuncionario.nome_social IS 'Nome social do funcionário (respeito à identidade de gênero)';
COMMENT ON COLUMN tbfuncionario.tem_deficiencia IS 'Funcionário possui alguma deficiência (PCD)';
COMMENT ON COLUMN tbfuncionario.preenche_cota_deficiencia IS 'Funcionário é contabilizado na cota de PCD';
COMMENT ON COLUMN tbfuncionario.lotacao_id IS 'Setor/departamento de lotação do funcionário';
COMMENT ON COLUMN tbfuncionario.dt_rescisao IS 'Data de rescisão (NULL se ativo)';

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Busca por nome (usando trigram para busca fuzzy)
CREATE INDEX IF NOT EXISTS idx_tbfuncionario_nome
  ON tbfuncionario USING gin (nome gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_tbfuncionario_nome_social
  ON tbfuncionario USING gin (nome_social gin_trgm_ops);

-- Busca exata
CREATE INDEX IF NOT EXISTS idx_tbfuncionario_email
  ON tbfuncionario USING btree (email);

CREATE INDEX IF NOT EXISTS idx_tbfuncionario_matricula
  ON tbfuncionario USING btree (matricula);

CREATE INDEX IF NOT EXISTS idx_tbfuncionario_emp_codigo
  ON tbfuncionario USING btree (emp_codigo);

-- Filtros comuns
CREATE INDEX IF NOT EXISTS idx_tbfuncionario_ativo
  ON tbfuncionario USING btree (ativo);

CREATE INDEX IF NOT EXISTS idx_tbfuncionario_admissao_data
  ON tbfuncionario USING btree (admissao_data);

CREATE INDEX IF NOT EXISTS idx_tbfuncionario_dt_rescisao
  ON tbfuncionario USING btree (dt_rescisao);

-- ========================================
-- EXTENSÃO NECESSÁRIA (trigram para busca fuzzy)
-- ========================================

-- Criar extensão se ainda não existe
CREATE EXTENSION IF NOT EXISTS pg_trgm;

COMMENT ON EXTENSION pg_trgm IS 'Suporte para busca fuzzy de texto (LIKE %termo%)';

-- ========================================
-- FIM DO SCRIPT
-- ========================================
