# Data Models

[← Voltar para Índice](./index.md)

## 2. Data Models

### Visão Geral da Modelagem

Baseado nos requisitos do projeto, identificamos **15 entidades principais** divididas em três categorias:

**Cadastros (Entidades Mestres):**
1. Setor
2. Linha de Produção
3. SKU (Produto)
4. Insumo
5. Lote de Insumo
6. Velocidade Nominal
7. Código de Parada
8. Turno
9. Usuário/Operador
10. Meta OEE

**Transações (Dados Operacionais):**
11. Lote de Produção
12. Apontamento de Parada
13. Apontamento de Produção
14. Apontamento de Qualidade

**Cache e Auditoria (ALCOA+):**
15. OEE Calculado
16. Audit Log

### Diagrama de Relacionamentos (ER Conceitual)

```
SETOR (1) ─────< (N) LINHA_PRODUCAO
                        │
                        ├─────< (N) VELOCIDADE_NOMINAL >───── (N) SKU
                        │
                        ├─────< (N) CODIGO_PARADA
                        │
                        ├─────< (N) META_OEE
                        │
                        └─────< (N) LOTE_PRODUCAO >───── (N) SKU
                                     │             └───── (N) TURNO
                                     │
                                     ├─────< (N) APONTAMENTO_PARADA >───── CODIGO_PARADA
                                     │                                └───── TURNO
                                     │                                └───── USUARIO (operador)
                                     │                                └───── USUARIO (supervisor)
                                     │
                                     ├─────< (N) APONTAMENTO_PRODUCAO >───── TURNO
                                     │                                  └───── USUARIO
                                     │
                                     └─────< (N) APONTAMENTO_QUALIDADE >───── TURNO
                                                                          └───── USUARIO

USUARIO ─────< (N) AUDIT_LOG

INSUMO (1) ─────< (N) LOTE_INSUMO
```

### Entidades Detalhadas

#### 1. Setor

**Propósito:** Agrupa linhas de produção por área produtiva da Farmace. Cada setor tem características e processos específicos.

**Key Attributes:**
- `id`: UUID - Identificador único
- `codigo`: STRING(10) - Código do setor (ex: "SPEP", "SPPV", "CPHD", "LIQUIDOS")
- `nome`: STRING(100) - Nome completo
- `descricao`: TEXT - Descrição detalhada
- `ativo`: BOOLEAN
- `created_at`, `created_by`, `updated_at`, `updated_by` - Auditoria ALCOA+

**Relationships:**
- Um Setor possui muitas Linhas de Produção (1:N)

#### 2. Linha de Produção

**Propósito:** Representa cada linha de envase/embalagem. MVP: 37 linhas. Cada linha tem seu "book de paradas" e pode produzir múltiplos SKUs.

**Key Attributes:**
- `id`: UUID
- `setor_id`: UUID (FK → Setor)
- `codigo`: STRING(20) - Código único (ex: "SPEP-ENV-A")
- `nome`: STRING(100)
- `tipo`: ENUM - "ENVASE" ou "EMBALAGEM"
- `localizacao`: STRING(200)
- `tem_clp`: BOOLEAN
- `tipo_clp`: STRING(50) - "Bottelpack", "Pró Maquia", "Bausch Strobbel"
- `meta_oee_padrao`: DECIMAL(5,2) - Meta padrão de OEE (%)
- `ativo`: BOOLEAN
- Campos de auditoria

**Relationships:**
- Pertence a um Setor (N:1)
- Possui muitas Velocidades Nominais (1:N)
- Possui muitos Códigos de Parada (1:N)
- Possui muitos Lotes de Produção (1:N)
- Possui muitas Metas OEE (1:N)

#### 3. SKU (Produto)

**Propósito:** Produtos fabricados. Cada SKU tem velocidade nominal diferente por linha.

**Key Attributes:**
- `id`: UUID
- `codigo_totvs`: STRING(50) UNIQUE - Código no ERP
- `nome`: STRING(200)
- `descricao`: TEXT
- `unidade_medida`: STRING(10)
- `categoria`: STRING(50)
- `ativo`: BOOLEAN
- `totvs_sincronizado_em`: TIMESTAMP
- Campos de auditoria

**Relationships:**
- Possui muitas Velocidades Nominais (1:N)
- Possui muitos Lotes de Produção (1:N)

#### 4. Insumo

**Propósito:** Insumos (matérias-primas, embalagens) utilizados na produção.

**Key Attributes:**
- `id`: UUID
- `codigo_totvs`: STRING(50) UNIQUE
- `nome`: STRING(200)
- `descricao`: TEXT
- `unidade_medida`: STRING(10)
- `categoria`: STRING(50)
- `ativo`: BOOLEAN
- `totvs_sincronizado_em`: TIMESTAMP
- Campos de auditoria

**Relationships:**
- Possui muitos Lotes de Insumo (1:N)

#### 5. Lote de Insumo

**Propósito:** Lotes de insumos recebidos de Compras (sincronizados do TOTVS).

