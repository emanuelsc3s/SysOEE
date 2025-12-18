# 1) Conceitos e Enquadramento

## 1.1 Definição (domínio)

**Retrabalho (reprocesso)**: produtos que precisam passar novamente por alguma etapa do processo produtivo para se tornarem conformes.

O ponto central é que o retrabalho **consome tempo de operação com baixo valor agregado** (tempo gasto para “corrigir” o produto), portanto ele é tratado como **perda de Qualidade**.

Referências:

- [docs/EspecificacaoUsuario/md/Atividade 07 - Última REV.md](../../EspecificacaoUsuario/md/Atividade%2007%20-%20%C3%9Altima%20REV.md)
- [docs/EspecificacaoUsuario/md/Atividade 05 - Última REV.md](../../EspecificacaoUsuario/md/Atividade%2005%20-%20%C3%9Altima%20REV.md)
- [docs/EspecificacaoUsuario/md/Retrabalho-Apontamento-e-Calculo.md](../../EspecificacaoUsuario/md/Retrabalho-Apontamento-e-Calculo.md)

## 1.2 Por que retrabalho NÃO é Disponibilidade

Na metodologia do OEE (atividade 05), o retrabalho **não pode ser tratado como “tempo parado”**, porque:

- Durante o retrabalho, **a linha está operando** (há atividade sendo executada).
- O problema é do **produto (qualidade)**, não do **equipamento (disponibilidade)**.
- Classificar como perda de disponibilidade **gera diagnóstico falso** de “linha inoperante”.

Em resumo:

- **Disponibilidade** mede tempo “apta a operar vs não operando por paradas”.
- **Retrabalho** mede tempo “operando, mas dedicado a recuperar conformidade”.

## 1.3 Relação com Paradas (importante para evitar duplo impacto)

Há uma confusão comum: “retrabalho aparece como parada”. Isso precisa ser evitado na lógica do OEE.

Regra de ouro:

1. Se um evento for registrado como **Retrabalho**, então **NÃO** deve entrar no somatório de **tempo de paradas** que alimenta a Disponibilidade.
2. O tempo do retrabalho deve ser somado separadamente (em horas) para compor **Qualidade_Retrabalho**.

## 1.4 O que deve (e o que não deve) ser registrado como retrabalho

### Deve ser retrabalho

- Reprocesso/retrabalho formal com início e término, executado na linha, para tornar produto conforme.
- Ajustes/ações que consumam tempo do turno com foco em recuperar um produto/lote.

### Não deve ser retrabalho

- Parada técnica do equipamento (quebra, falta de energia, manutenção, CIP/SIP etc.).
- “Pequenas paradas” e microinterrupções (regra de OEE: < 10 min impacta Performance, não Qualidade).
- Refugo (perda em unidades) — isso é outra categoria dentro de **Qualidade_Unidades**.

## 1.5 Unidade de medida: sempre horas (com registro por intervalo)

O usuário especifica que retrabalho deve ser medido como **duração da atividade** (tempo). Existem duas visões importantes aqui:

### Especificação-alvo (recomendado para BPF/ALCOA+)

- Registrar **hora inicial** e **hora final** (como paradas).
- O sistema calcula a duração (minutos) e converte para **horas** no cálculo do OEE.

Isso é aderente porque **duração = hora final − hora inicial**.

### Implementação atual (MVP localStorage)

- O formulário registra **quantidade** e **motivo** do retrabalho.
- O campo de tempo (**tempoRetrabalho**, em horas) existe no modelo e na persistência, porém **a tela ainda não coleta esse valor** (há um TODO), então o tempo é gravado como `0`.
- O que encontrei no código

A tela registra retrabalho com Quantidade + Motivo (sem campo de tempo): ApontamentoOEE.tsx:3590-3668
No salvamento, tempoRetrabalho está sendo gravado como 0 (há um TODO): ApontamentoOEE.tsx:2580-2680
O cálculo de Qualidade por retrabalho usa tempoRetrabalho (horas), então com 0 o impacto fica “zerado”: apontamento-oee.storage.ts:220-340

Implicação: o sistema preserva rastreabilidade mínima (quantidade+motivo), mas ainda não permite medir o impacto de retrabalho por tempo no OEE conforme a especificação.
