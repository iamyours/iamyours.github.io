#!/usr/bin/env python3
"""Generate the crawlable scene-notes pages under /3d/notes/.

Inputs (all in the repo, no third-party packages):

  * 3d/catalog.js          - categories, scenes, model metadata
  * 3d/prompts/*.txt       - the prompts, shown verbatim
  * 3d/<id><suffix>/index.html - live scene sources (size, lines, technique detection)
  * 3d/thumbs/*.jpg        - thumbnails
  * tools/notes_text.json  - hand-written zh/en intro + comparison notes

Outputs:

  * 3d/notes/index.html
  * 3d/notes/<id>/index.html for every scene in catalog.js
  * 3d/notes/i18n/zh.js and 3d/notes/i18n/en.js

The pages load /3d/i18n/i18n.js plus the existing /3d/i18n/{zh,en}.js
dictionaries and the notes dictionaries generated here.  All Chinese text is
also present literally in the HTML so it is crawlable without JavaScript.

Run from anywhere:

    python3 tools/gen_notes.py
"""

from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
THREE_D = ROOT / "3d"
OUT = THREE_D / "notes"
TEXT_PATH = ROOT / "tools" / "notes_text.json"
BASE_URL = "https://iamyours.github.io"

# ---------------------------------------------------------------------------
# Catalog parsing (catalog.js is generated JS with plain JSON literals)
# ---------------------------------------------------------------------------


def _decode_assignment(text: str, marker: str):
    match = re.search(re.escape(marker) + r"\s*=\s*", text)
    if not match:
        raise SystemExit(f"Could not find {marker} in 3d/catalog.js")
    start = match.end()
    while start < len(text) and text[start].isspace():
        start += 1
    if start >= len(text) or text[start] not in "[{":
        raise SystemExit(f"Could not find an object or array assigned to {marker}")
    try:
        value, _ = json.JSONDecoder().raw_decode(text[start:])
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Could not parse {marker}: {exc}") from exc
    return value


def load_catalog():
    text = (THREE_D / "catalog.js").read_text(encoding="utf-8")
    models = _decode_assignment(text, "window.GALLERY_MODELS")
    order = _decode_assignment(text, "window.GALLERY_MODEL_ORDER")
    categories = _decode_assignment(text, "window.GALLERY_CATEGORIES")
    return models, order, categories


def iter_scenes(categories):
    for category in categories:
        for scene in category.get("scenes", []):
            yield category, scene


def scene_versions(scene, models, order):
    """Return available model versions in the gallery's display order."""
    available = []
    for key in order:
        if key not in models:
            continue
        if key not in (scene.get("models") or []):
            continue
        suffix = models[key].get("suffix", "")
        scene_dir = THREE_D / f"{scene['id']}{suffix}"
        index = scene_dir / "index.html"
        prompt = THREE_D / "prompts" / f"{scene['id']}{suffix}.txt"
        if index.is_file():
            available.append(
                {
                    "key": key,
                    "model": models[key],
                    "suffix": suffix,
                    "dir": scene_dir,
                    "index": index,
                    "prompt": prompt,
                    "size_kb": index.stat().st_size / 1024.0,
                    "lines": count_lines(index.read_text(encoding="utf-8")),
                    "techniques": detect_techniques(index.read_text(encoding="utf-8")),
                }
            )
    return available


def count_lines(text: str) -> int:
    if not text:
        return 0
    return text.count("\n") + (0 if text.endswith("\n") else 1)


# ---------------------------------------------------------------------------
# Technique detection
# ---------------------------------------------------------------------------

