# 3) Cálculo do OEE com Retrabalho

## 3.1 Lembrete: OEE e seus componentes

$$\text{OEE} = \text{Disponibilidade} \times \text{Performance} \times \text{Qualidade}$$

O retrabalho afeta **somente Qualidade**.

## 3.2 Conversões obrigatórias

- Todas as variáveis temporais devem ser convertidas para **horas** no cálculo.
- O apontamento pode ser feito por intervalo (início/fim), mas o cálculo usa a **duração em horas**.

## 3.3 Definições operacionais (no período analisado)

- $T_{cal}$ = tempo calendário
- $T_{estr}$ = paradas estratégicas
- $T_{disp}$ = tempo disponível
- $T_{par}$ = tempo de paradas que impactam disponibilidade (exclui paradas estratégicas; pequenas paradas < 10 min seguem regra de Performance)
- $T_{op}$ = tempo de operação
- $T_{rt}$ = tempo de retrabalho (soma das durações de retrabalho)

$$T_{disp} = T_{cal} - T_{estr}$$
$$T_{op} = T_{disp} - T_{par}$$

## 3.4 Onde entra o retrabalho

### Disponibilidade

$$\text{Disponibilidade} = \frac{T_{op}}{T_{disp}} \times 100$$

**Regra:** $T_{rt}$ **não** entra em $T_{par}$.

### Qualidade

A especificação organiza Qualidade em dois fatores:

$$\text{Qualidade} = \text{Qualidade\_Unidades} \times \text{Qualidade\_Retrabalho}$$

#### Qualidade_Unidades

Forma equivalente (conceitual): unidades conformes / unidades produzidas.

#### Qualidade_Retrabalho (tempo)

$$\text{Qualidade\_Retrabalho} = \left(1 - \frac{T_{rt}}{T_{op}}\right) \times 100$$

Observações importantes:

- Se $T_{op} = 0$, a métrica precisa ser definida (ex.: 0% ou “não aplicável”).
- Se $T_{rt} > T_{op}$, há erro de apontamento (deve bloquear/alertar).

## 3.4.1 Implementação atual (MVP localStorage) — comportamento observado

Na implementação atual da tela de Qualidade:

- O retrabalho é registrado com **quantidade** e **motivo**.
- O campo de tempo (`tempoRetrabalho`, em horas) existe no modelo/persistência, porém está sendo salvo como **`0`** (há um TODO para adicionar o campo no formulário).

Conseqüência no cálculo:

- $T_{rt}$ fica efetivamente **zero**, então $\text{Qualidade\_Retrabalho} \approx 100\%$.
- A Qualidade total cai apenas por perdas em unidades (Qualidade_Unidades), e não por tempo de retrabalho.

## 3.5 Exemplo numérico (completo)

Dados do período:

- $T_{cal} = 12\,h$
- $T_{estr} = 0\,h$ → $T_{disp} = 12\,h$
- $T_{par} = 2\,h$ → $T_{op} = 10\,h$
- Retrabalho: 07:30–08:00 → $T_{rt} = 0{,}5\,h$

Então:

$$\text{Qualidade\_Retrabalho} = \left(1 - \frac{0{,}5}{10}\right)\times100 = 95\%$$

Qualidade final:

- Se $\text{Qualidade\_Unidades} = 94{,}74\%$:
$$\text{Qualidade} = 94{,}74\% \times 95\% = 90{,}00\%$$

## 3.6 Anti-padrões que quebram o cálculo

- Registrar apenas “quantidade retrabalhada” sem tempo.
- Salvar tempo como zero (retrabalho não impacta o OEE e mascara perdas).
- Tratar retrabalho como “parada” e subtrair de $T_{par}$ (derruba Disponibilidade indevidamente).
