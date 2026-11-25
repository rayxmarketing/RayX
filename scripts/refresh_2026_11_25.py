"""Atualização de 25/11: capturas RayX e histórico dos concorrentes."""
import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIB = ROOT / 'lib'

def read(name):
    return json.loads((LIB / name).read_text())

def write(name, value):
    (LIB / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

data = read('baseline-before-2026-11-25.json')
month = data['months'][-1]
values = {
    'Instagram': dict(views=253100, reach=37300, interactions=8300, visits=7000, followers=1483),
    'Facebook': dict(views=1733240, interactions=37559, followers=12649),
    'TikTok': dict(views=94100, profileViews=1300, interactions=1372, likes=1688, followers=759),
    'YouTube': dict(views=334138, watchTime48h=316, watchTime=4600, followers=1396),
}
for network, metrics in values.items():
    month['metrics'][network].update(metrics)

post = dict(id='2026-11-max-gta-vi', network='Instagram', date='2026-11-18', measuredAt='2026-11-25',
            format='Post temático', title='Max GTA VI', url='', media='/automotive.svg',
            views=1062, likes=17, totalViews=1300, totalLikes=20, totalComments=0,
            networkMetrics={'Instagram': dict(reach=697, views=1062, likes=17, comments=0),
                            'Facebook': dict(views=238, likes=3, comments=0)})
month['posts'].append(post)
for field, addition in [('allTimePostViews',1300), ('allTimePostLikes',20)]:
    data[field] += addition

rows = json.loads((ROOT / 'scripts/competitor-source-2026-11-25.json').read_text())
history = [read(name) for name in ['update-2026-11-16.json','update-2026-11-18.json','competitors-2026-11-23.json','competitors-2026-11-24-restored.json']]
for competitor in month['competitors']:
    dates = competitor.setdefault('followerDates', {})
    for index, network in enumerate(['Instagram','Facebook','TikTok','YouTube'], 3):
        saved = json.loads((ROOT / 'scripts/competitor-positive-history.json').read_text()).get(competitor['name'], {}).get(network, {})
        last = saved.get('value')
        last_date = saved.get('date')
        for snapshot in history:
            old = next((c for c in snapshot['competitors'] if c['name']==competitor['name']), None)
            if old and (old['followers'][network] or 0)>0:
                last = old['followers'][network]
                last_date = old.get('followerDates', {}).get(network, old['date'])
        for row in rows[1:]:
            if row[2] != competitor['name']:
                continue
            raw = row[index]
            value = int(raw) if raw.isdigit() else None
            if value is not None and value>0:
                last, last_date = value, row[0]
            elif last is None:
                last, last_date = value, row[0]
        competitor['followers'][network] = last
        dates[network] = last_date
    competitor['date'] = '2026-11-25'
    counts = list(competitor['followers'].values())
    competitor['total'] = sum(counts) if all(v is not None for v in counts) else None
write('imported-data.json', data)

observations = read('observations.json')
update = read('update-2026-11-25.json')
for date, source in [('2026-11-23',update['observations'][0]), ('2026-11-24',update['observations'][1])]:
    target = next(row for row in observations if row['date']==date)
    target['values'] = copy.deepcopy(source['values'])
    if date=='2026-11-24':
        target['values']['Facebook · Seguidores'] = 12896
target = next(row for row in observations if row['date']=='2026-11-25')
labels = dict(views='Views', reach='Alcance', interactions='Interações', visits='Visitas', followers='Seguidores', profileViews='Views Perfil', likes='Curtidas', watchTime48h='Tempo 48h', watchTime='Tempo')
for network, metrics in values.items():
    for key, value in metrics.items():
        label = 'Engajamento' if network=='Facebook' and key=='interactions' else 'Inscritos' if network=='YouTube' and key=='followers' else labels[key]
        target['values'][f'{network} · {label}'] = value
write('observations.json', observations)
