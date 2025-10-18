1. **Definição da metodologia de cálculo**

**1. Objetivo da Atividade**

Estabelecer uma metodologia padronizada para o cálculo do OEE (Overall Equipment Effectiveness), definindo fórmulas, variáveis, parâmetros e critérios de medição. A padronização tem como finalidade garantir a uniformidade dos dados, a confiabilidade dos indicadores e a validação da lógica de cálculo antes da automação via SicFar.

A definição da metodologia de cálculo é essencial porque ela garante que todos os envolvidos no processo (gestores, operadores, engenheiros, etc.) estejam alinhados quanto aos critérios e às fórmulas que serão utilizadas para calcular o OEE.

**2. Escopo da Definição**

Foram abordados os três principais componentes do OEE:

![](data:image/png;base64...)

**% de Disponibilidade -** Parte do OEE que representa o tempo em que o equipamento esteve realmente disponível para operar, em relação ao tempo disponível total. Leva em conta paradas não planejadas e planejadas (quando não estratégicas). Não considera paradas estratégicas no cálculo. Isto é, a quantidade de tempo em operação (quando se está produzindo produtos) dividido com o tempo disponível para operação. A diferença ocorre em função de tempos de parada.

**% de Performance -** Mede a eficiência da produção quando o equipamento está em operação. Compara a quantidade produzida versus a quantidade que deveria ter sido produzida no tempo disponível, considerando a velocidade nominal do processo. Isto é, a quantidade de tempo operacional líquido, equivalente ao tempo esperado do que foi produzido (quantidade produzida x tempo padrão), comparado ao tempo em operação. Também pode ser medido na relação entre a velocidade de produção realizada e a velocidade padrão. A diferença ocorre em função de realizar a operação abaixo do ritmo padrão devido à pequenas paradas não registradas, velocidades reduzidas na operação ou erros/falta de apontamentos de paradas ou qualidade.

**% de Qualidade -** Percentual de produtos considerados conformes em relação ao total produzido. Leva em conta perdas por refugo (unidades), retrabalho (conversão de horas de trabalho para realizar os retrabalhos) e desvios de especificação (unidades). Isto é, quantidade de tempo de valor agregado, equivalente ao tempo esperado na produção de produto bons (quantidade de produtos aprovados x tempo padrão), comparado ao tempo operacional líquido. A diferença ocorre em função de produtos não conformes reprovados.

**3. Fórmulas Padronizadas**

* 1. **Disponibilidade (%)**

![](data:image/png;base64...)

![](data:image/png;base64...)

É importante ressaltar que as paradas informadas acima, referem-se as perdas de disponibilidade, que compõe a árvore de perdas geral do OEE. Elas correspondem as indisponibilidades planejadas e não planejadas que serão detalhadas na atividade *Classificação e codificação de paradas.*

![](data:image/png;base64...)

Por se tratar de um indicador onde há divisão de Tempo de Operação (Unidade Horas) pelo Tempo Disponível (Unidade Horas), a unidade da taxa resultante é em porcentagem (%). Para a melhor performance da ferramenta, há obrigatoriedade desse indicador ter a possibilidade de em seu cálculo haver a cumulatividade de períodos estabelecidos. Isto é, além do valor da Disponibilidade por turno, dia, semana, mês, trimestre, semestre, ano e outros, é necessário que possa haver resultante de dias específicos, além de seleção de diferentes linhas de produção ou apenas uma linha.

Imagine um equipamento X com 12h disponíveis, com 2 horas de paradas, resulta-se em um tempo operacional de 10h.

* 1. **Performance (%)**

![](data:image/png;base64...)

![](data:image/png;base64...)

A base de cálculo dos componentes do OEE, deve ser realizada, sempre, com a conversão em horas das variáveis de suas fórmulas. Isto é, o Tempo de Operação Líquido será resultante da divisão de Unidades Produzidas (Unidade) dividido pela Velocidade Nominal do Equipamento (Unidade/Horas), por isso, a resultante desse cálculo será em Horas.

Assim como no cálculo do índice de disponibilidade há uma resultante em horas, Tempo Disponível, ao final do cálculo da porcentagem de performance, possuímos o Tempo Operacional Líquido (Unidade Horas) como resultante, a partir da fórmula abaixo:

![](data:image/png;base64...)

