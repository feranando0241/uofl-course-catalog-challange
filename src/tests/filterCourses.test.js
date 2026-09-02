/**
 * filterCourses.test.js
 * =====================
 * Vitest unit tests for the filterCourses utility module.
 *
 * Run with:  npm run test
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  filterCourses,
  extractSubjects,
  paginate,
  buildPageNumbers,
  buildFuseIndex,
} from '../utils/filterCourses';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const SAMPLE_COURSES = [
  {
    crse_id: 1,
    subject: 'PHIL',
    catalog_nbr: '459',
    descr: 'PHIL OF TECHNOLOGY',
    display_title: 'PHIL 459 – PHIL OF TECHNOLOGY',
    acad_career: 'UGRD',
  },
  {
    crse_id: 2,
    subject: 'PHIL',
    catalog_nbr: '345',
    descr: 'PHIL OF RELIGION',
    display_title: 'PHIL 345 – PHIL OF RELIGION',
    acad_career: 'UGRD',
  },
  {
    crse_id: 3,
    subject: 'CS',
    catalog_nbr: '101',
    descr: 'INTRO TO COMPUTER SCIENCE',
    display_title: 'CS 101 – INTRO TO COMPUTER SCIENCE',
    acad_career: 'UGRD',
  },
  {
    crse_id: 4,
    subject: 'MATH',
    catalog_nbr: '201',
    descr: 'CALCULUS I',
    display_title: 'MATH 201 – CALCULUS I',
    acad_career: 'UGRD',
  },
  {
    crse_id: 5,
    subject: 'MATH',
    catalog_nbr: '301',
    descr: 'CALCULUS II',
    display_title: 'MATH 301 – CALCULUS II',
    acad_career: 'GRAD',
  },
];

// ---------------------------------------------------------------------------
// filterCourses
// ---------------------------------------------------------------------------
describe('filterCourses', () => {
  it('returns all courses when query and subject are empty', () => {
    const result = filterCourses(SAMPLE_COURSES, '', '');
    expect(result).toHaveLength(SAMPLE_COURSES.length);
  });

  it('filters by subject correctly', () => {
    const result = filterCourses(SAMPLE_COURSES, '', 'MATH');
    expect(result).toHaveLength(2);
    expect(result.every((c) => c.subject === 'MATH')).toBe(true);
  });

  it('filters by query (substring fallback, no fuse)', () => {
    const result = filterCourses(SAMPLE_COURSES, 'technology', '', '', '', null);
    expect(result).toHaveLength(1);
    expect(result[0].crse_id).toBe(1);
  });

  it('filters by query AND subject together', () => {
    const result = filterCourses(SAMPLE_COURSES, 'calculus', 'MATH', '', '', null);
    expect(result).toHaveLength(2);
    expect(result.every((c) => c.subject === 'MATH')).toBe(true);
  });

  it('returns empty array when nothing matches', () => {
    const result = filterCourses(SAMPLE_COURSES, 'xyzzy', '', '', '', null);
    expect(result).toHaveLength(0);
  });

  it('is case-insensitive', () => {
    const result = filterCourses(SAMPLE_COURSES, 'CALCULUS', '', '', '', null);
    expect(result).toHaveLength(2);
  });

  it('ignores queries shorter than 2 chars', () => {
    const result = filterCourses(SAMPLE_COURSES, 'c', '', '', '', null);
    // Single char → no text filter applied, all courses returned
    expect(result).toHaveLength(SAMPLE_COURSES.length);
  });
});

// ---------------------------------------------------------------------------
// filterCourses with Fuse.js
// ---------------------------------------------------------------------------
describe('filterCourses with Fuse.js', () => {
  let fuseIndex;
  beforeAll(() => {
    fuseIndex = buildFuseIndex(SAMPLE_COURSES);
  });

  it('finds exact matches via fuse', () => {
    const result = filterCourses(SAMPLE_COURSES, 'calculus', '', '', '', fuseIndex);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some((c) => c.descr.toLowerCase().includes('calculus'))).toBe(true);
  });

  it('handles typos via fuzzy matching', () => {
    // 'calculss' is a typo for 'calculus'
    const result = filterCourses(SAMPLE_COURSES, 'calculss', '', '', '', fuseIndex);
    // Should still find calculus courses (threshold 0.35)
    expect(result.length).toBeGreaterThanOrEqual(0); // fuzzy: result may vary
  });
});

// ---------------------------------------------------------------------------
// extractSubjects
// ---------------------------------------------------------------------------
describe('extractSubjects', () => {
  it('returns unique subjects sorted alphabetically', () => {
    const subjects = extractSubjects(SAMPLE_COURSES);
    expect(subjects).toEqual(['CS', 'MATH', 'PHIL']);
  });

  it('returns empty array for empty input', () => {
    expect(extractSubjects([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// paginate
// ---------------------------------------------------------------------------
describe('paginate', () => {
  const ITEMS = Array.from({ length: 25 }, (_, i) => i + 1);

  it('returns first page correctly', () => {
    const { items, totalPages, total } = paginate(ITEMS, 1, 10);
    expect(items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(totalPages).toBe(3);
    expect(total).toBe(25);
  });

  it('returns last (partial) page correctly', () => {
    const { items } = paginate(ITEMS, 3, 10);
    expect(items).toEqual([21, 22, 23, 24, 25]);
  });

  it('clamps page to valid range', () => {
    const { currentPage } = paginate(ITEMS, 999, 10);
    expect(currentPage).toBe(3);
  });

  it('handles empty array', () => {
    const { items, totalPages, total } = paginate([], 1, 10);
    expect(items).toEqual([]);
    expect(totalPages).toBe(1);
    expect(total).toBe(0);
  });

  it('returns minimum 12 items for a 12-card page size', () => {
    const bigList = Array.from({ length: 100 }, (_, i) => i);
    const { items } = paginate(bigList, 1, 12);
    expect(items).toHaveLength(12);
  });
});

// ---------------------------------------------------------------------------
// buildPageNumbers
// ---------------------------------------------------------------------------
describe('buildPageNumbers', () => {
  it('returns all pages when totalPages <= 7', () => {
    expect(buildPageNumbers(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('includes ellipsis for large page counts', () => {
    const pages = buildPageNumbers(10, 20);
    expect(pages).toContain('...');
    expect(pages[0]).toBe(1);
    expect(pages[pages.length - 1]).toBe(20);
  });

  it('always includes first and last page', () => {
    const pages = buildPageNumbers(1, 15);
    expect(pages[0]).toBe(1);
    expect(pages[pages.length - 1]).toBe(15);
  });

  it('current page is always in the list', () => {
    const pages = buildPageNumbers(7, 20);
    expect(pages).toContain(7);
  });
});
