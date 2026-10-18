# Marie Câncer de Ovário — verificação da versão 3.0

Verificações concluídas em **18/10/2026**. Este documento registra o que foi conferido na entrega Streamlit, com o conjunto de dados **pns-ovarian-1.5**. Os testes avaliam os cálculos e o funcionamento do software; não constituem validação clínica ou demonstração de causalidade.

## Aplicação e identidade

- **PASS — Streamlit 1.66.0:** execução de `app.py` pelo AppTest sem exceções; um componente local `app.marie_ovario`, com título Marie Câncer de Ovário e versão PNS 1.5.
- **PASS — JavaScript:** sintaxe de `app.js`, adaptador e ponte Streamlit; inicialização sem erro com os arquivos reais.
- **PASS — dez páginas:** visão executiva, população, fatores de risco, alimentação, cruzamentos, atenção oncológica, One Health, evidências, projetos e bolsas, fontes e método.
- **PASS — identidade:** presença do logo Marie original enviado pela equipe e identificação FAPESP PIPE Fase 2 nas páginas; ausência da marca anterior no conteúdo renderizado. Os arquivos originais dos dois logos foram incluídos sem alteração dos pixels.
- **PASS — interações:** malha das 27 UFs, filtros de território/idade/coorte, calor por escolaridade, modal com IC/n, água e IDHM, inversão A/B, exportações e pauta; 36 combinações adicionais de página/recorte.
- **PASS — leitura e rolagem no código:** tipografia ampliada e regras responsivas; rolagem vertical explícita no componente e navegação; rolagem horizontal em tabelas e gráficos largos.

A verificação de interações utiliza um ambiente JavaScript controlado, sem motor visual de navegador. O AppTest também não renderiza o conteúdo interno do componente. **Não houve inspeção visual em navegador nem publicação na conta Streamlit da usuária.** O projeto mantém a estrutura HTML/CSS do painel aprovado, com extensões para os novos módulos, nova identidade e letras maiores.

## Pequenas amostras: valores visíveis, com incerteza

A regra anterior que ocultava resultados com menos de 30 observações foi substituída por divulgação exploratória. As contagens reais e os pontos calculados são preservados; os alertas acompanham cada estimativa.

| Recorte real | N observado | Frutas ≥5 dias/semana: respostas sim | Percentual ponderado | IC95% | Qualidade |
|---|---:|---:|---:|---|---|
| Brasil, relato de ovário, todas as idades adultas | 53 | 28 | 38,4831% | 22,0831–57,9969% | Cautela |
| Brasil, relato de ovário, 30–39 anos | 5 | 2 | 50,3113% | 9,8619–90,3573% | Inconclusivo |
| SP, relato de ovário, todas as idades adultas | 4 | 2 | 45,4387% | 9,0439–87,4612% | Inconclusivo |
| SP, relato de ovário, 30–39 anos | 1 | 1 | 100% observado | Não calculável | Inconclusivo |
| Brasil, relato de ovário, 18–29 anos | 0 | 0 | Sem estimativa | Sem estimativa | Sem respostas |

Esses casos foram verificados nos agregados e no adaptador. Os fluxos da interface exercitaram o recorte n=5, o limite de 100% com n=1 e o grupo sem observações. O limite observado não recebe IC degenerado, e ausência não é transformada em zero. O acesso ao UK Biobank permanece disponível quando um grupo brasileiro não tem observações.

## Dados PNS e invariância

- **46.869 mulheres adultas**, incluindo **53 relatos de câncer de ovário**; peso do morador selecionado V00291, 8.027 PSUs, 574 estratos e 7.453 graus de liberdade do desenho.
- Varredura de **319.872 proporções**, **12.320 cruzamentos** e **28 territórios**, verificando denominadores, contagens, composição de células e intervalos.
- A auditoria encontrou 107.185 estimativas inconclusivas, 40.220 proporções observadas de 0%/100% com IC/CV ausentes e 108.585 denominadores sem respostas mantidos como `no_data`. Esses números contam saídas analíticas, não pessoas.
- A comparação com a versão 1.4 preservou exatamente **957.671 campos numéricos previamente divulgados**. Outros 594.278 campos antes `null` passaram a mostrar os números calculados pelo pipeline. A mudança é de divulgação; não há geração de pessoas ou imputação adicional pelo projeto.
- A revisão detectou um resíduo numérico de variância em um domínio de duas observações. Resíduos abaixo da tolerância documentada no código são tratados como não informativos: ponto e n permanecem, IC/CV ficam ausentes com `no_variance`.
- O benchmark de ultraprocessados entre adultos de ambos os sexos permanece **14,3053%**, reproduzindo os 14,3% publicados pelo IBGE a uma casa decimal.

