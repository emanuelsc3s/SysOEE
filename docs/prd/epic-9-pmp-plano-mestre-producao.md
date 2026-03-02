# Epic 9: PMP — Plano Mestre de Produção

[← Voltar ao Índice](./index.md)

---

## Epic 9: PMP — Plano Mestre de Produção

**Objetivo:** Criar módulo de Planejamento Mestre de Produção permitindo que o Gestor PCP registre e revise o plano mensal de produção por linha e SKU, com previsão de horas calculada automaticamente a partir das velocidades nominais, gestão de headcount por linha cruzando planejado vs atual (via `tbfuncionario`) e dashboard de aderência planejado x realizado integrado ao OEE executado.

---

### Contexto e Motivação

O TOTVS (ERP) não possui planejamento de produção futuro — ordens são abertas apenas quando a produção já vai acontecer. A Diretoria necessita de visibilidade antecipada sobre o que será produzido no mês/semana, por linha e por SKU, incluindo previsão de horas e recursos de mão de obra (headcount). Atualmente esse planejamento não existe em nenhum sistema, sendo realizado informalmente.

O PMP será um **módulo novo no SysOEE**, sem dependência de integração com TOTVS para dados futuros. O realizado (para comparação) continuará vindo dos dados de OEE já existentes no sistema.

---

### Workflow do Processo

```
Gestor PCP cria Plano Mensal
         ↓
   Distribui por Linha + SKU + Semana
         ↓
   Sistema calcula Horas Planejadas (qtd / velocidade_nominal)
         ↓
   Configura Headcount desejado por Linha (lotação + cargo)
         ↓
   Sistema mostra Headcount Atual (tbfuncionario, ativo=true)
         ↓
   Toda sexta-feira: Ivan + PCP revisam e ajustam plano
         ↓
   Dashboard mostra Planejado × Realizado (OEE executado)
```

---

### Story 9.1: Migration — Tabelas tbpmp_plano, tbpmp_item, tbpmp_headcount

**Como** desenvolvedor do sistema,
**Eu quero** criar as tabelas de banco de dados do módulo PMP,
**Para que** os dados de planejamento sejam persistidos com integridade referencial e padrão de auditoria do projeto.

#### Acceptance Criteria

1. Tabela `tbpmp_plano` criada com: `pmp_id`, `ano`, `mes`, `descricao`, campos de auditoria, `ativo`
2. Constraint `UNIQUE(ano, mes)` em `tbpmp_plano` (um plano ativo por mês)
3. Tabela `tbpmp_item` criada com FKs para `tbpmp_plano`, `tblinhaproducao`, `tbproduto`
4. Campos `qtd_planejada`, `horas_planejadas`, `semana` (1-5), `dt_inicio`, `dt_fim` em `tbpmp_item`
5. Constraint `UNIQUE(pmp_id, linhaproducao_id, produto_id, semana)` em `tbpmp_item`
6. Tabela `tbpmp_headcount` criada com FKs para `tbpmp_plano`, `tblinhaproducao`, campos `lotacao_id`, `lotacao`, `cargo_id`, `cargo`, `headcount_desejado`
7. Todos os campos de auditoria seguem padrão `tblinhaproducao`: `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by` (integer → `tbusuario.usuario_id`)
8. Índices criados para otimização de consultas frequentes
9. Migrations executadas sem erros no Supabase

---

### Story 9.2: API TypeScript — PMP

**Como** desenvolvedor do sistema,
**Eu quero** criar a camada de serviços TypeScript para o módulo PMP,
**Para que** o frontend consuma endpoints tipados e as regras de negócio sejam centralizadas.

#### Acceptance Criteria

1. Arquivo `src/services/api/pmp.api.ts` criado com funções para CRUD de plano, itens e headcount
2. Ao salvar `tbpmp_item`, `horas_planejadas` é calculado: busca `velocidade` em `tbvelocidadenominal` WHERE `linhaproducao_id` E `produto_id`, divide `qtd_planejada / velocidade`
3. Aviso retornado quando velocidade nominal não está cadastrada para o par linha/SKU
4. Ao consultar `tbpmp_headcount`, `headcount_atual` é calculado via: `COUNT(tbfuncionario WHERE lotacao_id AND cargo_id AND ativo = true AND dt_rescisao IS NULL)`
5. Consulta de "planejado x realizado" cruza dados de `tbpmp_item` com dados de produção do OEE existente
6. Acesso restrito: apenas usuários com `tbusuario.perfil != 'Operador'`
7. Tipos TypeScript definidos em `src/types/pmp.ts`

---

### Story 9.3: Frontend — Cadastro e Revisão de Plano Mensal

**Como** Gestor PCP,
**Eu quero** criar e revisar o plano de produção mensal por linha, SKU e semana,
**Para que** as metas de produção do mês estejam formalizadas e atualizadas.

