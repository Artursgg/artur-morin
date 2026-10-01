#!/usr/bin/env python3
"""
Local photo manager for arturmorin.page

    python3 tools/admin/server.py        (or double-click Photo Manager.command)

Opens http://localhost:8787 with a drag & drop interface that:
  - adds photos to the portfolio (resized full image + thumbnail)
  - reorders / edits / moves / deletes portfolio photos
  - sets the Picture of the Week on the home page
  - publishes the changes (git commit + push -> GitHub Pages)

Safety: photos deleted or added in Finder are detected ("Needs attention"),
Delete moves photos to a trash (tools/admin/.trash) so they can be restored,
Publish refuses while photos are broken, and the last publish can be undone.

Images are resized in the browser, so no extra software is needed.
Only runs on your own machine; nothing here is deployed (docs/ is the site).
"""

import base64
import html
import json
import re
import subprocess
import sys
import threading
import webbrowser
from datetime import date
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

PORT = 8787
ADMIN_DIR = Path(__file__).resolve().parent
REPO = ADMIN_DIR.parent.parent
SITE = REPO / "docs"
DATA_FILE = SITE / "data" / "images.json"
HOME_PAGE = SITE / "index.html"
PORTFOLIO_DIR = SITE / "assets" / "images" / "portfolio"
POTW_DIR = PORTFOLIO_DIR / "potw"

SITEMAP_FILE = SITE / "sitemap.xml"
SITE_URL = "https://arturmorin.page"
SITEMAP_PAGES = [  # (path, changefreq, priority)
    ("/", "weekly", "1.0"),
    ("/portfolio/", "weekly", "0.9"),
    ("/about/", "monthly", "0.8"),
    ("/privacy-policy/", "yearly", "0.3"),
]

TRASH_DIR = ADMIN_DIR / ".trash"          # not part of the site (git-ignored)
TRASH_FILE = TRASH_DIR / "trash.json"
TRASH_KEEP = 50                            # newest items kept in "Recently deleted"
SIZE_KEYS = ("full", "large", "thumbnail", "thumbnailSmall")
COMMIT_PREFIX = "Photo Manager: "          # marks commits that "Undo last publish" may revert

POTW_START = "<!-- POTW:START (managed by tools/admin - edit via Photo Manager) -->"
POTW_END = "<!-- POTW:END -->"


# -----------------------------------------------------------------------------
# Data helpers
# -----------------------------------------------------------------------------
def load_data():
    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    data.setdefault("portfolio", {})
    return data


def save_data(data):
    DATA_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def slugify(text):
    text = re.sub(r"[^A-Za-z0-9]+", "-", text.strip()).strip("-")
    return text or "photo"


def unique_name(folder, slug, ext):
    name, n = f"{slug}{ext}", 2
    while (folder / name).exists():
        name, n = f"{slug}-{n}{ext}", n + 1
    return name


IMAGE_EXTS = {".jpg", ".jpeg", ".webp", ".png"}
MAX_BODY = 60 * 1024 * 1024  # a couple of resized photos as base64


def write_data_url(path, data_url):
    _, b64 = data_url.split(",", 1)
    raw = base64.b64decode(b64)
    is_jpeg = raw[:3] == b"\xff\xd8\xff"
    is_webp = raw[:4] == b"RIFF" and raw[8:12] == b"WEBP"
    if not (is_jpeg or is_webp):
        raise ValueError("Not a JPEG/WebP image")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(raw)


def site_path(path):
    """Filesystem path -> URL path used on the site (/assets/...)."""
    return "/" + path.relative_to(SITE).as_posix()


def fs_path(url_path):
    """URL path (/assets/...) -> filesystem path of a portfolio photo; refuses anything else."""
    p = (SITE / str(url_path).lstrip("/")).resolve()
    if PORTFOLIO_DIR.resolve() not in p.parents or p.suffix.lower() not in IMAGE_EXTS:
        raise ValueError(f"Not a portfolio image: {url_path}")
    if POTW_DIR.resolve() in p.parents:
        raise ValueError("Picture of the Week images are managed separately")
    return p


