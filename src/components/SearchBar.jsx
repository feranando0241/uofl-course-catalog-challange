/**
 * SearchBar.jsx
 * =============
 * Controlled search input with live filtering and clear button.
 */

import { useRef } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ query, onQueryChange }) {
  const inputRef = useRef(null);

  function handleClear() {
    onQueryChange('');
    inputRef.current?.focus();
  }

  return (
    <div className="search-wrapper" role="search">
      <Search className="search-icon" aria-hidden="true" size={18} />

      <input
        ref={inputRef}
        id="course-search"
        type="search"
        className="search-input"
        placeholder="Search by title, subject, description…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        aria-label="Search courses by title, subject, description"
        autoComplete="off"
        spellCheck="false"
      />

      {/* Clear button – only visible when query is non-empty */}
      {query && (
        <button
          className="search-clear"
          onClick={handleClear}
          aria-label="Clear search"
          type="button"
          id="search-clear-btn"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
