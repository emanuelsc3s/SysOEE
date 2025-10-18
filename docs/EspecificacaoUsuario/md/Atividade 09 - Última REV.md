**VALIDAÇÃO TÉCNICA PARA SISTEMA OEE SICFAR**

**1.0 Objetivo:**

Definir metodologias e cálculo, gráficos e ferramentas visuais que deverão estar presentes no OEE SicFar para permitir que a equipe técnica de programação e TI, avaliar a viabilidade de implementação do sistema OEE conforme o modelo proposto. Validar se o sistema comporta a lógica de cálculo, os parâmetros definidos e a estrutura de dados prevista para todos os indicadores e ferramentas visuais planejadas (dashboards, gráficos, tabelas e filtros dinâmicos)

.**2.0 Justificativa:**

Esta etapa é fundamental para garantir que todas as necessidades funcionais e técnicas do OEE estejam plenamente contempladas no SicFar antes do início da fase de desenvolvimento. Nela, será apresentado ao programador o detalhamento técnico completo da solução, incluindo: Fórmulas de cálculo dos indicadores principais (Disponibilidade, Performance, Qualidade, OEE); Indicadores secundários (MTBF, MTTR, Taxa de Utilização, etc.); Regras e exceções de cálculo; Especificações das visualizações gráficas (barras, pizza, linha do tempo, radar, etc.); Filtros por linha, turno, lote, setor produtivo, etc.; Campos obrigatórios a serem capturados e integrados via CLP, apontamentos manuais ou ERP.

Esse alinhamento técnico visa antecipar limitações do sistema e evitar retrabalhos no desenvolvimento, assegurando a consistência, rastreabilidade e usabilidade da ferramenta. A entrega dessa documentação completa ao programador é mandatória para garantir que o OEE reflita com precisão a realidade fabril e atenda às necessidades da Produção, Qualidade, Engenharia e Gestão.

1. **Base de Dados**

A ferramenta de OEE, proposta, deve ser implementada de forma robusta, eficaz e alinhada às necessidades dos usuários, nos próximos capítulos serão apresentados os requisitos funcionais e operacionais necessários para sua correta utilização. Ao longo do documento, serão detalhados os indicadores, fórmulas de cálculo, fontes de dados, visualizações gráficas e filtros analíticos que compõem a estrutura do sistema. Essa definição tem como finalidade assegurar que todos os recursos e funcionalidades estejam adequadamente configurados na plataforma SicFar, promovendo uma experiência de uso intuitiva, rastreável e aderente à realidade fabril.

![](data:image/png;base64...)Inicialmente, é fundamental informar cada apontamento de cada supervisor em cada linha de produção, deve carregar consigo informações básicas que irão permitir a melhor eficiência no uso da ferramenta. Abaixo, segue um modelo básico de como essas informações devem ser, informadas.

Esse formato de tabela com os apontamentos individualizados permite que haja completo domínio e flexibilidade para realização de cálculos, análises e permite segmentar e realizar múltiplas seleções de qualquer uma das variáveis estudadas.

* 1. **Linha Produtiva**

As linhas produtivas, devem respeitar a lista informada na atividade *Definição do escopo e fronteiras do projeto.* Obrigatoriamente duas linhas não podem ter a mesma nomenclatura. Em nossa documentação interna da Farmace, possuímos 03 (três) linhas de produção nomeadas como **Linha A** – SPEP01, Líquidos Orais e CPHD. Conforme informado anteriormente essas linhas serão renomeadas para **Linha A (L)** para o Líquidos Orais (por isso a letra L entre parênteses) e **Básica** para CPHD. Enquanto isso, no SPEP01 ela permanece apenas com Linha A.

A coluna seguinte, refere-se ao Setor e seu preenchimento deve ser automático mediante o uso de fórmulas como o *=PROCX* ou *=PROCV* no Excel. A partir de uma tabela pré definida, haver absoluta correlação entre as linhas. O preenchimento deve ser automático para evitar erros de apontamentos, seleção ou até digitação.

* 1. **Data e Dimensões Temporais**

Para garantir a confiabilidade e a consistência dos dados no sistema OEE, a coluna “Data” deve ser registrada automaticamente a partir do apontamento realizado no sistema, sem necessidade de entrada manual pelo operador. A automação desse campo assegura rastreabilidade, evita erros de digitação e garante a precisão cronológica dos eventos registrados.

