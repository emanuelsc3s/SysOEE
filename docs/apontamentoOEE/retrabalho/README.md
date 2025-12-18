# Retrabalho (Reprocesso) — Guia Completo

Este conjunto de documentos descreve **como apontar, persistir e calcular o impacto de retrabalho** no Sistema OEE (SicFar), conciliando:

- **Especificação-alvo** (BPF/ALCOA+): retrabalho como **tempo** (duração) para impactar **Qualidade**.
- **Implementação atual (MVP localStorage)**: retrabalho é registrado na guia de Qualidade com **quantidade** e **motivo**; o campo **tempo de retrabalho** ainda não está no formulário.

## Objetivo

- Padronizar o entendimento do que é **retrabalho/reprocesso** no contexto de OEE.
- Definir o **fluxo de apontamento** (guia de Qualidade) e os **campos mínimos**.
- Formalizar o **cálculo do OEE** com o retrabalho impactando **Qualidade**.
- Definir **persistência** (modelo de dados) e regras de validação (incluindo ALCOA+).

## Estado atual da implementação (18/12/2025)

- O formulário de “Retrabalho” na tela de apontamento registra **Quantidade** e **Motivo**.
- O tempo de retrabalho (**tempoRetrabalho**, em horas) é persistido, porém **atualmente é gravado como `0`** (há um TODO para adicionar o campo no formulário).
- Consequência prática: no cálculo de OEE em tempo real, o fator **Qualidade_Retrabalho** fica efetivamente em **100%** (não há penalização por tempo), e a Qualidade é reduzida apenas por perdas em unidades.

> Esse ponto é crítico para coerência com a especificação (Atividade 05) e para integridade analítica: registrar retrabalho sem tempo mascara perdas por retrabalho.

## Princípios e fontes normativas

- **BPF / ALCOA+**: registro contemporâneo, rastreável e auditável.
- Especificação do usuário:
  - Atividade 05 — metodologia de cálculo (retrabalho como perda de **Qualidade**, em **horas**).
  - Atividade 07 — fontes de dados (retrabalho como **duração da atividade**, apontamento manual no diário de bordo).
  - Documento de referência: [docs/EspecificacaoUsuario/md/Retrabalho-Apontamento-e-Calculo.md](../../EspecificacaoUsuario/md/Retrabalho-Apontamento-e-Calculo.md)

## Decisão-chave (alinhada ao pedido do Sávio)

**Retrabalho deve ser apontado na guia de Qualidade e seu tempo deve impactar o OEE em Qualidade (Qualidade_Retrabalho), não em Disponibilidade.**

Na implementação atual, o apontamento está na guia de Qualidade, porém o **tempo** ainda não é coletado no formulário.

## Sumário

- [01-conceitos.md](01-conceitos.md) — Definições, escopo, o que é e o que não é retrabalho
- [02-fluxo-apontamento.md](02-fluxo-apontamento.md) — Como o operador registra (UX e regras)
- [03-calculo-oee.md](03-calculo-oee.md) — Fórmulas, conversões e exemplos
- [04-persistencia-modelo-dados.md](04-persistencia-modelo-dados.md) — Como persistir e relacionar com produção/turno
- [05-regras-validacao-alcoa.md](05-regras-validacao-alcoa.md) — Integridade, auditoria, correções e rastreabilidade
- [06-casos-teste.md](06-casos-teste.md) — Casos de teste e critérios de aceitação para validação/QO/QP

