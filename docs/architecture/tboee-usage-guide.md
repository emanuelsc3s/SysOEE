# Guia de Uso - Tabela `tboee` (Snapshot de OEE)

[← Voltar para Arquitetura](./index.md)

**Última Atualização:** 2025-11-16

---

## 📖 Visão Geral

A tabela `tboee` implementa a estratégia de **snapshot** para armazenamento histórico de cálculos de OEE. Cada registro contém **TODOS os dados necessários** para calcular OEE de forma independente, garantindo:

✅ **Rastreabilidade total** (ALCOA+)
✅ **Imutabilidade** (dados não podem ser alterados)
✅ **Auditabilidade** (histórico completo preservado)
✅ **Performance** (cálculos pré-computados)
✅ **Compliance BPF** (adequado para validação farmacêutica)

---

## 🎯 Conceito de Snapshot

### ❓ Por que Snapshot?

**Problema sem snapshot:**
```
Janeiro/2025: Velocidade = 5000 Und/h, Meta = 85%
Março/2025: Velocidade mudou para 6000 Und/h, Meta = 90%

❌ Ao consultar OEE de Janeiro usando dados atuais:
- Sistema buscaria velocidade = 6000 Und/h (INCORRETO)
- Sistema buscaria meta = 90% (INCORRETO)
- OEE de Janeiro seria calculado erroneamente
```

**Solução com snapshot:**
```
✅ Registro de Janeiro armazena:
- velocidade_nominal = 5000 Und/h (congelado)
- meta_oee = 85% (congelado)
- Todos os tempos e unidades
- OEE já calculado

✅ Mudanças futuras NÃO afetam dados históricos
✅ Recálculos usam dados originais
✅ Auditoria pode validar cálculo a qualquer momento
```

---

## 📊 Estrutura de Dados

### Campos Principais

#### 1. Dimensões (Contexto)
```sql
linhaproducao_id  -- Qual linha
produto_id        -- Qual produto
turno_id          -- Qual turno
data_referencia   -- Qual data
hora_inicio/fim   -- Período exato
```

#### 2. Snapshot de Parâmetros (Congelados no Tempo)
```sql
velocidade_nominal  -- Velocidade VIGENTE na data
meta_oee            -- Meta VIGENTE na data
```

#### 3. Tempos (em minutos)
```sql
tempo_calendario_minutos              -- Tempo total do período
tempo_paradas_estrategicas_minutos    -- Paradas que NÃO entram no OEE
tempo_paradas_planejadas_minutos      -- Setup, manutenção preventiva
tempo_paradas_nao_planejadas_minutos  -- Quebras, falta de insumo
tempo_pequenas_paradas_minutos        -- < 10 min (afeta Performance)
tempo_retrabalho_minutos              -- Tempo de retrabalho
```

#### 4. Tempos Calculados (GENERATED)
```sql
tempo_disponivel_minutos           -- Calendário - Estratégicas
tempo_operacao_minutos             -- Disponível - Paradas
tempo_operacional_liquido_minutos  -- Operação - Pequenas Paradas
tempo_valioso_minutos              -- Op. Líquido - Retrabalho
```

#### 5. Unidades (Produção e Qualidade)
```sql
unidades_produzidas
unidades_boas
unidades_refugadas
unidades_retrabalhadas
```

#### 6. Componentes OEE Calculados (GENERATED)
```sql
disponibilidade     -- %
performance         -- %
qualidade           -- %
oee                 -- %
atingiu_meta        -- BOOLEAN
```

#### 7. Metadados (Rastreabilidade)
```sql
calculo_tipo       -- AUTOMATICO, MANUAL, RECALCULADO
calculado_em       -- Timestamp do cálculo
calculado_por      -- Usuário que calculou
status             -- ATIVO, INVALIDADO, CORRIGIDO
```

---

## 💾 Como Inserir Dados

### Exemplo 1: Inserção Automática (via Trigger/Procedure)

