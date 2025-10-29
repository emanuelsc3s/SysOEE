# Página Operação - Guia de Uso

## 🎯 Objetivo

A página **Operação** fornece uma visualização em tempo real das Ordens de Produção (OPs) através de um layout Kanban, permitindo acompanhar o status de cada OP nas diferentes fases do processo produtivo.

## 🚀 Como Acessar

### Opção 1: Pela Home
1. Acesse a página inicial (`/`)
2. Clique no card "Operação" no menu principal

### Opção 2: URL Direta
```
http://localhost:8081/operacao
```

## 📊 Estrutura da Página

### Header (Topo Fixo)

#### Linha 1: Título e Ações
- **Botão Voltar** (←) - Retorna para a Home
- **Título** - "Operação - Kanban de Produção"
- **Botão Atualizar** - Atualiza os dados (futuro: integração real)
- **Botão Filtros** - Abre painel de filtros (futuro)

#### Linha 2: Estatísticas
- **Data Atual** - Data de hoje
- **OPs Totais** - Quantidade total de ordens
- **Em Produção** - OPs nas fases ativas (excluindo Planejado e Concluído)
- **Setores Ativos** - Quantidade de setores com OPs
- **Turnos Ativos** - Quantidade de turnos operando

### Kanban Board (Área Principal)

7 colunas representando as fases:

1. **Planejado** (Cinza)
   - OPs aguardando início de produção

2. **Emissão de Dossiê** (Azul)
   - Documentação sendo preparada

3. **Pesagem** (Roxo)
   - Pesagem de matérias-primas

4. **Preparação** (Índigo)
   - Preparação do processo

5. **Envase** (Ciano)
   - Processo de envase em andamento

6. **Embalagem** (Verde-azulado)
   - Processo de embalagem

7. **Concluído** (Verde)
   - OPs finalizadas

### Cards de OP

Cada card exibe:

#### Cabeçalho
- **Número da OP** (destaque em azul)
- **Badge do Setor** (canto superior direito)
- **Badge do Turno** (abaixo do setor)

#### Informações Principais
- 📅 **Data de Emissão** - DD/MM/YYYY
- 📦 **Lote** - Número do lote
- 📋 **Produto** - Descrição completa
- 🏷️ **SKU** - Código do produto
- 🏭 **Equipamento** - Linha de produção
- ⏰ **Horas** - Tempo em operação (HH:MM)

#### Quantidades
- **Teórico** - Quantidade planejada
- ✅ **Produzido** - Quantidade produzida (verde) + % de progresso
- ⚠️ **Perdas** - Quantidade de perdas (laranja, se > 0)
- **Barra de Progresso** - Visual do percentual produzido

#### Informações Adicionais (quando disponíveis)
- **Dossiê** - Número do dossiê

### Legenda (Rodapé)

Explicação das cores dos setores:
- **SPEP** (Índigo) - Soluções Parenterais Embalagem Plástica
- **SPPV** (Ciano) - Soluções Parenterais Pequeno Volume
- **Líquidos** (Verde-azulado) - Líquidos Orais
- **CPHD** (Âmbar) - Concentrado Polieletrolítico Hemodiálise

## 🎨 Sistema de Cores

### Por Setor
| Setor | Cor | Descrição |
|-------|-----|-----------|
| SPEP | Índigo | 20 linhas (10 envase + 10 embalagem) |
| SPPV | Ciano | 10 linhas (5 envase + 5 embalagem) |
| Líquidos | Verde-azulado | 5 linhas (3 envase + 2 embalagem) |
| CPHD | Âmbar | 2 linhas (Ácida e Básica) |

### Por Turno
| Turno | Cor |
|-------|-----|
| 1º Turno | Azul |
| 2º Turno | Verde |
| 3º Turno | Roxo |
| Administrativo | Cinza |

### Por Fase (Colunas)
| Fase | Cor de Fundo |
|------|--------------|
| Planejado | Cinza claro |
| Emissão de Dossiê | Azul claro |
| Pesagem | Roxo claro |
| Preparação | Índigo claro |
| Envase | Ciano claro |
| Embalagem | Verde-azulado claro |
| Concluído | Verde claro |

## 📱 Navegação

### Scroll Horizontal
- Use a barra de rolagem horizontal para navegar entre as colunas
- Ou arraste com o mouse/touch

