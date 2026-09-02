/**
 * Pagination.jsx
 * ==============
 * Numbered page controls with ellipsis, prev/next buttons.
 * Accessible with proper ARIA roles.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildPageNumbers } from '../utils/filterCourses';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Don't render pagination when there's only one page
  if (totalPages <= 1) return null;

  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  return (
    <nav
      className="pagination-wrapper"
      aria-label="Course catalog pagination"
      role="navigation"
    >
      {/* Previous button */}
      <button
        className="page-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Go to previous page"
        id="pagination-prev"
        type="button"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page number buttons */}
      {pageNumbers.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="page-ellipsis" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={page}
            className={`page-btn${currentPage === page ? ' page-btn--active' : ''}`}
            onClick={() => onPageChange(page)}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
            id={`pagination-page-${page}`}
            type="button"
          >
            {page}
          </button>
        )
      )}

      {/* Next button */}
      <button
        className="page-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Go to next page"
        id="pagination-next"
        type="button"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
