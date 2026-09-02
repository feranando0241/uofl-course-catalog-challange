/**
 * CourseCard.jsx
 * ==============
 * Renders a single course card with subject badge, catalog number, and description.
 * Supports highlighting matched query text.
 */

import { useMemo } from 'react';

/**
 * Highlight occurrences of `query` within `text` by wrapping them in <mark>.
 * Safe against XSS – only wraps plain-text matches.
 *
 * @param {string} text
 * @param {string} query
 * @returns {React.ReactNode}
 */
function HighlightedText({ text, query }) {
  if (!query || query.trim().length < 2) return text;

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i}>{part}</mark> : part
  );
}

/**
 * Map academic career code to a human-readable label.
 */
const CAREER_LABELS = {
  UGRD: 'Undergraduate',
  GRAD: 'Graduate',
  PROF: 'Professional',
  LAW: 'Law',
  DENT: 'Dental',
  MED: 'Medical',
};

export default function CourseCard({ course, query = '', index = 0, onClick }) {
  const { subject, catalog_nbr, descr, acad_career, crse_id } = course;

  const careerLabel = useMemo(
    () => CAREER_LABELS[acad_career] ?? acad_career,
    [acad_career]
  );

  return (
    <article
      className="course-card"
      aria-label={`${subject} ${catalog_nbr} – ${descr}`}
      id={`course-card-${crse_id}`}
      role="button"
      tabIndex="0"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      {/* Card header: subject badge + catalog number */}
      <div className="card-header">
        <span className="card-subject-badge" aria-label={`Subject: ${subject}`}>
          {subject}
        </span>
        <span className="card-catalog-nbr" aria-label={`Catalog number: ${catalog_nbr}`}>
          {catalog_nbr}
        </span>
      </div>

      {/* Course title / description */}
      <h2 className="card-title">
        <HighlightedText text={descr} query={query} />
      </h2>

      <p className="card-description" style={{ fontSize: '0.875rem', color: 'var(--color-uofl-gray)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
        this is a text description
      </p>

      {/* Meta tags row */}
      <div className="card-meta">
        {careerLabel && (
          <span className="card-tag" aria-label={`Academic career: ${careerLabel}`}>
            {careerLabel}
          </span>
        )}
        <span className="card-tag" aria-label={`Course ID: ${crse_id}`}>
          ID: {crse_id}
        </span>
      </div>
    </article>
  );
}
