# 4) Persistência e Modelo de Dados

## 4.1 Objetivo de persistência

Persistir retrabalho de modo:

- **Auditável (ALCOA+)**: autor, timestamp, histórico de alterações.
- **Calculável**: obter $T_{rt}$ por turno/dia/semana/mês.
- **Não ambíguo**: usar data+hora (timestamp) para evitar problemas com turnos e meia-noite.

> Nota: no MVP atual (localStorage), o retrabalho é persistido com `tempoRetrabalho` em horas, porém a tela ainda não coleta esse valor e o salva como `0`.

## 4.2 Entidade recomendada: evento de qualidade (tipo RETRABALHO)

Recomendação: retrabalho ser persistido como um **evento de Qualidade**, não como parada.

Motivo: evita que qualquer agregação automática de “paradas” contamine a Disponibilidade.

## 4.3 Modelo mínimo (relacional)

Se o projeto usa uma tabela única para perdas de qualidade (ex.: `tbapontamentoqualidade`), então o retrabalho deve ter:

- `tipo_perda = 'RETRABALHO'`
- `inicio_retrabalho` (timestamp com fuso)
- `fim_retrabalho` (timestamp com fuso)
- `duracao_minutos` (opcional, mas recomendado para auditoria e performance)

Além de chaves de contexto:

- `apontamento_producao_id` (ou OP/lote/linha/turno)
- `lote_id`, `linha_id`, `turno_id`

E auditoria:

- `criado_por`, `criado_por_nome`, `created_at`, `updated_at`

## 4.4 Exemplo de DDL (PostgreSQL)

> Observação: ajuste nomes conforme o seu esquema real.

```sql
-- Tipo enumerado para perdas de qualidade
CREATE TYPE tipo_perda_qualidade_enum AS ENUM (
  'RETRABALHO',
  'REFUGO',
  'DESVIO',
  'BLOQUEIO'
);

CREATE TABLE tbapontamentoqualidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- contexto
  apontamento_producao_id UUID NOT NULL,
  lote_id UUID NOT NULL,
  linha_id UUID NOT NULL,
  turno_id INTEGER NOT NULL,

  tipo_perda tipo_perda_qualidade_enum NOT NULL,

  -- retrabalho (intervalo)
  inicio_retrabalho TIMESTAMPTZ,
  fim_retrabalho TIMESTAMPTZ,
  duracao_minutos INTEGER CHECK (duracao_minutos IS NULL OR duracao_minutos >= 0),

  -- campos recomendados
  unidades_retrabalho INTEGER CHECK (unidades_retrabalho IS NULL OR unidades_retrabalho >= 0),
  motivo_retrabalho TEXT,

  -- perdas por unidades (para REFUGO/DESVIO/BLOQUEIO)
  unidades_perdidas INTEGER CHECK (unidades_perdidas IS NULL OR unidades_perdidas >= 0),
  motivo_perda TEXT,

  observacao TEXT,

  -- auditoria
  criado_por INTEGER NOT NULL,
  criado_por_nome VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT ck_retrabalho_campos
  CHECK (
    (tipo_perda = 'RETRABALHO'
      AND inicio_retrabalho IS NOT NULL
      AND fim_retrabalho IS NOT NULL
      AND fim_retrabalho > inicio_retrabalho)
    OR
    (tipo_perda IN ('REFUGO', 'DESVIO', 'BLOQUEIO')
      AND unidades_perdidas IS NOT NULL
      AND unidades_perdidas > 0)
  )
);
```

## 4.5 Cálculo de duração no back-end

Mesmo registrando início/fim, recomenda-se calcular `duracao_minutos` no back-end para:

- padronizar cálculo
- evitar manipulação do front-end
- melhorar performance de agregações

Pseudo-regra:

- `duracao_minutos = floor((fim - inicio) / 60s)`

## 4.6 Agregação do tempo de retrabalho (para Qualidade_Retrabalho)

Para o período do apontamento (turno/dia):

- $T_{rt}$ = soma de `duracao_minutos` dos eventos `tipo_perda='RETRABALHO'` / 60

## 4.7 Persistência em LocalStorage (quando aplicável)

Se o MVP estiver operando inicialmente com LocalStorage, o formato atual implementado é:

- Chave: `sysoee_apontamentos_retrabalho`
- Estrutura (resumo):
  - `id`
  - `apontamentoProducaoId`
  - `unidadesRetrabalho`
  - `tempoRetrabalho` (horas)
  - `motivoRetrabalho`
  - `observacao`
  - `criadoPor`, `criadoPorNome`, `created_at`, `updated_at`

Recomendação para migração futura sem perda de aderência à especificação:

- Manter `tempoRetrabalho` (em horas) como campo obrigatório para cálculo.
- Evoluir para o registro por intervalo (início/fim) quando o fluxo regulado exigir maior rastreabilidade.
- Sempre persistir autor e timestamp (ALCOA+) com identificador estável (`id`).
