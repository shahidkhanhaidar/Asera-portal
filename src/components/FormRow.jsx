import React from 'react';

/** Left label column + right content, matching the design's section layout. */
export default function FormRow({ title, desc, children, last = false, stacked = false }) {
  return (
    <div className={`grid gap-3 py-6 ${stacked ? 'grid-cols-1' : 'grid-cols-[150px_minmax(0,1fr)] gap-6'} ${last ? '' : 'border-b border-[#ececec]'}`}>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        {desc && <div className="mt-1 text-[12.5px] leading-normal text-muted">{desc}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
