"""Copy referenced WordPress project images into public/project-images.

Run after changing the project catalog or source-content snapshot. The page and
form URLs are intentionally left alone; only image URLs are made local.
Requires requests and Pillow.
"""

from __future__ import annotations

import concurrent.futures
import json
import re
from io import BytesIO
from pathlib import Path
from urllib.parse import unquote, urlparse

import requests
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "lib" / "project-content.json"
CATALOG = ROOT / "lib" / "projects.ts"
HOME = ROOT / "components" / "home-page.tsx"
REMOTE = "https://selangorku.org/wp-content/uploads/"
LOCAL = "/project-images/"
IMAGE_URL = re.compile(re.escape(REMOTE) + r"[^\s\"'<>`]+")
CATALOG_IMAGE = re.compile(r"\$\{uploads\}(/[^`]+)")


def image_path(url: str) -> Path:
    relative = unquote(urlparse(url).path.removeprefix("/wp-content/uploads/"))
    parts = Path(relative).parts
    if not parts or ".." in parts or Path(relative).is_absolute():
        raise ValueError(f"Unsafe image path: {url}")
    return ROOT / "public" / "project-images" / Path(*parts)


def download(url: str) -> tuple[str, int]:
    destination = image_path(url)
    if destination.is_file():
        with Image.open(destination) as existing:
            existing.verify()
        return url, destination.stat().st_size

    failure = None
    for _ in range(3):
        try:
            response = requests.get(url, timeout=45, headers={"User-Agent": "Mozilla/5.0"})
            response.raise_for_status()
            data = response.content
            with Image.open(BytesIO(data)) as candidate:
                candidate.verify()
            destination.parent.mkdir(parents=True, exist_ok=True)
            temporary = destination.with_name(destination.name + ".download")
            temporary.write_bytes(data)
            temporary.replace(destination)
            return url, len(data)
        except (OSError, requests.RequestException, ValueError) as error:
            failure = error
    raise RuntimeError(f"Could not mirror {url}: {failure}")


def mirror_urls(urls: set[str]) -> None:
    print(f"Checking {len(urls)} unique project images...", flush=True)
    failures = []
    total_bytes = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(download, url): url for url in sorted(urls)}
        for index, future in enumerate(concurrent.futures.as_completed(futures), 1):
            try:
                _, size = future.result()
                total_bytes += size
            except RuntimeError as error:
                failures.append(str(error))
            if index % 25 == 0 or index == len(futures):
                print(f"Checked {index}/{len(futures)} images", flush=True)
    if failures:
        raise RuntimeError("Image references were not changed:\n" + "\n".join(failures))
    print(f"Verified {len(urls)} images ({total_bytes / 1048576:.1f} MiB total).", flush=True)


def localize_content(content: dict) -> dict:
    """Download image URLs in a freshly scraped snapshot and return local paths."""
    serialized = json.dumps(content, ensure_ascii=False)
    urls = set(IMAGE_URL.findall(serialized))
    mirror_urls(urls)
    return json.loads(serialized.replace(REMOTE, LOCAL))


def main() -> None:
    catalog = CATALOG.read_text(encoding="utf-8")
    home = HOME.read_text(encoding="utf-8")
    content = CONTENT.read_text(encoding="utf-8")
    urls = set(IMAGE_URL.findall(content)) | set(IMAGE_URL.findall(home))
    urls.update(REMOTE + suffix.lstrip("/") for suffix in CATALOG_IMAGE.findall(catalog))
    mirror_urls(urls)

    CONTENT.write_text(content.replace(REMOTE, LOCAL), encoding="utf-8")
    HOME.write_text(home.replace(REMOTE, LOCAL), encoding="utf-8")
    CATALOG.write_text(catalog.replace('const uploads = "https://selangorku.org/wp-content/uploads";',
                                       'const uploads = "/project-images";'), encoding="utf-8")
    print("Project image references now use /project-images/.", flush=True)


if __name__ == "__main__":
    main()