# (label, regex, flags).  The labels are deliberately terse; they are read by
# both Chinese and English readers as the underlying three.js/Web API names.
TECHNIQUE_PATTERNS = [
    ("OrbitControls", r"\bOrbitControls\b", 0),
    ("Shadow maps", r"shadowMap|castShadow|receiveShadow", 0),
    ("InstancedMesh", r"\bInstancedMesh\b", 0),
    ("ShaderMaterial / GLSL", r"\bShaderMaterial\b|fragmentShader|vertexShader|gl_FragColor", 0),
    ("Post-processing / bloom", r"EffectComposer|UnrealBloomPass|new RenderPass|ShaderPass", 0),
    ("Raycast interaction", r"\bRaycaster\b|raycast", re.I),
    ("Particles / points", r"PointsMaterial|new THREE\.Points\b|particleGeo|particles\b", re.I),
    ("Sky / fog", r"\bFogExp2\b|\bFog\b|\bSky\b", 0),
    ("Water / reflections", r"\bReflector\b|waterShader|\bWater\b|reflection", re.I),
    ("CSS2D labels", r"CSS2D", 0),
    ("GUI controls", r"lil-gui|dat\.GUI|new GUI\(", 0),
    ("Web Audio", r"AudioContext|AudioListener|THREE\.Audio", 0),
    ("Keyboard controls", r"keydown|keyup", 0),
    ("Pointer lock", r"requestPointerLock|PointerLockControls", 0),
    ("Physics / buoyancy", r"CANNON|Rapier|Ammo|buoyancy|浮力|physics", re.I),
]


def detect_techniques(source: str) -> list[str]:
    found = []
    for label, pattern, flags in TECHNIQUE_PATTERNS:
        if re.search(pattern, source, flags):
            found.append(label)
    return found


# ---------------------------------------------------------------------------
# Prompt handling
# ---------------------------------------------------------------------------


def prompt_signature(text: str) -> str:
    """Normalise only the generated-site metadata, not the scene description.

    Prompt files for the same scene differ by the ``data-id`` value and, for
    the CLI/API runs, by one sentence about how the HTML should be returned.
    Those lines are generated per run, so they are ignored when deciding
    whether a prompt variant is materially different.
    """
    lines = []
    for line in text.splitlines():
        if "data-id=" in line:
            continue
        if line.startswith("- 输出一个可直接") or line.startswith("- 直接输出一个可在现代浏览器"):
            continue
        lines.append(line.rstrip())
    return "\n".join(lines).strip()


def load_prompts(versions, scene_id: str):
    """Return (base_prompt, base_file, variant_groups).

    The base prompt is ``prompts/<id>.txt`` when present, otherwise the prompt
    of the first available version.  Variants are only reported when their
    text differs after normalising the generated metadata lines.
    """
    if not versions:
        return "", "", []
    base_file = THREE_D / "prompts" / f"{scene_id}.txt"
    if not base_file.is_file():
        base_file = versions[0]["prompt"]
    base_text = base_file.read_text(encoding="utf-8")

    groups: dict[str, list[dict]] = {}
    for version in versions:
        text = version["prompt"].read_text(encoding="utf-8")
        version["prompt_text"] = text
        groups.setdefault(prompt_signature(text), []).append(version)

    base_sig = prompt_signature(base_text)
    variants = []
    for sig, group in groups.items():
        if sig == base_sig:
            continue
        variants.append(group)
    return base_text, base_file, variants


# ---------------------------------------------------------------------------
# Text dictionary
# ---------------------------------------------------------------------------


def load_text(categories):
    if not TEXT_PATH.is_file():
        raise SystemExit(f"Missing {TEXT_PATH}")
    data = json.loads(TEXT_PATH.read_text(encoding="utf-8"))
    errors = []
    ids = {scene["id"] for _, scene in iter_scenes(categories)}
    for scene_id in sorted(ids):
        entry = data.get(scene_id)
        if not isinstance(entry, dict):
            errors.append(f"{scene_id}: missing entry")
            continue
        for field in ("intro", "comparison"):
            for lang in ("zh", "en"):
                value = (entry.get(field) or {}).get(lang)
                if not isinstance(value, str) or not value.strip():
                    errors.append(f"{scene_id}.{field}.{lang}: missing text")
    for extra in sorted(set(data) - ids):
        errors.append(f"{extra}: not a scene id in catalog.js")
    if errors:
        raise SystemExit("notes_text.json problems:\n  - " + "\n  - ".join(errors))
    return data


# ---------------------------------------------------------------------------
# i18n dictionaries
# ---------------------------------------------------------------------------


