# 16 - Modelagem de Banco (Supabase/Postgres) para OEE

Este documento consolida uma proposta de **modelagem relacional** para armazenar no **Supabase (Postgres)** todos os dados usados nas telas de apontamento e consulta de OEE:

- `src/pages/ApontamentoOEE.tsx`
- `src/pages/OeeTurno.tsx`
- serviços localStorage: `src/services/localStorage/apontamento-oee.storage.ts` e `src/services/localStorage/parada.storage.ts`

O objetivo é **substituir a persistência em localStorage** por uma base auditável e rastreável, alinhada a **ALCOA+**.

---

## 1. Princípios e premissas

1) **Chave de agregação principal** do apontamento é o contexto operacional do turno:

- **data_producao** (DATE)
- **turno** (FK)
- **linha** (FK)
- **sku/produto** (FK)

2) A entidade que “amarra” tudo isso é o **Lote/Sessão de Produção** (tabela `tblote`), que nasce quando a OP é aberta (TOTVS) **ou** quando o operador inicia o apontamento manual (fallback controlado).

3) Paradas e qualidade podem existir:

- vinculadas a um lote (quando se aplica à OP/lote atual)
- ou apenas à linha/turno/data (ex.: parada global sem lote) — desde que isso esteja permitido e bem definido.

4) **Auditabilidade/ALCOA+**:

- todo dado transacional deve ter: `created_at`, `created_by`
- alterações devem ter: `updated_at`, `updated_by`
- exclusões devem ser preferencialmente **lógicas**: `deleted_at`, `deleted_by` (evitar hard delete)
- registros críticos (parada/diário de bordo) podem exigir **assinatura/conferência** (supervisor)

---

## 2. Entidades essenciais (ERD textual)

Abaixo está a visão “mínima viável” para suportar as duas telas.

### 2.1 Cadastros (dimensões)

#### `tbdepartamento`
- representa setores (SPEP, SPPV, CPHD, Líquidos)

#### `tblinha`
- representa a linha operacional usada na UI (ex.: “SPEP01 - Envase A”)
- FK: `departamento_id`
- atributos típicos: `codigo`, `nome`, `tipo` (envase/embalagem), `tem_clp`, `tipo_clp`, `meta_oee_padrao`, `ativo`

#### `tbproduto` (ou SKU)
- representa SKU/produto apontado
- importante ter uma chave estável para integração com TOTVS (ex.: `erp_codigo`)

#### `tbturno`
- turnos do dia com código/nome/janelas

#### `tbcodigoparada`
- catálogo de códigos de parada (com hierarquia e flags)
- importante: possuir sinalização de **parada estratégica** (para excluir do tempo disponível)

### 2.2 Operacionais (transações)

#### `tblote`
Unidade principal de agregação do turno na prática.

Campos recomendados (já existem nas migrations):
- `id` (UUID)
- `numero_lote` (pode ser OP do TOTVS ou um número gerado quando manual)
- `linha_id`, `produto_id`, `turno_id`
- `data_producao`, `hora_inicio`, `hora_fim`
- contadores: `producao_inicial`, `producao_atual`
- campos calculados (por trigger): `unidades_produzidas`, `unidades_boas`, `unidades_refugo`, `tempo_retrabalho_minutos`
- assinatura: `conferido_por_supervisor`, `conferido_em`

Uso na UI:
- ao **iniciar** um turno na tela `ApontamentoOEE`, deve existir (ou ser criado) um `tblote` correspondente ao contexto do apontamento.

#### `tbapontamentoproducao`
Registros de produção por horário/intervalo.

Campos (já existem):
- `lote_id`, `linha_id`, `turno_id`, `data_apontamento`
- `hora_apontamento`
- `unidades_produzidas` (interpretação recomendada: **delta** no intervalo)
- `fonte_dados` (CLP ou MANUAL)

