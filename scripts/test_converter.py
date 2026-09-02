#!/usr/bin/env python3
"""
test_converter.py
=================
Unit tests for the CSV → JSON conversion pipeline.

Usage:
    python -m unittest scripts/test_converter.py
"""

import json
import os
import sys
import tempfile
import unittest

# Make the scripts package importable when run from project root
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

from convert_csv_to_json import build_course_record, sanitize_string, convert


# ---------------------------------------------------------------------------
# Unit tests
# ---------------------------------------------------------------------------
class TestSanitizeString(unittest.TestCase):
    def test_strips_whitespace(self):
        self.assertEqual(sanitize_string("  hello  "), "hello")

    def test_collapses_inner_spaces(self):
        self.assertEqual(sanitize_string("hello   world"), "hello world")

    def test_non_string_returns_empty(self):
        self.assertEqual(sanitize_string(None), "")
        self.assertEqual(sanitize_string(42), "")

    def test_empty_string(self):
        self.assertEqual(sanitize_string(""), "")


class TestBuildCourseRecord(unittest.TestCase):
    def _base_row(self, **overrides):
        row = {
            "CRSE_ID": "17844",
            "SUBJECT": "PHIL",
            "CATALOG_NBR": "459",
            "DESCR": "PHIL OF TECHNOLOGY",
            "ACAD_GROUP": "AS",
            "ACAD_CAREER": "UGRD",
        }
        row.update(overrides)
        return row

    def test_valid_row_produces_record(self):
        record = build_course_record(self._base_row())
        self.assertIsNotNone(record)
        self.assertEqual(record["crse_id"], 17844)
        self.assertEqual(record["subject"], "PHIL")
        self.assertEqual(record["catalog_nbr"], "459")
        self.assertEqual(record["descr"], "PHIL OF TECHNOLOGY")

    def test_display_title_format(self):
        record = build_course_record(self._base_row())
        self.assertEqual(record["display_title"], "PHIL 459 – PHIL OF TECHNOLOGY")

    def test_missing_subject_returns_none(self):
        self.assertIsNone(build_course_record(self._base_row(SUBJECT="")))

    def test_missing_catalog_nbr_returns_none(self):
        self.assertIsNone(build_course_record(self._base_row(CATALOG_NBR="")))

    def test_missing_descr_returns_none(self):
        self.assertIsNone(build_course_record(self._base_row(DESCR="")))

    def test_non_numeric_crse_id_returns_none(self):
        self.assertIsNone(build_course_record(self._base_row(CRSE_ID="ABC")))

    def test_whitespace_in_fields_is_sanitized(self):
        record = build_course_record(
            self._base_row(SUBJECT="  PHIL  ", DESCR="  PHIL OF TECH  ")
        )
        self.assertEqual(record["subject"], "PHIL")
        self.assertEqual(record["descr"], "PHIL OF TECH")


class TestConvertFunction(unittest.TestCase):
    """Integration test: write a temporary CSV, convert it, validate output."""

    CSV_HEADER = (
        "CRSE_ID,CRSE_OFFER_NBR,STRM,SESSION_CODE,CLASS_SECTION,"
        "INSTITUTION,ACAD_GROUP,SUBJECT,CATALOG_NBR,ACAD_CAREER,DESCR\n"
    )

    def _write_csv(self, rows: list[str]) -> str:
        tmp = tempfile.NamedTemporaryFile(
            mode="w", suffix=".csv", delete=False, encoding="utf-8"
        )
        tmp.write(self.CSV_HEADER)
        for row in rows:
            tmp.write(row + "\n")
        tmp.close()
        return tmp.name

    def _convert_and_load(self, csv_rows: list[str]) -> list[dict]:
        csv_path = self._write_csv(csv_rows)
        out_dir = tempfile.mkdtemp()
        out_path = os.path.join(out_dir, "courses.json")
        try:
            convert(csv_path, out_path)
            with open(out_path, encoding="utf-8") as fh:
                return json.load(fh)["data"]
        finally:
            os.unlink(csv_path)

    def test_output_has_data_key(self):
        csv_path = self._write_csv(
            ["17844,1,4258,1,10,UOFL1,AS,PHIL,459,UGRD,PHIL OF TECHNOLOGY"]
        )
        out_path = os.path.join(tempfile.mkdtemp(), "courses.json")
        convert(csv_path, out_path)
        with open(out_path) as fh:
            payload = json.load(fh)
        self.assertIn("data", payload)
        os.unlink(csv_path)

    def test_deduplication_by_crse_id(self):
        rows = [
            # Same CRSE_ID, different sections – should count as 1
            "17844,1,4258,1,10,UOFL1,AS,PHIL,459,UGRD,PHIL OF TECHNOLOGY",
            "17844,1,4258,1,11,UOFL1,AS,PHIL,459,UGRD,PHIL OF TECHNOLOGY",
            # Different CRSE_ID
            "99999,1,4258,1,01,UOFL1,AS,CS,101,UGRD,INTRO TO CS",
        ]
        data = self._convert_and_load(rows)
        self.assertEqual(len(data), 2)

    def test_required_fields_present(self):
        rows = ["17844,1,4258,1,10,UOFL1,AS,PHIL,459,UGRD,PHIL OF TECHNOLOGY"]
        data = self._convert_and_load(rows)
        record = data[0]
        for field in ("crse_id", "subject", "catalog_nbr", "descr", "display_title"):
            self.assertIn(field, record, f"Missing field: {field}")

    def test_invalid_rows_are_skipped(self):
        rows = [
            # Valid
            "17844,1,4258,1,10,UOFL1,AS,PHIL,459,UGRD,PHIL OF TECHNOLOGY",
            # Missing subject
            "99998,1,4258,1,10,UOFL1,AS,,459,UGRD,SOMETHING",
            # Non-numeric CRSE_ID
            "BAD,1,4258,1,10,UOFL1,AS,CS,101,UGRD,INTRO",
        ]
        data = self._convert_and_load(rows)
        self.assertEqual(len(data), 1)

    def test_sorted_alphabetically(self):
        rows = [
            "2,1,4258,1,10,UOFL1,AS,ZOOL,101,UGRD,INTRO ZOOLOGY",
            "1,1,4258,1,10,UOFL1,AS,ANTH,101,UGRD,INTRO ANTHROPOLOGY",
        ]
        data = self._convert_and_load(rows)
        self.assertEqual(data[0]["subject"], "ANTH")
        self.assertEqual(data[1]["subject"], "ZOOL")


if __name__ == "__main__":
    unittest.main()