**Key Attributes:**
- `id`: UUID
- `numero_lote`: STRING(50) UNIQUE
- `insumo_id`: UUID (FK)
- `quantidade`: DECIMAL(12,3)
- `data_fabricacao`, `data_validade`: DATE
- `fornecedor`: STRING(200)
- `status`: ENUM - "EM_ESTOQUE", "EM_USO", "ESGOTADO", "BLOQUEADO"
- `totvs_sincronizado_em`: TIMESTAMP
- Campos de auditoria

#### 6. Velocidade Nominal

**Propósito:** **CRÍTICO** - Velocidade de produção (Und/h) de cada SKU em cada linha. Essencial para cálculo de Performance.

**Key Attributes:**
- `id`: UUID
- `linha_id`, `sku_id`: UUID (FK)
- `velocidade_nominal`: DECIMAL(10,2) - Unidades por hora
- `data_inicio_vigencia`, `data_fim_vigencia`: DATE - Histórico
- `observacao`: TEXT
- `aprovado_por`: UUID (FK → Usuario) - Aprovação Diretoria
- `aprovado_em`: TIMESTAMP
- Campos de auditoria

**Constraints:**
- UNIQUE (linha_id, sku_id, data_inicio_vigencia)
- CHECK (data_fim_vigencia >= data_inicio_vigencia)

**Observação:** Sistema usa velocidade vigente na data do lote para cálculos retroativos.

#### 7. Código de Parada

**Propósito:** Códigos de paradas com hierarquia de 5 níveis (TPM - 16 Grandes Perdas). Cada linha tem seu "book" específico.

**Key Attributes:**
- `id`: UUID
- `linha_id`: UUID (FK) - NULL = parada global
- `codigo`: STRING(20)
- `descricao`: STRING(200)
- `nivel_1_classe`: STRING(50) - "Planejada", "Não Planejada", "Estratégica"
- `nivel_2_grande_parada`: STRING(100) - "Manutenção", "Falta de Insumo"
- `nivel_3_apontamento`: STRING(100)
- `nivel_4_grupo`: STRING(100) - "Mecânica", "Elétrica"
- `nivel_5_detalhamento`: STRING(200)
- `tipo_parada`: ENUM - "ESTRATEGICA", "PLANEJADA", "NAO_PLANEJADA"
- `impacta_disponibilidade`: BOOLEAN - FALSE = afeta Performance (< 10 min)
- `tempo_minimo_registro`: INTEGER (minutos)
- `ativo`: BOOLEAN
- Campos de auditoria

**Regra de Negócio:** Paradas < 10 min afetam Performance, não Disponibilidade.

#### 8. Turno

**Propósito:** Turnos de trabalho (D1, N1, etc.).

**Key Attributes:**
- `id`: UUID
- `codigo`: STRING(10) - "D1", "N1"
- `nome`: STRING(50)
- `hora_inicio`, `hora_fim`: TIME
- `duracao_horas`: DECIMAL(4,2)
- `ativo`: BOOLEAN
- Campos de auditoria

#### 9. Usuário/Operador

**Propósito:** Usuários do sistema. **ALCOA+: Atribuível** - todo registro deve ter autor.

**Key Attributes:**
- `id`: UUID - Supabase Auth UUID
- `email`: STRING(255) UNIQUE
- `nome_completo`: STRING(200)
- `matricula`: STRING(20) UNIQUE
- `tipo_usuario`: ENUM - "OPERADOR", "SUPERVISOR", "ENCARREGADO", "GESTOR", "ADMIN"
- `setor_id`, `linha_id`: UUID (FK) - Opcional
- `ativo`: BOOLEAN
- `created_at`, `updated_at`

**Integração Supabase:**
- Tabela custom vinculada a `auth.users` do Supabase

#### 10. Meta OEE

**Propósito:** Metas de OEE por linha com histórico de vigência.

**Key Attributes:**
- `id`: UUID
- `linha_id`: UUID (FK)
- `meta_oee`: DECIMAL(5,2) - Percentual (0-100)
- `data_inicio_vigencia`, `data_fim_vigencia`: DATE
- `observacao`: TEXT
- `aprovado_por`: UUID (FK)
- `aprovado_em`: TIMESTAMP
- `ativo`: BOOLEAN
- Campos de auditoria

**Constraints:**
- UNIQUE (linha_id, data_inicio_vigencia)

#### 11. Lote de Produção

**Propósito:** Lotes produzidos. Criado automaticamente quando OP é aberta no TOTVS.

**Key Attributes:**
- `id`: UUID
- `numero_lote`: STRING(50) UNIQUE
- `linha_id`, `sku_id`, `turno_id`: UUID (FK)
- `data_producao`: DATE
- `hora_inicio`, `hora_fim`: TIME
- `producao_inicial`: INTEGER - Quantidade quando turno iniciou
- `producao_atual`: INTEGER - Produzido no turno
- `unidades_produzidas`, `unidades_boas`, `unidades_refugo`: INTEGER - Calculados
- `tempo_retrabalho_minutos`: INTEGER - Calculado
- `status`: ENUM - "PLANEJADO", "EM_ANDAMENTO", "CONCLUIDO", "CANCELADO"
- `origem_totvs_op`: STRING(50) - Número da OP
- `totvs_sincronizado_em`: TIMESTAMP
- `conferido_por_supervisor`: UUID (FK) - Assinatura eletrônica
- `conferido_em`: TIMESTAMP
- Campos de auditoria

