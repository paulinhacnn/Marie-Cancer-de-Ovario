# Contrato dos agregados reais — Marie Câncer de Ovário

Contrato do esquema PNS **`pns-ovarian-1.5`**, com apresentação exploratória.
`frontend/data.js` expõe `window.ONCO`, identificador técnico mantido para
compatibilidade. Aguarde `ONCO.ready` antes da primeira renderização. O
carregamento inicial inclui manifesto, resumo das UFs, SIM/INCA e detalhes
de Brasil e São Paulo. Antes de consultar cruzamentos, estratos ou coortes
de outra UF, use `await ONCO.ensure(uf)`.

## PNS 2019: filtros e carregamento

As chamadas usam `{uf, age, cohort}`, com padrões `BR`, `all`, `all`.
Território é `BR` ou uma das 27 siglas; idade é `all` ou `18-29`, `30-39`,
`40-49`, `50-59`, `60-69`, `70-79`, `80+`. As coortes são `all`, `ovarian`
e `no_ovarian`.

A coorte `ovarian` significa relato de diagnóstico médico atual ou passado,
não incidência. `all` etário da PNS significa mulheres de 18 anos ou mais.
A população ponderada representa 2019. Filtros inválidos ou dados ainda não
carregados preservam a indisponibilidade e seu motivo, sem usar outro
recorte como substituto.

`states`, `ages` e `metrics` disponibilizam rótulos para os seletores.
`metrics` acompanha o manifesto: não presumir sete métricas nem limitar o
catálogo por uma contagem antiga. A versão 1.5 tem dez indicadores e o
relato de ovário como variável adicional. O ID legado `sugary` significa
refrigerante **incluindo diet/zero**, sem isolar açúcar. `networkWater`
significa principal abastecimento pela rede geral; `treatedWater`,
tratamento declarado da água de beber no domicílio. Nenhum comprova potabilidade.

## Agregados e estratos

`aggregate(f)` é síncrono e retorna os campos abaixo:

| Campo | Significado |
|---|---|
| `women` | Soma dos pesos das mulheres no domínio; número ou `null`. |
| `womenLow`, `womenHigh` | Intervalo disponível do total ponderado. |
| `n` | Número amostral real do domínio, não casos na população. |
| `rates[id]` | Percentual numérico de um indicador ou `null`. |
| `estimates[id]` | Estatística original: `pct`, `low`, `high`, `nValid`, `nEvent`, `missing`, `cv`, `quality`, `qualityReasons`, mais disponibilidade e motivo acrescentados pelo adaptador. |
| `ovarianRate` | Estatística do relato de ovário, quando calculada para o agregado. |
| `quality`, `qualityCode` | Resumo de qualidade da linha e classificação original da população. |
| `suppressed`, `hasSuppressedEstimates` | Compatibilidade técnica para valores indisponíveis; não são cortes de tamanho amostral. |
| `raw` | Agregado original preservado. |

`groups(f, dimension)` admite `state`, `age`, `education`, `income` e `race`.
Cada linha inclui `id`, `label` e os campos do agregado. Para escolaridade,
renda e raça/cor, `rates` expressa indicadores **dentro do estrato**;
`share` e `shareEstimate` descrevem sua participação na população selecionada.
São denominadores diferentes. IDs de renda, escolaridade e raça/cor seguem
as categorias do manifesto; os IDs etários são as faixas acima.

Grupos estaduais de `all` usam o resumo nacional sem baixar todas as UFs.
Detalhes por estrato e outras coortes dependem de `ensure(uf)`. Uma UF
específica restringe a lista estadual à UF selecionada; um filtro etário
específico restringe a lista etária àquela faixa.

`ovarianN(f)` retorna o número **real** de entrevistadas no domínio de ovário,
incluindo 0 e contagens de 1 a 4. A função força a coorte `ovarian`, preserva
UF/idade e retorna `null` se a contagem não estiver disponível. Na versão
1.5 não retorna a string “<5”. Não transforma uma contagem amostral em
casos incidentes ou em total populacional.

## Política exploratória 1.5 e valores ausentes

