"""Aplica a atualização confirmada de 16/11 sem duplicar totais históricos."""
import copy
import json
from pathlib import Path


def apply_update(data, observations):
    snapshot = json.loads((Path(__file__).resolve().parents[1] / 'lib/update-2026-11-16.json').read_text())
    month = next(m for m in data['months'] if m['month'] == '2026-11')
    # Importações futuras não devem regredir para este fechamento parcial.
    if month['date'] > snapshot['referenceDate']:
        return
    month.update(date=snapshot['referenceDate'], updatedAt='2026-11-16T12:00:00Z')
    for field in ('metrics', 'highlight', 'competitors'):
        month[field] = copy.deepcopy(snapshot[field])
    data.update(snapshot['historical'])
    row = next((r for r in observations if r['date'] == snapshot['referenceDate']), None)
    if row is None:
        observations.append(copy.deepcopy(snapshot['observation']))
        observations.sort(key=lambda r: r['date'])
    else:
        row.update(copy.deepcopy(snapshot['observation']))