**Observação:** Campos calculados atualizados via triggers quando apontamentos são inseridos.

#### 12. Apontamento de Parada

**Propósito:** **CRÍTICO - ALCOA+** - Registro contemporâneo de paradas.

**Key Attributes:**
- `id`: UUID
- `linha_id`, `lote_id`, `codigo_parada_id`, `turno_id`: UUID (FK)
- `data_parada`: DATE
- `hora_inicio`, `hora_fim`: TIME
- `duracao_minutos`: INTEGER - Calculado automaticamente
- `observacao`: TEXT
- `criado_por_operador`: UUID (FK) - ALCOA+ Atribuível
- `conferido_por_supervisor`: UUID (FK)
- `conferido_em`: TIMESTAMP
- Campos de auditoria

**Regras:**
- Contemporaneidade: hora_inicio deve estar no turno atual (tolerância 5 min)
- Todas paradas devem ser registradas, mesmo < 10 min

#### 13. Apontamento de Produção

**Propósito:** Registro de produção (CLP automático ou manual).

**Key Attributes:**
- `id`: UUID
- `lote_id`, `linha_id`, `turno_id`: UUID (FK)
- `data_apontamento`: DATE
- `hora_apontamento`: TIME
- `unidades_produzidas`: INTEGER
- `fonte_dados`: ENUM - "CLP_AUTOMATICO", "MANUAL", "TOTVS"
- `clp_timestamp`: TIMESTAMP - Timestamp original do CLP (ALCOA+ Original)
- `observacao`: TEXT
- Campos de auditoria

**Integração:** Dados de CLP preservam timestamp original.

#### 14. Apontamento de Qualidade

**Propósito:** Perdas de qualidade (refugo, retrabalho).

**Key Attributes:**
- `id`: UUID
- `lote_id`, `linha_id`, `turno_id`: UUID (FK)
- `data_apontamento`: DATE
- `tipo_perda`: ENUM - "REFUGO", "RETRABALHO", "DESVIO", "BLOQUEIO"
- `unidades_refugadas`: INTEGER (se REFUGO)
- `tempo_retrabalho_minutos`: INTEGER (se RETRABALHO)
- `motivo`: TEXT
- `origem_dados`: ENUM - "MANUAL", "TOTVS"
- `totvs_integrado`: BOOLEAN
- `totvs_timestamp`: TIMESTAMP
- Campos de auditoria

**Regra:** Refugo DEVE ser sincronizado com TOTVS antes de concluir lote.

#### 15. OEE Calculado

**Propósito:** Cache de cálculos de OEE para performance.

**Key Attributes:**
- `id`: UUID
- `linha_id`, `lote_id`, `sku_id`, `turno_id`: UUID (FK)
- `data_referencia`: DATE
- Tempos (horas): `tempo_calendario`, `tempo_disponivel`, `tempo_operacao`, `tempo_operacional_liquido`, `tempo_valioso`
- Breakdown paradas: `tempo_paradas_estrategicas`, `tempo_paradas_planejadas`, `tempo_paradas_nao_planejadas`, `tempo_retrabalho`
- Unidades: `unidades_produzidas`, `unidades_boas`, `unidades_refugadas`, `velocidade_nominal`
- Componentes OEE: `disponibilidade`, `performance`, `qualidade`, `oee` (%)
- `meta_oee`: DECIMAL(5,2)
- `atingiu_meta`: BOOLEAN - Calculado automaticamente
- `calculado_em`: TIMESTAMP
- `recalcular`: BOOLEAN - Flag para invalidar cache

**Trigger:** Populado automaticamente quando lote muda para status CONCLUIDO.

#### 16. Audit Log

**Propósito:** **ALCOA+ Compliance** - Rastreia TODAS alterações em dados críticos. Tabela IMUTÁVEL.

**Key Attributes:**
- `id`: UUID
- `tabela`: STRING(100)
- `registro_id`: UUID
- `operacao`: ENUM - "INSERT", "UPDATE", "DELETE"
- `campo_alterado`: STRING(100)
- `valor_anterior`, `valor_novo`: TEXT
- `usuario_id`: UUID (FK) - ALCOA+ Atribuível
- `timestamp`: TIMESTAMP - ALCOA+ Contemporâneo
- `ip_address`: INET
- `user_agent`: TEXT
- `motivo_alteracao`: TEXT - Obrigatório para UPDATE/DELETE críticos

**Implementação:**
- PostgreSQL Triggers automáticos
- Tabela append-only (sem UPDATE/DELETE via RULE)

---

