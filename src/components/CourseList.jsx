/**
 * CourseList.jsx
 * ==============
 * Renders a responsive grid of CourseCard components.
 * Handles loading, error, and empty states gracefully.
 */

import CourseCard from './CourseCard';

export default function CourseList({ courses, query, loading, error, onReset, onSelectCourse }) {
  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-wrapper" role="status" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true" />
        <p className="loading-text">Loading course catalog…</p>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="error-wrapper" role="alert">
        <div className="error-icon">⚠️</div>
        <h2 className="error-title">Failed to load catalog</h2>
        <p className="error-desc">{error}</p>
      </div>
    );
  }

  return (
    <main id="course-list" aria-label="Course catalog grid">
      <div className="course-grid" role="list">
        {/* ── Empty state ──────────────────────────────────────────────── */}
        {courses.length === 0 ? (
          <div className="empty-state" role="status" aria-live="polite">
            <div className="empty-state-icon">🎓</div>
            <h2 className="empty-state-title">No courses found</h2>
            <p className="empty-state-desc">
              No courses match your current search or filter criteria.
            </p>
            <button
              className="btn-reset"
              onClick={onReset}
              id="reset-filters-btn"
              type="button"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          courses.map((course, index) => (
            <div key={course.crse_id} role="listitem">
              <CourseCard 
                course={course} 
                query={query} 
                index={index} 
                onClick={() => onSelectCourse(course)} 
              />
            </div>
          ))
        )}
      </div>
    </main>
  );
}
