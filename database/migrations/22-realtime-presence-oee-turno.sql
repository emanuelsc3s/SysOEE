-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Migration 22: Realtime Presence para oee-turno
-- =====================================================
--
-- Objetivo:
-- Permitir Presence em canais privados do padrão "oee-turno:<id>"
-- para usuários autenticados.
--
-- Observação:
-- Esta migration é idempotente (não recria políticas existentes).

alter table realtime.messages enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'realtime'
      and tablename = 'messages'
      and policyname = 'realtime_select_oee_turno_presence'
  ) then
    create policy realtime_select_oee_turno_presence
      on realtime.messages
      for select
      to authenticated
      using (realtime.topic() like 'oee-turno:%');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'realtime'
      and tablename = 'messages'
      and policyname = 'realtime_insert_oee_turno_presence'
  ) then
    create policy realtime_insert_oee_turno_presence
      on realtime.messages
      for insert
      to authenticated
      with check (realtime.topic() like 'oee-turno:%');
  end if;
end
$$;
