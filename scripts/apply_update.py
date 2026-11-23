"""Aplica as medições confirmadas que complementam a planilha RayX."""
import copy
import json
from pathlib import Path
from unicodedata import normalize


LIB = Path(__file__).resolve().parents[1] / 'lib'
TOTALS = {
    'allTimePostViews': 'totalViews',
    'allTimePostLikes': 'totalLikes',
    'allTimePostComments': 'totalComments',
}


def snapshot(filename):
    return json.loads((LIB / filename).read_text())


def merge_observation(observations, incoming):
    row = next((r for r in observations if r['date'] == incoming['date']), None)
    if row is None:
        observations.append(copy.deepcopy(incoming))
    else:
        row['values'].update(incoming['values'])


def post_identity(post):
    title = normalize('NFKC', post['title']).casefold()
    return post['date'], ' '.join(title.split())


def matching_post(posts, post):
    identity = post_identity(post)
    return next((p for p in posts if post_identity(p) == identity), None)


def upsert_post(posts, post, existing):
    if existing is None:
        incoming = copy.deepcopy(post)
        if any(p['id'] == incoming['id'] for p in posts):
            incoming['id'] += '-confirmado'
        posts.append(incoming)
    else:
        existing.update({key: copy.deepcopy(value) for key, value in post.items() if key != 'id'})


def apply_update(data, observations):
    previous = snapshot('update-2026-11-16.json')
    posts_update = snapshot('update-posts-2026-11-17.json')
    current = snapshot('update-2026-11-18.json')
    latest = snapshot('update-2026-11-20.json')
    competitor_update = snapshot('competitors-2026-11-23.json')
    month = next(m for m in data['months'] if m['month'] == '2026-11')
    original_date = month['date']
    target_date = current['referenceDate']

    merge_observation(observations, previous['observation'])
    for row in current['observations'] + latest['observations']:
        merge_observation(observations, row)
    observations.sort(key=lambda r: r['date'])

    if original_date <= previous['referenceDate']:
        for network, metrics in previous['metrics'].items():
            month['metrics'][network].update(metrics)
        data.update(posts_update['historical'])

    for post in posts_update['posts']:
        existing = matching_post(month['posts'], post)
        if existing is None or original_date <= previous['referenceDate']:
            upsert_post(month['posts'], post, existing)
            if original_date > previous['referenceDate']:
                for total, field in TOTALS.items():
                    data[total] += post[field]

    # These values are external to the workbook's network and post measurements.
    month['highlight'] = copy.deepcopy(previous['highlight'])
    month['competitors'] = competitor_update['competitors']

    if original_date <= target_date:
        month.update(date=target_date, updatedAt=f'{target_date}T12:00:00Z')
        for network, metrics in current['metrics'].items():
            month['metrics'][network].update(metrics)

    post = current['post']
    existing = matching_post(month['posts'], post)
    if original_date <= target_date or existing is None:
        for total, field in TOTALS.items():
            # The published 17/11 totals already exclude this post.
            before = (existing.get(field) or 0) if existing and original_date > previous['referenceDate'] else 0
            data[total] += post[field] - before
        upsert_post(month['posts'], post, existing)

    if original_date <= latest['referenceDate']:
        date = latest['referenceDate']
        month.update(date=date, updatedAt=f'{date}T12:00:00Z')
        for network, metrics in latest['metrics'].items():
            month['metrics'][network].update(metrics)

    for post in latest['posts']:
        existing = matching_post(month['posts'], post)
        if existing is None or original_date <= latest['referenceDate']:
            for total, field in TOTALS.items():
                before = (existing.get(field) or 0) if existing else 0
                data[total] += post[field] - before
            upsert_post(month['posts'], post, existing)