def build_dictionaries(models, order, categories, text_data):
    zh: dict[str, str] = {}
    en: dict[str, str] = {}

    def add(key: str, zh_value: str, en_value: str):
        zh[key] = zh_value
        en[key] = en_value

    # Shared navigation / page chrome
    add("notes.brand", "团子去旅行", "Dango Travels")
    add("notes.nav.aria", "主导航", "Main navigation")
    add("notes.nav.gallery", "3D 作品", "3D Gallery")
    add("notes.nav.index", "场景说明", "Scene Notes")
    add("notes.eyebrow", "场景说明", "SCENE NOTES")

    # Index page
    add(
        "notes.index.pageTitle",
        "场景说明 · 3D 作品 · 团子去旅行",
        "Scene Notes · 3D Gallery · Dango Travels",
    )
    add(
        "notes.index.metaDescription",
        "26 个 three.js 场景的说明页：每个场景的原始提示词、各 AI 模型版本的代码规模、检测到的 three.js 技术，以及逐版阅读源码后记录的差异。",
        "Notes for all 26 three.js scenes: the original prompt, the code size and detected three.js techniques of every AI-model version, and the differences recorded after reading each version's source.",
    )
    add("notes.index.heading", "场景说明", "Scene Notes")
    add(
        "notes.index.lead",
        "这里为 3D 作品馆里的 26 个场景各准备了一页说明：它想画什么、提示词原文是什么、每个模型版本用了哪些技术，以及逐版阅读源码后看到的差别。",
        "Every one of the 26 scenes in the 3D gallery has a notes page: what it depicts, the original prompt, which techniques each model version used, and what becomes visible when each version's source is read alongside the others.",
    )
    add(
        "notes.index.p1",
        "这些页面不是宣传文案，而是阅读源码后的记录。版本表里的文件大小、行数和技术标签由 tools/gen_notes.py 直接从每个 3d/<id><suffix>/index.html 统计；对比观察则由人工逐版浏览结构、动画、灯光和交互后写成。同一个场景的不同版本使用同一份提示词，因此差异主要来自模型如何理解任务、如何组织几何体与交互，而不是需求本身。",
        "These pages are reading notes, not marketing copy. The file sizes, line counts and technique tags in each version table are measured directly from 3d/<id><suffix>/index.html by tools/gen_notes.py; the comparison notes were written after reading each version's structure, animation, lighting and interaction. Every version of a scene was given the same prompt, so the differences come mainly from how each model interpreted the task and organised geometry and interaction.",
    )
    add(
        "notes.index.p2",
        "想看实时效果，可以从任意说明页进入「对比全部版本」，或回到 3D 作品馆按分类播放合集。每个场景的提示词都公开在 3d/prompts/ 下，可以复制后自己复现。",
        "To see a scene running, open “Compare all versions” from any notes page, or go back to the 3D gallery and play a collection by category. Every prompt is published under 3d/prompts/ and can be copied to reproduce the experiment.",
    )
    add("notes.index.readNotes", "阅读说明 →", "Read notes →")
    add("notes.index.viewScene", "打开场景 ↗", "Open scene ↗")
    add("notes.index.sceneCount", "{n} 个场景", "{n} scenes")

    # Section headings and shared labels
    add("notes.promptHeading", "原始提示词", "Original prompt")
    add(
        "notes.promptNote",
        "下面是从提示词文件中原样复制的正文。同一场景的各版本使用同一份提示词；为避免重复，这里只完整展示一次。",
        "The text below is copied verbatim from the prompt file. All versions of a scene used the same prompt, so it is shown in full only once to avoid repetition.",
    )
    add(
        "notes.promptSame",
        "各版本的提示词文件只差用于展示提示词的 data-id 行和生成方式说明，场景描述正文相同。",
        "The prompt files differ only in the data-id line used by the prompt panel and in the sentence describing how the HTML should be returned; the scene description itself is identical.",
    )
    add(
        "notes.promptVariantsIntro",
        "有一个版本的提示词正文与基准文本不同，完整列在下面：",
        "One version's prompt text differs from the baseline. It is reproduced in full below:",
    )
    add("notes.promptVariants", "变体提示词", "Prompt variant")
    add("notes.promptFile", "提示词文件", "Prompt file")
    add("notes.versionsHeading", "版本对比", "Versions")
    add(
        "notes.versionsLead",
        "文件大小与行数来自该版本的单文件 index.html；技术标签由简单正则从源码中检测，只表示代码里出现了这类 API，不代表实现质量。",
        "File size and line count come from that version's single index.html. Technique tags are detected with simple regular expressions: they mean the API appears in the source, not that the implementation is good.",
    )
    add("notes.table.model", "模型", "Model")
    add("notes.table.scene", "在线场景", "Live scene")
    add("notes.table.size", "大小", "Size")
    add("notes.table.lines", "行数", "Lines")
    add("notes.table.techniques", "检测到的 three.js 技术", "Detected three.js techniques")
    add("notes.table.open", "打开 ↗", "Open ↗")
    add("notes.table.prompt", "提示词", "Prompt")
    add("notes.comparisonHeading", "对比观察", "Comparison notes")
    add(
        "notes.comparisonNote",
        "以下记录来自逐版阅读源码，只描述代码中能观察到的结构、动画与交互差异，不对模型作笼统排名。",
        "These observations come from reading each version's source. They describe only structural, animation and interaction differences visible in the code, without turning the experiment into a leaderboard.",
    )
    add("notes.howHeading", "这个场景是怎么做出来的", "How it was made")
    add(
        "notes.howP1",
        "同一条提示词被分别交给下列模型。提示词要求生成一个可直接在现代浏览器打开的单文件 HTML，three.js 通过 CDN 的 import map 固定版本加载，几何体、材质和贴图全部由代码程序化生成，不能使用外部模型或图片。",
        "The same prompt was given to each model below. It asks for a single HTML file that opens directly in a modern browser, with three.js loaded at a pinned version through a CDN import map; all geometry, materials and textures must be generated procedurally, with no external models or images.",
    )
    add(
        "notes.howP2",
        "生成结果作为静态页面发布在 GitHub Pages 上，没有构建步骤，也没有后端。页面里的尺寸、行数和技术标签是生成后从源码统计的；提示词原文公开在 3d/prompts/ 下，方便对照或复现。",
        "The result is published as a static page on GitHub Pages, with no build step and no backend. The sizes, line counts and technique tags on this page are measured from the generated source; the original prompts are published under 3d/prompts/ so the experiment can be checked or reproduced.",
    )
    add(
        "notes.howP3",
        "发布前会检查页面能否加载、交互是否可用、移动端布局是否正常，必要时做站点层面的集成修正；场景内容本身由模型生成。下面列出每个版本使用时的模型说明。",
        "Before publishing, the page is checked for loading, usable interaction and a sensible mobile layout, and small site-level integration fixes are made when needed; the scene content itself is generated by the model. The model notes for each version are listed below.",
    )
    add("notes.linksHeading", "继续浏览", "Keep exploring")
    add("notes.linksAria", "相关链接", "Related links")
    add("notes.link.compare", "⚖️ 对比全部版本", "⚖️ Compare all versions")
    add("notes.link.gallery", "← 返回 3D 作品", "← Back to 3D Gallery")
    add("notes.link.index", "所有场景说明", "All scene notes")
    add("notes.link.original", "原帖 ↗", "Source post ↗")
    add("notes.unit.scenes", "个场景", "scenes")
    add("notes.category", "分类", "Category")

    # Model badges and notes
    for key in order:
        model = models[key]
        add(f"notes.model.{key}.badge", model.get("badge", key), model.get("badge_en", key))
        add(f"notes.model.{key}.note", model.get("note", ""), model.get("note_en", ""))

    # Categories and scenes
    for category in categories:
        cid = category["id"]
        add(f"notes.cat.{cid}.title", category.get("title", cid), category.get("title_en", cid))
        add(
            f"notes.cat.{cid}.desc",
            category.get("description", ""),
            category.get("description_en", ""),
        )
        for scene in category.get("scenes", []):
            sid = scene["id"]
            title = scene.get("title", sid)
            title_en = scene.get("title_en", sid)
            intro = text_data[sid]["intro"]
            comparison = text_data[sid]["comparison"]
            add(f"notes.{sid}.title", title, title_en)
            add(f"notes.{sid}.pageTitle", f"{title} · 场景说明 · 3D 作品", f"{title_en} · Scene Notes · 3D Gallery")
            add(
                f"notes.{sid}.metaDescription",
                f"{title}：{intro['zh']}",
                f"{title_en}: {intro['en']}",
            )
            add(f"notes.{sid}.intro", intro["zh"], intro["en"])
            add(f"notes.{sid}.comparison", comparison["zh"], comparison["en"])
            add(
                f"notes.{sid}.thumbAlt",
                f"{title} — 3D 场景缩略图",
                f"{title_en} — 3D scene thumbnail",
            )
            add(
                f"notes.{sid}.short",
                scene.get("description", ""),
                scene.get("description_en", ""),
            )
    return zh, en