**Ponto crítico (UI vs DB):**
- a UI trabalha com `horaInicio` e `horaFim` por linha de apontamento.

Opções de modelagem (escolher uma):
- **Opção A (mínima, sem alterar tabela):** usar `hora_apontamento = hora_inicio` (ou `hora_fim`) e derivar a janela via configuração do turno/grade. Mantém schema atual, mas perde rastreabilidade explícita do intervalo.
- **Opção B (recomendada):** adicionar colunas `hora_inicio` e `hora_fim` (ou criar uma tabela `tbapontamentoproducao_intervalo`). Preserva exatamente o que a UI coleta.

#### `tbapontamentoparada`
Registros contemporâneos de paradas.

Campos (já existem):
- `linha_id`, `turno_id`, `data_parada`, `hora_inicio`, `hora_fim`
- `duracao_minutos` (gerada)
- `codigo_parada_id`
- `lote_id` (NULL permitido)
- `criado_por_operador` (atribuição ALCOA+)
- assinatura/conferência: `conferido_por_supervisor`, `conferido_em`

Uso na UI:
- a tela registra paradas por linha/turno/data e usa isso no cálculo de OEE.

#### `tbapontamentoqualidade`
Registros de refugo e retrabalho.

Campos (já existem):
- `lote_id`, `linha_id`, `turno_id`, `data_apontamento`
- `tipo_perda` (REFUGO/RETRABALHO etc)
- `unidades_refugadas` e/ou `tempo_retrabalho_minutos`
- `motivo`

**Ponto crítico (UI vs DB):**
- a UI guarda `apontamentoProducaoId` dentro do registro de qualidade.

Opções:
- **Opção A (mínima):** manter vínculo só com `lote_id` e tratar qualidade como agregada ao lote.
- **Opção B (recomendada p/ rastreabilidade):** adicionar coluna `apontamento_producao_id` (FK para `tbapontamentoproducao.id`).

### 2.3 Cálculos e performance

#### `tboeecalculado` (cache)
- cache por `linha_id`, `lote_id`, `turno_id`, `data_referencia`
- recomendado usar como leitura de performance na tela `OeeTurno` e/ou em dashboards

#### `tboee_snapshot` (fechamento)
- snapshot gerado na finalização do turno/lote (RPC), garantindo reprodutibilidade do “fechamento”

---

## 3. Mapeamento direto: UI/localStorage → Supabase

### 3.1 `ApontamentoOEE.tsx` (produção)

A UI salva um DTO semelhante a:
- `data` (DATE)
- `turno` (string/identificador)
- `linhaId`
- `skuCodigo`
- `horaInicio` / `horaFim`
- `quantidadeProduzida`

Proposta:
1) Resolver/garantir `lote_id`:
   - buscar `tblote` por `(data_producao, turno_id, linha_id, produto_id)` e `status = EM_ANDAMENTO`
   - se não existir, criar `tblote` (modo manual controlado)
2) Inserir em `tbapontamentoproducao`:
   - `lote_id`, `linha_id`, `turno_id`, `data_apontamento`
   - `hora_apontamento` (ver Opção A/B)
   - `unidades_produzidas = quantidadeProduzida`
   - `fonte_dados = 'MANUAL'`

### 3.2 `ApontamentoOEE.tsx` (paradas)

A UI cria registros com:
- `linhaId`, `turno`, `data`
- `horaInicio` / `horaFim`
- `codigoParadaId` + motivo

Proposta:
- Inserir em `tbapontamentoparada`:
  - `linha_id`, `turno_id`, `data_parada`, `hora_inicio`, `hora_fim`
  - `codigo_parada_id`
  - `lote_id` (se aplicável)
  - `criado_por_operador = auth.uid()` (ou tabela de usuários do domínio)

### 3.3 `ApontamentoOEE.tsx` (qualidade)

A UI armazena:
- `tipo`: PERDA/RETRABALHO
- `quantidade`
- `motivo`
- `apontamentoProducaoId`

