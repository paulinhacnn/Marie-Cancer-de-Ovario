<div align="center">
  <img src="frontend/assets/marie-logo.jpeg" alt="Marie Câncer de Ovário · identidade visual do projeto" width="330" />

  <h1>Marie · Câncer de Ovário</h1>

  <p><strong>Inteligência em saúde da mulher orientada por dados, território e evidência científica.</strong></p>
  <p><em>Women's health intelligence grounded in data, population context and scientific evidence.</em></p>

  <a href="#portugues">🇧🇷 Português</a> · <a href="#english">🇬🇧 English</a> · <a href="docs/GITHUB_STREAMLIT_DEPLOY.md">🚀 Publicação / Deployment</a>

  <p>
    <img alt="Python 3.12" src="https://img.shields.io/badge/Python-3.12-62304C?style=flat-square&logo=python&logoColor=white" />
    <img alt="Streamlit" src="https://img.shields.io/badge/Streamlit-1.66.0-A83D70?style=flat-square&logo=streamlit&logoColor=white" />
    <img alt="Português e inglês" src="https://img.shields.io/badge/Interface-PT%20%2F%20EN-53957C?style=flat-square" />
    <img alt="Evidência científica" src="https://img.shields.io/badge/Abordagem-Evid%C3%AAncia%20primeiro-704056?style=flat-square" />
  </p>
</div>

---

