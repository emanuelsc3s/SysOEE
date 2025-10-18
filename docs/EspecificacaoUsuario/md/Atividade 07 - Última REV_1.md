**IDENTIFICAÇÃO DE FONTES DE DADOS**

**1. Objetivo**

Determinar as origens dos dados necessários para o cálculo do OEE, garantindo que as informações utilizadas sejam precisas, rastreáveis e confiáveis. As fontes analisadas contemplam dados provenientes de Controladores Lógicos Programáveis (CLP), apontamentos manuais e sistemas corporativos como ERP.

**2. Justificativa**

A correta identificação das fontes de dados é fundamental para assegurar a integridade e confiabilidade dos indicadores de OEE, que dependem diretamente da qualidade dos dados coletados. Em um ambiente regulado e de alta exigência, como a indústria farmacêutica, dados inconsistentes ou incompletos podem comprometer análises e tomadas de decisão, impactando a eficiência produtiva e a conformidade com normas regulatórias. Além disso, mapear as fontes permite otimizar os processos de coleta, integrar sistemas e garantir a rastreabilidade necessária para auditorias internas e externas.

**3. Fontes de Dados Identificadas**

![](data:image/png;base64...) As fontes de dados utilizados no projeto de OEE SicFar serão divididas, em três grupos principais: CLP’s, Apontamentos Manuais e TOTVS. Para garantir o cálculo preciso do OEE, é fundamental definir quais dados e suas respectivas fontes, que incluem: tempo de paradas, quantidade produzida (envasado e embalado) e dados relacionados à qualidade, como taxas de rejeição e retrabalho. Os tempos de paradas, nesse primeiro momento, serão identificados e apontados manualmente nos Diários de Bordo Impressos e SicFar (substituindo as planilhas digitais). Atualmente apenas as áreas limpas do SPEP (um computador por linha) e SPPV (um computador para todas as áreas) possuem Diário de Bordo Digital, conforme figura abaixo:

A quantidade produzida, será extraída diretamente dos CLP’s das envasadoras Bottelpack, Pró Maquia e Bausch Strobbel. No caso do SPPV, a etapa de Inspeção Eletrônica também terá seus valores de produção extraído do CLP dos equipamentos. Apenas a etapa de embalagem, terá registro manual, após finalização de cada lote e turno de trabalho a partir da conferência física do total embalado. Essas informações serão calculadas a partir dos Procedimentos Operacionais Padrão (POP) de cada um dos setores produtivos. É importante ressaltar, que o cálculo do total embalado de cada lote deverá ter absoluta integridade de dados tal qual a informação será transcrita nos dossiês de produção e posterior apontamento de produção no Sistema TOTVS. O número total de unidades boas, deverá considerar apenas o que será disponível para a comercialização, dessa forma, serão excluídas perdas inerentes ao processo como Retém, Amostras de Produto Semi-acabado e Produto Acabado.

Os dados relacionados a qualidade seguirão o mesmo racional. Para o tempo necessário para realização de retrabalho/reprocessso haverá apontamento manual nos diários de bordo, da duração da atividade. Já os dados de refugo (perda de produto) seguirão a partir da contabilização física com total integridade de dados com as informações que serão transcritas nos dossiês de produção e posterior apontamento de produção no Sistema TOTVS.

![](data:image/png;base64...)É importante ressaltar que, todas as linhas que serão controladas pelo OEE SicFar deverão ter suas informações transcritas manualmente para os Diários de Bordo Impressos pois esses dados serão utilizados para outras finalidades dentro dos processos produtivos da Farmace, além disso, será uma segurança em casos de problema de rede ou na base de dados SicFar, permitindo a guarda das informações por um longo período de tempo. Abaixo, um dos exemplos de Diário de Bordo vigente.

**4. Preenchimento do Diário de Bordo Impresso**

O correto preenchimento do Diário de Bordo Impresso é fundamental para garantir a veracidade e integridade das informações a serem transferidas ao OEE SicFar. O preenchimento do Diário de Bordo deve seguir rigorosamente os princípios do ALCOA+, reconhecidos internacionalmente pelas agências reguladoras (como FDA e ANVISA) como base para a integridade de dados em ambientes fabris.

O ALCOA+ é um conjunto de princípios orientadores para garantir a integridade, rastreabilidade e confiabilidade de dados em processos regulados. Seu nome é um acrônimo dos princípios fundamentais que definem como as informações devem ser registradas e mantidas, especialmente em ambientes da indústria farmacêutica e de ciências da vida. Abaixo, seguem seus principais princípios.