Proposta:
- Inserir em `tbapontamentoqualidade`:
  - `lote_id`, `linha_id`, `turno_id`, `data_apontamento`
  - `tipo_perda` (mapear para enum: REFUGO/RETRABALHO)
  - `unidades_refugadas` OU `tempo_retrabalho_minutos`
  - `motivo`
- Opcional (recomendado): armazenar `apontamento_producao_id` para rastreabilidade.

### 3.4 `OeeTurno.tsx` (listagem)

Hoje a tela:
- lê todos os apontamentos do localStorage
- para cada apontamento, calcula OEE agregando produção/qualidade/paradas

No Supabase, o recomendado é:
- listar por **lote** (ou por combinação data+turno+linha+sku)
- consumir uma **view** ou **RPC** que já retorne:
  - tempos agregados
  - quantidades agregadas
  - disponibilidade/performance/qualidade/oee

Exemplo de visão:
- `vw_oee_por_turno_lote` retornando 1 linha por `tblote.id`

---

## 4. Regras de cálculo (alinhamento com a metodologia)

Pontos que precisam estar refletidos no modelo e/ou no cálculo no banco:

- todas as conversões em **horas**
- **paradas estratégicas** não entram em tempo disponível (precisa flag em `tbcodigoparada`)
- **pequenas paradas (< 10 min)** impactam performance, não disponibilidade
  - isso depende do `duracao_minutos`, portanto o cálculo precisa considerar o tempo de cada parada

---

## 5. Índices recomendados

Para performance e relatórios:

- `tblote`: índice em `(data_producao, turno_id, linha_id, produto_id)`
- `tbapontamentoproducao`: índice em `(lote_id, data_apontamento)` e `(linha_id, turno_id, data_apontamento)`
- `tbapontamentoparada`: índice em `(linha_id, turno_id, data_parada)` e `(lote_id)`
- `tbapontamentoqualidade`: índice em `(lote_id, data_apontamento)`

---

## 6. RLS e segurança (Supabase)

Recomendação de alto nível:

- Operador:
  - SELECT/INSERT nas transações (`tbapontamentoproducao/parada/qualidade`) apenas para sua linha (ou linhas do seu departamento)
  - UPDATE restrito (ex.: não permitir alterar registros conferidos por supervisor)
- Supervisor/Encarregado:
  - SELECT do departamento
  - permissão para “conferir/assinar” (`conferido_por_supervisor`, `conferido_em`)

Para isso, normalmente é necessário um cadastro de perfil associado ao `auth.users`.

---

## 7. Pontos de atenção nas migrations atuais (diagnóstico)

Durante a análise do workspace, foram identificadas **inconsistências** que precisam ser resolvidas para o schema ser executável no Supabase:

1) A maioria das tabelas transacionais referencia `tblinha(id)` (UUID), mas o script também cria `tblinhaproducao` (PK integer) e **não há** `CREATE TABLE tblinha` nas migrations.

2) Existem FKs para `tbusuario(id)` em várias tabelas (`created_by`, `criado_por_operador`, etc), porém `tbusuario` é criado com PK `usuario_id`.

3) A modelagem de produção na UI usa `horaInicio/horaFim`, enquanto `tbapontamentoproducao` possui apenas `hora_apontamento`.

Sugestão:
- decidir um “padrão único” de IDs e tabelas mestras (principalmente linha e usuário)
- só então consolidar as migrations e as políticas RLS.

---

## 8. Próximos passos sugeridos

1) Definir a decisão sobre produção:
   - manter `hora_apontamento` (Opção A) ou persistir intervalos (Opção B)
2) Definir como a UI obtém `lote_id` (preferível: criar/selecionar lote ao iniciar o turno)
3) Consolidar schema (corrigir `tblinha` e `tbusuario`) e ajustar RLS
4) Criar view/RPC para `OeeTurno` consumir OEE já calculado
