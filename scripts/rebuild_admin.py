#!/usr/bin/env python3
"""Rebuild frontend/data/admin.json from the retained SIM and INCA sources.

Use --refresh only to request fresh copies of the same official public tables.
The original extraction script remains unchanged for provenance verification.
"""
import argparse
import importlib.util
from pathlib import Path
import shutil
import tempfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--refresh', action='store_true')
    args = parser.parse_args()
    project = Path(__file__).resolve().parents[1]
    snapshots = project / 'docs' / 'source_snapshots' / 'admin'
    script = project / 'scripts' / 'extract_ovarian_admin.py'
    spec = importlib.util.spec_from_file_location('oncolens_admin_extract', script)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    with tempfile.TemporaryDirectory(prefix='oncolens_admin_') as temporary:
        work = Path(temporary)
        for source in snapshots.iterdir():
            if source.is_file():
                shutil.copy2(source, work / source.name)
        # The original script expects all retained inputs in its ROOT directory.
        module.ROOT = work
        module.main(args.refresh)
        target = project / 'frontend' / 'data' / 'admin.json'
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(work / 'ovarian_admin_real.json', target)
        for source in work.iterdir():
            if source.is_file() and (source.suffix == '.html' or source.name.endswith('.http.json')
                                     or source.name in ['provenance.json', 'sim_2024_request.json']):
                shutil.copy2(source, snapshots / source.name)
        print(f'Validated real aggregates saved to {target}')


if __name__ == '__main__':
    main()
