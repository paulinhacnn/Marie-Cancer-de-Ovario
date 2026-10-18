# Marie Câncer de Ovário — Fatores de risco

Revisão dirigida: **18 de outubro de 2026**. Catálogo: `ovarian-risk-1.0`.

## O que esta seção informa

Fator de risco é uma característica ou exposição associada a maior chance de desenvolver uma doença em uma população. Ter um fator não determina um diagnóstico; uma associação com menor risco também não garante proteção. O catálogo organiza fatores relacionados ao câncer de ovário, relações ainda em estudo e informações de contexto para o gestor. Não calcula uma probabilidade individual.

As sínteses do INCA e do NCI sustentam a seleção. A literatura trata principalmente de carcinoma epitelial de ovário; parte das sínteses do NCI reúne ovário, tuba e peritônio. As associações podem variar por histologia. A seção não deve ampliar silenciosamente a definição C56 dos dados administrativos nem presumir o subtipo do diagnóstico autorreferido na PNS. [1–5]

O conteúdo é uma revisão dirigida para este produto, não uma revisão sistemática nova, uma classificação GRADE própria ou uma lista exaustiva de todos os fatores e intervenções possíveis.

## Adaptação da tabela enviada

**Proveniência histórica:** `OncoLens_Observatorio_Risco_Populacional_Documento_Tecnico_Cientifico(1).docx`, tabelas 6 e 10. O título do documento é “Observatório Brasileiro de Risco Populacional de Câncer de Mama”. Sua estrutura foi aproveitada; as relações clínicas foram revistas para **ovário**.

| Conteúdo original | Decisão para câncer de ovário |
|---|---|
| Idade | Preservada como estratificação demográfica, sem corte de “alto risco” ou pontos. |
| Obesidade pós-menopausa | Substituída por adiposidade/IMC elevado. O extrato mede IMC, mas não contém a derivação de menopausa. Não chamar seu resultado de obesidade pós-menopausa. |
| Menarca precoce e menopausa tardia | O INCA descreve associações possíveis. Mantidas entre relações com incerteza; não transportados os cortes operacionais do documento de mama. |
| Terapia hormonal prolongada | O item de ovário descreve terapia hormonal atual ou recente **após a menopausa**. Não criar exposição prolongada sem dados de duração. |
| Contraceptivo hormonal | Delimitado ao uso de **contraceptivos orais**, associado a menor risco de ovário. Formulação, duração e tempo desde o uso importam; não generalizar a todo método hormonal. |
| Nuliparidade | Corrigida a distinção: nuliparidade é nenhum parto; nuligestação é nunca ter engravidado. A existência de uma gestação não informa, por si só, a ocorrência de parto. |
| História familiar e genética | História familiar, variantes germinativas patogênicas em BRCA1/BRCA2 e síndrome de Lynch têm descrição própria para ovário. Nenhuma prevalência genética foi imputada. |
| PALB2 e outros genes da tabela de mama | Não incorporados por transposição. A seleção atual não afirma que outros genes não tenham relação com ovário; requer revisão específica antes de ampliar o catálogo. |
| ADH, ALH e LCIS | Lesões mencionadas no contexto de mama; não transportadas como marcadores de risco ovariano. |
| Álcool | Mantido como relação específica com ovário não estabelecida, conforme a síntese do NCI; não transferido como fator comprovado da tabela de mama. |
| Atividade física e radiação genérica | As regras da tabela original não foram convertidas em classificações de risco de ovário. Não há derivação correspondente neste extrato. Isso não é uma avaliação de todos os efeitos dessas exposições ou de cenários ocupacionais específicos. |

As decisões sobre história familiar, genética, hormônios, reprodução e adiposidade se apoiam nas fontes específicas de ovário. [1–5]

## Relações incluídas

