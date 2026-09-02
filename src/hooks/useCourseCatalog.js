/**
 * useCourseCatalog.js
 * ===================
 * Central state management hook for the UofL Course Catalog.
 * Manages: data loading, search query, subject filter, pagination.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  buildFuseIndex,
  filterCourses,
  extractSubjects,
  extractCareers,
  paginate,
} from '../utils/filterCourses';

const PAGE_SIZE = 12; // cards per page

// Resolve the correct data URL based on whether we're on GitHub Pages or local
const DATA_URL = `${import.meta.env.BASE_URL}data/courses.json`;

/**
 * @returns {{
 *   courses: Array,
 *   subjects: Array<string>,
 *   query: string,
 *   subject: string,
 *   currentPage: number,
 *   totalPages: number,
 *   totalResults: number,
 *   totalCourses: number,
 *   loading: boolean,
 *   error: string|null,
 *   setQuery: Function,
 *   setSubject: Function,
 *   setPage: Function,
 *   resetFilters: Function,
 * }}
 */
export function useCourseCatalog() {
  // ── Raw data state ──────────────────────────────────────────────────────
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Filter / pagination state ───────────────────────────────────────────
  const [query, setQueryRaw] = useState('');
  const [subject, setSubjectRaw] = useState('');
  const [career, setCareerRaw] = useState('');
  const [idQuery, setIdQueryRaw] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Load data once on mount ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(DATA_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const json = await res.json();
        if (!cancelled) {
          setAllCourses(json.data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[useCourseCatalog] Failed to load courses.json:', err);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Build Fuse.js index whenever the full dataset changes ───────────────
  const fuseIndex = useMemo(
    () => (allCourses.length ? buildFuseIndex(allCourses) : null),
    [allCourses]
  );

  // ── Extract subjects & careers ─────────────────────────────────────────
  const subjects = useMemo(() => extractSubjects(allCourses), [allCourses]);
  const careers  = useMemo(() => extractCareers(allCourses),  [allCourses]);

  // ── Filtered results ────────────────────────────────────────────────────
  const filteredCourses = useMemo(
    () => filterCourses(allCourses, query, subject, career, idQuery, fuseIndex),
    [allCourses, query, subject, career, idQuery, fuseIndex]
  );

  // ── Paginated slice ─────────────────────────────────────────────────────
  const { items: courses, totalPages, total: totalResults } = useMemo(
    () => paginate(filteredCourses, currentPage, PAGE_SIZE),
    [filteredCourses, currentPage]
  );

  // ── Setters – always reset to page 1 when filters change ───────────────
  const setQuery = useCallback((q) => {
    setQueryRaw(q);
    setCurrentPage(1);
  }, []);

  const setSubject = useCallback((s) => {
    setSubjectRaw(s);
    setCurrentPage(1);
  }, []);

  const setCareer = useCallback((c) => {
    setCareerRaw(c);
    setCurrentPage(1);
  }, []);

  const setIdQuery = useCallback((id) => {
    setIdQueryRaw(id);
    setCurrentPage(1);
  }, []);

  const setPage = useCallback((p) => {
    setCurrentPage(p);
    // Scroll to top of grid smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const resetFilters = useCallback(() => {
    setQueryRaw('');
    setSubjectRaw('');
    setCareerRaw('');
    setIdQueryRaw('');
    setCurrentPage(1);
  }, []);

  return {
    courses,
    subjects,
    careers,
    query,
    subject,
    career,
    idQuery,
    currentPage,
    totalPages,
    totalResults,
    totalCourses: allCourses.length,
    loading,
    error,
    setQuery,
    setSubject,
    setCareer,
    setIdQuery,
    setPage,
    resetFilters,
  };
}
