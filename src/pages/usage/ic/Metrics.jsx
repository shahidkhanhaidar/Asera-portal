import React, { useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import FilterListIcon from '@mui/icons-material/FilterListOutlined';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import WarningIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import TableChartIcon from '@mui/icons-material/TableChartOutlined';
import { Card, SectionLabel, SectionHead, DataTable, Td, TrendChart } from './shared';
import { downloadSheet } from '../../../lib/download';
import {
  POS, POS_T, NEG, NEG_T, SKIP, MISS, TENANTS, SEGMENTS, STUDY, PRESETS, ADMIN_VAR, REV_ADMIN, REV_GROUPS, HIGH_VAR, BENCH,
  CPT_VAL, ICD_VAL, ICD_ERR, T5,
} from '../../../data/icDesign';

const money = (v) => (v >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${v}`);
const PRIOR = { 'Q1 2025': 'Q4 2024', 'Q4 2024': 'Q3 2024', 'Q3 2024': 'Q2 2024', 'Last 6 Months': 'prior 6 months', 'Last 12 Months': 'prior 12 months' };
const DEFAULTS = { tenants: TENANTS.map((t) => t.id), date: 'Last 6 Months', segment: 'All Segments', study: STUDY };
const selectSx = { height: 32, '& .MuiSelect-select': { fontSize: 14, py: '4px !important' } };

function Kpi({ label, value, sub, delta, tone = 'pos', info, prior }) {
  const color = tone === 'pos' ? POS : NEG;
  return (
    <div className="flex flex-col rounded-xl bg-white px-3.5 py-3 shadow-[0_0_0_1px_#e0e0e0]" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="mb-2 flex min-h-[28px] items-start gap-1.5 text-[10px] uppercase tracking-[.06em] text-[#555]">
        <span>{label}</span>
        {info && <Tooltip arrow placement="bottom" title={<span style={{ whiteSpace: 'pre-line', fontSize: 11.5, lineHeight: 1.5 }}>{info}</span>}><InfoIcon sx={{ fontSize: 14, color: '#6b6b6b', cursor: 'help' }} /></Tooltip>}
      </div>
      <div className="mb-0.5 whitespace-nowrap text-xl font-medium tabular-nums">{value}</div>
      <div className="mb-2 flex-1 text-[11px] leading-snug text-[#555]">{sub}</div>
      <div className="text-[11px] leading-snug" style={{ color: tone === 'pos' ? POS_T : NEG_T }}>{delta.replace(/vs Q4 2024/g, `vs ${prior}`)}</div>
    </div>
  );
}

function T5Card({ title, subtitle, rows, tone, codeLabel = 'CPT Code', secondary = 'System Missed' }) {
  const chip = { neg: ['rgba(235,87,87,.14)', NEG_T], pos: ['rgba(40,170,110,.14)', POS_T], acc: ['#ececec', '#333'] }[tone];
  return (
    <Card pad="p-0" className="overflow-x-auto">
      <div className="px-4 pb-2 pt-3.5">
        <div className="mb-0.5 text-[10.5px] uppercase tracking-[.1em] text-[#6b6b6b]">{subtitle}</div>
        <div className="text-sm font-medium">{title}</div>
      </div>
      <div className="px-2.5 pb-2">
        <DataTable min={400} cols={[[codeLabel], ['Description'], ['Encounters', true], [secondary, true]]}>
          {rows.map((r, i) => (
            <tr key={r.code + i}>
              <Td><span className="whitespace-nowrap rounded-md px-2 py-0.5 text-[11px]" style={{ background: chip[0], color: chip[1] }}>#{i + 1} {r.code}</span></Td>
              <Td className="text-[#333]">{r.label}</Td>
              <Td right>{r.count.toLocaleString()}</Td>
              <Td right className="text-[#555]">{(((r.missed > 0 ? r.missed : Math.round(r.count * 0.9)) / r.count) * 100).toFixed(1)}%</Td>
            </tr>
          ))}
        </DataTable>
      </div>
    </Card>
  );
}

const T5_CPT = [
  ['Top 5 System Missed Procedures', 'Billed but not supported by documentation', T5.fp, 'neg', 'CPT Code', 'System Missed'],
  ['Top 5 Rejected Procedures', 'Predicted by system but not billed', T5.fn, 'neg', 'CPT Code', 'Rejection Rate'],
  ['Top 5 Accepted Procedures', 'Most frequently accepted IC procedure suggestions', T5.acc, 'pos', 'CPT Code', 'Acceptance Rate'],
];
const T5_ICD = [
  ['Top 5 Trimester Mismatch Issues', 'ICD codes inconsistent with documented trimester', T5.tri, 'acc', 'Mismatch Rate'],
  ['Top 5 O-code Not Supported', 'Suggested O-codes not supported for the encounter', T5.oc, 'acc', 'Not Supported Rate'],
  ['Top 5 Gestational Age Conflicts', 'ICD codes conflicting with documented gestational age', T5.ga, 'acc', 'Conflict Rate'],
  ['Top 5 Validated ICD Codes', 'ICD codes confirmed correct and accepted without modification', T5.val, 'pos', 'Validation Rate'],
  ['Top 5 Fetus Count Mismatch ICD Codes', 'ICD codes inconsistent with the documented fetus count', T5.fet, 'acc', 'Mismatch Rate'],
];

function ValidationCards({ items }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3">
      {items.map((m) => (
        <div key={m.title} className="flex flex-col gap-1.5 rounded-xl bg-white p-4 shadow-[0_0_0_1px_#e0e0e0]" style={{ borderLeft: `3px solid ${m.status === 'good' ? POS : NEG}` }}>
          <div className="text-[13px] font-medium">{m.title}</div>
          <div className="flex-1 text-xs text-[#555]">{m.description}</div>
          <div className="mt-2 text-[28px] font-medium tabular-nums" style={{ color: m.status === 'good' ? POS_T : NEG_T }}>{m.value}<span className="ml-0.5 text-[13px] text-[#6b6b6b]">%</span></div>
        </div>
      ))}
    </div>
  );
}

export default function Metrics() {
  const [draft, setDraft] = useState(DEFAULTS);
  const [applied, setApplied] = useState(DEFAULTS);
  const [bench, setBench] = useState(BENCH.map((b) => b.tenant));
  const [revG, setRevG] = useState(null);
  const [toast, setToast] = useState('');
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const selIdx = useMemo(() => TENANTS.map((t, i) => i).filter((i) => applied.tenants.includes(TENANTS[i].id) && (applied.segment === 'All Segments' || TENANTS[i].seg === applied.segment)), [applied]);
  const n = selIdx.length, scale = n / TENANTS.length;
  const prior = PRIOR[applied.date];
  const paid = Math.round(n * (4 / 6)), pilot = n - paid;
  const benchRows = selIdx.map((i) => BENCH[i]);
  const benchShown = benchRows.filter((b) => bench.includes(b.tenant));
  const alerts = BENCH.filter((b) => b.precision < 50);
  const top5 = [...benchRows].sort((a, b) => b.rejection - a.rejection).slice(0, 5);
  const varData = ADMIN_VAR[applied.date] || ADMIN_VAR['Last 6 Months'];
  const f1 = (v) => `$${v.toFixed(1)}M`;
  const totals = REV_GROUPS.map((g) => g.rows.reduce((a, r) => a + r[1], 0)), maxT = Math.max(...totals);
  const studyAll = draft.study.length === STUDY.length;
  const tenantAll = draft.tenants.length === TENANTS.length;

  const onMulti = (key, all, ALL) => (e) => {
    const v = e.target.value;
    set(key, v.includes('__all') ? (all ? [] : ALL) : v);
  };
  const reset = () => { setDraft(DEFAULTS); setApplied(DEFAULTS); setBench(BENCH.map((b) => b.tenant)); setToast('Filters reset'); };
  const apply = () => { setApplied(draft); setToast(`Filters applied · ${draft.date}`); };
  const exportXls = () => {
    downloadSheet([
      ['Section', 'Tenant', 'Acceptance Rate (%)', 'Rejection Rate (%)', 'Precision (%)', 'Recall (%)'],
      ...benchRows.map((t) => ['Tenant Benchmarks', t.tenant, t.acceptance, t.rejection, t.precision, t.recall]),
      [], ['Section', 'CPT Code', 'Description', 'Encounters', 'Rejection Rate (%)', 'System Missed'],
      ...HIGH_VAR.map((r) => ['High-Variance Codes', ...r]),
    ], 'admin-dashboard-export', 'xls');
    setToast('XLS exported');
  };

  const svf = [
    { label: 'CPT Codes', meta: '4,812 suggested', tot: 4812 + 312, segs: [['Accepted', 3242, POS, POS_T], ['Skipped', 887, SKIP, '#1c1c1c'], ['Rejected', 683, NEG, NEG_T], ['System Missed', 312, MISS, '#333']] },
    { label: 'ICD-10 Codes', meta: '5,241 validated', tot: 5241, segs: [['Valid', 4954, POS, POS_T], ['Validation Errors', 287, NEG, NEG_T]] },
  ];
  const ag = REV_GROUPS.find((g) => g.title === revG);

  return (
    <div className="flex flex-col gap-7">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-[#e0e0e0] pb-3.5">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[.1em] text-[#6b6b6b]"><FilterListIcon sx={{ fontSize: 15 }} />Filters</div>
        <div className="h-4 w-px bg-[#d6d6d6]" />
        <Select multiple displayEmpty value={draft.tenants} onChange={onMulti('tenants', tenantAll, TENANTS.map((t) => t.id))} sx={{ ...selectSx, width: 210 }}
          renderValue={(v) => (v.length === TENANTS.length ? 'All tenants' : v.length ? `${v.length} tenants` : 'No tenants')}>
          <MenuItem value="__all" sx={{ fontWeight: 500 }}><Checkbox size="small" checked={tenantAll} indeterminate={!tenantAll && draft.tenants.length > 0} />All tenants</MenuItem>
          {TENANTS.map((t) => <MenuItem key={t.id} value={t.id}><Checkbox size="small" checked={draft.tenants.includes(t.id)} /><ListItemText primary={t.name} /></MenuItem>)}
        </Select>
        <Select value={draft.date} onChange={(e) => set('date', e.target.value)} sx={{ ...selectSx, width: 160 }}>
          {PRESETS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
        </Select>
        <Select value={draft.segment} onChange={(e) => set('segment', e.target.value)} sx={{ ...selectSx, width: 160 }}>
          {['All Segments', ...SEGMENTS].map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
        </Select>
        <Select multiple displayEmpty value={draft.study} onChange={onMulti('study', studyAll, STUDY)} sx={{ ...selectSx, width: 210 }}
          renderValue={(v) => (v.length === STUDY.length ? "Women's Health · All" : v.length ? `Women's Health · ${v.length} of 6` : 'No study types')}
          MenuProps={{ slotProps: { paper: { style: { width: 300 } } } }}>
          <ListSubheader sx={{ lineHeight: 1.3, py: 1, borderBottom: '1px solid #ececec' }}>
            <div className="text-[13px] font-medium text-ink">Study Types</div>
            <div className="text-[11px] font-normal text-[#6b6b6b]">Women&apos;s Health · {draft.study.length} of 6 selected</div>
          </ListSubheader>
          <MenuItem value="__all" sx={{ fontWeight: 500, fontSize: 14 }}><Checkbox size="small" checked={studyAll} indeterminate={!studyAll && draft.study.length > 0} />All Women&apos;s Health</MenuItem>
          {STUDY.map((s) => <MenuItem key={s} value={s}><Checkbox size="small" checked={draft.study.includes(s)} /><ListItemText primary={s} /></MenuItem>)}
        </Select>
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="text" color="inherit" size="small" onClick={reset} sx={{ color: '#555' }}>Reset</Button>
          <Button variant="contained" size="small" onClick={apply}>Apply</Button>
          <div className="mx-1 h-5 w-px bg-[#d6d6d6]" />
          <Button variant="outlined" color="inherit" size="small" startIcon={<TableChartIcon sx={{ fontSize: 16 }} />} onClick={exportXls}>Export as XLS</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
        <div className="flex flex-col rounded-xl bg-white px-3.5 py-3 shadow-[0_0_0_1px_#e0e0e0]" style={{ borderLeft: `3px solid ${POS}` }}>
          <div className="mb-2 min-h-[28px] text-[10px] uppercase tracking-[.06em] text-[#555]">Tenants Subscribed to IC</div>
          <div className="mb-1 flex items-baseline gap-1"><span className="text-xl font-medium tabular-nums">{n}</span><span className="text-[11px] text-[#6b6b6b]">/100</span></div>
          <div className="mb-2 text-[11px] leading-snug text-[#555]">Active IC subscriber organizations</div>
          <div className="mb-3.5 grid grid-cols-2 gap-2">
            <div className="rounded-md px-2.5 py-2" style={{ background: 'rgba(40,170,110,.14)' }}><div className="text-[13px] font-medium" style={{ color: POS_T }}>{paid}</div><div className="text-[10px] uppercase tracking-[.08em]" style={{ color: POS_T }}>Paid</div></div>
            <div className="rounded-md bg-[#ececec] px-2 py-1"><div className="text-[13px] font-medium">{pilot}</div><div className="text-[10px] uppercase tracking-[.08em] text-[#555]">Pilot</div></div>
          </div>
          <div className="mt-auto text-[11px]" style={{ color: POS_T }}>↑ +2 vs {prior}</div>
        </div>
        <Kpi prior={prior} label="TOTAL Revenue Captured" value={money(9.2e6 * scale)} sub={`Across ${n} active tenants`} delta="↑ +22.7% vs Q4 2024" info={'• Accepted CPT codes: (count × cost/CPT)\n• Accepted ICD codes: (Count x Total Claim Cost)'} />
        <Kpi prior={prior} label="TOTAL Denials Reduction" value={money(3.3e6 * scale)} sub="Across CPT and ICD reviews" delta="↑ +11.6% vs Q4 2024" info={REV_GROUPS[1].info} />
        <Kpi prior={prior} label="Avg Acceptance Rate" value="67.3%" sub="IC suggestions for CPT & ICD accepted as-is" delta="↑ +4.1 % vs Q4 2024" />
        <Kpi prior={prior} tone="neg" label="Avg Rejection Rate" value="14.3%" sub="IC suggestions for CPT & ICD rejected by users" delta="↓ -2.8 % vs Q4 2024" />
        <Kpi prior={prior} label="Avg CPT Precision / Recall" value="87.4% / 91.2%" sub="Model precision and recall" delta="↑ +1.9 % vs Q4 2024 / ↑ +0.8 % vs Q4 2024" />
      </div>

      <SectionLabel>Revenue &amp; Performance</SectionLabel>

      {/* Subscriber performance overview */}
      <Card>
        <div className="mb-3.5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-0.5 text-[10.5px] uppercase tracking-[.1em] text-[#6b6b6b]">Subscriber Performance Overview</div>
            <div className="text-sm font-medium">Coding Quality Benchmarks Across Subscriber Organizations</div>
            <div className="mt-0.5 text-xs text-[#555]">Compare tenant-level outcomes and act when a quality threshold is crossed.</div>
          </div>
          <Select multiple displayEmpty value={bench} onChange={(e) => setBench(e.target.value)} sx={{ ...selectSx, width: 170 }}
            renderValue={(v) => (v.length === BENCH.length ? 'All tenants' : `${v.length} tenants`)}>
            {BENCH.map((b) => <MenuItem key={b.tenant} value={b.tenant}><Checkbox size="small" checked={bench.includes(b.tenant)} /><ListItemText primary={b.tenant} /></MenuItem>)}
          </Select>
        </div>
        {alerts.length > 0 && (
          <div className="mb-4 flex gap-2.5 rounded-lg px-3 py-2.5" style={{ background: 'rgba(235,87,87,.1)', boxShadow: 'inset 0 0 0 1px rgba(235,87,87,.35)' }}>
            <WarningIcon sx={{ fontSize: 16, color: NEG_T }} />
            <div className="text-xs" style={{ color: NEG_T }}>
              <div className="font-medium">Precision below 50% · Model routing review</div>
              <div className="mt-0.5">{alerts.map((t) => `${t.tenant} (${t.precision}%)`).join(', ')} should be evaluated for an alternate model version.</div>
            </div>
          </div>
        )}
        <div className="mb-2.5 flex flex-wrap gap-4">
          {[['Acceptance', '#0a0a0a'], ['Rejection', NEG], ['Precision', POS], ['Recall', '#6b6b6b']].map(([l, c]) => <span key={l} className="flex items-center gap-1.5 text-xs text-[#555]"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />{l}</span>)}
        </div>
        <div className="flex max-h-[400px] flex-col overflow-y-auto">
          {benchShown.map((b) => (
            <div key={b.tenant} className="grid grid-cols-[minmax(140px,170px)_minmax(0,1fr)] gap-3 rounded-md border-b border-[#ececec] p-3" style={{ background: b.precision < 30 ? 'rgba(235,87,87,.1)' : b.precision < 50 ? 'rgba(235,87,87,.05)' : 'transparent' }}>
              <div>
                <div className="text-xs font-medium">{b.tenant}</div>
                {b.precision < 30 && <div className="mt-1 flex items-center gap-1 text-[11px]" style={{ color: NEG_T }}><ErrorOutlineIcon sx={{ fontSize: 13 }} />Attention required</div>}
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                {[['Acceptance', b.acceptance, '#0a0a0a'], ['Rejection', b.rejection, NEG], ['Precision', b.precision, b.precision < 50 ? NEG : POS], ['Recall', b.recall, '#6b6b6b']].map(([l, v, c]) => (
                  <div key={l} className="grid grid-cols-[70px_minmax(0,1fr)_44px] items-center gap-2">
                    <span className="text-[11px] text-[#555]">{l}</span>
                    <span className="h-1.5 overflow-hidden rounded-md bg-[#ececec]"><span className="block h-full rounded-md" style={{ width: `${v}%`, background: c }} /></span>
                    <span className="text-right text-[11px] tabular-nums">{v}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {benchShown.length === 0 && <div className="p-10 text-center text-xs text-[#6b6b6b]">No tenants selected</div>}
        </div>
      </Card>

      {/* Top 5 rejection */}
      <div>
        <SectionHead title="Top 5 Tenants by Rejection Rate" sub="Prioritize coaching and workflow review for organizations with the highest rejected suggestion rate" />
        <Card className="flex flex-col gap-3">
          {top5.map((t, i) => (
            <div key={t.tenant} className="grid grid-cols-[20px_minmax(0,1fr)_140px] items-center gap-3">
              <span className="text-xs tabular-nums text-[#6b6b6b]">{i + 1}</span>
              <div>
                <div className="mb-1 flex justify-between text-xs"><span className="font-medium">{t.tenant}</span><span className="tabular-nums" style={{ color: i === 0 ? NEG_T : '#333' }}>{t.rejection}%</span></div>
                <div className="h-1.5 overflow-hidden rounded-md bg-[#ececec]"><div className="h-full rounded-md" style={{ width: `${Math.min(t.rejection * 4, 100)}%`, background: i === 0 ? NEG : `rgba(235,87,87,${[0, 0.52, 0.4, 0.3, 0.22][i]})` }} /></div>
              </div>
              {t.rejection > 20 && <div className="flex items-center gap-1 text-[11px]" style={{ color: NEG_T }}><ErrorOutlineIcon sx={{ fontSize: 13 }} />Attention required</div>}
            </div>
          ))}
          {top5.length === 0 && <div className="py-6 text-center text-xs text-[#6b6b6b]">No tenants selected</div>}
        </Card>
      </div>

      {/* Revenue trend + breakdown */}
      <div className="flex flex-col gap-7">
        <Card kicker={`Revenue Trend · ${applied.date}`} title="Revenue Captured & Denials Reduction ($M)">
          <div className="mt-2.5">
            <TrendChart data={REV_ADMIN} fmtTick={f1} fmtVal={f1}
              series={[{ key: 'cap', name: 'Revenue Captured', color: POS }, { key: 'den', name: 'Denials Reduction', color: '#7a5cd6' }]} />
          </div>
        </Card>
        <Card kicker="Revenue Impact Breakdown" title="Revenue Impact by Category" sub="Compare captured revenue and denials reduction. Hover over a bar to view category values." className="relative">
          <div className="mt-5 flex flex-col gap-5">
            {REV_GROUPS.map((g, gi) => (
              <div key={g.title}>
                <div className="mb-1.5 flex justify-between text-xs"><span className="font-medium">{g.title}</span><span className="font-medium tabular-nums">{money(Math.round(totals[gi] * scale))}</span></div>
                <div className="h-[26px] rounded-md bg-[#ececec]" onMouseEnter={() => setRevG(g.title)} onMouseLeave={() => setRevG(null)}>
                  <div className="flex h-full gap-0.5" style={{ width: `${(totals[gi] / maxT) * 100}%` }}>
                    {g.rows.map((r, i) => <span key={r[0]} className="h-full rounded" style={{ width: `calc(${(r[1] / totals[gi]) * 100}% - 2px)`, background: g.colors[i], opacity: revG && revG !== g.title ? 0.45 : 1 }} />)}
                  </div>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  {g.rows.map((r, i) => <span key={r[0]} className="flex items-center gap-1.5 text-[11px] text-[#555]"><span className="h-[9px] w-[9px] rounded-sm" style={{ background: g.colors[i] }} />{r[0]}</span>)}
                </div>
              </div>
            ))}
          </div>
          {ag && (
            <div className="pointer-events-none absolute right-5 top-14 z-10 min-w-[240px] rounded-lg bg-ink px-3.5 py-2.5 text-white shadow-lg">
              <div className="mb-1 text-xs font-semibold">{ag.title}</div>
              {ag.rows.map((r, i) => <div key={r[0]} className="flex items-center gap-2 py-0.5 text-xs"><span className="h-[9px] w-[9px] rounded-sm" style={{ background: ag.colors[i] }} /><span className="flex-1 text-[#ccc]">{r[0]}</span><span className="tabular-nums">{money(Math.round(r[1] * scale))}</span></div>)}
            </div>
          )}
        </Card>
      </div>

      <SectionLabel>Coding Variance — System vs. Final Codes</SectionLabel>

      <Card kicker={`CPT Trend · ${applied.date}`} title="CPT Code Outcomes — Accepted, Skipped, Rejected & System Missed (%)">
        <div className="mt-2.5">
          <TrendChart data={varData} fmtTick={(v) => `${Math.round(v)}%`} fmtVal={(v) => `${v}%`}
            series={[{ key: 'a', name: 'Accepted', color: POS }, { key: 's', name: 'Skipped', color: SKIP }, { key: 'r', name: 'Rejected', color: NEG }, { key: 'm', name: 'System Missed', color: MISS }]} />
        </div>
      </Card>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] gap-3">
        <Card kicker="Per-Encounter Variance" title="System-Recommended vs. Final User-Selected Codes">
          <div className="mt-4 flex flex-col gap-[22px]">
            {svf.map((r) => (
              <div key={r.label}>
                <div className="mb-1.5 flex justify-between text-xs"><span className="font-medium">{r.label}</span><span className="tabular-nums text-[#6b6b6b]">{r.meta}</span></div>
                <div className="flex h-[22px] gap-0.5 overflow-hidden rounded-md">
                  {r.segs.map(([name, c, color]) => <span key={name} className="flex items-center justify-center overflow-hidden whitespace-nowrap text-[10px] font-semibold text-white" style={{ width: `${(c / r.tot) * 100}%`, background: color }}>{((c / r.tot) * 100).toFixed(1)}%</span>)}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {r.segs.map(([name, c, , text]) => <span key={name} className="text-xs"><span className="font-semibold tabular-nums" style={{ color: text }}>{c.toLocaleString()}</span> <span className="text-[#6b6b6b]">{name}</span></span>)}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card kicker="ICD-10 Validation Info" title="ICD-10 Code Validation Errors">
          <div className="mb-4 mt-3.5 grid grid-cols-2 gap-2.5">
            <div className="rounded-md bg-[#ececec] p-3"><div className="text-xl font-medium tabular-nums">5,241</div><div className="text-[11px] text-[#555]">Codes Validated</div></div>
            <div className="rounded-md p-3" style={{ background: 'rgba(235,87,87,.12)' }}><div className="text-xl font-medium tabular-nums" style={{ color: NEG_T }}>196</div><div className="text-[11px] text-[#555]">Validation Errors · <span style={{ color: NEG_T }}>3.7% error rate</span></div></div>
          </div>
          <div className="mb-2 text-[10.5px] uppercase tracking-[.1em] text-[#6b6b6b]">Error Breakdown</div>
          <div className="flex flex-col gap-2.5">
            {ICD_ERR.map((e) => (
              <div key={e.type}>
                <div className="mb-1 flex justify-between text-xs"><span className="text-[#333]">{e.type}</span><span className="tabular-nums">{e.count} <span className="text-[#6b6b6b]">({e.pct}%)</span></span></div>
                <div className="h-1 overflow-hidden rounded bg-[#ececec]"><div className="h-full" style={{ width: `${(e.count / 72) * 100}%`, background: NEG }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <SectionHead title="High-Variance & Frequently Rejected CPT Codes" sub="Codes where IC suggestions are most frequently rejected or skipped — sorted by rejection rate" />
        <Card pad="px-3 py-2">
          <DataTable cols={[['CPT Code'], ['Description'], ['Encounters', true], ['Rejection Rate', true], ['System Missed', true]]}>
            {HIGH_VAR.map((r) => (
              <tr key={r[0]}><Td><span className="rounded-md bg-[#ececec] px-2 py-0.5">{r[0]}</span></Td><Td>{r[1]}</Td><Td right className="text-[#333]">{r[2]}</Td><Td right><span style={{ color: NEG_T }}>{r[3]}%</span></Td><Td right className="text-[#333]">{r[4]}</Td></tr>
            ))}
          </DataTable>
        </Card>
      </div>

      <SectionLabel>Code Validation Quality Metrics</SectionLabel>
      <div><SectionHead title="CPT Code Validation Quality" sub="Share of encounters by CPT validation outcome" /><ValidationCards items={CPT_VAL} /></div>
      <div><SectionHead title="ICD Code Validation Quality" sub="Share of encounters by ICD-10 validation outcome" /><ValidationCards items={ICD_VAL} /></div>

      <SectionLabel>Top CPT Code Issues by Category</SectionLabel>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-3">
        {T5_CPT.map(([title, subtitle, rows, tone, codeLabel, secondary]) => <T5Card key={title} {...{ title, subtitle, rows, tone, codeLabel, secondary }} />)}
      </div>

      <SectionLabel>Top ICD Code Issues by Category</SectionLabel>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-3">
        {T5_ICD.map(([title, subtitle, rows, tone, secondary]) => <T5Card key={title} {...{ title, subtitle, rows, tone, secondary }} codeLabel="ICD-10 Code" />)}
      </div>

      <Snackbar open={!!toast} autoHideDuration={2200} onClose={() => setToast('')} message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </div>
  );
}
