# 6) Casos de Teste (Validação do Retrabalho)

Este conjunto de testes serve como base para validação técnica (QI/QO/QP) e para evitar regressões.

## CT-RT-01 — Registrar retrabalho (implementação atual)

**Dado** um turno aberto e um apontamento de produção selecionado
**Quando** o operador registra retrabalho com quantidade > 0 e motivo preenchido
**Então** o sistema salva o evento com autor e timestamp e atualiza o histórico de Qualidade.

## CT-RT-02 — Bloquear retrabalho sem motivo (implementação atual)

**Quando** o operador informa quantidade de retrabalho > 0 e não preenche o motivo
**Então** o sistema bloqueia e informa “Informe o motivo do retrabalho”.

## CT-RT-03 — Soma de retrabalho não pode exceder tempo de operação (alvo)

**Dado** $T_{op}= 4h$
**Quando** o operador tenta registrar retrabalho totalizando 5h
**Então** o sistema bloqueia (ou exige justificativa e revisão), pois viola integridade.

## CT-RT-04 — Retrabalho impacta Qualidade (não Disponibilidade) (alvo)

**Dado** um período com $T_{disp}=12h$, $T_{par}=2h$, $T_{op}=10h$
**E** $T_{rt}=0,5h$
**Quando** o OEE é recalculado
**Então** Disponibilidade permanece baseada em $T_{op}/T_{disp}$
**E** Qualidade_Retrabalho = $\left(1 - \frac{0,5}{10}\right)\times100 = 95\%$.

## CT-RT-05 — Não permitir retrabalho sem tempo (alvo)

**Quando** o operador tenta registrar retrabalho apenas com quantidade
**Então** o sistema recusa (tempo é obrigatório para cálculo).

> Observação: no MVP atual, o sistema permite registrar retrabalho sem tempo e salva `tempoRetrabalho=0`, portanto este caso de teste falha por definição e deve ser marcado como pendente até a implementação do campo.

## CT-RT-06 — Auditoria ALCOA+

**Quando** um retrabalho é criado
**Então** o registro contém: autor, data/hora do registro, integridade do intervalo, e fica disponível no histórico.

> Observação: no MVP atual, o autor ainda está hardcoded/placeholder; para ALCOA+ pleno, deve vir do contexto de autenticação.

## CT-RT-07 — Retificação (correção auditável)

**Dado** um retrabalho registrado com horário incorreto
**Quando** o operador (ou supervisor) corrige
**Então** o sistema mantém o registro original e cria um novo com referência e motivo de correção.
