# Implementação do Sistema de Guias com Mapa de Armazéns

## 📋 Resumo da Implementação

Foi implementado um sistema de guias (tabs) na rota `/armazens` com duas visualizações:
1. **Guia "Blocos"**: Visualização em grid de cards (existente)
2. **Guia "Mapa"**: Nova visualização com foto aérea interativa

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Guias
- Componente `Tabs` do shadcn/ui integrado
- Duas guias: "Blocos" e "Mapa"
- Guia "Blocos" ativa por padrão
- Transição suave entre guias
- Ícones visuais (LayoutGrid e Map)

### ✅ Visualização em Mapa
- Foto aérea (`/public/FotoAerea.jpeg`) como plano de fundo
- Marcadores clicáveis para cada armazém
- Diferenciação visual:
  - **Azul**: Armazéns disponíveis
  - **Vermelho**: Armazéns bloqueados
- Efeito hover com escala aumentada
- Tooltip nativo com informações do armazém

### ✅ Integração com Modal
- Ao clicar em marcador, abre o mesmo modal de detalhes
- Funcionalidade idêntica à visualização em blocos
- Mantém todo o fluxo de inventário e histórico

### ✅ Sistema de Coordenadas
- Coordenadas em percentual (0-100) relativas à imagem
- Arquivo JSON separado para fácil manutenção
- 47 armazéns mapeados com coordenadas de exemplo

### ✅ 🎯 Modo de Calibração (NOVO!)
- **Interface Visual**: Botão "Calibrar Posições" para ativar modo de edição
- **Drag-and-Drop**: Marcadores arrastáveis com mouse
- **Feedback em Tempo Real**: Coordenadas exibidas durante o arraste
- **Validação Automática**: Coordenadas limitadas entre 0-100
- **Persistência**: Salva no localStorage (`sysoee_coordenadas_armazens`)
- **Controles**:
  - ✅ Salvar Posições (verde)
  - ✅ Cancelar (vermelho)
  - ✅ Restaurar Padrões (volta ao JSON original)
- **Indicadores Visuais**:
  - Badge "🎯 Modo de Calibração Ativo"
  - Alerta explicativo
  - Borda amarela nos marcadores
  - Cursor crosshair no mapa
  - Animação de pulso no marcador sendo arrastado

## 📁 Arquivos Criados/Modificados

### Novos Arquivos

1. **`src/components/armazem/MapaArmazens.tsx`**
   - Componente principal do mapa
   - Renderiza foto aérea e marcadores
   - Props: `armazens`, `onArmazemClick`

2. **`src/data/coordenadas-armazens.json`**
   - Configuração de coordenadas dos marcadores
   - Formato: `{ codigo, x, y, descricao }`
   - Facilita ajustes sem recompilar

3. **`src/components/armazem/README-MAPA-ARMAZENS.md`**
   - Documentação completa do componente
   - Guia de ajuste de coordenadas
   - Exemplos de uso e personalização

4. **`IMPLEMENTACAO-MAPA-ARMAZENS.md`** (este arquivo)
   - Resumo da implementação
   - Instruções de uso e manutenção

### Arquivos Modificados

1. **`src/pages/ArmazemSaldo.tsx`**
   - Adicionado import do componente `Tabs`
   - Adicionado import do componente `MapaArmazens`
   - Adicionado ícones `LayoutGrid` e `Map`
   - Novo estado: `guiaAtiva` ('blocos' | 'mapa')
   - Estrutura de guias envolvendo conteúdo existente
   - Guia "Mapa" com componente `MapaArmazens`

## 🎨 Estrutura Visual

```
┌─────────────────────────────────────────┐
│  Header: Armazéns                       │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  [Blocos] [Mapa]  ← Guias               │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│                                         │
│  Conteúdo da Guia Ativa:                │
│                                         │
│  • Blocos: Grid de cards                │
│  • Mapa: Foto aérea + marcadores        │
│                                         │
└─────────────────────────────────────────┘
```

