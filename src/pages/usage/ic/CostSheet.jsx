import React, { useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { costsApi } from '../../../lib/api';

const COLS = '120px minmax(220px,1fr) 190px';
const err = (v) => {
  const x = String(v).trim();
  if (x === '') return 'Enter a value';
  if (!/^\d+(\.\d+)?$/.test(x)) return 'Numbers only, no symbols or negatives';
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(x)) return +x >= 1e6 ? 'Must be under $1,000,000' : 'Up to 2 decimal places';
  if (+x <= 0) return 'Must be greater than 0';
  return '';
};
const pl = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const fmtDate = (d) => { const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(d); return m ? `${m[2]}/${m[3]}/${m[1]}` : d; };

export function SortHead({ label, k, sort, setSort }) {
  const on = sort && sort.k === k;
  const Icon = !on ? UnfoldMoreIcon : sort.d > 0 ? ArrowUpwardIcon : ArrowDownwardIcon;
  return (
    <div className="flex cursor-pointer select-none items-center gap-1.5" onClick={() => setSort(on ? (sort.d > 0 ? { k, d: -1 } : null) : { k, d: 1 })}>
      {label}<Icon sx={{ fontSize: 14 }} />
    </div>
  );
}
export const ColSearch = ({ value, onChange, placeholder }) => (
  <TextField value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder}
    sx={{ '& .MuiOutlinedInput-root': { height: 30, bgcolor: '#fff' }, '& input': { py: 0, px: '8px !important' } }} />
);

