/**
 * CareerFilter.jsx
 * ================
 * Dropdown selector to filter courses by Academic Career / Level.
 * Options: Undergraduate, Graduate, Law, Medical, Dental.
 */

import { GraduationCap } from 'lucide-react';

export default function CareerFilter({ careers, selected, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <GraduationCap
        size={16}
        aria-hidden="true"
        style={{ color: 'var(--color-uofl-gray)', flexShrink: 0 }}
      />
      <select
        id="career-filter"
        className="filter-select"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter by academic level or career"
      >
        <option value="">All Levels</option>
        {careers.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
