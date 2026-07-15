#!/usr/bin/env python3
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "og"
DATA = json.loads((ROOT / "src" / "og-pages.json").read_text())
ARTWORK = Image.open(ROOT / "public" / "assets" / "mobench-bench.png").convert("RGB")

W, H = 1200, 630
PALETTE = {
    "cream": "#f4efdd",
    "cream_hi": "#fff9e9",
    "ink": "#33271a",
    "soft": "#46402f",
    "muted": "#6e6453",
    "faint": "#998c6f",
    "green": "#3f7a2e",
    "leaf": "#e6f1d5",
    "line": "#d5cbb5",
}

GROUP_ACCENTS = {
    "Start": "#3f7a2e",
    "Authoring": "#c2521d",
    "Guides": "#287a8a",
    "Reference": "#5e6f2f",
    "Specs": "#9a6411",
    "Codebase": "#356b26",
    "Help": "#a7432a",
}

SHORT_DESCRIPTIONS = {
    "landing": "Benchmark Rust workloads on real Android and iOS devices.",
    "docs": "Install, author, run, profile, and ship mobile Rust benchmarks.",
    "overview": "What mobench is, why it exists, and where to go next.",
    "quickstart": "Install mobench and run your first mobile benchmark.",
    "install": "Set up Rust, Android, iOS, BrowserStack, and mobench.",
    "concepts": "Understand runners, providers, reports, schemas, and profiling.",
    "authoring": "Write #[benchmark] functions mobile runners can discover.",
    "setup-teardown": "Keep setup and cleanup outside measured benchmark samples.",
    "sdk": "Use mobench-sdk, runner backends, and native FFI exports.",
    "build": "Generate and verify Android and iOS runner artifacts.",
    "local-devices": "Run on attached devices, emulators, and simulators.",
    "browserstack": "Run hosted real-device benchmarks in BrowserStack CI.",
    "app-automate": "Upload Espresso and XCUITest suites to App Automate.",
    "profiling": "Capture native traces, phases, flamegraphs, and profile diffs.",
    "reports": "Read JSON summaries, Markdown reports, CSV rows, and artifacts.",
    "cli-reference": "Every mobench command, flag, input, output, and example.",
    "schemas": "Contracts for CI, summaries, traces, and fixtures.",
    "examples": "Walk through benchmark and FFI examples.",
    "diagrams": "Architecture, lifecycle, CI, profiling, and responsibility maps.",
    "current-spec": f"Current behavior and API contracts for release {DATA['site']['version']}.",
    "codebase": "Workspace layout, runtime layers, templates, and integrations.",
    "testing": "Host tests, smoke checks, fixtures, CI, and profiling validation.",
    "public-api": "Crates, feature flags, contracts, semver, MSRV, and releases.",
    "troubleshooting": "Fix setup, build, provider, schema, and result issues.",
}


def font(size: int, bold: bool = False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            pass
    return ImageFont.load_default(size=size)


FONT_LABEL = font(22, True)
FONT_BRAND = font(34, True)
FONT_VERSION = font(19)
FONT_PATH = font(19)
FONT_CHIP = font(18, True)


def text_width(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> int:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0]


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_width: int, max_lines: int):
    words = text.split()
    lines = []
    line = ""
    for word in words:
        candidate = f"{line} {word}".strip()
        if line and text_width(draw, candidate, fnt) > max_width:
            lines.append(line)
            line = word
        else:
            line = candidate
        if len(lines) == max_lines:
            break
    if line and len(lines) < max_lines:
        lines.append(line)
    return lines


