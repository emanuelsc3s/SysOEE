# 🧪 Guia de Teste: Card de Paradas Ativas

## 🚀 Início Rápido

### 1. Acessar a Aplicação

```
http://localhost:8082/operacao/136592
```

(Ou qualquer outro número de OP disponível)

---

## 📝 Cenário de Teste 1: Registrar e Finalizar Parada

### Passo 1: Registrar uma Parada

1. **Clique no botão "Parada"** (ícone de pause ⏸️)
2. **Preencha o formulário:**
   - Classe: **Não Planejada**
   - Grande Parada: **Quebra/Falhas**
   - Apontamento: **Mecânica**
   - Grupo: **Equipamento**
   - Detalhamento: **Extrusão, Sopro**
   - Data: (pré-preenchida)
   - Hora: (pré-preenchida)
   - Turno: (detectado automaticamente)
   - Observações: "Quebra do cilindro de extrusão"
3. **Clique em "Registrar Parada"**

**Resultado esperado:**
- ✅ Modal fecha
- ✅ Mensagem de sucesso aparece
- ✅ **Card "Paradas em Andamento"** aparece na página
- ✅ Parada é exibida com contador em tempo real

### Passo 2: Observar o Contador

**O que você deve ver:**
```
┌─────────────────────────────────────────┐
│ 🔴 Paradas em Andamento (1)             │
├─────────────────────────────────────────┤
│ Quebra Mecânica - Equipamento           │
│ Início: 14:30 | Op. 1                   │
│ ⏱️ 00:00:05 ← Atualiza a cada segundo   │
│ [Finalizar Parada]                      │
└─────────────────────────────────────────┘
```

**Aguarde alguns segundos** e veja o contador aumentar:
- 00:00:05
- 00:00:06
- 00:00:07
- ...

### Passo 3: Finalizar a Parada

1. **Clique no botão "Finalizar Parada"**
2. **Aguarde** (botão mostra "Finalizando...")

**Resultado esperado:**
- ✅ Mensagem de sucesso com duração total
- ✅ Parada desaparece da seção "Em Andamento"
- ✅ Parada aparece no "Histórico de Paradas"

### Passo 4: Ver Histórico

1. **Clique em "📊 Histórico de Paradas (1)"**
2. **Veja a parada finalizada:**

```
┌─────────────────────────────────────────┐
│ 📊 Histórico de Paradas (1) [▼]         │
├─────────────────────────────────────────┤
│ Quebra Mecânica - Equipamento           │
│ Início: 14:30 | Fim: 14:35 | 00:05:23  │
└─────────────────────────────────────────┘
```

---

## 📝 Cenário de Teste 2: Múltiplas Paradas Simultâneas

### Passo 1: Registrar 3 Paradas Diferentes

**Parada 1:**
- Classe: Não Planejada
- Grande Parada: Quebra/Falhas
- Apontamento: Mecânica
- Observações: "Quebra do cilindro"

**Parada 2:**
- Classe: Não Planejada
- Grande Parada: Falta de Insumo
- Apontamento: Material
- Observações: "Falta de matéria-prima"

**Parada 3:**
- Classe: Planejada
- Grande Parada: Setup
- Apontamento: Troca de Produto
- Observações: "Troca de formato"

**Resultado esperado:**
```
┌─────────────────────────────────────────┐
│ 🔴 Paradas em Andamento (3)             │
├─────────────────────────────────────────┤
│ Quebra Mecânica - Equipamento           │
│ Início: 14:30 | Op. 1                   │
│ ⏱️ 00:02:15                              │
│ [Finalizar Parada]                      │
├─────────────────────────────────────────┤
│ Falta de Insumo - Material              │
│ Início: 14:31 | Op. 1                   │
│ ⏱️ 00:01:15                              │
│ [Finalizar Parada]                      │
├─────────────────────────────────────────┤
│ Setup - Troca de Produto                │
│ Início: 14:32 | Op. 1                   │
│ ⏱️ 00:00:15                              │
│ [Finalizar Parada]                      │
└─────────────────────────────────────────┘
```

### Passo 2: Finalizar Paradas em Ordem Diferente

1. **Finalize a parada do meio** (Falta de Insumo)
2. **Finalize a primeira** (Quebra Mecânica)
3. **Deixe a última ativa** (Setup)

**Resultado esperado:**
- ✅ Apenas 1 parada ativa (Setup)
- ✅ 2 paradas no histórico

---

## 📝 Cenário de Teste 3: Recarregar Página

### Passo 1: Registrar uma Parada

1. Registre uma parada qualquer
2. **NÃO finalize**

### Passo 2: Recarregar a Página

1. Pressione **F5** ou **Ctrl+R**
2. Aguarde a página carregar

**Resultado esperado:**
- ✅ Parada continua aparecendo como ativa
- ✅ Contador reinicia do zero (normal, pois usa hora atual)
- ✅ Dados persistem no localStorage

### Passo 3: Verificar localStorage

1. Abra o **Console do Navegador** (F12)
2. Digite:
```javascript
const paradas = JSON.parse(localStorage.getItem('sysoee_paradas'))
console.table(paradas)
```

**Resultado esperado:**
- ✅ Tabela com todas as paradas registradas
- ✅ Campos `hora_fim` = null para paradas ativas
- ✅ Campos `duracao_minutos` = null para paradas ativas

---

