# Fontes e reprodução do contexto estadual

Este diretório conserva as fontes usadas por `frontend/data/context.json`. O script `scripts/build_context.py` reconstrói as 28 linhas de Brasil e Unidades da Federação, valida os hashes e compara o resultado com o artefato registrado. Não faz novas consultas à internet e usa apenas a biblioteca padrão do Python.

## Comandos

Execute a partir da raiz do projeto:

```bash
python scripts/build_context.py --check frontend/data/context.json
```

Essa operação é somente leitura. Para gravar uma reprodução em outro caminho:

```bash
python scripts/build_context.py --output build/context.json
```

O diretório dos snapshots é localizado em relação ao próprio script. Não há dependência de caminhos da sessão de trabalho. O frontend nunca é destino de gravação implícito.

## Conteúdo dos snapshots

| Arquivo | Origem e finalidade |
|---|---|
| `sidra6803_metadata.json` | Metadados originais da tabela oficial do IBGE, incluindo variável e categorias |
| `sidra6803_values.json` | Resposta original da consulta à API para Brasil e 27 UFs |
| `sidra6803_request_url.txt` | URL exata da consulta |
| `base_de_dados.xlsx` | Planilha original PNUD, série 2012–2021; aba `Base de Dados` |
| `fontes_1.xlsx` | Definições, fórmulas, universos e fontes do PNUD |
| `idhm_sources.txt` | Extração textual auxiliar da planilha de fontes |
| `water_sources_notes.txt` | Notas de definição e conferência do abastecimento |
| `water_access_census2022_uf.json` | Extração derivada de água citada nas notas; a reprodução usa a resposta original da API |
| `context_metadata.json` | Proveniência e textos metodológicos fixados, sem linhas de dados |
| `snapshot_manifest.json` | URLs, tamanhos, hashes SHA-256 e hash do JSON de referência |

Os JSONs do SIDRA preservam o corpo original das respostas depois da descompressão HTTP. As duas planilhas originais somam menos de 350 KB; os grandes relatórios PDF não integram este pacote. As notas e os metadados são documentos derivados, identificados no manifesto.

## Água: Censo 2022

Fonte: [SIDRA 6803](https://sidra.ibge.gov.br/tabela/6803). A extração usa variável **381**, classificação **1821**, categoria **72144** no numerador e categoria **72129** no denominador. O percentual é calculado como:

```text
100 × domicílios com rede geral como principal abastecimento
    / domicílios particulares permanentes ocupados
```

O script preserva as contagens oficiais e arredonda apenas o percentual final a quatro casas decimais. Confere que a soma das contagens das 27 UFs coincide com Brasil. O total nacional é 60.775.085/72.456.368 = 83,8782%.

Esse é um indicador de infraestrutura domiciliar: não certifica potabilidade, tratamento, continuidade ou ausência de contaminantes. Não utiliza o denominador populacional do índice IN055 do SNIS.

## IDHM: série utilizada e anos

Fonte: [planilha PNUD](https://www.undp.org/sites/g/files/zskgke326/files/2023-07/base_de_dados.xlsx), acompanhada da [planilha de fontes](https://www.undp.org/sites/g/files/zskgke326/files/2023-07/fontes_1.xlsx). São selecionadas as linhas com `AGREGACAO` igual a `BRASIL` ou `UF`, utilizando o código IBGE para ligar os territórios. As regiões metropolitanas e as abas de sexo/cor não entram nessa extração.

| Campos do contexto | Ano de referência |
|---|---:|
| `idhm`, `idhm_education`, `idhm_year` | 2021 |
| `idhm_2019`, `idhm_education_2019`, `idhm_reference_year_aligned_to_pns` | 2019 |
| `water_network_pct`, contagens de domicílios, `water_year` | 2022 |

Os índices são reproduzidos das colunas `IDHM` e `IDHM_E`. Não são recalculados nem convertidos em percentuais. O índice Brasil é o valor nacional publicado, e não uma média dos estados. Os dois campos de cada par vêm do mesmo ano e da mesma planilha.

O Painel PNUD passou a anunciar uma edição com série até 2024, publicada em 2026. **Essa série nova não foi utilizada.** A planilha conservada aqui termina em 2021; menções a 2024 nos metadados documentam a existência da edição posterior. O script rejeita divergências entre os anos do arquivo e os metadados.

Na interpretação dos gráficos, os valores de 2019 permitem alinhamento temporal com a PNS 2019. O cruzamento por UF continua sendo uma comparação ecológica entre populações. A escolaridade da entrevistada deve vir da PNS, e não ser atribuída a partir do IDHM Educação de seu estado.

## Integridade e limites da reprodução

O manifesto registra o SHA-256 de cada insumo e do `context.json` de referência. O script verifica os hashes, a cobertura territorial, os anos, os intervalos dos índices e a soma das contagens censitárias. A saída deve coincidir byte a byte com o JSON registrado. Uma atualização intencional de fonte, método ou metadados exige uma nova versão documentada dos snapshots e do manifesto; substituir uma planilha silenciosamente provoca falha de validação.
