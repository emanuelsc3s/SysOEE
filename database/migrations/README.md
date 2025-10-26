# Scripts SQL - Sistema OEE SicFar

## Ordem de Execução

Execute os scripts **NESTA ORDEM** no Supabase SQL Editor:

1. ✅ `01-enums.sql` - Tipos ENUM customizados
2. ✅ `02-tables.sql` - Todas as 15 tabelas
3. ⏳ `03-functions.sql` - Functions (incluindo calcular_oee_lote)
4. ⏳ `04-triggers.sql` - Triggers automáticos
5. ⏳ `05-views.sql` - Views para dashboards
6. ⏳ `06-indexes.sql` - Indexes para performance
7. ⏳ `07-rls-policies.sql` - Row Level Security
8. ⏳ `08-seeds.sql` - Dados iniciais

## Resumo dos Scripts

### 01-enums.sql
- 8 tipos ENUM
- Tipos: linha, usuário, lote, parada, fonte_dados, perda_qualidade, operação_audit, status_insumo

### 02-tables.sql
- **Cadastros (10 tabelas):** departamento, linha, produto, insumo, lote_insumo, velocidade_nominal, codigo_parada, turno, usuario, meta_oee
- **Transações (4 tabelas):** lote, apontamento_parada, apontamento_producao, apontamento_qualidade
- **Cache/Auditoria (2 tabelas):** oee_calculado, audit_log

### 03-functions.sql (6 functions)
1. `get_velocidade_nominal()` - Busca velocidade vigente
2. `get_meta_oee()` - Busca meta vigente
3. `calcular_oee_lote()` - **CRÍTICO** - Calcula OEE completo
4. `update_updated_at_column()` - Atualiza updated_at
5. `audit_trigger_func()` - Auditoria ALCOA+
6. `atualizar_totais_lote()` - Atualiza campos calculados
7. `cache_oee_lote_concluido()` - Popula cache de OEE

### 04-triggers.sql
- Triggers de `updated_at` (14 triggers)
- Triggers de auditoria (5 triggers em tabelas críticas)
- Triggers de cálculo (2 triggers para totais de lote)
- Trigger de cache OEE (1 trigger quando lote concluído)

### 05-views.sql (5 views)
1. `vw_diario_bordo` - Relatório completo do Diário de Bordo
2. `vw_diario_bordo_paradas` - Lista de paradas
3. `vw_dashboard_oee_linha` - Dashboard OEE tempo real
4. `vw_pareto_paradas` - Gráfico de Pareto (gestão)
5. `vw_mtbf_mttr` - Indicadores MTBF e MTTR

### 06-indexes.sql
- 30+ indexes para performance
- Indexes em FKs, campos de filtro e queries frequentes

### 07-rls-policies.sql
- 10+ policies para controle de acesso
- Perfis: Operador, Supervisor, Encarregado, Gestor, Admin

### 08-seeds.sql
- Turnos padrão (D1, N1, D2)
- Departamentos (SPEP, SPPV, LIQUIDOS, CPHD)
- Códigos de parada globais (exemplos)
- **IMPORTANTE:** Popular as 37 linhas de produção após execução

## Notas Importantes

### ALCOA+ Compliance
Todos os campos de auditoria (`created_at`, `created_by`, `updated_at`, `updated_by`) são obrigatórios nas tabelas principais.

### Sistema de Autenticação
A tabela `tbusuario` usa `BIGSERIAL` como ID primário e gerencia sua própria autenticação (não depende de Supabase Auth).

### RLS Policies
As policies assumem que `tbusuario` está populada com os dados dos usuários. Configure usuários de teste antes de testar RLS.

### Fórmulas de OEE
A função `calcular_oee_lote()` implementa as fórmulas exatas da **Atividade 05**:

```
Tempo Disponível = Tempo Calendário - Paradas Estratégicas
Disponibilidade (%) = (Tempo Operação / Tempo Disponível) × 100
Performance (%) = (Tempo Op. Líquido / Tempo Operação) × 100
  onde: Tempo Op. Líquido = Unidades Produzidas / Velocidade Nominal
Qualidade (%) = Qualidade_Unidades × Qualidade_Retrabalho
OEE (%) = Disponibilidade × Performance × Qualidade
```

## Troubleshooting

### Erro: "relation tbusuario does not exist"
**Solução:** Certifique-se de executar `02-tables.sql` antes de qualquer script que dependa da tabela `tbusuario`.

### Erro ao criar triggers
**Solução:** Execute `03-functions.sql` completamente antes de `04-triggers.sql`.

### Performance lenta em dashboards
**Solução:** Certifique-se de executar `06-indexes.sql` após popular dados de teste.

## Validação

Após executar todos os scripts:

```sql
-- Verificar todas as tabelas foram criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'tb_%'
ORDER BY table_name;

-- Verificar functions
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Verificar views
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;
```

## Próximos Passos

1. Popular as 37 linhas de produção (editar `08-seeds.sql`)
2. Configurar Supabase Auth e criar usuários iniciais
3. Testar RLS policies com diferentes perfis
4. Popular dados de teste (SKUs, velocidades nominais, códigos de paradas)
5. Testar workflow completo: criar lote → apontar paradas → concluir → ver OEE calculado

## Suporte

Ver documentação completa em: `/docs/architecture.md`