def file_keys(img):
    """distinct size keys of an entry (large may point to the full file)"""
    seen, out = set(), []
    for k in SIZE_KEYS:
        v = img.get(k)
        if v and v not in seen:
            seen.add(v); out.append(k)
    return out


def in_last_publish(url_path):
    """True if this file exists in the last commit (so it can be restored with git)"""
    return git("cat-file", "-e", f"HEAD:docs{url_path}")[0] == 0


def health(data):
    """Photos whose files are missing (e.g. deleted in Finder) and photo files
    that are in the folders but not on the site (e.g. added in Finder)."""
    missing = []
    listed = set()
    for cat, images in data["portfolio"].items():
        for img in images:
            listed.update(img.get(k) for k in SIZE_KEYS if img.get(k))
            gone = [k for k in file_keys(img) if not (SITE / img[k].lstrip("/")).is_file()]
            if gone:
                missing.append({
                    "category": cat, "title": img.get("title", ""), "full": img["full"],
                    "thumbnail": img.get("thumbnail") if "thumbnail" not in gone else None,
                    "missing": gone,
                    "restorable": all(in_last_publish(img[k]) for k in gone),
                })
    unlisted = []
    for f in sorted(PORTFOLIO_DIR.glob("*/full/*")):
        if f.suffix.lower() in IMAGE_EXTS and site_path(f) not in listed:
            unlisted.append({"category": f.parent.parent.name, "path": site_path(f), "name": f.name})
    potw = data.get("potw") or {}
    potw_missing = bool(potw.get("image")) and not (SITE / potw["image"].lstrip("/")).is_file()
    return {"missing": missing, "unlisted": unlisted, "potwMissing": potw_missing}