<!-- Depois do primeiro deploy, substitua esta linha pelo link real do aplicativo. -->
> **🌐 Aplicação pública / Live app:** link a inserir após a publicação no Streamlit Community Cloud.  
> **🔬 Pesquisa / Research:** [Marie.AI — projeto PIPE Fase 2 na Biblioteca Virtual da FAPESP](https://bv.fapesp.br/pt/auxilios/119846/marieai-plataforma-multimodal-de-saude-da-mulher/)

<a id="portugues"></a>
## 🇧🇷 Português

### Para compreender melhor. Para decidir com mais responsabilidade.

A **Marie Câncer de Ovário** é um observatório interativo para explorar perfis populacionais, alimentação, determinantes sociais e indicadores de atenção oncológica. A plataforma organiza **dados brasileiros agregados e literatura científica publicada** com transparência sobre fonte, período, população, intervalo de confiança e limitações metodológicas.

A proposta é apoiar perguntas de pesquisa e planejamento em saúde, **não calcular o risco individual de câncer, estabelecer diagnósticos nem substituir avaliação clínica**.

### O que você encontra na plataforma

| Área | Recursos |
|:--|:--|
| 🗺️ **População e território** | Brasil e 27 UFs; filtros e estratificações de mulheres adultas. |
| 🥗 **Alimentação** | Indicadores da PNS 2019, análises exploratórias e comparação contextual com resultados publicados do UK Biobank. |
| 🧬 **Fatores de risco** | Evidências e fatores de contexto, com indicação do que é ou não medido pelas bases disponíveis. |
| 📊 **Cruzamentos e gráficos** | Relações descritivas, dispersão, mapas e tabelas com tamanho amostral e incerteza. |
| 🎗️ **Atenção oncológica** | Óbitos observados do SIM e casos novos anuais estimados pelo INCA, identificados separadamente. |
| 🍊 **Cítricos e flavanonas** | Tabela de HR/OR, IC95%, classificação visual e observações científicas sobre resultados protetivos, neutros/inconclusivos e de risco. |
| 🌱 **One Health** | Leitura integrada de saúde, alimentação, água e contexto socioambiental, sem atribuir causalidade. |
| 🔎 **Ciência e pesquisa** | Fontes, métodos, projeto Marie.AI PIPE Fase 2 e cinco bolsas vinculadas. |

### Evidência primeiro

<table>
  <tr>
    <td width="33%"><strong>🟢 Sinal protetivo</strong><br/>Medida relativa e IC95% inteiramente abaixo de 1.</td>
    <td width="34%"><strong>🟠 Neutro / inconclusivo</strong><br/>O IC95% inclui 1 ou não há direção clara.</td>
    <td width="33%"><strong>🔴 Sinal de risco</strong><br/>Medida relativa e IC95% inteiramente acima de 1.</td>
  </tr>
</table>

A classificação descreve **associações dos estudos publicados**, não proteção ou causalidade comprovada. Em particular, a análise específica de **laranja e suco de laranja** em Cassidy et al. (2014) não apresentou associação estatisticamente significativa com câncer de ovário. Resultados sobre flavanonas não devem ser atribuídos automaticamente a esses alimentos.

### Dados e fontes de referência

| Fonte | Ano / publicação | Unidade de análise |
|:--|:--|:--|
| [PNS / IBGE](https://www.ibge.gov.br/estatisticas/sociais/saude/9160-pesquisa-nacional-de-saude.html) | 2019 | Mulheres adultas; estimativas ponderadas, n e IC95%. |
| [SIM / DATASUS](https://datasus.saude.gov.br/mortalidade-desde-1996-pela-cid-10/) | 2024 | Óbitos observados por câncer de ovário (C56). |
| [INCA](https://www.gov.br/inca/pt-br/assuntos/cancer/numeros/estimativa/estado-capital/brasil/por-estado/por-estado/) | 2026 | Casos novos **estimados** por ano; não registros observados. |
| [UK Biobank — Chang et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC9985039/) | 2023 | Associações publicadas de coorte; não são microdados individuais do projeto. |
| [IBGE / Censo](https://sidra.ibge.gov.br/tabela/6803) e [PNUD / IDHM](https://www.undp.org/pt/brazil/desenvolvimento-humano/painel-idhm) | 2022 / 2019 e 2021 | Indicadores de contexto territorial, sem vínculo pessoa a pessoa. |
| [FAPESP](https://bv.fapesp.br/pt/auxilios/119846/marieai-plataforma-multimodal-de-saude-da-mulher/) | Vigência do projeto | Informações institucionais sobre o auxílio PIPE Fase 2 e projetos vinculados. |

**Nota metodológica:** as bases não foram vinculadas por identificadores pessoais. Os dados agregados do Reino Unido contextualizam hipóteses e não constituem um modelo de risco recalibrado para o Brasil. Recortes com amostras pequenas são exploratórios e identificados como inconclusivos.

### Executar / publicar

Este repositório já está organizado para que `app.py` e `requirements.txt` fiquem **na raiz**. O deploy **não requer chave de API** e os dados agregados necessários acompanham o projeto.

```bash
python3 -m pip install -r requirements.txt
python3 -m streamlit run app.py
```

> Em sistemas Linux que bloqueiam instalações globais de pacotes, siga as orientações em [`docs/README_TECNICO_ORIGINAL.md`](docs/README_TECNICO_ORIGINAL.md) ou use um ambiente isolado. **Não** execute instalação com `sudo`.

**Publicar:** GitHub → [Streamlit Community Cloud](https://share.streamlit.io) → criar aplicativo a partir do repositório → branch `main` → caminho principal `app.py` → Python 3.12 → Deploy.

➡️ **[Guia completo de publicação GitHub + Streamlit](docs/GITHUB_STREAMLIT_DEPLOY.md)**

<a id="english"></a>
## 🇬🇧 English

### Understand the population. Interpret evidence. Support informed decisions.

**Marie Ovarian Cancer** is an interactive women's-health observatory that brings together population profiles, dietary indicators, socioeconomic context, and ovarian cancer care measures. It distinguishes **observed data from estimates**, reports denominators and uncertainty, and provides traceable scientific references.

The platform supports exploratory research and public-health planning. It **does not diagnose ovarian cancer, predict an individual's risk, or replace medical advice**.

### Explore the observatory

| Section | What it offers |
|:--|:--|
| 🗺️ **Population & geography** | Brazil and its 27 federative units; adult women's population profiles. |
| 🥗 **Nutrition** | Brazil's 2019 National Health Survey and published UK Biobank findings, with distinct populations and definitions. |
| 🧬 **Risk factors** | Evidence strength, direction of association and data availability. |
| 📊 **Interactive analysis** | Scatter plots, tables, maps and cross-tabulations with transparent uncertainty. |
| 🎗️ **Ovarian cancer care** | Recorded mortality and estimated new cases presented as different measures. |
| 🍊 **Citrus & flavanones** | Published HR/OR values, 95% confidence intervals, colored classifications and study-specific caveats. |
| 🌱 **One Health** | An integrative population-health perspective with clearly identified data gaps. |
| 🔎 **Research & sources** | Methods, references, research support and FAPESP PIPE Phase 2 context. |

### Interpreting the evidence

A **protective association** is shown only when the reported relative estimate and its entire 95% confidence interval are below 1. A **risk association** requires the estimate and its entire interval to be above 1. All other results are labeled **neutral / inconclusive** in this visualization. These terms describe reported associations, **not demonstrated causality**.

In Cassidy et al. (2014), the separate analyses of **oranges and orange juice** did not show statistically significant associations with ovarian cancer. Findings on dietary flavanones cannot automatically be interpreted as preventive effects of these specific foods.

### Getting started

The Streamlit entrypoint is **`app.py` at the repository root**. Bundled aggregate datasets are in `frontend/data/`; no API key is required to run the published dashboard.

```bash
python3 -m pip install -r requirements.txt
python3 -m streamlit run app.py
```

For public deployment, open [Streamlit Community Cloud](https://share.streamlit.io), select the GitHub repository and branch, and choose **`app.py`** with **Python 3.12**. See the [deployment guide](docs/GITHUB_STREAMLIT_DEPLOY.md).

The original documents and source notes are available under [`docs/`](docs/). UK Biobank statistics displayed here are extracted from published study tables, not individual-level datasets.

---

### Estrutura do repositório · Repository structure

```text
Marie-Cancer-de-Ovario/
├── app.py                   # Streamlit entrypoint
├── requirements.txt         # Runtime dependencies
├── .streamlit/config.toml   # Brand colors / theme
├── frontend/
│   ├── assets/              # Marie and FAPESP brand assets
│   ├── data/                # Published/processed aggregate data
│   ├── app.js               # Dashboard interactions
│   ├── styles.css           # Base styles
│   ├── marie-theme.css      # Marie visual identity
│   └── i18n-en*.js          # English translations
├── docs/                    # Methods, scientific notes, deployment
├── scripts/                 # Rebuild and source validation
└── .github/workflows/       # Non-clinical automated checks
```

<sub>**Aviso / Disclaimer:** Plataforma informativa e de pesquisa. Não é ferramenta diagnóstica, diretriz clínica ou recomendação alimentar individual. / Informational and research platform; not a diagnostic tool, clinical guideline, or personalized dietary recommendation.</sub>
