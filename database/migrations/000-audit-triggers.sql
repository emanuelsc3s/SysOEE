-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Script: 000-audit-triggers.sql
-- Descrição: Trigger universal para updated_at (ALCOA+)
-- Versão: 1.0
-- Data: 2025-10-26
-- =====================================================

-- Este script deve ser executado APÓS 01-enums.sql e 02-tables.sql
-- mas ANTES de 03-functions.sql

-- =====================================================
-- TRIGGER FUNCTION PARA UPDATED_AT
-- Atualiza automaticamente o campo updated_at em UPDATEs
-- =====================================================

-- NOTA: A função update_updated_at_column() já existe em 03-functions.sql
-- Este arquivo serve para documentar o padrão de auditoria centralizado

-- =====================================================
-- PADRÃO DE CAMPOS DE AUDITORIA (ALCOA+)
-- =====================================================

/*
  CAMPOS OBRIGATÓRIOS EM TODAS AS TABELAS:

  1. INTEGRAÇÃO COM TOTVS/SICFAR:
     sync VARCHAR(1),
     sync_data TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),

  2. AUDITORIA BÁSICA (ALCOA+):
     created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
     created_by BIGINT REFERENCES tbusuario(id),
     updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Fortaleza'),
     updated_by BIGINT REFERENCES tbusuario(id),
     deleted_at TIMESTAMP WITHOUT TIME ZONE,
     deleted_by BIGINT REFERENCES tbusuario(id)

  NOTAS:
  - Timezone: America/Fortaleza (sede da Farmace)
  - Soft-delete via deleted_at (NUNCA fazer DELETE físico em dados de produção)
  - created_by/updated_by referenciam tbusuario(id)
  - sync indica sincronização: S=sincronizado, N=pendente, NULL=não aplicável
*/

-- =====================================================
-- COMENTÁRIOS PADRÃO
-- =====================================================

COMMENT ON COLUMN tbdepartamento.sync IS 'Status de sincronização TOTVS: S=sincronizado, N=pendente, NULL=não aplicável';
COMMENT ON COLUMN tbdepartamento.sync_data IS 'Data/hora da última sincronização com TOTVS';
COMMENT ON COLUMN tbdepartamento.created_at IS 'Data/hora de criação do registro (ALCOA+)';
COMMENT ON COLUMN tbdepartamento.created_by IS 'Usuário que criou o registro (ALCOA+: Atribuível)';
COMMENT ON COLUMN tbdepartamento.updated_at IS 'Data/hora da última atualização (ALCOA+)';
COMMENT ON COLUMN tbdepartamento.updated_by IS 'Usuário que atualizou o registro (ALCOA+: Atribuível)';
COMMENT ON COLUMN tbdepartamento.deleted_at IS 'Data/hora de exclusão lógica (soft-delete)';
COMMENT ON COLUMN tbdepartamento.deleted_by IS 'Usuário que excluiu logicamente o registro';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