Os registros completos estão em `docs/source_snapshots/pns/`. Os cálculos de proporção e suas variâncias preservam a linearização de Taylor do desenho amostral; os limiares n/CV/célula pequena são alertas internos, não normas oficiais do IBGE.

## UK Biobank, fatores e FAPESP

- **UK Biobank:** valores de [Chang et al., 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC9985039/), artigo e suplemento retidos. Os modelos de ovário têm 107.919 mulheres, 291 casos incidentes e 143 óbitos. Os perfis publicados de quatro quartis somam 197.426 participantes de ambos os sexos.
- **PASS — medidas britânicas:** HR/IC de incidência e mortalidade, troca de desfecho, referência Q1, contraste inconclusivo Q4/Q1 para incidência, perfis alimentares em gramas/dia e seleção de quartil. Os filtros PNS não aparecem no modo exclusivamente britânico.
- **PASS — integração:** grupos brasileiros com n/IC e unidade PNS, evidência britânica com unidade e população originais; nenhum HR aplicado para produzir casos brasileiros ou risco individual.
- **PASS — fatores de risco:** 18 itens e seis domínios; filtros de domínio/direção e atalho para IMC. Contexto, associações incertas e fatores clínicos têm classificação explícita; ausência de variável não vira fator ausente.
- **PASS — fomento:** dois auxílios e cinco bolsas, com os sete processos identificados no conteúdo e na exportação, beneficiários e vigências próprios. [Fonte principal FAPESP](https://bv.fapesp.br/pt/auxilios/119846/marieai-plataforma-multimodal-de-saude-da-mulher/).

## Exportações e precisão territorial

A revisão independente identificou e motivou três correções verificadas:

1. As linhas PNS da matriz e dos totais preservam qualidade, motivos, CV, numerador, denominador e os intervalos correspondentes, evitando que uma célula rara circule sem o aviso de inconclusivo.
2. A dispersão entre estados mostra a precisão de cada eixo PNS no detalhe e na tabela. A exportação preserva esses campos por eixo; Censo e IDHM não recebem artificialmente o n da PNS. Foi exercitado o exemplo ES, 80+, ultraprocessados: n=69, dois eventos, CV=0,86951 e indicação inconclusiva.
3. O CSV de quartis britânicos distingue `n_mulheres_modelo_total` de `n_mulheres_quartil`; Q1 contém 28.272 mulheres, enquanto o modelo inteiro tem 107.919.

A exportação do modo UKB contém resultados britânicos; a comparação integrada contém linhas identificadas por origem, unidades e recortes próprios. O CSV da atenção oncológica respeita a UF e mantém todas as idades.

## Fontes que mantiveram a versão

- SIM 2024: **4.567 óbitos femininos por C56**; INCA 2026: **8.020 casos novos anuais estimados**. A revisão anterior reproduziu as tabelas administrativas a partir dos arquivos oficiais retidos. Os números menores de 20 do INCA permanecem na forma publicada.
- Contexto: a verificação reproduz nove insumos e 28 linhas de `context.json` com igualdade byte a byte. Censo 2022 e IDHM 2019/2021 preservam seus anos e universos.
- Nenhum dado dessas fontes é interpretado como registro das mesmas pessoas da PNS.

## Repetir verificações

Na raiz do projeto:

```bash
node scripts/validate_frontend_data.cjs
node scripts/validate_app_interactions.cjs
python3 scripts/build_context.py --check frontend/data/context.json
```

Node.js é necessário somente para esses verificadores; o dashboard inicia com Python e Streamlit.

```python
from streamlit.testing.v1 import AppTest
app = AppTest.from_file("app.py", default_timeout=30).run()
assert not app.exception
assert len(app.get("component_instance")) == 1
```
