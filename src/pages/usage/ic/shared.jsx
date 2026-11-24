import React, { useState } from 'react';

export const Card = ({ kicker, title, sub, children, className = '', pad = 'p-[18px]' }) => (
  <div className={`rounded-xl bg-white shadow-[0_0_0_1px_#e0e0e0] ${pad} ${className}`}>
    {kicker && <div className="mb-0.5 text-[10.5px] uppercase tracking-[.1em] text-[#6b6b6b]">{kicker}</div>}
    {title && <div className="text-sm font-medium">{title}</div>}
    {sub && <div className="mt-0.5 text-xs text-[#555]">{sub}</div>}
    {children}
  </div>
);

export const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-3.5">
    <span className="whitespace-nowrap text-[11px] uppercase tracking-[.14em] text-ink">{children}</span>
    <span className="h-px flex-1 bg-gradient-to-r from-[#e0e0e0] to-transparent" />
  </div>
);

export const SectionHead = ({ title, sub }) => (
  <div className="mb-3">
    <h2 className="m-0 text-[15px] font-semibold">{title}</h2>
    {sub && <div className="mt-0.5 text-xs text-[#555]">{sub}</div>}
  </div>
);

const th = 'px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-[.06em] text-[#6b6b6b] border-b border-[#ececec]';
const td = 'px-2 py-2 border-b border-[#f1f1f1]';
export function DataTable({ cols, children, min = 560 }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs" style={{ minWidth: min }}>
        <thead><tr>{cols.map(([label, right]) => <th key={label} className={`${th} ${right ? 'text-right' : ''}`}>{label}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
export const Td = ({ right, className = '', children }) => <td className={`${td} tabular-nums ${right ? 'text-right' : ''} ${className}`}>{children}</td>;

/** Compact line chart styled like the design: dashed grid, hover guide, dots and tooltip. */
const nice = (max) => {
  const raw = max / 4, mag = 10 ** Math.floor(Math.log10(raw)), n = raw / mag;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
  return { top: Math.ceil(max / step) * step, step };
};
export function TrendChart({ data, series, fmtTick, fmtVal, height = 210 }) {
  const [hi, setHi] = useState(-1);
  const n = data.length;
  const { top, step } = nice(Math.max(...data.flatMap((d) => series.map((s) => d[s.key]))) * 1.08);
  const X = (i) => ((i + 0.5) / n) * 100, Y = (v) => 100 - (v / top) * 100;
  const ticks = []; for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v);
  const d = hi >= 0 ? data[hi] : null;
  return (
    <div>
      <div className="mb-3.5 flex flex-wrap gap-4">
        {series.map((s) => <span key={s.key} className="flex items-center gap-1.5 text-xs text-[#555]"><span className="h-0.5 w-3 rounded" style={{ background: s.color }} />{s.name}</span>)}
      </div>
      <div className="relative ml-[52px]" style={{ height }} onMouseLeave={() => setHi(-1)}>
        {ticks.map((v) => (
          <div key={v} className="absolute inset-x-0 border-t border-dashed border-[#ececec]" style={{ top: `${Y(v)}%` }}>
            <span className="absolute -top-2 right-[calc(100%+8px)] whitespace-nowrap text-[10.5px] tabular-nums text-[#6b6b6b]">{fmtTick(v)}</span>
          </div>
        ))}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          {hi >= 0 && <line x1={X(hi)} x2={X(hi)} y1="0" y2="100" stroke="#b5b5b5" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="3 3" />}
          {series.map((s) => <polyline key={s.key} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" points={data.map((p, i) => `${X(i)},${Y(p[s.key])}`).join(' ')} />)}
        </svg>
        {data.flatMap((p, i) => series.map((s) => (
          <span key={`${i}${s.key}`} className="pointer-events-none absolute rounded-full" style={{ left: `${X(i)}%`, top: `${Y(p[s.key])}%`, width: i === hi ? 9 : 6, height: i === hi ? 9 : 6, background: s.color, transform: 'translate(-50%,-50%)' }} />
        )))}
        <div className="absolute inset-0 flex">{data.map((p, i) => <div key={p.month + i} className="flex-1" style={{ background: i === hi ? 'rgba(0,0,0,.03)' : 'transparent' }} onMouseEnter={() => setHi(i)} />)}</div>
        {d && (
          <div className="pointer-events-none absolute top-1 z-10 min-w-[150px] rounded-lg bg-ink px-3 py-2 text-white shadow-lg" style={{ left: `${X(hi)}%`, transform: X(hi) > 60 ? 'translateX(calc(-100% - 14px))' : 'translateX(14px)' }}>
            <div className="mb-1 text-xs font-semibold">{d.month}</div>
            {series.map((s) => <div key={s.key} className="flex items-center gap-2 py-px text-[11.5px]"><span className="h-[7px] w-[7px] rounded-full" style={{ background: s.color }} /><span className="flex-1 text-[#bbb]">{s.name}</span><span className="tabular-nums">{fmtVal(d[s.key])}</span></div>)}
          </div>
        )}
      </div>
      <div className="ml-[52px] mt-1.5 flex">{data.map((p, i) => <span key={p.month + i} className="flex-1 text-center text-[10.5px] text-[#6b6b6b]">{p.month}</span>)}</div>
    </div>
  );
}
