#!/usr/bin/env python3
"""Build the retained KDC site with local advocate data and the embedded बहस form."""
import hashlib
import json
from pathlib import Path
import shutil

SOURCE = Path(__file__).resolve().parents[1]
OUTPUT = SOURCE / "dist"


def build():
    records = json.loads((SOURCE / "advocatedata.json").read_text(encoding="utf-8"))
    if not isinstance(records, list) or not records:
        raise ValueError("advocatedata.json must contain a nonempty record array")
    for number, record in enumerate(records, 1):
        if not isinstance(record, dict) or not record.get("name") or not record.get("licenceNo"):
            raise ValueError(f"Advocate record {number} needs name and licenceNo")
    script = ("/* Generated from advocatedata.json. */\nwindow.ADVOCATE_DATA = "
              + json.dumps(records, ensure_ascii=False, separators=(",", ":")) + ";\n").encode()
    data_name = "advocatedata." + hashlib.sha256(script).hexdigest()[:16] + ".js"
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()
    for path in SOURCE.iterdir():
        if path.is_file() and path.suffix in {".html", ".js", ".css", ".txt", ".json"}:
            shutil.copyfile(path, OUTPUT / path.name)
    for name in ("order", "inputs", "assets"):
        if (SOURCE / name).is_dir():
            shutil.copytree(SOURCE / name, OUTPUT / name)
    form = (SOURCE / "bahas.html").read_text(encoding="utf-8")
    tag = '<script src="advocatedata.js"></script>'
    if form.count(tag) != 1:
        raise ValueError("bahas.html must load advocatedata.js exactly once")
    (OUTPUT / "bahas.html").write_text(form.replace(tag, f'<script src="{data_name}"></script>'), encoding="utf-8")
    (OUTPUT / data_name).write_bytes(script)
    (OUTPUT / "advocatedata.js").write_bytes(script)
    (OUTPUT / ".nojekyll").touch()
    print(f"Built kdcwithbhas with {len(records):,} advocate records")


if __name__ == "__main__":
    build()