def load_trash():
    try:
        return json.loads(TRASH_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []


def save_trash(items):
    TRASH_DIR.mkdir(parents=True, exist_ok=True)
    TRASH_FILE.write_text(json.dumps(items[:TRASH_KEEP], indent=2, ensure_ascii=False), encoding="utf-8")
    keep = {f for it in items[:TRASH_KEEP] for f in it.get("files", {}).values()}
    for f in TRASH_DIR.iterdir():                     # drop files of items that fell off the list
        if f.name != TRASH_FILE.name and f.name not in keep:
            f.unlink(missing_ok=True)


def move_to_trash(url_paths):
    """move files into the trash folder; returns {url_path: trash file name}"""
    TRASH_DIR.mkdir(parents=True, exist_ok=True)
    moved = {}
    stamp = date.today().isoformat()
    for u in url_paths:
        src = fs_path(u)
        if src.is_file():
            name = unique_name(TRASH_DIR, f"{stamp}-{slugify(src.parent.name)}-{src.stem}", src.suffix)
            src.rename(TRASH_DIR / name)
            moved[u] = name
    return moved


def last_publish():
    code, msg = git("log", "-1", "--format=%s")
    if code != 0:
        return None
    revertable = msg.startswith(COMMIT_PREFIX) or msg.startswith(f'Revert "{COMMIT_PREFIX}')
    return {"message": msg, "canUndo": revertable}


def is_used_elsewhere(data, url_path):
    return any(
        url_path in (img.get("thumbnail"), img.get("full"), img.get("thumbnailSmall"), img.get("large"))
        for images in data["portfolio"].values()
        for img in images
    )


# -----------------------------------------------------------------------------
# Picture of the Week (static HTML block in docs/index.html)
# -----------------------------------------------------------------------------
def render_potw(potw):
    e = lambda s: html.escape(s or "", quote=True)
    location = f'\n            <span class="potw-location">📍 {e(potw["location"])}</span>' if potw.get("location") else ""
    webp = f'\n                <source srcset="{e(potw["webp"])}" type="image/webp">' if potw.get("webp") else ""
    return f"""{POTW_START}
        <div class="potw-content reveal">
          <div class="potw-image">
            <div class="image-frame">
              <picture>{webp}
                <img loading="lazy" src="{e(potw["image"])}" alt="{e(potw.get("alt") or "Picture of the Week - " + potw.get("title", ""))}" width="{int(potw.get("width") or 0)}" height="{int(potw.get("height") or 0)}">
              </picture>
              <div class="frame-corner tl"></div>
              <div class="frame-corner tr"></div>
              <div class="frame-corner bl"></div>
              <div class="frame-corner br"></div>
            </div>
          </div>
          <div class="potw-caption">
            <h3 id="potw-heading">{e(potw.get("title"))}</h3>
            <p>{e(potw.get("caption"))}</p>{location}
          </div>
        </div>
        {POTW_END}"""


def write_potw_html(potw):
    page = HOME_PAGE.read_text(encoding="utf-8")
    start, end = page.find(POTW_START), page.find(POTW_END)
    if start == -1 or end == -1:
        raise RuntimeError("Picture of the Week markers not found in docs/index.html")
    page = page[:start] + render_potw(potw) + page[end + len(POTW_END):]
    HOME_PAGE.write_text(page, encoding="utf-8")


# -----------------------------------------------------------------------------
# Sitemap (pages + image entries so Google Images can find the portfolio)
# -----------------------------------------------------------------------------
def write_sitemap(data):
    x = lambda v: html.escape(v or "", quote=True)
    today = date.today().isoformat()

    def image(url, title):
        return (f"    <image:image>\n      <image:loc>{x(SITE_URL + url)}</image:loc>\n"
                f"      <image:title>{x(title)}</image:title>\n    </image:image>\n")

    images_for = {
        "/portfolio/": [(i["full"], i.get("title", "")) for imgs in data["portfolio"].values() for i in imgs],
        "/": [(data["potw"]["image"], data["potw"].get("title", ""))] if data.get("potw", {}).get("image") else [],
    }
    urls = []
    for path, freq, prio in SITEMAP_PAGES:
        imgs = "".join(image(u, t) for u, t in images_for.get(path, []))
        urls.append(f"  <url>\n    <loc>{SITE_URL}{path}</loc>\n    <lastmod>{today}</lastmod>\n"
                    f"    <changefreq>{freq}</changefreq>\n    <priority>{prio}</priority>\n{imgs}  </url>\n")
    SITEMAP_FILE.write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<!-- Generated by tools/admin (Photo Manager) on publish -->\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
        '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
        + "".join(urls) + "</urlset>\n",
        encoding="utf-8",
    )


