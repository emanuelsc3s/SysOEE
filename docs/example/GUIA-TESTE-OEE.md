# Guia de Testes - Cálculo de OEE

**Complemento de:** `IMPLEMENTACAO-CALCULO-OEE.md` e `EXEMPLOS-CODIGO-OEE.md`
**Data:** 16/11/2025

Este documento contém cenários de teste passo a passo para validar o cálculo de OEE.

---

## 🎯 OBJETIVO DOS TESTES

Validar que:
1. ✅ Apontamentos de produção são salvos corretamente
2. ✅ Apontamentos de qualidade (perdas e retrabalho) são salvos
3. ✅ Paradas são classificadas corretamente (estratégicas, grandes, pequenas)
4. ✅ OEE é calculado conforme metodologia (Disponibilidade × Performance × Qualidade)
5. ✅ Histórico de produção carrega dados reais do localStorage
6. ✅ OEE recalcula automaticamente após cada operação

---

## 🧪 CENÁRIO 1: Produção Perfeita (OEE = 100%)

### Objetivo
Validar que sem paradas, perdas ou retrabalhos, o OEE é 100%.

### Pré-condições
- localStorage limpo (executar `limparTodosApontamentos()` no console)

### Passos

#### Passo 1: Preencher Cabeçalho
```
Data: 16/11/2025
Turno: 1º Turno
Linha: Linha A (SPEP01)
SKU: SKU-001
Ordem de Produção: OP-12345
Lote: LOTE-TESTE-001
Dossie: DS-001
```

#### Passo 2: Apontar Produção
```
Hora Início: 07:00
Hora Fim: 19:00
Quantidade Produzida: 48000
```
👆 48.000 unidades em 12 horas = 4.000 und/h (velocidade nominal)

**Ação:** Clicar em "Apontar"

**Resultado Esperado:**
- ✅ Toast de sucesso: "Produção de 48.000 unidades registrada"
- ✅ Formulário limpo
- ✅ OEE exibido na sidebar: **100,00%**
  - Disponibilidade: 100,00%
  - Performance: 100,00%
  - Qualidade: 100,00%

#### Passo 3: Verificar Histórico
**Resultado Esperado:**
- ✅ Histórico mostra 1 registro:
  ```
  16/11/2025 07:00 | 07:00 | 19:00 | 48.000
  ```

#### Passo 4: Verificar Console
**Resultado Esperado:**
```javascript
✅ Apontamento de produção salvo: { id: "...", quantidadeProduzida: 48000, ... }
📊 Calculando OEE: { totalParadas: 0, totalPerdas: 0, totalRetrabalhos: 0 }
🎯 OEE Final: { oee: "100%" }
```

---

## 🧪 CENÁRIO 2: Produção com Parada Planejada

### Objetivo
Validar que paradas >= 10 min afetam Disponibilidade, mas não afetam Performance nem Qualidade.

### Pré-condições
- Cenário 1 completo (produção perfeita já registrada)

### Passos

#### Passo 1: Registrar Parada Planejada
```
Formulário: Tempo de Parada
Tipo: Planejado
Duração: 30 (minutos)
Motivo Nível 1: Máquina
Motivo Nível 2: Manutenção Preventiva
```

**Ação:** Clicar em "Registrar Tempo de Parada"

**Resultado Esperado:**
- ✅ Toast: "Parada de 30 minutos registrada. OEE recalculado."
- ✅ OEE recalculado:
  - **Disponibilidade: 95,83%** (11,5h / 12h)
  - Performance: 100,00% (não afetado)
  - Qualidade: 100,00% (não afetado)
  - **OEE: 95,83%**

#### Passo 2: Verificar Cálculo no Console
```javascript
🔍 Classificação de paradas: { grandes: 1, pequenas: 0, estrategicas: 0 }
⏱️ Tempos calculados (horas): {
  tempoDisponivel: 12,
  tempoParadasGrandes: 0.5, // 30 min = 0,5h
  tempoOperacao: 11.5
}
📈 Disponibilidade: { tempoOperacao: 11.5, tempoDisponivelAjustado: 12, disponibilidade: "95.83%" }
```

---

## 🧪 CENÁRIO 3: Produção com Pequenas Paradas

### Objetivo
Validar que paradas < 10 min afetam Performance, mas não afetam Disponibilidade.

### Pré-condições
- localStorage limpo:

```
// Limpa produção/qualidade usados pelo cálculo
localStorage.removeItem('sysoee_apontamentos_producao')
localStorage.removeItem('sysoee_apontamentos_perdas')
localStorage.removeItem('sysoee_apontamentos_retrabalho')

// Limpa paradas
localStorage.removeItem('sysoee_paradas')

// Limpa históricos mockados da página (se estiverem presentes)
localStorage.removeItem('oee_production_records')
localStorage.removeItem('oee_downtime_records')
```
### Passos