```sql
-- Function que será chamada ao final de cada turno/lote
CREATE OR REPLACE FUNCTION inserir_snapshot_oee(
  p_linhaproducao_id INTEGER,
  p_produto_id INTEGER,
  p_turno_id INTEGER,
  p_data_referencia DATE,
  p_hora_inicio TIME,
  p_hora_fim TIME
) RETURNS INTEGER AS $$
DECLARE
  v_velocidade NUMERIC(10,2);
  v_meta NUMERIC(5,2);
  v_oee_id INTEGER;
BEGIN
  -- Buscar velocidade VIGENTE
  SELECT velocidade INTO v_velocidade
  FROM tbvelocidadenominal
  WHERE linhaproducao_id = p_linhaproducao_id
    AND produto_id = p_produto_id
  LIMIT 1;

  -- Buscar meta VIGENTE (ou padrão 85%)
  SELECT meta_oee INTO v_meta
  FROM tbmetaoee
  WHERE linha_id = p_linhaproducao_id
    AND p_data_referencia BETWEEN data_inicio_vigencia
      AND COALESCE(data_fim_vigencia, '9999-12-31'::DATE)
  ORDER BY data_inicio_vigencia DESC
  LIMIT 1;

  IF v_meta IS NULL THEN
    v_meta := 85.00;  -- Meta padrão
  END IF;

  -- Calcular tempos de paradas (agregar apontamentos)
  WITH paradas AS (
    SELECT
      SUM(CASE WHEN cp.tipo_parada = 'ESTRATEGICA' THEN duracao_minutos ELSE 0 END) AS estrategicas,
      SUM(CASE WHEN cp.tipo_parada = 'PLANEJADA' THEN duracao_minutos ELSE 0 END) AS planejadas,
      SUM(CASE WHEN cp.tipo_parada = 'NAO_PLANEJADA' THEN duracao_minutos ELSE 0 END) AS nao_planejadas,
      SUM(CASE WHEN duracao_minutos < 10 THEN duracao_minutos ELSE 0 END) AS pequenas
    FROM tbapontamentoparada ap
    JOIN tbcodigoparada cp ON ap.codigo_parada_id = cp.codigo_parada_id
    WHERE ap.linhaproducao_id = p_linhaproducao_id
      AND ap.data_parada = p_data_referencia
      AND ap.turno_id = p_turno_id
  ),
  producao AS (
    SELECT
      COALESCE(SUM(unidades_produzidas), 0) AS total_produzido
    FROM tbapontamentoproducao
    WHERE linhaproducao_id = p_linhaproducao_id
      AND data_apontamento = p_data_referencia
      AND turno_id = p_turno_id
  ),
  qualidade AS (
    SELECT
      COALESCE(SUM(CASE WHEN tipo_perda = 'REFUGO' THEN unidades_refugadas ELSE 0 END), 0) AS refugo,
      COALESCE(SUM(CASE WHEN tipo_perda = 'RETRABALHO' THEN tempo_retrabalho_minutos ELSE 0 END), 0) AS retrabalho
    FROM tbapontamentoqualidade
    WHERE linhaproducao_id = p_linhaproducao_id
      AND data_apontamento = p_data_referencia
      AND turno_id = p_turno_id
  )
  -- Inserir snapshot
  INSERT INTO tboee (
    linhaproducao_id,
    produto_id,
    turno_id,
    departamento_id,
    data_referencia,
    hora_inicio,
    hora_fim,
    velocidade_nominal,
    meta_oee,
    tempo_calendario_minutos,
    tempo_paradas_estrategicas_minutos,
    tempo_paradas_planejadas_minutos,
    tempo_paradas_nao_planejadas_minutos,
    tempo_pequenas_paradas_minutos,
    tempo_retrabalho_minutos,
    unidades_produzidas,
    unidades_boas,
    unidades_refugadas,
    calculo_tipo,
    calculado_por
  )
  SELECT
    p_linhaproducao_id,
    p_produto_id,
    p_turno_id,
    (SELECT departamento_id FROM tblinhaproducao WHERE linhaproducao_id = p_linhaproducao_id),
    p_data_referencia,
    p_hora_inicio,
    p_hora_fim,
    v_velocidade,
    v_meta,
    EXTRACT(EPOCH FROM (p_hora_fim - p_hora_inicio)) / 60,  -- Tempo calendário em minutos
    COALESCE(p.estrategicas, 0),
    COALESCE(p.planejadas, 0),
    COALESCE(p.nao_planejadas, 0),
    COALESCE(p.pequenas, 0),
    COALESCE(q.retrabalho, 0),
    COALESCE(pr.total_produzido, 0),
    COALESCE(pr.total_produzido, 0) - COALESCE(q.refugo, 0),  -- Unidades boas
    COALESCE(q.refugo, 0),
    'AUTOMATICO',
    NULL  -- Sistema
  FROM paradas p, producao pr, qualidade q
  RETURNING oee_id INTO v_oee_id;

  RETURN v_oee_id;
END;
$$ LANGUAGE plpgsql;
```

