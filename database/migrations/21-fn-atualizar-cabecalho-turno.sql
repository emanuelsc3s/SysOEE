-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Script: 21-fn-atualizar-cabecalho-turno.sql
-- Descrição: Atualiza cabeçalho do turno OEE e propaga para detalhes
-- Versão: 1.0
-- Data: 2026-02-04
-- =====================================================

CREATE OR REPLACE FUNCTION fn_atualizar_cabecalho_turno(
  p_oeeturno_id BIGINT,
  p_data DATE,
  p_turno_id INTEGER,
  p_turno TEXT,
  p_turno_hi TIME WITHOUT TIME ZONE,
  p_turno_hf TIME WITHOUT TIME ZONE,
  p_linhaproducao_id INTEGER,
  p_linhaproducao TEXT,
  p_departamento_id INTEGER,
  p_departamento TEXT,
  p_produto_id INTEGER,
  p_produto TEXT,
  p_velocidade NUMERIC,
  p_updated_at TIMESTAMP WITHOUT TIME ZONE,
  p_updated_by_usuario BIGINT,
  p_updated_by UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_at TIMESTAMP WITHOUT TIME ZONE;
BEGIN
  IF p_oeeturno_id IS NULL THEN
    RAISE EXCEPTION 'oeeturno_id é obrigatório';
  END IF;

  IF p_updated_by_usuario IS NULL THEN
    RAISE EXCEPTION 'updated_by do turno (tbusuario) é obrigatório';
  END IF;

  IF p_updated_by IS NULL THEN
    RAISE EXCEPTION 'updated_by (auth.users) é obrigatório';
  END IF;

  v_updated_at := COALESCE(p_updated_at, (now() AT TIME ZONE 'America/Fortaleza'));

  -- Atualiza cabeçalho do turno (tboee_turno)
  UPDATE tboee_turno
  SET
    data = p_data,
    turno_id = p_turno_id,
    turno = p_turno,
    turno_hi = p_turno_hi,
    turno_hf = p_turno_hf,
    linhaproducao_id = p_linhaproducao_id,
    linhaproducao = p_linhaproducao,
    produto_id = p_produto_id,
    produto = p_produto,
    updated_at = v_updated_at,
    updated_by = p_updated_by_usuario
  WHERE oeeturno_id = p_oeeturno_id
    AND deletado = 'N';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Turno OEE não encontrado ou deletado: %', p_oeeturno_id;
  END IF;

  -- Atualiza produção vinculada
  UPDATE tboee_turno_producao
  SET
    data = p_data,
    turno_id = p_turno_id,
    turno = p_turno,
    linhaproducao_id = p_linhaproducao_id,
    linhaproducao = p_linhaproducao,
    departamento_id = p_departamento_id,
    departamento = p_departamento,
    produto_id = p_produto_id,
    produto = p_produto,
    velocidade = p_velocidade,
    updated_at = v_updated_at,
    updated_by = p_updated_by
  WHERE oeeturno_id = p_oeeturno_id
    AND deletado = 'N';

  -- Atualiza perdas vinculadas
  UPDATE tboee_turno_perda
  SET
    data = p_data,
    turno_id = p_turno_id,
    linhaproducao_id = p_linhaproducao_id,
    updated_at = v_updated_at,
    updated_by = p_updated_by
  WHERE oeeturno_id = p_oeeturno_id
    AND deletado = 'N';

  -- Atualiza paradas vinculadas
  UPDATE tboee_turno_parada
  SET
    data = p_data,
    turno_id = p_turno_id,
    linhaproducao_id = p_linhaproducao_id,
    updated_at = v_updated_at,
    updated_by = p_updated_by
  WHERE oeeturno_id = p_oeeturno_id
    AND deletado = 'N';

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION fn_atualizar_cabecalho_turno(
  BIGINT,
  DATE,
  INTEGER,
  TEXT,
  TIME WITHOUT TIME ZONE,
  TIME WITHOUT TIME ZONE,
  INTEGER,
  TEXT,
  INTEGER,
  TEXT,
  INTEGER,
  TEXT,
  NUMERIC,
  TIMESTAMP WITHOUT TIME ZONE,
  BIGINT,
  UUID
) IS 'Atualiza o cabeçalho do turno OEE e propaga data/turno/linha para produção, perdas e paradas em transação única.';

GRANT EXECUTE ON FUNCTION fn_atualizar_cabecalho_turno(
  BIGINT,
  DATE,
  INTEGER,
  TEXT,
  TIME WITHOUT TIME ZONE,
  TIME WITHOUT TIME ZONE,
  INTEGER,
  TEXT,
  INTEGER,
  TEXT,
  INTEGER,
  TEXT,
  NUMERIC,
  TIMESTAMP WITHOUT TIME ZONE,
  BIGINT,
  UUID
) TO authenticated;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
