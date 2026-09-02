/**
 * SubjectFilter.jsx
 * =================
 * Dropdown selector populated from unique subject values in the catalog.
 */

import { Filter } from 'lucide-react';

export default function SubjectFilter({ subjects, selected, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Filter
        size={16}
        aria-hidden="true"
        style={{ color: 'var(--color-uofl-gray)', flexShrink: 0 }}
      />
      <select
        id="subject-filter"
        className="filter-select"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter by subject or department"
      >
        <option value="">All Subjects</option>
        {subjects.map((subj) => (
          <option key={subj} value={subj}>
            {subj}
          </option>
        ))}
      </select>
    </div>
  );
}