**Chamada:**
```sql
-- Ao final de cada turno
SELECT inserir_snapshot_oee(
  linhaproducao_id := 1,
  produto_id := 100,
  turno_id := 1,
  data_referencia := '2025-11-16',
  hora_inicio := '06:00',
  hora_fim := '14:00'
);
```

---

### Exemplo 2: Inserção Manual (para testes)

```sql
INSERT INTO tboee (
  linhaproducao_id,
  produto_id,
  turno_id,
  departamento_id,
  data_referencia,
  hora_inicio,
  hora_fim,

  -- Snapshot de parâmetros
  velocidade_nominal,
  meta_oee,

  -- Tempos (em minutos)
  tempo_calendario_minutos,
  tempo_paradas_estrategicas_minutos,
  tempo_paradas_planejadas_minutos,
  tempo_paradas_nao_planejadas_minutos,
  tempo_pequenas_paradas_minutos,
  tempo_retrabalho_minutos,

  -- Unidades
  unidades_produzidas,
  unidades_boas,
  unidades_refugadas,

  -- Metadados
  calculo_tipo,
  calculado_por
) VALUES (
  1,           -- Linha A
  100,         -- Produto X
  1,           -- Turno D1
  1,           -- Departamento SPEP
  '2025-11-16',
  '06:00',
  '14:00',

  -- Parâmetros (snapshot)
  5000.00,     -- Velocidade: 5000 Und/h
  85.00,       -- Meta: 85%

  -- Tempos (480 min = 8h)
  480,         -- Tempo calendário: 8h
  0,           -- Paradas estratégicas: 0
  30,          -- Paradas planejadas: 30 min (setup)
  45,          -- Paradas não planejadas: 45 min (quebra)
  20,          -- Pequenas paradas: 20 min
  15,          -- Retrabalho: 15 min

  -- Unidades
  32000,       -- Produzidas: 32.000 unidades
  31500,       -- Boas: 31.500 unidades
  500,         -- Refugo: 500 unidades

  -- Metadados
  'MANUAL',
  1            -- Usuário ID 1
);
```

**Resultado Calculado Automaticamente:**
```
tempo_disponivel_minutos = 480 - 0 = 480 min
tempo_operacao_minutos = 480 - 0 - 30 - 45 = 405 min
tempo_operacional_liquido_minutos = 405 - 20 = 385 min
tempo_valioso_minutos = 385 - 15 = 370 min

disponibilidade = (405 / 480) × 100 = 84.38%
performance = (385 / 405) × 100 = 95.06%
qualidade_unidades = (31500 / 32000) × 100 = 98.44%
qualidade_retrabalho = (390 / 405) × 100 = 96.30%
qualidade = 98.44% × 96.30% / 100 = 94.81%

oee = 84.38% × 95.06% × 94.81% / 10000 = 76.02%

atingiu_meta = 76.02% >= 85% → FALSE
```

---

## 🔍 Como Consultar Dados

### Exemplo 1: OEE de uma Linha em um Dia

