-- =====================================================
-- Function: fn_get_server_date()
-- Retorna a data atual do servidor no fuso horário de Recife (GMT-3)
-- Usado para validação de datas no frontend
-- Function já existe no banco de dados
-- =====================================================
CREATE OR REPLACE FUNCTION fn_get_server_date()
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'data', (NOW() AT TIME ZONE 'America/Recife')::date,
    'data_hora', NOW() AT TIME ZONE 'America/Recife',
    'timestamp_utc', NOW()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION fn_get_server_date IS 'Retorna data/hora atual do servidor no fuso de Recife (GMT-3) para validação de datas no frontend';
