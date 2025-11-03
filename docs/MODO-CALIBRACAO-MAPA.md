# 🎯 Modo de Calibração do Mapa de Armazéns

## 📋 Visão Geral

O **Modo de Calibração** é uma funcionalidade que permite ajustar visualmente as posições dos marcadores de armazéns na foto aérea através de uma interface drag-and-drop intuitiva.

## 🎯 Objetivo

Facilitar o ajuste das coordenadas dos marcadores sem necessidade de editar código ou arquivos JSON manualmente, proporcionando uma experiência visual e interativa.

## 🚀 Como Usar

### Passo 1: Acessar o Mapa

1. Navegue para `/armazens`
2. Clique na guia **"Mapa"**
3. Visualize a foto aérea com os marcadores

### Passo 2: Ativar Modo de Calibração

1. Clique no botão **"Calibrar Posições"** (ícone de engrenagem)
2. O modo de calibração é ativado
3. Observe as mudanças visuais:
   - ⚠️ Alerta amarelo aparece no topo
   - 🎯 Badge "Modo de Calibração Ativo" é exibido
   - Cursor muda para `crosshair` sobre o mapa
   - Marcadores ganham borda amarela

### Passo 3: Ajustar Posições

1. **Clique e segure** um marcador
2. **Arraste** para a posição desejada na foto aérea
3. **Observe** as coordenadas em tempo real abaixo do marcador
4. **Solte** o botão do mouse para fixar a posição
5. Repita para todos os marcadores que precisam ajuste

**Dicas:**
- Marcadores são validados automaticamente (0-100%)
- Marcador sendo arrastado aumenta de tamanho e pulsa
- Coordenadas são exibidas como "X: 25.5% | Y: 30.2%"

### Passo 4: Salvar ou Cancelar

**Opção A: Salvar Alterações**
1. Clique no botão verde **"Salvar Posições"** (ícone de disquete)
2. Coordenadas são salvas no `localStorage`
3. Toast de confirmação aparece
4. Modo de calibração é desativado
5. Marcadores permanecem nas novas posições

**Opção B: Cancelar Alterações**
1. Clique no botão vermelho **"Cancelar"** (ícone X)
2. Todas as alterações são descartadas
3. Marcadores voltam às posições anteriores
4. Modo de calibração é desativado

**Opção C: Restaurar Padrões**
1. Clique no botão **"Restaurar Padrões"** (ícone de rotação)
2. Coordenadas voltam aos valores do JSON original
3. Dados do `localStorage` são removidos
4. Modo de calibração é desativado (se ativo)

## 🎨 Feedback Visual

### Indicadores de Modo Ativo

| Elemento | Estado Normal | Modo de Calibração |
|----------|---------------|-------------------|
| Cursor (mapa) | `default` | `crosshair` |
| Cursor (marcador) | `pointer` | `move` |
| Marcadores | Sem borda | Borda amarela (`ring-2 ring-yellow-400`) |
| Alerta | Não exibido | Alerta amarelo com instruções |
| Badge | Não exibido | "🎯 Modo de Calibração Ativo" |
| Botões | "Calibrar Posições" | "Salvar" + "Cancelar" |

### Durante o Arraste

- **Marcador**: Aumenta de tamanho (`scale-125`)
- **Animação**: Pulsa (`animate-pulse`)
- **Z-index**: Trazido para frente (`z-50`)
- **Coordenadas**: Badge exibido abaixo do marcador
- **Formato**: "X: 25.5% | Y: 30.2%"

## 💾 Persistência de Dados

### localStorage

**Chave:** `sysoee_coordenadas_armazens`

**Formato:**
```json
[
  { "codigo": "01", "x": 25.5, "y": 30.2 },
  { "codigo": "02", "x": 35.1, "y": 30.8 },
  { "codigo": "03", "x": 45.3, "y": 31.5 },
  ...
]
```

### Prioridade de Carregamento

1. **localStorage** (se existir) → Coordenadas personalizadas
2. **JSON padrão** (se localStorage vazio) → Coordenadas originais
3. **Fallback** (em caso de erro) → JSON padrão

### Operações

| Ação | localStorage | Coordenadas Ativas |
|------|-------------|-------------------|
| Salvar Posições | ✅ Atualizado | Novas coordenadas |
| Cancelar | ❌ Não alterado | Coordenadas anteriores |
| Restaurar Padrões | 🗑️ Removido | JSON original |

## 🔧 Detalhes Técnicos

### Estados React

```typescript
const [modoCalibracao, setModoCalibracao] = useState(false)
const [coordenadas, setCoordenadas] = useState<ArmazemCoordenadas[]>([])
const [coordenadasOriginais, setCoordenadasOriginais] = useState<ArmazemCoordenadas[]>([])
const [marcadorArrastando, setMarcadorArrastando] = useState<string | null>(null)
const [posicaoMouse, setPosicaoMouse] = useState<{ x: number; y: number } | null>(null)
```

### Eventos de Mouse

