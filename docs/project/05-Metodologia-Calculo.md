# Atividade 05 - Definição da Metodologia de Cálculo

## Objetivo
Estabelecer metodologia padronizada para cálculo do OEE, definindo fórmulas, variáveis, parâmetros e critérios de medição para garantir uniformidade, confiabilidade e validação da lógica antes da automação via SicFar.

## Importância
Garante que todos os envolvidos (gestores, operadores, engenheiros) estejam alinhados quanto aos critérios e fórmulas utilizadas para calcular o OEE.

## Componentes do OEE

### 1. Disponibilidade (%)

**Fórmula**:
```
Disponibilidade (%) = (Tempo de Operação / Tempo Disponível) × 100
```

**Onde**:
```
Tempo de Operação = Tempo Disponível - Paradas de Indisponibilidade
Tempo Disponível = Tempo Calendário - Paradas Estratégicas
```

**Unidade**: Percentual (%)

**Requisitos**:
- Cumulatividade de períodos (turno, dia, semana, mês, trimestre, semestre, ano)
- Seleção de dias específicos
- Seleção de diferentes linhas ou apenas uma linha

**Exemplo**:
- Equipamento X: 12h disponíveis, 2h de paradas
- Tempo operacional = 10h
- Disponibilidade = (10h / 12h) × 100 = 83,33%

### 2. Performance (%)

**Fórmula**:
```
Performance (%) = (Tempo Operacional Líquido / Tempo de Operação) × 100
```

**Onde**:
```
Tempo Operacional Líquido = Unidades Produzidas / Velocidade Nominal (Und/h)
```

**Unidade**: Percentual (%)

**Base de cálculo**: Sempre converter em horas todas as variáveis

**Exemplo**:
- Máquina X: 10h de Tempo de Operação
- 95.000 unidades produzidas
- Velocidade Nominal: 10.000 Und/h
- Tempo Operacional Líquido = 95.000 / 10.000 = 9,5h
- Performance = (9,5h / 10h) × 100 = 95,00%

### 3. Qualidade (%)

**Composta por duas parcelas**:

#### a) Qualidade por Unidades (Refugo e Desvios)
```
Qualidade Unidades (%) = (Unidades Boas / Unidades Produzidas) × 100
```

**Conversão em horas**:
```
Tempo de Unidades Boas = Unidades Boas / Velocidade Nominal (Und/h)
Tempo de Unidades Produzidas = Unidades Produzidas / Velocidade Nominal (Und/h)
```

#### b) Qualidade por Retrabalho
```
Qualidade Retrabalho (%) = ((Tempo de Operação - Tempo de Retrabalho) / Tempo de Operação) × 100
```

**Observação importante**: Retrabalho é classificado como perda de qualidade (não de disponibilidade), pois o processo está operando, apesar de ser um retrabalho. Isso evita falso entendimento de que o processo está "inoperante".

#### Qualidade Total
```
Qualidade (%) = Qualidade Unidades × Qualidade Retrabalho
```

**Tempo Valioso**:
```
Tempo Valioso = (Qualidade × Tempo Operacional Líquido) / 100
```

**Exemplo**:
- 95.000 unidades produzidas
- 90.000 unidades boas
- Velocidade Nominal: 10.000 Und/h
- Tempo Valioso = 90.000 / 10.000 = 9h
- Qualidade = (90.000 / 95.000) × 100 = 94,74%

### 4. OEE (%)

**Fórmula completa**:
```
OEE (%) = Disponibilidade × Performance × Qualidade
```

**Fórmula simplificada** (para uso cotidiano):
```
OEE (%) = (Unidades Boas / (Tempo Disponível × Velocidade Nominal)) × 100
```

**Exemplo completo**:
- Tempo Disponível: 12h
- Tempo de Operação: 10h
- Unidades Produzidas: 95.000
- Unidades Boas: 90.000
- Velocidade Nominal: 10.000 Und/h

**Cálculo**:
- Disponibilidade = 10h / 12h = 83,33%
- Performance = 95.000 / (10h × 10.000) = 95,00%
- Qualidade = 90.000 / 95.000 = 94,74%
- **OEE = 83,33% × 95,00% × 94,74% = 75,00%**

**Verificação (fórmula simplificada)**:
- OEE = 90.000 / (12h × 10.000) = 75,00% ✓

## Velocidade Nominal do Equipamento

### Definição
Tempo necessário para produzir uma unidade sob condições perfeitas de operação, sem interrupções, falhas ou variações.

### Considerações para Indústria Farmacêutica
- NÃO usar apenas capacidade nominal da máquina
- Usar **performance qualificada** (após qualificações e validações)
- Respeitar parâmetros de qualidade e segurança
- Aguardar aprovação da Diretoria

### Particularidades
- **Cada linha possui produtividade diferente para cada SKU produzido**
- Necessidade de contínuo controle e atualização
- Produção deve informar mudanças na configuração produtiva

### Produtividade por Setor

#### SPEP - Envase e Embalagem
10 linhas de envase + 10 linhas de embalagem, cada uma com múltiplos SKUs

#### SPPV - Envase e Embalagem
5 linhas de envase + 5 linhas de embalagem, cada uma com múltiplos SKUs

#### Líquidos Orais - Envase e Encartuchamento
3 linhas de envase + 2 encartuchadeiras, cada uma com múltiplos SKUs

#### CPHD
2 linhas, cada uma com múltiplos SKUs

**Nota**: Tabelas detalhadas de produtividade por SKU constam no documento original da Atividade 05.

## Requisitos do Sistema

### Cálculo no SicFar
O sistema deve:
1. Calcular **cada componente de forma separada** (Disponibilidade, Performance, Qualidade)
2. Apresentar **detalhamento de perdas** em relatórios e gráficos
3. Atender **nível estratégico, tático e operacional** simultaneamente
4. Permitir que diferentes níveis vejam informações relevantes:
   - Diretoria: taxa final de OEE
   - Operador/Supervisor: percentual de cada tipo de perda (quebra, falha, CIP/SIP, etc.)

### Diferença: OEE vs Taxa de Utilização
- **OEE**: usa Tempo Disponível como denominador
- **Taxa de Utilização**: usa Tempo Calendário como denominador

## Resultados Obtidos
- Metodologia de cálculo documentada e validada
- Áreas de Produção, Qualidade e Engenharia alinhadas
- Parâmetros e fórmulas revisadas e alinhadas com práticas de mercado
- Material validado tecnicamente para parametrização futura no SicFar
