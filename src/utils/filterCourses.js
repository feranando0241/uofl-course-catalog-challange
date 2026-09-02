/**
 * filterCourses.js
 * ================
 * Pure utility functions for filtering and searching the course catalog.
 * These functions are intentionally side-effect free to simplify testing.
 */

import Fuse from 'fuse.js';

// ---------------------------------------------------------------------------
// Fuse.js configuration for fuzzy search
// ---------------------------------------------------------------------------
const FUSE_OPTIONS = {
  // Keys to search across, weighted by relevance
  keys: [
    { name: 'display_title', weight: 0.5 },
    { name: 'descr', weight: 0.35 },
    { name: 'subject', weight: 0.1 },
    { name: 'catalog_nbr', weight: 0.05 },
  ],
  threshold: 0.35,      // 0 = exact match, 1 = match anything
  minMatchCharLength: 2,
  includeScore: true,
  ignoreLocation: true,  // search whole string, not just start
  useExtendedSearch: true,
};

/**
 * Build a Fuse.js instance from the full course list.
 * Memoize outside the hook so it isn't rebuilt on every render.
 *
 * @param {Array<Object>} courses
 * @returns {Fuse}
 */
export function buildFuseIndex(courses) {
  return new Fuse(courses, FUSE_OPTIONS);
}

/**
 * Apply search query, subject filter, and career filter to the course list.
 *
 * @param {Array<Object>} allCourses  - Full course dataset
 * @param {string}        query       - Free-text search input
 * @param {string}        subject     - Selected subject/department ("" = all)
 * @param {string}        idQuery     - Specific course ID search
 * @param {Fuse|null}     fuseIndex   - Pre-built Fuse instance (pass null to skip fuzzy)
 * @returns {Array<Object>} Filtered and sorted courses
 */
export function filterCourses(allCourses, query, subject, career = '', idQuery = '', fuseIndex = null) {
  let results = allCourses;

  // 0. Exact ID match (if provided)
  if (idQuery.trim()) {
    const targetId = idQuery.trim();
    results = results.filter((c) => String(c.crse_id).includes(targetId));
  }

  // 1. Full-text / fuzzy search
  const trimmedQuery = query.trim();
  if (trimmedQuery.length >= 2 && fuseIndex) {
    results = fuseIndex
      .search(trimmedQuery)
      .map((r) => r.item);
  } else if (trimmedQuery.length >= 2) {
    // Fallback: case-insensitive substring match (also searches crse_id)
    const lower = trimmedQuery.toLowerCase();
    results = allCourses.filter((c) =>
      c.display_title.toLowerCase().includes(lower) ||
      c.descr.toLowerCase().includes(lower) ||
      c.subject.toLowerCase().includes(lower) ||
      c.catalog_nbr.toLowerCase().includes(lower)
    );
  }

  // 2. Subject filter
  if (subject) {
    results = results.filter((c) => c.subject === subject);
  }

  // 3. Career / Academic Level filter
  if (career) {
    results = results.filter((c) => c.acad_career === career);
  }

  return results;
}

/**
 * Extract a sorted, deduplicated list of subjects from the course data.
 *
 * @param {Array<Object>} courses
 * @returns {Array<string>}
 */
export function extractSubjects(courses) {
  const subjects = new Set(courses.map((c) => c.subject));
  return Array.from(subjects).sort();
}

// Human-readable labels for academic career codes
export const CAREER_LABELS = {
  UGRD: 'Undergraduate',
  GRAD: 'Graduate',
  LAW:  'Law',
  ME:   'Medical',
  DE:   'Dental',
  PROF: 'Professional',
};

/**
 * Extract a sorted, deduplicated list of academic careers from the course data.
 * Returns objects with { code, label } for display in a dropdown.
 *
 * @param {Array<Object>} courses
 * @returns {Array<{ code: string, label: string }>}
 */
export function extractCareers(courses) {
  const codes = new Set(courses.map((c) => c.acad_career).filter(Boolean));
  return Array.from(codes)
    .sort()
    .map((code) => ({ code, label: CAREER_LABELS[code] ?? code }));
}

/**
 * Paginate an array of items.
 *
 * @param {Array}  items
 * @param {number} page       - 1-based page number
 * @param {number} pageSize
 * @returns {{ items: Array, totalPages: number, total: number }}
 */
export function paginate(items, page, pageSize) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    totalPages,
    total,
    currentPage: safePage,
  };
}

/**
 * Generate page number array with ellipsis markers.
 * E.g. [1, '...', 5, 6, 7, '...', 20]
 *
 * @param {number} currentPage
 * @param {number} totalPages
 * @returns {Array<number|string>}
 */
export function buildPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [];
  const WINDOW = 2; // pages on each side of current

  pages.push(1);

  if (currentPage - WINDOW > 2) pages.push('...');

  for (
    let i = Math.max(2, currentPage - WINDOW);
    i <= Math.min(totalPages - 1, currentPage + WINDOW);
    i++
  ) {
    pages.push(i);
  }

  if (currentPage + WINDOW < totalPages - 1) pages.push('...');

  pages.push(totalPages);

  return pages;
}