def rounded_paste(base: Image.Image, image: Image.Image, xy, radius: int):
    mask = Image.new("L", image.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((0, 0, image.size[0], image.size[1]), radius=radius, fill=255)
    base.paste(image, xy, mask)


def crop_artwork(size=(396, 486)):
    target_w, target_h = size
    src_w, src_h = ARTWORK.size
    scale = max(target_w / src_w, target_h / src_h)
    resized = ARTWORK.resize((round(src_w * scale), round(src_h * scale)), Image.Resampling.LANCZOS)
    left = (resized.size[0] - target_w) // 2
    top = (resized.size[1] - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def draw_background(draw: ImageDraw.ImageDraw, accent: str):
    draw.rectangle((0, 0, W, H), fill=PALETTE["cream"])
    for x in range(0, W, 44):
        draw.line((x, 0, x, H), fill="#e7dec8", width=1)
    for y in range(0, H, 44):
        draw.line((0, y, W, y), fill="#e7dec8", width=1)
    draw.ellipse((858, -182, 1294, 254), fill="#dcebc9")
    draw.ellipse((930, -28, 1214, 256), outline="#b7cba3", width=2)
    draw.arc((-90, 438, 740, 740), 192, 350, fill="#c0d0a8", width=4)
    draw.rounded_rectangle((38, 38, 1162, 592), radius=36, outline="#ded4bd", width=2)
    draw.rounded_rectangle((54, 54, 1146, 576), radius=28, outline="#f8f2df", width=1)


def draw_artwork_card(base: Image.Image):
    shadow = Image.new("RGBA", (510, 598), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((36, 36, 472, 562), radius=38, fill=(51, 39, 26, 88))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    base.alpha_composite(shadow, (674, 20))

    card = Image.new("RGBA", (436, 526), PALETTE["cream_hi"])
    card_draw = ImageDraw.Draw(card)
    card_draw.rounded_rectangle((0, 0, 435, 525), radius=38, fill=PALETTE["cream_hi"], outline="#d7ccb7", width=2)
    photo = crop_artwork()
    rounded_paste(card, photo.convert("RGBA"), (20, 20), 30)
    card_draw.rounded_rectangle((20, 20, 416, 506), radius=30, outline=(255, 255, 255, 136), width=2)
    base.alpha_composite(card, (710, 52))


def draw_chips(draw: ImageDraw.ImageDraw, items, accent: str):
    x = 70
    for index, item in enumerate(items[:4]):
        width = max(96, text_width(draw, item, FONT_CHIP) + 34)
        fill = accent if index == 0 else PALETTE["leaf"]
        text = "#fffdf4" if index == 0 else PALETTE["ink"]
        outline = accent if index != 0 else None
        draw.rounded_rectangle((x, 512, x + width, 554), radius=21, fill=fill, outline=outline, width=1)
        draw.text((x + 17, 523), item, font=FONT_CHIP, fill=text)
        x += width + 16


def draw_card(filename: str, title: str, eyebrow: str, description: str, page_path: str, accent: str, chip_items):
    canvas = Image.new("RGBA", (W, H), PALETTE["cream"])
    draw = ImageDraw.Draw(canvas)
    draw_background(draw, accent)
    draw_artwork_card(canvas)

    draw.text((70, 74), eyebrow.upper(), font=FONT_LABEL, fill=accent)
    draw.text((70, 119), "mobench", font=FONT_BRAND, fill=PALETTE["ink"])
    version_x = 70 + text_width(draw, "mobench", FONT_BRAND) + 22
    draw.text((version_x, 133), DATA["site"]["version"], font=FONT_VERSION, fill=PALETTE["muted"])

    title_font = font(76, True)
    title_lines = wrap(draw, title, title_font, 610, 2)
    if len(title_lines) == 1:
        title_font = font(84, True)
        title_lines = wrap(draw, title, title_font, 610, 1)
        title_y = 194
        desc_y = 352
    else:
        title_y = 184
        desc_y = 374

    for i, line in enumerate(title_lines):
        draw.text((70, title_y + i * 82), line, font=title_font, fill=PALETTE["ink"])

    desc_font = font(34, True)
    desc_lines = wrap(draw, description, desc_font, 620, 2)
    for i, line in enumerate(desc_lines):
        draw.text((73, desc_y + i * 44), line, font=desc_font, fill=PALETTE["soft"])

    draw_chips(draw, chip_items, accent)
    draw.text((70, 570), page_path, font=FONT_PATH, fill=PALETTE["faint"])
    canvas.convert("RGB").save(OUT_DIR / f"{filename}.jpg", quality=92, optimize=True, progressive=True)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old_svg in OUT_DIR.glob("*.svg"):
        old_svg.unlink()

    draw_card(
        "landing",
        "Benchmark Rust on real mobile",
        DATA["landing"]["eyebrow"],
        SHORT_DESCRIPTIONS["landing"],
        "/",
        PALETTE["green"],
        ["Rust", "Android", "iOS", "BrowserStack"],
    )
    draw_card(
        "docs",
        "Docs for mobile Rust benchmarking",
        DATA["docsRoot"]["eyebrow"],
        SHORT_DESCRIPTIONS["docs"],
        "/docs",
        PALETTE["green"],
        ["CLI", "SDK", "Reports", "Profiling"],
    )

    for page in DATA["docsPages"]:
        draw_card(
            page["id"],
            page["label"],
            f'{page["group"]} / docs',
            SHORT_DESCRIPTIONS.get(page["id"], page["description"]),
            "/docs" if page["id"] == "overview" else f'/{page["id"]}',
            GROUP_ACCENTS.get(page["group"], PALETTE["green"]),
            [page["group"], "mobench", DATA["site"]["version"]],
        )

    print(f"Generated {2 + len(DATA['docsPages'])} OG JPGs in public/og")


if __name__ == "__main__":
    main()
