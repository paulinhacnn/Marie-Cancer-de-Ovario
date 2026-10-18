# Metodologia — Marie Câncer de Ovário

Documento da entrega com agregados PNS no esquema **`pns-ovarian-1.5`**, política de apresentação exploratória e fontes de contexto, evidência e fomento conferidas em **18 de outubro de 2026**. Datas de processamento não alteram o período a que os indicadores se referem. O [README](../README.md) contém instalação, publicação e comandos de reprodução.

## 1. Objetivo e unidades de análise

O observatório descreve a população feminina adulta, suas características alimentares e sociais, condições domiciliares e indicadores de câncer de ovário. Apoia exploração e planejamento, com preservação dos universos e da incerteza de cada fonte. As estimativas produzidas pelo projeto não são apresentadas como novas estatísticas oficiais do IBGE ou como um modelo clínico validado.

| Componente | Período | Unidade e alcance |
|---|---|---|
| PNS/IBGE | 2019 | Mulher selecionada e entrevistada, com 18 anos ou mais; população representada pelo desenho da pesquisa. |
| Censo/IBGE, SIDRA 6803 | 2022 | Domicílio particular permanente ocupado; principal abastecimento de água. |
| IDHM/PNUD–FJP | 2019 e 2021 | Índice publicado para a população geral do Brasil e de cada UF. |
| SIM/Ministério da Saúde | 2024 | Óbito feminino com C56 como causa básica, por UF de residência. |
| INCA | 2026 | Estimativa publicada de novos casos anuais de câncer de ovário; todas as idades. |
| Evidência científica | Anos de cada publicação | Achados de estudos, com desenho, exposição e desfecho identificados. |
| UK Biobank / Chang et al. | Dieta em 2009–2012; publicação em 2023 | Resultados agregados publicados de uma coorte prospectiva britânica; modelos ovarianos restritos às mulheres. |
| Biblioteca Virtual da FAPESP | Vigência própria de cada processo | Registro de dois auxílios e cinco bolsas, com título, modalidade, responsável, beneficiário e vínculos oficiais. |

Os registros dessas fontes não foram ligados individualmente. As características da PNS podem ser cruzadas nas mesmas entrevistadas. Censo, IDHM, SIM e INCA entram como informações agregadas por território. Não se multiplica prevalência PNS pela população do Censo para fabricar casos ou atualizar a população representada. Evidência internacional e fomento não são recalculados pelos filtros da PNS.

## 2. PNS 2019: fonte, leitura e população

