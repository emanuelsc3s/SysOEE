# Sistema OEE - SicFar

Sistema de monitoramento de **OEE (Overall Equipment Effectiveness)** para a plataforma SicFar da Farmace, focado em maximizar a eficiência operacional de linhas de produção farmacêutica.

[![Fase](https://img.shields.io/badge/Fase-Planejamento-blue)]()
[![Implantação](https://img.shields.io/badge/Implanta%C3%A7%C3%A3o-Janeiro%2F2026-green)]()
[![Linhas](https://img.shields.io/badge/Linhas-37%20MVP-orange)]()

## 📋 Sobre o Projeto

O Sistema OEE é uma solução completa para monitoramento e análise da eficiência global de equipamentos em ambiente farmacêutico regulado. O sistema calcula e apresenta indicadores críticos de desempenho através de três componentes principais:

- **Disponibilidade**: Tempo efetivo de operação vs tempo disponível
- **Performance**: Eficiência da produção em relação à capacidade nominal
- **Qualidade**: Produtos conformes vs total produzido

### 🎯 Objetivos

- Monitorar 37 linhas de produção em 4 setores produtivos
- Fornecer análises em tempo real e históricas
- Identificar perdas e gargalos operacionais através de Pareto de Paradas
- Suportar decisões baseadas em dados (MTBF, MTTR, Taxa de Utilização)
- Garantir conformidade regulatória (BPF, ALCOA+)

### 🏭 Escopo MVP

| Setor | Linhas de Envase | Linhas de Embalagem | Total |
|-------|------------------|---------------------|-------|
| **SPEP** - Soluções Parenterais Plásticas | 10 | 10 | 20 |
| **SPPV** - Soluções Parenterais Vidros | 5 | 5 | 10 |
| **Líquidos** - Líquidos Orais | 3 | 2 | 5 |
| **CPHD** - Concentrado para Hemodiálise | 2 | - | 2 |
| **TOTAL** | **20** | **17** | **37** |

## 🗂️ Estrutura do Repositório

```
SysOEE/
├── docs/
│   ├── project/                      # 📊 Resumos estruturados (COMECE AQUI)
│   │   ├── README.md                # Índice navegável
│   │   ├── 00-Visao-Geral-Projeto.md
│   │   ├── 01-Formacao-Equipe-Projeto.md
│   │   ├── 02-Levantamento-Processo-Atual.md
│   │   ├── 03-Definicao-Escopo-Projeto.md
│   │   ├── 04-Glossario-Termos.md
│   │   ├── 05-Metodologia-Calculo.md        # ⚠️ CRÍTICO
│   │   ├── 07-Identificacao-Fontes-Dados.md
│   │   ├── 08-Indicadores-Secundarios.md
│   │   ├── 09-Validacao-Tecnica-SicFar.md   # ⚠️ CRÍTICO
│   │   ├── 10-Planejamento-Programacao.md
│   │   ├── 11-Responsabilidades-Stakeholders.md
│   │   └── 12-Estrutura-Necessaria.md
│   │
│   ├── EspecificacaoUsuario/         # 📄 Especificações originais completas
│   │   ├── md/                      # Versões markdown (usar estas)
│   │   ├── doc/                     # Originais Word (referência)
│   │   └── pptx/                    # Apresentações
│   │
│   └── database/                     # 🗄️ Modelagem de dados (futuro)
│
├── src/                              # 💻 Código-fonte (futuro)
│   ├── backend/
│   ├── frontend/
│   └── database/
│
├── CLAUDE.md                         # 🤖 Guia para Claude Code
└── README.md                         # 📖 Este arquivo
```

## 🚀 Início Rápido

### Para Novos Desenvolvedores

1. **Leia a visão geral do projeto**:
   ```bash
   cat docs/project/00-Visao-Geral-Projeto.md
   ```

2. **Entenda os termos do domínio**:
   ```bash
   cat docs/project/04-Glossario-Termos.md
   ```

3. **Estude a metodologia de cálculo** (CRÍTICO):
   ```bash
   cat docs/project/05-Metodologia-Calculo.md
   ```

4. **Revise os requisitos técnicos**:
   ```bash
   cat docs/project/09-Validacao-Tecnica-SicFar.md
   ```

5. **Consulte o índice completo**:
   ```bash
   cat docs/project/README.md
   ```

### Para Gestores e Stakeholders

- **Visão Executiva**: [`docs/project/00-Visao-Geral-Projeto.md`](docs/project/00-Visao-Geral-Projeto.md)
- **Escopo e Limitações**: [`docs/project/03-Definicao-Escopo-Projeto.md`](docs/project/03-Definicao-Escopo-Projeto.md)
- **Planejamento**: [`docs/project/10-Planejamento-Programacao.md`](docs/project/10-Planejamento-Programacao.md)

## 📐 Conceitos Fundamentais

### Cálculo de OEE

```
OEE (%) = Disponibilidade × Performance × Qualidade

Onde:
• Disponibilidade = (Tempo de Operação / Tempo Disponível) × 100
• Performance = (Tempo Operacional Líquido / Tempo de Operação) × 100
• Qualidade = (Unidades Boas / Unidades Produzidas) × 100
```

**Importante**:
- Todas as conversões são feitas em **horas**
- Pequenas paradas (< 10 min) afetam **Performance**, não Disponibilidade
- Paradas Estratégicas **não** entram no tempo disponível

> 📚 Detalhes completos em [`docs/project/05-Metodologia-Calculo.md`](docs/project/05-Metodologia-Calculo.md)

### Fontes de Dados

- **CLPs**: Bottelpack, Pró Maquia, Bausch Strobbel (produção em tempo real)
- **Apontamentos Manuais**: Paradas, retrabalhos (via interface SicFar)
- **TOTVS**: Produtos, lotes, perdas de qualidade
- **Backup**: Diários de Bordo Impressos (conformidade ALCOA+)

> 📚 Detalhes completos em [`docs/project/07-Identificacao-Fontes-Dados.md`](docs/project/07-Identificacao-Fontes-Dados.md)

### Visualizações Principais

1. **Velocímetro de OEE** - Indicador visual com metas por linha
2. **Gráfico de Pareto de Paradas** - Principal ferramenta de gestão
3. **Componentes do OEE** - Análise de Disponibilidade, Performance, Qualidade
4. **Histórico de Tendências** - Evolução de 10 semanas
5. **Tabelas Consolidadas** - Por período e por linha
6. **MTBF e MTTR** - Indicadores de manutenção

> 📚 Especificações completas em [`docs/project/09-Validacao-Tecnica-SicFar.md`](docs/project/09-Validacao-Tecnica-SicFar.md)

## 🔒 Conformidade Regulatória

### Princípios ALCOA+

Todos os dados devem ser:

- ✅ **A**tribuível - Identificar quem registrou e quando
- ✅ **L**egível - Claro e permanente
- ✅ **C**ontemporâneo - Registrado no momento da ocorrência
- ✅ **O**riginal - Sem reconstruções posteriores
- ✅ **A**xato (Exato) - Preciso e completo
- ✅ **+** Completo - Não omitir dados, mesmo desvios
- ✅ **+** Consistente - Sequência lógica
- ✅ **+** Durável - Armazenamento de longo prazo
- ✅ **+** Disponível - Acessível para auditorias

### Validação

- **QI** - Qualificação de Instalação
- **QO** - Qualificação de Operação
- **QP** - Qualificação de Performance

## 👥 Equipe

### Liderança

- **Cícero Emanuel da Silva** - Líder de TI
- **Sávio Correia Rafael** - Gerente de Processos
- **Maxwell Cruz Cortez** - Gerente Industrial
- **Consultor Rafael Gusmão** - Validação técnica

> 📚 Estrutura completa da equipe em [`docs/project/01-Formacao-Equipe-Projeto.md`](docs/project/01-Formacao-Equipe-Projeto.md)

## 📅 Cronograma

- **Fase Atual**: Planejamento e Documentação ✅
- **Próxima Fase**: Desenvolvimento (Back-end e Front-end)
- **MVP**: Linhas Piloto (a definir)
- **Implantação Geral**: **01 de Janeiro de 2026** 🎯

> 📚 Detalhes em [`docs/project/10-Planejamento-Programacao.md`](docs/project/10-Planejamento-Programacao.md)

## 🛠️ Tecnologias

### A Definir
- Back-end: (em análise)
- Front-end: (em análise)
- Banco de Dados: (em análise)
- Integração CLPs: Protocolo/API (em análise)
- Integração TOTVS: API (em análise)

## 📖 Documentação

### Documentos Essenciais

| Documento | Propósito | Prioridade |
|-----------|-----------|------------|
| [`CLAUDE.md`](CLAUDE.md) | Guia para Claude Code | ⭐⭐⭐ |
| [`docs/project/README.md`](docs/project/README.md) | Índice de documentação | ⭐⭐⭐ |
| [`05-Metodologia-Calculo.md`](docs/project/05-Metodologia-Calculo.md) | Fórmulas de OEE | ⭐⭐⭐ |
| [`09-Validacao-Tecnica-SicFar.md`](docs/project/09-Validacao-Tecnica-SicFar.md) | Requisitos técnicos | ⭐⭐⭐ |

### Navegação

```bash
# Ver índice completo
cat docs/project/README.md

# Listar resumos
ls docs/project/

# Listar especificações completas
ls docs/EspecificacaoUsuario/md/
```

## ⚠️ Notas Importantes

1. **Atividade 06 Ausente**: A numeração pula da 05 para 07 (Book de Paradas pendente)
2. **Velocidade Nominal**: Cada SKU tem velocidade diferente (usar velocidade qualificada)
3. **Pequenas Paradas**: < 10 min impactam Performance, não Disponibilidade
4. **Paradas Estratégicas**: Não entram no cálculo do OEE
5. **Sessão Contínua**: Sistema não pode desconectar durante o turno
6. **Validação Obrigatória**: Consultor Rafael Gusmão aprova todos os marcos

## 📝 Licença

Projeto interno - Farmace
Todos os direitos reservados © 2025

## 📞 Contato

Para questões sobre o projeto, entre em contato com:
- **TI**: Cícero Emanuel da Silva
- **Processos**: Sávio Correia Rafael
- **Consultoria**: Rafael Gusmão

---

**Desenvolvido com** ❤️ **para a Farmace**
