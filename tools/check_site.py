#!/usr/bin/env python3
"""Lightweight checks for the hand-written HTML pages and i18n dictionaries.

Checks:
  * required <title>, meta description, viewport, and canonical on new pages;
  * balanced HTML tags for the new/modified pages;
  * every data-i18n / data-i18n-html / data-i18n-attr key used by those pages
    exists in BOTH the zh and en dictionary for that page;
  * keys referenced from prompt-panel.js and footer.js exist as well.

Run: python3 tools/check_site.py
"""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

VOID = {
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
    "meta", "param", "source", "track", "wbr",
}

NEW_PAGES = {
    "about/index.html": "https://iamyours.github.io/about/",
    "contact/index.html": "https://iamyours.github.io/contact/",
    "privacy/index.html": "https://iamyours.github.io/privacy/",
    "terms/index.html": "https://iamyours.github.io/terms/",
}

THREE_D_PAGES = [
    "3d/index.html",
    "3d/compare/index.html",
    "3d/collection/index.html",
]

SITE_DICTS = ["site/i18n/zh.js", "site/i18n/en.js"]
THREE_D_DICTS = ["3d/i18n/zh.js", "3d/i18n/en.js"]


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[tuple[str, int]] = []
        self.errors: list[str] = []
        self.keys: set[str] = set()
        self.title = ""
        self.in_title = False
        self.meta_description = ""
        self.meta_viewport = False
        self.canonical = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = {name.lower(): (value or "") for name, value in attrs}

        for name in ("data-i18n", "data-i18n-html"):
            if name in attrs_dict and attrs_dict[name].strip():
                self.keys.add(attrs_dict[name].strip())
        if "data-i18n-attr" in attrs_dict:
            for pair in attrs_dict["data-i18n-attr"].split(";"):
                pair = pair.strip()
                if ":" in pair:
                    _, key = pair.split(":", 1)
                    if key.strip():
                        self.keys.add(key.strip())

        if tag == "title":
            self.in_title = True
        elif tag == "meta":
            if attrs_dict.get("name", "").lower() == "description":
                self.meta_description = attrs_dict.get("content", "")
            if attrs_dict.get("name", "").lower() == "viewport":
                self.meta_viewport = True
        elif tag == "link" and attrs_dict.get("rel", "").lower() == "canonical":
            self.canonical = attrs_dict.get("href", "")

        if tag not in VOID:
            self.stack.append((tag, self.getpos()[0]))

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        # Self-closing tags do not change the stack.
        self.handle_starttag(tag, attrs)
        if tag not in VOID and self.stack and self.stack[-1][0] == tag:
            self.stack.pop()

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False
        if tag in VOID:
            return
        if not self.stack:
            self.errors.append(f"line {self.getpos()[0]}: unexpected </{tag}>")
            return
        open_tag, line = self.stack[-1]
        if open_tag != tag:
            self.errors.append(
                f"line {self.getpos()[0]}: </{tag}> does not match <{open_tag}> opened on line {line}"
            )
            # Try to recover for a useful report.
            for index in range(len(self.stack) - 1, -1, -1):
                if self.stack[index][0] == tag:
                    del self.stack[index:]
                    return
            return
        self.stack.pop()

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title += data


def parse_dict(path: Path) -> set[str]:
    text = path.read_text(encoding="utf-8")
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError(f"No object literal found in {path}")
    data = json.loads(text[start : end + 1])
    return set(data.keys())


def check_page(path: Path, expected_canonical: str | None) -> list[str]:
    errors: list[str] = []
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    parser.close()

    if parser.stack:
        opened = ", ".join(f"<{tag}> line {line}" for tag, line in parser.stack)
        errors.append(f"unclosed tags: {opened}")
    errors.extend(parser.errors)

    if expected_canonical is not None:
        if not parser.title.strip():
            errors.append("missing or empty <title>")
        if not parser.meta_description.strip():
            errors.append("missing meta description")
        if not parser.meta_viewport:
            errors.append("missing meta viewport")
        if parser.canonical != expected_canonical:
            errors.append(
                f"canonical is {parser.canonical!r}, expected {expected_canonical!r}"
            )
    return errors


def main() -> int:
    errors: list[str] = []
    site_keys = {dict_path: parse_dict(ROOT / dict_path) for dict_path in SITE_DICTS}
    three_d_keys = {dict_path: parse_dict(ROOT / dict_path) for dict_path in THREE_D_DICTS}

    parsed_pages: dict[str, PageParser] = {}
    for rel, canonical in NEW_PAGES.items():
        path = ROOT / rel
        page_errors = check_page(path, canonical)
        for message in page_errors:
            errors.append(f"{rel}: {message}")

        parser = PageParser()
        parser.feed(path.read_text(encoding="utf-8"))
        parsed_pages[rel] = parser

        for dict_path, keys in site_keys.items():
            missing = sorted(parser.keys - keys)
            if missing:
                errors.append(f"{rel}: missing from {dict_path}: {', '.join(missing)}")

    for rel in THREE_D_PAGES:
        path = ROOT / rel
        page_errors = check_page(path, None)
        for message in page_errors:
            errors.append(f"{rel}: {message}")

        parser = PageParser()
        parser.feed(path.read_text(encoding="utf-8"))
        parsed_pages[rel] = parser

        for dict_path, keys in three_d_keys.items():
            missing = sorted(parser.keys - keys)
            if missing:
                errors.append(f"{rel}: missing from {dict_path}: {', '.join(missing)}")

    # The prompt panel's inline link row.
    panel = (ROOT / "3d/prompt-panel.js").read_text(encoding="utf-8")
    panel_keys = set(re.findall(r"tr\('([^']+)'", panel))
    panel_keys.update(re.findall(r"key:\s*'([^']+)'", panel))
    for dict_path, keys in three_d_keys.items():
        missing = sorted(panel_keys - keys)
        if missing:
            errors.append(f"3d/prompt-panel.js: missing from {dict_path}: {', '.join(missing)}")

    # footer.js is used for dynamically mounted footers and must agree with
    # the footer keys already present in both dictionary families.
    footer = (ROOT / "site/footer.js").read_text(encoding="utf-8")
    footer_keys = set(re.findall(r"'(footer\.[a-z]+)'", footer))
    for dict_path, keys in list(site_keys.items()) + list(three_d_keys.items()):
        missing = sorted(footer_keys - keys)
        if missing:
            errors.append(f"site/footer.js: missing from {dict_path}: {', '.join(missing)}")

    total_keys = sum(len(page.keys) for page in parsed_pages.values())
    print(f"Checked {len(parsed_pages)} pages and {total_keys} i18n key uses.")
    print(f"site/i18n: {len(site_keys[SITE_DICTS[0]])} zh keys, {len(site_keys[SITE_DICTS[1]])} en keys")
    print(f"3d/i18n:   {len(three_d_keys[THREE_D_DICTS[0]])} zh keys, {len(three_d_keys[THREE_D_DICTS[1]])} en keys")

    if errors:
        print("\nFAILED:")
        for error in errors:
            print("  -", error)
        return 1

    print("OK: tags are balanced and all used i18n keys exist in zh and en.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
