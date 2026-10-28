#!/usr/bin/env python3
"""Generate sitemap.xml for https://iamyours.github.io.

The site has no build step, so this script is the reproducible source of the
sitemap. It scans:

  * the fixed top-level pages and section indexes,
  * every 3d/<scene>/ directory that actually contains an index.html,
  * /3d/notes/ and /3d/notes/<scene-id>/ for every scene in 3d/catalog.js.

Run from anywhere:

    python3 tools/gen_sitemap.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://iamyours.github.io"
LASTMOD = "2026-10-28"

FIXED_PATHS = [
    "/",
    "/koi/",
    "/3d/",
    "/3d/compare/",
    "/3d/collection/",
    "/about/",
    "/contact/",
    "/privacy/",
    "/terms/",
]

# Directories under 3d/ that are sections or infrastructure, not scenes.
NON_SCENE_DIRS = {"compare", "collection", "notes"}


def load_scene_ids() -> list[str]:
    """Read window.GALLERY_CATEGORIES from catalog.js with a JSON decoder."""
    catalog = ROOT / "3d" / "catalog.js"
    text = catalog.read_text(encoding="utf-8")
    match = re.search(r"window\.GALLERY_CATEGORIES\s*=\s*", text)
    if not match:
        raise SystemExit("Could not find window.GALLERY_CATEGORIES in 3d/catalog.js")
    start = text.find("[", match.end())
    if start == -1:
        raise SystemExit("Could not find the GALLERY_CATEGORIES array")
    try:
        categories, _ = json.JSONDecoder().raw_decode(text[start:])
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Could not parse 3d/catalog.js: {exc}") from exc

    ids: list[str] = []
    seen: set[str] = set()
    for category in categories:
        for scene in category.get("scenes", []):
            scene_id = scene.get("id")
            if not scene_id or scene_id in seen:
                continue
            seen.add(scene_id)
            ids.append(scene_id)
    return sorted(ids)


def scene_directories() -> list[str]:
    """Every 3d/<dir> with an index.html, excluding section directories."""
    three_d = ROOT / "3d"
    dirs = []
    for index in three_d.glob("*/index.html"):
        name = index.parent.name
        if index.parent == three_d or name in NON_SCENE_DIRS:
            continue
        dirs.append(name)
    return sorted(dirs)


def build_paths() -> list[str]:
    paths = list(FIXED_PATHS)
    paths.extend(f"/3d/{name}/" for name in scene_directories())
    paths.extend(f"/3d/notes/{scene_id}/" for scene_id in load_scene_ids())
    paths.append("/3d/notes/")
    # Keep the specified order for the fixed section indexes, then let the
    # scene and note paths stay sorted. De-duplicate while preserving order.
    result: list[str] = []
    seen: set[str] = set()
    for path in paths:
        if path not in seen:
            seen.add(path)
            result.append(path)
    return result


def render(paths: list[str]) -> str:
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for path in paths:
        loc = BASE_URL + path
        lines.extend(
            [
                "  <url>",
                f"    <loc>{escape(loc)}</loc>",
                f"    <lastmod>{LASTMOD}</lastmod>",
                "  </url>",
            ]
        )
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def main() -> None:
    paths = build_paths()
    output = ROOT / "sitemap.xml"
    output.write_text(render(paths), encoding="utf-8")
    print(f"Wrote {output} with {len(paths)} URLs")


if __name__ == "__main__":
    main()