A partir da coluna Data, serão calculadas automaticamente, por meio de fórmulas do Excel (ou lógica similar no sistema), as seguintes segmentações temporais: **Semana** a partir da Fórmula: =NÚMSEMANA(Data; ) **Mês** a partir da Fórmula: =TEXTO(Data; "mmm")
(para retornar o nome do mês abreviado, como "Jan", "Fev", etc.), **Trimestre** a partir da diversas possibilidades de fórmula, por exemplo Fórmula:= INT((MÊS(Data)-1)/3)+1 "T" & & TEXTO(Data; ”aa”) (retorna, por exemplo, “2T25”, indicando o segundo trimestre do ano de 2025) e **Ano** a partir da Fórmula: = TEXTO(Data; ”aa”). A criação dessas colunas derivadas da data permite análises dinâmicas, agregadas e comparativas dos dados de paradas ao longo do tempo, promovendo visibilidade gerencial e facilidade na geração de relatórios estratégicos. Onde a segmentação por Dia e Semana viabiliza análises operacionais de curto prazo, identificando gargalos, tendências pontuais e desvios recorrentes na rotina produtiva. Já a Segmentação por Mês permite acompanhar indicadores de desempenho e eficiência em ciclos de planejamento mensais, muito utilizados nas rotinas de gestão industrial. A Segmentação por Trimestre é fundamental para o alinhamento com o modelo de governança corporativa de grandes empresas, especialmente as empresas de capital aberto, que seguem práticas contábeis e de reporte estruturadas em trimestres fiscais (Q1, Q2, Q3, Q4). Essa estrutura facilita a consolidação dos resultados operacionais e sua integração aos relatórios trimestrais divulgados a acionistas, conselhos e demais stakeholders. Por fim, a Segmentação por Ano oferece a base para avaliação de metas anuais, comparativos interanuais e desempenho consolidado por exercício fiscal.

* 1. **Apontamento de Paradas**

O apontamento das paradas, deve seguir o mesmo padrão e mesma lógica da extração das datas. Os lançamentos *in loco* nas áreas produtivos, conforma informado anteriormente, ocorrerá em computadores onde os apontadores ou analistas de dados irão inserir os dados de parada. Conforme atividade *Classificação e codificação de paradas* cada ocorrência deve ser apontada a partir de um código base (Ex. P1.1) seguido os horários de início e término, dessa forma, com uma simples subtração será possível calcular a duração das paradas. Para esse cálculo, é fundamental, haver uma lógica para calcular de forma adequadas paradas que se iniciam antes de meia noite e se encerram após 00:00h, pois, dependendo de como for calculada, a resultante será hora negativa, gerando erro. No Excel esse problema é facilmente, por exemplo usando a fórmula =*SE(A1>B1;A1-B1;A1+1-B1).*

As colunas subsequentes serão preenchidas automaticamente a partir do código informado. Por exemplo, no momento que o operador informar a parada P1.1 o sistema deverá entender que se trata de uma Parada Estratégica (Classe), Sem Programação de Produção (Grande Parada) e Sem Programação PMP (Apontamento).

É importante entender que haverá um *book* de paradas para cada linhas de produção, com número diferente de paradas. Por exemplo, no SPEP haverão 16 tipos de paradas referente à Quebra/Falhas enquanto no SPPV e CPHD existem 10 e 4, respectivamente. Por isso, além da codificação, há necessidade de criar uma máscara concatenado com a Linha de Produção para que o sistema faça o preenchimento automático de forma correta.

Isto é, dentro dos *books* de paradas entre todas as linhas de produção, a parada, por exemplo, P4.2 terá classificações diferentes entre elas. Na Linha A do SPEP poderá ser uma Quebra Falha no Sistema de Distribuição de Frascos já no SPPV esse mesmo código pode representar uma Quebra Falha na Estação de Moldagem.

Saliento que seria possível criar códigos únicos, porém, iria gerar uma quebra no sequenciamento de paradas o que poderia gerar dúvidas e apontamentos incorretos pelos operadores. Como o cálculo das paradas ocorre de forma “interna” não há nenhum risco ou problema de haver diferentes descrições para um mesmo código entre as diversas linhas da Farmace que usarão o OEE SicFar.

1. **Gráficos e Ferramentas**

