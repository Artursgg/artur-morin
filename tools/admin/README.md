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
- Each photo is resized in the browser into 4 sizes: full (up to 2560px), large (1600px, used by
  the photo viewer on phones/laptops), thumbnail (800px short side) and small thumbnail (400px).
  The site picks the smallest one that stays sharp on each screen.
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

## Safety net

- **Deleted or added a photo in Finder?** The Photo Manager checks the folders every time it opens or you
  switch back to its tab. A red **Needs attention** box appears:
  - *Photo files missing*: **Restore** (brings the files back from the last published version) or
    **Remove from site**. Photos that were never published can only be removed.
  - *Not on the site yet*: photos found in a `full/` folder. **Add to portfolio** creates the other sizes,
    **Delete file** moves the file to Recently deleted.
- **Publish is blocked** while any photo is missing files, so a broken image can't reach the live site.
- **Delete** doesn't erase anything: the photo goes to **Recently deleted** (bottom of the page, last 50 items,
  stored in `tools/admin/.trash/`, not uploaded) and **Restore** puts it back in the same place.
- **Undo last publish** (top bar) puts the live site back to how it was before your last publish.
- If GitHub changed while the Photo Manager was open (e.g. you merged a pull request), Publish catches up
  automatically. If an upload ever fails, the status says *waiting to upload*: press Publish again.

## Where things live

| What | Where |
| --- | --- |
| Portfolio list (order, titles, categories) | `docs/data/images.json` → `portfolio` |
| Portfolio photos | `docs/assets/images/portfolio/<category>/full/`, `/large/`, `/thumbnails/`, `/thumbnails/small/` |
| Picture of the Week data | `docs/data/images.json` → `potw` / `potwHistory` |
| Picture of the Week HTML | `docs/index.html`, between the `POTW:START` / `POTW:END` comments (written by the tool, don't edit by hand) |

## Older photos

Photos added before the 4-size setup can be given the extra sizes with:

```bash
python3 tools/admin/variants.py
```