| Grupo | Itens e interpretação |
|---|---|
| Idade e população | A incidência de carcinoma epitelial aumenta com o avanço da idade. [1] |
| História familiar e hereditariedade | História familiar, sobretudo em parentes de primeiro grau; variantes patogênicas em BRCA1/BRCA2; síndrome de Lynch. [2–5] |
| História clínica, reprodutiva e hormonal | Endometriose, com associação mais forte para carcinomas endometrioide e de células claras; terapia hormonal após a menopausa; nuliparidade e história de partos; contraceptivos orais; amamentação. [1–5] |
| Adiposidade | Associação reconhecida do IMC com magnitude modesta na síntese do NCI e diferenças conforme o uso de terapia hormonal. [1,3] |
| Alimentação e evidências em estudo | Ultraprocessados: associação observacional no UK Biobank; cítricos/flavanonas: prevenção não demonstrada; álcool: associação específica com ovário não estabelecida na síntese do NCI. [5–7] |
| Contexto social e ambiental | Água, escolaridade, IDHM e IDHM Educação descrevem condições de vida e diferenças territoriais. Não foram convertidos em predisposição clínica. [8–11] |

Menarca precoce e menopausa tardia estão entre as relações com incerteza. O INCA usa linguagem de possibilidade; não foram transformadas em critérios de classificação individual. [1]

**Nuliparidade e paridade são duas descrições do mesmo eixo reprodutivo.** Sua apresentação separada permite explicar as comparações epidemiológicas; não significa que sejam fatores independentes a somar. História familiar e predisposição genética também podem se sobrepor.

## O que está disponível nos dados atuais

Entre as características de risco reconhecidas selecionadas, somente **idade** e **IMC** têm correspondência no extrato atual da PNS 2019:

| Característica | Correspondência no produto | Limite |
|---|---|---|
| Idade | Filtro de faixa etária; `metric: null`. | Faixa etária não determina menopausa. |
| IMC | `metric: "obesity"`: proporção com IMC ≥30 kg/m² entre respostas válidas. | Peso e altura referidos, inclusive imputações do IBGE; exclui gestantes e gravidez desconhecida. Não é antropometria aferida nem uma estimativa de risco oncológico. |
| Demais atributos clínicos, reprodutivos e hereditários | `metric: null`; mensagem de indisponibilidade. | Não foram extraídos para este produto. Isso não significa que estejam ausentes na pessoa ou em toda a PNS. |

A correspondência foi conferida no manifesto e no extrato agregados do projeto. Os itens da PNS usados em IMC são `P00104`, `P00404`, `P00405` e `P005`; as regras completas e denominadores permanecem no manifesto. O questionário é a fonte primária para interpretar as perguntas. [8,9]

Água, escolaridade e IDHM estão disponíveis **como contexto**, em módulos próprios. Seu `metric` é nulo neste catálogo para não criar um atalho com aparência de medida clínica de risco. Preservar as diferenças entre unidades, populações e anos. A série territorial utilizada no produto não deve ser chamada de atual apenas porque o site do PNUD recebeu uma nova edição. [9–11]

## Alimentação: unidade e interpretação

O estudo de Chang et al. avaliou a **porcentagem do peso da dieta** correspondente a ultraprocessados. A PNS do produto usa **consumo de cinco ou mais grupos no dia anterior**. As exposições não são equivalentes. Os HR do estudo não devem ser aplicados ao percentual da PNS ou a uma pessoa. A associação observacional positiva consta em `uncertain` porque sua interpretação causal e a conversão para o contexto do painel não estão estabelecidas. [6,9]

No estudo de Cassidy et al., resultados sobre a subclasse flavanonas não permitem atribuir proteção comprovada à laranja ou ao suco. As análises desses alimentos não foram estatisticamente significativas. A PNS não oferece, neste extrato, uma exposição que isole cítricos ou a ingestão de flavanonas. [7,9]

## Contrato do arquivo

`frontend/data/risk-factors.json` contém `schemaVersion`, `reviewed_at`, `isSynthetic`, `definition`, `adapted_from`, `categories`, `items`, `sources` e `limitations`.

