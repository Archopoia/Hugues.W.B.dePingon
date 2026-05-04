#!/usr/bin/env python3
"""Extract DiVA jqPlot/PrimeFaces chart series from record HTML.

LiU often serves a bot interstitial to non-browser clients. Prefer passing HTML path:
  curl -fsSL -A "Mozilla/5.0 ..." "https://liu.diva-portal.org/...record...pid=diva2:2034306" -o /tmp/diva.html
  python3 scripts/update_diva_biocracy_stats.py /tmp/diva.html

Or set env DIVA_HTML_FILE to a local file path.
"""
from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

RECORD_URL = "https://liu.diva-portal.org/smash/record.jsf?pid=diva2:2034306"
OUT_PATH = Path(__file__).resolve().parent.parent / "data" / "biocracy-diva-stats.json"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)


def fetch_html(url: str) -> str:
    req = Request(url, headers={"User-Agent": USER_AGENT, "Accept-Language": "en-GB,en;q=0.9"})
    with urlopen(req, timeout=90) as resp:
        return resp.read().decode("utf-8", "replace")


def load_html() -> str:
    if len(sys.argv) > 1:
        return Path(sys.argv[1]).read_text(encoding="utf-8", errors="replace")
    env_path = os.environ.get("DIVA_HTML_FILE")
    if env_path:
        return Path(env_path).read_text(encoding="utf-8", errors="replace")
    return fetch_html(RECORD_URL)


def parse_labels(html: str) -> list[str]:
    m = re.search(r'ticks:\[(.*?)\],orientation:\s*"vertical"', html)
    if not m:
        if "not a bot" in html.lower() or "within.website" in html:
            raise ValueError(
                "Received bot interstitial instead of DiVA record HTML. "
                "Fetch with curl (browser UA) and pass file path as argv[1], "
                "or set DIVA_HTML_FILE."
            )
        raise ValueError("Could not find ticks:[...],orientation block")
    return re.findall(r'"([^"]*)"', m.group(1))


def parse_series_pairs(html: str) -> tuple[list[int], list[int]]:
    """First data:[[...]] = downloads file; second = visits (DiVA page order)."""
    blocks = re.findall(r"data:\[\[([\d,\s]+)\]\]", html)
    if len(blocks) < 2:
        raise ValueError(f"Expected at least 2 data:[[...]] series, found {len(blocks)}")
    downloads = [int(x.strip()) for x in blocks[0].split(",") if x.strip()]
    visits = [int(x.strip()) for x in blocks[1].split(",") if x.strip()]
    return downloads, visits


def parse_totals(html: str) -> tuple[int, int]:
    dm = re.search(r"Total:\s*(\d+)\s+downloads", html, re.I)
    vm = re.search(r"Total:\s*(\d+)\s+hits", html, re.I)
    if not dm or not vm:
        raise ValueError("Could not parse Total downloads / Total hits")
    return int(dm.group(1)), int(vm.group(1))


def main() -> int:
    html = load_html()
    labels = parse_labels(html)
    dl_series, vis_series = parse_series_pairs(html)
    dl_total, vis_total = parse_totals(html)

    if len(labels) != len(dl_series) or len(labels) != len(vis_series):
        raise ValueError(
            f"Label count {len(labels)} vs series len {len(dl_series)}, {len(vis_series)}"
        )

    payload = {
        "sourceUrl": RECORD_URL,
        "scrapedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "downloads": {
            "title": "Downloads of File (FULLTEXT02)",
            "total": dl_total,
            "series": dl_series,
            "labels": labels,
        },
        "visits": {
            "title": "Visits for this publication",
            "total": vis_total,
            "series": vis_series,
            "labels": labels,
        },
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {OUT_PATH}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise SystemExit(1)
