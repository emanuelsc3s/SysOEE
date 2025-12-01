# Documentação de Banco de Dados - Sistema OEE SicFar

## Índice de Documentação

Esta pasta contém toda a documentação necessária para implementar o banco de dados Supabase para o Sistema OEE SicFar, baseado na análise completa do componente `ApontamentoOEE.tsx` e da documentação do projeto.

## Arquivos Disponíveis

### 📋 00-resumo-executivo.md
**Resumo Executivo do Projeto de Banco de Dados**

Apresenta uma visão geral de alto nível do projeto, incluindo:
- Estrutura de 14 tabelas
- Princípios ALCOA+ (requisito regulatório)
- Pontos críticos de implementação
- Estratégia de migração do localStorage
- Cronograma de implementação (4 semanas)

**Público-alvo**: Diretoria, Gerentes, Consultor Rafael Gusmão

---

### 🗄️ 01-requisitos-banco-dados-supabase.md
**Especificação Completa das Tabelas do Banco de Dados**

Contém a especificação detalhada de todas as 14 tabelas:

#### Cadastros Base (6 tabelas)
1. `tbdepartamento` - Setores produtivos (SPEP, SPPV, Líquidos, CPHD)
2. `tblinhaproducao` - 37 linhas de produção do MVP
3. `tbturno` - 2 turnos de 12 horas
4. `tbsku` - Produtos/SKUs
5. `tbsku_velocidade_nominal` - Velocidades nominais por linha+SKU (CRÍTICO)
6. `tbcodigo_parada` - Códigos de paradas (hierarquia 5 níveis)

#### Apontamentos (5 tabelas)
7. `tblote` - Lotes de produção
8. `tbapontamento_producao` - Apontamentos de produção
9. `tbapontamento_parada` - Apontamentos de paradas
10. `tbapontamento_perdas` - Apontamentos de perdas (refugo)
11. `tbapontamento_retrabalho` - Apontamentos de retrabalho

#### Cálculos e Indicadores (3 tabelas)
12. `tboee_calculado` - OEE calculado e consolidado
13. `tbindicador_mtbf` - MTBF (Tempo Médio Entre Falhas)
14. `tbindicador_mttr` - MTTR (Tempo Médio para Reparo)

**Público-alvo**: Desenvolvedores, DBAs, Arquitetos de Software

---

### 🔄 02-mapeamento-frontend-backend.md
**Mapeamento de Dados do Frontend para o Backend**

Documenta como os dados do componente `ApontamentoOEE.tsx` devem ser mapeados para as tabelas do Supabase:

1. **Cabeçalho do Apontamento** → `tblote`
2. **Apontamento de Produção** → `tbapontamento_producao`
3. **Apontamento de Paradas** → `tbapontamento_parada`
4. **Apontamento de Qualidade** → `tbapontamento_perdas` + `tbapontamento_retrabalho`
5. **Cálculo de OEE** → `tboee_calculado`
6. **Lotes de Produção** → `tblote`

Inclui exemplos de queries Supabase para cada operação.

**Público-alvo**: Desenvolvedores Frontend, Desenvolvedores Backend

---

### 📊 03-diagrama-relacionamentos.md
**Diagrama Entidade-Relacionamento (ER)**

Apresenta:
- Diagrama ER completo em formato Mermaid
- Relacionamentos detalhados entre tabelas
- Hierarquia organizacional
- Fluxo de apontamento
- Cálculo de OEE
- Indicadores secundários

**Público-alvo**: Desenvolvedores, DBAs, Arquitetos de Software

---

## Documentação Futura (A Criar)

### 🔧 04-triggers-functions.md
**Triggers e Functions PostgreSQL**

Conterá:
- Triggers para atualização automática de campos calculados
- Functions para cálculo de OEE
- Functions para cálculo de MTBF e MTTR
- Triggers para invalidação de cache
- Functions para validação de dados

**Status**: 📝 A criar

---

### 🔒 05-row-level-security.md
**Políticas de Row Level Security (RLS)**

Conterá:
- Políticas por departamento/setor
- Políticas por linha de produção
- Políticas por usuário/perfil
- Políticas de leitura/escrita/exclusão
- Exemplos de implementação

**Status**: 📝 A criar

---

### 📦 06-dados-iniciais.md
**Dados Iniciais para Carga no Banco**

Conterá:
- 4 setores produtivos
- 37 linhas de produção
- 2 turnos
- Códigos de paradas (hierarquia completa)
- Velocidades nominais por linha+SKU
- Scripts SQL para carga inicial

**Status**: 📝 A criar

---

### 🚀 07-migration-script.sql
**Script de Migração Completo**

Conterá:
- DDL completo de todas as tabelas
- Criação de índices
- Criação de constraints
- Criação de triggers e functions
- Criação de views
- Configuração de RLS
- Carga de dados iniciais

**Status**: 📝 A criar

---

## Como Usar Esta Documentação

### Para Desenvolvedores

1. **Comece pelo Resumo Executivo** (`00-resumo-executivo.md`)
2. **Leia a Especificação Completa** (`01-requisitos-banco-dados-supabase.md`)
3. **Consulte o Mapeamento Frontend-Backend** (`02-mapeamento-frontend-backend.md`)
4. **Visualize o Diagrama ER** (`03-diagrama-relacionamentos.md`)
5. **Implemente usando o Migration Script** (`07-migration-script.sql` - quando disponível)

### Para Gestores e Consultores

1. **Leia o Resumo Executivo** (`00-resumo-executivo.md`)
2. **Revise os Pontos Críticos** (seção específica no resumo)
3. **Valide a Conformidade ALCOA+** (presente em todos os documentos)
4. **Aprove o Cronograma** (4 semanas de implementação)

### Para DBAs

1. **Leia a Especificação Completa** (`01-requisitos-banco-dados-supabase.md`)
2. **Visualize o Diagrama ER** (`03-diagrama-relacionamentos.md`)
3. **Revise Triggers e Functions** (`04-triggers-functions.md` - quando disponível)
4. **Configure RLS** (`05-row-level-security.md` - quando disponível)
5. **Execute Migration Script** (`07-migration-script.sql` - quando disponível)

## Pontos Críticos de Atenção

### ⚠️ Velocidade Nominal por Linha+SKU
Cada linha possui velocidade nominal diferente para cada SKU. Não usar capacidade nominal da máquina.

### ⚠️ Paradas Estratégicas
Paradas estratégicas NÃO entram no tempo disponível para cálculo do OEE.

### ⚠️ Pequenas Paradas (< 10 minutos)
Afetam Performance, não Disponibilidade.

### ⚠️ Registro Contemporâneo (ALCOA+)
Paradas devem ser registradas no momento da ocorrência.

### ⚠️ Soft Delete Obrigatório
Nunca excluir fisicamente registros. Usar `deletado = 'S'`.

## Validação Técnica

**Todos os marcos principais devem ser validados pelo Consultor Rafael Gusmão antes de prosseguir.**

## Contato

**Equipe Principal**:
- Cícero Emanuel da Silva (Líder de TI)
- Sávio Correia Rafael (Gerente de Processos)
- Maxwell Cruz Cortez (Gerente Industrial)

**Consultor Técnico**:
- Rafael Gusmão (Validação de todos os marcos)

## Histórico de Versões

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0 | 2025-12-01 | Emanuel Silva | Criação inicial da documentação |

## Licença e Confidencialidade

Este documento é propriedade da **Farmace Indústria Farmacêutica** e contém informações confidenciais. Uso restrito aos membros autorizados do projeto OEE SicFar.