Antes de apresentar os gráficos de devem se fazer presentes no OEE SicFar, é fundamental explanar sobre um conceito importantíssimo dessa ferramenta: a segmentação de dados. Ela consiste na capacidade de filtrar, agrupar e analisar as informações de forma direcionada, permitindo visualizações específicas conforme critérios definidos, como linha de produção, tipo de parada, setor, turno ou período. Essa segmentação é essencial para transformar grandes volumes de dados em *insights* úteis, permitindo que as decisões sejam tomadas com base em recortes mais relevantes e operacionais. Além disso, garante que uma mesma ferramenta possa ser utilizadas por diferentes agentes com suas particularidades na análise e avaliação dos dados disponíveis.

Na Farmace, onde múltiplas linhas operam com características distintas, a análise consolidada de dados pode ocultar desvios importantes. Por isso, a segmentação viabiliza a identificação de gargalos, a rastreabilidade de falhas e a comparação entre desempenhos individuais ou combinados. A visualização segmentada por linha, tipo de parada por setor é vital para o direcionamento preciso de ações corretivas e preventivas - isso exige que esses campos estejam devidamente categorizados e normalizados. Para que o sistema de OEE atenda plenamente suas funções analíticas e gerenciais, é indispensável que a base de dados esteja estruturada para permitir segmentações flexíveis. Com isso, torna-se possível realizar cruzamentos dinâmicos, avaliar tendências semanais de performance em setores distintos, promovendo uma gestão baseada em evidências, etc.

Abaixo, há um exemplo simples de segmentação de dados do Excel.

![](data:image/png;base64...)

* 1. **Resumo de Horas Totais**

O indicador de Horas Totais apresenta a distribuição do tempo disponível da(s) linha(s) de produção ao longo do período analisado, segmentando-o em cinco categorias: horas valiosas, paradas estratégicas, paradas por indisponibilidade, perda por performance e perda por qualidade. O objetivo é fornecer uma visão clara e visualmente intuitiva sobre como o tempo foi utilizado ou desperdiçado. A análise visual por meio de gráfico de barras empilhadas permite identificar de forma imediata quais perdas impactam mais o tempo produtivo da linha. A diferenciação por cores facilita a interpretação, principalmente em contextos de reuniões gerenciais, auditorias e apresentações estratégicas. A leitura agrupada dessas informações, linha a linha, possibilita comparações rápidas entre áreas, turnos ou equipamentos, tornando-se uma ferramenta essencial para a tomada de decisão operacional.

![](data:image/png;base64...)Vamos visualizar três exemplos para entender a importância desse indicador. Nesse exemplo são demonstrados a distribuição do tempo das cinco categorias: horas valiosas (verde), paradas estratégicas (azul), paradas por indisponibilidade (vermelho), perdas por performance (laranja) e perdas por qualidade (amarelo).

A análise desse indicador, permite facilmente identificar que a Linha 1 é a mais produtiva, que a Linha 2 possui a maior parte do seu tempo parada devido Paradas Estratégicas e a Linha 3 apresenta uma baixa eficiência operacional. Apesar de não trazer as % ou durações, para facilitar a análise, intuitivamente é possível avaliar as linhas produtivas.

A metodologia de cálculos dos cinco componentes desse gráfico deve ser realizada a partir do somatório das paradas apontadas no OEE SicFar pelos apontadores com exceção das horas valiosas que serão calculados a partir da divisão do número de unidades boas produzidas pela produtividade ideal em cada uma das linhas. Pode ser calculada também, pela subtração do tempo calendário pela duração das outras 4 paradas.

* 1. **Velocímetro de OEE**

Obviamente o indicador mais importante da ferramenta, de modo geral. O OEE (Eficiência Global do Equipamento) mede a eficiência produtiva de uma linha ao combinar três componentes essenciais: Disponibilidade, Performance e Qualidade. O gráfico de velocímetro será utilizado para representar visualmente o OEE de forma imediata, intuitiva e segmentada por linha, setor ou grupo de linhas. O velocímetro oferece uma representação de fácil leitura e rápida interpretação do nível de eficiência atingido em determinado período.

![](data:image/png;base64...)

**OEE 52%**

Há uma infinidade de tipos e formas do se construir um gráfico de velocímetro como esse. Porém, a apresentação do OEE nele ainda traz um opcionalidade importante. Esse projeto de OEE SicFar irá abranger diferentes linhas de produção e diferentes etapas produtivas. Cada uma delas possui particularidades, tratando-se apenas de envase, há por exemplo, validações específicas onde resultam em metas de OEE absolutamente diferentes. No SPEP02 a Linha E possui matriz produtiva para envase de 02 ou 06 lotes com duração máxima de campanha de 24h 19’ e 51h 53’, respectivamente. Já a Linha F possui campanha de 179h permitindo que a linha tenha uma meta OEE significativamente maior. Dessa forma, é possível que a parcela das barras vermelhas, amarelas e verde seja alterada diante da segmentação de dados para uma ou diferentes linhas.