## 📝 Cenário de Teste 4: Parada que Cruza Meia-Noite

### Passo 1: Simular Parada Noturna

**No console do navegador:**
```javascript
// Adicionar parada manualmente que cruza meia-noite
const paradas = JSON.parse(localStorage.getItem('sysoee_paradas') || '[]')
paradas.push({
  id: 'parada-teste-meia-noite',
  linha_id: 'mock-linha-id',
  lote_id: '136592',
  codigo_parada_id: 'NP-QUE-MEC',
  turno_id: 'turno-3',
  data_parada: '2025-01-31',
  hora_inicio: '23:45:00',
  hora_fim: null,
  duracao_minutos: null,
  observacao: 'Teste meia-noite',
  criado_por_operador: 1,
  conferido_por_supervisor: null,
  conferido_em: null,
  created_at: new Date().toISOString(),
  created_by: 1,
  updated_at: new Date().toISOString(),
  updated_by: null,
  deleted_at: null,
  deleted_by: null
})
localStorage.setItem('sysoee_paradas', JSON.stringify(paradas))
location.reload()
```

### Passo 2: Finalizar a Parada

1. Clique em "Finalizar Parada"
2. Veja a duração calculada

**Resultado esperado:**
- ✅ Duração calculada corretamente (cruza meia-noite)
- ✅ Se agora for 00:15, duração = 00:30:00 (23:45 → 00:15)

---

## 📝 Cenário de Teste 5: Sem Paradas

### Passo 1: Limpar Todas as Paradas

**No console do navegador:**
```javascript
localStorage.removeItem('sysoee_paradas')
location.reload()
```

**Resultado esperado:**
- ✅ Card de paradas **NÃO aparece** na página
- ✅ Nenhum erro no console

---

## 🐛 Verificações de Debug

### Ver Todas as Paradas no localStorage

```javascript
const paradas = JSON.parse(localStorage.getItem('sysoee_paradas') || '[]')
console.table(paradas)
```

### Ver Paradas Ativas

```javascript
const paradas = JSON.parse(localStorage.getItem('sysoee_paradas') || '[]')
const ativas = paradas.filter(p => p.hora_fim === null)
console.table(ativas)
```

### Ver Paradas Finalizadas

```javascript
const paradas = JSON.parse(localStorage.getItem('sysoee_paradas') || '[]')
const finalizadas = paradas.filter(p => p.hora_fim !== null)
console.table(finalizadas)
```

### Calcular Tempo Total de Parada

```javascript
const paradas = JSON.parse(localStorage.getItem('sysoee_paradas') || '[]')
const finalizadas = paradas.filter(p => p.hora_fim !== null)
const tempoTotal = finalizadas.reduce((acc, p) => acc + (p.duracao_minutos || 0), 0)
console.log(`Tempo total de parada: ${Math.floor(tempoTotal / 60)}h ${Math.floor(tempoTotal % 60)}min`)
```

### Exportar Paradas (Backup)

```javascript
const paradas = JSON.parse(localStorage.getItem('sysoee_paradas') || '[]')
const json = JSON.stringify(paradas, null, 2)
console.log(json)
// Copie o JSON e salve em um arquivo
```

### Importar Paradas (Restaurar)

```javascript
const json = `[...]` // Cole o JSON aqui
localStorage.setItem('sysoee_paradas', json)
location.reload()
```

---

## ✅ Checklist de Testes

### Funcionalidades Básicas
- [ ] Registrar parada
- [ ] Parada aparece no card
- [ ] Contador atualiza em tempo real
- [ ] Finalizar parada
- [ ] Parada move para histórico
- [ ] Duração calculada corretamente

### Múltiplas Paradas
- [ ] Registrar 3+ paradas
- [ ] Todas aparecem no card
- [ ] Contadores independentes
- [ ] Finalizar em ordem diferente
- [ ] Histórico mostra todas finalizadas

### Persistência
- [ ] Recarregar página mantém paradas
- [ ] localStorage atualizado corretamente
- [ ] Dados não corrompem

### Edge Cases
- [ ] Parada que cruza meia-noite
- [ ] Sem paradas (card não aparece)
- [ ] Observação longa (trunca?)
- [ ] Múltiplas paradas do mesmo tipo

### Responsividade
- [ ] Desktop (1920x1080)
- [ ] Tablet (1000x400)
- [ ] Mobile (375x667)

### Performance
- [ ] Contador não trava a UI
- [ ] Finalizar parada é rápido
- [ ] Sem memory leaks (deixar aberto 10min)

---

## 🎯 Resultados Esperados

### ✅ Sucesso
- Card aparece apenas quando há paradas
- Contador atualiza suavemente (1s)
- Finalização é instantânea
- Histórico expande/colapsa
- Dados persistem no localStorage
- Sem erros no console

### ❌ Problemas Conhecidos
- Nenhum até o momento

---

## 📊 Métricas de Teste

### Tempo de Resposta
- Registrar parada: < 1s
- Finalizar parada: < 500ms
- Atualizar contador: 1s (exato)
- Recarregar página: < 2s

### Precisão
- Duração calculada: ±1 segundo
- Contador em tempo real: ±1 segundo
- Persistência: 100%

---

## 🎉 Conclusão

Se todos os testes passarem, a funcionalidade está **100% funcional** e pronta para uso!

**Próximo passo:** Aguardar sinal para migrar para Supabase. 🚀