Seguindo exemplo inicial da Máquina X que teve em suas 10h de Tempo de Operação um total de 95.000 Unidades produzidas, admitindo que a Velocidade Nominal do Equipamento é de 10.000Und/H o seu tempo de operacional líquido seria de 9,5horas.

* 1. **Qualidade (%)**

O componente Qualidade, também, precisa obrigatoriamente, ser convertido em horas. Isto é, o Tempo de Unidades Boas (Unidade Horas) e Tempo de Unidades Produzidas (Unidade Horas) será o valor resultante da quantidade de unidades boas e produzidas, respectivamente, dividido pela velocidade nominal do equipamento (Unidade

Unidade/Horas). Essa metodologia será utilizada para cálculo do refugo e desvios de especificações, gerando descarte do produto, representando o componente unidade do indicador de qualidade.

![](data:image/png;base64...)

![](data:image/png;base64...)

![](data:image/png;base64...)

Porém, conforme descrição anterior, a qualidade também possui uma parcela de retrabalho, havendo necessidade de cálculo de perda de horas disponíveis do equipamento para realização de retrabalhos ou reprocessos.

Esse entendimento é fundamental, pois caso seja classificado como perda de disponibilidade aponta como tempo parado um tempo em operação, apesar de se estar operando um retrabalho. Para análise com foco na capacidade de gerar unidades boas não há problema, porém, pode gerar preliminarmente um falso entendimento que o processo está ficando ‘inoperante’ e não é o caso. Nesse caso ao se avaliar a disponibilidade considerar a causa da parada retrabalho como associada ao produto e não ao equipamento.

O racional de cálculo é similar ao cálculo da disponibilidade, sendo representado da seguinte forma:

![](data:image/png;base64...)

Por fim, a porcentagem de Qualidade será resultante do produto das duas taxas.

![](data:image/png;base64...)

Por fim, sssim como no cálculo do índice de disponibilidade e performance há uma resultante em horas, Tempo Disponível e Tempo Operacional Líquido (Unidade Horas), respectivamente, ao final do cálculo da porcentagem de qualidade, possuímos o Tempo Valioso como resultante, a partir da fórmula abaixo:

![](data:image/png;base64...)

Seguindo a explicação teórica com o exemplo anterior, das 95.000 Und produzidas, apenas 90.000 são consideradas Unidades Boas, por isso, dividindo esse valor pela velocidade nominal do equipamento, resulta-se em um tempo valioso de 9h.

**3.4 OEE (%)**

![](data:image/png;base64...)

Após o cálculo dos componentes do OEE de forma independente, a taxa do Overall Equipment Effectiveness, será resultado dos seus produtos. Como todas as variáveis estão em porcentagem (%) a Unidade do OEE também será expressa em porcentagem (%). No exemplo utilizado ao longo desse capítulo, foram produzidas 90.000 Unidades boas em um tempo disponível de 12h com velocidade nominal de 10.000 und/h, por isso, o OEE da linha é de 75%, sendo resultante de 90.000 / (12 x 10.000) = OEE = 75%.

Considerando cada um dos componentes do OEE temos:

* % Disponibilidade = 10h / 12h = 83,33%
* % Performance = 95.000 / (10 x 10.000 Und/h) = 95,0%
* % Qualidade = 90.000 / 95.000 = 94,74%
* OEE = 83,33% x 95,00% x 94,74% = 75,00%

Apesar da explicação detalhada de cada um dos componentes e variáveis do OEE parecer ser complexa e depender de diversos cálculos, há uma forma mais simples de ser calculado o OEE de uma determinada linha:

![](data:image/png;base64...)

No exemplo anterior, teríamos a seguinte memória de cálculo:

![](data:image/png;base64...)

Para a execução desse cálculo simplificado o mais importante é se ater as *Horas Diponíveis,* lembrando que essa duração é resultante das horas calendários subtraídos das paradas estratégicas. Por isso, o correto apontamento e precisão no somatório de paradas

estratégias são fundamentais para o cálculo correto do OEE, caso contrário, pode estar sendo calculado na verdade a taxa de utilização.

É importante ressaltar que esse cálculo simplificado deve ser utilizado no cotidiano de produção, para encontrar o valor final do OEE. A metodologia de cálculo do Sistema no SicFar deve calcular cada um dos componentes de forma separada, pois a interpretação da taxa final do OEE e de seus componentes depende da avaliação de cada perda de acordo com sua natureza.