O manifesto registra `suppressEstimates=false`,
`publishUnweightedCounts=true` e `suppressComplementaryCounts=false`.
As contagens detalhadas das três coortes são reais; não há `countsWithheld`.
Os estados de qualidade dos resultados calculados são:

| `quality` | Apresentação |
|---|---|
| `ok` | Mostrar ponto, contagens e intervalo disponível. |
| `caution` | Mostrar com cautela: CV acima de 15% e até 30%, sem alerta mais forte. |
| `inconclusive` | Mostrar ponto e contagens reais, avisos e IC95% quando calculável. |
| `no_data` | Nenhuma resposta válida no denominador: ponto e intervalo são `null`. |

`qualityReasons` pode registrar `small_sample`, `rare_cell`, `high_cv`,
`moderate_cv`, `boundary`, `no_variance`, `empty_conditional_domain` e
`no_valid_responses`. Os limiares — menos de 30 respostas, numerador ou
complemento abaixo de cinco e CV acima de 30% — são alertas internos, não
regras oficiais do IBGE. Não ocultar gráficos ou exportações por esses
limiares como se as observações deixassem de existir.

Com denominador válido, nenhum evento observado significa `pct=0` e
`nEvent=0`; todos os eventos significam `pct=100`. Esses pontos têm
`low=high=cv=null`, `quality="inconclusive"` e motivo `boundary`.
Variância não informativa também pode deixar o intervalo ausente apesar
de o ponto existir. Não desenhar IC de largura zero quando seus limites
são `null`, nem descrever zero observado como ausência populacional.

O adaptador conserva os nomes antigos `suppressed`,
`hasSuppressedEstimates` e `hasSuppressedCells` para compatibilidade.
Na versão 1.5, eles descrevem **indisponibilidade da estimativa**, inclusive
dados não carregados ou pares não fornecidos. `suppressed` de um agregado
é verdadeiro quando não há população nem indicador disponível. Uma linha
pode ter população conhecida e indicadores sem respostas válidas; sempre
verifique o valor e a qualidade de cada estatística. O resumo `quality` da
linha pode receber `inconclusive` por qualquer indicador com esse alerta.

Nunca converter `null` em zero, nem substituir denominador válido ausente
pelo total da população. Um valor numérico não dispensa a exibição da
amostra e de seus avisos.

## Cruzamentos nas mesmas entrevistadas

`cross(f, a, b)` fornece os 55 pares somente para a coorte `all`; outras
coortes, pares iguais ou inexistentes retornam indisponibilidade explícita.
A restrição corresponde aos agregados calculados, não a uma conclusão
sobre impossibilidade científica de uma análise futura.

`n` é a amostra com respostas válidas para **ambos** os indicadores;
`total` é o total ponderado desse mesmo domínio. `womenPaired` e
`cell.women` são calculados diretamente dos pesos no pipeline. Não derivar
totais de percentuais arredondados: um par com IMC pode ter menos respostas
que um par alimentar.

Um par com respostas válidas conserva quatro `cells`, inclusive zeros.
Cada célula tem `a` e `b` booleanos, `pct`, `women`, `n`, `low`, `high`,
qualidade e motivos. `pct` é a proporção conjunta sobre o domínio pareado.
Sem respostas válidas para o par, `n=0`, `cells=[]` e não há estimativa.

`conditional` contém quatro estatísticas calculadas diretamente com o
desenho amostral:

| Chave | Denominador e pergunta |
|---|---|
| `b_given_a_true` | Entre mulheres com A, qual proporção tem B? |
| `b_given_a_false` | Entre mulheres sem A, qual proporção tem B? |
| `a_given_b_true` | Entre mulheres com B, qual proporção tem A? |
| `a_given_b_false` | Entre mulheres sem B, qual proporção tem A? |

Inverter a ordem das variáveis inverte os eixos das células e troca
`b_given_a_true` com `a_given_b_true`, e `b_given_a_false` com
`a_given_b_false`. Os IC95% pertencem a cada condicional; não se obtêm
por divisão dos limites das células. Um condicionamento vazio tem
`pct=null`, sem eliminar as condicionais que possuem respostas. Essas
proporções transversais não são riscos futuros de desenvolver câncer.

## SIM e INCA

