# Dados reais para Marie Câncer de Ovário

Este pacote contém tabelas agregadas oficiais, sem microdados individuais e sem dados sintéticos. As respostas HTML originais foram preservadas para auditoria, junto com os parâmetros da consulta e hashes SHA-256.

## Arquivos de integração

- `ovarian_admin_real.json`: indicadores e metadados prontos para o aplicativo.
- `extract_ovarian_admin.py`: extrator/validador, utilizando somente a biblioteca padrão do Python.
- `provenance.json`: fontes, hashes e identificação do arquivo gerado.
- `sim_2024_request.json`: parâmetros exatos da consulta ao TabNet.
- `sim_2024_uf_age.html`, `tabnet.html`, `inca_2026_uf.html` e `inca_ovario_population.html`: fontes oficiais retidas.

## Mortalidade SIM 2024

Fonte: Ministério da Saúde, MS/SVSA/CGIAE, Sistema de Informações sobre Mortalidade.

Consulta: <https://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/obt10uf.def>

Escopo: ano do óbito 2024; sexo feminino; causa básica C56, neoplasia maligna do ovário; UF de residência; faixas etárias detalhadas publicadas pelo TabNet. A resposta informa dados finais de 2024, com extração da base em 02/12/2025.

Resultado nacional: **4.567 óbitos**, todas as idades. O mesmo total consta na página oficial de câncer de ovário do INCA. A validação verificou todas as somas estaduais e etárias, além da concordância com o número nacional do INCA.

O objeto `mortality.rows` contém 493 registros: 27 UFs, Brasil e residência ignorada/exterior, para 16 faixas etárias publicadas e um total de todas as idades. Cada registro informa `uf`, `uf_code`, `uf_name`, `age`, `age_label`, `deaths`, `year`, `sex`, `unit` e `source_id`.

Faixas publicadas: 5–9, 10–14, 15–19, 20–24, 25–29, 30–34, 35–39, 40–44, 45–49, 50–54, 55–59, 60–64, 65–69, 70–74, 75–79 e 80 anos ou mais. Não há contagens residuais fora das colunas exibidas: suas somas coincidem com os totais de cada UF. O objeto registra esse fato como `unallocated_age_residual: 0` sem inventar outras colunas.

O valor `age="all"` significa **todas as idades**, incluindo menores de 18 anos. Ele não significa "18 anos ou mais". Mantenha um seletor etário administrativo próprio; não aplique o seletor 18–29 da PNS a uma faixa que contém 15–19.

A linha `uf="UNKNOWN_RESIDENCE"` corresponde a "Ignorado/exterior" e está preservada. Ela apresenta zero em todas as células deste recorte. O símbolo `-` foi convertido em zero pela definição explícita da legenda do TabNet, e não por preenchimento de dados ausentes.

Não há taxa de mortalidade neste pacote. `rates` é `null`, pois foi consultado número de óbitos e não foi importado denominador populacional do mesmo ano. Pesos da PNS 2019 e população do Censo 2022 não devem ser usados para apresentar esses óbitos como uma taxa de 2024.

**Rótulo recomendado:** "Óbitos por câncer de ovário · 2024".

**Complemento:** "Sexo feminino · causa básica C56 · por UF de residência · SIM".

## Estimativa de incidência INCA 2026

Fonte: <https://www.gov.br/inca/pt-br/assuntos/cancer/numeros/estimativa/estado-capital/brasil/por-estado/por-estado/>

Tabela publicada: estimativas de novos casos de câncer por estado para 2026. Foram extraídos somente os valores da coluna "Ovário", identificada pelo cabeçalho. A página geral de câncer de ovário informa 8.020 casos novos para cada ano do triênio 2026–2028; a tabela estadual consultada é intitulada ano 2026.

O objeto `incidence_estimate.rows` contém as 27 UFs e o Brasil, com valores anuais de casos novos **estimados**, todas as idades. O total nacional publicado é **8.020**. Não existe estratificação etária nesta tabela; o cartão de estimativa deve permanecer identificado como todas as idades e não responder ao filtro etário.

Valores são arredondados a múltiplos de dez. Acre, Amapá e Roraima foram publicados como `**`, definido na fonte como número de casos menor que vinte. Esses registros preservam `cases: null`, `display: "<20"`, `censored: true`, `censoring: "less_than_20"` e `published_value: "**"`. **Não transformar esses valores em zero, dez ou vinte.**

Use o total nacional publicado, sem reconstruí-lo pela soma de números estaduais arredondados e censurados. Nenhuma taxa de incidência foi calculada ou extraída nesta tabela.

**Rótulo recomendado:** "Novos casos estimados por ano · INCA 2026".

**Complemento:** "Ovário · todas as idades · estimativa publicada, não casos observados".

## Interpretação conjunta

SIM descreve óbitos e INCA fornece uma estimativa de novos casos. Os períodos são diferentes e os dois números não devem ser divididos entre si para produzir letalidade ou sobrevida. Também não há vínculo individual entre essas tabelas e as entrevistadas da PNS.

As tabelas de hospitalização, APAC e estadiamento não foram importadas neste arquivo. Mantenha esses campos ausentes até que uma fonte adequada seja processada.

## Reprodução

Com os arquivos retidos, validar e gerar novamente o JSON:

```bash
python extract_ovarian_admin.py
```

Para consultar novamente as mesmas fontes públicas:

```bash
python extract_ovarian_admin.py --refresh
```

O extrator verifica o ano, causa, sexo, largura das tabelas, soma de todas as linhas e colunas e o total nacional de referência. Se uma publicação mudar de estrutura ou de escopo, o processamento interrompe a geração em vez de preencher valores presumidos.

O hash do JSON muda quando sua data de geração muda; os hashes dos arquivos oficiais retidos permitem comparar a identidade dos dados efetivamente utilizados. `provenance.json` registra o hash do JSON entregue.
