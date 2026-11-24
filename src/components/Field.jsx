import React from 'react';

/** Label above the input (12px), matching the design. Input text is 14px, placeholders 12px (see theme). */
export default function Field({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <div className="mb-1.5 text-xs text-[#555]">{label}{required && <span className="ml-0.5">*</span>}</div>
      {children}
    </div>
  );
}