def write_dictionaries(zh, en):
    out_dir = OUT / "i18n"
    out_dir.mkdir(parents=True, exist_ok=True)
    for lang, data in (("zh", zh), ("en", en)):
        body = json.dumps(data, ensure_ascii=False, indent=2)
        (out_dir / f"{lang}.js").write_text(
            f"I18N.add('{lang}', {body});\n", encoding="utf-8"
        )


# ---------------------------------------------------------------------------
# HTML rendering
# ---------------------------------------------------------------------------


def esc(value: str) -> str:
    return html.escape(value or "", quote=True)


def badge_html(model: dict) -> str:
    cls = "model-badge" + (f" {model['badgeClass']}" if model.get("badgeClass") else "")
    return f'<span class="{cls}" data-i18n="notes.model.{model["key"]}.badge">{esc(model.get("badge", model["key"]))}</span>'


HEADER = """\
<header class="topbar">
  <a class="brand" href="/"><span aria-hidden="true">🍡</span> <span data-i18n="notes.brand">团子去旅行</span></a>
  <nav class="site-nav" aria-label="主导航" data-i18n-attr="aria-label:notes.nav.aria">
    <a href="/3d/" data-i18n="notes.nav.gallery">3D 作品</a>
    <a href="/3d/notes/" aria-current="page" data-i18n="notes.nav.index">场景说明</a>
  </nav>
  <span data-i18n-switch="btn-topbar"></span>
</header>"""

