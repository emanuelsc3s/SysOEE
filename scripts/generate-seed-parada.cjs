// Script para gerar 21-seed-tboee-parada.sql a partir de data/paradas-oee.json
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'data', 'paradas-oee.json');
const outPath = path.join(__dirname, '..', 'database', 'migrations', '21-seed-tboee-parada.sql');

const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Escapar aspas simples para SQL
const jsonStr = JSON.stringify(json, null, 2).replace(/'/g, "''");

const sql = `-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Script: 21-seed-tboee-parada.sql
-- Descricao: Seed/sync dos tipos de parada OEE
-- Fonte: data/paradas-oee.json
-- Registros: ${json.length}
-- Data: 2026-03-03
-- =====================================================
-- Logica: MERGE (upsert) usando 'codigo' como chave
--   - WHEN MATCHED     -> UPDATE dos campos (preserva oeeparada_id)
--   - WHEN NOT MATCHED -> INSERT do registro completo
-- Mapeamento de campos:
--   impacto      -> componente
--   apontamento  -> parada
-- =====================================================

MERGE INTO public.tboee_parada AS target
USING (
  SELECT *
  FROM json_to_recordset('${jsonStr}'::json) AS t(
    codigo        TEXT,
    impacto       TEXT,
    classe        TEXT,
    natureza      TEXT,
    grande_parada TEXT,
    apontamento   TEXT,
    descricao     TEXT
  )
) AS source ON target.codigo = source.codigo
WHEN MATCHED THEN
  UPDATE SET
    componente    = source.impacto,
    classe        = source.classe,
    natureza      = source.natureza,
    grande_parada = source.grande_parada,
    parada        = source.apontamento,
    descricao     = source.descricao,
    updated_at    = NOW() AT TIME ZONE 'America/Fortaleza'
WHEN NOT MATCHED THEN
  INSERT (codigo, componente, classe, natureza, grande_parada, parada, descricao)
  VALUES (
    source.codigo,
    source.impacto,
    source.classe,
    source.natureza,
    source.grande_parada,
    source.apontamento,
    source.descricao
  );

-- =====================================================
-- VERIFICACAO (execute apos o MERGE)
-- =====================================================
-- SELECT COUNT(*) FROM public.tboee_parada;
-- SELECT componente, COUNT(*) FROM public.tboee_parada GROUP BY componente ORDER BY componente;
-- SELECT classe, COUNT(*) FROM public.tboee_parada GROUP BY classe ORDER BY classe;
-- SELECT oeeparada_id, codigo, componente, classe, grande_parada, parada
--   FROM public.tboee_parada ORDER BY codigo LIMIT 30;
`;

fs.writeFileSync(outPath, sql, 'utf-8');
console.log(`Gerado: ${outPath}`);
console.log(`Registros: ${json.length}`);
console.log(`Tamanho: ${(sql.length / 1024).toFixed(1)} KB`);
