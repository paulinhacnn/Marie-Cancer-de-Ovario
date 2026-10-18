"""Marie Câncer de Ovário: o mesmo dashboard HTML, servido como componente Streamlit.

Os indicadores vêm dos agregados reais incluídos em frontend/data/. O app não
gera dados artificiais e não baixa microdados durante o uso pelo gestor.
"""

from pathlib import Path
import json

import streamlit as st
import streamlit.components.v1 as components

ROOT = Path(__file__).resolve().parent
FRONTEND = ROOT / "frontend"

st.set_page_config(
    page_title="Marie Câncer de Ovário | Gestão em saúde",
    page_icon=str(FRONTEND / "assets" / "marie-logo.jpeg"),
    layout="wide",
    initial_sidebar_state="collapsed",
)

# O componente publica sua altura real ao Streamlit, liberando a rolagem da
# página hospedeira. HTML, CSS, JS e dados integram o próprio projeto.
st.markdown(
    """
    <style>
    html, body, [data-testid="stApp"], .stApp {background:#fbf7f4;}
    [data-testid="stHeader"], [data-testid="stToolbar"], footer,
    [data-testid="stSidebar"], [data-testid="stDecoration"] {display:none;}
    [data-testid="stMainBlockContainer"], .block-container {
      max-width:100%; padding:0; margin:0;
    }
    [data-testid="stMain"] {overflow-y:auto !important; overflow-x:hidden;}
    [data-testid="stAppViewContainer"] {overflow-y:auto !important;}
    [data-testid="stVerticalBlock"] {gap:0;}
    [data-testid="stCustomComponentV1"] iframe,
    iframe[title*="marie"] {
      display:block; width:100%; border:0;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

manifest_path = FRONTEND / "data" / "pns" / "manifest.json"
if not manifest_path.is_file():
    st.error("Os dados reais não foram encontrados. Suba a pasta frontend/data junto com app.py.")
    st.stop()

with manifest_path.open(encoding="utf-8") as handle:
    manifest = json.load(handle)

dashboard = components.declare_component("marie_ovario", path=str(FRONTEND))
dashboard(
    dataset_version=manifest.get("schemaVersion", "pns2019-real-v1"),
    title="Marie Câncer de Ovário",
    default=None,
    key="marie_ovario_dashboard",
)
