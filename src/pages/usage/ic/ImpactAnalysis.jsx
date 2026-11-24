import React, { useMemo, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import UploadIcon from '@mui/icons-material/FileUploadOutlined';
import RerunIcon from '@mui/icons-material/Replay';
import ExcelIcon from '@mui/icons-material/TableChartOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ScheduleIcon from '@mui/icons-material/ScheduleOutlined';
import { SortHead, ColSearch } from './CostSheet';
import { downloadSheet } from '../../../lib/download';
import { IMPACT_RUNS, IMPACT_TENANTS, MODELS, modelLabel, modelVersion, BM } from '../../../data/icDesign';

const COLS = '130px minmax(170px,1.4fr) 190px 110px 150px 110px';
const DEFAULT_COST = '120000';
const labelCls = 'mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[.08em] text-[#6b6b6b]';
const fmtDate = (d) => { const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(d); return m ? `${m[2]}/${m[3]}/${m[1]}` : d; };
const stamp = () => { const n = new Date(), p = (x) => String(x).padStart(2, '0'); return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}`; };
const usd = (v) => '$' + Math.round(v).toLocaleString();
const metrics = (r) => {
  let h = 0; for (const ch of r.tenant + r.model + r.mv + r.date) h = (h * 31 + ch.charCodeAt(0)) % 1000;
  const cap = Math.round((BM.rev * (0.8 + (h % 35) / 100)) / 100) * 100, den = Math.round((cap * 0.33) / 100) * 100;
  return { cap, den, tot: cap + den };
};
const STATUS = {
  Queued: [ScheduleIcon, '#8a6d1a'], Processing: [null, '#555'], Completed: [CheckCircleIcon, '#1a9b57'], Failed: [ErrorIcon, '#c0392b'],
};

function ActionIcon({ label, disabled, onClick, children }) {
  return (
    <Tooltip title={label} arrow placement="top">
      <span>
        <IconButton size="small" aria-label={label} disabled={disabled} onClick={onClick} sx={{ color: '#111', '&.Mui-disabled': { color: '#b5b5b5' } }}>{children}</IconButton>
      </span>
    </Tooltip>
  );
}

function ImportDialog({ rerun, busy, onClose, onSubmit, prospects }) {
  const locked = !!rerun;
  const [tenant, setTenant] = useState(rerun ? rerun.tenant : '');
  const [model, setModel] = useState(rerun ? rerun.model : 'Global');
  const [cost, setCost] = useState(rerun ? String(rerun.cost) : DEFAULT_COST);
  const [file, setFile] = useState(rerun ? { name: rerun.file || `encounters-${rerun.tenant.replace(/\W+/g, '-').toLowerCase()}.xlsx`, size: 'Read-only' } : null);
  const [newPros, setNewPros] = useState(false);
  const [toast, setToast] = useState('');
  const inputRef = useRef(null);

  const names = useMemo(() => {
    const seen = new Set();
    return [...IMPACT_TENANTS, ...prospects.map((p) => [p, 'Prospect'])].filter(([n]) => !seen.has(n.toLowerCase()) && seen.add(n.toLowerCase()));
  }, [prospects]);
  const q = tenant.trim().toLowerCase();
  const hit = names.find((n) => n[0].toLowerCase() === q);
  const isPro = !hit || hit[1] === 'Prospect';
  const costOk = /^\d{1,9}(\.\d{1,2})?$/.test(cost.trim()) && +cost > 0;
  const ok = !!(model && file && tenant.trim() && costOk);

  const take = (f) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return setToast('File is larger than 10 MB');
    if (f.size === 0) return setToast('The file is empty');
    if (!/\.xlsx$/i.test(f.name)) return setToast('Only XLSX files are accepted');
    setFile({ name: f.name, size: `${Math.max(1, Math.round(f.size / 1024))} KB` });
  };
  const filterOptions = (opts, { inputValue }) => {
    const v = inputValue.trim().toLowerCase();
    const exact = opts.some((o) => o.name.toLowerCase() === v);
    const list = exact ? opts.filter((o) => o.name.toLowerCase() === v) : opts.filter((o) => !v || o.name.toLowerCase().includes(v));
    if (!v) return [...list, { name: '', add: 'new' }];
    if (!exact) return [...list, { name: inputValue.trim(), add: 'typed' }];
    return list;
  };
  const submit = () => ok && !busy && onSubmit({ tenant: tenant.trim(), pro: isPro, model, cost: +cost, file: file.name, rerunOf: rerun?.id });

  return (
    <Dialog open onClose={onClose} slotProps={{ paper: { style: { width: 560, maxWidth: '100%', borderRadius: 16 } } }}>
      <div className="flex items-center justify-between border-b border-[#ececec] px-6 py-5">
        <div className="text-lg font-semibold">{locked ? 'Re-run analysis' : 'Import file'}</div>
        <IconButton size="small" onClick={onClose} aria-label="Close"><CloseIcon /></IconButton>
      </div>
      <div className="flex flex-col gap-4 px-6 py-5">
        <div>
          <div className={labelCls}>Tenant/ Prospect</div>
          <Autocomplete freeSolo disabled={locked} openOnFocus selectOnFocus handleHomeEndKeys disableClearable
            options={names.map(([name, sub]) => ({ name, sub }))} value={null} inputValue={tenant}
            onInputChange={(_, v, reason) => { if (reason !== 'reset' || v) setTenant(v); }}
            onChange={(_, o) => { if (typeof o === 'string') setTenant(o); else if (o?.add === 'new') { setTenant(''); setNewPros(true); } else if (o) { setTenant(o.name); if (o.add) setNewPros(true); } }}
            filterOptions={filterOptions} getOptionLabel={(o) => (typeof o === 'string' ? o : o.name)}
            isOptionEqualToValue={(o, v) => o.name === (typeof v === 'string' ? v : v.name)}
            slotProps={{ paper: { style: { borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.12)', border: '1px solid #d6d6d6' } } }}
            renderOption={({ key, ...props }, o) => (
              o.add === 'typed' ? (
                <li key="add" {...props} style={{ ...props.style, borderTop: '1px solid #ececec', fontWeight: 500 }}>
                  <AddIcon sx={{ fontSize: 16, mr: 1 }} /><span className="min-w-0 flex-1 truncate">Add {o.name}</span><span className="ml-2 rounded border border-[#cfcfcf] px-1.5 text-[10px]">Prospect</span>
                </li>
              ) : o.add === 'new' ? (
                <li key="new" {...props} style={{ ...props.style, borderTop: '1px solid #ececec', fontWeight: 500 }}><AddIcon sx={{ fontSize: 16, mr: 1 }} />New prospect</li>
              ) : (
                <li key={o.name} {...props}><span className="flex-1">{o.name}</span><span className="text-xs text-[#6b6b6b]">{o.sub}</span></li>
              )
            )}
            renderInput={(params) => (
              <TextField {...params} placeholder={newPros ? 'New prospect name' : 'Search tenants or enter a prospect'}
                slotProps={{ ...params.slotProps, htmlInput: { ...params.slotProps.htmlInput, maxLength: 60 },
                  input: { ...params.slotProps.input, sx: locked ? { bgcolor: '#f4f4f4' } : undefined,
                    endAdornment: tenant.trim() ? <span className="mr-1 rounded border border-[#cfcfcf] px-1.5 text-[10px]">{isPro ? 'Prospect' : 'Tenant'}</span> : null } }} />
            )} />
        </div>
        <div>
          <div className={labelCls}>Model<Tooltip title="Model version used for this run (audit)"><InfoIcon sx={{ fontSize: 14, cursor: 'help' }} /></Tooltip></div>
          <Select fullWidth value={model} onChange={(e) => setModel(e.target.value)}>
            {MODELS.map(([m, v]) => <MenuItem key={m} value={m}>{modelLabel(m, v)}</MenuItem>)}
          </Select>
          <div className="mt-1 text-xs text-[#6b6b6b]">{locked ? 'Only the model can change on a re-run.' : 'Default model is set by an AS admin.'}</div>
        </div>
        <div>
          <div className={labelCls}>IC Subscription cost (USD)</div>
          <TextField fullWidth value={cost} disabled={locked} onChange={(e) => setCost(e.target.value)} placeholder="0.00"
            error={!!cost && !costOk} helperText={cost && !costOk ? 'Enter an amount greater than 0, up to 2 decimals' : ''}
            slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment>, sx: locked ? { bgcolor: '#f4f4f4' } : undefined }, htmlInput: { inputMode: 'decimal', maxLength: 12 } }} />
        </div>
        <div>
          <div className={labelCls}>Filled template</div>
          <input ref={inputRef} type="file" hidden accept=".xlsx" data-testid="ia-file" onChange={(e) => { take(e.target.files?.[0]); e.target.value = ''; }} />
          <div role="button" tabIndex={0} onClick={() => !locked && inputRef.current?.click()} onKeyDown={(e) => e.key === 'Enter' && !locked && inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (!locked) take(e.dataTransfer.files?.[0]); }}
            className={`flex h-32 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#cfcfcf] bg-[#fafafa] text-center ${locked ? 'cursor-default' : 'cursor-pointer hover:bg-[#f4f4f4]'}`}>
            {file ? <ExcelIcon sx={{ fontSize: 28, color: '#444' }} /> : <UploadIcon sx={{ fontSize: 28, color: '#444' }} />}
            <div className="text-[15px] font-medium">{file ? file.name : 'Drop the filled template here'}</div>
            <div className="text-[13px] text-[#6b6b6b]">{file ? (locked ? 'Read-only' : `${file.size} · click to replace`) : 'or click to browse · XLSX only'}</div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2.5 border-t border-[#ececec] px-6 py-4">
        <Button variant="outlined" color="inherit" onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!ok || busy} startIcon={locked ? <RerunIcon /> : <UploadIcon />} onClick={submit}>{locked ? 'Re-run' : 'Import'}</Button>
      </div>
      <Snackbar open={!!toast} autoHideDuration={2200} onClose={() => setToast('')} message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Dialog>
  );
}