O processamento lê o arquivo oficial **`PNS_2019_20220525.zip`**, contendo `PNS_2019.txt`, e utiliza as posições de leitura de **`dicionario_PNS_microdados_2019.xls`**. As fontes estão disponíveis em [microdados PNS](https://ftp.ibge.gov.br/PNS/2019/Microdados/Dados/PNS_2019_20220525.zip), [dicionário e arquivos de leitura](https://ftp.ibge.gov.br/PNS/2019/Microdados/Documentacao/Dicionario_e_input_20220530.zip), [questionário](https://biblioteca.ibge.gov.br/visualizacao/instrumentos_de_coleta/doc5569.pdf) e [publicação de resultados e metodologia](https://biblioteca.ibge.gov.br/visualizacao/livros/liv101764.pdf).

O ZIP contém **293.726 registros**. Foram preservados em memória os **90.846 moradores selecionados e entrevistados** com `M001=1` e peso `V00291` positivo e finito. O processamento verifica `V0015=1` nesse conjunto. O domínio de interesse é `C006=2` e `C008>=18`, resultando em **46.869 mulheres adultas**. Os entrevistados de outros domínios permanecem no desenho para a variância.

A soma de `V00291` no domínio feminino adulto é **84.618.612,77**. Trata-se da população representada pela PNS **em 2019**, dentro do âmbito de domicílios particulares permanentes da pesquisa. O número não é uma contagem censitária atual nem representa automaticamente pessoas residentes em instituições.

O arquivo publicado contém agregados. Identificadores de pessoa, domicílio e UPA não são exportados como registros. Os nomes das variáveis de desenho aparecem na documentação para permitir reprodução. O hash do ZIP, os tamanhos e as fontes constam do [manifesto](../frontend/data/pns/manifest.json).

## 3. Relato de câncer de ovário e tratamento dos saltos

`Q120` registra se houve diagnóstico médico de câncer. `Q121014` identifica relato de câncer de ovário no bloco que admite mais de um sítio de câncer. O [questionário oficial](https://biblioteca.ibge.gov.br/visualizacao/instrumentos_de_coleta/doc5569.pdf), página 57, inclui diagnóstico **atual ou passado**, sem separar essas duas situações nesse campo.

| Situação | Classificação no projeto |
|---|---|
| `Q120=1` e `Q121014=1` | Com relato de diagnóstico de ovário. |
| `Q120=1` e `Q121014=2` | Sem relato de diagnóstico de ovário. |
| `Q120=2`, sem resposta contraditória de ovário | Sem relato; a ausência estrutural de `Q121014` decorre do salto. |
| `Q120=2` e `Q121014=1` | Contradição; classificada como desconhecida. |
| Demais situações sem classificação válida | Desconhecida; não convertida automaticamente em ausência de diagnóstico. |

Na amostra processada há **53 mulheres com relato**, **46.816 sem relato**, zero classificações desconhecidas e zero contradições. A prevalência ponderada do relato no domínio feminino adulto é **0,1077%**, com **IC95% de 0,0704% a 0,1646%** e CV de **21,66%**. A estimativa é do projeto e recebe a indicação de cautela.

Essas 53 entrevistas não são casos novos observados ao longo de um período. A variável não informa histologia, estádio, tratamento, recorrência, tumor ativo ou data de início específica do câncer de ovário. A idade do primeiro câncer em geral não substitui a cronologia do sítio ovário; `Q12201` não integra os cálculos.

## 4. Os dez indicadores

Todos os indicadores abaixo têm resultado binário e são expressos em percentual das mulheres com informação válida no domínio selecionado. Respostas fora das categorias válidas e valores ausentes ficam desconhecidos. O código técnico `sugary` foi mantido para integração, mas seu rótulo e significado são **refrigerante, incluindo diet/zero**.

| ID | Variáveis | Numerador | Denominador válido |
|---|---|---|---|
| `fruit` | `P018` | Consumo de frutas em 5–7 dias por semana. | Respostas de 0–7 dias. |
| `vegetables` | `P00901` | Consumo de verduras e legumes em 5–7 dias por semana, conforme os itens definidos no questionário. | Respostas de 0–7 dias. |
| `beans` | `P006` | Consumo de feijão em 5–7 dias por semana. | Respostas de 0–7 dias. |
| `sugary` | `P02002` | Refrigerante em 5–7 dias por semana, inclusive diet/zero. | Respostas de 0–7 dias. |
| `ultra` | `P00614` a `P00623` | Resposta “sim” em pelo menos cinco dos dez grupos de ultraprocessados no dia anterior. | Respostas válidas “sim” ou “não” nos dez itens. |
| `obesity` | `P00104`, `P00404`, `P005`; flag `P00405` | IMC calculado como peso em kg dividido pelo quadrado da altura em metros, com resultado ≥30. | Peso e altura finais referidos válidos; mulheres não gestantes, `P005=2`. |
| `healthPlan` | `I00102` | Plano de saúde médico: resposta 1. | Respostas 1 ou 2. |
| `networkWater` | `A005010` | Rede geral como principal abastecimento do domicílio: resposta 1. | Respostas de 1–6. |
| `treatedWater` | `A009010` | Água de beber filtrada, fervida, tratada com hipoclorito ou de outra forma no domicílio: respostas 1–4. | Respostas de 1–6. |
| `higherEducation` | `VDD004A` | Ensino superior completo: resposta 7. | Respostas de 1–7. |

As definições provêm do [dicionário](https://ftp.ibge.gov.br/PNS/2019/Microdados/Documentacao/Dicionario_e_input_20220530.zip) e do [questionário](https://biblioteca.ibge.gov.br/visualizacao/instrumentos_de_coleta/doc5569.pdf). Os arquivos originais e extratos estão em [source_snapshots/pns](source_snapshots/pns/).

### Alimentação

Frequência em dias da semana não informa quantidade em gramas, energia, dose de nutrientes ou duração do hábito. O indicador `ultra` conta **grupos consumidos no dia anterior**, sem estimar a proporção calórica de ultraprocessados. A frequência de refrigerante não permite identificar exclusivamente bebidas com açúcar. Os indicadores de frutas e hortaliças são publicados separadamente e não recebem o nome de um indicador oficial composto com regra diferente.

### IMC

São utilizados peso e altura **referidos**, em suas versões finais, inclusive imputações do IBGE. Os campos antropométricos aferidos do módulo W e seu peso específico não foram utilizados. O código aplica as faixas válidas do dicionário: peso maior que zero e até 599,9 kg; altura maior que zero e até 299 cm. Não há corte adicional arbitrário de IMC.

Há **46.016 mulheres adultas com IMC válido** e 853 excluídas desse denominador. O relatório registra 739 gestantes, 113 mulheres com gravidez desconhecida e um caso adicional sem IMC válido. A flag de imputação de peso ou altura referido está presente em 9.803 mulheres do domínio. O indicador não substitui avaliação antropométrica individual.

### Água

`networkWater` mede a forma principal de abastecimento, não apenas a existência de alguma ligação à rede. `treatedWater` mede prática declarada no domicílio. A categoria 5 de `A009010`, **água mineral industrializada**, não integra tratamento doméstico; a categoria 6 identifica ausência de tratamento no domicílio. Estar fora do numerador não significa necessariamente consumir água imprópria. As perguntas não medem potabilidade por ensaio, regularidade do abastecimento nem concentração de contaminantes.

## 5. Estratificação e denominadores

O painel disponibiliza Brasil e 27 UFs, três coortes — todas as mulheres adultas, com relato e sem relato de ovário — e as faixas **18–29, 30–39, 40–49, 50–59, 60–69, 70–79 e 80 anos ou mais**. O recorte `all` da PNS significa 18 anos ou mais.

| Dimensão | Campo | Categorias |
|---|---|---|
| Escolaridade | `VDD004A` | Sem instrução; fundamental incompleto; fundamental completo; médio incompleto; médio completo; superior incompleto; superior completo. |
| Renda | `VDF004` | Rendimento domiciliar per capita em faixas de salário mínimo: até ¼; mais de ¼ a ½; mais de ½ a 1; mais de 1 a 2; mais de 2 a 3; mais de 3 a 5; mais de 5. |
| Raça ou cor | `C009` | Branca, preta, amarela, parda e indígena. |
| Idade | `C008` | Sete faixas adultas definidas acima. |

Escolaridade, renda e raça ou cor preservam uma categoria “sem informação” quando necessária. As faixas de renda são as classificações da edição da pesquisa, não valores atualizados de salário mínimo. Raça ou cor é uma característica informada na pesquisa; não é inferência de ancestralidade genética.

Cada grupo possui duas medidas diferentes. A **composição** expressa sua participação na população do recorte. A **taxa do indicador no grupo** usa apenas as integrantes daquele grupo com resposta válida. Assim, a participação de uma faixa de renda na população não é o mesmo percentual que o consumo de frutas dentro dessa faixa.

## 6. Pesos, variância e intervalos de confiança

O projeto utiliza `V00291` como peso do morador selecionado, `V0024` como estrato e `UPA_PNS` como unidade primária de amostragem. O conjunto de entrevistados selecionados contém **8.027 UPAs, 574 estratos e 7.453 graus de liberdade**. Não há estratos com apenas uma UPA nesse conjunto; o script interromperia o cálculo caso encontrasse essa situação sem tratamento explícito.

Para uma proporção, o denominador reúne apenas integrantes do domínio com resposta válida. Se `D_i` identifica essa participação, `w_i` é o peso e `y_i` vale 0 ou 1:

$$
\widehat{N}_D=\sum_i w_iD_i,
\qquad
\widehat{p}_D=\frac{\sum_i w_iD_i y_i}{\widehat{N}_D}.
$$

A variância utiliza linearização de Taylor de primeira ordem, com aproximação de amostragem com reposição no primeiro estágio. Para o estrato `h` e a UPA `j`, define-se a contribuição linearizada:

$$
u_{hj}=\frac{\sum_{i\in(h,j)}w_iD_i(y_i-\widehat p_D)}{\widehat N_D}.
$$

Com `m_h` UPAs por estrato, a estimativa de variância é:

$$
\widehat{\operatorname{Var}}(\widehat p_D)
=\sum_h\frac{m_h}{m_h-1}\sum_j(u_{hj}-\bar u_h)^2.
$$

**As UPAs fora do domínio permanecem no desenho com contribuição zero.** Filtrar mulheres, idade, UF, escolaridade ou outra característica não redefine a pesquisa como amostra aleatória simples. O cálculo não utiliza aproximação de Kish nem correção de população finita.

Para proporções interiores a 0 e 1, o IC95% é calculado na escala logit, com quantil da distribuição t e 7.453 graus de liberdade, e transformado de volta à escala percentual. O coeficiente de variação é `CV = erro-padrão / estimativa`. Para totais ponderados, utiliza-se a soma dos pesos, sua variância por UPA e intervalo linear com limite inferior não negativo.

Os intervalos quantificam incerteza amostral conforme essa aproximação. Eles não eliminam erro de recordação, mudança de comportamento depois do diagnóstico, viés de sobrevivência, confundimento ou diferenças de cobertura das fontes. As escolhas computacionais estão explícitas em [build_pns2019.py](../scripts/build_pns2019.py) e no [manifesto](../frontend/data/pns/manifest.json); a documentação do desenho original está na [publicação PNS](https://biblioteca.ibge.gov.br/visualizacao/livros/liv101764.pdf).

## 7. Precisão, apresentação exploratória e valores ausentes

Na versão **1.5**, por solicitação explícita da usuária, o projeto apresenta os pontos estimados e as contagens agregadas reais também em pequenas amostras, células raras e CV alto, acompanhados dos avisos pertinentes. Os limites abaixo são **alertas internos do projeto, não regras oficiais do IBGE**. Mostrar uma estimativa não resolve sua incerteza nem demonstra associação causal.

O [manifesto](../frontend/data/pns/manifest.json) registra `mode="exploratory"`, `suppressEstimates=false`, `publishUnweightedCounts=true` e `suppressComplementaryCounts=false`. As contagens de `all`, `ovarian` e `no_ovarian` são preservadas. Não há arredondamento de uma contagem amostral de 1 a 4 para a expressão “<5”, nem omissão complementar das contagens da coorte sem relato. O pacote contém agregados, sem identificadores individuais.

| `quality` | Regra ou significado |
|---|---|
| `ok` | Nenhum alerta pelos critérios internos; não é uma classificação clínica nem comprovação de causalidade. |
| `caution` | CV acima de 15% e até 30%, sem condição que exija aviso mais forte; apresentar ponto e IC95% disponível. |
| `inconclusive` | Amostra pequena, célula rara, CV acima de 30%, resultado em limite ou variância não informativa. O ponto real continua disponível quando há denominador válido. |
| `no_data` | Nenhuma observação válida no denominador; percentual e intervalo ausentes. |

Os motivos detalhados são preservados em `qualityReasons`. `small_sample` indica menos de 30 respostas válidas; `rare_cell`, numerador ou complemento abaixo de cinco, inclusive zero; `high_cv`, CV acima de 30%; e `moderate_cv`, CV acima de 15% e até 30%. `boundary` identifica 0% ou 100%; `no_variance`, variância nula ou não calculável; `empty_conditional_domain`, ausência de respostas para pelo menos um condicionamento; e `no_valid_responses`, ausência de denominador. Um resultado pode reunir vários motivos.

**Valores de 0% e 100% são conservados quando observados com respostas válidas.** Se nenhuma participante apresenta o evento, `nEvent=0` e `pct=0`; se todas o apresentam, `pct=100`. Nesses limites, `low`, `high` e `cv` ficam `null`, com aviso `inconclusive` e motivo `boundary`. O método Taylor-logit não fornece um intervalo informativo nessa situação. Zero na amostra não demonstra ausência na população, e 100% não demonstra certeza populacional. Variância nula ou não calculável também mantém o ponto, com intervalo ausente e o motivo correspondente.

Os critérios são avaliados para o denominador pertinente: a população usa o número de integrantes do domínio; cada proporção usa suas respostas válidas. Uma linha pode ter indicadores precisos, outros inconclusivos e outros sem dados. A soma dos pesos não substitui o número de entrevistas para avaliar a informação amostral.

Nos cruzamentos 2×2, um par com respostas válidas conserva as quatro células reais, inclusive células de contagem zero, e suas condicionais diretamente calculadas. A falta de respostas em um condicionamento deixa apenas essa estimativa sem denominador. Quando não há nenhuma resposta válida para o par, `nPaired=0`, `cells=[]` e `quality="no_data"`.

`null` não equivale a zero. É necessário consultar o campo e seu motivo: um intervalo pode estar ausente apesar de o ponto ser conhecido; uma proporção sem denominador não pode ser estimada. Na interface e no adaptador, nomes antigos como `suppressed` sinalizam indisponibilidade do valor, não uma regra de esconder pequenas amostras. Zeros administrativos são tratados conforme a legenda da fonte SIM, separadamente da PNS. A indicação `<20` do INCA é censura na própria tabela publicada e permanece inalterada.

## 8. Cruzamentos nas mesmas entrevistadas

Dez indicadores, mais a variável de relato de ovário, produzem **55 pares distintos**. Eles são pré-calculados para a coorte `all`, por UF e faixa etária. Primeiro se selecionam participantes com respostas conhecidas para **ambas** as variáveis. Um par com IMC pode ter denominador menor que outro par alimentar.

A frequência conjunta de uma célula informa a proporção ponderada que reúne aquela combinação entre todas as participantes com o par conhecido. As quatro condicionais respondem a perguntas diferentes:

| Campo | Pergunta |
|---|---|
| `b_given_a_true` | Entre mulheres com A, qual proporção também apresenta B? |
| `b_given_a_false` | Entre mulheres sem A, qual proporção apresenta B? |
| `a_given_b_true` | Entre mulheres com B, qual proporção também apresenta A? |
| `a_given_b_false` | Entre mulheres sem B, qual proporção apresenta A? |

Cada condicional é estimada diretamente como um domínio do mesmo desenho amostral, incluindo seu IC95%. Não se obtêm intervalos dividindo limites de outras estimativas. `womenPaired` e `cell.women` são somas diretas dos pesos pertinentes, sem reconstrução a partir de percentuais arredondados.

Uma leitura como “de cada 100 mulheres com A, quantas também apresentam B?” descreve a coexistência das respostas. Não é probabilidade prospectiva de desenvolver câncer. As comparações não ajustam simultaneamente idade, renda, escolaridade, histórico reprodutivo ou outros potenciais confundidores. Selecionar uma faixa etária não equivale a um modelo causal ajustado.

## 9. Contexto estadual: água do Censo e desenvolvimento humano

### Censo 2022

O indicador contextual provém da [tabela SIDRA 6803](https://sidra.ibge.gov.br/tabela/6803), variável 381, classificação 1821. O numerador usa a categoria **72144**, domicílios com rede geral e uso como forma principal; o denominador usa **72129**, total de domicílios particulares permanentes ocupados.

O percentual é `100 × domicílios com rede principal / total de domicílios`. Para o Brasil, são 60.775.085 de 72.456.368 domicílios, resultando em **83,8782%**, ou 83,9% a uma casa decimal. As contagens das UFs somam os totais nacionais. Fontes e parâmetros estão em [context.json](../frontend/data/context.json) e nos arquivos retidos de contexto.

Esse indicador é domiciliar e censitário, em 2022. A medida de rede geral da PNS é ponderada para mulheres adultas em 2019. A diferença entre os dois percentuais não deve ser interpretada diretamente como mudança da cobertura de uma mesma população. Também não se trata do indicador populacional IN055 do SNIS nem de avaliação laboratorial da água.

### IDHM e IDHM Educação

Foram reproduzidos os valores publicados de Brasil e 27 UFs da planilha [Base de Dados do PNUD/FJP](https://www.undp.org/sites/g/files/zskgke326/files/2023-07/base_de_dados.xlsx), folha “Base de Dados”, colunas `ANO`, `AGREGACAO`, `CODIGO`, `NOME`, `IDHM` e `IDHM_E`. A documentação acompanha o [Painel IDHM](https://www.undp.org/pt/brazil/desenvolvimento-humano/painel-idhm) e a [planilha de fontes](https://www.undp.org/sites/g/files/zskgke326/files/2023-07/fontes_1.xlsx).

O IDHM é um índice de 0 a 1 baseado na média geométrica de longevidade, educação e renda. O IDHM Educação combina frequência escolar, com peso de dois terços, e escolaridade de adultos, com peso de um terço. Não é percentual, probabilidade de doença nem medida exclusiva de ensino superior.

O arquivo contém campos de **2019**, alinhados ao ano da PNS, e de **2021**, conforme a edição disponível no endereço de julho de 2023. A documentação de fontes registra PNAD Contínua/IBGE e, para longevidade, uso do SIM/DATASUS; os indicadores PNAD de 2012–2019 e 2020–2021 utilizam visitas diferentes. Os índices publicados foram copiados, sem recálculo ou interpolação.

A edição retida não corresponde à [série até 2024 anunciada em publicação posterior do PNUD](https://www.undp.org/pt/brazil/publications/radar-idhm-evolucao-do-idhm-e-de-seus-componentes-periodo-de-2012-2024). Por isso, o painel identifica explicitamente 2019 ou 2021 e não chama esses valores de “IDHM atual” ou “último IDHM”. O total Brasil é o valor nacional publicado, não a média simples dos estados.

### Interpretação dos gráficos entre estados

Cada ponto representa uma UF. Idade e coorte da PNS não alteram o universo do Censo, do IDHM ou dos óbitos administrativos. Os eixos informam unidade e ano, inclusive quando os períodos diferem.

Esses gráficos descrevem relações ecológicas. Não demonstram que as mesmas mulheres com determinada alimentação tenham sido expostas às condições ambientais medidas, nem que um indicador cause o outro. Ao usar contagens de óbitos, o tamanho e a estrutura etária da população influenciam fortemente a comparação; não há taxa de mortalidade nem padronização etária nesse arquivo.

## 10. Atenção oncológica: SIM e INCA

### Óbitos SIM 2024

A consulta ao [TabNet do SIM](https://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/obt10uf.def) utiliza sexo feminino, causa básica **C56 — neoplasia maligna do ovário**, ano do óbito **2024** e UF de residência. A resposta retida informa dados finais e data de extração da base em 02/12/2025. A fonte resulta em **4.567 óbitos**, todas as idades, valor também conferido na [página oficial de câncer de ovário do INCA](https://www.gov.br/inca/pt-br/assuntos/cancer/tipos/ovario/versao-para-populacao).

As faixas etárias originais do TabNet são preservadas. Não é possível separar 18–19 anos da coluna 15–19; o seletor 18–29 da PNS não é aplicado automaticamente. As colunas publicadas somam os totais de cada território. A linha de residência ignorada/exterior permanece no arquivo e tem zero neste recorte.

O símbolo `-` foi convertido em zero conforme a legenda explícita da fonte. Isso não é imputação de ausência de informação. Não foi importado denominador populacional do mesmo ano, portanto o pacote apresenta **contagens**, com `rates=null`. Não se calculam taxas de 2024 usando pesos da PNS 2019.

### Casos novos estimados INCA 2026

A [tabela estadual do INCA](https://www.gov.br/inca/pt-br/assuntos/cancer/numeros/estimativa/estado-capital/brasil/por-estado/por-estado/) é identificada como ano **2026**. O Brasil tem **8.020 casos novos anuais estimados**; a página nacional situa essa estimativa em cada ano do triênio 2026–2028. São estimativas publicadas, não uma contagem de diagnósticos observados nas entrevistadas.

Os valores estaduais são arredondados a múltiplos de dez. Acre, Amapá e Roraima têm a indicação oficial de **menos de 20**, preservada como `cases=null`, `display="<20"` e `censored=true`. Esses valores não foram substituídos por zero, dez ou vinte. O total nacional é o publicado pelo INCA, sem soma de parcelas arredondadas e censuradas.

A tabela não oferece estratificação por idade. O indicador permanece “todas as idades”. Os óbitos de 2024 e os novos casos estimados de 2026 não podem ser divididos entre si para produzir letalidade ou sobrevida. C56 identifica o sítio ovariano, mas não um histotipo ou estádio. Internações, APAC, estadiamento, genética e datas individuais de tratamento não foram importados nesta entrega.

As fontes e parâmetros exatos estão em [source_snapshots/admin](source_snapshots/admin/) e [admin.json](../frontend/data/admin.json).

## 11. Escopo de One Health

A [definição da OMS](https://www.who.int/health-topics/one-health) reconhece a interdependência entre saúde humana, animais, plantas e ecossistemas e propõe colaboração entre setores. O painel utiliza essa perspectiva para conectar saúde da mulher, alimentação, abastecimento de água e condições sociais.

Esta entrega contém medidas de saúde humana e uma parte do contexto domiciliar e social. Não inclui séries integradas de saúde animal, microbiologia de alimentos, resíduos de agrotóxicos, contaminantes químicos, qualidade laboratorial da água ou exposição ambiental individual. Essas dimensões não recebem valores presumidos. O módulo não estima uma parcela de câncer atribuível à água, ao ambiente ou ao sistema alimentar e não calcula um “score One Health”.

## 12. Cítricos: evidência e limites das bases

O módulo de evidências é uma **verificação dirigida de publicações**, não uma nova revisão sistemática. A documentação detalhada está em [evidencia_citricos.md](evidencia_citricos.md); os dados exibidos estão em [evidence.json](../frontend/data/evidence.json).

O estudo observacional de [Cassidy e colaboradores, 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4196485/), relatou HR de 0,79 para maior versus menor ingestão de flavanonas, com IC95% de 0,63–1,00 e p-tendência de 0,26. Laranja e suco, avaliados separadamente, não apresentaram associação estatisticamente significativa. A [síntese de Liu e colaboradores, 2022](https://link.springer.com/article/10.1186/s12937-022-00778-w), apresentou OR de 1,00, IC95% de 0,62–1,61, para flavanonas e ovário, com somente dois estudos e heterogeneidade elevada. As medidas e as populações de cada publicação são mantidas; linhas do mesmo estudo não são contadas como amostras independentes.

Experimentos de compostos isolados em células ou animais são identificados como pré-clínicos. Eles não estabelecem eficácia preventiva de frutas em mulheres, quantidade alimentar ou indicação de suplemento.

Na PNS, `P018` descreve frutas em geral; `P00611` reúne laranja, banana, maçã e abacaxi; `P01601` descreve suco natural sem identificar a fruta. Portanto, **a PNS não isola laranja, cítricos ou flavanonas**. A [POF 2017–2018](https://www.ibge.gov.br/estatisticas/sociais/saude/24786-pof-2017-2018.html) distingue alimentos cítricos, mas não oferece o desfecho específico de câncer de ovário nesse módulo. A POF é discutida como disponibilidade de pesquisa e não foi importada como população deste dashboard. Não há chave pública comum utilizada para ligar individualmente POF, PNS e registros de câncer.

## 13. UK Biobank: ultraprocessados, incidência e mortalidade

A evidência internacional provém de [Chang e colaboradores, eClinicalMedicine 2023;56:101840](https://pmc.ncbi.nlm.nih.gov/articles/PMC9985039/), DOI [10.1016/j.eclinm.2023.101840](https://doi.org/10.1016/j.eclinm.2023.101840). O arquivo [ukbiobank.json](../frontend/data/ukbiobank.json) reproduz resultados publicados, sem acesso ou ligação a microdados individuais britânicos.

### População, exposição e desfechos

O estudo prospectivo incluiu **197.426 participantes**, dos quais **107.919 mulheres** e 89.507 homens, sem câncer prévio segundo os critérios do estudo. O recrutamento geral do UK Biobank ocorreu aos 40–69 anos. A avaliação alimentar usada nesta análise corresponde a **2009–2012**, com um a cinco recordatórios de 24 horas Oxford WebQ. A exposição principal é a participação de ultraprocessados no **peso total da dieta**, em gramas, incluindo bebidas. O contraste contínuo é um aumento de **10 pontos percentuais**, e não um aumento relativo de 10% nem dez pontos da participação calórica.

Os modelos ovarianos usam as **107.919 mulheres**, com sítio **C56**. Os resultados ajustados publicados são:

| Desfecho | Eventos | HR por +10 pontos percentuais do peso da dieta | IC95% | Fonte |
|---|---:|---:|---|---|
| Incidência de câncer de ovário | 291 casos incidentes | 1,19 | 1,08–1,30 | Tabela 2 |
| Mortalidade por câncer de ovário | 143 óbitos | 1,30 | 1,13–1,50 | Tabela 3 |

Os autores empregaram modelos de Cox com ajuste para características demográficas, sociais e de estilo de vida; os modelos femininos também consideraram menopausa, contraceptivos orais, terapia hormonal e paridade. A lista de covariáveis, os períodos de cobertura dos registros e as análises de sensibilidade estão preservados no JSON e no artigo. O ajuste não elimina necessariamente confundimento residual, erros alimentares ou seleção da coorte.

HR é uma razão de riscos instantâneos ao longo do seguimento; não é probabilidade absoluta de adoecer. O desfecho de mortalidade parte da coorte e não constitui uma análise de letalidade ou sobrevida apenas entre os 291 casos incidentes. Os anos-pessoa totais publicados para a coorte inteira não são denominadores ovarianos. Como o artigo não publica o total exato de anos-pessoa feminino pertinente em cada tabela, esses campos permanecem `null`; não são reconstruídos dividindo eventos por taxas arredondadas.

### Quartis publicados e comparação com o Brasil

Os quatro quartis de ultraprocessados mantêm os limites divulgados: **0–13,4%; 13,5–20,0%; 20,1–29,4%; 29,5–100%**. A tabela inicial de perfis alimentares, escolaridade e IMC inclui **mulheres e homens**, enquanto os HR de ovário se restringem às mulheres. Os desvios-padrão publicados descrevem dispersão dos perfis, sem serem apresentados como IC95%. Não se criaram novas categorias de alimentos a partir dessas médias. Na comparação Q4 versus Q1 para incidência ovariana, o IC95% de **0,98–2,15** inclui 1; essa comparação não deve receber a mesma interpretação estatística do contraste contínuo principal.

| Aspecto | UK Biobank / Chang et al. | PNS 2019 / processamento do projeto |
|---|---|---|
| Desenho | Coorte prospectiva observacional britânica. | Inquérito transversal com amostragem complexa. |
| População ovariana | Mulheres do UK Biobank; 107.919 na análise. | Mulheres brasileiras de 18 anos ou mais; 46.869 entrevistas. |
| Ultraprocessados | Percentual do peso total da dieta. | Cinco ou mais de dez grupos consumidos no dia anterior. |
| Desfecho | Novo registro de câncer ou óbito durante o seguimento. | Relato de diagnóstico médico de ovário atual ou passado. |
| Medida | HR ajustado e IC95%. | Proporção ponderada, denominador, numerador e IC95% disponível. |

A leitura conjunta permite formular perguntas e explorar desigualdades brasileiras, preservando as diferenças de desenho e exposição. O UK Biobank não representa toda a Europa. Os filtros de UF, idade e coorte da PNS não alteram os resultados britânicos. Não se convertem cinco grupos em percentual do peso da dieta, não se aplica o HR ao total de mulheres de uma UF e não se calcula risco absoluto, casos atribuíveis ou um escore brasileiro a partir dessa associação. As tabelas, o suplemento e seus hashes estão em [source_snapshots/ukbiobank](source_snapshots/ukbiobank/).

## 14. Projetos e bolsas FAPESP

O módulo de fomento reproduz as fichas públicas da Biblioteca Virtual da FAPESP: dois auxílios e cinco bolsas vinculadas, conferidos em 18/10/2026. O auxílio principal **25/14126-3 — Marie.AI: Plataforma Multimodal de Saúde da Mulher** tem vigência de **01/04/2026 a 31/03/2028** e **Paula Cristina dos Santos** como pesquisadora responsável e beneficiária. A referência à segunda fase do PIPE no [resumo oficial](https://bv.fapesp.br/pt/auxilios/119846/marieai-plataforma-multimodal-de-saude-da-mulher/) corrobora a identificação PIPE II informada pela usuária. O cabeçalho da ficha publica a modalidade PIPE sem número de fase.

O auxílio anterior **23/13767-0 — Marie.IA: plataforma para rastreamento de neoplasias ovarianas**, vigente de **01/02/2024 a 31/10/2024**, possui vínculo recíproco com o atual nas [fichas oficiais](https://bv.fapesp.br/pt/auxilios/113956/marieia-plataforma-para-rastreamento-de-neoplasias-ovarianas/). As cinco bolsas são **26/21806-3, 26/04565-2, 26/04434-5, 26/04531-0 e 26/04794-1**. Cada uma preserva título, modalidade, beneficiário e vigência próprios.

O arquivo [funding.json](../frontend/data/funding.json) contém as URLs oficiais e os vínculos; [FAPESP.md](FAPESP.md) documenta a conferência e as diferenças relevantes. Não são inferidos níveis de bolsa TT ausentes na ficha. Um resumo com seleção futura não substitui o campo que já nomeia a pessoa beneficiária. Não se publicam valores, vagas abertas, execução financeira ou resultados clínicos que não tenham sido confirmados. Os registros de fomento não equivalem a certificação clínica ou regulatória do painel.

## 15. Catálogo de fatores de risco específicos de ovário

A seção utiliza [risk-factors.json](../frontend/data/risk-factors.json), esquema `ovarian-risk-1.0`, e a fundamentação em [FATORES_DE_RISCO.md](FATORES_DE_RISCO.md). A tabela enviada pela usuária tratava de câncer de mama; sua estrutura foi adaptada com revisão das relações para ovário, apoiada nas fontes específicas do INCA, do NCI e nas publicações indicadas em cada item.

O catálogo separa relações estabelecidas, associações com menor ocorrência, resultados ainda incertos e condições de contexto. Ele não atribui pontos nem soma fatores. História familiar e genética podem se sobrepor; nuliparidade e história de partos descrevem o mesmo eixo reprodutivo. Nenhuma ausência no extrato é interpretada como ausência de característica na pessoa.

Entre as características reconhecidas selecionadas, somente idade e IMC têm correspondência no extrato atual. A idade aparece como faixa de estratificação, sem inferir menopausa. O IMC referido ≥30 está disponível pelo indicador `obesity`, sem ser chamado de obesidade pós-menopausa. Os demais atributos clínicos, reprodutivos e hereditários não foram derivados para este produto. Isso não equivale a afirmar que nenhuma pergunta relacionada exista em toda a PNS.

Ultraprocessados no estudo britânico não recebe correspondência direta com a métrica PNS, porque as exposições diferem. Cítricos não são apresentados como prevenção demonstrada. Água, escolaridade e IDHM continuam sendo contexto domiciliar e social, sem virar predisposição clínica ou probabilidade de câncer. A seção não modifica o sítio C56 do SIM nem infere histologia para o relato autorreferido de ovário.

## 16. Reprodução e verificações documentadas

O processamento PNS é reproduzido por [scripts/build_pns2019.py](../scripts/build_pns2019.py). Os agregados SIM/INCA são reconstruídos por [scripts/rebuild_admin.py](../scripts/rebuild_admin.py), que utiliza as fontes retidas e o extrator original. O contexto é conferido ou regenerado por `scripts/build_context.py`. Os comandos e argumentos disponíveis estão no [README](../README.md); cada script possui `--help`.

As verificações realizadas e registradas incluem:

- Leitura conforme o dicionário, pesos válidos, contagem de entrevistadas e partições por UF, idade e coorte.
- Preservação de UPAs fora dos domínios e verificação de variância zero para um desfecho constante.
- Reprodução do percentual publicado de adultos de ambos os sexos com cinco ou mais grupos de ultraprocessados no dia anterior: **14,3053%**, equivalente a **14,3%** a uma casa decimal.
- Conferência dos intervalos, dos totais ponderados e dos pontos das estimativas condicionais nos arquivos gerados.
- Verificação de pontos e contagens reais em pequenas amostras, avisos de qualidade e distinção entre limites 0%/100% e ausência de denominador, conforme a política 1.5.
- Reprodução independente de **N=53**, da prevalência de relato de ovário e do intervalo de frutas no domínio com relato, utilizando outra implementação do cálculo de variância.
- Soma das tabelas SIM por idade e UF, concordância com o total nacional informado pelo INCA e preservação dos valores censurados de casos novos estimados.
- Correspondência do contexto com as contagens do Censo e os índices publicados do PNUD/FJP.
- Contrato entre agregados e adaptador do frontend, documentado em [ADAPTER.md](source_snapshots/ADAPTER.md) e verificável por [validate_frontend_data.cjs](../scripts/validate_frontend_data.cjs).
- Lógica das páginas e interações, incluindo filtros, coortes, modal do mapa de calor, água, escolaridade, IDHM, seleção dos 55 pares e exportação; os cenários programados estão em [validate_app_interactions.cjs](../scripts/validate_app_interactions.cjs).
- Conferência dos resultados UK Biobank contra artigo e suplemento, separando denominadores, unidades, perfis de ambos os sexos e modelos ovarianos femininos.
- Conferência de títulos, modalidades, vigências, beneficiários e vínculos nas sete fichas oficiais FAPESP retidas.
- Verificação do catálogo de fatores de risco: 18 IDs únicos, fontes por item, categorias e correspondência com o extrato PNS, sem prevalências clínicas ou pontuações presumidas.
- Execução do componente local com AppTest do Streamlit 1.66.0 e reprodução do contexto com comparação byte a byte contra os arquivos incluídos.

Os relatórios PNS retidos estão em [validation.json](source_snapshots/pns/validation.json) e [validation_report.txt](source_snapshots/pns/validation_report.txt). Fontes e hashes permitem identificar a edição reproduzida. Datas de geração podem mudar em uma nova execução mesmo quando os indicadores permanecem iguais.

Essas verificações sustentam a procedência e a consistência dos dados, cálculos e fluxos descritos. Não constituem validação clínica, avaliação de eficácia de uma intervenção ou validação visual em um navegador. Atualizar uma fonte requer conferir novamente ano, universo, códigos, regras e comparabilidade, além de executar as verificações pertinentes.