*Nota: Além do gráfico de velocímetro do OEE deve haver o gráfico de Taxa de Utilização. A atividade Definição da metodologia de cálculo informa como calcular cada um deles.*

* 1. **Componentes do OEE**

Este gráfico apresenta individualmente os índices de Disponibilidade, Performance, Qualidade e o OEE consolidado em um gráfico de barras. Deve permitir visualizações por dia, semana, mês, trimestre e ano, com possibilidade de análise para uma linha específica ou múltiplas linhas combinadas, exibindo até 12 períodos comparativos (ex: últimos 12 dias, semanas ou meses). Além disso, deve permitir em outro aba verificar lado a lado os componentes de cada uma das linhas em um período específico com possibilidade de segmentação. Isso é, além de observar o resultado consolidado da(s) linha(s), deve permitir analisar o resultado das linhas em um mesmo local. A decomposição do OEE em seus componentes permite uma análise direcionada das causas de baixa eficiência. Por exemplo, uma linha com alta qualidade, mas baixa performance, requer uma abordagem distinta de uma linha com problemas de qualidade. A análise por períodos facilita o acompanhamento de tendências e a medição de impacto de ações de melhoria implementadas ao longo do tempo. Essa granularidade favorece o gerenciamento visual e a comunicação entre os níveis tático e operacional.

![](data:image/png;base64...)

*Nota: A atividade Definição da metodologia de cálculo informa como calcular cada um deles.*

* 1. **Gráfico Histórico – Tendência de Paradas e Horas Trabalhadas**

Gráfico de linhas que exibe a evolução semanal das horas e/ou % do OEE em cada categoria (trabalhadas e paradas), com possibilidade de segmentar por parada específica, linha ou setor, cobrindo as últimas 10 semanas.

A análise histórica permite identificar tendências, recorrências e avaliar o impacto de ações de melhoria. Isso é fundamental para decisões estratégicas de médio e longo prazo, como investimentos, ajustes de escala ou reestruturações de layout.

Os gráficos podem ser combinados ou em gráficos separados, porém, é fundamental que haja facilmente a possibilidade de analisar a duração em horas e a % do OEE que a variável a ser analisada impactou. Abaixo, o gráfico que pode representar, por exemplo, a duração de horas paradas de produção devido Quebra/Falhas na Linha XYZ durante as últimas 10 semanas.

![](data:image/png;base64...)

* 1. **Gráfico de Pareto de Paradas**

O Gráfico de Pareto de Paradas é uma ferramenta de priorização estratégica. Apresenta, em ordem decrescente, as principais causas de paradas em termos de duração total (horas) e impacto percentual sobre o OEE. Essa visualização será fundamental para a tomada de decisões baseadas na regra 80/20, ou seja, focar nos poucos fatores que causam a maior parte dos prejuízos operacionais. O gráfico permitirá análise segmentada por linha, setor, tipo de parada, equipamento ou período. A ordenação clara facilita a identificação dos principais ofensores e direciona as ações corretivas com maior retorno.

As categorias que compõem o grupo das grandes paradas para fins de OEE na ferramenta são: Sem Programação PMP, Manutenção Planejada, Início e Fim de Produção, Setup e Processos, Validação e Qualificação, Gestão de Pessoas, Utilidades, Falta de Materiais, Controles de Qualidade, Fluxo de Produção, Pessoas - Não Planejadas, Pequenas Paradas, Velocidade Reduzida, Refugo, Reprocesso, Ajuste Operacional e Quebra Falha. Essa padronização permitirá rastreabilidade, consolidação e análise comparativa entre todas as áreas fabris.

O Gráfico de Pareto será a principal ferramenta dos gestores dentro da metodologia ágil de “ver e agir”, pois permite identificar de forma imediata os maiores ofensores da eficiência operacional, priorizando ações corretivas com base em dados concretos e de alto impacto. Essa agilidade na tomada de decisão é essencial para corrigir desvios ainda em andamento e evitar recorrências. No entanto, sua importância vai além do curto prazo: o Pareto também se destaca como instrumento estratégico para planejamentos de médio e longo prazo, ao revelar padrões persistentes de perdas e orientar investimentos em melhoria contínua, capacitação ou reestruturação de processos. Além disso, é uma ferramenta eficaz para mensurar a efetividade das ações implementadas ao longo do tempo, possibilitando avaliar se as intervenções estão, de fato, revertendo os principais causadores de perda e melhorando os indicadores de desempenho da planta.