## 🔧 Como Usar

### Acessar a Funcionalidade

1. Inicie o servidor: `npm run dev`
2. Navegue para: `http://localhost:8081/armazens`
3. Clique na guia "Mapa" para visualizar o mapa
4. Clique em qualquer marcador para abrir detalhes

### Alternar entre Visualizações

- **Guia "Blocos"**: Visualização tradicional em grid
- **Guia "Mapa"**: Visualização geográfica interativa

### Interagir com o Mapa

1. **Visualizar**: Marcadores mostram localização de cada armazém
2. **Clicar**: Abre modal com detalhes e lotes do armazém
3. **Identificar**: Cor indica status (azul = disponível, vermelho = bloqueado)

## 📐 Ajustar Coordenadas dos Marcadores

### ⭐ Método 1: Modo de Calibração Visual (RECOMENDADO)

**Este é o método mais fácil e intuitivo!**

1. Acesse `/armazens` e clique na guia "Mapa"
2. Clique no botão **"Calibrar Posições"**
3. **Arraste os marcadores** para as posições corretas
4. Observe as coordenadas em tempo real
5. Clique em **"Salvar Posições"** para confirmar
6. Ou clique em **"Cancelar"** para descartar

**Vantagens:**
- ✅ Interface visual intuitiva
- ✅ Feedback em tempo real
- ✅ Sem necessidade de editar código
- ✅ Validação automática
- ✅ Possibilidade de cancelar
- ✅ Persistência automática

### Método 2: Editar JSON

1. Abra `src/data/coordenadas-armazens.json`
2. Localize o armazém pelo código
3. Ajuste valores de `x` e `y` (0-100)
4. Salve o arquivo
5. Recarregue a página

**Exemplo:**
```json
{
  "codigo": "01",
  "x": 25,  // 25% da esquerda
  "y": 30,  // 30% do topo
  "descricao": "ALMOXARIFADO CENTRAL"
}
```

### Método 3: Editar Componente

1. Abra `src/components/armazem/MapaArmazens.tsx`
2. Modifique a constante `COORDENADAS_PADRAO`
3. Salve e recarregue

## 🎯 Coordenadas Atuais

As coordenadas atuais são **valores de exemplo** distribuídos uniformemente pela imagem. 

**⚠️ IMPORTANTE**: Ajuste as coordenadas conforme a localização real dos armazéns na foto aérea.

### Distribuição Atual (Exemplo)

- **Linha 1** (y=20): Armazéns 01-08
- **Linha 2** (y=35): Armazéns 09-16
- **Linha 3** (y=50): Armazéns 17-24
- **Linha 4** (y=65): Armazéns 25-32
- **Linha 5** (y=80): Armazéns 33-40
- **Linha 6** (y=90): Armazéns 41-47

## 🚀 Melhorias Futuras Sugeridas

### 1. Interface de Calibração
Criar página administrativa para ajustar coordenadas visualmente:
- Exibir foto aérea
- Clicar para posicionar marcadores
- Salvar coordenadas automaticamente

### 2. Zoom e Pan
Adicionar capacidade de zoom e navegação:
```bash
npm install react-zoom-pan-pinch
```

### 3. Filtros no Mapa
- Filtrar por status (bloqueado/disponível)
- Filtrar por setor
- Filtrar por nível de ocupação

### 4. Informações no Hover
Exibir tooltip com:
- Nome do armazém
- Status
- Nível de ocupação
- Último inventário

### 5. Heatmap de Ocupação
Colorir marcadores baseado em ocupação:
- Verde: < 50%
- Amarelo: 50-80%
- Vermelho: > 80%

### 6. Múltiplas Camadas
Permitir alternar entre:
- Foto aérea
- Planta baixa
- Mapa esquemático

