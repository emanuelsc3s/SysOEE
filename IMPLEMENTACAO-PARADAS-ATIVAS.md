# ✅ Implementação: Card de Paradas Ativas com localStorage

## 🎯 Objetivo

Implementar a **Opção 2: Lista de Paradas Ativas** conforme solicitado, usando **localStorage** para validação antes de integrar com Supabase.

## 📋 Funcionalidades Implementadas

### ✅ 1. Card de Paradas Ativas

**Componente:** `src/components/operacao/CardParadasAtivas.tsx`

Exibe em tempo real:
- **Paradas em andamento** (hora_fim = null)
- **Contador de duração** atualizado a cada segundo
- **Botão "Finalizar Parada"** para cada parada ativa
- **Histórico de paradas finalizadas** (expansível)

### ✅ 2. Serviço de localStorage

**Arquivo:** `src/services/localStorage/parada.storage.ts`

Funções implementadas:
- `buscarParadasEmAndamento(loteId)` - Paradas ativas
- `buscarParadasFinalizadas(loteId)` - Paradas concluídas
- `buscarParadasPorLote(loteId)` - Todas as paradas
- `salvarParada(parada)` - Salva nova parada
- `finalizarParada(id, horaFim, usuarioId)` - Finaliza parada
- `calcularTempoDecorrido(horaInicio)` - Calcula tempo em tempo real
- `formatarDuracao(minutos)` - Formata para HH:MM:SS

**Cálculo automático de duração:**
```typescript
duracao_minutos = EXTRACT(EPOCH FROM (hora_fim - hora_inicio)) / 60
```

### ✅ 3. Integração com API

**Arquivo:** `src/services/api/parada.api.ts`

Atualizado para usar localStorage quando `USE_MOCK_DATA = true`:
- `criarApontamentoParada()` - Salva no localStorage
- `finalizarApontamentoParada()` - Atualiza no localStorage
- `buscarParadasEmAndamento()` - Busca do localStorage
- `buscarApontamentosParadaPorLote()` - Busca do localStorage

### ✅ 4. Integração na Página da OP

**Arquivo:** `src/pages/OperacaoDetalheOP.tsx`

- Card de paradas ativas exibido após "Ações Rápidas"
- Atualização automática ao registrar nova parada
- Atualização automática ao finalizar parada
- Callback `onParadaFinalizada()` para sincronização

## 🚀 Como Usar

### 1. Registrar uma Parada

```
1. Acesse: http://localhost:8082/operacao/136592
2. Clique no botão "Parada"
3. Preencha o formulário hierárquico
4. Clique em "Registrar Parada"
5. ✅ Parada aparece no Card de Paradas Ativas
```

### 2. Visualizar Paradas Ativas

O card exibe automaticamente:
```
┌─────────────────────────────────────────┐
│ 🔴 Paradas em Andamento (1)             │
├─────────────────────────────────────────┤
│ Quebra Mecânica - Equipamento           │
│ Início: 14:30 | Op. 1                   │
│ ⏱️ 00:15:32                              │
│ [Finalizar Parada]                      │
└─────────────────────────────────────────┘
```

**Contador em tempo real:**
- Atualiza a cada 1 segundo
- Formato: HH:MM:SS
- Calcula desde hora_inicio até agora

### 3. Finalizar uma Parada

```
1. Clique no botão "Finalizar Parada"
2. Sistema registra hora_fim automaticamente
3. Calcula duração_minutos automaticamente
4. Parada move para "Histórico de Paradas"
5. ✅ Mensagem de sucesso com duração total
```

### 4. Ver Histórico de Paradas

```
1. Clique em "📊 Histórico de Paradas (X)"
2. Expande lista de paradas finalizadas
3. Mostra: Início | Fim | Duração
```

## 📊 Estrutura de Dados (localStorage)

### Chave de Armazenamento
```typescript
const STORAGE_KEY = 'sysoee_paradas'
```

### Estrutura de uma Parada
```typescript
{
  id: "parada-1735678901234",
  linha_id: "mock-linha-id",
  lote_id: "123456",
  codigo_parada_id: "NP-QUE-MEC",
  turno_id: "turno-2",
  data_parada: "2025-01-31",
  hora_inicio: "14:30:00",
  hora_fim: null,              // null = em andamento
  duracao_minutos: null,       // calculado ao finalizar
  observacao: "Quebra do cilindro",
  criado_por_operador: 1,
  created_at: "2025-01-31T14:30:00.000Z",
  created_by: "1",
  updated_at: "2025-01-31T14:30:00.000Z",
  updated_by: null,
  deleted_at: null,
  deleted_by: null
}
```

### Exemplo de Parada Finalizada
```typescript
{
  id: "parada-1735678901234",
  // ... outros campos ...
  hora_inicio: "14:30:00",
  hora_fim: "15:15:32",        // ✅ Finalizada
  duracao_minutos: 45.53,      // ✅ Calculado automaticamente
  updated_at: "2025-01-31T15:15:32.000Z",
  updated_by: "1"
}
```

## 🔧 Funções Utilitárias

### Calcular Tempo Decorrido
```typescript
const minutos = calcularTempoDecorrido("14:30:00")
// Retorna: 45.53 (se agora for 15:15:32)
```

### Formatar Duração
```typescript
const texto = formatarDuracao(45.53)
// Retorna: "00:45:32"
```

### Cálculo de Duração (Suporta Meia-Noite)
```typescript
// Parada que cruza meia-noite
hora_inicio: "23:30:00"
hora_fim: "01:15:00"
duracao_minutos: 105 // 1h45min (cruza meia-noite)
```