#### Acceptance Criteria

1. Rota `/pmp` acessível para `perfil != 'Operador'`
2. Lista de planos com: mês/ano, última revisão (data + usuário), botão "Abrir"
3. Botão "Novo Plano" → modal com campos mês, ano, descrição
4. Tela de edição do plano com tabela de itens: Linha | SKU | Semana | Qtd Planejada | Horas Planejadas (calculado)
5. Adicionar/editar item: selecionar linha, SKU, semana (1-5), dt_início, dt_fim, qtd planejada; horas calculadas ao selecionar linha+SKU
6. Aviso visual quando velocidade nominal não está cadastrada para o par linha/SKU selecionado
7. Cada edição grava `updated_at = NOW()` e `updated_by = usuário logado`
8. Header do plano exibe: "Última revisão: [data] por [nome]"
9. Sem fluxo de aprovação — alteração vigente imediatamente

---

### Story 9.4: Frontend — Configuração de Headcount por Linha

**Como** Gestor PCP,
**Eu quero** definir a lotação, o cargo e a quantidade desejada de operadores por linha,
**Para que** o sistema compare automaticamente o headcount planejado com os colaboradores ativos.

#### Acceptance Criteria

1. Seção "Headcount" dentro da tela de edição do plano
2. Por linha: selecionar lotação (dropdown de valores distintos de `tbfuncionario.lotacao`) + cargo (filtrado pela lotação) + headcount desejado (número)
3. Sistema exibe `headcount_atual` em tempo real: `COUNT(tbfuncionario WHERE lotacao_id AND cargo_id AND ativo = true)`
4. Exibição de gap: `desejado - atual` — ≥ 0 em verde, negativo em vermelho (déficit)
5. Permitir múltiplos registros por linha (ex: 2 Operadores de Envase + 1 Técnico de Qualidade)
6. Cada registro pode ser editado e removido independentemente

---

### Story 9.5: Frontend — Dashboard PMP (Planejado × Realizado)

**Como** Diretor ou Gestor PCP,
**Eu quero** visualizar o plano de produção versus o executado,
**Para que** eu possa avaliar a aderência ao planejamento.

#### Acceptance Criteria

1. Rota `/pmp/dashboard` acessível para `perfil != 'Operador'`
2. Filtros: mês, semana, linha, departamento
3. Tabela com colunas: Linha | SKU | Qtd Planejada | Qtd Realizada | % Aderência | Horas Planejadas | Horas Realizadas | HC Desejado | HC Atual
4. `Qtd Realizada` e `Horas Realizadas` provêm dos dados de produção do OEE (tabelas existentes)
5. Sinalização de % Aderência: < 85% vermelho, 85-94% amarelo, ≥ 95% verde
6. KPIs no topo: Aderência Geral do Mês (%), Total Horas Planejadas vs Realizadas, Linhas com Déficit de Headcount
7. Acesso: `perfil != 'Operador'`

---

### Story 9.6: Exportação Excel e PDF do Plano

**Como** Gestor PCP ou Diretor,
**Eu quero** exportar o plano de produção para Excel e PDF,
**Para que** eu possa utilizar na reunião de revisão semanal de sexta-feira.

#### Acceptance Criteria

1. Botão "Exportar" disponível na tela do plano e no dashboard
2. Seleção de período: mês completo ou semana específica
3. **Excel**: abas "Plano de Produção" (linha, SKU, semanas, quantidades, horas) e "Headcount" (linha, lotação, cargo, desejado, atual, gap); formatação pt-BR (separador decimal vírgula)
4. **PDF**: layout tabular, cabeçalho com mês/ano e data de geração, logo do sistema
5. Ambos os formatos incluem: linha, SKU, semanas, qtd planejada, horas planejadas, HC desejado, HC atual
6. Usar biblioteca padrão do projeto para geração (XLSX + jsPDF/html2canvas)

---

### Modelo de Dados