# -----------------------------------------------------------------------------
# Git
# -----------------------------------------------------------------------------
def git(*args):
    r = subprocess.run(["git", *args], cwd=REPO, capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()


def git_status():
    _, out = git("status", "--porcelain", "--", "docs")
    return [line for line in out.splitlines() if line.strip()]


def push_with_retry(log):
    code, out = git("push")
    log.append(f"$ git push\n{out}")
    if code != 0 and ("rejected" in out or "fetch first" in out or "non-fast-forward" in out):
        # GitHub changed meanwhile (e.g. a merged pull request): catch up, then push again
        code, out = git("pull", "--rebase", "--autostash")
        log.append(f"$ git pull --rebase --autostash\n{out}")
        if code != 0:
            git("rebase", "--abort")
            return False
        code, out = git("push")
        log.append(f"$ git push\n{out}")
    return code == 0


def unpushed():
    """commits made here that haven't reached GitHub yet (e.g. after a failed upload)"""
    code, out = git("rev-list", "--count", "@{u}..HEAD")
    return int(out) if code == 0 and out.isdigit() else 0


def publish(message):
    log = []
    for args in (["add", "docs"], ["commit", "-m", COMMIT_PREFIX + message]):
        code, out = git(*args)
        log.append(f"$ git {' '.join(args[:1])}\n{out}")
        if code != 0:
            return False, "\n\n".join(log)
    ok = push_with_retry(log)
    return ok, "\n\n".join(log)


# -----------------------------------------------------------------------------
# HTTP
# -----------------------------------------------------------------------------
class Handler(SimpleHTTPRequestHandler):
    # Serve the admin UI at /admin/ and the real site everywhere else (for previews)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE), **kwargs)

    def log_message(self, fmt, *args):
        if args and "/api/" in str(args[0]):  # args[0] can be an HTTPStatus on errors
            sys.stderr.write("  " + (fmt % args) + "\n")

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def host_ok(self):
        # blocks DNS-rebinding: only answer to our own address
        return self.headers.get("Host", "") in (f"localhost:{PORT}", f"127.0.0.1:{PORT}")

    def translate_path(self, path):
        parsed = urlparse(path).path
        if parsed in ("/admin", "/admin/"):
            return str(ADMIN_DIR / "index.html")
        return super().translate_path(path)

    def do_GET(self):
        if not self.host_ok():
            return self.reply({"error": "forbidden"}, 403)
        if urlparse(self.path).path == "/api/data":
            return self.reply(self.state(load_data()))
        return super().do_GET()

    def do_POST(self):
        # Only accept requests from this page (blocks other websites from poking the local server)
        origin = self.headers.get("Origin", "")
        if (
            not self.host_ok()
            or not re.match(rf"^http://(localhost|127\.0\.0\.1):{PORT}$", origin)
            or not self.headers.get("Content-Type", "").startswith("application/json")
        ):
            return self.reply({"error": "forbidden"}, 403)

        length = int(self.headers.get("Content-Length", 0))
        if length > MAX_BODY:
            return self.reply({"error": "Upload too large"}, 413)
        body = json.loads(self.rfile.read(length) or b"{}")
        route = {
            "/api/upload": self.api_upload,
            "/api/save": self.api_save,
            "/api/delete": self.api_delete,
            "/api/potw": self.api_potw,
            "/api/publish": self.api_publish,
            "/api/restore-missing": self.api_restore_missing,
            "/api/remove-missing": self.api_delete,
            "/api/adopt": self.api_adopt,
            "/api/delete-unlisted": self.api_delete_unlisted,
            "/api/trash-restore": self.api_trash_restore,
            "/api/undo-publish": self.api_undo_publish,
        }.get(urlparse(self.path).path)
        if not route:
            return self.reply({"error": "not found"}, 404)
        try:
            self.reply(route(body))
        except Exception as exc:  # show the error in the UI
            self.reply({"error": str(exc)}, 500)

    def state(self, data, **extra):
        """every reply carries the health check, trash and last publish, so the UI stays current"""
        return {"data": data, "changes": git_status(), "unpushed": unpushed(), "health": health(data),
                "trash": [{k: it.get(k) for k in ("id", "title", "category", "deleted", "kind")} for it in load_trash()],
                "lastPublish": last_publish(), **extra}

    def reply(self, payload, status=200):
        raw = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    # --- API -----------------------------------------------------------------
    def api_upload(self, body):
        data = load_data()
        category = slugify(body["category"]).lower()
        title = body.get("title", "").strip() or "Untitled"
        folder = PORTFOLIO_DIR / category
        name = unique_name(folder / "full", slugify(title), ".jpg")

        full, thumb = folder / "full" / name, folder / "thumbnails" / name
        write_data_url(full, body["full"])
        write_data_url(thumb, body["thumbnail"])

        entry = {
            "thumbnail": site_path(thumb),
            "full": site_path(full),
            "alt": body.get("alt", "").strip() or title,
            "title": title,
            "width": int(body.get("width") or 0),
            "height": int(body.get("height") or 0),
        }
        # extra sizes for phones / normal screens (see tools/admin/variants.py)
        if body.get("thumbnailSmall"):
            small = folder / "thumbnails" / "small" / name
            write_data_url(small, body["thumbnailSmall"])
            entry["thumbnailSmall"] = site_path(small)
        if body.get("large"):
            large = folder / "large" / name
            write_data_url(large, body["large"])
            entry["large"] = site_path(large)
        else:
            entry["large"] = entry["full"]
        images = data["portfolio"].setdefault(category, [])
        images.insert(0, entry) if body.get("position") == "start" else images.append(entry)
        save_data(data)
        return self.state(data)

    def api_save(self, body):
        """Save order / titles / categories edited in the UI."""
        data = load_data()
        new_portfolio = body["portfolio"]
        for images in new_portfolio.values():
            for img in images:
                for key in ("full", "thumbnail", "thumbnailSmall", "large"):
                    if key in img and not fs_path(img[key]).is_file():
                        raise ValueError(f"Missing file: {img[key]}")
        data["portfolio"] = new_portfolio
        save_data(data)
        return self.state(data)

    def api_delete(self, body):
        """take a photo off the site; its files go to "Recently deleted" (also used
        for photos whose files were deleted in Finder - whatever is left is kept)"""
        data = load_data()
        for cat, images in data["portfolio"].items():
            match = next((i for i, img in enumerate(images) if img["full"] == body["full"]), None)
            if match is not None:
                entry = images.pop(match)
                break
        else:
            raise ValueError("Photo not found - reload the page")
        save_data(data)
        paths = [entry[k] for k in file_keys(entry) if not is_used_elsewhere(data, entry[k])]
        trash = load_trash()
        trash.insert(0, {"id": f"{date.today().isoformat()}-{len(trash)}-{slugify(entry.get('title', ''))}",
                         "kind": "photo", "title": entry.get("title", ""), "category": cat, "index": match,
                         "entry": entry, "files": move_to_trash(paths), "deleted": date.today().isoformat()})
        save_trash(trash)
        return self.state(data)

    def api_potw(self, body):
        data = load_data()
        potw = dict(data.get("potw") or {})
        for key in ("title", "caption", "location", "alt"):
            if key in body:
                potw[key] = body[key].strip()

        if body.get("image"):
            base = f"{date.today().isoformat()}-{slugify(potw.get('title') or 'potw')}"
            jpg = POTW_DIR / unique_name(POTW_DIR, base, ".jpg")
            write_data_url(jpg, body["image"])
            potw["image"] = site_path(jpg)
            potw["width"], potw["height"] = int(body.get("width") or 0), int(body.get("height") or 0)
            potw.pop("webp", None)
            if body.get("webp"):
                webp = jpg.with_suffix(".webp")
                write_data_url(webp, body["webp"])
                potw["webp"] = site_path(webp)

        if not potw.get("image"):
            raise ValueError("Pick a photo for the Picture of the Week")

        # keep a small history so old weeks are easy to find again
        history = data.setdefault("potwHistory", [])
        if data.get("potw") and data["potw"].get("image") != potw["image"]:
            history.insert(0, {**data["potw"], "replaced": date.today().isoformat()})

        data["potw"] = potw
        save_data(data)
        write_potw_html(potw)
        return self.state(data)

    def api_publish(self, body):
        h = health(load_data())
        if h["missing"] or h["potwMissing"]:
            n = len(h["missing"]) + (1 if h["potwMissing"] else 0)
            raise ValueError(f"Not published: {n} photo(s) are missing files (deleted in Finder?). "
                             "Restore or remove them under 'Needs attention' first.")
        if not git_status():
            if unpushed():
                log = []
                if not push_with_retry(log):        # finish an earlier publish whose upload failed
                    raise RuntimeError("\n\n".join(log))
                return self.state(load_data(), ok=True, log="\n\n".join(log))
            return self.state(load_data(), ok=True, log="Nothing to publish - no changes.")
        write_sitemap(load_data())
        message = body.get("message", "").strip() or "Update photos"
        ok, log = publish(message)
        if not ok:
            raise RuntimeError(log)
        return self.state(load_data(), ok=True, log=log)

    # --- safety --------------------------------------------------------------
    def find(self, data, full):
        for cat, images in data["portfolio"].items():
            for i, img in enumerate(images):
                if img["full"] == full:
                    return cat, i, img
        raise ValueError("Photo not found - reload the page")

    def api_restore_missing(self, body):
        """bring back files deleted in Finder from the last published version"""
        data = load_data()
        _, _, img = self.find(data, body["full"])
        gone = [img[k] for k in file_keys(img) if not fs_path(img[k]).is_file()]
        if not all(in_last_publish(u) for u in gone):
            raise ValueError("This photo was never published, so there is no copy to restore. Remove it instead.")
        for u in gone:
            code, out = git("checkout", "HEAD", "--", "docs" + u)
            if code != 0:
                raise RuntimeError(out)
        return self.state(data)

    def api_adopt(self, body):
        """add a photo that was copied into a category's full/ folder in Finder"""
        data = load_data()
        full = fs_path(body["path"])
        if not full.is_file() or full.parent.name != "full":
            raise ValueError("File not found")
        if any(img["full"] == body["path"] for imgs in data["portfolio"].values() for img in imgs):
            raise ValueError("Already on the site")
        folder, name, category = full.parent.parent, full.name, full.parent.parent.name
        thumb, small = folder / "thumbnails" / name, folder / "thumbnails" / "small" / name
        write_data_url(thumb, body["thumbnail"])
        write_data_url(small, body["thumbnailSmall"])
        title = body.get("title", "").strip() or "Untitled"
        entry = {"thumbnail": site_path(thumb), "full": body["path"],
                 "alt": body.get("alt", "").strip() or title, "title": title,
                 "width": int(body.get("width") or 0), "height": int(body.get("height") or 0),
                 "thumbnailSmall": site_path(small)}
        if body.get("large"):
            large = folder / "large" / name
            write_data_url(large, body["large"])
            entry["large"] = site_path(large)
        else:
            entry["large"] = body["path"]
        data["portfolio"].setdefault(category, []).append(entry)
        save_data(data)
        return self.state(data)

    def api_delete_unlisted(self, body):
        data = load_data()
        if any(img["full"] == body["path"] for imgs in data["portfolio"].values() for img in imgs):
            raise ValueError("This photo is on the site - use its Delete button instead")
        trash = load_trash()
        trash.insert(0, {"id": f"{date.today().isoformat()}-{len(trash)}-file", "kind": "file",
                         "title": Path(body["path"]).name, "category": Path(body["path"]).parent.parent.name,
                         "files": move_to_trash([body["path"]]), "deleted": date.today().isoformat()})
        save_trash(trash)
        return self.state(data)

    def api_trash_restore(self, body):
        trash = load_trash()
        item = next((t for t in trash if t["id"] == body["id"]), None)
        if not item:
            raise ValueError("Not in Recently deleted any more")
        for u in item["files"]:
            if fs_path(u).exists():
                raise ValueError(f"A file with the same name exists again: {u}")
        for u, name in item["files"].items():
            dest = fs_path(u)
            dest.parent.mkdir(parents=True, exist_ok=True)
            (TRASH_DIR / name).rename(dest)
        data = load_data()
        if item["kind"] == "photo":
            images = data["portfolio"].setdefault(item.get("category") or "other", [])
            images.insert(min(item.get("index", len(images)), len(images)), item["entry"])
            save_data(data)
        trash.remove(item)
        save_trash(trash)
        return self.state(data)

    def api_undo_publish(self, body):
        """put the site back to how it was before the last Photo Manager publish"""
        lp = last_publish()
        if not lp or not lp["canUndo"]:
            raise ValueError("The last change on GitHub wasn't made by the Photo Manager, so it can't be undone here.")
        if git_status():
            raise ValueError("You have unpublished changes. Publish them first, then undo.")
        log = []
        code, out = git("revert", "--no-edit", "HEAD")
        log.append(f"$ git revert\n{out}")
        if code != 0:
            git("revert", "--abort")
            raise RuntimeError("\n\n".join(log))
        if not push_with_retry(log):
            raise RuntimeError("\n\n".join(log))
        return self.state(load_data(), ok=True, log="\n\n".join(log))


def main():
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    url = f"http://localhost:{PORT}/admin/"
    print(f"\n  Photo Manager running at {url}\n  Site preview at http://localhost:{PORT}/\n  Press Ctrl+C to stop.\n")
    if "--no-browser" not in sys.argv:
        threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Stopped.")


if __name__ == "__main__":
    main()