O sistema proposto, precisa obrigatoriamente atender ao nível estratégico, tático e operacional simultaneamente, por isso, precisa em seu cálculo, relatórios e gráficos apresentar detalhamento de perdas. Isto é, da mesma forma que a Diretoria utilizará a ferramenta, e que para esse nível estratégico, o mais importante seja a taxa final de OEE, o operador ou supervisor também o utilizará, e para esses colaboradores, é fundamental entender quantos porcentos houve de quebra falha, interrupção devido atividade posterior ou de CIP/SIP , por exemplo, pois suas causas possuem diferentes processos ou agentes.

Por fim, é fundamental se ter o entendimento do conceito de Tempo Calendário que é o tempo total de um equipamento ou linha de produção, incluindo todas as horas do período analisado, sem descontar paradas ou folgas. No cálculo do OEE o denominador é o Tempo Disponível, já a Taxa de Utilização, utiliza o Tempo Calendário como denominador.

**4. Produtividade por Linha Produtiva**

A velocidade nominal do equipamento, define o tempo necessário para produzir uma unidade de produto sob condições perfeitas de operação, ou seja, sem interrupções, falhas ou variações. Ele representa a melhor performance possível da máquina ou linha de produção, sem nenhum tipo de perda, e é usado como referência para medir a eficiência real da produção.

A velocidade nominal do equipamento é determinada com base em variáveis, como o tipo de produto a ser fabricado **(por isso, na base de cálculo do OEE cada linha deve possuir uma produtividade para cada SKU produzido)**, os requisitos de qualidade e a velocidade máxima que a máquina ou linha de produção pode atingir em condições ideais.

Em uma indústria farmacêutica, a velocidade nominal do equipamento de uma máquina não pode ser definida apenas pela sua capacidade nominal, uma vez que o processo de produção envolve qualificações rigorosas que determinam os limites operacionais de cada equipamento. Durante as qualificações, as máquinas são avaliadas e ajustadas para garantir que operem dentro dos padrões de qualidade exigidos, e é essa performance qualificada que

deve ser considerado ao calcular a produtividade ideal. Isso significa que o comportamento real do equipamento em operação, após passar por todos os testes de validação e qualificação, é o que estabelece a sua capacidade efetiva, em vez da capacidade máxima teórica do equipamento.

Portanto, ao definir a velocidade nominal do equipamento na Farmace, deve-se levar em conta a produtividade que foi validada durante o processo de qualificação, respeitando os parâmetros de qualidade e segurança necessários, após aprovação da Diretoria. A capacidade nominal da máquina pode ser útil para algumas comparações, mas ela não reflete a realidade da operação, que é limitada pelas condições específicas estabelecidas durante as qualificações. Essa abordagem garante que o cálculo do OEE seja preciso e compatível com os requisitos regulatórios e as boas práticas de fabricação, assegurando que a produção atenda aos altos padrões exigidos pela indústria farmacêutica.

A tabela abaixo, resumos a produtividade ideal de cada equipamento que será controlado no Projeto do OEE SicFar. É importante ressaltar que os SKUs por linha apresentado abaixo, representam a atual configuração de produção, novos produtos e novas linhas podem ser incluídos, havendo necessidade de contínuo controle e alinhamento com a produção que informará cada atualização da condição produtiva.

**4.1 SPEP - ENVASE**

![](data:image/x-wmf;base64...)

![](data:image/x-wmf;base64...)

![](data:image/x-wmf;base64...)

**4.2 SPEP - EMBALAGEM**

![](data:image/x-wmf;base64...)

![](data:image/x-wmf;base64...)

![](data:image/x-wmf;base64...)

**4.3 SPPV - ENVASE**

![](data:image/x-wmf;base64...)

![](data:image/x-wmf;base64...)

![](data:image/x-wmf;base64...)**4.4 SPPV – EMBALAGEM**

![](data:image/x-wmf;base64...)

**4.5 LÍQUIDOS ORAIS – ENVASE**

![](data:image/x-wmf;base64...)

**4.6 LÍQUIDOS ORAIS – ENCARTUCHAMENTO**

![](data:image/x-wmf;base64...)

**4.7 CPHD**

![](data:image/x-wmf;base64...)

**5. Resultados Obtidos**

A partir das informações desse relatório, teremos a metodologia de cálculo documentada e validada com áreas de Produção, Qualidade e Engenharia, Parâmetros e fórmulas revisadas e alinhadas com práticas do mercado e Material validado tecnicamente para parametrização futura no SicFar.