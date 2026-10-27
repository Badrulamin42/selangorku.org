"""Snapshot factual project sections from selangorku.org for local detail pages.

Requires requests and beautifulsoup4. Run manually when the source pages change.
The Next.js site reads the generated JSON and never fetches these pages at runtime.
"""

from __future__ import annotations

import concurrent.futures
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "lib" / "projects.ts"
OUTPUT = ROOT / "lib" / "project-content.json"
UPLOADS = "https://selangorku.org/wp-content/uploads/"

STOP = re.compile(
    r"Perbandingan Rumah|Proses Permohonan|Daftar Sekarang|Borang Pendaftaran|"
    r"Soalan Lazim|Jangan Tunggu|Miliki Rumah Idaman|Sokongan Pembiayaan|"
    r"Hubungi Kami|Pilihan Projek Lain",
    re.I,
)
IGNORE_IMAGE = re.compile(
    r"logo|icon|sistem-pendaftaran|768x768|fbpx|facebook|"
    r"(?:^|/)(?:[2-9]|1[01])(?:-1)?\.webp$",
    re.I,
)
IGNORE_ITEM = re.compile(
    r"^(?:Konsep|Lokasi|Pelan Lantai|Kemudahan|Kelayakan|Cara Mohon|Pendaftaran|"
    r"baca lagi\.{0,3}|MOHON SEKARANG|LAWAT RUMAH CONTOH|Lihat Google Map)$",
    re.I,
)
FACT_LABELS = (
    "Jumlah Unit Per Blok", "Ketinggian Parking", "Tempat Letak Kereta",
    "Pegangan Tanah", "Jumlah Unit", "Jumlah Blok", "Jumlah Fasa", "Parking", "Ketinggian",
    "Jumlah Lif", "Milikan", "Pemilikan", "Jenis", "Tanah", "Title",
    "Tahun Bina", "Tahun Siap",
)


def clean(value: str) -> str:
    value = re.sub(r"\s+", " ", value.replace("\ufffd", "")).strip(" \t\r\n–—|:")
    value = re.sub(r"\brm(?=\s?\d)", "RM", value, flags=re.I)
    return re.sub(r"(?<=\d)(?=Bilik\b)", " ", value)


def category(title: str) -> str:
    title = title.lower()
    if re.search(r"pelan lantai|susun atur|layout|reka bentuk|spesifikasi|details? |perihal rumah|maklumat rumah", title):
        return "layout"
    if re.search(r"syarat permohonan|kelayakan", title):
        return "eligibility"
    if re.search(r"pakej|perabot|percuma|deposit", title):
        return "package"
    if re.search(r"fasiliti|kemudahan|rekreasi|institusi pendidikan|pusat membeli", title):
        return "amenities"
    if re.search(r"lokasi|strategik|akses|perhubungan|kawasan|kejiranan", title):
        return "location"
    return "overview"


def image_url(node) -> str | None:
    url = node.get("data-src") or node.get("data-lazy-src") or node.get("src") or ""
    if not url.startswith(UPLOADS) or IGNORE_IMAGE.search(urlparse(url).path.lower()):
        return None
    return url


def fact(value: str):
    for label in FACT_LABELS:
        if re.match(re.escape(label) + r"(?:\s|:)", value, re.I):
            result = clean(value[len(label) :])
            if result and len(result) <= 48:
                if result.upper() == "LEASHOLD":
                    result = "Leasehold"
                elif result.upper() == "FREEHOLD":
                    result = "Freehold"
                else:
                    result = re.sub(r"\bBUAH\b", "unit", result, flags=re.I)
                    result = re.sub(r"\bBLOK\b", "blok", result, flags=re.I)
                    result = re.sub(r"\bTINGKAT\b", "tingkat", result, flags=re.I)
                    if result.isupper():
                        result = result.title()
                return {"label": label, "value": result}
    return None


