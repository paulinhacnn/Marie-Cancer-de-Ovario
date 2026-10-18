#!/usr/bin/env python3
"""Build reproducible, aggregated PNS 2019 ovarian-cancer dashboard data.

No microdata or residential/person identifiers are exported. The complete selected
respondent design is retained in memory for domain Taylor variance estimation.
Exploratory disclosure retains real small-sample counts and point estimates with
explicit uncertainty flags; it does not manufacture confidence at 0% or 100%.
Install: python -m pip install numpy pandas scipy xlrd
Run: python build_pns2019.py --out-dir data/pns
Official source ZIPs are downloaded only if absent from --source-dir.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import itertools
import json
import math
import pathlib
import sys
import time
import urllib.request
import zipfile
from datetime import datetime, timezone

import numpy as np
import pandas as pd
from scipy.special import expit, logit
from scipy.stats import t as student_t

DATA_URL = "https://ftp.ibge.gov.br/PNS/2019/Microdados/Dados/PNS_2019_20220525.zip"
DICT_URL = "https://ftp.ibge.gov.br/PNS/2019/Microdados/Documentacao/Dicionario_e_input_20220530.zip"
QUESTIONNAIRE_URL = "https://biblioteca.ibge.gov.br/visualizacao/instrumentos_de_coleta/doc5569.pdf"
PUBLICATION_URL = "https://biblioteca.ibge.gov.br/visualizacao/livros/liv101764.pdf"
KEYS_URL = "https://ftp.ibge.gov.br/PNS/2019/Microdados/Documentacao/Chaves_PNS_2019.pdf"

UF = {11: "RO", 12: "AC", 13: "AM", 14: "RR", 15: "PA", 16: "AP", 17: "TO",
      21: "MA", 22: "PI", 23: "CE", 24: "RN", 25: "PB", 26: "PE", 27: "AL", 28: "SE", 29: "BA",
      31: "MG", 32: "ES", 33: "RJ", 35: "SP", 41: "PR", 42: "SC", 43: "RS",
      50: "MS", 51: "MT", 52: "GO", 53: "DF"}
AGE_BANDS = [("18-29", 18, 29), ("30-39", 30, 39), ("40-49", 40, 49),
             ("50-59", 50, 59), ("60-69", 60, 69), ("70-79", 70, 79), ("80+", 80, 130)]
METRICS = {
    "fruit": {"label": "Frutas em pelo menos 5 dias por semana", "variables": ["P018"],
              "rule": "P018 entre 5 e 7; denominador P018 entre 0 e 7.", "unit": "%"},
    "vegetables": {"label": "Verduras e legumes em pelo menos 5 dias por semana", "variables": ["P00901"],
                   "rule": "P00901 entre 5 e 7; denominador P00901 entre 0 e 7.", "unit": "%"},
    "beans": {"label": "Feijão em pelo menos 5 dias por semana", "variables": ["P006"],
              "rule": "P006 entre 5 e 7; denominador P006 entre 0 e 7.", "unit": "%"},
    "sugary": {"label": "Refrigerante em pelo menos 5 dias por semana (inclui diet/zero)", "variables": ["P02002"],
               "rule": "P02002 entre 5 e 7; denominador P02002 entre 0 e 7. Não identifica só bebidas açucaradas.", "unit": "%"},
    "ultra": {"label": "5 ou mais grupos de ultraprocessados no dia anterior", "variables": [f"P006{i}" for i in range(14, 24)],
              "rule": "Soma de respostas 1 em P00614–P00623 >=5; exige resposta 1 ou 2 nos dez itens.", "unit": "%"},
    "obesity": {"label": "IMC ≥30 com peso e altura referidos", "variables": ["P00104", "P00404", "P00405", "P005"],
                "rule": "P00104/(P00404/100)^2 >=30; peso/altura finais referidos, inclusive imputações do IBGE. Exclui gestantes e gravidez desconhecida. Não utiliza antropometria aferida W.", "unit": "%"},
    "healthPlan": {"label": "Possui plano de saúde médico", "variables": ["I00102"],
                   "rule": "I00102=1; denominador I00102 em {1,2}.", "unit": "%"},
    "networkWater": {"label": "Rede geral como principal abastecimento de água", "variables": ["A005010"],
                     "rule": "A005010=1; denominador A005010 entre 1 e 6. Característica do domicílio das mulheres adultas selecionadas; não comprova tratamento ou potabilidade.", "unit": "%"},
    "treatedWater": {"label": "Tratamento da água de beber no domicílio", "variables": ["A009010"],
                     "rule": "A009010 entre 1 e 4: filtrada, fervida, tratada com hipoclorito ou de outra forma no domicílio. Denominador A009010 entre 1 e 6. Respostas 5 (mineral industrializada) e 6 (sem tratamento no domicílio) ficam fora do numerador; não significam necessariamente água imprópria. Não mede potabilidade laboratorial.", "unit": "%"},
    "higherEducation": {"label": "Ensino superior completo", "variables": ["VDD004A"],
                        "rule": "VDD004A=7; denominador VDD004A entre 1 e 7. Superior incompleto (6) não integra o numerador; respostas ausentes não são classificadas como não.", "unit": "%"},
}
OVARIAN_DEF = {"label": "Relato de diagnóstico médico de câncer de ovário", "variables": ["Q120", "Q121014"],
               "rule": "1 se Q120=1 e Q121014=1; 0 se Q120=2 ou (Q120=1 e Q121014=2); demais situações desconhecidas. Relato atual ou passado, multirresposta.", "unit": "%"}
ALL_FIELDS = ["V0015", "V0001", "V0024", "UPA_PNS", "M001", "C006", "C008", "C009", "V0026", "V0031",
              "V00291", "V00301", "VDF003", "VDF004", "VDD004A", "I00102", "Q120", "Q121014", "A005010", "A009010",
              "P018", "P00901", "P006", "P02002", "P00103", "P00104", "P00403", "P00404", "P00405", "P005",
              "P034", "P035", "P036", "P03701", "P03702", "P01601", "P00610", "P00611"] + [f"P006{i}" for i in range(14, 24)]
GROUP_LABELS = {
    "age": {i + 1: b[0] for i, b in enumerate(AGE_BANDS)},
    "education": {1: "Sem instrução", 2: "Fundamental incompleto", 3: "Fundamental completo", 4: "Médio incompleto",
                  5: "Médio completo", 6: "Superior incompleto", 7: "Superior completo", 0: "Sem informação"},
    "income": {1: "Até ¼ salário mínimo", 2: "Mais de ¼ até ½ SM", 3: "Mais de ½ até 1 SM", 4: "Mais de 1 até 2 SM",
               5: "Mais de 2 até 3 SM", 6: "Mais de 3 até 5 SM", 7: "Mais de 5 SM", 0: "Sem informação"},
    "race": {1: "Branca", 2: "Preta", 3: "Amarela", 4: "Parda", 5: "Indígena", 0: "Sem informação"},
}
INCONCLUSIVE_REASONS = {"small_sample", "rare_cell", "high_cv", "boundary", "no_variance", "empty_conditional_domain"}


def quality_from_reasons(reasons):
    if any(reason in INCONCLUSIVE_REASONS for reason in reasons):
        return "inconclusive"
    return "caution" if "moderate_cv" in reasons else "ok"


def sha256(path):
    h = hashlib.sha256()
    with pathlib.Path(path).open("rb") as f:
        while block := f.read(1024 * 1024):
            h.update(block)
    return h.hexdigest()


def download(url, destination):
    destination = pathlib.Path(destination)
    if destination.exists():
        return destination
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(destination.suffix + ".part")
    print(f"Downloading {url}", flush=True)
    with urllib.request.urlopen(url, timeout=90) as source, temporary.open("wb") as target:
        while block := source.read(1024 * 1024):
            target.write(block)
    temporary.replace(destination)
    return destination


def load_layout(dictionary):
    dictionary = pathlib.Path(dictionary)
    if dictionary.suffix.lower() == ".zip":
        with zipfile.ZipFile(dictionary) as archive:
            raw = archive.read("dicionario_PNS_microdados_2019.xls")
    else:
        raw = dictionary.read_bytes()
    table = pd.read_excel(io.BytesIO(raw), header=None, dtype=object).fillna("")
    spans = {}
    for _, row in table.iterrows():
        name = str(row[2]).strip()
        if name in ALL_FIELDS:
            spans[name] = (int(row[0]) - 1, int(row[1]))
    missing = set(ALL_FIELDS) - spans.keys()
    if missing:
        raise ValueError(f"Missing variables in official dictionary: {sorted(missing)}")
    return spans, hashlib.sha256(raw).hexdigest()


def read_selected(source, spans):
    rows = []
    raw_count = 0
    weight_blank_selected = 0
    with zipfile.ZipFile(source) as archive:
        candidates = [n for n in archive.namelist() if n.lower().endswith(".txt")]
        if len(candidates) != 1:
            raise ValueError("Expected one official fixed-width TXT")
        member = candidates[0]
        uncompressed_bytes = archive.getinfo(member).file_size
        with archive.open(member) as stream:
            for line in stream:
                raw_count += 1
                m_start, m_width = spans["M001"]
                if line[m_start:m_start + m_width].strip() != b"1":
                    continue
                values = []
                for field in ALL_FIELDS:
                    start, width = spans[field]
                    value = line[start:start + width].strip()
                    values.append(float(value) if value else np.nan)
                if not np.isfinite(values[ALL_FIELDS.index("V00291")]) or values[ALL_FIELDS.index("V00291")] <= 0:
                    weight_blank_selected += 1
                    continue
                rows.append(values)
    frame = pd.DataFrame(rows, columns=ALL_FIELDS)
    if not (frame["V0015"] == 1).all():
        raise ValueError("Selected-respondent interview found outside completed household interviews")
    return frame, {"raw_records": raw_count, "selected_interviews_with_valid_weight": len(frame),
                   "selected_interviews_excluded_invalid_weight": weight_blank_selected,
                   "zip_member": member, "uncompressed_bytes": uncompressed_bytes}


class TaylorDesign:
    """Stratified with-replacement first-stage Taylor linearization.

    Every selected respondent's PSU is retained, including PSUs containing zero
    members of an analysis domain. No simple-random-sample or Kish CI is used.
    """
    def __init__(self, frame):
        self.w = frame["V00291"].to_numpy(float)
        keys = list(zip(frame["V0024"].astype(np.int64), frame["UPA_PNS"].astype(np.int64)))
        self.psu, levels = pd.factorize(pd.MultiIndex.from_tuples(keys), sort=True)
        strata_at_psu = np.asarray([item[0] for item in levels], dtype=np.int64)
        self.stratum, stratum_levels = pd.factorize(strata_at_psu, sort=True)
        self.n_psu = len(levels)
        self.n_strata = len(stratum_levels)
        self.m = np.bincount(self.stratum, minlength=self.n_strata).astype(float)
        self.lonely = int((self.m < 2).sum())
        if self.lonely:
            raise ValueError(f"{self.lonely} singleton design strata; explicit survey treatment needed, refusing fabricated CI")
        self.df = self.n_psu - self.n_strata
        self.critical = float(student_t.ppf(.975, self.df))
        self.variance_calls = 0

    def variance_from_psu(self, u):
        totals = np.bincount(self.stratum, weights=u, minlength=self.n_strata)
        squares = np.bincount(self.stratum, weights=u * u, minlength=self.n_strata)
        ss = np.maximum(squares - totals * totals / self.m, 0.0)
        self.variance_calls += 1
        return float(np.sum(self.m / (self.m - 1.0) * ss))

    def variance(self, indices, linearized):
        u = np.bincount(self.psu[indices], weights=linearized, minlength=self.n_psu)
        return self.variance_from_psu(u)

    def population(self, indices):
        n = len(indices)
        if n == 0:
            return {"women": None, "womenLow": None, "womenHigh": None, "n": 0,
                    "quality": "no_data", "qualityReasons": ["no_valid_responses"], "cv": None}
        total = float(self.w[indices].sum())
        se = math.sqrt(self.variance(indices, self.w[indices]))
        cv = se / total if total > 0 and se > 0 and np.isfinite(se) else None
        reasons = ["small_sample"] if n < 30 else []
        if n < 5:
            reasons.append("rare_cell")
        if cv is None:
            reasons.append("no_variance")
        elif cv > .30:
            reasons.append("high_cv")
        elif cv > .15:
            reasons.append("moderate_cv")
        if se > 0 and np.isfinite(se):
            low = round(max(0, total - self.critical * se), 2)
            high = round(total + self.critical * se, 2)
        else:
            low = high = None
        return {"women": round(total, 2), "womenLow": low, "womenHigh": high, "n": int(n),
                "quality": quality_from_reasons(reasons), "qualityReasons": reasons,
                "cv": round(cv, 5) if cv is not None else None}

    def rate(self, indices, values):
        local = values[indices]
        valid = np.isfinite(local)
        ii = indices[valid]
        yy = local[valid]
        n = len(ii)
        events = int(np.sum(yy == 1))
        missing = len(indices) - n
        out = {"pct": None, "low": None, "high": None,
               "nValid": int(n), "nEvent": int(events), "missing": int(missing),
               "cv": None, "quality": "no_data", "qualityReasons": ["no_valid_responses"]}
        if n == 0:
            return out
        if not np.isin(yy, [0, 1]).all():
            raise ValueError("A proportion requires binary known responses")
        denominator = float(self.w[ii].sum())
        # Boundaries are defined by the observed counts, avoiding floating-point
        # artifacts when a constant outcome has slightly different sum order.
        boundary = events == 0 or events == n
        p = (0.0 if events == 0 else 1.0) if boundary else float(np.dot(self.w[ii], yy) / denominator)
        v = self.variance(ii, self.w[ii] * (yy - p)) / (denominator ** 2)
        se = math.sqrt(max(v, 0.0))
        # A domain confined to one PSU can have an exactly cancelling ratio
        # influence, leaving floating-point residue rather than information.
        # A residual below 64 machine epsilons on the probability scale must
        # not yield an apparently exact confidence interval.
        if se <= 64 * np.finfo(float).eps:
            se = 0.0
        cv = se / p if not boundary and p > 0 and se > 0 and np.isfinite(se) else None
        reasons = ["small_sample"] if n < 30 else []
        if min(events, n - events) < 5:
            reasons.append("rare_cell")
        if boundary:
            reasons.append("boundary")
        elif cv is None:
            reasons.append("no_variance")
        elif cv > .30:
            reasons.append("high_cv")
        elif cv > .15:
            reasons.append("moderate_cv")
        out["pct"] = round(p * 100, 4)
        if not boundary and 0 < p < 1 and se > 0 and np.isfinite(se):
            delta = self.critical * se / (p * (1 - p))
            low, high = expit(logit(p) - delta), expit(logit(p) + delta)
            out.update(low=round(float(low) * 100, 4), high=round(float(high) * 100, 4))
        # A constant observed outcome has zero linearized variance but supplies
        # no informative Taylor-logit CI. Keep 0/100 as an observed point only.
        out["quality"] = quality_from_reasons(reasons)
        out["qualityReasons"] = reasons
        out["cv"] = round(cv, 5) if cv is not None else None
        return out


def derive(frame):
    a = {k: frame[k].to_numpy(float) for k in frame.columns}
    result = {}
    for metric, variable in [("fruit", "P018"), ("vegetables", "P00901"), ("beans", "P006"), ("sugary", "P02002")]:
        x = a[variable]
        result[metric] = np.where((x >= 0) & (x <= 7), (x >= 5).astype(float), np.nan)
    ultra = np.column_stack([a[f"P006{i}"] for i in range(14, 24)])
    ultra_valid = np.isin(ultra, [1, 2]).all(axis=1)
    result["ultra"] = np.where(ultra_valid, ((ultra == 1).sum(axis=1) >= 5).astype(float), np.nan)
    weight, height = a["P00104"], a["P00404"]
    bmi_valid = (weight > 0) & (weight <= 599.9) & (height > 0) & (height <= 299)
    bmi_valid &= (a["C006"] != 2) | (a["P005"] == 2)
    bmi = np.full(len(frame), np.nan)
    bmi[bmi_valid] = weight[bmi_valid] / (height[bmi_valid] / 100) ** 2
    result["obesity"] = np.where(bmi_valid, (bmi >= 30).astype(float), np.nan)
    result["healthPlan"] = np.where(np.isin(a["I00102"], [1, 2]), (a["I00102"] == 1).astype(float), np.nan)
    result["networkWater"] = np.where(np.isin(a["A005010"], range(1, 7)), (a["A005010"] == 1).astype(float), np.nan)
    result["treatedWater"] = np.where(np.isin(a["A009010"], range(1, 7)), np.isin(a["A009010"], range(1, 5)).astype(float), np.nan)
    result["higherEducation"] = np.where(np.isin(a["VDD004A"], range(1, 8)), (a["VDD004A"] == 7).astype(float), np.nan)
    ovarian = np.full(len(frame), np.nan)
    ovarian[(a["Q120"] == 2) | ((a["Q120"] == 1) & (a["Q121014"] == 2))] = 0
    ovarian[(a["Q120"] == 1) & (a["Q121014"] == 1)] = 1
    # Explicit contradictions are never forced into a zero/non-case.
    contradiction = (a["Q120"] == 2) & (a["Q121014"] == 1)
    ovarian[contradiction] = np.nan
    result["ovarian"] = ovarian
    age_group = np.zeros(len(frame), dtype=int)
    for i, (_, low, high) in enumerate(AGE_BANDS, 1):
        age_group[(a["C008"] >= low) & (a["C008"] <= high)] = i
    groups = {"age": age_group}
    for key, source, max_code in [("education", "VDD004A", 7), ("income", "VDF004", 7), ("race", "C009", 5)]:
        groups[key] = np.where((a[source] >= 1) & (a[source] <= max_code), a[source], 0).astype(int)
    return a, result, groups, bmi, contradiction


def cross_table(design, indices, first, second, values):
    aa, bb = values[first][indices], values[second][indices]
    known = np.isfinite(aa) & np.isfinite(bb)
    paired = indices[known]
    aa, bb = aa[known], bb[known]
    n = len(paired)
    counts = [int(np.sum((aa == x) & (bb == y))) for x, y in itertools.product([0, 1], repeat=2)]
    base = {"a": first, "b": second, "nPaired": int(n), "womenPaired": None,
            "quality": "no_data", "qualityReasons": ["no_valid_responses"], "cells": [], "conditional": {}}
    if n == 0:
        return base
    paired_population = design.population(paired)
    base["womenPaired"] = paired_population["women"]
    reasons = list(paired_population["qualityReasons"])
    # Direct domain-ratio estimation, not ratios of rounded percentages or CIs.
    # The denominator is the population with BOTH variables observed and the
    # conditioning variable at the requested value, preserving the full design.
    base["conditional"] = {
        "b_given_a_true": design.rate(paired[aa == 1], values[second]),
        "b_given_a_false": design.rate(paired[aa == 0], values[second]),
        "a_given_b_true": design.rate(paired[bb == 1], values[first]),
        "a_given_b_false": design.rate(paired[bb == 0], values[first]),
    }
    for stat in base["conditional"].values():
        if stat["quality"] == "no_data":
            reasons.append("empty_conditional_domain")
        else:
            reasons.extend(stat["qualityReasons"])
    for (x, y), count in zip(itertools.product([0, 1], repeat=2), counts):
        joint = np.full(len(design.w), np.nan)
        joint[paired] = ((aa == x) & (bb == y)).astype(float)
        stat = design.rate(paired, joint)
        # Use the original weights, never a rounded percentage times a total.
        cell_women = round(float(design.w[paired[(aa == x) & (bb == y)]].sum()), 2)
        cell = {"aValue": x, "bValue": y, "n": count, "women": cell_women, **stat}
        base["cells"].append(cell)
        reasons.extend(stat["qualityReasons"])
    base["qualityReasons"] = list(dict.fromkeys(reasons))
    base["quality"] = quality_from_reasons(base["qualityReasons"])
    return base


def write_json(path, data):
    path = pathlib.Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":"), allow_nan=False), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", type=pathlib.Path, default=pathlib.Path("pns_sources"))
    parser.add_argument("--raw-zip", type=pathlib.Path)
    parser.add_argument("--dictionary", type=pathlib.Path)
    parser.add_argument("--out-dir", type=pathlib.Path, default=pathlib.Path("data/pns"))
    args = parser.parse_args()
    started = time.time()
    raw = args.raw_zip or download(DATA_URL, args.source_dir / "PNS_2019_20220525.zip")
    dictionary = args.dictionary or download(DICT_URL, args.source_dir / "Dicionario_e_input_20220530.zip")
    spans, dictionary_sha = load_layout(dictionary)
    frame, read_info = read_selected(raw, spans)
    design = TaylorDesign(frame)
    arrays, values, groups, bmi, contradiction = derive(frame)
    women = (arrays["C006"] == 2) & (arrays["C008"] >= 18)
    adults = arrays["C008"] >= 18
    adult_i, women_i = np.flatnonzero(adults), np.flatnonzero(women)
    ovarian_i = np.flatnonzero(women & (values["ovarian"] == 1))
    no_ovarian_i = np.flatnonzero(women & (values["ovarian"] == 0))
    total_observed = {"selectedRespondents": len(frame), "adultRespondents": len(adult_i), "adultWomen": len(women_i),
                      "ovarianSelfReportWomen": len(ovarian_i), "noOvarianSelfReportWomen": len(no_ovarian_i),
                      "ovarianUnknownWomen": int(np.sum(women & ~np.isfinite(values["ovarian"]))),
                      "contradictoryOvarianAnswersWomen": int(np.sum(women & contradiction))}
    print("Observed sample:", total_observed, flush=True)
    print("Design:", {"psu": design.n_psu, "strata": design.n_strata, "df": design.df}, flush=True)

    manifest = {
        "schemaVersion": "pns-ovarian-1.5", "year": 2019, "builtAt": datetime.now(timezone.utc).isoformat(),
        "isSynthetic": False, "isAggregate": True, "populationLabel": "Mulheres com 18 anos ou mais, população representada pela PNS 2019",
        "sources": [{"name": "PNS 2019 microdados", "url": DATA_URL, "bytes": pathlib.Path(raw).stat().st_size, "sha256": sha256(raw)},
                    {"name": "Dicionário PNS 2019", "url": DICT_URL, "xlsSha256": dictionary_sha},
                    {"name": "Questionário PNS 2019", "url": QUESTIONNAIRE_URL},
                    {"name": "Publicação metodológica e resultados PNS 2019", "url": PUBLICATION_URL},
                    {"name": "Chaves internas PNS 2019", "url": KEYS_URL}],
        "sample": total_observed, "design": {"weight": "V00291", "strata": "V0024", "psu": "UPA_PNS",
             "nStrata": design.n_strata, "nPSU": design.n_psu, "degreesOfFreedom": design.df,
             "variance": "Taylor de primeira ordem, conglomerados estratificados, aproximação com reposição no primeiro estágio; todos os PSUs do desenho respondente permanecem, inclusive fora do domínio.",
             "confidenceInterval": "IC95% logit com t(nPSU−nStrata) para proporções interiores com variância positiva; t linear não negativo para totais. Limites observados 0%/100% ou variância nula/não calculável têm IC null e aviso inconclusivo; nunca se apresenta IC degenerado como certeza.",
             "finitePopulationCorrection": False, "anthropometryMeasuredWeightUsed": False},
        "metrics": METRICS, "ovarian": OVARIAN_DEF,
        "nationalOvarian": {"observedWomen": len(ovarian_i), "prevalence": design.rate(women_i, values["ovarian"]),
                            "population": design.population(ovarian_i),
                            "interpretation": "Diagnóstico médico de ovário informado pela entrevistada, atual ou passado, PNS 2019. Não é incidência nem número de tumores ativos."},
        "ageBands": [b[0] for b in AGE_BANDS],
        "cohorts": ["all", "ovarian", "no_ovarian"], "ufs": ["BR"] + sorted(UF.values()),
        "groups": {k: [{"id": str(code), "label": label} for code, label in labels.items()] for k, labels in GROUP_LABELS.items()},
        "crossKeyFormat": "a|b, ordem dos indicadores no manifesto, seguida de ovarian; células aValue/bValue 0=não, 1=sim; pct é proporção conjunta entre respostas conhecidas para ambos.",
        "crossConditionalFormat": "conditional.b_given_a_true, b_given_a_false, a_given_b_true, a_given_b_false; pct/low/high calculados diretamente como domínio do desenho complexo entre respostas conhecidas para ambos. nValid é o denominador amostral condicionado. Não são riscos prospectivos.",
        "crossWeightedTotals": "womenPaired soma os pesos das respostas conhecidas para ambos; cell.women soma os pesos da célula, sem derivar de percentuais arredondados. Célula sem eventos dentro de um par observado tem n=0, women=0 e pct=0, com aviso inconclusivo e IC null; par sem respostas tem no_data.",
        "qualityPolicy": {"mode": "exploratory", "isOfficialIBGERule": False,
             "smallSampleBelow": 30, "rareCellBelow": 5, "cvCautionAbove": .15, "cvInconclusiveAbove": .30,
             "suppressEstimates": False, "publishUnweightedCounts": True, "suppressComplementaryCounts": False,
             "disclosure": "Por solicitação explícita da usuária, pontos estimados e contagens agregadas reais são exibidos também em pequenas amostras, células raras e CV alto, sempre com aviso inconclusivo. Os limiares são alertas internos, não regras oficiais do IBGE. Não são exportados identificadores individuais.",
             "boundaryRule": "Com respostas válidas e nenhum evento observado, pct=0 e nEvent=0; se todas apresentam o evento, pct=100. Ambos têm IC/CV null, quality=inconclusive e qualityReasons contém boundary. Isso não estabelece ausência ou certeza populacional. Sem respostas válidas, pct e IC são null e quality=no_data.",
             "flags": {"ok": "Sem alerta amostral pelos critérios internos; não demonstra causalidade",
                       "caution": "CV acima de 15% até 30%; interpretar com cautela",
                       "inconclusive": "Resultado exploratório ainda inconclusivo; consultar n, numerador, IC e motivos",
                       "no_data": "Nenhuma observação válida no denominador; não há estimativa"},
             "reasons": {"small_sample": "Menos de 30 observações válidas",
                         "rare_cell": "Célula, numerador ou complemento com menos de 5 observações",
                         "high_cv": "Coeficiente de variação acima de 30%",
                         "moderate_cv": "Coeficiente de variação acima de 15% até 30%",
                         "boundary": "Resultado observado 0% ou 100%; IC Taylor-logit não informativo",
                         "no_variance": "Variância nula, numericamente residual ou não calculável; IC não informado",
                         "empty_conditional_domain": "Pelo menos um condicionamento não possui respostas válidas",
                         "no_valid_responses": "Nenhuma resposta válida no denominador"}},
        "interpretation": ["Percentuais, totais ponderados e IC calculados a partir de observações reais PNS; nenhuma população sintética ou multiplicação pelo Censo.",
             "São estimativas amostrais de 2019, não contagem censitária nem medição atual.",
             "Resultados com pouca amostra, células raras ou CV alto são apresentados como exploratórios ainda inconclusivos, junto das contagens reais. IC disponível não elimina a fragilidade da amostra.",
             "Zero observado em respostas válidas não equivale a risco populacional zero; respostas ausentes nunca são convertidas em zero. Sem resposta válida, a estimativa fica ausente.",
             "Alimentação descreve frequência atual ou consumo no dia anterior à entrevista; não estabelece dieta anterior ao diagnóstico.",
             "Relato de ovário é diagnóstico médico informado pela entrevistada, atual ou passado; não informa tumor ativo, estágio, histologia ou incidência.",
             "Relações são transversais e descritivas, sujeitas a confundimento, causalidade reversa e seleção de sobreviventes; não são probabilidade individual de desenvolver câncer.",
             "A PNS representa a população em domicílios particulares permanentes dentro do âmbito da pesquisa, não todas as pessoas institucionalizadas.",
             "A categoria sugary é um identificador técnico legado e mede refrigerante inclusive diet/zero, não açúcar.",
             "networkWater é rede geral como principal abastecimento, não água comprovadamente tratada; treatedWater é prática declarada de tratamento da água de beber no domicílio, sem ensaio de potabilidade. Mineral industrializada não conta como tratamento domiciliar.",
             "Os indicadores de água representam mulheres adultas residentes em domicílios com a característica; não estimam cobertura domiciliar ou cobertura de todas as pessoas da UF.",
             "Não existe item específico isolando laranja/cítricos: P00611 mistura laranja, banana, maçã e abacaxi.",
             "O dicionário rotula Q12201 incorretamente como doença mental; o questionário confirma primeiro câncer em geral. O campo não foi usado.",
             "Alimentação saudável e comportamentos gerais não são tratados como pontuação causal de risco de câncer de ovário."]}

    pairs = list(itertools.combinations(list(METRICS) + ["ovarian"], 2))
    summary = {"schemaVersion": manifest["schemaVersion"], "year": 2019, "rows": []}
    validations = []
    for uf in manifest["ufs"]:
        uf_mask = women if uf == "BR" else women & (arrays["V0001"] == next(k for k, v in UF.items() if v == uf))
        result_rows = []
        for age in ["all"] + [b[0] for b in AGE_BANDS]:
            age_mask = np.ones(len(frame), dtype=bool) if age == "all" else groups["age"] == next(i for i, b in enumerate(AGE_BANDS, 1) if b[0] == age)
            domain = uf_mask & age_mask
            for cohort in manifest["cohorts"]:
                cohort_mask = np.ones(len(frame), dtype=bool) if cohort == "all" else values["ovarian"] == (1 if cohort == "ovarian" else 0)
                indices = np.flatnonzero(domain & cohort_mask)
                population = design.population(indices)
                row = {"age": age, "cohort": cohort, **population,
                       "rates": {metric: design.rate(indices, values[metric]) for metric in METRICS},
                       "ovarianRate": design.rate(indices, values["ovarian"]) if cohort == "all" else None,
                       "groups": {}, "crosses": {}}
                for group, labels in GROUP_LABELS.items():
                    items = []
                    for code, label in labels.items():
                        membership = (groups[group] == code).astype(float)
                        membership_indices = indices[groups[group][indices] == code]
                        group_population = design.population(membership_indices)
                        stat = design.rate(indices, membership)
                        items.append({"id": str(code), "label": label, "n": group_population["n"],
                                      "women": group_population["women"], "populationQuality": group_population["quality"],
                                      "populationQualityReasons": group_population["qualityReasons"],
                                      **stat, "rates": {metric: design.rate(membership_indices, values[metric]) for metric in METRICS}})
                    row["groups"][group] = items
                if cohort == "all":
                    row["crosses"] = {f"{first}|{second}": cross_table(design, indices, first, second, values) for first, second in pairs}
                    summary["rows"].append({"uf": uf, "age": age, "cohort": cohort, **population,
                                            "rates": row["rates"], "ovarianRate": row["ovarianRate"]})
                if uf == "BR" and age == "all":
                    validations.append({"cohort": cohort, **population, "rates": row["rates"], "ovarianRate": row["ovarianRate"]})
                result_rows.append(row)
        write_json(args.out_dir / "uf" / f"{uf}.json", {"uf": uf, "year": 2019, "rows": result_rows})
        print(f"Completed {uf}: {len(result_rows)} rows", flush=True)

    # Published benchmark and independent internal arithmetic checks.
    adult_ultra = design.rate(adult_i, values["ultra"])
    adult_population = float(design.w[adult_i].sum())
    female_population = float(design.w[women_i].sum())
    uf_population_sum = sum(float(design.w[np.flatnonzero(women & (arrays["V0001"] == code))].sum()) for code in UF)
    age_population_sum = sum(float(design.w[np.flatnonzero(women & (groups["age"] == code))].sum()) for code in range(1, 8))
    if total_observed["adultWomen"] != total_observed["ovarianSelfReportWomen"] + total_observed["noOvarianSelfReportWomen"] + total_observed["ovarianUnknownWomen"]:
        raise AssertionError("Ovarian cohort sample partition failed")
    if not math.isclose(female_population, uf_population_sum, rel_tol=1e-12):
        raise AssertionError("UF population partition failed")
    if not math.isclose(female_population, age_population_sum, rel_tol=1e-12):
        raise AssertionError("Age population partition failed")
    if round(adult_ultra["pct"], 1) != 14.3:
        raise AssertionError(f"Published PNS adult ultra-processed-food benchmark failed: {adult_ultra['pct']}")
    # Constant outcomes have zero linearized variance, but an observed boundary
    # must not be exported with a degenerate interval suggesting certainty.
    constant = np.ones(len(frame), dtype=float)
    check_constant = design.rate(women_i, constant)
    check_zero = design.rate(women_i, np.zeros(len(frame), dtype=float))
    if design.variance(women_i, np.zeros(len(women_i), dtype=float)) != 0:
        raise AssertionError("Constant linearized variance check failed")
    for result, expected in [(check_constant, 100), (check_zero, 0)]:
        if result["pct"] != expected or result["low"] is not None or result["high"] is not None or result["cv"] is not None or result["quality"] != "inconclusive" or "boundary" not in result["qualityReasons"]:
            raise AssertionError("Boundary disclosure check failed")

    manifest["files"] = {"summary": "summary.json", "ufPattern": "uf/{UF}.json"}
    manifest["sample"]["weightedAdultWomen2019"] = round(female_population, 2)
    write_json(args.out_dir / "manifest.json", manifest)
    write_json(args.out_dir / "summary.json", summary)
    validation = {"schemaVersion": manifest["schemaVersion"], "passed": True, "read": read_info,
                  "sample": total_observed, "design": manifest["design"], "qualityPolicy": manifest["qualityPolicy"],
                  "weightedAdults": adult_population, "weightedAdultWomen": female_population,
                  "publishedBenchmark": {"name": "Adultos com 5+ grupos de ultraprocessados no dia anterior", "publishedPct": 14.3,
                     "computedPct": adult_ultra["pct"], "passToOneDecimal": True, "url": PUBLICATION_URL},
                  "partitionChecks": {"ovarianCohorts": True, "UFs": True, "ageBands": True},
                  "constantOutcomeVarianceCheck": True, "boundaryDisclosureCheck": True, "national": validations,
                  "bmi": {"validAdultWomen": int(np.sum(women & np.isfinite(bmi))),
                          "excludedPregnantAdultWomen": int(np.sum(women & (arrays["P005"] == 1))),
                          "excludedPregnancyUnknownAdultWomen": int(np.sum(women & (arrays["P005"] == 3))),
                          "imputedReportedHeightOrWeightAdultWomen": int(np.sum(women & (arrays["P00405"] == 1))),
                          "min": float(np.nanmin(bmi[women])), "max": float(np.nanmax(bmi[women]))},
                  "varianceCalls": design.variance_calls, "runtimeSeconds": round(time.time() - started, 2)}
    write_json(args.out_dir / "validation.json", validation)
    report = ["VALIDAÇÃO DE DADOS REAIS PNS 2019 PARA PAINEL DE OVÁRIO", "", "Resultado: verificações concluídas com sucesso.",
              f"Fonte dos microdados: {DATA_URL}", f"Fonte do dicionário: {DICT_URL}",
              f"SHA256 ZIP: {manifest['sources'][0]['sha256']}", f"Registros brutos: {read_info['raw_records']}",
              f"Moradores selecionados entrevistados com peso válido: {len(frame)}", f"Mulheres adultas observadas: {len(women_i)}",
              f"Relato de diagnóstico de ovário na amostra: {len(ovarian_i)}", f"Sem relato de ovário: {len(no_ovarian_i)}",
              f"População feminina adulta representada em 2019 (soma dos pesos): {female_population:.2f}",
              f"Desenho completo respondente: {design.n_psu} PSUs, {design.n_strata} estratos, {design.df} graus de liberdade.",
              f"Ultraprocessados em adultos de ambos os sexos: {adult_ultra['pct']:.4f}%; publicação IBGE: 14,3% (reproduzida a uma casa).",
              "Partições por UF, idade e coorte foram conferidas sem duplicação.",
              "A variância incorpora estratos e conglomerados; membros fora do domínio contribuem com zero no PSU, sem remover o PSU.",
              "IC de proporção interior com variância positiva: transformação logit e quantil t; aproximação com reposição no primeiro estágio, sem FPC.",
              "Não foi aplicada aproximação de Kish ou amostragem aleatória simples aos intervalos.",
              "Versão 1.5 exploratória: por solicitação da usuária, contagens reais e pontos estimados são mostrados mesmo com n<30, célula<5 ou CV>30%, acompanhados de aviso ainda inconclusivo.",
              "Os limiares são critérios internos de alerta, não regras oficiais do IBGE; não há supressão por essas condições nem supressão complementar da coorte no_ovarian.",
              "Com respostas válidas, zero evento é mostrado como 0% observado e nEvent=0; todos os eventos como 100%. IC/CV são null nos limites, sem certeza populacional fabricada. Sem denominador válido, o resultado é no_data.",
              "Desvios-padrão residuais abaixo de 64 épsilons de máquina na escala da proporção são tratados como numericamente não informativos, com IC/CV null e motivo no_variance.",
              "Contagens n, nValid, nEvent, missing e nPaired são números amostrais reais; totais women são somas ponderadas e não número observado de participantes.",
              "Cruzamentos incluem totais ponderados calculados diretamente dos pesos e quatro percentuais condicionais com IC Taylor próprio.",
              "Água: A005010=1 é abastecimento principal pela rede geral; A009010=1–4 é tratamento da água de beber no domicílio. Nenhuma variável comprova potabilidade.",
              "Escolaridade: higherEducation usa somente VDD004A=7 (superior completo), com respostas1–7 no denominador; superior incompleto não é contado como completo.",
              "Campo Q121014 é multirresposta e inclui diagnóstico atual/passado; dados transversais não demonstram causalidade.",
              "IMC usa valores finais REFERIDOS, inclusive imputação IBGE; exclui gravidez conhecida/indefinida; não usa dados W aferidos.",
              "Não foram aplicados limites ad hoc adicionais de IMC além das faixas válidas do dicionário; consultar min/max em validation.json.",
              "Atividade física foi preservada em memória como componentes; nenhum indicador de inatividade sem validação foi publicado.",
              "Somente agregados foram exportados. Nenhum identificador de pessoa, domicílio ou UPA aparece nos JSONs.",
              "O TXT e o ZIP brutos são insumos de reprodução e não devem ser incluídos no projeto publicado.",
              f"Duração do processamento: {validation['runtimeSeconds']} segundos."]
    (args.out_dir / "validation_report.txt").write_text("\n".join(report) + "\n", encoding="utf-8")
    print("DONE", json.dumps({"out": str(args.out_dir), "runtimeSeconds": validation["runtimeSeconds"],
                             "adultWomen": len(women_i), "ovarian": len(ovarian_i), "benchmarkUltra": adult_ultra}, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
