# 2) Fluxo de Apontamento (Guia de Qualidade)

## 2.1 Motivo da solicitação: mover para a guia de Qualidade

O pedido de mover o apontamento de retrabalho para a **guia de Qualidade** faz sentido por três razões:

1. **Semântica do OEE**: retrabalho é perda de **Qualidade** (atividade 05).
2. **Evitar dupla penalização**: se retrabalho for tratado como parada, derruba Disponibilidade indevidamente.
3. **Cálculo exige tempo**: a fórmula de Qualidade_Retrabalho usa **tempo de retrabalho em horas**; registrar apenas “quantidade” não permite esse cálculo.

## 2.2 Campos recomendados (mínimo + recomendados)

### Campos atuais na tela (implementação em 18/12/2025)

- **Quantidade de unidades em retrabalho**
- **Motivo do retrabalho**

> Observação: o modelo/persistência já possuem `tempoRetrabalho` (em horas), porém o formulário ainda não possui campo para preenchê-lo e a tela salva `tempoRetrabalho = 0` (há um TODO no código).

### Campos alvo (aderentes ao que está explícito na especificação)

- **Hora inicial do retrabalho** (hh:mm)
- **Hora final do retrabalho** (hh:mm)

O sistema deriva:

- **Duração (minutos)**
- **Duração (horas)**

### Campos recomendados (melhoram rastreabilidade e análise; validar com stakeholders)

- **Motivo do retrabalho** (texto ou lista)
- **Observação** (texto livre)
- **Quantidade de unidades retrabalhadas** (para coerência tempo × volume)

## 2.3 Regras de validação no apontamento

### Regras na implementação atual

- Deve existir **apontamento de produção ativo** para permitir registrar qualidade.
- Deve informar **quantidade de perdas e/ou retrabalho** (pelo menos um deles > 0).
- Se houver retrabalho (> 0), o **motivo** é obrigatório.

### Regras temporais (alvo / recomendadas)

- Obrigatório informar hora inicial e final.
- A hora final deve ser **maior** que a hora inicial.
- Duração mínima recomendada: **> 0 min**.

### Regra de consistência com o turno

O retrabalho deve ocorrer **dentro do período do turno** (ou estar claramente associado ao turno), para manter cumulatividade e auditoria.

> Observação prática: caso existam turnos que cruzem meia-noite, o modelo deve trabalhar com **data + hora** (timestamps) para evitar ambiguidades.

### Regra de não extrapolar tempo de operação

O tempo total de retrabalho do período (somatório de intervalos) não pode ser maior que o **Tempo de Operação** do mesmo período.

## 2.4 Como o operador registra (passo a passo)

1. Seleciona Linha, Turno, Lote/OP (se aplicável).
2. Abre a guia **Qualidade**.
3. Em “Retrabalho”:
   - Preenche **Quantidade**.
   - Informa **Motivo** (obrigatório quando houver retrabalho).
   - (Futuro/alvo) preenche **Hora inicial** e **Hora final** (ou tempo em horas).
   - Confirma/Registra.
4. O sistema:
   - (Futuro/alvo) calcula a duração.
   - Persiste o evento com autor + timestamp (ALCOA+).
   - Atualiza o “histórico” do turno.

## 2.5 Apresentação no histórico (recomendação)

Cada retrabalho deve aparecer como uma linha no histórico, com:

- Data/hora do registro
- Intervalo (início → fim)
- Duração (min e horas)
- Motivo (se aplicável)
- Autor

Na implementação atual, o histórico de Qualidade registra tipo + quantidade e não exibe intervalo/duração de retrabalho.

## 2.6 Regras para edição/correção (ambiente regulado)

Para manter ALCOA+:

- Preferir **retificação** (novo registro de correção) em vez de “editar silenciosamente”.
- Exigir motivo da correção e vincular ao registro original.
