#!/usr/bin/env python3
"""Reproduce public ovarian cancer aggregates from SIM/TabNet and INCA.

Standard library only. Run normally to validate/process the retained source
snapshots, or pass --refresh to request the same public official tables again.
No patient-level records, fitted values or simulated data are generated.
"""
import argparse
import datetime as dt
import gzip
import hashlib
import html
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent
YEAR = 2024
FORM_URL = 'https://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/obt10uf.def'
QUERY_URL = 'https://tabnet.datasus.gov.br/cgi/tabcgi.exe?sim/cnv/obt10uf.def'
INCA_UF_URL = 'https://www.gov.br/inca/pt-br/assuntos/cancer/numeros/estimativa/estado-capital/brasil/por-estado/por-estado/'
INCA_OVARY_URL = 'https://www.gov.br/inca/pt-br/assuntos/cancer/tipos/ovario/versao-para-populacao'
UF_CODES = {
    '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA',
    '16': 'AP', '17': 'TO', '21': 'MA', '22': 'PI', '23': 'CE',
    '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL', '28': 'SE',
    '29': 'BA', '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP',
    '41': 'PR', '42': 'SC', '43': 'RS', '50': 'MS', '51': 'MT',
    '52': 'GO', '53': 'DF', '00': 'UNKNOWN_RESIDENCE'
}


def write_json(name, value):
    path = ROOT / name
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return path


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def get_snapshot(name, url, refresh=False, form=None):
    path = ROOT / name
    if path.exists() and not refresh:
        return path.read_bytes()
    data = urllib.parse.urlencode(form, encoding='latin-1').encode('ascii') if form else None
    headers = {'User-Agent': 'OncoLensResearch/1.0 (official public aggregate tables)'}
    if form:
        headers.update({'Content-Type': 'application/x-www-form-urlencoded', 'Referer': FORM_URL})
    with urllib.request.urlopen(urllib.request.Request(url, data=data, headers=headers), timeout=55) as response:
        raw = response.read()
        response_metadata = {'url': response.url, 'headers': dict(response.headers), 'status': response.status}
    if raw[:2] == b'\x1f\x8b':
        raw = gzip.decompress(raw)
    path.write_bytes(raw)
    response_metadata['retrieved_at'] = dt.datetime.now(dt.timezone.utc).isoformat()
    write_json(name + '.http.json', response_metadata)
    return raw


def text(markup):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', markup))).strip()


def attributes(markup):
    return dict((match[0].lower(), next(part for part in match[1:] if part))
                for match in re.findall(r'([\w-]+)\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s>]+))', markup))


def form_options(markup):
    result = {}
    for attrs, content in re.findall(r'<select([^>]*)>(.*?)</select>', markup, re.I | re.S):
        name = attributes(attrs).get('name')
        if not name:
            continue
        result[name] = []
        for option in re.split(r'<option\b', content, flags=re.I)[1:]:
            attrs, label = option.split('>', 1)
            result[name].append({'value': attributes(attrs).get('value'), 'label': text(label)})
    return result


def cell_rows(section):
    """Also handles TabNet's legacy HTML with unclosed TD/TR elements."""
    result = []
    for block in re.split(r'<tr\b[^>]*>', section, flags=re.I)[1:]:
        cells = [text(cell) for cell in re.split(r'<t[dh]\b[^>]*>', block, flags=re.I)[1:]]
        if cells:
            result.append(cells)
    return result


def integer(raw):
    # The SIM source legend explicitly defines '-' as an exact numerical zero.
    if raw == '-':
        return 0
    if not re.fullmatch(r'[0-9.]+', raw):
        raise ValueError('Unrecognized numerical token: ' + repr(raw))
    return int(raw.replace('.', ''))


def snapshot_metadata(filename, url):
    path = ROOT / filename
    return {'url': url, 'retained_file': filename, 'sha256': sha256(path),
            'bytes': path.stat().st_size,
            'retrieved_at': dt.datetime.fromtimestamp(path.stat().st_mtime, dt.timezone.utc).isoformat()}