### 7. Migração para Banco de Dados
Armazenar coordenadas no Supabase:
```sql
CREATE TABLE armazem_coordenadas (
  codigo VARCHAR(2) PRIMARY KEY,
  x DECIMAL(5,2) NOT NULL,
  y DECIMAL(5,2) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📱 Responsividade

O sistema é totalmente responsivo:

- **Mobile** (< 640px): 
  - Guias empilhadas
  - Mapa ajustado ao container
  - Marcadores mantêm tamanho legível

- **Tablet** (640px - 1024px):
  - Guias lado a lado
  - Mapa otimizado
  - Marcadores com hover

- **Desktop** (> 1024px):
  - Layout completo
  - Mapa em tamanho ideal
  - Todos os efeitos visuais

## 🎨 Personalização

### Cores dos Marcadores

Edite em `MapaArmazens.tsx`:

```tsx
// Disponível
className="text-primary fill-primary/20"

// Bloqueado
className="text-red-600 fill-red-100"
```

### Tamanho dos Marcadores

```tsx
// Padrão
<MapPin className="h-8 w-8" />

// Maior
<MapPin className="h-10 w-10" />

// Menor
<MapPin className="h-6 w-6" />
```

### Proporção da Imagem

```tsx
// Atual: 3:2
style={{ paddingBottom: '66.67%' }}

// 16:9
style={{ paddingBottom: '56.25%' }}

// 4:3
style={{ paddingBottom: '75%' }}
```

## 🐛 Troubleshooting

### Problema: Marcadores não aparecem
**Solução**: 
- Verifique se `/public/FotoAerea.jpeg` existe
- Confirme coordenadas entre 0-100
- Verifique console do navegador

### Problema: Imagem não carrega
**Solução**:
- Confirme caminho: `/public/FotoAerea.jpeg`
- Teste diretamente: `http://localhost:8081/FotoAerea.jpeg`
- Verifique permissões do arquivo

### Problema: Marcadores em posições erradas
**Solução**:
- Ajuste coordenadas em `coordenadas-armazens.json`
- Considere proporção da imagem
- Use valores entre 0-100

### Problema: Modal não abre ao clicar
**Solução**:
- Verifique se `handleArmazemClick` está sendo passado
- Confirme que armazém não está bloqueado
- Verifique console para erros

## 📊 Métricas de Implementação

- **Arquivos criados**: 4
- **Arquivos modificados**: 1
- **Linhas de código**: ~400
- **Componentes novos**: 1 (MapaArmazens)
- **Armazéns mapeados**: 47
- **Tempo estimado de implementação**: 2-3 horas

## ✅ Checklist de Validação

- [x] Sistema de guias implementado
- [x] Guia "Blocos" mantém funcionalidade original
- [x] Guia "Mapa" exibe foto aérea
- [x] Marcadores clicáveis funcionam
- [x] Modal abre ao clicar em marcador
- [x] Diferenciação visual de armazéns bloqueados
- [x] Responsividade em mobile/tablet/desktop
- [x] Documentação completa criada
- [x] Coordenadas configuráveis via JSON
- [ ] Coordenadas ajustadas para posições reais (pendente)

## 📚 Referências

- [Shadcn/UI - Tabs](https://ui.shadcn.com/docs/components/tabs)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS - Positioning](https://tailwindcss.com/docs/position)
- [React - Event Handling](https://react.dev/learn/responding-to-events)

## 👥 Próximos Passos

1. **Ajustar coordenadas reais**: Editar `coordenadas-armazens.json` com posições corretas
2. **Testar com usuários**: Validar usabilidade da visualização em mapa
3. **Implementar melhorias**: Considerar zoom, filtros, heatmap
4. **Migrar para BD**: Mover coordenadas para Supabase (opcional)
5. **Interface de calibração**: Criar ferramenta administrativa para ajustar marcadores

---

**Data de Implementação**: 03/11/2025  
**Versão**: 1.0.0  
**Status**: ✅ Implementado e Funcional