![](data:image/x-wmf;base64...)Abaixo, segue um exemplo de como ele deverá ser informado. Assim como o gráfico do histórico, é importante que tanto a duração das paradas como o impacto % do OEE sejam apresentados. Por fim, apesar do foco do Pareto estar relacionado as Grandes Paradas, o sistema também deve permitir que haja o gráfico de Pareto para o nível do apontamento. Isto, é além da importância de mensurar o impacto da Grande Perda Utilidades também é fundamental haver a informação de quais utilidades impactaram: Falta de Energia, Falta de Ar Comprimido, Falta de Água Bruta, etc Abaixo, apenas para lembrar o conceito, segue a distribuição de todas as classificações de um apontamento.

![](data:image/png;base64...)O gráfico de Pareto deve ser em barras verticais ou horizontais, sendo organizado me ordem crescente do seu impacto. Abaixo, serão informados dados fictícios apenas como exemplo do formato e distribuição dos dados em ambos os formators.

![](data:image/png;base64...)

*Nota: A atividade Definição da metodologia de cálculo informa como calcular cada um deles.*

* 1. **Tabela Consolidada**

Para complementar a análise gráfica do Pareto de Paradas e ampliar a capacidade de diagnóstico operacional, torna-se necessário o uso de uma tabela-resumo que consolide os dados em formato tabular, permitindo uma leitura objetiva, comparativa e segmentada das ocorrências ao longo do tempo ou entre diferentes linhas de produção.

Essa tabela deverá ser disponibilizada em duas versões distintas, com foco analítico direcionado:

1. Versão por Período: organiza as principais categorias de paradas como linhas da tabela, enquanto as colunas representam os períodos de análise (dias, semanas, meses, trimestres ou anos). Essa estrutura facilita a visualização de tendências, sazonalidades, ou variações operacionais ao longo do tempo, servindo como apoio para análises históricas, planos de ação e acompanhamento de resultados de melhorias implantadas.
2. Versão por Linha de Produção: neste formato, as colunas representam cada linha de produção, e as linhas da tabela listam os tipos de parada. Essa estrutura permite comparações diretas entre linhas, destacando aquelas que apresentam maiores ocorrências de paradas não planejadas, além de permitir a identificação de boas práticas ou pontos críticos específicos em determinadas áreas.

Ambas as versões devem manter a separação clara entre paradas planejadas e não planejadas, além de incluir indicadores complementares como Índice de Disponibilidade, Taxa de Utilização e eventualmente o OEE, proporcionando uma visão mais completa do desempenho da operação.

A utilização dessas tabelas em conjunto com os gráficos do sistema OEE SicFar garante maior robustez analítica, especialmente em reuniões de desempenho, auditorias internas, e revisões gerenciais, promovendo uma base sólida para a tomada de decisão orientada por dados. Por se tratar de uma ferramenta de análise e altamente visual e intuitiva, haver os dois tipos de tabela, permite que seja possível atender a necessidade de todos os agentes envolvidos de forma padronizada. Abaixo, serão expostos exemplos da formatação.

![](data:image/x-wmf;base64...)Versão por Período

![](data:image/x-wmf;base64...)Versão por Linha

Na tabela Versão por Linha e fundamental que haja a consolidação por setor das linhas envolvidas. Além disso, dentro do setor e de forma geral, é necessário segmentar e consolidar o processo produtivo: envase e embalagem, por exemplo.

*Nota: A atividade Definição da metodologia de cálculo informa como calcular cada um deles.*

* 1. **Gráfico de Rosca – Distribuição entre Paradas Planejadas e Não Planejadas**

Esse gráfico de rosca tem como objetivo ilustrar a distribuição percentual entre Paradas Planejadas e Paradas Não Planejadas nas linhas de produção ao longo do período analisado. Essa visualização permite uma interpretação rápida e intuitiva do perfil das paradas de cada linha, facilitando a identificação de comportamentos operacionais desejáveis ou críticos.

Em uma operação industrial eficiente, espera-se que a maior parte das paradas seja planejada, como manutenções preventivas, setups programados, validações e qualificações. A predominância de paradas não planejadas, por outro lado, pode indicar falhas sistêmicas, baixa previsibilidade dos processos, ou ausência de planejamento adequado, sendo um sinal de alerta para os gestores.

