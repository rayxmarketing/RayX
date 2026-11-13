"""Converte a planilha RayX em dados estáticos usados pelo modo demonstração."""
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1])
MONTH_NAMES = {
    "Junho 2026": "2026-06", "Julho 2026": "2026-07",
    "Agosto 2026": "2026-08", "Setembro 2026": "2026-09",
    "Outubro 2026": "2026-10", "Novembro 2026": "2026-11",
}
NETWORK_NAMES = {"Youtube": "YouTube", "YouTube": "YouTube"}
COMPETITORS = ["Code Automotive", "Cinoy", "ASX", "JR8", "TechOne"]


def number(value):
    if value is None or value in ("", "—", "-"):
        return None
    if isinstance(value, (int, float)):
        return round(value)
    text = str(value).strip().lower().replace(" ", "")
    match = re.fullmatch(r"([0-9]+(?:[.,][0-9]+)?)mil", text)
    if match:
        return round(float(match.group(1).replace(",", ".")) * 1000)
    try:
        return round(float(text.replace(".", "").replace(",", ".")))
    except ValueError:
        return None


def columns(sheet):
    if sheet.title == "Junho 2026":
        return [(index, "Instagram", sheet.cell(1, index).value) for index in range(2, 7)]
    parent = None
    result = []
    for index in range(2, sheet.max_column + 1):
        parent = sheet.cell(1, index).value or parent
        result.append((index, NETWORK_NAMES.get(parent, parent), sheet.cell(2, index).value))
    return result


book = load_workbook(SOURCE, data_only=True)
observations = []
latest = {}
for sheet_name, month in MONTH_NAMES.items():
    sheet = book[sheet_name]
    mapping = columns(sheet)
    current = None
    for row in range(2 if sheet_name == "Junho 2026" else 3, sheet.max_row + 1):
        date = sheet.cell(row, 1).value
        if not isinstance(date, datetime):
            continue
        values = {
            f"{network} · {metric}": number(sheet.cell(row, index).value)
            for index, network, metric in mapping if network and metric
        }
        observations.append({"month": month, "date": date.date().isoformat(), "values": values})
        if any(value is not None for value in values.values()):
            current = (date, values)
    latest[month] = current


def metric(values, network, *names):
    for name in names:
        value = values.get(f"{network} · {name}")
        if value is not None:
            return value
    return None


def posts_for(month):
    month_number = int(month[-2:])
    month_name = ["", "janeiro", "fevereiro", "março", "abril", "maio", "junho",
                  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"][month_number]
    sheet = next((s for s in book if s.title.lower().startswith("métrica de posts") and month_name in s.title.lower()), None)
    if not sheet:
        return []
    platforms = [("Instagram", 6), ("Facebook", 9), ("TikTok", 12), ("YouTube", 15)]
    posts = []
    for row in range(3, sheet.max_row + 1):
        title, kind, posted = sheet.cell(row, 1).value, sheet.cell(row, 2).value, sheet.cell(row, 3).value
        if not title or not isinstance(posted, datetime):
            continue
        candidates = [(number(sheet.cell(row, col).value), network, col) for network, col in platforms]
        candidates = [item for item in candidates if item[0] is not None]
        if not candidates:
            continue
        views, network, col = max(candidates)
        posts.append({
            "id": f"{month}-{row}", "network": network, "date": posted.date().isoformat(),
            "format": str(kind or "Conteúdo").replace("\n", " ").strip(),
            "title": str(title).strip('"'), "url": "", "media": "/automotive.svg",
            "views": views, "likes": number(sheet.cell(row, col + 1).value),
        })
    return posts


months = []
for month in ("2026-08", "2026-09", "2026-10", "2026-11"):
    date, values = latest[month]
    metrics = {}
    for network in ("Facebook", "Instagram", "YouTube", "TikTok"):
        followers = metric(values, network, "Seguidores", "Inscritos")
        if followers is None:
            raise ValueError(f"{month}: fechamento ausente para {network}")
        metrics[network] = {
            "followers": followers,
            "reach": metric(values, network, "Alcance"),
            "views": metric(values, network, "Views"),
            "interactions": metric(values, network, "Interações", "Intereções", "Engajamento"),
            "likes": metric(values, network, "Curtidas"),
            "comments": None, "shares": None, "saves": None,
        }
    is_november = month == "2026-11"
    highlight = {"src": "/destaque-led.png" if is_november else "/automotive.svg",
                 "type": "image", "fit": "cover", "url": ""}
    if is_november:
        highlight.update({"views": 392000, "title": "Qual o LED ideal para o seu veículo?"})
    months.append({
        "month": month, "date": date.date().isoformat(), "complete": not is_november,
        "updatedAt": date.replace(hour=12, tzinfo=timezone.utc).isoformat().replace("+00:00", "Z"),
        "metrics": metrics,
        "competitors": [{"name": name, "profile": "", "date": date.date().isoformat(),
                         "followers": {network: None for network in ("Facebook", "Instagram", "YouTube", "TikTok")}}
                        for name in COMPETITORS],
        "posts": posts_for(month), "highlight": highlight,
    })

data = {"logo": "/rayx-logo.png", "source": "spreadsheet", "months": months}
(ROOT / "lib/imported-data.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
(ROOT / "lib/observations.json").write_text(json.dumps(observations, ensure_ascii=False, indent=2) + "\n")
print(f"Importados {len(months)} meses, {len(observations)} registros e {sum(len(m['posts']) for m in months)} posts")