## 📱 Responsividade

O card é otimizado para:
- **Desktop**: Largura completa
- **Tablet de Produção**: Classes `tab-prod:` aplicadas
- **Mobile**: Layout adaptativo

## 🎨 Estados Visuais

### Parada Ativa
- **Cor**: Laranja (border-orange-200, bg-orange-50)
- **Ícone**: 🔴 AlertCircle
- **Badge**: Vermelho com contador
- **Contador**: Atualiza em tempo real

### Parada Finalizada
- **Cor**: Cinza (border-gray-200, bg-gray-50)
- **Ícone**: ❌ XCircle
- **Duração**: Valor fixo calculado

### Sem Paradas
- **Ícone**: ✅ CheckCircle2 (verde)
- **Mensagem**: "Nenhuma parada em andamento"

## 🔄 Fluxo de Dados

```
1. Usuário clica "Parada"
   ↓
2. Preenche modal
   ↓
3. criarApontamentoParada()
   ↓
4. salvarParada() → localStorage
   ↓
5. setAtualizarParadas(prev => prev + 1)
   ↓
6. CardParadasAtivas re-renderiza
   ↓
7. buscarParadasEmAndamento(loteId)
   ↓
8. Exibe parada com contador em tempo real
   ↓
9. Usuário clica "Finalizar Parada"
   ↓
10. finalizarParada(id, horaFim, usuarioId)
    ↓
11. Calcula duracao_minutos automaticamente
    ↓
12. Atualiza localStorage
    ↓
13. Parada move para histórico
```

## 📊 Cálculo de Indicadores (Futuro)

### Tempo Total de Parada
```typescript
const paradas = buscarParadasFinalizadas(loteId)
const tempoTotal = paradas.reduce((acc, p) => acc + (p.duracao_minutos || 0), 0)
console.log(`Tempo total de parada: ${formatarDuracao(tempoTotal)}`)
```

### MTBF (Tempo Médio Entre Falhas)
```typescript
const falhas = paradas.filter(p => 
  p.codigo_parada_id.startsWith('NP-QUE-') // Quebras
)
const mtbf = tempoTotalOperacao / falhas.length
```

### MTTR (Tempo Médio para Reparo)
```typescript
const falhas = paradas.filter(p => 
  p.codigo_parada_id.startsWith('NP-QUE-')
)
const mttr = falhas.reduce((acc, p) => acc + (p.duracao_minutos || 0), 0) / falhas.length
```

### Disponibilidade
```typescript
const paradasIndisponibilidade = paradas.filter(p => {
  const codigo = codigosParada.find(c => c.id === p.codigo_parada_id)
  return codigo?.impacta_disponibilidade === true
})
const tempoIndisponibilidade = paradasIndisponibilidade.reduce(
  (acc, p) => acc + (p.duracao_minutos || 0), 0
)
const disponibilidade = ((tempoDisponivel - tempoIndisponibilidade) / tempoDisponivel) * 100
```

## 🐛 Debug e Testes

### Ver Paradas no localStorage
```javascript
// No console do navegador
const paradas = JSON.parse(localStorage.getItem('sysoee_paradas'))
console.table(paradas)
```

### Limpar Paradas
```javascript
// No console do navegador
localStorage.removeItem('sysoee_paradas')
```

### Exportar Paradas (Backup)
```typescript
import { exportarParadas } from '@/services/localStorage/parada.storage'
const json = exportarParadas()
console.log(json)
```

### Importar Paradas (Restaurar)
```typescript
import { importarParadas } from '@/services/localStorage/parada.storage'
const json = '...' // JSON exportado
importarParadas(json)
```

## 🔮 Próximos Passos

### Quando Migrar para Supabase

1. **Alterar flag**:
```typescript
// src/services/api/parada.api.ts
const USE_MOCK_DATA = false
```

2. **Migrar dados do localStorage** (opcional):
```typescript
const paradas = buscarTodasParadas()
for (const parada of paradas) {
  await supabase.from('tbapontamentoparada').insert(parada)
}
```

3. **Testar integração**:
- Criar parada → Verifica no Supabase
- Finalizar parada → Verifica atualização
- Buscar paradas → Verifica query

### Melhorias Futuras

- [ ] Adicionar badge "EM PARADA" no header da OP
- [ ] Notificação toast ao invés de alert
- [ ] Confirmação antes de finalizar parada
- [ ] Editar observação de parada ativa
- [ ] Cancelar parada (soft delete)
- [ ] Filtros no histórico (por tipo, data, etc.)
- [ ] Gráfico de Pareto de paradas
- [ ] Exportar relatório de paradas (PDF/Excel)

## ✅ Checklist de Implementação

- [x] Criar serviço de localStorage
- [x] Criar componente CardParadasAtivas
- [x] Integrar com API de paradas
- [x] Adicionar na página OperacaoDetalheOP
- [x] Implementar contador em tempo real
- [x] Implementar finalização de parada
- [x] Calcular duração automaticamente
- [x] Exibir histórico de paradas
- [x] Responsividade (desktop + tablet)
- [x] Documentação completa
- [ ] Migrar para Supabase (aguardando sinal)

## 🎉 Conclusão

A funcionalidade de **Paradas Ativas** está 100% implementada e funcional usando localStorage. O sistema:

✅ Registra paradas contemporaneamente (ALCOA+)
✅ Exibe paradas ativas em tempo real
✅ Calcula duração automaticamente
✅ Permite finalizar paradas com um clique
✅ Mantém histórico de paradas finalizadas
✅ Está pronto para migração para Supabase

**Aguardando sinal para migrar para Supabase!** 🚀