#### Passo 1: Apontar Produção
```
Lote: LOTE-TESTE-002
Hora Início: 07:00
Hora Fim: 19:00
Quantidade Produzida: 44000
```
👆 44.000 unidades em 12h = 3.666 und/h (abaixo da velocidade nominal)

**Resultado Esperado (sem paradas ainda):**
- Disponibilidade: 100,00%
- **Performance: 91,67%** (11h operacional / 12h operação) [44k / 4k/h = 11h]
- Qualidade: 100,00%
- **OEE: 91,67%**

#### Passo 2: Registrar 3 Pequenas Paradas
```
Parada 1: Tipo: Não Planejado, Duração: 5 minutos
Parada 2: Tipo: Não Planejado, Duração: 7 minutos
Parada 3: Tipo: Não Planejado, Duração: 8 minutos
```
Total: 20 minutos de pequenas paradas

**Resultado Esperado:**
- Disponibilidade: 100,00% (não afetado por pequenas paradas)
- **Performance: 91,67%** (mesmo valor - já estava refletido na quantidade produzida)
- Qualidade: 100,00%
- **OEE: 91,67%**

**Nota:** O Performance já estava menor porque a quantidade produzida (44k) já reflete o impacto das pequenas paradas.

---

## 🧪 CENÁRIO 4: Produção com Perdas de Qualidade

### Objetivo
Validar que perdas afetam Qualidade, mas não afetam Disponibilidade nem Performance.

### Pré-condições
- localStorage limpo

### Passos

#### Passo 1: Apontar Produção
```
Lote: LOTE-TESTE-003
Hora Início: 07:00
Hora Fim: 19:00
Quantidade Produzida: 48000
```

**Resultado Esperado:**
- Disponibilidade: 100,00%
- Performance: 100,00%
- Qualidade: 100,00%
- **OEE: 100,00%**

#### Passo 2: Registrar Perdas
```
Formulário: Qualidade
Perdas:
  Quantidade: 1000
  Motivo: Desvio de peso
```

**Ação:** Clicar em "Adicionar Registro de Qualidade"

**Resultado Esperado:**
- ✅ Toast: "Qualidade Registrada: 1000 unidades perdidas. OEE recalculado."
- ✅ OEE recalculado:
  - Disponibilidade: 100,00% (não afetado)
  - Performance: 100,00% (não afetado)
  - **Qualidade: 97,92%** ((48.000 - 1.000) / 48.000)
  - **OEE: 97,92%**

#### Passo 3: Verificar Console
```javascript
✨ Qualidade: {
  totalPerdas: 1000,
  unidadesBoas: 47000,
  qualidadeUnidades: "97.92%",
  qualidadeRetrabalho: "100%",
  qualidadeTotal: "97.92%"
}
```

---

## 🧪 CENÁRIO 5: Produção com Retrabalho

### Objetivo
Validar que retrabalho afeta Qualidade (componente tempo).

### Pré-condições
- Cenário 4 completo (produção com perdas)

### Passos

#### Passo 1: Registrar Retrabalho
```
Formulário: Qualidade
Retrabalho:
  Quantidade: 500
  Motivo: Embalagem danificada
```

**Ação:** Clicar em "Adicionar Registro de Qualidade"

**Cálculo Esperado:**
```
Tempo de Retrabalho = 500 und / 4.000 und/h = 0,125 horas
Qualidade_Retrabalho = ((12 - 0,125) / 12) × 100 = 98,96%
Qualidade_Unidades = 97,92% (do cenário anterior)
Qualidade Total = 0,9792 × 0,9896 = 96,90%
```

**Resultado Esperado:**
- Disponibilidade: 100,00%
- Performance: 100,00%
- **Qualidade: 96,90%**
- **OEE: 96,90%**

---

## 🧪 CENÁRIO 6: Produção Realista Completa

### Objetivo
Validar cálculo completo com todos os componentes (paradas, perdas, retrabalho).

### Pré-condições
- localStorage limpo

### Passos

#### Passo 1: Apontar Produção
```
Lote: LOTE-TESTE-004
Hora Início: 07:00
Hora Fim: 19:00
Quantidade Produzida: 40000
```

**OEE Inicial:**
- Disponibilidade: 100,00%
- Performance: 83,33% (10h / 12h) [40k / 4k/h = 10h]
- Qualidade: 100,00%
- **OEE: 83,33%**

#### Passo 2: Registrar Paradas
```
Parada 1: Planejado, 45 minutos, Manutenção Preventiva
Parada 2: Não Planejado, 30 minutos, Falta de Energia
Parada 3: Não Planejado, 8 minutos, Troca de Bobina
Parada 4: Não Planejado, 5 minutos, Micro Parada
```

