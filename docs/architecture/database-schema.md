# Database Schema

[← Voltar para Índice](./index.md)

## 3. Database Schema

### Implementação PostgreSQL/Supabase

Este schema implementa todos os modelos definidos, otimizado para PostgreSQL 15+ e Supabase.

**Componentes:**
- 15 tabelas principais
- 6 functions (incluindo cálculo completo de OEE)
- Triggers automáticos (auditoria ALCOA+, campos calculados)
- 5 views (dashboards e relatórios)
- 30+ indexes para performance
- 10+ RLS policies para segurança

### 3.1. Enums e Tipos

```sql
-- Tipo de linha
CREATE TYPE tipo_linha_enum AS ENUM ('ENVASE', 'EMBALAGEM');

-- Tipo de usuário
CREATE TYPE tipo_usuario_enum AS ENUM ('OPERADOR', 'SUPERVISOR', 'ENCARREGADO', 'GESTOR', 'ADMIN');

-- Status de lote
CREATE TYPE status_lote_enum AS ENUM ('PLANEJADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO');

-- Tipo de parada
CREATE TYPE tipo_parada_enum AS ENUM ('ESTRATEGICA', 'PLANEJADA', 'NAO_PLANEJADA');

-- Fonte de dados
CREATE TYPE fonte_dados_enum AS ENUM ('CLP_AUTOMATICO', 'MANUAL', 'TOTVS');

-- Tipo de perda de qualidade
CREATE TYPE tipo_perda_qualidade_enum AS ENUM ('REFUGO', 'RETRABALHO', 'DESVIO', 'BLOQUEIO');

-- Operação de auditoria
CREATE TYPE operacao_audit_enum AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- Status de insumo
CREATE TYPE status_insumo_enum AS ENUM ('EM_ESTOQUE', 'EM_USO', 'ESGOTADO', 'BLOQUEADO');
```

### 3.2. Tabelas de Cadastro

**Nota:** DDL completo disponível em arquivo separado. Resumo das principais tabelas:

**tbdepartamento:** Departamentos/setores produtivos (SPEP, SPPV, CPHD, Líquidos)
**tblinhaproducao:** 37 linhas de produção do MVP
**tbproduto:** Produtos (SKUs e insumos unificados)
**tbloteinsumo:** Lotes de insumos recebidos
**tbvelocidadenominal:** Velocidades por SKU por linha ⚠️ **SEM histórico de vigências**
**tbcodigoparada:** Book de paradas (hierarquia 5 níveis)
**tbturno:** Turnos de trabalho
**tbusuario:** Usuários do sistema (com FK para tbfuncionario)
**tbmetaoee:** Metas com histórico de vigência

⚠️ **LIMITAÇÕES CRÍTICAS IDENTIFICADAS:**
- `tbvelocidadenominal` não possui controle de vigências (`data_inicio_vigencia`, `data_fim_vigencia`)
- Campos de auditoria com tipos incorretos (`updated_at`, `deleted_at` como INTEGER ao invés de TIMESTAMP)
- Tabela `tbfuncionario` referenciada mas não documentada
- Tabela de perfis referenciada mas não documentada

### 3.3. Tabelas Transacionais

**tblote:** Lotes de produção (origem: TOTVS OP)
**tbapontamentoparada:** Paradas contemporâneas (ALCOA+)
**tbapontamentoproducao:** Produção (CLP/Manual)
**tbapontamentoqualidade:** Refugo e retrabalho

### 3.4. Tabelas de Cache e Auditoria

**tboeecalculado:** Cache de OEE calculado
**tbauditlog:** Log imutável de auditoria

### 3.5. Functions Principais

#### get_velocidade_nominal()
Retorna velocidade nominal vigente para linha+SKU na data especificada.

#### get_meta_oee()
Retorna meta OEE vigente para linha na data.

#### calcular_oee_lote()
**CRÍTICO** - Implementa fórmulas da Atividade 05:

```
Tempo Disponível = Tempo Calendário - Paradas Estratégicas
Disponibilidade (%) = (Tempo Operação / Tempo Disponível) × 100
Performance (%) = (Tempo Op. Líquido / Tempo Operação) × 100
Qualidade (%) = Qualidade_Unidades × Qualidade_Retrabalho
OEE (%) = Disponibilidade × Performance × Qualidade
```

Retorna:
- Todos os tempos (calendário, disponível, operação, líquido, valioso)
- Breakdown de paradas por tipo
- Componentes OEE separados
- OEE final

#### update_updated_at_column()
Trigger function para atualizar `updated_at` automaticamente.

#### audit_trigger_func()
Captura INSERT/UPDATE/DELETE e grava em `tbauditlog` (ALCOA+).

#### atualizar_totais_lote()
Mantém campos calculados de `tblote` sincronizados com apontamentos.

#### cache_oee_lote_concluido()
Trigger que popula `tboeecalculado` quando lote é concluído.

### 3.6. Views Úteis

**vw_diario_bordo:** Relatório completo do Diário de Bordo
**vw_diario_bordo_paradas:** Lista de paradas
**vw_dashboard_oee_linha:** Dashboard OEE em tempo real
**vw_pareto_paradas:** Gráfico de Pareto (principal ferramenta de gestão)
**vw_mtbf_mttr:** Indicadores MTBF e MTTR

### 3.7. Indexes para Performance

30+ indexes otimizados para queries de dashboard e relatórios, incluindo:
- Indexes em FKs para JOINs
- Indexes compostos para queries frequentes (linha_id + data)
- Indexes em campos de filtro (status, tipo_parada, etc.)

### 3.8. Row Level Security (RLS)

Policies implementadas para controle de acesso granular:

**Operador:** Vê apenas sua linha
**Supervisor/Encarregado:** Vê linhas do seu setor
**Gestor/Admin:** Vê tudo

RLS aplicado em:
- tblinha, tblote, tbapontamento_* (parada, produção, qualidade)
- tboeecalculado
- tbauditlog (somente Admin/Gestor)

---

