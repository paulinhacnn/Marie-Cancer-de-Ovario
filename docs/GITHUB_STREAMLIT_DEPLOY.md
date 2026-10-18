# Publicar a Marie no GitHub e no Streamlit

> **Objetivo:** publicar o projeto **sem alterar os dados científicos ou o código do painel**.

## 1. Criar o repositório

1. Entre em <https://github.com/new>.
2. Nome sugerido: `Marie-Cancer-de-Ovario`.
3. Escolha a visibilidade do repositório conscientemente: um repositório **público expõe o código e os arquivos enviados**. Confira a ausência de informações confidenciais antes de publicar.
4. Se você enviar os arquivos pelo navegador, não inicialize o repositório com outro README; este ZIP já traz o README pronto.

## 2. Enviar os arquivos

**Extraia o ZIP deste projeto** e envie **os arquivos e pastas que estão dentro dele**, em vez do ZIP. Na raiz do GitHub devem aparecer:

```text
app.py
requirements.txt
README.md
.streamlit/
frontend/
docs/
scripts/
.github/
```

> O arquivo principal no Streamlit será `app.py`, **não** `Marie_Cancer_de_Ovario_Streamlit/app.py`, porque nesta versão a pasta extra foi eliminada.

Opcionalmente, pelo terminal, na pasta extraída:

```bash
git init
git add .
git commit -m "Initial release: Marie ovarian cancer observatory"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/Marie-Cancer-de-Ovario.git
git push -u origin main
```

Substitua `SEU_USUARIO` pela conta correta. O repositório precisa estar criado antes desse comando.

## 3. Conectar ao Streamlit Community Cloud

1. Acesse <https://share.streamlit.io/> e autentique-se com o GitHub.
2. Use a opção de criar app a partir de repositório do GitHub.
3. Configure:
   - **Repository:** `SEU_USUARIO/Marie-Cancer-de-Ovario`
   - **Branch:** `main`
   - **Main file path:** `app.py`
   - **Python:** `3.12` (nas configurações avançadas, se disponível)
4. Clique em **Deploy** e aguarde a instalação a partir de `requirements.txt`.
5. Confirme a abertura, a rolagem, a troca **PT/EN**, o mapa, as tabelas e as fontes da página "Evidências".

## 4. Adicionar o link público ao README

Depois que o Streamlit fornecer seu endereço `https://...streamlit.app`, edite o começo do `README.md`:

```md
[🌐 Abrir observatório / Open live app](https://marie-cancer-de-ovario-fapesp.streamlit.app/)
```

O texto `SEU-ENDERECO-REAL` é **um exemplo**: não publique esse endereço até substituí-lo pelo URL fornecido pelo Streamlit.

## 5. Boas práticas para projetos de saúde

- Não publique microdados pessoais, prontuários, nomes de pacientes, senhas, tokens ou `.streamlit/secrets.toml`.
- Mantenha as indicações de fonte e período nos resultados; dados de mortalidade observada e incidência estimada respondem a perguntas distintas.
- Preserve avisos para amostras pequenas e para análises observacionais de alimentação. Laranja e suco de laranja não devem ser descritos como prevenção comprovada.
- Atualizações no GitHub podem acionar uma nova implantação. Teste antes de anunciar a nova versão.

## Troubleshooting

**`ModuleNotFoundError: streamlit`:** confira se `requirements.txt` está na raiz.

**Erro de arquivo ausente:** confira as pastas `frontend/data/pns/uf/` e `frontend/assets/`. Não envie apenas `app.py`.

**Tela branca ou tradução incompleta:** confira os arquivos `frontend/app.js`, `frontend/i18n-en*.js` e o console do navegador.

**Rolagem bloqueada:** confira `frontend/streamlit-bridge.js` e substitua o pacote completo, não apenas o CSS.

## English quick start

Extract the ZIP and upload **its contents** to a GitHub repository. The Streamlit main-file path is **`app.py`** (repository root). Configure Python 3.12, deploy from your chosen branch, and verify the language switch and scientific evidence pages. Never publish protected health data or secrets.