| Evento | Função | Descrição |
|--------|--------|-----------|
| `onMouseDown` | `iniciarArraste()` | Inicia arraste do marcador |
| `onMouseMove` | `atualizarArraste()` | Atualiza posição durante arraste |
| `onMouseUp` | `finalizarArraste()` | Finaliza arraste e fixa posição |
| `onMouseLeave` | `finalizarArraste()` | Cancela arraste se sair do mapa |

### Validação de Coordenadas

```typescript
const xLimitado = Math.max(0, Math.min(100, x))
const yLimitado = Math.max(0, Math.min(100, y))
```

Garante que coordenadas permaneçam entre 0 e 100.

### Cálculo de Posição

```typescript
const rect = containerRef.current.getBoundingClientRect()
const x = ((e.clientX - rect.left) / rect.width) * 100
const y = ((e.clientY - rect.top) / rect.height) * 100
```

Converte posição do mouse em percentual relativo ao container.

## 🎯 Casos de Uso

### Caso 1: Primeira Calibração

**Cenário:** Coordenadas padrão não correspondem à realidade

**Solução:**
1. Ativar modo de calibração
2. Ajustar todos os 47 marcadores
3. Salvar posições
4. Coordenadas personalizadas ficam salvas no navegador

### Caso 2: Ajuste Fino

**Cenário:** Alguns marcadores precisam pequenos ajustes

**Solução:**
1. Ativar modo de calibração
2. Ajustar apenas os marcadores necessários
3. Salvar posições
4. Outros marcadores mantêm posições anteriores

### Caso 3: Erro de Calibração

**Cenário:** Ajustes ficaram incorretos

**Solução A (Cancelar):**
1. Clicar em "Cancelar" antes de salvar
2. Alterações são descartadas

**Solução B (Restaurar):**
1. Clicar em "Restaurar Padrões"
2. Volta às coordenadas do JSON original
3. Recalibrar corretamente

### Caso 4: Múltiplos Usuários

**Cenário:** Diferentes usuários calibram no mesmo navegador

**Comportamento:**
- Cada navegador tem seu próprio `localStorage`
- Calibrações são independentes por navegador
- Para sincronizar, considere migração para banco de dados

## ⚠️ Limitações e Considerações

### Limitações Atuais

1. **Persistência Local**: Dados salvos apenas no navegador atual
2. **Sem Sincronização**: Alterações não são compartilhadas entre usuários
3. **Sem Histórico**: Não há versionamento de coordenadas
4. **Sem Undo/Redo**: Apenas cancelamento completo

### Recomendações

**Para Produção:**
- Migrar coordenadas para banco de dados (Supabase)
- Implementar controle de acesso (apenas administradores)
- Adicionar histórico de alterações (auditoria)
- Sincronizar entre todos os usuários

**Para Desenvolvimento:**
- Testar em diferentes resoluções de tela
- Validar em diferentes navegadores
- Documentar coordenadas finais

## 🐛 Troubleshooting

### Problema: Marcadores não arrastam

**Possíveis Causas:**
- Modo de calibração não está ativo
- JavaScript desabilitado
- Erro no console do navegador

**Solução:**
1. Verificar se badge "Modo de Calibração Ativo" aparece
2. Verificar console do navegador (F12)
3. Recarregar a página

### Problema: Coordenadas não salvam

**Possíveis Causas:**
- localStorage desabilitado
- Navegador em modo privado/anônimo
- Quota de localStorage excedida

**Solução:**
1. Verificar se localStorage está habilitado
2. Sair do modo privado
3. Limpar dados antigos do localStorage

### Problema: Marcadores voltam ao padrão

**Possíveis Causas:**
- localStorage foi limpo
- Navegador diferente
- Dados corrompidos

**Solução:**
1. Recalibrar marcadores
2. Salvar novamente
3. Considerar exportar coordenadas para JSON

## 📊 Métricas de Implementação

- **Componentes Modificados**: 1 (MapaArmazens.tsx)
- **Novos Hooks**: useToast
- **Novos Componentes UI**: Alert, Toast, Toaster
- **Estados Adicionados**: 5
- **Funções Adicionadas**: 7
- **Linhas de Código**: ~180 (adicionadas)
- **Bibliotecas Instaladas**: @dnd-kit/core, @dnd-kit/utilities (não utilizadas - implementação nativa)

## ✅ Checklist de Validação

- [x] Modo de calibração ativa/desativa corretamente
- [x] Marcadores são arrastáveis
- [x] Coordenadas são exibidas durante arraste
- [x] Validação de limites (0-100) funciona
- [x] Salvar persiste no localStorage
- [x] Cancelar reverte alterações
- [x] Restaurar padrões limpa localStorage
- [x] Feedback visual adequado
- [x] Toast de confirmação aparece
- [x] Modal não abre durante calibração
- [ ] Testado em diferentes navegadores
- [ ] Testado em diferentes resoluções
- [ ] Documentação completa

---

**Data de Implementação**: 03/11/2025  
**Versão**: 1.0.0  
**Status**: ✅ Implementado e Funcional

