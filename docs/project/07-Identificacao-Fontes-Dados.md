# Atividade 07 - Identificação de Fontes de Dados

## Objetivo
Determinar as origens dos dados necessários para cálculo do OEE, garantindo que as informações sejam precisas, rastreáveis e confiáveis.

## Justificativa
Em ambiente regulado e de alta exigência (indústria farmacêutica), dados inconsistentes ou incompletos podem comprometer análises, tomadas de decisão, eficiência produtiva e conformidade com normas regulatórias. Mapear as fontes permite otimizar processos de coleta, integrar sistemas e garantir rastreabilidade para auditorias.

## Fontes de Dados Identificadas

### Três grupos principais:
1. **CLPs (Controladores Lógicos Programáveis)**
2. **Apontamentos Manuais**
3. **TOTVS (ERP)**

## Dados por Fonte

### 1. Tempo de Paradas
**Fonte**: Apontamentos Manuais

**Registro**:
- Diários de Bordo Impressos
- SicFar (substituindo planilhas digitais)

**Locais com Diário de Bordo Digital atual**:
- SPEP: Um computador por linha nas áreas limpas
- SPPV: Um computador para todas as áreas

### 2. Quantidade Produzida (Envase)
**Fonte**: CLPs

**Equipamentos**:
- Envasadoras Bottelpack
- Envasadoras Pró Maquia
- Envasadoras Bausch Strobbel
- SPPV: Inspeção Eletrônica (também extraído do CLP)

**Base**: Procedimentos Operacionais Padrão (POP) de cada setor

### 3. Quantidade Produzida (Embalagem)
**Fonte**: Apontamentos Manuais

**Registro**: Após finalização de cada lote e turno
**Método**: Conferência física do total embalado

**Requisito crítico**:
- Absoluta integridade de dados
- Mesma informação transcrita em dossiês de produção
- Mesmo valor apontado no Sistema TOTVS

### 4. Unidades Boas
**Cálculo**: Total disponível para comercialização

**Exclusões**:
- Retém
- Amostras de Produto Semi-acabado
- Amostras de Produto Acabado

### 5. Dados de Qualidade (Refugo)
**Fonte**: Apontamentos Manuais + TOTVS

**Registro**:
- Contabilização física
- Integridade com dossiês de produção
- Integridade com apontamento no TOTVS

### 6. Dados de Qualidade (Retrabalho/Reprocesso)
**Fonte**: Apontamentos Manuais

**Registro**: Duração da atividade nos diários de bordo

## Diário de Bordo Impresso

### Obrigatoriedade
Todas as linhas controladas pelo OEE SicFar devem ter informações transcritas manualmente nos Diários de Bordo Impressos.

### Finalidades:
1. Outras finalidades dentro dos processos produtivos da Farmace
2. Segurança em casos de problema de rede ou base de dados SicFar
3. Guarda de informações por longo período

### Princípios ALCOA+

#### A - Atribuível
Toda entrada de dado associada a quem realizou e quando foi realizada. Garante responsabilidade individual e rastreabilidade.

#### L - Legível
Registros claros, fáceis de entender e permanentes. Sem dúvidas quanto à informação registrada.

#### C - Contemporâneo
Dados registrados no momento em que a atividade é realizada. Evita distorções ou esquecimentos e garante fidelidade cronológica.

#### O - Original
Registro feito na forma original ou cópia certificada fiel ao original. Evita manipulações ou reconstruções posteriores.

#### A - Exato
Informações corretas, completas e que refletem com precisão o que foi executado.

#### + Completo
Todos os dados relevantes presentes, inclusive desvios ou falhas. Nada omitido.

#### + Consistente
Registros seguem sequência lógica e cronológica, mantendo consistência com outros dados relacionados.

#### + Durável
Registros armazenados garantindo integridade ao longo do tempo, conforme período de retenção aplicável.

#### + Disponível
Informações prontamente acessíveis para revisões, auditorias e inspeções sempre que necessário.

## Preenchimento do Diário de Bordo Impresso

### Cabeçalho
- **Data**: formato dd/mm/aaaa
- **Turno**: D1, N1, etc.
- **Linha**: nome da linha produtiva

### Informações de Lote
- **Lote**: número do lote
- **Código TOTVS**: do produto (tabela em cada linha com códigos possíveis)
- Se ausência de produção: campos não preenchidos

### Produção Inicial
- Total já produzido do lote quando turno iniciou
- Zero (0) se turno iniciou sem produção
- Em lotes em processo: Produção Inicial do turno posterior = Produção Atual do turno anterior

### Produção Atual
- Total envasado de cada lote dentro do turno
- Cálculo: Produção Final - Produção Inicial
- Fonte: CLP (envase/inspeção) ou contabilização física (embalagem)

### Hora Início e Hora Final
- Formato: hh:mm
- Horário de produção do lote dentro de cada turno

### Totalizadores
Ao final do turno:
- Soma de produção de todos os lotes
- Somatório das perdas (refugo)

### Paradas
- Preenchimento contemporâneo
- **Código da parada**: conforme tabela de cada linha
- **Horário de início**: formato hh:mm
- **Horário de término**: formato hh:mm
- Registrar **todas** as paradas, mesmo inferiores a 10 minutos

### Assinaturas
- **Operador responsável** pela linha
- **Conferente**: encarregado ou supervisor

## Tabela Resumo de Fonte de Dados

| Dado | Fonte | Observação |
|------|-------|------------|
| Tempo de Paradas | Apontamentos Manuais | Diários de Bordo Impressos e SicFar |
| Quantidade Produzida (Envase) | CLPs | Bottelpack, Pró Maquia, Bausch Strobbel |
| Quantidade Produzida (Embalagem) | Apontamentos Manuais | Conferência física |
| Quantidade Produzida (Inspeção SPPV) | CLPs | Inspeção Eletrônica |
| Unidades Boas | Cálculo | Total comercializável (excluindo retém e amostras) |
| Refugo (Perdas de Produto) | Apontamentos Manuais + TOTVS | Contabilização física com integridade |
| Retrabalho/Reprocesso | Apontamentos Manuais | Duração da atividade |

**Nota**: Tabela detalhada consta no documento original da Atividade 07.