Cada item possui `id`, `label`, `category`, `direction`, `evidence`, `explanation`, `measurement`, `metric` e `source_urls`. As categorias são `demographic`, `hereditary`, `reproductive`, `metabolic`, `dietary` e `context`.

| `direction` | Significado para apresentação |
|---|---|
| `increased` | Relação reconhecida com maior ocorrência de câncer de ovário, respeitando as ressalvas do item. |
| `decreased` | Associação com menor ocorrência em comparações populacionais. |
| `uncertain` | Relação em estudo, inconclusiva ou ainda não estabelecida como fator para uso neste catálogo. Não significa ausência definitiva de associação. |
| `context` | Descrição social, domiciliar ou territorial; não estima suscetibilidade clínica. |

As etiquetas devem aparecer junto à descrição da evidência. O arquivo não contém prevalências clínicas inventadas, pontuações, multiplicadores ou coeficientes para um escore. Os nomes em inglês acima são identificadores do contrato; os textos apresentados ao público estão em português.

## Limites de uso

- Não somar os itens, multiplicar HR, imputar atributos individuais ou atribuir “alto risco” com base no catálogo.
- Os cruzamentos da PNS são transversais e o diagnóstico é autorreferido. Dieta e IMC atuais podem ser posteriores ao diagnóstico. Não representam seguimento de incidência, avaliação de prognóstico ou causalidade.
- As associações reprodutivas e hormonais não são orientação para engravidar, amamentar ou iniciar/suspender medicamentos.
- Comparar médias ou percentuais de UFs é uma análise ecológica. Não significa ter ligado as mesmas pessoas entre PNS, Censo, SIM ou IDHM.

## Fontes

Todos os endereços foram selecionados para consulta em 18/10/2026; a data da revisão não é a data de publicação das fontes.

1. [INCA — Câncer de ovário: versão para população](https://www.gov.br/inca/pt-br/assuntos/cancer/tipos/ovario/versao-para-populacao).
2. [INCA — Câncer de ovário: versão para profissionais de saúde](https://www.gov.br/inca/pt-br/assuntos/cancer/tipos/ovario/versao-para-profissionais-de-saude).
3. [NCI — Ovarian, Fallopian Tube, and Primary Peritoneal Cancers Prevention (PDQ), versão profissional](https://www.cancer.gov/types/ovarian/hp/ovarian-prevention-pdq).
4. [NCI — Ovarian Epithelial, Fallopian Tube, and Primary Peritoneal Cancer Treatment (PDQ): seção de fatores de risco](https://www.cancer.gov/types/ovarian/hp/ovarian-epithelial-treatment-pdq).
5. [NCI — Ovarian, Fallopian Tube, and Primary Peritoneal Cancers Prevention (PDQ), versão para pacientes](https://www.cancer.gov/types/ovarian/patient/ovarian-prevention-pdq).
6. [Chang K et al. Ultra-processed food consumption, cancer risk and cancer mortality: a large-scale prospective analysis within the UK Biobank. eClinicalMedicine. 2023;56:101840](https://pmc.ncbi.nlm.nih.gov/articles/PMC9985039/). DOI: 10.1016/j.eclinm.2023.101840.
7. [Cassidy A et al. Intake of dietary flavonoids and risk of epithelial ovarian cancer. American Journal of Clinical Nutrition. 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4196485/). DOI: 10.3945/ajcn.114.088708.
8. [IBGE — Pesquisa Nacional de Saúde](https://www.ibge.gov.br/estatisticas/sociais/saude/9160-pesquisa-nacional-de-saude.html).
9. [IBGE — Questionário da PNS 2019](https://biblioteca.ibge.gov.br/visualizacao/instrumentos_de_coleta/doc5569.pdf).
10. [IBGE — Censo 2022: tabela SIDRA 6803, abastecimento de água](https://sidra.ibge.gov.br/tabela/6803).
11. [PNUD — Painel IDHM](https://www.undp.org/pt/brazil/desenvolvimento-humano/painel-idhm).
