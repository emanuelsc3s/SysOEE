# 5) Regras de Validação, ALCOA+ e Auditoria

## 5.1 ALCOA+ aplicado ao retrabalho

Em ambiente farmacêutico (BPF), o retrabalho precisa ser:

- **Atribuível**: quem registrou.
- **Contemporâneo**: registrado no momento do ocorrido.
- **Original e exato**: sem “reconstruções” retroativas.
- **Completo e consistente**: sem lacunas e com coerência com turno/lote.
- **Durável e disponível**: guardado e acessível em auditorias.

## 5.2 Validações obrigatórias (técnicas)

### Implementação atual (MVP)

- Deve existir **apontamento de produção ativo** para registrar qualidade.
- Deve haver pelo menos um dos campos preenchidos (> 0): perdas e/ou retrabalho.
- Se houver retrabalho (> 0), **motivo do retrabalho é obrigatório**.

> Gap conhecido: o tempo de retrabalho ainda não é coletado no formulário e é persistido como `0`, o que impede validações de coerência temporal e reduz a efetividade do cálculo.

### Validações alvo (quando o tempo de retrabalho estiver implementado)

- `inicio_retrabalho` e `fim_retrabalho` obrigatórios.
- `fim_retrabalho > inicio_retrabalho`.
- Duração calculada > 0.
- Soma de retrabalho no período <= $T_{op}$ do período.

## 5.3 Validações recomendadas (qualidade de dados)

- Não permitir intervalos sobrepostos de retrabalho no mesmo contexto (linha/turno/lote), ou ao menos alertar.
- Alertar se retrabalho ocorre “fora” do horário do turno.
- Exigir motivo quando o processo de validação aprovar que motivo é obrigatório.

## 5.4 Correções (retificação) e trilha de auditoria

### Regra recomendada

Em vez de editar um apontamento antigo e sobrescrever, preferir:

- Criar um **registro de correção** vinculado ao original, mantendo histórico.

> Nota: no MVP atual, há exclusão de registros no histórico de Qualidade; para aderência regulatória, recomenda-se migrar para retificação auditável (sem apagar definitivamente).

Campos úteis:

- `corrige_id` (FK para o registro original)
- `motivo_correcao`
- `corrigido_por`, `corrigido_em`

### Por que isso importa

Isso protege contra:

- perda de rastreabilidade
- alteração não justificada
- quebra de ALCOA+ (Original/Exato)

## 5.5 Diretriz: retrabalho não deve contaminar paradas

Se o sistema possuir códigos de parada com rótulo “Retrabalho”, a regra para OEE deve garantir:

- esses eventos não entrem no somatório de paradas de Disponibilidade; ou
- sejam reclassificados/mapeados internamente como eventos de Qualidade.

O objetivo é evitar dupla penalização e manter a interpretação correta.