def main(refresh=False):
    form_raw = get_snapshot('tabnet.html', FORM_URL, refresh)
    opts = form_options(form_raw.decode('latin-1'))
    category = next(option['value'] for option in opts['SCategoria_CID-10'] if option['label'].startswith('C56 '))
    female = next(option['value'] for option in opts['SSexo'] if option['label'] == 'Fem')
    year_file = next(option['value'] for option in opts['Arquivos'] if option['label'] == str(YEAR))
    params = {name: 'TODAS_AS_CATEGORIAS__' for name in opts if name.startswith('S')}
    params.update({'Linha': 'Unidade_da_Federação', 'Coluna': 'Faixa_Etária_det',
                   'Incremento': 'Óbitos_p/Residênc', 'Arquivos': year_file,
                   'formato': 'table', 'zeradas': 'exibirlz', 'mostre': 'Mostra',
                   'SCategoria_CID-10': category, 'SSexo': female})
    write_json('sim_2024_request.json', params)
    sim_raw = get_snapshot('sim_2024_uf_age.html', QUERY_URL, refresh, params)
    sim_html = sim_raw.decode('latin-1')
    visible = text(sim_html)
    for expected in ['C56 Neoplasia maligna do ovário', 'Sexo: Fem', 'Período: 2024', 'Óbitos p/Residênc']:
        if expected not in visible:
            raise ValueError('SIM query returned an unexpected scope: ' + expected)
    header = cell_rows(re.search(r'<thead\b[^>]*>(.*?)</thead>', sim_html, re.I | re.S)[1])[-1]
    body = cell_rows(re.search(r'<tbody\b[^>]*>(.*?)(?:</tbody>|</table>)', sim_html, re.I | re.S)[1])
    age_labels = header[1:-1]
    ages = []
    for label in age_labels:
        match = re.fullmatch(r'(\d+) a (\d+) anos', label)
        if match:
            ages.append({'id': match[1] + '-' + match[2], 'label': label,
                         'min_age': int(match[1]), 'max_age': int(match[2])})
        elif label == '80 anos e mais':
            ages.append({'id': '80+', 'label': label, 'min_age': 80, 'max_age': None})
        else:
            raise ValueError('Unexpected published age group: ' + label)
    parsed = []
    for row in body:
        if len(row) != len(header):
            raise ValueError('Inconsistent SIM table width: ' + repr(row))
        if row[0] == 'TOTAL':
            code, uf, name = 'BR', 'BR', 'Brasil'
        else:
            match = re.fullmatch(r'(\d{2})\s+(.+)', row[0])
            if not match:
                raise ValueError('Unknown residence label: ' + row[0])
            code, name = match.groups()
            uf = UF_CODES[code]
        counts = [integer(raw) for raw in row[1:]]
        if sum(counts[:-1]) != counts[-1]:
            raise ValueError('Age counts do not match the published total: ' + row[0])
        parsed.append({'uf': uf, 'uf_code': code, 'uf_name': name,
                       'deaths': counts[-1], 'age_counts': counts[:-1]})
    national = next(row for row in parsed if row['uf'] == 'BR')
    states = [row for row in parsed if row['uf'] not in ('BR', 'UNKNOWN_RESIDENCE')]
    unknown = next(row for row in parsed if row['uf'] == 'UNKNOWN_RESIDENCE')
    assert len(states) == 27
    assert sum(row['deaths'] for row in states) + unknown['deaths'] == national['deaths']
    for index in range(len(ages)):
        assert sum(row['age_counts'][index] for row in states) + unknown['age_counts'][index] == national['age_counts'][index]
    extraction_date = re.search(r'Dados finais disponíveis até 2024 - data de extração (\d{2}/\d{2}/\d{4})', visible)[1]
    common = {'year': YEAR, 'sex': 'female', 'icd10_underlying_cause': 'C56',
              'geography_basis': 'residence', 'unit': 'deaths', 'source_id': 'SIM_2024_C56_FEMALE'}
    mortality_rows = []
    for row in parsed:
        for index, age in enumerate(ages):
            mortality_rows.append(dict(common, uf=row['uf'], uf_code=row['uf_code'], uf_name=row['uf_name'],
                                       age=age['id'], age_label=age['label'], deaths=row['age_counts'][index]))
        mortality_rows.append(dict(common, uf=row['uf'], uf_code=row['uf_code'], uf_name=row['uf_name'],
                                   age='all', age_label='Todas as idades', deaths=row['deaths']))

    inca_raw = get_snapshot('inca_2026_uf.html', INCA_UF_URL, refresh)
    inca_html = inca_raw.decode('utf-8')
    if 'Estimativas para o ano 2026' not in text(inca_html):
        raise ValueError('INCA page no longer has the requested 2026 reference period')
    table = re.search(r'<table\b[^>]*>.*?</table>', inca_html, re.I | re.S)[0]
    inca_header = cell_rows(re.search(r'<thead\b[^>]*>(.*?)</thead>', table, re.I | re.S)[1])[0]
    ovarian_index = inca_header.index('Ovário')
    inca_body = cell_rows(re.search(r'<tbody\b[^>]*>(.*?)</tbody>', table, re.I | re.S)[1])
    by_name = {row['uf_name']: row['uf'] for row in parsed}
    estimate_rows = []
    for row in inca_body:
        if len(row) != len(inca_header):
            raise ValueError('Inconsistent INCA table width: ' + repr(row))
        raw = row[ovarian_index]
        name = row[0]
        estimate_rows.append({'uf': by_name[name], 'uf_name': name,
                              'year': 2026, 'period_label': 'Estimativa anual 2026',
                              'sex': 'female', 'age': 'all', 'age_label': 'Todas as idades',
                              'unit': 'estimated_new_cases_per_year', 'source_id': 'INCA_ESTIMATE_2026',
                              'cases': None if raw == '**' else integer(raw),
                              'display': '<20' if raw == '**' else raw,
                              'published_value': raw, 'censored': raw == '**',
                              'censoring': 'less_than_20' if raw == '**' else None,
                              'rounding': 'multiple_of_10'})
    assert len(estimate_rows) == 28
    inca_national = next(row for row in estimate_rows if row['uf'] == 'BR')
    population_raw = get_snapshot('inca_ovario_population.html', INCA_OVARY_URL, refresh)
    population_text = text(population_raw.decode('utf-8'))
    mortality_crosscheck = re.search(r'Número de óbitos \(C56\):\s*([\d.]+)\s*\([^)]*SIM,\s*(\d{4})\)', population_text)
    assert mortality_crosscheck, 'National mortality crosscheck not found on INCA page'
    mortality_check = {'year': int(mortality_crosscheck[2]), 'deaths': integer(mortality_crosscheck[1]),
                       'source_url': INCA_OVARY_URL}
    mortality_check['matches_sim'] = mortality_check['year'] == YEAR and mortality_check['deaths'] == national['deaths']
    assert mortality_check['matches_sim'], 'SIM total differs from the national INCA statement for 2024'
    assert inca_national['cases'] == 8020, 'Published INCA national 2026 estimate changed; review the source'

    dataset = {
        'schema_version': '1.0', 'synthetic': False,
        'generated_at': dt.datetime.now(dt.timezone.utc).isoformat(),
        'mortality': {
            'source_id': 'SIM_2024_C56_FEMALE', 'system': 'SIM / MS-SVSA-CGIAE',
            'source_url': FORM_URL, 'query_url': QUERY_URL, 'year': YEAR,
            'publication_status': 'final', 'source_extraction_date': extraction_date,
            'sex': 'female', 'cause': 'C56 - Neoplasia maligna do ovário',
            'cause_field': 'underlying_cause', 'geography_basis': 'residence',
            'unit': 'deaths', 'all_age_label': 'Todas as idades',
            'age_groups': ages, 'states': [{'uf': row['uf'], 'code': row['uf_code'], 'name': row['uf_name']} for row in states],
            'national_total': national['deaths'], 'unknown_or_foreign_residence_deaths': unknown['deaths'],
            'unallocated_age_residual': national['deaths'] - sum(national['age_counts']),
            'rows': mortality_rows, 'rates': None,
            'rates_unavailable_reason': 'This query reports counts. No same-year population denominator was imported; PNS weights are not used as a mortality denominator.',
            'notes': [
                'Contagens de óbitos com C56 como causa básica, sexo feminino e UF de residência; não são incidência nem letalidade.',
                'As idades são as faixas publicadas pelo TabNet. O total inclui todas as idades, não apenas mulheres com 18 anos ou mais.',
                'Não é possível separar 18–19 de 15–19 nesta tabela. Não reinterpretar a faixa 15–19 como 18–19.',
                'O símbolo "-" foi convertido em zero conforme a legenda explícita do TabNet: dado numérico igual a zero não resultante de arredondamento.',
                'A linha Ignorado/exterior foi preservada. Ela tem zero óbitos neste recorte.',
                'Todas as colunas etárias publicadas somam exatamente os totais. O resíduo nacional de idades não alocadas nas colunas exibidas é zero.',
                'Categorias sem coluna própria não são extrapoladas. Nenhuma célula foi imputada a partir da PNS ou de outra fonte.',
                'A granularidade etária administrativa deve ter seletor próprio, separado das faixas da PNS.'
            ],
            'validation': {'uf_count': len(states), 'published_age_group_count': len(ages),
                           'all_row_sums_match_published_totals': True, 'all_column_sums_match_national': True,
                           'inca_national_crosscheck': mortality_check}
        },
        'incidence_estimate': {
            'source_id': 'INCA_ESTIMATE_2026', 'system': 'INCA', 'source_url': INCA_UF_URL,
            'year': 2026, 'period_context': 'National site states annual estimates for each year of 2026–2028; the UF table is labeled year 2026.',
            'unit': 'estimated_new_cases_per_year', 'sex': 'female', 'age': 'all',
            'national_cases': inca_national['cases'], 'rows': estimate_rows, 'rates': None,
            'notes': [
                'São estimativas publicadas de casos novos anuais, não casos observados e não registros de tratamento.',
                'A tabela estadual de 2026 não contém estratificação por idade. Um filtro etário não pode ser aplicado a estes números.',
                'Números arredondados para múltiplos de 10. O símbolo "**" indica menos de 20 casos, conforme nota da fonte.',
                'Acre, Amapá e Roraima permanecem com cases=null e display="<20". Não foram substituídos por zero, dez ou vinte.',
                'O total Brasil é o valor nacional publicado. Não recalcular somando valores estaduais arredondados e censurados.',
                'Estas estimativas não devem ser divididas pelos óbitos SIM 2024 para produzir sobrevida ou letalidade.'
            ]
        },
        'unavailable': {
            'hospital_admissions': 'Not extracted in this delivery.',
            'chemotherapy_apacs': 'Not extracted in this delivery.',
            'stage': 'No real staging source imported.',
            'individual_linkage': 'No link exists between these aggregates and PNS respondents.'
        },
        'sources': [snapshot_metadata('tabnet.html', FORM_URL),
                    snapshot_metadata('sim_2024_uf_age.html', QUERY_URL),
                    snapshot_metadata('inca_2026_uf.html', INCA_UF_URL),
                    snapshot_metadata('inca_ovario_population.html', INCA_OVARY_URL)],
        'reproduction': {'script': Path(__file__).name, 'script_sha256': sha256(__file__),
                         'query_parameters': 'sim_2024_request.json',
                         'query_parameters_sha256': sha256(ROOT / 'sim_2024_request.json')}
    }
    output = write_json('ovarian_admin_real.json', dataset)
    write_json('provenance.json', {'generated_at': dataset['generated_at'], 'sources': dataset['sources'],
                                'reproduction': dataset['reproduction'], 'output': output.name, 'output_sha256': sha256(output)})
    print(json.dumps({'output': str(output), 'sha256': sha256(output),
                      'SIM_2024_C56_female_deaths': national['deaths'],
                      'SIM_rows': len(mortality_rows), 'UF_count': len(states), 'age_groups': len(ages),
                      'INCA_2026_national_estimated_cases': inca_national['cases'],
                      'censored_UFs': [row['uf'] for row in estimate_rows if row['censored']],
                      'validation': 'PASS'}, ensure_ascii=False))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--refresh', action='store_true', help='Download the official snapshots again.')
    main(parser.parse_args().refresh)