Este gráfico possui papel estratégico não apenas para produção, mas também ao PCP, pois permite avaliar o nível de controle e previsibilidade dos processos produtivos. Linhas com alta proporção de paradas planejadas tendem a apresentar maior estabilidade operacional, menor variabilidade de produção e maior aderência aos cronogramas de produção. Já aquelas com predominância de paradas não planejadas exigem investigação aprofundada, revisão de rotinas de manutenção, reforço na capacitação da equipe ou adequação do planejamento de materiais. A análise poderá ser segmentada por linha, setor, turno ou período, e deve ser integrada com os demais dashboards do sistema OEE SicFar. A padronização da classificação de cada parada como Planejada ou Não Planejada será baseada nas definições estabelecidas nos *books* de paradas, sendo automaticamente atribuída no momento do apontamento.

Este gráfico, embora simples, é uma ferramenta de alto impacto visual e estratégico para reuniões gerenciais e planos de melhoria contínua, pois permite entender de forma rápida onde estão ocorrendo desvios de planejamento e controle operacional. Imagine as linhas fictícias abaixo onde a distribuição de paradas planejadas (azul) e não planejadas (vermelho) entre as paradas por indisponibilidade. Fica claro que mesmo possuindo o mesmo OEE, por exemplo, as ações são absolutamente diferentes para aumentar a eficiência operacional da linha.

![](data:image/png;base64...)

Linha A

Linha B

* 1. **MTBF E MTTR**

Por fim, a apresentação dos indicadores MTBF (Tempo Médio Entre Falhas) e MTTR (Tempo Médio de Reparo) é fundamental para a análise da confiabilidade e da eficiência dos equipamentos ao longo do tempo. O MTBF permite identificar com que frequência ocorrem falhas, enquanto o MTTR mostra o tempo médio necessário para restaurar o funcionamento após uma falha. Juntos, esses indicadores fornecem uma visão clara sobre a estabilidade operacional e a efetividade das ações de manutenção, contribuindo para a tomada de decisões voltadas à redução de paradas e ao aumento da disponibilidade dos ativos. Abaixo, segue um modelo de como eles podem ser apresentados.

![](data:image/x-wmf;base64...)

*Nota: A atividade Indicadores Secundários informa como calcular cada um deles.*

1. **Pequenas Paradas**

O conceito de *Pequenas Paradas* refere-se a interrupções operacionais de curta duração, inferiores a 10 minutos, que ocorrem com frequência, mas não caracterizam falhas críticas ou indisponibilidades significativas dos equipamentos. Por serem eventos breves, essas paradas não devem ser contabilizadas como tempo de indisponibilidade no cálculo da Disponibilidade do OEE. Em vez disso, seu impacto deve ser refletido no indicador de Performance, já que, mesmo com os equipamentos tecnicamente disponíveis, o ritmo de produção é afetado pela frequência dessas pequenas interrupções.

Adotar essa estratégia traz vantagens importantes para uma análise mais precisa da eficiência operacional. Ao excluir as pequenas paradas do tempo de indisponibilidade, evita-se inflar indevidamente esse indicador e garante-se que ele represente apenas eventos relevantes que realmente comprometem o funcionamento contínuo da linha. Além disso, ao direcionar o impacto dessas paradas para a Performance, é possível evidenciar de forma mais clara as perdas de ritmo produtivo e atuar com foco em melhorias como automações, ajustes de setup, treinamentos operacionais e padronizações que reduzam a ocorrência e o tempo dessas interrupções.

Para teor de comparação e ordem de grandezas, a ferramenta atual de OEE da Farmace possui um total de 139800h com 77216h 36’ de paradas, geradas a partir de 51.703 apontamentos, desses 12.152 apontamentos, ou 23,5% dos lançamentos são inferiores há 10 minutos, porém, o somatório de todas as pequenas paradas representa apenas 0,9% do tempo calendário e 1,6% das paradas por indisponibilidade.

1. **Conclusão**

A validação técnica apresentada neste relatório assegura que o sistema OEE SicFar esteja alinhado com as necessidades operacionais da Farmace. Todos os elementos descritos visam garantir rastreabilidade, consistência e eficácia no monitoramento e gestão da eficiência das linhas de produção. Este documento deve servir como base para o desenvolvimento e parametrização do sistema, com validação contínua pelas áreas de TI, Engenharia, Produção e Qualidade.