**Classificação:**
- Paradas Grandes (>= 10 min): 45 + 30 = 75 min = 1,25h
- Pequenas Paradas (< 10 min): 8 + 5 = 13 min = 0,217h

**Cálculo:**
```
Tempo Disponível = 12h
Tempo de Operação = 12 - 1,25 = 10,75h
Disponibilidade = (10,75 / 12) × 100 = 89,58%

Tempo Operacional Líquido = 40.000 / 4.000 = 10h
Performance = (10 / 10,75) × 100 = 93,02%

OEE = 0,8958 × 0,9302 × 1,00 = 83,32%
```

**Resultado Esperado:**
- **Disponibilidade: 89,58%**
- **Performance: 93,02%**
- Qualidade: 100,00%
- **OEE: 83,32%**

#### Passo 3: Registrar Qualidade
```
Perdas: 800 unidades (Desvio de cor)
Retrabalho: 200 unidades (Etiqueta incorreta)
```

**Cálculo:**
```
Qualidade_Unidades = ((40.000 - 800) / 40.000) × 100 = 98,00%
Tempo_Retrabalho = 200 / 4.000 = 0,05h
Qualidade_Retrabalho = ((10,75 - 0,05) / 10,75) × 100 = 99,53%
Qualidade Total = 0,98 × 0,9953 = 97,54%

OEE = 0,8958 × 0,9302 × 0,9754 = 81,25%
```

**Resultado Esperado:**
- Disponibilidade: 89,58%
- Performance: 93,02%
- **Qualidade: 97,54%**
- **OEE: 81,25%**

---

## 🧪 CENÁRIO 7: Múltiplos Apontamentos no Mesmo Lote

### Objetivo
Validar que o histórico exibe múltiplos apontamentos e que o OEE é calculado individualmente.

### Pré-condições
- localStorage limpo

### Passos

#### Passo 1: Primeiro Apontamento
```
Lote: LOTE-TESTE-005
Hora Início: 07:00
Hora Fim: 12:00
Quantidade Produzida: 20000
```

**Resultado:** 1 registro no histórico

#### Passo 2: Segundo Apontamento (mesmo lote)
```
Lote: LOTE-TESTE-005
Hora Início: 13:00
Hora Fim: 19:00
Quantidade Produzida: 24000
```

**Resultado Esperado:**
- ✅ Histórico mostra **2 registros** (mais recente primeiro):
  ```
  16/11/2025 13:00 | 13:00 | 19:00 | 24.000
  16/11/2025 07:00 | 07:00 | 12:00 | 20.000
  ```

#### Passo 3: Adicionar Perdas no Segundo Apontamento
```
Perdas: 500 unidades
```

**Resultado Esperado:**
- ✅ OEE do **segundo apontamento** é recalculado (não afeta o primeiro)
- ✅ Qualidade = ((24.000 - 500) / 24.000) × 100 = 97,92%

---

## 🧪 CENÁRIO 8: Parada Estratégica

### Objetivo
Validar que paradas estratégicas são excluídas do Tempo Disponível.

### Pré-condições
- Implementar identificação de paradas estratégicas na função `identificarTipoParada()`

### Passos

#### Passo 1: Apontar Produção
```
Lote: LOTE-TESTE-006
Hora Início: 08:00
Hora Fim: 19:00
Quantidade Produzida: 40000
```

**OEE Inicial:**
- Tempo Disponível = 12h
- Tempo Operacional Líquido = 40.000 / 4.000 = 10h
- Performance = (10 / 12) × 100 = 83,33%
- **OEE: 83,33%**

#### Passo 2: Registrar Parada Estratégica
```
Tipo: Planejado
Duração: 60 minutos
Motivo: Setup de produto (trocar de SKU)
```

**Nota:** Para identificar como ESTRATEGICA, a observação deve conter "setup" ou "troca"

**Cálculo Esperado:**
```
Tempo Disponível = 12h
Tempo Estratégico = 1h
Tempo Disponível Ajustado = 12 - 1 = 11h

Disponibilidade = (11 / 11) × 100 = 100%
(Não há paradas planejadas/não planejadas, só estratégica)

Performance = (10 / 11) × 100 = 90,91%

OEE = 1,00 × 0,9091 × 1,00 = 90,91%
```

**Resultado Esperado:**
- **Disponibilidade: 100,00%** (estratégica não conta)
- **Performance: 90,91%** (ajustado pelo novo tempo disponível)
- Qualidade: 100,00%
- **OEE: 90,91%**

---

## 📋 CHECKLIST DE VALIDAÇÃO

