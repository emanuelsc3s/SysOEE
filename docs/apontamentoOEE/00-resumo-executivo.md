# Resumo Executivo - Banco de Dados Supabase para Sistema OEE SicFar

## Visão Geral

Este documento apresenta um resumo executivo dos requisitos de banco de dados para o Sistema OEE SicFar, baseado na análise completa do componente `ApontamentoOEE.tsx` e da documentação do projeto.

## Estrutura de Documentação

```
docs/apontamentoOEE/
├── 00-resumo-executivo.md                    # Este arquivo
├── 01-requisitos-banco-dados-supabase.md     # Especificação completa das tabelas
├── 02-mapeamento-frontend-backend.md         # Mapeamento de dados do frontend
├── 03-diagrama-relacionamentos.md            # Diagrama ER e relacionamentos
├── 04-triggers-functions.md                  # Triggers e functions PostgreSQL
├── 05-row-level-security.md                  # Políticas RLS do Supabase
└── 06-migration-script.sql                   # Script de migração completo
```

## Resumo das Tabelas

### Total: 14 Tabelas

#### 1. Cadastros Base (6 tabelas)
- **tbdepartamento**: 4 setores produtivos (SPEP, SPPV, Líquidos, CPHD)
- **tblinhaproducao**: 37 linhas de produção do MVP
- **tbturno**: 2 turnos de 12 horas cada
- **tbsku**: Produtos/SKUs produzidos
- **tbsku_velocidade_nominal**: Velocidades nominais por linha+SKU (CRÍTICO)
- **tbcodigo_parada**: Códigos de paradas com hierarquia de 5 níveis

#### 2. Apontamentos (5 tabelas)
- **tblote**: Lotes de produção (contexto do apontamento)
- **tbapontamento_producao**: Apontamentos de produção por intervalo
- **tbapontamento_parada**: Apontamentos de paradas (contemporâneos)
- **tbapontamento_perdas**: Apontamentos de perdas (refugo, desvios, bloqueios)
- **tbapontamento_retrabalho**: Apontamentos de retrabalho (tempo perdido)

#### 3. Cálculos e Indicadores (3 tabelas)
- **tboee_calculado**: OEE calculado e consolidado por período
- **tbindicador_mtbf**: MTBF (Tempo Médio Entre Falhas)
- **tbindicador_mttr**: MTTR (Tempo Médio para Reparo)

## Princípios ALCOA+ (Requisito Regulatório)

Todas as tabelas implementam os princípios ALCOA+ para conformidade com BPF:

- **A - Atribuível**: `created_by`, `updated_by`, `deleted_by`
- **L - Legível**: Dados estruturados e claros
- **C - Contemporâneo**: `created_at`, `updated_at` automáticos
- **O - Original**: Soft delete (`deletado = 'S'`)
- **A - Exato**: Validações e constraints
- **+ Completo**: Todos os campos relevantes
- **+ Consistente**: Foreign keys e integridade referencial
- **+ Durável**: Backup automático do Supabase
- **+ Disponível**: Acessível para auditorias

## Pontos Críticos de Implementação

### 1. Velocidade Nominal por Linha+SKU

**CRÍTICO**: Cada linha possui velocidade nominal diferente para cada SKU.

```sql
-- Tabela tbsku_velocidade_nominal
-- Permite histórico de velocidades (vigência)
-- Base para cálculo de Performance
```

**Impacto**: Não usar capacidade nominal da máquina. Usar performance qualificada após validações.

### 2. Paradas Estratégicas

**CRÍTICO**: Paradas estratégicas NÃO entram no tempo disponível.

```
Tempo Disponível = Tempo Calendário - Paradas Estratégicas
```

**Implementação**: Campo `tipo_parada = 'ESTRATEGICA'` em `tbcodigo_parada`.

### 3. Pequenas Paradas (< 10 minutos)

**CRÍTICO**: Afetam Performance, não Disponibilidade.

**Implementação**: Campo `impacta_disponibilidade = FALSE` em `tbcodigo_parada`.

### 4. Hierarquia de Paradas (5 Níveis)

```
Nível 1: Classe (Planejada, Não Planejada, Estratégica)
Nível 2: Grande Parada (Manutenção, Falta de Insumo, etc)
Nível 3: Apontamento
Nível 4: Grupo (Mecânica, Elétrica, etc)
Nível 5: Detalhamento
```

**Implementação**: Campos `nivel_1_classe` até `nivel_5_detalhamento` em `tbcodigo_parada`.

### 5. Cálculo de OEE

