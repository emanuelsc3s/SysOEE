**PROJETO OEE – SICFAR**

1. **Levantamento do Processo Atual (AS-IS)**

**2.1 Introdução**

A presente atividade tem como finalidade mapear e documentar o processo atual de coleta e consolidação dos dados para cálculo do OEE (Overall Equipment Effectiveness) na planta, cuja base está estruturada no uso de planilhas eletrônicas (Excel). Esse levantamento será utilizado como referência para análise crítica e proposição de melhorias, tanto no fluxo de dados quanto na precisão e integridade das informações.

**2.2 Mapeamento do Processo Atual**

O preenchimento das planilhas de dados é realizado diariamente nos seguintes setores:

* SPEP: O preenchimento é feito de forma contemporânea pelos operadores de envase, utilizando computadores localizados nas próprias áreas.
* SPPV: Os dados são consolidados pelo encarregado da área limpa e inseridos em um único computador da região.
* Líquidos Orais e CPHD: Nesses setores, a documentação ou os gestores realizam o preenchimento dos dados em um computador fora da área limpa, uma vez que essa não possui infraestrutura de TI local.

Como contingência, existe também o preenchimento manual em diário de bordo impresso, o que permite um duplo check e mitiga riscos de perda de dados, seja por falhas de rede ou indisponibilidade momentânea dos equipamentos.

**2.3 Consolidação e Análise dos Dados**

Semanalmente, às segundas-feiras, os dados coletados nas 16 linhas de envase são consolidados em uma planilha-mestra. Esta planilha central é responsável por alimentar dashboards e relatórios utilizados para cálculo do OEE e indicadores complementares como:

* MTBF (Tempo Médio entre Falhas)
* MTTR (Tempo Médio de Reparo)

Outros recursos analíticos da planilha incluem:

* Histórico semanal de ocorrências;
* Classificação das principais causas de parada;
* Histogramas ordenados das maiores perdas;
* Análise individualizada por linha;
* Consolidação mensal dos indicadores de disponibilidade.

Cabe destacar que a planilha é também utilizada como fonte de evidências em investigações de desvios de qualidade, sendo frequente a utilização de prints de tela como documentação formal.

**2.4 Cálculo de Qualidade e Desempenho**

A métrica de Qualidade é calculada apenas ao final de cada mês, com base na consolidação das perdas em cada etapa do processo. A partir desses dados, é então calculado o Desempenho, garantindo que todas as três variáveis do OEE estejam alinhadas em termos de base temporal e método de apuração.

**2.5 Estrutura de Classificação das Paradas**

O modelo atual categoriza as paradas do OEE em cinco níveis hierárquicos:

1. Natureza da Parada: Exemplo - Indisponibilidade Não Planejada
2. Setor Responsável pela Parada: Exemplo - Não Planejadas Produção
3. Tipo: Exemplo - Quebra/Falhas
4. Grupo: Exemplo - Mecânica
5. Detalhamento: Exemplo - Extrusão, Sopro e Formação de Ampola

Essa estratificação permite realizar uma análise detalhada das ocorrências, com base nas 16 Grandes Perdas do TPM, facilitando a identificação de pontos críticos e a proposição de ações corretivas.

Importante frisar que o cálculo do OEE, conforme realizado atualmente nas planilhas, não considera as Paradas Estratégicas como parte do tempo disponível. A fórmula utilizada é:

Tempo Disponível = Tempo Calendário - Paradas Estratégicas

**2.6 Considerações Finais e Pontos de Melhoria**

O processo atual demonstra alto grau de detalhamento e responsabilidade por parte das equipes envolvidas, contudo, é passível de melhorias importantes:

* Centralização e Integração dos Dados: Eliminar a necessidade de consolidação manual, reduzindo riscos de erro humano.
* Digitalização do Duplo Check: Criar redundância digital em vez de impressa, otimizando espaço e tempo de consulta.
* Automatização de Indicadores: Permitir atualização em tempo real dos indicadores.
* Acesso Multissetorial: Garantir acesso padronizado e simultâneo para todas as áreas.

Todos os marcos deste levantamento serão revisados e validados tecnicamente pelo Consultor Rafael Gusmão, antes da transição para as próximas etapas do projeto.