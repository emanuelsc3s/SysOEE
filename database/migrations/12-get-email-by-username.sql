-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Script: 12-get-email-by-username.sql
-- Descrição: Função RPC para obter email do usuário pelo login
-- Versão: 1.0
-- Data: 2026-01-29
-- =====================================================

-- IMPORTANTE:
-- - Esta função é usada no login quando o usuário informa o login (não o email)
-- - Retorna apenas o email (dados mínimos)
-- - Acesso controlado via SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.get_email_by_username(username text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_email text;
BEGIN
  IF username IS NULL OR btrim(username) = '' THEN
    RETURN NULL;
  END IF;

  SELECT au.email
    INTO v_email
    FROM public.tbusuario tu
    JOIN auth.users au ON au.id = tu.user_id
   WHERE tu.login = btrim(username)
     AND tu.deletado = 'N'
   LIMIT 1;

  RETURN v_email;
END;
$$;

-- Segurança: remover permissões gerais e liberar apenas para anon/authenticated
REVOKE ALL ON FUNCTION public.get_email_by_username(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO anon, authenticated;
