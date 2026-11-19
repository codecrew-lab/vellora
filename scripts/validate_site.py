#!/usr/bin/env python3
"""Small, dependency-free smoke checks for the VELLORA static website.

This validates repository structure and important security/design invariants.
It does not replace real browser, Supabase or accessibility testing.
"""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
ERRORS = []


def fail(message):
    ERRORS.append(message)


class SiteParser(HTMLParser):
    def __init__(self, filename):
        super().__init__(convert_charrefs=True)
        self.filename = filename
        self.ids = set()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        element_id = attrs.get("id")
        if element_id:
            if element_id in self.ids:
                fail(f"{self.filename}: duplicate id '{element_id}'")
            self.ids.add(element_id)

        for attribute in ("href", "src"):
            value = attrs.get(attribute, "")
            if value:
                self.references.append((attribute, value))

        label_target = attrs.get("for")
        if label_target:
            self.references.append(("for", label_target))


def check_html(filename):
    path = ROOT / filename
    if not path.is_file():
        fail(f"Missing required page: {filename}")
        return

    parser = SiteParser(filename)
    try:
        parser.feed(path.read_text(encoding="utf-8"))
        parser.close()
    except Exception as exc:
        fail(f"{filename}: HTML parsing failed: {exc}")
        return

    for attribute, value in parser.references:
        if attribute == "for":
            if value not in parser.ids:
                fail(f"{filename}: label points to missing id '#{value}'")
            continue

        if value.startswith("#"):
            target = value[1:]
            if target and target not in parser.ids:
                fail(f"{filename}: link points to missing id '#{target}'")
            continue

        if re.match(r"^(https?:|mailto:|tel:|data:|javascript:)", value, re.I):
            continue

        local_path = value.split("#", 1)[0].split("?", 1)[0]
        if not local_path:
            continue
        target = (path.parent / local_path).resolve()
        if not target.exists():
            fail(f"{filename}: {attribute} references missing file '{value}'")


def require_text(filename, snippets):
    path = ROOT / filename
    if not path.is_file():
        fail(f"Missing required file: {filename}")
        return
    content = path.read_text(encoding="utf-8")
    for snippet, description in snippets:
        if snippet not in content:
            fail(f"{filename}: missing {description}")


def main():
    for required in ("index.html", "admin.html", "styles.css", "admin.css", "app.js", "admin.js", ".nojekyll"):
        if not (ROOT / required).is_file():
            fail(f"Missing required project file: {required}")

    check_html("index.html")
    check_html("admin.html")

    require_text("index.html", [
        ('class="cover-panel cover-left"', "left manuscript cover panel"),
        ('class="cover-panel cover-right"', "right manuscript cover panel"),
        ('id="openWorld"', "opening interaction"),
    ])
    require_text("styles.css", [
        (".theme-manuscript", "Enhanced Manuscript theme"),
        (".theme-vellum", "Classic Vellum theme"),
        (".theme-dark", "Dark Heritage theme"),
    ])
    require_text("app.js", [
        ('is_published: "eq.true"', "published-only public book query"),
        ('const STORAGE_BUCKET = "book-files"', "private PDF bucket configuration"),
        ("expiresIn: 3600", "short-lived signed PDF URL"),
    ])
    require_text("admin.js", [
        ('user.app_metadata.role !== "admin"', "trusted admin-role check"),
        ('const PDF_BUCKET = "book-files"', "private admin PDF bucket"),
        ("application/pdf", "PDF upload content type validation"),
    ])

    for filename in ("app.js", "admin.js"):
        path = ROOT / filename
        if path.is_file():
            source = path.read_text(encoding="utf-8").lower()
            if "service_role" in source or "service-role" in source or "sb_secret_" in source:
                fail(f"{filename}: a server-only Supabase credential pattern was found")

    if ERRORS:
        print("VELLORA validation failed:")
        for error in ERRORS:
            print(f" - {error}")
        return 1

    print("VELLORA static checks passed.")
    print("Checked page references, duplicate IDs, core theme/animation markers,")
    print("published-only library access, signed private PDF flow and admin-role guard.")
    print("Reminder: run the manual browser and Supabase checks in TESTING.md before launch.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