FOOTER = """\
<footer class="site-footer">
  <nav class="site-footer-links" aria-label="页脚导航" data-i18n-attr="aria-label:footer.nav">
    <a href="/about/" data-i18n="footer.about">关于</a>
    <a href="/contact/" data-i18n="footer.contact">联系</a>
    <a href="/privacy/" data-i18n="footer.privacy">隐私政策</a>
    <a href="/terms/" data-i18n="footer.terms">使用条款</a>
    <a href="https://github.com/iamyours" target="_blank" rel="noopener noreferrer" data-i18n="footer.github">GitHub</a>
  </nav>
  <span class="site-footer-copy" data-i18n="footer.copyright">© 2026 iamyours</span>
</footer>"""

SCRIPTS = """\
  <script src="/3d/i18n/i18n.js"></script>
  <script src="/3d/i18n/zh.js"></script>
  <script src="/3d/i18n/en.js"></script>
  <script src="/3d/notes/i18n/zh.js"></script>
  <script src="/3d/notes/i18n/en.js"></script>
  <script src="/site/footer.js"></script>"""


def page_head(title: str, description: str, canonical: str, title_key: str, desc_key: str) -> str:
    return f"""\
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="data:," />
  <title data-i18n="{title_key}">{esc(title)}</title>
  <meta name="description" content="{esc(description)}" data-i18n-attr="content:{desc_key}" />
  <link rel="canonical" href="{canonical}" />
  <link rel="stylesheet" href="/site/site.css" />
  <link rel="stylesheet" href="/site/footer.css" />
  <link rel="stylesheet" href="/3d/notes/notes.css" />
</head>"""


def thumbnail_for(scene_id: str, versions: list[dict]) -> tuple[str, str]:
    for version in versions:
        candidate = THREE_D / "thumbs" / f"{scene_id}{version['suffix']}.jpg"
        if candidate.is_file():
            return f"/3d/thumbs/{candidate.name}", version["key"]
    matches = sorted((THREE_D / "thumbs").glob(f"{scene_id}*.jpg"))
    if matches:
        return f"/3d/thumbs/{matches[0].name}", ""
    return "", ""