`mortality(uf, age='all')` retorna óbitos femininos por causa básica C56,
UF de residência, SIM 2024. `mortalityAges(uf)` retorna as faixas quinquenais
originais disponíveis, incluindo idades abaixo de 18 anos. IDs incompatíveis,
como `18-29`, devolvem `null`. `all` significa **todas as idades** nessa fonte.
Para somar 60 anos ou mais, usar `60-64`, `65-69`, `70-74`, `75-79` e `80+`,
conforme `adminData.mortality.age_groups`, sem aplicar as faixas PNS.
Nenhuma taxa utiliza os pesos da PNS 2019.

`incidence(uf)` retorna a estimativa anual publicada pelo INCA 2026,
todas as idades. Acre, Amapá e Roraima preservam `cases:null`,
`display:'<20'` e `censored:true`; trata-se da apresentação da fonte
oficial, preservada independentemente da política PNS. O total Brasil é o
valor nacional publicado, não a soma de parcelas arredondadas e censuradas.
A estimativa não responde a faixa etária, dieta ou coorte da PNS.

`metadata` é o manifesto PNS; `adminData` contém metadados SIM/INCA,
unidades, notas e hashes. `raw` permite inspecionar os documentos agregados
carregados. Não há ligação individual entre essas fontes.

## JSONs complementares: contexto, evidência e fomento

Os arquivos abaixo têm contratos próprios e são carregados pela interface;
não alteram os agregados da PNS:

| Arquivo | Interpretação preservada |
|---|---|
| `frontend/data/context.json` | Água do Censo 2022 e IDHM/IDHM Educação de 2019 e 2021; unidade e ano próprios em cada eixo. |
| `frontend/data/evidence.json` | Achados publicados sobre alimentação e ovário e disponibilidade das bases. |
| `frontend/data/ukbiobank.json` | Esquema `ukbiobank-1.0`; HR/IC95% em `effects`, quatro quartis em `quartiles.rows`, população e limites em `brazil_comparison`. |
| `frontend/data/risk-factors.json` | Esquema `ovarian-risk-1.0`; 18 `items` com categoria, direção, evidência, disponibilidade e fontes próprias. |
| `frontend/data/funding.json` | Esquema `fapesp-1.0`; `project`, `linked_projects` e cinco `scholarships`, com processos, modalidades, datas, beneficiários, fontes e vínculos. |

No UK Biobank, os modelos de ovário têm 107.919 mulheres, mas os perfis
alimentares dos quartis incluem ambos os sexos. A exposição principal é
percentual do **peso** da dieta. Os filtros brasileiros não recalculam os
resultados publicados. Os anos-pessoa da coorte completa não são um
denominador ovariano e não podem ser usados para estimar taxas de ovário.

Em FAPESP, `start` e `end` são datas ISO de cada processo, `links` é uma
lista de relações com processos e URLs, e `level:null` significa nível TT
não explícito na ficha. Títulos oficiais são preservados mesmo quando
diferem da marca do aplicativo. O arquivo não codifica certificação
clínica, vaga aberta ou execução financeira.

## Reprodução

Execute da pasta principal do projeto:

```bash
python -m pip install -r requirements-data.txt
python scripts/build_pns2019.py --source-dir data_raw/pns2019 --dictionary docs/source_snapshots/pns/dicionario_PNS_microdados_2019.xls --out-dir frontend/data/pns
python scripts/rebuild_admin.py
python scripts/build_context.py --check frontend/data/context.json
node scripts/validate_frontend_data.cjs
node scripts/validate_app_interactions.cjs
```

`rebuild_admin.py` reconstrói `frontend/data/admin.json` a partir das tabelas
oficiais retidas. Para consultar novamente as mesmas fontes, acrescente
`--refresh`; isso não altera automaticamente os anos. O extrator original
permanece preservado.

O pacote publicado contém agregados, documentação e fontes públicas
retidas. ZIPs/TXT de microdados usados na reprodução ficam em `data_raw/`,
excluído da publicação pelo `.gitignore`. Evidência e registros FAPESP
são curadoria de fontes primárias, com referências e hashes próprios;
não são gerados a partir das entrevistadas brasileiras. Consulte
[METODOLOGIA.md](../METODOLOGIA.md) e o [README](../../README.md).
