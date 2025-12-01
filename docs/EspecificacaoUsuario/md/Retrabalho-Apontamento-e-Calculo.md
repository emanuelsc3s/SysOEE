# Retrabalho: Apontamento e Impacto no Cálculo do OEE

## 📋 Índice

1. [Definição de Retrabalho](#definição-de-retrabalho)
2. [Documentos de Referência](#documentos-de-referência)
3. [Como o Retrabalho Deve Ser Apontado](#como-o-retrabalho-deve-ser-apontado)
4. [Impacto no Cálculo do OEE](#impacto-no-cálculo-do-oee)
5. [Fórmulas e Exemplos](#fórmulas-e-exemplos)
6. [Implementação no Sistema](#implementação-no-sistema)
7. [Observações Importantes](#observações-importantes)

---

## 1. Definição de Retrabalho

**Retrabalho** são produtos que precisam passar novamente por alguma etapa do processo produtivo para se tornarem conformes.

### Características Principais

- **Classificação**: Perda de **QUALIDADE** (não de Disponibilidade)
- **Impacto**: Reduz o componente Qualidade do OEE
- **Medição**: Tempo perdido para realizar o reprocesso/retrabalho
- **Registro**: Apontamento manual contemporâneo

### Diferença entre Retrabalho e Parada

| Aspecto | Retrabalho | Parada |
|---------|------------|--------|
| **Componente OEE** | Qualidade | Disponibilidade |
| **Estado da linha** | Em operação | Parada |
| **O que se perde** | Tempo para reprocessar | Tempo sem produzir |
| **Unidades produzidas** | Sim (reprocessadas) | Não |

---

## 2. Documentos de Referência

### 2.1 Atividade 07 - Identificação de Fontes de Dados

**Documento**: `docs/EspecificacaoUsuario/md/Atividade 07 - Última REV.md`

**Linha 17**:
> "Para o tempo necessário para realização de retrabalho/reprocessso haverá apontamento manual nos diários de bordo, **da duração da atividade**."

**Tabela Resumo (linha 163)**:

| Dado | Fonte | Observação |
|------|-------|------------|
| Retrabalho/Reprocesso | Apontamentos Manuais | **Duração da atividade** |

### 2.2 Atividade 05 - Metodologia de Cálculo

**Documento**: `docs/EspecificacaoUsuario/md/Atividade 05 - Última REV.md`

**Linha 19**:
> "% de Qualidade - Percentual de produtos considerados conformes em relação ao total produzido. Leva em conta perdas por refugo (unidades), **retrabalho (conversão de horas de trabalho para realizar os retrabalhos)** e desvios de especificação (unidades)."

**Linhas 63-65**:
> "Porém, conforme descrição anterior, a qualidade também possui uma parcela de retrabalho, havendo necessidade de **cálculo de perda de horas disponíveis do equipamento para realização de retrabalhos ou reprocessos**.
>
> Esse entendimento é fundamental, pois caso seja classificado como perda de disponibilidade aponta como tempo parado um tempo em operação, apesar de se estar operando um retrabalho. Para análise com foco na capacidade de gerar unidades boas não há problema, porém, pode gerar preliminarmente um falso entendimento que o processo está ficando 'inoperante' e não é o caso. Nesse caso ao se avaliar a disponibilidade considerar a causa da parada retrabalho como associada ao produto e não ao equipamento."

### 2.3 Atividade 04 - Glossário de Termos

**Documento**: `docs/EspecificacaoUsuario/md/Atividade 04 - Última REV.md`

**Linha 11**:
> "% de Qualidade - Percentual de produtos considerados conformes em relação ao total produzido. Leva em conta perdas por refugo (unidades perdidas), **retrabalho (tempo perdido para reprocesso/retrabalho)** e desvios de especificação/bloqueio de produto."

**Linha 55**:
> "Retrabalho: Produtos que precisam passar novamente por alguma etapa do processo produtivo para se tornarem conformes. Também influenciam o indicador de Qualidade."

---

## 3. Como o Retrabalho Deve Ser Apontado

### 3.1 Fonte de Dados

- **Fonte**: Apontamentos Manuais
- **Local de Registro**: Diários de Bordo (Impresso + Digital SicFar)
- **Responsável**: Operador da linha

### 3.2 Momento do Apontamento

O retrabalho deve ser registrado **contemporaneamente** (princípio ALCOA+ - Contemporâneo):

- ✅ Durante ou imediatamente após a atividade de retrabalho
- ✅ No mesmo turno em que ocorreu
- ❌ **NÃO** pode ser reconstruído posteriormente

### 3.3 Dados Obrigatórios Segundo Especificação Original

Conforme **Atividade 07**, o apontamento deve conter:

1. **Tempo de Retrabalho** (duração da atividade)
   - Formato: horas ou minutos
   - Conversão obrigatória para horas nos cálculos

### 3.4 Dados Adicionais na Implementação

A implementação atual do sistema inclui campos adicionais (não explicitamente mencionados nas especificações originais):

2. **Quantidade de Unidades em Retrabalho**
   - Rastreabilidade de quantas unidades foram retrabalhadas
   - Permite análise de proporção tempo/quantidade

3. **Motivo do Retrabalho**
   - Fundamental para análise de causa raiz
   - Permite identificar padrões e melhorias

4. **Observações**
   - Detalhes adicionais sobre o retrabalho

### 3.5 Princípios ALCOA+ Aplicados

| Princípio | Aplicação no Retrabalho |
|-----------|-------------------------|
| **Atribuível** | Registro deve ter autor (operador) e timestamp |
| **Legível** | Informações claras sobre tempo e motivo |
| **Contemporâneo** | Registro no momento da ocorrência (CRÍTICO) |
| **Original** | Sem reconstruções posteriores |
| **Exato** | Tempo preciso da atividade |
| **Completo** | Todos os dados relevantes presentes |
| **Consistente** | Sequência lógica e cronológica |
| **Durável** | Armazenamento seguro (banco + papel) |
| **Disponível** | Acessível para auditorias |

---

## 4. Impacto no Cálculo do OEE

### 4.1 Componente Afetado

O retrabalho afeta **EXCLUSIVAMENTE** o componente **Qualidade** do OEE.

```
OEE (%) = Disponibilidade × Performance × Qualidade
                                            ↑
                                    Retrabalho afeta aqui
```

### 4.2 Estrutura do Componente Qualidade

O componente Qualidade é composto por **DOIS** fatores multiplicados:

```
Qualidade (%) = Qualidade_Unidades × Qualidade_Retrabalho
```

Onde:
- **Qualidade_Unidades**: Relacionada a refugo e desvios (unidades perdidas)
- **Qualidade_Retrabalho**: Relacionada ao tempo perdido com retrabalho

### 4.3 Por Que Retrabalho NÃO Afeta Disponibilidade?

**Raciocínio fundamental** (Atividade 05, linhas 64-66):

> "Esse entendimento é fundamental, pois caso seja classificado como perda de disponibilidade aponta como tempo parado um tempo em operação, apesar de se estar operando um retrabalho."

**Explicação**:
- Durante o retrabalho, a linha **ESTÁ EM OPERAÇÃO**
- Não é tempo parado, é tempo produzindo (mesmo que reprocessando)
- Classificar como parada daria falsa impressão de equipamento inoperante
- O problema está no **produto** (qualidade), não no **equipamento** (disponibilidade)

---

## 5. Fórmulas e Exemplos

### 5.1 Fórmula do Componente Qualidade_Retrabalho

```
Qualidade_Retrabalho (%) = ((Tempo de Operação - Tempo de Retrabalho) / Tempo de Operação) × 100
```

**Conversão obrigatória**: Todos os tempos devem estar em **HORAS**

### 5.2 Exemplo Prático

**Cenário**:
- Linha A - Turno D1
- Tempo Disponível: 12 horas
- Paradas: 2 horas
- **Tempo de Operação**: 10 horas
- Unidades Produzidas: 95.000
- Unidades Boas: 90.000
- **Tempo de Retrabalho**: 30 minutos = 0,5 horas
- Velocidade Nominal: 10.000 und/h

**Cálculo**:

1. **Qualidade_Unidades**:
   ```
   Qualidade_Unidades = (90.000 / 95.000) × 100 = 94,74%
   ```

2. **Qualidade_Retrabalho**:
   ```
   Qualidade_Retrabalho = ((10 - 0,5) / 10) × 100
   Qualidade_Retrabalho = (9,5 / 10) × 100 = 95,00%
   ```

3. **Qualidade Total**:
   ```
   Qualidade = 94,74% × 95,00% = 90,00%
   ```

4. **OEE Final** (assumindo Disponibilidade = 83,33% e Performance = 95%):
   ```
   OEE = 83,33% × 95% × 90% = 71,25%
   ```

---

## 6. Implementação no Sistema

### 6.1 Estrutura de Dados (TypeScript)

```typescript
export interface ApontamentoQualidadeRetrabalho {
  id: string
  apontamentoProducaoId: string
  
  // Dados do retrabalho
  unidadesRetrabalho: number      // Quantidade de unidades
  tempoRetrabalho: number          // Tempo em HORAS
  motivoRetrabalho: string         // Motivo obrigatório
  observacao: string | null
  
  // Auditoria ALCOA+
  criadoPor: number
  criadoPorNome: string
  created_at: string
  updated_at: string
}
```

### 6.2 Banco de Dados (PostgreSQL)

```sql
CREATE TABLE tbapontamentoqualidade (
  id UUID PRIMARY KEY,
  lote_id UUID NOT NULL,
  linha_id UUID NOT NULL,
  turno_id INTEGER NOT NULL,
  
  tipo_perda tipo_perda_qualidade_enum NOT NULL,  -- 'RETRABALHO'
  
  -- Campos específicos
  tempo_retrabalho_minutos INTEGER CHECK (tempo_retrabalho_minutos >= 0),
  motivo TEXT,
  
  -- Validação: se tipo_perda = 'RETRABALHO', tempo deve ser > 0
  CONSTRAINT ck_qualidade CHECK (
    (tipo_perda = 'RETRABALHO' AND tempo_retrabalho_minutos > 0) OR
    (tipo_perda IN ('REFUGO', 'DESVIO', 'BLOQUEIO'))
  )
);
```

---

## 7. Observações Importantes

### 7.1 Diferenças entre Especificação e Implementação

| Aspecto | Especificação Original | Implementação Atual |
|---------|------------------------|---------------------|
| **Tempo de retrabalho** | ✅ Explicitamente mencionado | ✅ Implementado |
| **Quantidade de unidades** | ❌ NÃO mencionado | ✅ Implementado |
| **Motivo do retrabalho** | ❌ NÃO mencionado | ✅ Implementado |

**Nota**: A inclusão de quantidade e motivo são melhorias implementadas para:
- Rastreabilidade completa
- Análise de causa raiz
- Validação cruzada (tempo vs quantidade)
- Conformidade com BPF

### 7.2 Integração com TOTVS

- **Refugo**: DEVE ser sincronizado com TOTVS (obrigatório)
- **Retrabalho**: NÃO requer sincronização obrigatória com TOTVS

### 7.3 Backup Obrigatório

- Diário de Bordo Impresso é **OBRIGATÓRIO**
- Serve como backup em caso de falha do sistema
- Garante conformidade regulatória (BPF)

### 7.4 Validação Necessária

**Recomendação**: Como a quantidade de unidades em retrabalho NÃO está explicitamente nas especificações originais, é importante:

1. Validar com **Consultor Rafael Gusmão**
2. Documentar formalmente essa decisão
3. Incluir em ata de reunião ou adendo às especificações

---

## 📚 Referências Cruzadas

- **Cálculo de OEE**: `docs/project/05-Metodologia-Calculo.md`
- **Fontes de Dados**: `docs/project/07-Identificacao-Fontes-Dados.md`
- **Glossário**: `docs/project/04-Glossario-Termos.md`
- **Princípios ALCOA+**: `docs/EspecificacaoUsuario/md/Atividade 07 - Última REV.md`

---

**Documento criado em**: 2025-12-01  
**Baseado em**: Atividades 04, 05 e 07 das Especificações do Usuário  
**Versão**: 1.0

