/**
 * App.jsx
 * =======
 * Root layout component for the UofL Course Catalog SPA.
 */

import Header from './components/Header';
import SearchBar from './components/SearchBar';
import SubjectFilter from './components/SubjectFilter';
import CareerFilter from './components/CareerFilter';
import CourseList from './components/CourseList';
import Pagination from './components/Pagination';
import CourseModal from './components/CourseModal';
import { useCourseCatalog } from './hooks/useCourseCatalog';
import { useState } from 'react';

export default function App() {
  const {
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
    totalCourses,
    loading,
    error,
    setQuery,
    setSubject,
    setCareer,
    setIdQuery,
    setPage,
    resetFilters,
  } = useCourseCatalog();

  const [selectedCourse, setSelectedCourse] = useState(null);

  // Is any filter currently active?
  const isFiltered = query.trim().length > 0 || subject !== '' || career !== '' || idQuery.trim().length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <Header totalCourses={totalCourses} />

      {/* ── Sticky controls bar (search + filter) ─────────────────────────── */}
      <div className="controls-bar">
        <div className="controls-inner">
          <SearchBar query={query} onQueryChange={setQuery} />
          <SubjectFilter
            subjects={subjects}
            selected={subject}
            onChange={setSubject}
          />
          <CareerFilter
            careers={careers}
            selected={career}
            onChange={setCareer}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', maxWidth: '200px' }} aria-label="Course ID Filter">
            <span style={{ color: 'var(--color-uofl-gray)', fontWeight: 600 }}>#</span>
            <input
              type="text"
              placeholder="Exact Course ID"
              value={idQuery}
              onChange={(e) => setIdQuery(e.target.value)}
              className="search-input"
              style={{ flex: 1, padding: '0.625rem 1rem' }}
            />
          </div>
        </div>
      </div>

      {/* ── Results count bar ─────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="results-bar">
          <p className="results-count">
            Showing{' '}
            <strong>
              {Math.min((currentPage - 1) * 12 + 1, totalResults)}–
              {Math.min(currentPage * 12, totalResults)}
            </strong>{' '}
            of <strong>{totalResults.toLocaleString()}</strong> course
            {totalResults !== 1 ? 's' : ''}
            {isFiltered && (
              <span style={{ color: 'var(--color-uofl-gray)' }}>
                {' '}(filtered from {totalCourses.toLocaleString()} total)
              </span>
            )}
          </p>

          {/* Quick-reset link when filters are active */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-uofl-red)',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
              id="results-bar-reset"
              type="button"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Course grid ───────────────────────────────────────────────────── */}
      <CourseList
        courses={courses}
        query={query}
        loading={loading}
        error={error}
        onReset={resetFilters}
        onSelectCourse={setSelectedCourse}
      />

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {!loading && !error && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {selectedCourse && (
        <CourseModal 
          course={selectedCourse} 
          onClose={() => setSelectedCourse(null)} 
        />
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="app-footer">
        <p>
          © {new Date().getFullYear()}{' '}
          <a
            href="https://louisville.edu"
            target="_blank"
            rel="noopener noreferrer"
          >
            University of Louisville
          </a>
          {' · '}Built for the UofL Integrative Design &amp; Development Challenge
        </p>
      </footer>
    </div>
  );
}