```sql
-- Cabeçalho do Plano Mensal
CREATE TABLE tbpmp_plano (
  pmp_id        SERIAL PRIMARY KEY,
  ano           INTEGER NOT NULL,
  mes           INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  descricao     TEXT,
  ativo         BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'America/Fortaleza'),
  created_by    INTEGER REFERENCES tbusuario(usuario_id),
  updated_at    TIMESTAMP WITHOUT TIME ZONE,
  updated_by    INTEGER REFERENCES tbusuario(usuario_id),
  deleted_at    TIMESTAMP WITHOUT TIME ZONE,
  deleted_by    INTEGER REFERENCES tbusuario(usuario_id),
  UNIQUE (ano, mes)
);

-- Itens do Plano (linha + produto + semana)
CREATE TABLE tbpmp_item (
  item_id           SERIAL PRIMARY KEY,
  pmp_id            INTEGER NOT NULL REFERENCES tbpmp_plano(pmp_id),
  linhaproducao_id  INTEGER NOT NULL REFERENCES tblinhaproducao(linhaproducao_id),
  produto_id        INTEGER NOT NULL REFERENCES tbproduto(produto_id),
  semana            INTEGER NOT NULL CHECK (semana BETWEEN 1 AND 5),
  dt_inicio         DATE NOT NULL,
  dt_fim            DATE NOT NULL,
  qtd_planejada     NUMERIC(15,4) NOT NULL,
  horas_planejadas  NUMERIC(10,2),  -- calculado: qtd_planejada / tbvelocidadenominal.velocidade
  created_at        TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'America/Fortaleza'),
  created_by        INTEGER REFERENCES tbusuario(usuario_id),
  updated_at        TIMESTAMP WITHOUT TIME ZONE,
  updated_by        INTEGER REFERENCES tbusuario(usuario_id),
  deleted_at        TIMESTAMP WITHOUT TIME ZONE,
  deleted_by        INTEGER REFERENCES tbusuario(usuario_id),
  UNIQUE (pmp_id, linhaproducao_id, produto_id, semana)
);

-- Headcount planejado por linha
CREATE TABLE tbpmp_headcount (
  headcount_id        SERIAL PRIMARY KEY,
  pmp_id              INTEGER NOT NULL REFERENCES tbpmp_plano(pmp_id),
  linhaproducao_id    INTEGER NOT NULL REFERENCES tblinhaproducao(linhaproducao_id),
  lotacao_id          INTEGER NOT NULL,
  lotacao             TEXT,
  cargo_id            INTEGER NOT NULL,
  cargo               TEXT,
  headcount_desejado  INTEGER NOT NULL,
  -- headcount_atual: calculado via query em runtime (não armazenado)
  created_at          TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'America/Fortaleza'),
  created_by          INTEGER REFERENCES tbusuario(usuario_id),
  updated_at          TIMESTAMP WITHOUT TIME ZONE,
  updated_by          INTEGER REFERENCES tbusuario(usuario_id)
);
```

**Cálculo de `horas_planejadas`:**
```sql
SELECT qtd_planejada / v.velocidade AS horas_planejadas
FROM tbpmp_item i
JOIN tbvelocidadenominal v
  ON v.linhaproducao_id = i.linhaproducao_id
 AND v.produto_id = i.produto_id
 AND v.deletado = 'N'
```

**Cálculo de `headcount_atual`:**
```sql
SELECT COUNT(*) AS headcount_atual
FROM tbfuncionario
WHERE lotacao_id = :lotacao_id
  AND cargo_id   = :cargo_id
  AND ativo      = true
  AND dt_rescisao IS NULL
```

---

### Controle de Acesso

| Perfil | Acesso |
|--------|--------|
| Operador | ❌ Sem acesso ao módulo PMP |
| Supervisor | ✅ Visualizar e editar |
| Gestor | ✅ Visualizar e editar |
| PCP | ✅ Visualizar e editar (criador principal) |
| Diretor | ✅ Visualizar e editar |
| Admin | ✅ Acesso completo |

**Regra:** `tbusuario.perfil != 'Operador'`

---

### Compatibilidade e Riscos

- [x] Tabelas existentes (`tblinhaproducao`, `tbproduto`, `tbvelocidadenominal`, `tbfuncionario`) permanecem inalteradas
- [x] Database schema changes são apenas aditivos (3 novas tabelas)
- [x] UI segue padrões existentes (Tailwind + Shadcn/UI)
- [x] Nenhuma alteração em APIs existentes de OEE
- [⚠️] Se velocidade nominal não cadastrada para o par linha/SKU, `horas_planejadas` fica `null` — sistema deve alertar o usuário

---

### Dependências

**Bloqueadores para desenvolvimento:**
- Tabelas `tblinhaproducao`, `tbproduto` e `tbvelocidadenominal` já existem ✅
- Tabela `tbfuncionario` com campos `lotacao_id`, `cargo_id`, `ativo` já existe ✅
- `tbusuario.perfil` para controle de acesso já existe ✅

**Sequência recomendada:**
```
Story 9.1 (Migration DB)
  └─ Story 9.2 (API TypeScript)
       ├─ Story 9.3 (Frontend Cadastro Plano) ──────┐
       ├─ Story 9.4 (Frontend Headcount)             ├─ Story 9.5 (Dashboard)
       └─ (ambas podem ser paralelas)    ────────────┘
                                                      └─ Story 9.6 (Exportação)
```

---

**Fim do Epic 9**

Este epic adiciona capacidade de planejamento ao SysOEE, fechando o ciclo PDCA: Planejar (PMP) → Fazer (Apontamentos OEE) → Checar (Dashboard Planejado×Realizado) → Agir (Revisão semanal PCP).

---