export default function ImpactAnalysis() {
  const [runs, setRuns] = useState(IMPACT_RUNS);
  const [prospects, setProspects] = useState([]);
  const [dialog, setDialog] = useState(null); // null | { rerun?: run }
  const [f, setF] = useState({ date: '', tenant: '', model: '', by: '', status: '' });
  const [sort, setSort] = useState(null);
  const [toast, setToast] = useState('');
  const busy = runs.some((r) => r.status === 'Queued' || r.status === 'Processing');
  const job = runs.find((r) => r.status === 'Queued' || r.status === 'Processing');

  const setStatus = (id, status) => setRuns((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
  const submit = ({ tenant, pro, model, cost, file }) => {
    const id = Date.now();
    setRuns((rs) => [{ id, date: stamp(), tenant, pro, model, mv: modelVersion(model), by: 'AS Admin', status: 'Queued', file, cost }, ...rs]);
    if (pro) setProspects((p) => (p.some((x) => x.toLowerCase() === tenant.toLowerCase()) ? p : [...p, tenant]));
    setDialog(null);
    setTimeout(() => setStatus(id, 'Processing'), 1500);
    setTimeout(() => setStatus(id, 'Completed'), 5000);
  };
  const exportRun = (r) => {
    const m = metrics(r);
    downloadSheet([
      ['Projected Impact Analysis · Intelligent Coding'], ['Tenant or prospect', r.tenant], ['Model', modelLabel(r.model, r.mv)], ['Run by', r.by], ['Run date', fmtDate(r.date)], [],
      ['Metric', 'Value', 'Unit'], ['Revenue captured', m.cap, 'USD'], ['Denials prevented', m.den, 'USD'], ['Total projected impact', m.tot, 'USD'], ['Encounters analyzed', BM.enc, 'count'],
    ], `projected-impact-${r.tenant.replace(/\W+/g, '-').toLowerCase()}`, 'csv');
    setToast('Exported as CSV');
  };
  const template = () => {
    downloadSheet([['Encounter ID', 'Encounter Date', 'Study Type', 'CPT Codes', 'ICD-10 Codes', 'Billed Amount', 'Denied']], 'projected-impact-template', 'csv');
    setToast('Template downloaded');
  };

  const has = (a, b) => String(a).toLowerCase().includes(b.trim().toLowerCase());
  const rows = useMemo(() => {
    const list = runs.map((r) => ({ ...r, modelText: modelLabel(r.model, r.mv) }))
      .filter((r) => has(fmtDate(r.date), f.date) && has(r.tenant + (r.pro ? ' prospect' : ''), f.tenant) && has(r.modelText, f.model) && has(r.by, f.by) && (!f.status || r.status === f.status));
    if (!sort) return list;
    return [...list].sort((a, b) => String(a[sort.k]).localeCompare(String(b[sort.k])) * sort.d);
  }, [runs, f, sort]);
  const sh = (label, k, extra) => <SortHead label={label} k={k === 'model' ? 'modelText' : k} sort={sort} setSort={setSort} />;
  const card = 'flex flex-col gap-3 rounded-xl border border-[#ececec] bg-white px-5 py-[18px]';
  const step = 'text-[11px] font-semibold tracking-[.1em] text-[#6b6b6b]';

  return (
    <div className="flex flex-col gap-[18px]">
      <div>
        <h2 className="m-0 text-[15px] font-semibold">Projected Impact Analysis</h2>
        <div className="mt-1 max-w-[720px] text-[13px] text-[#555]">Projected annual impact of Intelligent Coding for a tenant or prospect. Download the template, fill it in, then import it.</div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-4">
        <div className={card}>
          <div className={step}>STEP 1</div>
          <div className="text-[15px] font-medium">Download template</div>
          <div className="text-[13px] leading-normal text-[#555]">Add one row per encounter for the last 12 months. Keep the column headers unchanged and save the file as XLSX.</div>
          <div><Button variant="outlined" color="inherit" startIcon={<DownloadIcon />} onClick={template}>Download template</Button></div>
        </div>
        <div className={card}>
          <div className={step}>STEP 2</div>
          <div className="text-[15px] font-medium">Import</div>
          <div className="text-[13px] leading-normal text-[#555]">Upload the filled template (XLSX only) for a tenant or prospect. The analysis runs in the background. The Export link appears in the history below when it completes.</div>
          {busy && <div className="flex items-start gap-2.5 rounded-lg bg-[#f4f4f4] px-3 py-2.5 text-[13px]"><CircularProgress size={16} sx={{ mt: '2px', color: '#111' }} /><div className="font-medium">{job.status}: {job.tenant} · {modelLabel(job.model, job.mv)}</div></div>}
          <Tooltip title={busy ? 'One analysis at a time' : ''}><span className="self-start"><Button variant="contained" disabled={busy} startIcon={<UploadIcon />} onClick={() => setDialog({})}>Import file</Button></span></Tooltip>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div>
          <div className="text-[15px] font-medium">History</div>
          <div className="mt-0.5 text-xs text-[#6b6b6b]">Most recent first. The Excel export includes revenue captured and denials prevented, so it can be shared with prospects.</div>
        </div>
        <div className="overflow-auto rounded-xl border border-[#ececec] bg-white" style={{ maxHeight: 'max(300px, calc(100vh - 380px))' }}>
          <div className="min-w-[940px]">
            <div className="sticky top-0 z-10 grid h-[46px] items-center gap-4 border-b border-[#ececec] bg-white px-5 text-[11px] font-semibold tracking-[.1em] text-[#6b6b6b]" style={{ gridTemplateColumns: COLS }}>
              {sh('DATE', 'date')}{sh('TENANT/ PROSPECT', 'tenant')}{sh('MODEL', 'model')}{sh('RUN BY', 'by')}{sh('STATUS', 'status')}<div>ACTIONS</div>
            </div>
            <div className="sticky top-[46px] z-10 grid items-center gap-4 border-b border-[#ececec] bg-[#fafafa] px-5 py-2" style={{ gridTemplateColumns: COLS }}>
              <ColSearch value={f.date} onChange={(v) => setF({ ...f, date: v })} placeholder="Search date" />
              <ColSearch value={f.tenant} onChange={(v) => setF({ ...f, tenant: v })} placeholder="Search tenant/ prospect" />
              <ColSearch value={f.model} onChange={(v) => setF({ ...f, model: v })} placeholder="Search model" />
              <ColSearch value={f.by} onChange={(v) => setF({ ...f, by: v })} placeholder="Search run by" />
              <Select displayEmpty value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} sx={{ height: 30, bgcolor: '#fff', '& .MuiSelect-select': { py: '4px !important', fontSize: 14 } }}
                renderValue={(v) => v || <span className="text-sm text-[#8a8a8a]">All status</span>}>
                <MenuItem value="">All status</MenuItem>
                {Object.keys(STATUS).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
              <div />
            </div>
            {rows.map((r) => {
              const [Icon, color] = STATUS[r.status];
              const done = r.status === 'Completed', canRerun = (done || r.status === 'Failed') && !busy;
              return (
                <div key={r.id} className="grid items-start gap-4 border-b border-[#ececec] px-5 py-3.5 text-sm text-[#111]" style={{ gridTemplateColumns: COLS }}>
                  <div className="font-mono text-[13px]">{fmtDate(r.date)}</div>
                  <div className="flex items-center gap-2">{r.tenant}{r.pro && <span className="rounded border border-[#cfcfcf] px-1.5 text-[10px]">Prospect</span>}</div>
                  <div title="Model version used for this run (audit)">{r.modelText}</div>
                  <div>{r.by}</div>
                  <div>
                    <div className="flex items-center gap-2">{Icon ? <Icon sx={{ fontSize: 16, color }} /> : <CircularProgress size={14} sx={{ color }} />}{r.status}</div>
                    {r.status === 'Failed' && r.reason && <div className="mt-0.5 text-xs text-[#c0392b]">{r.reason}</div>}
                  </div>
                  <div className="-mt-1 flex items-center gap-1">
                    <ActionIcon label={busy ? 'Export (unavailable: one analysis at a time)' : done ? 'Export' : 'Export not available'} disabled={!done || busy} onClick={() => exportRun(r)}><DownloadIcon fontSize="small" /></ActionIcon>
                    <ActionIcon label={busy ? 'Re-run (unavailable: one analysis at a time)' : 'Re-run'} disabled={!canRerun} onClick={() => setDialog({ rerun: r })}><RerunIcon fontSize="small" /></ActionIcon>
                  </div>
                </div>
              );
            })}
            {rows.length === 0 && <div className="px-5 py-7 text-[13px] text-[#6b6b6b]">No runs match the filters.</div>}
          </div>
        </div>
      </div>
      {dialog && <ImportDialog rerun={dialog.rerun} busy={busy} prospects={prospects} onClose={() => setDialog(null)} onSubmit={submit} />}
      <Snackbar open={!!toast} autoHideDuration={2400} onClose={() => setToast('')} message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </div>
  );
}