```sql
SELECT
  oee_id,
  linhaproducao_id,
  data_referencia,
  hora_inicio,
  hora_fim,
  velocidade_nominal,
  meta_oee,

  -- Componentes
  disponibilidade,
  performance,
  qualidade,
  oee,
  atingiu_meta,

  -- Tempos
  tempo_calendario_minutos / 60.0 AS horas_totais,
  tempo_valioso_minutos / 60.0 AS horas_valiosas,

  -- Unidades
  unidades_produzidas,
  unidades_boas,
  unidades_refugadas

FROM tboee
WHERE linhaproducao_id = 1
  AND data_referencia = '2025-11-16'
  AND status = 'ATIVO'
ORDER BY hora_inicio;
```

---

### Exemplo 2: OEE Médio por Semana

```sql
SELECT
  DATE_TRUNC('week', data_referencia) AS semana,
  linhaproducao_id,
  COUNT(*) AS total_turnos,
  ROUND(AVG(disponibilidade), 2) AS disponibilidade_media,
  ROUND(AVG(performance), 2) AS performance_media,
  ROUND(AVG(qualidade), 2) AS qualidade_media,
  ROUND(AVG(oee), 2) AS oee_medio,
  SUM(CASE WHEN atingiu_meta THEN 1 ELSE 0 END) AS turnos_atingiram_meta
FROM tboee
WHERE data_referencia BETWEEN '2025-01-01' AND '2025-01-31'
  AND status = 'ATIVO'
GROUP BY semana, linhaproducao_id
ORDER BY semana, linhaproducao_id;
```

---

### Exemplo 3: Ranking de Linhas por OEE

```sql
SELECT
  lp.linhaproducao AS linha,
  COUNT(*) AS total_registros,
  ROUND(AVG(o.oee), 2) AS oee_medio,
  ROUND(AVG(o.disponibilidade), 2) AS disponibilidade_media,
  ROUND(AVG(o.performance), 2) AS performance_media,
  ROUND(AVG(o.qualidade), 2) AS qualidade_media,
  ROUND((SUM(CASE WHEN o.atingiu_meta THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100, 2) AS percentual_atingiu_meta
FROM tboee o
JOIN tblinhaproducao lp ON o.linhaproducao_id = lp.linhaproducao_id
WHERE o.data_referencia BETWEEN '2025-11-01' AND '2025-11-30'
  AND o.status = 'ATIVO'
GROUP BY lp.linhaproducao
ORDER BY oee_medio DESC;
```

---

### Exemplo 4: Evolução do OEE (Última 10 Semanas)

```sql
SELECT
  DATE_TRUNC('week', data_referencia)::DATE AS semana,
  ROUND(AVG(oee), 2) AS oee_medio,
  ROUND(AVG(disponibilidade), 2) AS disponibilidade,
  ROUND(AVG(performance), 2) AS performance,
  ROUND(AVG(qualidade), 2) AS qualidade,
  AVG(meta_oee) AS meta
FROM tboee
WHERE linhaproducao_id = 1
  AND data_referencia >= CURRENT_DATE - INTERVAL '10 weeks'
  AND status = 'ATIVO'
GROUP BY semana
ORDER BY semana;
```

---

## 🔄 Correções e Invalidações

### ⚠️ A tabela é APPEND-ONLY (Imutável)

**Não é possível:**
```sql
-- ❌ BLOQUEADO
UPDATE tboee SET unidades_produzidas = 1000 WHERE oee_id = 123;

-- ❌ BLOQUEADO
DELETE FROM tboee WHERE oee_id = 123;
```

**Como corrigir:**

### Opção 1: Invalidar Registro

```sql
-- Marcar registro como inválido
INSERT INTO tboee (
  -- Copiar todos os campos originais
  -- Mas alterar:
  status,
  invalidado_em,
  invalidado_por,
  invalidado_motivo
)
SELECT
  linhaproducao_id,
  produto_id,
  ...,
  'INVALIDADO',  -- status
  NOW(),
  1,             -- user_id
  'Erro no cálculo de paradas'
FROM tboee
WHERE oee_id = 123;
```