export default function CostSheet() {
  const [items, setItems] = useState([]);
  const [costs, setCosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [counts, setCounts] = useState(null);
  const [draft, setDraft] = useState({});
  const [f, setF] = useState({ code: '', desc: '', val: '' });
  const [sort, setSort] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [meta, setMeta] = useState({ by: '', on: '' });
  const [toast, setToast] = useState('');

  const apply = (sheet) => {
    setItems(sheet.items.map((i) => [i.code, i.description]));
    setCosts(Object.fromEntries(sheet.items.map((i) => [i.code, String(i.defaultValue)])));
    setMeta({ by: sheet.lastUpdatedBy, on: sheet.lastUpdatedOn || '' });
  };
  const load = () => {
    setLoading(true); setLoadError('');
    costsApi.get().then(apply).catch((e) => setLoadError(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const changed = Object.keys(draft).filter((k) => draft[k] !== costs[k]);
  const dirty = changed.length > 0;
  const bad = Object.keys(draft).some((k) => err(draft[k]));
  const has = (a, b) => String(a).toLowerCase().includes(b.trim().toLowerCase());
  const rows = useMemo(() => {
    const all = items.map(([code, desc]) => ({ code, desc, val: draft[code] ?? costs[code] }))
      .filter((r) => has(r.code, f.code) && has(r.desc, f.desc) && has(r.val, f.val));
    if (!sort) return all;
    return [...all].sort((a, b) => (sort.k === 'val' ? (parseFloat(a.val) || 0) - (parseFloat(b.val) || 0) : a[sort.k].localeCompare(b[sort.k])) * sort.d);
  }, [items, draft, costs, f, sort]);

  const changes = () => changed.map((k) => ({ code: k, value: Math.round(parseFloat(draft[k]) * 100) / 100 }));
  const askConfirm = async () => {
    try { setCounts(await costsApi.impact(changes())); setConfirm(true); } catch (e) { setToast(e.message); }
  };
  const save = async () => {
    setSaving(true);
    try {
      apply(await costsApi.save(changes()));
      setDraft({}); setConfirm(false); setToast('Default values saved');
    } catch (e) {
      setToast(e.message);
    } finally {
      setSaving(false);
    }
  };
  const sh = (label, k) => <SortHead label={label} k={k} sort={sort} setSort={setSort} />;

  return (
    <div className="flex min-h-0 max-w-[1000px] flex-1 flex-col gap-4">
      <div className="flex-none">
        <h2 className="m-0 text-[15px] font-semibold">Global CPT Cost sheet</h2>
        <div className="mt-1 max-w-[640px] text-[13px] text-[#555]">These default values will be used for all tenants unless customized by them. Used in Intelligent Coding metrics and Projected Impact Analysis.</div>
        {meta.by && <div className="mt-1.5 text-xs text-[#6b6b6b]">Last updated by {meta.by} on {fmtDate(meta.on)}</div>}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto">
        <div className="sticky top-0 z-10 grid h-[46px] items-center gap-4 border-b border-[#ececec] bg-white px-5 text-[11px] font-semibold uppercase tracking-[.1em] text-[#6b6b6b]" style={{ gridTemplateColumns: COLS }}>
          {sh('CPT Code', 'code')}{sh('Description', 'desc')}{sh('Default value (USD)', 'val')}
        </div>
        <div className="sticky top-[46px] z-10 grid items-center gap-4 border-b border-[#ececec] bg-[#fafafa] px-5 py-2" style={{ gridTemplateColumns: COLS }}>
          <ColSearch value={f.code} onChange={(v) => setF({ ...f, code: v })} placeholder="Search CPT code" />
          <ColSearch value={f.desc} onChange={(v) => setF({ ...f, desc: v })} placeholder="Search description" />
          <ColSearch value={f.val} onChange={(v) => setF({ ...f, val: v })} placeholder="Search value" />
        </div>
        {rows.map((r) => {
          const e = draft[r.code] !== undefined ? err(draft[r.code]) : '';
          const ed = draft[r.code] !== undefined && draft[r.code] !== costs[r.code];
          return (
            <div key={r.code} className="grid items-start gap-4 border-b border-[#ececec] px-5 py-2.5 text-sm" style={{ gridTemplateColumns: COLS, background: ed ? '#fafafa' : 'transparent' }}>
              <div className="pt-2 font-mono text-[13px]">{r.code}</div>
              <div className="pt-2">{r.desc}</div>
              <TextField value={r.val} error={!!e} helperText={e} onChange={(ev) => setDraft((d) => ({ ...d, [r.code]: ev.target.value }))}
                slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> }, htmlInput: { inputMode: 'decimal', maxLength: 9, 'aria-label': `Default value for CPT ${r.code}` } }}
                sx={{ '& .MuiOutlinedInput-root': { height: 36 } }} />
            </div>
          );
        })}
        {loading && <div className="px-5 py-6 text-[13px] text-[#6b6b6b]">Loading cost sheet…</div>}
        {loadError && <div className="px-5 py-6 text-[13px] text-[#c0392b]">{loadError} <span onClick={load} className="cursor-pointer text-[#111] underline">Try again</span></div>}
        {!loading && !loadError && rows.length === 0 && <div className="px-5 py-6 text-[13px] text-[#6b6b6b]">No CPT codes match the filters.</div>}
        </div>
      </div>
      {dirty && (
        <div className="z-[5] flex flex-none flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ececec] bg-white px-5 py-3 shadow-[0_-4px_16px_rgba(0,0,0,.08)]">
          <div className="text-[13px]">{pl(changed.length, 'unsaved change')}</div>
          <div className="flex gap-2.5">
            <Button variant="outlined" color="inherit" onClick={() => setDraft({})}>Cancel</Button>
            <Button variant="contained" disabled={bad} onClick={askConfirm}>Save changes</Button>
          </div>
        </div>
      )}
      <Dialog open={confirm} onClose={() => setConfirm(false)} slotProps={{ paper: { style: { width: 460, maxWidth: '100%' } } }}>
        <div className="px-6 pb-2 pt-5 text-lg font-semibold">Save default values?</div>
        <div className="flex flex-col gap-2 px-6 pb-5 text-sm leading-normal">
          <div>{pl(changed.length, 'CPT value')} changed.</div>
          {counts && <div>Applies to {pl(counts.tenantsAffected, 'tenant')}. {pl(counts.tenantsWithCustomValues, 'tenant')} with custom values will not change.</div>}
        </div>
        <div className="flex justify-end gap-2.5 border-t border-[#ececec] px-6 py-4">
          <Button variant="outlined" color="inherit" onClick={() => setConfirm(false)}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </div>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={2400} onClose={() => setToast('')} message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </div>
  );
}