Atribuível: Toda entrada de dado deve estar claramente associada a quem realizou a atividade e quando foi realizada. Isso garante a responsabilidade individual e rastreabilidade.

Legível: Os registros devem ser claros, fáceis de entender e permanentes. Não devem haver dúvidas quanto à informação registrada.

Contemporâneo: Os dados devem ser registrados no momento em que a atividade é realizada. Isso evita distorções ou esquecimentos e garante fidelidade cronológica.

Original: O registro deve ser feito na forma original ou uma cópia certificada fiel ao original. Evita manipulações ou reconstruções posteriores dos dados.

Exato: As informações devem ser corretas, completas e refletir com precisão o que foi executado.

Completo: Todos os dados relevantes devem estar presentes, inclusive os que mostram desvios ou falhas. Nada deve ser omitido.

Consistente: Os registros devem seguir uma sequência lógica e cronológica, mantendo consistência com outros dados relacionados.

Durável: Os registros devem ser armazenados de forma que garantam sua integridade ao longo do tempo, conforme o período de retenção aplicável.

Disponível: As informações devem estar prontamente acessíveis para revisões, auditorias e inspeções sempre que necessário.

![](data:image/x-wmf;base64...)

O cabeçalho deve ser a primeira informação a ser preenchido informando a data com formado dd/mm/aaaa,o turno e a linha no qual refere-se o diário de bordo.

Logo após, as informações de Lote e Código TOTVS do produto devem ser preenchidas. Em cada linha de produção da Farmace que faz parte do projeto OEE SicFar haverá uma tabela com o código TOTVS dos produtos que podem ser produzidos na respectiva linha. O código TOTVS do produto é fundamental para o cálculo da capacidade produtiva da linha, tendo em vista que ela será calcula por SKU. Em caso de ausência de produção, obviamente essas informações são serão preenchidas e o cálculo da capacidade será realizado a partir da produtividade padrão da Linha (essas informações estão presentes no arquivo da *Atividade 1.5 Definição da metodologia de cálculo).*

O campo *Produção Inicial* deve ser preenchido com o total já produzido do lote que o turno foi iniciado. Em situações onde o turno é iniciado sem produção, esse campo deverá ser zero. No exemplo acima, no Turno Diurno D1, não havia lotes em processo na troca de turno, havendo início de produção do Lote 25A0001A às 06:43h por isso, a Produção Inicial é Zero (0). Já o Turno Noturno N1 recebeu a linha com o Lote 25A0002A em processo, com um total de 12.932 Unidades envasada, por isso, a Produção Inicial será esse valor, em lotes em processo a *Produção Inicial* do turno posterior sempre será igual a *Produção Atual* do turno anterior.

O campo *Produção Atual* calcula o total envasado de cada lote dentro do turno, sendo resultado da *Produção Final – Produção Inicial.* No exemplo acima, o Turno Noturno N1 envasou do Lote 25A0002A um total de 19.468 Unidades, pois o Lote foi finalizado com 32.400, sendo envasados 12.932 Und no Turno D1. Por isso, 32.400 – 12.932 = 19.468. As informações referente à quantidade envasada, conforme informado anteriormente, devem ser extraídos do CLP da linha de envase/inspeção e no caso da embalagem, escrever após a contabilização física do total embalado do respectivo lote.

Os campos de *Hora Início* e *Hora Final* devem ser preenchidos com o horário no formato hh:mm de produção do lote dentro de cada turno. No exemplo acima, nota-se que o Lote 25A0002A foi iniciando seu envaso no Turno D1 às 15:32h e teve envase dentro do turno até às 17:45h. Já no Turno N1 ele foi iniado às 18:12h e finalizado às 23:45h.

Ao final do Turno, deve ser realizado a soma de produção de todos os lotes produzidos dentro do horário de trabalho, bem como, o somatório das perdas (refugo) de produto dentro do mesmo período.

As paradas, devem ser preenchidas de forma contemporânea, informando o código da parada, o horário de início e de término. Essas paradas devem ser anotadas e apontadas independentemente da sua duração, mesmo parada inferiores à 10 Minutos devem ser descritas. Em cada linha de produção da Farmace que faz parte do projeto OEE SicFar haverá uma tabela com o código de paradas.

Por fim, o operador responsável pela linha, deve assinar o Diário de Bordo, além de um conferente: encarregado ou supervisor.

**TABELA RESUMO DA FONTE DE DADOS**

**![](data:image/x-wmf;base64...)**