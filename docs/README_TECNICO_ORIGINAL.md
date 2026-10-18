# Marie Câncer de Ovário — painel para gestão em saúde

Dashboard em **Streamlit**, com interface HTML, CSS e JavaScript incluída no projeto, dedicado à população feminina, alimentação, condições sociais e atenção ao câncer de ovário. Os gráficos utilizam **dados reais e agregados**, com fonte, período, denominador e indicação de incerteza.

O painel reúne dez indicadores da PNS e 55 pares de cruzamento nas mesmas entrevistadas, informações territoriais, evidência científica sobre alimentação e ovário e registros dos projetos e bolsas FAPESP. Seu propósito é apoiar a descrição da população, a discussão de prioridades e a formulação de perguntas para a gestão. As associações apresentadas não constituem uma previsão individual de câncer.

## Executar no computador

Instale **Python 3.12**, disponível no [site oficial do Python](https://www.python.org/downloads/). Extraia o projeto e abra o terminal na pasta que contém `app.py` e `requirements.txt`.

### Linux com `externally-managed-environment` — sem ambiente virtual

Na pasta do projeto, execute:

```bash
python3 -m pip install --user --break-system-packages -r requirements.txt
python3 -m streamlit run app.py
```

Use os comandos **sem `sudo`**. `--user` instala os pacotes no diretório do usuário; `--break-system-packages` libera o bloqueio PEP 668 apresentado pelo Python da distribuição. Esses comandos não criam ambiente virtual.

### Windows — PowerShell ou Prompt de Comando

```powershell
py -3.12 -m pip install --user -r requirements.txt
py -3.12 -m streamlit run app.py
```

Abra o endereço informado pelo terminal, normalmente `http://localhost:8501`. Mantenha o terminal aberto enquanto utiliza o painel; `Ctrl+C` encerra o servidor.

O arquivo `requirements.txt` fixa a versão de Streamlit utilizada pelo projeto. Os indicadores já estão calculados em `frontend/data/`: a utilização do painel não exige baixar ou processar os microdados. O frontend é servido como componente local do Streamlit, sem etapa de compilação JavaScript.

Referência de instalação: [documentação oficial do Streamlit](https://docs.streamlit.io/get-started/installation/command-line).

## Publicar no Streamlit Community Cloud

1. Crie um repositório GitHub e envie o **conteúdo completo desta pasta**, mantendo `app.py` na raiz. Inclua `requirements.txt`, `.streamlit/config.toml`, toda a pasta `frontend/`, os agregados de `frontend/data/`, `docs/` e `scripts/`.
2. Acesse [Streamlit Community Cloud](https://share.streamlit.io/) e escolha **Create app**.
3. Selecione seu repositório, a branch utilizada e **`app.py` como arquivo de entrada** (*entrypoint file path*).
4. Em **Advanced settings**, selecione **Python 3.12** e salve.
5. Conclua a implantação. O serviço instalará as dependências de `requirements.txt` e fornecerá o endereço do aplicativo.

Conserve os nomes e a organização dos arquivos. `frontend/data/pns/uf/` contém Brasil e as 27 UFs; os demais JSONs de `frontend/data/` também fazem parte da aplicação, incluindo contexto, evidências, UK Biobank, financiamento e dados administrativos. O mapa está em `frontend/brazil-map.json` e os logotipos originais estão em `frontend/assets/marie-logo.jpeg` e `frontend/assets/fapesp.png`.

**Os microdados PNS não fazem parte da publicação.** O diretório `data_raw/`, utilizado opcionalmente para reprodução, já está excluído pelo `.gitignore`. Os arquivos oficiais de documentação e as tabelas agregadas retidas em `docs/source_snapshots/` podem acompanhar o projeto.

Este aplicativo utiliza os arquivos incluídos e não requer chaves de API. `requirements-data.txt` reúne dependências opcionais para reconstruir os indicadores; a implantação normal utiliza `requirements.txt`.

Referências: [implantação](https://docs.streamlit.io/deploy/streamlit-community-cloud/deploy-your-app/deploy), [organização dos arquivos](https://docs.streamlit.io/deploy/streamlit-community-cloud/deploy-your-app/file-organization) e [dependências](https://docs.streamlit.io/deploy/streamlit-community-cloud/deploy-your-app/app-dependencies), na documentação oficial do Streamlit.

## Identidade e leitura

A interface utiliza o **logo Marie Câncer de Ovário enviado pela equipe**, com a identificação institucional FAPESP PIPE Fase 2. A tipografia foi ampliada: títulos de página de 29–34 px, títulos de painéis em 18 px e textos de leitura, controles e tabelas em aproximadamente 13–15 px, com tamanhos próprios para rótulos de gráficos. A página e a navegação têm rolagem vertical; tabelas e gráficos largos têm rolagem horizontal.

Ao atualizar uma instalação anterior, substitua o projeto completo para manter o código e os agregados da versão 1.5 alinhados.

## Módulos do painel

| Página | O que o gestor encontra |
|---|---|
| **Visão executiva** | Síntese da população, indicadores, mapa por UF e leituras para a pauta de gestão. |
| **População** | Estratificação por idade, renda, escolaridade e raça ou cor; tamanho amostral e população representada. |
| **Fatores de risco** | Leitura específica para câncer de ovário, distinguindo fatores estabelecidos, associações em estudo e indicadores de contexto; identifica quais características estão medidas nas bases. |
| **Alimentação** | Três visões: Brasil/PNS, Reino Unido/UK Biobank e Brasil + Reino Unido. Frequências, mapa de calor, grupos com e sem relato de ovário, HRs e quartis publicados. |
| **Cruzamentos** | Tabelas e percentuais condicionais nas mesmas participantes, além de gráficos de dispersão entre estados. |
| **Atenção oncológica** | Óbitos femininos por C56 no SIM 2024 e casos novos anuais estimados pelo INCA para 2026, mantendo suas unidades próprias. |
| **One Health** | Integração de saúde humana, alimentação, água e desenvolvimento humano, com identificação das dimensões que possuem dados. |
| **Evidências** | Achados publicados sobre cítricos e flavanonas, com desenho, população e limites próprios. O UK Biobank fica na página Alimentação. |
| **Projetos e bolsas** | Marie.AI PIPE II, auxílio anterior vinculado e cinco bolsas, com processos, títulos, vigências e fichas oficiais da FAPESP. |
| **Fontes e método** | Origem, definições, recortes, precisão e limitações dos indicadores. |

Os filtros por UF, faixa etária e coorte atuam nos recortes disponíveis. A PNS considera mulheres de **18 anos ou mais**. Os indicadores administrativos e contextuais preservam seu universo: por exemplo, o total de óbitos inclui todas as idades e o IDHM não é filtrado pela idade da entrevistada. Filtros brasileiros não recalculam os resultados publicados do UK Biobank ou os registros de fomento.

Nos gráficos, selecione estados, características ou grupos para explorar as relações. O mapa de calor mostra proporções dentro de cada grupo; a intensidade da cor não representa gravidade. A exportação registra o recorte e as informações disponíveis. A pauta de gestão é armazenada no navegador utilizado.

## Fontes, períodos e unidades

| Fonte integrada | Referência | Unidade e significado |
|---|---|---|
| [PNS — IBGE](https://www.ibge.gov.br/estatisticas/sociais/saude/9160-pesquisa-nacional-de-saude.html) | **2019** | Mulheres adultas entrevistadas; percentuais, totais ponderados e IC95% calculados pelo projeto. |
| [Censo — SIDRA 6803](https://sidra.ibge.gov.br/tabela/6803) | **2022** | Domicílios particulares permanentes ocupados com rede geral como principal abastecimento de água. |
| [Painel IDHM — PNUD/FJP](https://www.undp.org/pt/brazil/desenvolvimento-humano/painel-idhm) | **2019 e 2021** | IDHM e IDHM Educação da planilha de referência de julho de 2023; índices estaduais e nacional, de 0 a 1. |
| [SIM — DATASUS](https://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/obt10uf.def) | **2024** | Número de óbitos femininos com C56 como causa básica, por UF de residência; todas as idades. |
| [INCA — estimativa por UF](https://www.gov.br/inca/pt-br/assuntos/cancer/numeros/estimativa/estado-capital/brasil/por-estado/por-estado/) | **2026** | Casos novos anuais estimados de câncer de ovário; todas as idades. A referência nacional abrange cada ano do triênio 2026–2028. |
| [Chang et al. — UK Biobank](https://pmc.ncbi.nlm.nih.gov/articles/PMC9985039/) | Dieta em **2009–2012**; publicação em **2023** | Associação prospectiva publicada entre ultraprocessados e incidência/mortalidade por ovário; razões de riscos instantâneos, HR, com IC95%. |
| [Biblioteca Virtual da FAPESP](https://bv.fapesp.br/pt/auxilios/119846/marieai-plataforma-multimodal-de-saude-da-mulher/) | Vigência própria de cada processo; conferência em **18/10/2026** | Dois auxílios e cinco bolsas, com modalidade, beneficiário, vínculo e datas publicados. |

Essas referências não constituem uma série temporal única. A edição de IDHM incluída tem valores até 2021 e **não é apresentada como a edição mais recente**; os campos de 2019 permitem comparação com o ano da PNS. Data de download e ano do indicador são informações distintas.

### Dez indicadores da PNS e 55 pares

Os indicadores são: frutas em pelo menos cinco dias por semana; verduras e legumes em pelo menos cinco dias; feijão em pelo menos cinco dias; refrigerante em pelo menos cinco dias, **incluindo diet/zero**; cinco ou mais grupos de ultraprocessados no dia anterior; IMC ≥30 com peso e altura referidos; plano de saúde médico; rede geral como principal abastecimento; tratamento doméstico da água de beber; ensino superior completo.

O relato de diagnóstico de câncer de ovário é uma variável adicional. As combinações de duas variáveis distintas entre esses onze itens resultam em **55 pares**, calculados para a coorte de todas as mulheres adultas. Na versão `pns-ovarian-1.5`, os pontos reais também são apresentados em pequenas amostras, com avisos de resultado exploratório e inconclusivo. Sem respostas válidas para um par, não há estimativa.

### Água, educação e One Health

**Rede geral** identifica a principal forma de abastecimento. **Tratamento no domicílio** identifica água de beber filtrada, fervida, tratada com hipoclorito ou de outra forma em casa. Água mineral industrializada é uma categoria distinta e não integra o numerador de tratamento doméstico. Nenhuma dessas perguntas comprova potabilidade ou ausência de contaminantes.

Os indicadores de água da PNS representam mulheres adultas que residem em domicílios com a característica. O indicador do Censo representa **domicílios**, em outro ano. Eles não são intercambiáveis.

**Ensino superior completo** é uma característica individual da entrevistada. **IDHM Educação** é um índice territorial que combina dimensões de frequência escolar e escolaridade; não equivale ao percentual de mulheres com curso superior.

One Health orienta a leitura integrada de saúde humana, animais, plantas e ambiente, conforme a [OMS](https://www.who.int/health-topics/one-health). Nesta entrega, os dados cobrem saúde humana, alimentação e parte das condições domiciliares e sociais. Não há medição integrada de saúde animal, resíduos de agrotóxicos, contaminantes da água ou exposição ambiental individual.

## Como interpretar a precisão e o recorte de ovário

A PNS processada contém **46.869 mulheres adultas**, das quais **53** relataram diagnóstico médico de câncer de ovário. O relato inclui diagnóstico atual ou passado. A estimativa nacional é **0,1077%**, com IC95% de **0,0704% a 0,1646%**, calculada pelo projeto a partir dos pesos, estratos e conglomerados da pesquisa. A documentação da amostra está em [manifest.json](frontend/data/pns/manifest.json) e no [relatório de validação](docs/source_snapshots/pns/validation_report.txt).

Os intervalos devem acompanhar a leitura dos percentuais. Por solicitação da usuária, a política **exploratória da versão 1.5** mostra as estimativas e contagens agregadas reais também em pequenas amostras, células raras e alta variabilidade. Menos de 30 respostas válidas, numerador ou complemento abaixo de cinco, CV acima de 30% ou um resultado observado de 0%/100% acionam avisos de **inconclusivo**; CV acima de 15% até 30%, sem alerta mais forte, recebe **cautela**. São alertas internos do projeto, não regras oficiais do IBGE. As contagens das três coortes são preservadas; identificadores individuais não são publicados.

**Zero observado e ausência de dados são situações diferentes.** Com respostas válidas, zero eventos produz 0% e todos os eventos produzem 100%, sempre com aviso: nessas situações o IC Taylor-logit e o CV ficam `null`. Isso não demonstra ausência ou certeza populacional. Sem denominador válido, o percentual e o intervalo ficam `null`, com `quality="no_data"`. Ampliar o recorte pode melhorar a precisão; manter um número exploratório visível não aumenta a informação da amostra.

Nos cruzamentos individuais, a alimentação foi registrada na entrevista e pode ter mudado depois do diagnóstico. Nos cruzamentos territoriais, cada ponto representa uma UF, com universos e anos identificados nos eixos. Nenhuma dessas análises estabelece efeito causal, risco futuro, sobrevida ou letalidade.

A PNS permite relacionar frutas em geral com relato de ovário, mas **não isola o consumo de laranja ou de cítricos**. A página de evidências discute publicações científicas; seus resultados não são transformados em doses, suplementos recomendados ou pontuações de risco. Consulte [a metodologia completa](docs/METODOLOGIA.md) e [a documentação de cítricos](docs/evidencia_citricos.md).

## UK Biobank e a leitura integrada com o Brasil

O [estudo de Chang e colaboradores, publicado em 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC9985039/), analisou uma coorte britânica de **197.426 pessoas**, com **107.919 mulheres** nos modelos de câncer de ovário. Para cada aumento de **10 pontos percentuais da participação dos ultraprocessados no peso da dieta**, incluindo bebidas, o estudo publicou HR ajustado de **1,19 (IC95% 1,08–1,30)** para incidência, com **291 casos**, e de **1,30 (1,13–1,50)** para mortalidade, com **143 óbitos**. São associações observacionais; o HR não expressa uma probabilidade absoluta de câncer.

O painel preserva os **quatro quartis publicados** e identifica que os perfis médios de frutas, hortaliças, escolaridade e IMC da tabela inicial incluem mulheres e homens. Esses perfis não são exclusivos de mulheres nem de pessoas com câncer. O UK Biobank não representa toda a população europeia, e seus resultados não mudam com a seleção de uma UF brasileira.

A comparação com o Brasil é metodológica e descritiva. No UK Biobank, a exposição é percentual do peso da dieta e os desfechos ocorrem no seguimento; na PNS, o indicador conta grupos alimentares no dia anterior e o diagnóstico de ovário é autorreferido, atual ou passado. Não há ligação individual nem conversão entre essas exposições. O projeto não aplica o HR britânico para calcular casos brasileiros, risco individual ou um escore. Dados publicados e proveniência estão em [ukbiobank.json](frontend/data/ukbiobank.json) e [source_snapshots/ukbiobank](docs/source_snapshots/ukbiobank/).

## Projetos e bolsas FAPESP

O módulo apresenta **25/14126-3 — Marie.AI: Plataforma Multimodal de Saúde da Mulher**, com vigência de **01/04/2026 a 31/03/2028**, sob responsabilidade de **Paula Cristina dos Santos**. A identificação PIPE II é corroborada pelo resumo da [ficha oficial](https://bv.fapesp.br/pt/auxilios/119846/marieai-plataforma-multimodal-de-saude-da-mulher/). O auxílio anterior **23/13767-0** e cinco bolsas vinculadas aparecem com suas próprias modalidades e vigências, conforme [funding.json](frontend/data/funding.json) e a [conferência FAPESP](docs/FAPESP.md).

Os registros documentam fomento à pesquisa. Não constituem certificação clínica ou regulatória dos resultados do painel. Níveis específicos de bolsas TT que não aparecem nas fichas permanecem ausentes, e um resumo que mencione seleção futura não é utilizado para anunciar vaga aberta.

## Reproduzir e verificar os dados

Esta etapa é opcional e voltada à equipe técnica. Execute os comandos na raiz do projeto. As dependências abaixo correspondem às versões usadas no processamento com Python 3.12:

```bash
python3 -m pip install --user --break-system-packages -r requirements-data.txt
```

### PNS 2019

O comando utiliza o dicionário oficial incluído, baixa o ZIP público de microdados se ainda não existir e atualiza os agregados:

```bash
python3 scripts/build_pns2019.py --source-dir data_raw/pns2019 --dictionary docs/source_snapshots/pns/dicionario_PNS_microdados_2019.xls --out-dir frontend/data/pns
```

Para reutilizar um ZIP já baixado, sem nova consulta:

```bash
python3 scripts/build_pns2019.py --raw-zip data_raw/pns2019/PNS_2019_20220525.zip --dictionary docs/source_snapshots/pns/dicionario_PNS_microdados_2019.xls --out-dir frontend/data/pns
```

O ZIP de entrada tem aproximadamente 29,5 MB; contém um TXT de aproximadamente 455 MB, lido em fluxo pelo script. Os microdados permanecem fora do pacote publicado. O manifesto gerado informa URL, hash, desenho, definições e regras de divulgação.

### SIM e INCA

Reprocessar as tabelas oficiais já retidas e atualizar `frontend/data/admin.json`:

```bash
python3 scripts/rebuild_admin.py
```

Consultar novamente as mesmas tabelas públicas:

```bash
python3 scripts/rebuild_admin.py --refresh
```

`--refresh` não muda automaticamente os anos de referência. O extrator verifica o escopo esperado e interrompe a geração se os dados não corresponderem às condições programadas.

### Contexto: Censo e IDHM

Conferir os dados do frontend contra as fontes retidas:

```bash
python3 scripts/build_context.py --check frontend/data/context.json
```

Gerar uma cópia em outra pasta para revisão:

```bash
python3 scripts/build_context.py --output build/context.json
```

SIM/INCA e contexto utilizam a biblioteca padrão do Python. `evidence.json` e `ukbiobank.json` são curadoria de publicações e tabelas, com fontes preservadas; não são gerados a partir das entrevistadas brasileiras. `funding.json` reproduz registros oficiais da FAPESP. Atualizações desses materiais exigem conferir a publicação ou ficha original e sua proveniência.

### Contrato do frontend

Com Node.js instalado, as verificações de agregados, do adaptador e dos fluxos da aplicação podem ser executadas sem navegador ou rede:

```bash
node scripts/validate_frontend_data.cjs
node scripts/validate_app_interactions.cjs
```

Os scripts Python oferecem ajuda própria:

```bash
python3 scripts/build_pns2019.py --help
python3 scripts/rebuild_admin.py --help
python3 scripts/build_context.py --help
```

Essas verificações avaliam dados, cálculos, contrato de integração e lógica das interações. O projeto também foi executado com AppTest do Streamlit 1.66.0. Esses procedimentos não equivalem a validação clínica nem a validação visual em um navegador.

## Arquivos principais

| Caminho | Finalidade |
|---|---|
| `app.py` | Entrada do Streamlit e carregamento do componente. |
| `requirements.txt` | Dependência da aplicação. |
| `requirements-data.txt` | Dependências opcionais do processamento PNS. |
| `frontend/` | Interface, estilos, mapa, ponte Streamlit e adaptador de dados. |
| `frontend/data/pns/` | Manifesto, resumo e agregados por UF. |
| `frontend/data/admin.json` | SIM e INCA, com proveniência e limites. |
| `frontend/data/context.json` | Água do Censo e índices de desenvolvimento humano. |
| `frontend/data/evidence.json` | Achados científicos e disponibilidade das bases. |
| `frontend/data/ukbiobank.json` | Resultados publicados, quartis e limites da comparação com a PNS. |
| `frontend/data/risk-factors.json` | Catálogo específico para ovário, evidência e disponibilidade das características no extrato. |
| `frontend/data/funding.json` | Dois auxílios e cinco bolsas FAPESP, com fichas oficiais e vigências. |
| `scripts/` | Reprodução e verificações. |
| `docs/METODOLOGIA.md` | Definições, cálculo e interpretação. |
| `docs/FAPESP.md` | Conferência dos registros de fomento e diferenças relevantes entre as fichas. |
| `docs/FATORES_DE_RISCO.md` | Adaptação da tabela enviada e fundamentação específica para ovário. |
| `docs/source_snapshots/ADAPTER.md` | Contrato de integração e tratamento de dados ausentes/qualidade na versão 1.5. |
| `docs/source_snapshots/` | Fontes retidas, dicionários, parâmetros de consulta e hashes. |

Se aparecer a mensagem de dados não encontrados, confira se o repositório ou a pasta extraída contém todos os arquivos de `frontend/data/`. Em recortes pequenos, consulte o denominador, o numerador e a indicação de qualidade, mesmo quando há um percentual visível. Um campo sem estimativa deve permanecer vazio; não o preencha com zero nem com o resultado de outra população.

## Atualização 18/10/2026 — identidade Marie, rolagem e idioma inglês

A interface agora possui seletor **PT | EN** no cabeçalho. As cores seguem o logotipo da Marie (vinho, rosa, verde sálvia e marfim). O componente informa ao Streamlit a altura real do conteúdo, em vez de limitar o `iframe` à altura de uma única janela, permitindo rolar a página principal; o menu lateral também possui rolagem independente em telas menores.

Os arquivos `frontend/i18n-en.js`, `frontend/i18n-en-extra.js` e `frontend/i18n-en-data.js` documentam as traduções de interface e a terminologia científica. Os dados de origem não foram alterados. Para uma explicação em inglês e restrições de interpretação, consulte `docs/ENGLISH_VERSION.md`. Antes de publicar, testar visualmente o aplicativo no navegador e solicitar revisão clínica/editorial de todo conteúdo exibido.