def render_scene_page(category: dict, scene: dict, versions: list[dict], models: dict) -> str:
    sid = scene["id"]
    title = scene.get("title", sid)
    title_en = scene.get("title_en", sid)
    intro = text_data_global[sid]["intro"]
    bads = "".join(badge_html(v["model"]) for v in versions)
    thumb, thumb_key = thumbnail_for(sid, versions)
    thumb_html = ""
    if thumb:
        thumb_html = f"""\
      <figure class="notes-thumb">
        <img src="{thumb}" alt="{esc(title)} — 3D 场景缩略图" loading="lazy" width="640" height="360" data-i18n-attr="alt:notes.{sid}.thumbAlt" />
      </figure>"""

    source_html = ""
    if scene.get("source"):
        source_html = (
            f'<a class="notes-source-link" href="{esc(scene["source"])}" target="_blank" '
            f'rel="noopener noreferrer" data-i18n="notes.link.original">原帖 ↗</a>'
        )

    # Prompt block + variants
    base_text, base_file, variants = load_prompts(versions, sid)
    rel_prompt = base_file.relative_to(ROOT).as_posix() if base_file else ""
    prompt_head = ""
    if base_file:
        prompt_head = (
            f'<div class="prompt-file-row"><span class="prompt-file-label" data-i18n="notes.promptFile">提示词文件</span> '
            f'<a class="prompt-file" href="/{esc(rel_prompt)}">{esc(rel_prompt)}</a></div>'
        )
    variant_html = ""
    if variants:
        blocks = []
        for group in variants:
            names = "、".join(v["model"].get("badge", v["key"]) for v in group)
            blocks.append(
                f"""\
      <details class="prompt-variant">
        <summary><span data-i18n="notes.promptVariants">变体提示词</span> · {esc(names)}</summary>
        <pre class="prompt-block">{esc(group[0]["prompt_text"].rstrip())}</pre>
      </details>"""
            )
        variant_html = (
            '\n      <p class="notes-section-note" data-i18n="notes.promptVariantsIntro">有一个版本的提示词正文与基准文本不同，完整列在下面：</p>\n'
            + "\n".join(blocks)
        )
    else:
        variant_html = '\n      <p class="notes-section-note" data-i18n="notes.promptSame">各版本的提示词文件只差用于展示提示词的 data-id 行和生成方式说明，场景描述正文相同。</p>'

    # Versions table
    rows = []
    for version in versions:
        techs = "".join(
            f'<span class="tech-tag">{esc(label)}</span>' for label in version["techniques"]
        ) or '<span class="tech-empty">—</span>'
        model = version["model"]
        rows.append(
            f"""\
          <tr>
            <td class="model-cell" data-label="模型" data-label-en="Model">{badge_html(model)}<br /><a class="prompt-inline" href="/3d/prompts/{esc(scene['id'] + version['suffix'])}.txt" data-i18n="notes.table.prompt">提示词</a></td>
            <td data-label="在线场景" data-label-en="Live scene"><a class="scene-live-link" href="/3d/{esc(scene['id'] + version['suffix'])}/" data-i18n="notes.table.open">打开 ↗</a></td>
            <td class="num-cell" data-label="大小" data-label-en="Size">{version['size_kb']:.1f} KB</td>
            <td class="num-cell" data-label="行数" data-label-en="Lines">{version['lines']:,}</td>
            <td class="tech-cell" data-label="检测到的 three.js 技术" data-label-en="Detected three.js techniques">{techs}</td>
          </tr>"""
        )
    table_rows = "\n".join(rows)

    # Model notes in the "how it was made" section
    model_note_items = []
    for version in versions:
        model = version["model"]
        model_note_items.append(
            f"""\
        <li>{badge_html(model)} <span data-i18n="notes.model.{model['key']}.note">{esc(model.get('note', ''))}</span></li>"""
        )
    model_notes = "\n".join(model_note_items)

    compare_href = f"/3d/compare/?id={sid}"
    canonical = f"{BASE_URL}/3d/notes/{sid}/"
    title_key = f"notes.{sid}.pageTitle"
    desc_key = f"notes.{sid}.metaDescription"

    return f"""\
{page_head(f'{title} · 场景说明 · 3D 作品', f'{title}：{intro["zh"]}', canonical, title_key, desc_key)}
<body>
  <div class="site-shell notes-shell">
{HEADER}

    <main class="page-main prose notes-main" id="main-content">
      <h1 data-i18n="notes.{sid}.title">{esc(title)}</h1>
      <p class="lead" data-i18n="notes.{sid}.intro">{esc(intro["zh"])}</p>
      <p class="notes-badges">{bads}{source_html}</p>
{thumb_html}

      <section class="notes-section" id="prompt">
        <h2 data-i18n="notes.promptHeading">原始提示词</h2>
        <p class="notes-section-note" data-i18n="notes.promptNote">下面是从提示词文件中原样复制的正文。同一场景的各版本使用同一份提示词；为避免重复，这里只完整展示一次。</p>
        {prompt_head}
        <pre class="prompt-block">{esc(base_text.rstrip())}</pre>
        {variant_html}
      </section>

      <section class="notes-section" id="versions">
        <h2 data-i18n="notes.versionsHeading">版本对比</h2>
        <p class="notes-section-note" data-i18n="notes.versionsLead">文件大小与行数来自该版本的单文件 index.html；技术标签由简单正则从源码中检测，只表示代码里出现了这类 API，不代表实现质量。</p>
        <div class="table-scroll">
          <table class="versions-table">
            <thead>
              <tr>
                <th data-i18n="notes.table.model">模型</th>
                <th data-i18n="notes.table.scene">在线场景</th>
                <th data-i18n="notes.table.size">大小</th>
                <th data-i18n="notes.table.lines">行数</th>
                <th data-i18n="notes.table.techniques">检测到的 three.js 技术</th>
              </tr>
            </thead>
            <tbody>
{table_rows}
            </tbody>
          </table>
        </div>
      </section>

      <section class="notes-section" id="comparison">
        <h2 data-i18n="notes.comparisonHeading">对比观察</h2>
        <p class="notes-section-note" data-i18n="notes.comparisonNote">以下记录来自逐版阅读源码，只描述代码中能观察到的结构、动画与交互差异，不对模型作笼统排名。</p>
        <p data-i18n="notes.{sid}.comparison">{esc(text_data_global[sid]["comparison"]["zh"])}</p>
      </section>

      <section class="notes-section" id="how-made">
        <h2 data-i18n="notes.howHeading">这个场景是怎么做出来的</h2>
        <p data-i18n-html="notes.howP1">同一条提示词被分别交给下列模型。提示词要求生成一个可直接在现代浏览器打开的单文件 HTML，three.js 通过 CDN 的 import map 固定版本加载，几何体、材质和贴图全部由代码程序化生成，不能使用外部模型或图片。</p>
        <p data-i18n="notes.howP2">生成结果作为静态页面发布在 GitHub Pages 上，没有构建步骤，也没有后端。页面里的尺寸、行数和技术标签是生成后从源码统计的；提示词原文公开在 3d/prompts/ 下，方便对照或复现。</p>
        <p data-i18n="notes.howP3">发布前会检查页面能否加载、交互是否可用、移动端布局是否正常，必要时做站点层面的集成修正；场景内容本身由模型生成。下面列出每个版本使用时的模型说明。</p>
        <ul class="model-notes">
{model_notes}
        </ul>
      </section>

      <section class="notes-section" id="links">
        <h2 data-i18n="notes.linksHeading">继续浏览</h2>
        <nav class="notes-live-links" aria-label="相关链接" data-i18n-attr="aria-label:notes.linksAria">
          <a class="btn" href="{compare_href}" data-i18n="notes.link.compare">⚖️ 对比全部版本</a>
          <a class="btn btn-secondary" href="/3d/" data-i18n="notes.link.gallery">← 返回 3D 作品</a>
          <a class="btn btn-secondary" href="/3d/notes/" data-i18n="notes.link.index">所有场景说明</a>
        </nav>
      </section>
    </main>

{FOOTER}
  </div>

{SCRIPTS}
</body>
</html>
"""


