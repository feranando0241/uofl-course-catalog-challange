/**
 * CourseModal.jsx
 * ===============
 * Modal dialog to display full course information.
 */

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

const CAREER_LABELS = {
  UGRD: 'Undergraduate',
  GRAD: 'Graduate',
  PROF: 'Professional',
  LAW: 'Law',
  DENT: 'Dental',
  MED: 'Medical',
};

export default function CourseModal({ course, onClose }) {
  const modalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Trap focus (simple version) and prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    modalRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!course) return null;

  const { subject, catalog_nbr, descr, acad_career, crse_id, acad_group } = course;
  const careerLabel = CAREER_LABELS[acad_career] ?? acad_career;
  
  // Create a long placeholder description
  const longPlaceholder = Array(15).fill("this is a text description").join(". ");

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex="-1"
        ref={modalRef}
      >
        <div className="modal-header">
          <div>
            <span className="card-subject-badge">{subject}</span>
            <span className="card-catalog-nbr" style={{ marginLeft: '0.5rem' }}>{catalog_nbr}</span>
          </div>
          <button 
            className="modal-close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <h2 id="modal-title" className="modal-title">{descr}</h2>
          
          <div className="modal-meta">
            {careerLabel && <span className="card-tag">Career: {careerLabel}</span>}
            {acad_group && <span className="card-tag">Group: {acad_group}</span>}
            <span className="card-tag">Course ID: {crse_id}</span>
          </div>
          
          <div className="modal-description">
            <h3 className="modal-section-title">Course Description</h3>
            <p>{longPlaceholder}. {longPlaceholder}. {longPlaceholder}.</p>
            <p>{longPlaceholder}. {longPlaceholder}.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