### Apontamento de Produção
- [ ] Valida campos obrigatórios (data, turno, linha, SKU, lote)
- [ ] Valida hora início e hora fim
- [ ] Valida quantidade produzida > 0
- [ ] Calcula tempo de operação corretamente
- [ ] Salva no localStorage
- [ ] Limpa formulário após salvar
- [ ] Mostra toast de sucesso
- [ ] Atualiza OEE na sidebar

### Apontamento de Qualidade
- [ ] Valida que existe apontamento de produção
- [ ] Aceita apenas perdas, apenas retrabalho, ou ambos
- [ ] Salva perdas no localStorage
- [ ] Salva retrabalho no localStorage
- [ ] Recalcula OEE após salvar
- [ ] Limpa formulário após salvar
- [ ] Mostra toast de sucesso

### Apontamento de Paradas
- [ ] Valida campos obrigatórios
- [ ] Calcula duração corretamente
- [ ] Salva parada no localStorage
- [ ] Classifica parada corretamente (grande vs pequena)
- [ ] Recalcula OEE após salvar
- [ ] Limpa formulário após salvar
- [ ] Mostra toast de sucesso

### Cálculo de OEE
- [ ] **Disponibilidade** considera apenas paradas >= 10 min
- [ ] **Disponibilidade** exclui paradas estratégicas do tempo disponível
- [ ] **Performance** usa velocidade nominal (4.000 und/h)
- [ ] **Performance** é afetado por pequenas paradas < 10 min (implicitamente)
- [ ] **Qualidade_Unidades** calcula (produzidas - perdas) / produzidas
- [ ] **Qualidade_Retrabalho** calcula (tempo - retrabalho) / tempo
- [ ] **OEE** = Disponibilidade × Performance × Qualidade
- [ ] Todos os valores arredondados para 2 casas decimais

### Histórico
- [ ] Carrega apontamentos do lote selecionado
- [ ] Ordena por data/hora (mais recente primeiro)
- [ ] Limita a 10 registros
- [ ] Atualiza quando o lote muda
- [ ] Limpa quando nenhum lote está selecionado

### Logs no Console
- [ ] Mostra logs de salvamento (✅)
- [ ] Mostra logs de cálculo (📊)
- [ ] Mostra logs de classificação de paradas (🔍)
- [ ] Mostra logs de tempos calculados (⏱️)
- [ ] Mostra logs de OEE final (🎯)

---

## 🐛 TROUBLESHOOTING

### Problema: OEE não atualiza após adicionar parada

**Causa:** Parada pode não ter `duracao_minutos` calculado

**Solução:** Verificar que `calcularDuracaoMinutos()` está sendo chamado ao salvar parada

---

### Problema: Performance > 100%

**Causa:** Quantidade produzida maior que a capacidade nominal

**Análise:** Isso é possível se:
- Velocidade real > velocidade nominal
- Tempo de operação está incorreto

**Solução:** Validar que não há erro no cálculo de tempo de operação

---

### Problema: Disponibilidade > 100%

**Causa:** Tempo de operação maior que tempo disponível

**Solução:** Verificar classificação de paradas e cálculo de tempo disponível ajustado

---

### Problema: Histórico não carrega

**Causa:** `useEffect` não está sendo disparado

**Solução:** Verificar dependência `[lote]` no useEffect

---

## 📊 TABELA DE RESULTADOS ESPERADOS

| Cenário | Disp. | Perf. | Qual. | OEE | Descrição |
|---------|-------|-------|-------|-----|-----------|
| 1 | 100% | 100% | 100% | 100% | Perfeito |
| 2 | 95,83% | 100% | 100% | 95,83% | Com parada planejada |
| 3 | 100% | 91,67% | 100% | 91,67% | Com pequenas paradas |
| 4 | 100% | 100% | 97,92% | 97,92% | Com perdas |
| 5 | 100% | 100% | 96,90% | 96,90% | Com perdas + retrabalho |
| 6 | 89,58% | 93,02% | 97,54% | 81,25% | Realista completo |
| 8 | 100% | 90,91% | 100% | 90,91% | Com parada estratégica |

---

## ✅ CRITÉRIO DE ACEITAÇÃO

O sistema está aprovado se:

1. ✅ Todos os 8 cenários passam com valores esperados (tolerância: ±0,5%)
2. ✅ Histórico carrega corretamente
3. ✅ OEE recalcula automaticamente
4. ✅ Formulários limpam após salvar
5. ✅ Toasts aparecem corretamente
6. ✅ Logs no console estão claros e informativos
7. ✅ Não há erros no console do navegador

---

**Documento criado em:** 16/11/2025
**Versão:** 1.0
**Complementa:** IMPLEMENTACAO-CALCULO-OEE.md e EXEMPLOS-CODIGO-OEE.md
