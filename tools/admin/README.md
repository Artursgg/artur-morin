# Photo Manager

A local drag & drop tool for updating the portfolio and the Picture of the Week.
Nothing to install: it uses the Python that ships with macOS.

## Start

Double-click **`Photo Manager.command`** in the repo root. The first time, macOS may ask
you to allow it (right-click → Open). It pulls the latest changes and opens
<http://localhost:8787/admin/> in your browser.

Or from a terminal:

```bash
python3 tools/admin/server.py
```

## Use

**Portfolio tab**
- Drop photos anywhere on the page (or click the drop area). Pick the category first.
- Each photo is resized in the browser: full size up to 2560px, plus a thumbnail.
- Drag cards to reorder, or drag them onto another category (empty categories are at the bottom).
- Edit the title or alt text inline. Changes save automatically.
- `#1, #2 …` on each card is its position on the portfolio page.

**Picture of the Week tab**
- Drop a new photo, write the title, caption and location, then press **Save**.
- The old picture goes into "Previous weeks" (kept in `docs/data/images.json`).

**Publish**
- The top bar shows how many changes are not live yet.
- **Publish** does `git add docs && git commit && git push`. GitHub Pages updates in about a minute.
- **Preview site** opens your local copy of the site with the changes, before publishing.

## Where things live

| What | Where |
| --- | --- |
| Portfolio list (order, titles, categories) | `docs/data/images.json` → `portfolio` |
| Portfolio photos | `docs/assets/images/portfolio/<category>/full/` and `/thumbnails/` |
| Picture of the Week data | `docs/data/images.json` → `potw` / `potwHistory` |
| Picture of the Week HTML | `docs/index.html`, between the `POTW:START` / `POTW:END` comments (written by the tool, don't edit by hand) |