def render_index_page(categories, models, order) -> str:
    sections = []
    for category in categories:
        cid = category["id"]
        cards = []
        for scene in category.get("scenes", []):
            sid = scene["id"]
            versions = scene_versions(scene, models, order)
            thumb, _ = thumbnail_for(sid, versions)
            badges = "".join(badge_html(v["model"]) for v in versions)
            thumb_html = (
                f'<a class="notes-card-thumb" href="/3d/notes/{sid}/" tabindex="-1" aria-hidden="true">'
                f'<img src="{thumb}" alt="" loading="lazy" width="320" height="180" /></a>'
                if thumb
                else ""
            )
            cards.append(
                f"""\
        <article class="notes-card">
          {thumb_html}
          <div class="notes-card-body">
            <h3><a href="/3d/notes/{sid}/" data-i18n="notes.{sid}.title">{esc(scene.get('title', sid))}</a></h3>
            <p class="notes-card-desc" data-i18n="notes.{sid}.short">{esc(scene.get('description', ''))}</p>
            <div class="scene-badges">{badges}</div>
            <a class="notes-card-link" href="/3d/notes/{sid}/" data-i18n="notes.index.readNotes">阅读说明 →</a>
          </div>
        </article>"""
            )
        sections.append(
            f"""\
      <section class="notes-cat" id="cat-{cid}">
        <h2><span aria-hidden="true">{esc(category.get('emoji', ''))}</span> <span data-i18n="notes.cat.{cid}.title">{esc(category.get('title', cid))}</span></h2>
        <p class="notes-cat-desc" data-i18n="notes.cat.{cid}.desc">{esc(category.get('description', ''))}</p>
        <div class="notes-index-grid">
{chr(10).join(cards)}
        </div>
      </section>"""
        )
    canonical = f"{BASE_URL}/3d/notes/"
    return f"""\
{page_head('场景说明 · 3D 作品 · 团子去旅行', '26 个 three.js 场景的说明页：每个场景的原始提示词、各 AI 模型版本的代码规模、检测到的 three.js 技术，以及逐版阅读源码后记录的差异。', canonical, 'notes.index.pageTitle', 'notes.index.metaDescription')}
<body>
  <div class="site-shell notes-shell">
{HEADER}

    <main class="page-main prose notes-main" id="main-content">
      <h1 data-i18n="notes.index.heading">场景说明</h1>
      <p class="lead" data-i18n="notes.index.lead">这里为 3D 作品馆里的 26 个场景各准备了一页说明：它想画什么、提示词原文是什么、每个模型版本用了哪些技术，以及逐版阅读源码后看到的差别。</p>
      <p data-i18n="notes.index.p1">这些页面不是宣传文案，而是阅读源码后的记录。版本表里的文件大小、行数和技术标签由 tools/gen_notes.py 直接从每个 3d/&lt;id&gt;&lt;suffix&gt;/index.html 统计；对比观察则由人工逐版浏览结构、动画、灯光和交互后写成。同一个场景的不同版本使用同一份提示词，因此差异主要来自模型如何理解任务、如何组织几何体与交互，而不是需求本身。</p>
      <p data-i18n="notes.index.p2">想看实时效果，可以从任意说明页进入「对比全部版本」，或回到 3D 作品馆按分类播放合集。每个场景的提示词都公开在 3d/prompts/ 下，可以复制后自己复现。</p>
      <p class="notes-index-links"><a class="btn" href="/3d/" data-i18n="notes.link.gallery">← 返回 3D 作品</a></p>

{chr(10).join(sections)}
    </main>

{FOOTER}
  </div>

{SCRIPTS}
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> int:
    global text_data_global
    models, order, categories = load_catalog()
    text_data_global = load_text(categories)
    zh, en = build_dictionaries(models, order, categories, text_data_global)

    OUT.mkdir(parents=True, exist_ok=True)
    write_dictionaries(zh, en)

    scene_count = 0
    for category, scene in iter_scenes(categories):
        sid = scene["id"]
        versions = scene_versions(scene, models, order)
        if not versions:
            print(f"WARNING: {sid} has no available scene directory", file=sys.stderr)
        page = render_scene_page(category, scene, versions, models)
        target = OUT / sid / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page, encoding="utf-8")
        scene_count += 1

    index = render_index_page(categories, models, order)
    (OUT / "index.html").write_text(index, encoding="utf-8")

    print(f"Wrote {scene_count} scene notes pages + index + i18n dictionaries")
    print(f"  notes: {OUT}")
    print(f"  zh keys: {len(zh)}, en keys: {len(en)}")
    if set(zh) != set(en):
        print("ERROR: zh/en key sets differ", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