### Opção 2: Criar Registro Corrigido

```sql
-- Inserir registro corrigido
INSERT INTO tboee (...)
VALUES (...valores corretos...);

-- Depois invalidar o antigo (opcional)
-- Usar Opção 1 acima
```

---

## 📈 Dashboard e Relatórios

### Query para Gráfico Velocímetro de OEE

```sql
SELECT
  oee,
  meta_oee,
  atingiu_meta,
  CASE
    WHEN oee >= meta_oee THEN 'VERDE'
    WHEN oee >= meta_oee * 0.9 THEN 'AMARELO'
    ELSE 'VERMELHO'
  END AS cor_indicador
FROM tboee
WHERE linhaproducao_id = 1
  AND data_referencia = CURRENT_DATE
  AND status = 'ATIVO'
ORDER BY calculado_em DESC
LIMIT 1;
```

### Query para Gráfico de Componentes OEE

```sql
SELECT
  'Disponibilidade' AS componente,
  disponibilidade AS valor
FROM tboee
WHERE linhaproducao_id = 1
  AND data_referencia = CURRENT_DATE
  AND status = 'ATIVO'
ORDER BY calculado_em DESC
LIMIT 1

UNION ALL

SELECT 'Performance', performance
FROM tboee
WHERE linhaproducao_id = 1
  AND data_referencia = CURRENT_DATE
  AND status = 'ATIVO'
ORDER BY calculado_em DESC
LIMIT 1

UNION ALL

SELECT 'Qualidade', qualidade
FROM tboee
WHERE linhaproducao_id = 1
  AND data_referencia = CURRENT_DATE
  AND status = 'ATIVO'
ORDER BY calculado_em DESC
LIMIT 1;
```

---

## ✅ Checklist de Integração

Ao implementar integração com `tboee`:

- [ ] Buscar velocidade_nominal VIGENTE na data_referencia
- [ ] Buscar meta_oee VIGENTE na data_referencia (ou usar padrão 85%)
- [ ] Agregar TODOS os apontamentos de paradas do período
- [ ] Agregar TODAS as unidades produzidas do período
- [ ] Agregar TODOS os refugos/retrabalhos do período
- [ ] Calcular tempo_calendario_minutos corretamente
- [ ] Classificar paradas corretamente (estratégica, planejada, não planejada, pequena)
- [ ] Preencher metadados (calculo_tipo, calculado_por)
- [ ] Validar constraints (unidades_boas <= unidades_produzidas)
- [ ] Garantir status = 'ATIVO' por padrão

---

## 🔒 Segurança e Compliance

### ALCOA+ Compliance

| Princípio | Como a tboee atende |
|-----------|---------------------|
| **Atribuível** | `calculado_por` registra quem calculou |
| **Legível** | Todos os dados em colunas tipadas |
| **Contemporâneo** | `calculado_em` registra quando foi feito |
| **Original** | Snapshot preserva dados originais (velocidade, meta) |
| **Exato** | Cálculos validados e armazenados |
| **Completo** | Todos os dados necessários presentes |
| **Consistente** | Constraints garantem integridade |
| **Durável** | APPEND-ONLY garante imutabilidade |
| **Disponível** | Índices garantem performance de consulta |

---

## 🎯 Próximos Passos

1. **Executar migration:** `database/migrations/09-tboee-snapshot.sql`
2. **Implementar function de inserção automática**
3. **Criar trigger para chamar function ao final de turno**
4. **Implementar API TypeScript** para consultar `tboee`
5. **Criar componentes de dashboard** usando dados de `tboee`
6. **Testar com registro de exemplo**

---

## 📚 Referências

- **Migration:** `/database/migrations/09-tboee-snapshot.sql`
- **Convenções:** `/docs/architecture/database-conventions.md`
- **Metodologia OEE:** `/docs/project/05-Metodologia-Calculo.md`
- **ALCOA+ Principles:** FDA Guidance for Industry

---

**Dúvidas?** Consulte a documentação ou entre em contato com a equipe de desenvolvimento.
