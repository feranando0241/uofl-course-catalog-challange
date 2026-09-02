#!/usr/bin/env python3
"""
convert_csv_to_json.py
======================
Reads the UofL course catalog CSV file and converts it to a structured
JSON format suitable for the React frontend. Deduplicates rows by CRSE_ID
so each course appears only once, regardless of how many sections exist.

Usage:
    python scripts/convert_csv_to_json.py

Output:
    public/data/courses.json
"""

import csv
import json
import os
import sys


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

# CSV may live either in Agents_and_Plan (original location) or on the Desktop
_desktop_csv = os.path.join(os.path.expanduser("~"), "Desktop", "catalog dev[8][56].csv")
_local_csv = os.path.join(PROJECT_ROOT, "Agents_and_Plan", "catalog dev[8][56].csv")
CSV_PATH = _local_csv if os.path.exists(_local_csv) else _desktop_csv
OUTPUT_PATH = os.path.join(PROJECT_ROOT, "public", "data", "courses.json")

# Fields we extract from the CSV
REQUIRED_FIELDS = {"CRSE_ID", "SUBJECT", "CATALOG_NBR", "DESCR"}


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------
def sanitize_string(value: str) -> str:
    """Strip whitespace and collapse inner whitespace runs."""
    if not isinstance(value, str):
        return ""
    return " ".join(value.split())


def build_course_record(row: dict) -> dict | None:
    """
    Build a single course dict from a CSV row.
    Returns None if required fields are missing or empty.
    """
    crse_id_raw = row.get("CRSE_ID", "").strip()
    subject = sanitize_string(row.get("SUBJECT", ""))
    catalog_nbr = sanitize_string(row.get("CATALOG_NBR", ""))
    descr = sanitize_string(row.get("DESCR", ""))
    acad_group = sanitize_string(row.get("ACAD_GROUP", ""))
    acad_career = sanitize_string(row.get("ACAD_CAREER", ""))

    # Validate required fields
    if not all([crse_id_raw, subject, catalog_nbr, descr]):
        return None

    try:
        crse_id = int(crse_id_raw)
    except ValueError:
        return None

    return {
        "crse_id": crse_id,
        "subject": subject,
        "catalog_nbr": catalog_nbr,
        "descr": descr,
        "acad_group": acad_group,
        "acad_career": acad_career,
        # Derived display label used by the frontend
        "display_title": f"{subject} {catalog_nbr} – {descr}",
    }


# ---------------------------------------------------------------------------
# Main conversion logic
# ---------------------------------------------------------------------------
def convert(csv_path: str, output_path: str) -> int:
    """
    Read the CSV, deduplicate by CRSE_ID, and write the JSON file.
    Returns the number of unique courses written.
    """
    if not os.path.exists(csv_path):
        print(f"ERROR: CSV file not found at '{csv_path}'", file=sys.stderr)
        sys.exit(1)

    seen_ids: set[int] = set()
    courses: list[dict] = []

    print(f"Reading CSV from: {csv_path}")

    with open(csv_path, newline="", encoding="utf-8-sig") as fh:
        reader = csv.DictReader(fh)

        # Normalise header names – strip whitespace & trailing underscores
        # The sample JSON uses CATALOG_NBR_ (with trailing underscore) but the
        # actual CSV header may vary; handle both.
        raw_headers = reader.fieldnames or []
        normalized = {h: h.strip().rstrip("_") for h in raw_headers}

        for raw_row in reader:
            # Build a normalised row
            row = {normalized[k]: v for k, v in raw_row.items()}

            record = build_course_record(row)
            if record is None:
                continue

            crse_id = record["crse_id"]
            if crse_id in seen_ids:
                # Skip duplicate sections – keep first occurrence
                continue

            seen_ids.add(crse_id)
            courses.append(record)

    # Sort alphabetically by subject then catalog number for a consistent order
    courses.sort(key=lambda c: (c["subject"], c["catalog_nbr"]))

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    payload = {"data": courses}
    with open(output_path, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2, ensure_ascii=False)

    print(f"✅  Wrote {len(courses)} unique courses → {output_path}")
    return len(courses)


if __name__ == "__main__":
    convert(CSV_PATH, OUTPUT_PATH)
