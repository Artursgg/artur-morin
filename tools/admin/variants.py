#!/usr/bin/env python3
"""
Create the extra image sizes the site uses, for every photo in images.json:

  <category>/thumbnails/small/<name>.jpg   short side 400px  (grid on phones / normal screens)
  <category>/large/<name>.jpg              long side 1600px  (photo viewer on phones / laptops)

and store width/height of the full photo in images.json.

    python3 tools/admin/variants.py          (macOS - uses the built-in `sips`)

Safe to run again: existing variants are skipped unless --force is given.
New uploads through the Photo Manager already get these sizes; this script is
for photos that were added before that.
"""

import json
import subprocess
import sys
from pathlib import Path

ADMIN_DIR = Path(__file__).resolve().parent
SITE = ADMIN_DIR.parent.parent / "docs"
DATA_FILE = SITE / "data" / "images.json"

SMALL_SHORT_SIDE = 400
LARGE_LONG_SIDE = 1600


def dims(path):
    out = subprocess.run(["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(path)],
                         capture_output=True, text=True, check=True).stdout.split()
    return int(out[out.index("pixelWidth:") + 1]), int(out[out.index("pixelHeight:") + 1])


def resize(src, dest, long_side, quality):
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["sips", "-Z", str(long_side), "-s", "format", "jpeg",
                    "-s", "formatOptions", str(quality), str(src), "--out", str(dest)],
                   capture_output=True, check=True)


def site_path(path):
    return "/" + path.relative_to(SITE).as_posix()


def main():
    force = "--force" in sys.argv
    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    made = 0

    for images in data["portfolio"].values():
        for img in images:
            full = SITE / img["full"].lstrip("/")
            w, h = dims(full)
            img["width"], img["height"] = w, h
            short, long = min(w, h), max(w, h)
            cat_dir = full.parent.parent  # <category>/

            # small thumbnail: short side 400px
            small = cat_dir / "thumbnails" / "small" / full.name
            if force or not small.exists():
                resize(full, small, round(long * SMALL_SHORT_SIDE / short), 75)
                made += 1
            img["thumbnailSmall"] = site_path(small)

            # large: long side 1600px (skip if the original is barely bigger)
            large = cat_dir / "large" / full.name
            if long > LARGE_LONG_SIDE * 1.1:
                if force or not large.exists():
                    resize(full, large, LARGE_LONG_SIDE, 75)
                    made += 1
            # a heavily compressed original can be smaller than its re-saved
            # 1600px version - then the viewer should just use the original
            if large.exists() and large.stat().st_size < full.stat().st_size:
                img["large"] = site_path(large)
            else:
                large.unlink(missing_ok=True)
                img["large"] = img["full"]

    DATA_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"done - {made} files created, images.json updated")


if __name__ == "__main__":
    main()