### Scroll Vertical
- Cada coluna tem scroll independente
- Permite visualizar muitas OPs em uma mesma fase

### Navegação por Teclado
- **Tab** - Navega entre elementos interativos
- **Enter** - Ativa botões
- **Esc** - Fecha modais (futuro)

## 🔍 Interpretando os Dados

### Barra de Progresso
- **Verde** - Progresso normal
- Largura representa o percentual produzido vs. teórico
- Número exato exibido ao lado (ex: "5000 (50%)")

### Perdas
- Exibidas em **laranja** quando > 0
- Ícone de alerta (⚠️) para chamar atenção
- Importante para análise de qualidade

### Horas em Operação
- Formato **HH:MM**
- Pode ultrapassar 24h (ex: "48:30" = 2 dias e 30 minutos)
- Útil para calcular MTBF e MTTR

## 🎯 Casos de Uso

### 1. Acompanhamento de Produção
**Objetivo**: Ver status geral da produção

**Como fazer**:
1. Acesse a página Operação
2. Observe as estatísticas no header
3. Identifique gargalos (colunas com muitas OPs)
4. Verifique distribuição de OPs entre as fases

### 2. Monitoramento de Setor Específico
**Objetivo**: Acompanhar apenas um setor (ex: SPEP)

**Como fazer**:
1. Identifique os cards pelo badge de setor (índigo para SPEP)
2. Futuro: Use o filtro de setor

### 3. Análise de Perdas
**Objetivo**: Identificar OPs com perdas

**Como fazer**:
1. Procure cards com ícone de alerta (⚠️) laranja
2. Verifique a quantidade de perdas
3. Compare com a quantidade teórica

### 4. Verificação de Progresso
**Objetivo**: Ver quanto foi produzido de cada OP

**Como fazer**:
1. Observe a barra de progresso verde em cada card
2. Veja o percentual ao lado do "Produzido"
3. Compare com a quantidade teórica

## 🚧 Funcionalidades Futuras

### Em Desenvolvimento
- [ ] Filtros por setor, turno, data, equipamento
- [ ] Busca por OP/Lote
- [ ] Drag & Drop entre fases
- [ ] Modal com detalhes completos da OP
- [ ] Atualização em tempo real (WebSocket)
- [ ] Integração com backend (Supabase)
- [ ] Exportação para Excel/PDF
- [ ] Notificações de alertas
- [ ] Histórico de movimentações

### Planejadas
- [ ] Gráficos de performance por OP
- [ ] Comparação com metas
- [ ] Análise de tendências
- [ ] Previsão de conclusão
- [ ] Alertas inteligentes

## 💡 Dicas de Uso

### Performance
- A página carrega rapidamente mesmo com muitas OPs
- Scroll suave em cada coluna
- Atualização eficiente sem recarregar toda a página

### Visualização
- Use tela grande (desktop/tablet) para melhor experiência
- Zoom do navegador pode ser ajustado (Ctrl + / Ctrl -)
- Modo paisagem recomendado para tablets

### Produtividade
- Mantenha a página aberta em uma aba separada
- Use o botão "Atualizar" periodicamente
- Observe as estatísticas para decisões rápidas

## 🐛 Solução de Problemas

### Página não carrega
1. Verifique se o servidor está rodando (`npm run dev`)
2. Acesse `http://localhost:8081/operacao`
3. Limpe o cache do navegador (Ctrl + Shift + R)

### Cards não aparecem
1. Verifique o console do navegador (F12)
2. Confirme que os dados mock estão carregando
3. Recarregue a página

### Layout quebrado
1. Verifique o tamanho da janela do navegador
2. Tente zoom 100% (Ctrl + 0)
3. Use navegador moderno (Chrome, Firefox, Edge)

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação completa em `docs/IMPLEMENTACAO-OPERACAO.md`
2. Verifique os tipos em `src/types/operacao.ts`
3. Analise os componentes em `src/components/operacao/`

## 📚 Referências

- [Documentação Completa](../../docs/IMPLEMENTACAO-OPERACAO.md)
- [Tipos TypeScript](../types/operacao.ts)
- [Dados Mock](../data/mockOPs.ts)
- [Componente OPCard](../components/operacao/OPCard.tsx)
- [Componente KanbanColumn](../components/operacao/KanbanColumn.tsx)