**Fórmula completa**:
```
OEE (%) = Disponibilidade × Performance × Qualidade

Onde:
- Disponibilidade = (Tempo de Operação / Tempo Disponível) × 100
- Performance = (Tempo Operacional Líquido / Tempo de Operação) × 100
- Qualidade = Qualidade_Unidades × Qualidade_Retrabalho
```

**Implementação**: Tabela `tboee_calculado` com todos os componentes separados.

### 6. Registro Contemporâneo (ALCOA+)

**CRÍTICO**: Paradas devem ser registradas no momento da ocorrência.

**Implementação**: 
- Campo `created_at` automático
- Campo `created_by` obrigatório (rastreabilidade)
- Status `EM_ANDAMENTO` para paradas não finalizadas

## Relacionamentos Principais

```
tbdepartamento (1) ──→ (N) tblinhaproducao
tblinhaproducao (1) ──→ (N) tblote
tblinhaproducao (1) ──→ (N) tbcodigo_parada
tbsku (1) ──→ (N) tbsku_velocidade_nominal
tblinhaproducao (1) ──→ (N) tbsku_velocidade_nominal
tblote (1) ──→ (N) tbapontamento_producao
tblote (1) ──→ (N) tbapontamento_parada
tblote (1) ──→ (N) tbapontamento_perdas
tblote (1) ──→ (N) tbapontamento_retrabalho
tblote (1) ──→ (1) tboee_calculado
```

## Migração do localStorage para Supabase

### Dados Atuais no localStorage

1. **oee_production_records**: Histórico de produção
2. **oee_downtime_records**: Histórico de paradas
3. **oee_quality_records**: Histórico de qualidade
4. **sysoee_apontamentos_producao**: Apontamentos de produção
5. **sysoee_paradas**: Paradas registradas
6. **sysoee_apontamentos_perdas**: Perdas registradas
7. **sysoee_apontamentos_retrabalho**: Retrabalhos registrados

### Estratégia de Migração

1. **Criar estrutura no Supabase** (executar migration script)
2. **Migrar dados de cadastro** (departamentos, linhas, turnos, SKUs)
3. **Migrar velocidades nominais** (tbsku_velocidade_nominal)
4. **Migrar códigos de paradas** (tbcodigo_parada)
5. **Migrar lotes** (tblote)
6. **Migrar apontamentos** (produção, paradas, qualidade)
7. **Recalcular OEE** (tboee_calculado)

## Próximos Passos

### Fase 1: Estrutura (Semana 1)
- [ ] Criar tabelas no Supabase
- [ ] Configurar Row Level Security (RLS)
- [ ] Criar triggers e functions
- [ ] Criar views para consultas

### Fase 2: Migração (Semana 2)
- [ ] Migrar dados de cadastro
- [ ] Migrar velocidades nominais
- [ ] Migrar códigos de paradas
- [ ] Validar integridade dos dados

### Fase 3: Integração (Semana 3)
- [ ] Atualizar serviços do frontend
- [ ] Substituir localStorage por Supabase
- [ ] Implementar sincronização em tempo real
- [ ] Testes de integração

### Fase 4: Validação (Semana 4)
- [ ] Testes com usuários
- [ ] Validação com Consultor Rafael Gusmão
- [ ] Ajustes e correções
- [ ] Documentação final

## Considerações de Performance

### Índices Criados
- Todos os campos de FK possuem índices
- Campos de busca frequente (data, status, tipo) possuem índices
- Índices compostos para queries complexas

### Campos Calculados
- `duracao_minutos` em `tbapontamento_parada` (GENERATED ALWAYS AS)
- `duracao_horas` em `tbturno` (GENERATED ALWAYS AS)
- `mtbf` e `mttr` em tabelas de indicadores (GENERATED ALWAYS AS)
- `atingiu_meta` em `tboee_calculado` (GENERATED ALWAYS AS)

### Cache de Cálculos
- Tabela `tboee_calculado` serve como cache
- Campo `recalcular` para invalidar cache
- Triggers para atualizar cache automaticamente

## Segurança e Auditoria

### Row Level Security (RLS)
- Políticas por departamento/setor
- Políticas por linha de produção
- Políticas por usuário/perfil

### Auditoria Completa
- Todos os campos ALCOA+ em todas as tabelas
- Soft delete obrigatório
- Rastreabilidade completa de alterações
- Timestamps automáticos

## Contato e Validação

**Validação Técnica Obrigatória**: Consultor Rafael Gusmão

**Equipe Principal**:
- Cícero Emanuel da Silva (Líder de TI)
- Sávio Correia Rafael (Gerente de Processos)
- Maxwell Cruz Cortez (Gerente Industrial)

