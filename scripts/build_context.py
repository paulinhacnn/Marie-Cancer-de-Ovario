#!/usr/bin/env python3
"""Reproduce the state context from the bundled official source snapshots.

Uses only the Python standard library and performs no network requests.
From the project root:
  python scripts/build_context.py --check frontend/data/context.json
  python scripts/build_context.py --output build/context.json

Without arguments, validates the snapshots and checks the frontend JSON.
The frontend file is never an implicit write target.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import posixpath
import xml.etree.ElementTree as ET
import zipfile


PROJECT_ROOT = pathlib.Path(__file__).resolve().parents[1]
DEFAULT_SNAPSHOTS = PROJECT_ROOT / "docs" / "source_snapshots" / "context"
NS_MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
NS_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
UF = {
    "1": "BR", "11": "RO", "12": "AC", "13": "AM", "14": "RR",
    "15": "PA", "16": "AP", "17": "TO", "21": "MA", "22": "PI",
    "23": "CE", "24": "RN", "25": "PB", "26": "PE", "27": "AL",
    "28": "SE", "29": "BA", "31": "MG", "32": "ES", "33": "RJ",
    "35": "SP", "41": "PR", "42": "SC", "43": "RS", "50": "MS",
    "51": "MT", "52": "GO", "53": "DF",
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha256(raw):
    return hashlib.sha256(raw).hexdigest()


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def read_xlsx_records(path, sheet_name):
    """Read the cached cell values in the original XLSX without extra packages."""
    ns = {"m": NS_MAIN}
    with zipfile.ZipFile(path) as archive:
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        sheets = workbook.find("m:sheets", ns)
        matching = [s for s in sheets if s.attrib["name"] == sheet_name]
        require(len(matching) == 1, f"Expected one worksheet named {sheet_name}")
        relation_id = matching[0].attrib[f"{{{NS_REL}}}id"]
        relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        targets = [r.attrib["Target"] for r in relationships if r.attrib["Id"] == relation_id]
        require(len(targets) == 1, "Could not resolve the worksheet relationship")
        target = targets[0]
        sheet_path = target.lstrip("/") if target.startswith("/") else posixpath.normpath("xl/" + target)
        strings = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            strings = ["".join(t.text or "" for t in item.findall(".//m:t", ns)) for item in shared]
        worksheet = ET.fromstring(archive.read(sheet_path))
        rows = []
        for row in worksheet.findall("m:sheetData/m:row", ns):
            cells = {}
            for cell in row.findall("m:c", ns):
                column = 0
                for char in cell.attrib["r"]:
                    if char.isalpha():
                        column = column * 26 + ord(char.upper()) - ord("A") + 1
                    else:
                        break
                value_node = cell.find("m:v", ns)
                raw = None if value_node is None else value_node.text
                kind = cell.attrib.get("t")
                if kind == "s":
                    value = strings[int(raw)] if raw is not None else None
                elif kind == "inlineStr":
                    value = "".join(t.text or "" for t in cell.findall(".//m:t", ns))
                elif kind == "str":
                    value = raw
                elif raw is None:
                    value = None
                else:
                    value = float(raw)
                cells[column - 1] = value
            if cells:
                rows.append([cells.get(i) for i in range(max(cells) + 1)])
        require(bool(rows), "The source worksheet is empty")
        headers = rows[0]
        return [dict(zip(headers, row + [None] * (len(headers) - len(row)))) for row in rows[1:]]


def build_context(snapshot_dir):
    manifest = read_json(snapshot_dir / "snapshot_manifest.json")
    for entry in manifest["files"]:
        raw = (snapshot_dir / entry["file"]).read_bytes()
        require(len(raw) == entry["bytes"], f"Size mismatch: {entry['file']}")
        require(sha256(raw) == entry["sha256"], f"SHA256 mismatch: {entry['file']}")

    metadata = read_json(snapshot_dir / "context_metadata.json")
    table = read_json(snapshot_dir / "sidra6803_metadata.json")
    require(table["id"] == 6803, "Unexpected SIDRA table")
    require(381 in {v["id"] for v in table["variaveis"]}, "SIDRA variable 381 is absent")
    require(table["periodicidade"]["inicio"] == 2022, "Unexpected census reference year")
    responses = read_json(snapshot_dir / "sidra6803_values.json")
    require(len(responses) == 1 and str(responses[0]["id"]) == "381", "Unexpected SIDRA response")
    categories = {}
    for result in responses[0]["resultados"]:
        classification = result["classificacoes"][0]
        require(str(classification["id"]) == "1821", "Unexpected water classification")
        require(len(classification["categoria"]) == 1, "Expected one category per result")
        category = next(iter(classification["categoria"]))
        require(category not in categories, "Repeated water category")
        categories[category] = result["series"]
    require(set(categories) == {"72129", "72144"}, "Unexpected water categories")

    totals = {}
    for series in categories["72129"]:
        location = series["localidade"]
        code = location["id"]
        require(code not in totals, "Repeated census territory")
        totals[code] = {"name": location["nome"], "total": int(series["serie"]["2022"])}
    network = {s["localidade"]["id"]: int(s["serie"]["2022"]) for s in categories["72144"]}
    require(set(totals) == set(network) == set(UF), "Expected Brazil and all 27 UFs")
    require(sum(v["total"] for k, v in totals.items() if k != "1") == totals["1"]["total"], "Census totals do not sum to Brazil")
    require(sum(v for k, v in network.items() if k != "1") == network["1"], "Network counts do not sum to Brazil")

    records = read_xlsx_records(snapshot_dir / "base_de_dados.xlsx", "Base de Dados")
    available_years = sorted({int(r["ANO"]) for r in records})
    require(available_years == list(range(2012, 2022)), "This snapshot must contain the 2012–2021 series")
    lookup = {}
    for record in records:
        year = int(record["ANO"])
        if year in (2019, 2021) and record["AGREGACAO"] in ("BRASIL", "UF"):
            code = "1" if record["AGREGACAO"] == "BRASIL" else str(int(record["CODIGO"]))
            key = (code, year)
            require(key not in lookup, "Repeated IDHM territory/year")
            lookup[key] = record
    require(len(lookup) == 56, "Expected 28 IDHM territories in each selected year")
    require(metadata["sources"]["idhm"]["year"] == 2021, "Primary IDHM year must be 2021")
    require(metadata["sources"]["idhm"]["additional_year"] == 2019, "Alternative IDHM year must be 2019")
    require(metadata["sources"]["water"]["year"] == 2022, "Water year must be 2022")
    require(metadata["sources"]["idhm"]["available_years_in_source"] == available_years, "Source years disagree with metadata")
    require(metadata["sources"]["idhm"]["source_sha256"] == sha256((snapshot_dir / "base_de_dados.xlsx").read_bytes()), "IDHM provenance hash disagrees with the workbook")

    rows = []
    for code, water in totals.items():
        primary, aligned = lookup[(code, 2021)], lookup[(code, 2019)]
        row = {
            "uf": UF[code], "name": water["name"], "ibge_code": code,
            "water_network_pct": round(100 * network[code] / water["total"], 4),
            "water_households_total": water["total"],
            "water_households_network_main": network[code], "water_year": 2022,
            "idhm": primary["IDHM"], "idhm_education": primary["IDHM_E"], "idhm_year": 2021,
            "idhm_2019": aligned["IDHM"], "idhm_education_2019": aligned["IDHM_E"],
            "idhm_reference_year_aligned_to_pns": 2019,
        }
        require(0 <= row["water_network_pct"] <= 100, "Water percentage outside its valid interval")
        for key in ("idhm", "idhm_education", "idhm_2019", "idhm_education_2019"):
            require(0 <= row[key] <= 1, f"Invalid index: {UF[code]} {key}")
        rows.append(row)
    require(len(rows) == 28, "Expected 28 output rows")
    require(lookup[("1", 2021)]["IDHM"] == 0.766, "National IDHM differs from the selected source")
    require(lookup[("1", 2021)]["IDHM_E"] == 0.757, "National education IDHM differs from the selected source")
    metadata["rows"] = rows
    encoded = (json.dumps(metadata, ensure_ascii=False, indent=2, allow_nan=False) + "\n").encode("utf-8")
    require(sha256(encoded) == manifest["reference_sha256"], "Regenerated artifact differs from the version recorded in the snapshot manifest")
    return encoded, manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--snapshot-dir", type=pathlib.Path, default=DEFAULT_SNAPSHOTS)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", type=pathlib.Path, help="Compare the result with this existing file; write nothing")
    mode.add_argument("--output", type=pathlib.Path, help="Write the regenerated JSON to this explicit destination")
    args = parser.parse_args()
    encoded, manifest = build_context(args.snapshot_dir.resolve())
    if args.output is not None:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_bytes(encoded)
        print(f"Wrote {args.output}")
    else:
        reference = args.check or PROJECT_ROOT / "frontend" / "data" / "context.json"
        require(reference.read_bytes() == encoded, f"Byte comparison failed: {reference}")
        print("Byte-for-byte comparison passed; no files changed.")
    print(json.dumps({"source_files_verified": len(manifest["files"]), "rows": 28,
                      "years": manifest["source_years"], "sha256": sha256(encoded)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
