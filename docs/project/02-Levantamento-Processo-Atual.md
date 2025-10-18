# Atividade 02 - Levantamento do Processo Atual (AS-IS)

## Objetivo
Mapear e documentar o processo atual de coleta e consolidação dos dados para cálculo do OEE na planta, utilizando planilhas Excel como base.

## Processo Atual de Preenchimento

### Por Setor

#### SPEP
- Preenchimento contemporâneo pelos operadores de envase
- Computadores localizados nas próprias áreas

#### SPPV
- Dados consolidados pelo encarregado da área limpa
- Um único computador na região

#### Líquidos Orais e CPHD
- Preenchimento pela documentação ou gestores
- Computador fora da área limpa (sem infraestrutura de TI local)

### Contingência
- Preenchimento manual em diário de bordo impresso
- Duplo check para mitigar riscos de perda de dados
- Proteção contra falhas de rede ou indisponibilidade de equipamentos

## Consolidação e Análise de Dados

### Frequência
- **Semanal**: Consolidação às segundas-feiras
- **16 linhas de envase**: Dados alimentam planilha-mestra

### Planilha-Mestra
**Indicadores calculados**:
- OEE (Overall Equipment Effectiveness)
- MTBF (Tempo Médio entre Falhas)
- MTTR (Tempo Médio de Reparo)

**Recursos analíticos**:
- Histórico semanal de ocorrências
- Classificação das principais causas de parada
- Histogramas ordenados das maiores perdas
- Análise individualizada por linha
- Consolidação mensal de indicadores de disponibilidade

**Uso adicional**:
- Fonte de evidências em investigações de desvios de qualidade
- Prints de tela usados como documentação formal

## Cálculo de Indicadores

### Qualidade e Desempenho
- Métrica de **Qualidade**: calculada ao final de cada mês
- Base: consolidação das perdas em cada etapa do processo
- **Desempenho**: calculado após a qualidade
- Garantia de alinhamento temporal e metodológico das três variáveis do OEE

## Estrutura de Classificação das Paradas

### Hierarquia (5 níveis):
1. **Natureza da Parada**: Ex: Indisponibilidade Não Planejada
2. **Setor Responsável**: Ex: Não Planejadas Produção
3. **Tipo**: Ex: Quebra/Falhas
4. **Grupo**: Ex: Mecânica
5. **Detalhamento**: Ex: Extrusão, Sopro e Formação de Ampola

### Base
- Estratificação baseada nas **16 Grandes Perdas do TPM**
- Facilita identificação de pontos críticos
- Suporta proposição de ações corretivas

### Cálculo do Tempo Disponível
```
Tempo Disponível = Tempo Calendário - Paradas Estratégicas
```

**Observação**: Paradas Estratégicas NÃO são consideradas no tempo disponível para cálculo do OEE

## Pontos de Melhoria Identificados

### 1. Centralização e Integração dos Dados
- Eliminar necessidade de consolidação manual
- Reduzir riscos de erro humano

### 2. Digitalização do Duplo Check
- Criar redundância digital em vez de impressa
- Otimizar espaço e tempo de consulta

### 3. Automatização de Indicadores
- Permitir atualização em tempo real dos indicadores

### 4. Acesso Multissetorial
- Garantir acesso padronizado e simultâneo para todas as áreas

## Validação
Todos os marcos deste levantamento serão revisados e validados tecnicamente pelo **Consultor Rafael Gusmão** antes da transição para as próximas etapas do projeto.
