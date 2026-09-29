#!/usr/bin/env python3
"""
Local photo manager for arturmorin.page

    python3 tools/admin/server.py        (or double-click Photo Manager.command)

Opens http://localhost:8787 with a drag & drop interface that:
  - adds photos to the portfolio (resized full image + thumbnail)
  - reorders / edits / moves / deletes portfolio photos
  - sets the Picture of the Week on the home page
  - publishes the changes (git commit + push -> GitHub Pages)

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


def publish(message):
    log = []
    for args in (["add", "docs"], ["commit", "-m", message], ["push"]):
        code, out = git(*args)
        log.append(f"$ git {' '.join(args[:1])}\n{out}")
        if code != 0:
            return False, "\n\n".join(log)
    return True, "\n\n".join(log)


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
            return self.reply({"data": load_data(), "changes": git_status()})
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
        }.get(urlparse(self.path).path)
        if not route:
            return self.reply({"error": "not found"}, 404)
        try:
            self.reply(route(body))
        except Exception as exc:  # show the error in the UI
            self.reply({"error": str(exc)}, 500)

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
        return {"data": data, "changes": git_status()}

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
        return {"data": data, "changes": git_status()}

    def api_delete(self, body):
        data = load_data()
        for images in data["portfolio"].values():
            match = next((i for i, img in enumerate(images) if img["full"] == body["full"]), None)
            if match is not None:
                entry = images.pop(match)
                break
        else:
            raise ValueError("Photo not found - reload the page")
        save_data(data)
        for key in ("full", "thumbnail", "thumbnailSmall", "large"):
            if entry.get(key) and not is_used_elsewhere(data, entry[key]):
                fs_path(entry[key]).unlink(missing_ok=True)
        return {"data": data, "changes": git_status()}

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
        return {"data": data, "changes": git_status()}

    def api_publish(self, body):
        if not git_status():
            return {"ok": True, "log": "Nothing to publish - no changes.", "changes": []}
        write_sitemap(load_data())
        message = body.get("message", "").strip() or "Update photos"
        ok, log = publish(message)
        if not ok:
            raise RuntimeError(log)
        return {"ok": True, "log": log, "changes": git_status()}


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
