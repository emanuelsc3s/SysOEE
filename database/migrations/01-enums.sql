-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Script: 01-enums.sql
-- Descrição: Tipos ENUM customizados
-- Versão: 1.0
-- Data: 2025-10-25
-- =====================================================

-- Executar este script PRIMEIRO antes de criar tabelas

-- =====================================================
-- ENUMS
-- =====================================================

-- Tipo de linha de produção
CREATE TYPE tipo_linha_enum AS ENUM ('ENVASE', 'EMBALAGEM');
COMMENT ON TYPE tipo_linha_enum IS 'Tipo de linha: ENVASE (envasadoras) ou EMBALAGEM (embaladoras)';

-- Tipo de usuário
CREATE TYPE tipo_usuario_enum AS ENUM (
  'OPERADOR',      -- Operador de linha
  'SUPERVISOR',    -- Supervisor de turno
  'ENCARREGADO',   -- Encarregado de setor
  'GESTOR',        -- Gerente/Coordenador
  'ADMIN'          -- Administrador do sistema
);
COMMENT ON TYPE tipo_usuario_enum IS 'Perfis de usuário do sistema (controla RLS policies)';

-- Status de lote
CREATE TYPE status_lote_enum AS ENUM (
  'PLANEJADO',      -- Lote planejado mas não iniciado
  'EM_ANDAMENTO',   -- Lote em produção
  'CONCLUIDO',      -- Lote finalizado
  'CANCELADO'       -- Lote cancelado
);
COMMENT ON TYPE status_lote_enum IS 'Status do ciclo de vida de um lote de produção';

-- Tipo de parada (conforme metodologia OEE)
CREATE TYPE tipo_parada_enum AS ENUM (
  'ESTRATEGICA',     -- Não entra no tempo disponível (decisão gerencial)
  'PLANEJADA',       -- Manutenção preventiva, setup programado
  'NAO_PLANEJADA'    -- Quebras, falhas, falta de insumo
);
COMMENT ON TYPE tipo_parada_enum IS 'Classificação de paradas conforme impacto no OEE';

-- Fonte de dados de produção
CREATE TYPE fonte_dados_enum AS ENUM (
  'CLP_AUTOMATICO',  -- Dados automáticos do CLP (Bottelpack, Pró Maquia, etc.)
  'MANUAL',          -- Apontamento manual do operador
  'TOTVS'            -- Sincronizado do ERP TOTVS
);
COMMENT ON TYPE fonte_dados_enum IS 'Origem dos dados de produção (ALCOA+ - rastreabilidade)';

-- Tipo de perda de qualidade
CREATE TYPE tipo_perda_qualidade_enum AS ENUM (
  'REFUGO',      -- Unidades descartadas (não conformes)
  'DESVIO',      -- Desvio de especificação
  'BLOQUEIO'     -- Produto bloqueado pela Qualidade
);
COMMENT ON TYPE tipo_perda_qualidade_enum IS 'Tipos de perdas de qualidade';

-- Operação de auditoria
CREATE TYPE operacao_audit_enum AS ENUM (
  'INSERT',
  'UPDATE',
  'DELETE'
);
COMMENT ON TYPE operacao_audit_enum IS 'Tipo de operação auditada (ALCOA+ - rastreabilidade)';

-- Status de insumo
CREATE TYPE status_insumo_enum AS ENUM (
  'EM_ESTOQUE',  -- Disponível no estoque
  'EM_USO',      -- Em uso na produção
  'ESGOTADO',    -- Esgotado
  'BLOQUEADO'    -- Bloqueado pela Qualidade
);
COMMENT ON TYPE status_insumo_enum IS 'Status do lote de insumo';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- Próximo script: 02-tables.sql
