import React, { useState } from 'react';

/** Small dependency-free SVG line chart with hover tooltip. series: [{name,color,data[]}] */
export default function LineChart({ labels, series, height = 220, format = (v) => v }) {
  const [hover, setHover] = useState(null);
  const W = 640, H = height, pad = { l: 36, r: 12, t: 12, b: 24 };
  const max = Math.max(...series.flatMap((s) => s.data)) * 1.1;
  const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / (labels.length - 1);
  const y = (v) => H - pad.b - (v / max) * (H - pad.t - pad.b);
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onMouseLeave={() => setHover(null)}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}><line x1={pad.l} x2={W - pad.r} y1={y(max * t)} y2={y(max * t)} stroke="#eee" />
            <text x={pad.l - 6} y={y(max * t) + 4} textAnchor="end" fontSize="10" fill="#8a8a8a">{Math.round(max * t)}</text></g>
        ))}
        {labels.map((l, i) => <text key={l} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#8a8a8a">{l}</text>)}
        {series.map((s) => <polyline key={s.name} fill="none" stroke={s.color} strokeWidth="2" points={s.data.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />)}
        {labels.map((l, i) => <rect key={l} x={x(i) - 20} y={0} width={40} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />)}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="#bbb" strokeDasharray="3 3" />}
        {hover !== null && series.map((s) => <circle key={s.name} cx={x(hover)} cy={y(s.data[hover])} r="4" fill={s.color} />)}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute right-2 top-2 rounded-lg bg-ink px-3 py-2 text-xs text-white shadow-lg">
          <div className="mb-1 font-semibold">{labels[hover]}</div>
          {series.map((s) => <div key={s.name} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.name} <b className="ml-auto pl-3">{format(s.data[hover])}</b></div>)}
        </div>
      )}
    </div>
  );
}