def snapshot(slug: str):
    url = f"https://selangorku.org/{slug}/"
    response = requests.get(url, timeout=25, headers={"User-Agent": "Mozilla/5.0"})
    response.raise_for_status()
    response.encoding = "utf-8"
    soup = BeautifulSoup(response.text, "html.parser")
    h1 = soup.find("h1")
    if not h1:
        raise ValueError(f"No page title at {url}")

    source_title = clean(h1.get_text(" ", strip=True))
    sections = []
    overview = {"category": "overview", "title": "Ringkasan projek", "items": [], "images": []}
    current = overview
    sections.append(current)
    facts = []
    seen_facts = set()
    images = []
    seen_images = set()
    project_form = None

    for form in soup.find_all("form"):
        form_id = form.get("data-form_id", "")
        if "frm-fluent-form" not in form.get("class", []) or not form_id.isdigit() or form_id == "4":
            continue
        fields = []
        for group in form.select(".ff-el-group"):
            controls = [node for node in group.find_all(["input", "select", "textarea"]) if node.get("name")]
            if not controls:
                continue
            first = controls[0]
            name = first.get("name", "")
            label_node = next((node for node in group.find_all("label") if "ff-el-form-check-label" not in node.get("class", [])), None)
            label = clean(label_node.get_text(" ", strip=True)) if label_node else name
            options = list(dict.fromkeys(clean(node.get("value", "")) for node in controls if node.get("type") in ("radio", "checkbox")))
            options = [option for option in options if option]
            field_type = first.get("type") or first.name
            if field_type not in ("text", "tel", "number", "radio", "checkbox"):
                continue
            fields.append({
                "name": name,
                "label": re.sub(r"^\d+(?:\.\d+)?\.?\s*", "", label),
                "type": field_type,
                "required": first.get("aria-required") == "true",
                "options": options,
            })
        if fields:
            project_form = {"id": form_id, "fields": fields}
        break

    # Some Elementor pages place the development statistics before the H1.
    for node in reversed(h1.find_all_previous("p", limit=18)):
        entry = fact(clean(node.get_text(" ", strip=True)))
        if entry and entry["label"] not in seen_facts:
            facts.append(entry)
            seen_facts.add(entry["label"])

    for node in h1.find_all_next(["h2", "h3", "h4", "h5", "h6", "p", "li", "img"]):
        if node.name.startswith("h"):
            title = clean(node.get_text(" ", strip=True))
            if STOP.search(title):
                break
            if not title or "Sistem Pendaftaran Permohonan" in title:
                continue
            current = {"category": category(title), "title": title, "items": [], "images": []}
            sections.append(current)
            continue

        if node.name == "img":
            url = image_url(node)
            if url and url not in seen_images:
                seen_images.add(url)
                images.append(url)
                if len(current["images"]) < 3:
                    current["images"].append(url)
            continue

        if node.name == "p" and node.find_parent("li"):
            continue
        value = clean(node.get_text(" ", strip=True))
        if not value or IGNORE_ITEM.fullmatch(value) or re.search(r"^Senarai kemudahan\b|^dan (?:lain-lain|banyak lagi)\.?$", value, re.I):
            continue
        entry = fact(value)
        if entry and entry["label"] not in seen_facts:
            facts.append(entry)
            seen_facts.add(entry["label"])
        if entry or re.search(r"^(?:KELUASAN|\d+\s*BILIK TIDUR|HARGA\b)", value, re.I):
            continue
        # Keep concise factual points, rather than copying long marketing copy.
        if len(value) > 105 or len(value) < 4:
            continue
        if node.name == "p" and not re.search(r"\d|\b(?:Freehold|Leasehold|Balkoni|Yard|Stesen|Sekolah|Taman|Surau|Gimnasium|Perabot)\b", value, re.I):
            continue
        if value not in current["items"] and len(current["items"]) < 18:
            current["items"].append(value)

    # Relevant, non-empty source sections. Avoid duplicate comparison cards and boilerplate.
    sections = [
        section for section in sections
        if (section["items"] or section["images"])
        and not re.search(r"^Sistem Pendaftaran|^Kelayakan & Pakej$", section["title"], re.I)
    ]
    return slug, {
        "sourceTitle": source_title,
        "facts": facts[:12],
        "sections": sections[:16],
        "gallery": images[:8],
        "form": project_form,
    }


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    slugs = re.findall(r'href: "https://selangorku.org/([^/]+)/"', SOURCE.read_text(encoding="utf-8"))
    if len(slugs) != len(set(slugs)):
        raise ValueError("Duplicate project slug in lib/projects.ts")
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        results = dict(pool.map(snapshot, slugs))
    OUTPUT.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for slug in slugs:
        item = results[slug]
        print(f"{slug}: {len(item['facts'])} facts, {len(item['sections'])} sections, {len(item['gallery'])} images")
    print(f"Saved {len(results)} projects to {OUTPUT}")


if __name__ == "__main__":
    main()
