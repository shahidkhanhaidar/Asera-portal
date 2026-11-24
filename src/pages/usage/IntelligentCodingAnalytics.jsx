import React, { useMemo, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import Snackbar from '@mui/material/Snackbar';
import TableChartIcon from '@mui/icons-material/TableChartOutlined';
import WarningIcon from '@mui/icons-material/WarningAmberOutlined';
import UploadIcon from '@mui/icons-material/UploadFileOutlined';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import LineChart from '../../components/LineChart';
import { IC_TENANTS, SEGMENTS, STUDIES, DATE_PRESETS, MONTHS, REV_TREND, REV_CATEGORIES, REJECTED_CPT, ICD_ERRORS, QUALITY_METRICS, CPT_COSTS, IMPACT_HISTORY } from '../../data/ic';

const money = (n) => '$' + Math.round(n).toLocaleString();
const Card = ({ title, sub, children, className = '' }) => (
  <div className={`rounded-xl bg-white p-[18px] shadow-sm ${className}`}>
    {title && <div className="text-sm font-semibold">{title}</div>}
    {sub && <div className="mb-3.5 mt-0.5 text-xs text-muted">{sub}</div>}
    {children}
  </div>
);
const Kpi = ({ label, value, sub, delta }) => (
  <div className="rounded-[10px] bg-white px-4 py-3.5 shadow-sm">
    <div className="text-xs text-muted">{label}</div>
    <div className="mt-1 text-[26px] font-semibold tabular-nums">{value}</div>
    {sub && <div className="text-xs text-muted">{sub}</div>}
    {delta && <div className="mt-1 text-xs font-medium text-[#1a9b57]">{delta}</div>}
  </div>
);

function Metrics() {
  const [tenants, setTenants] = useState(IC_TENANTS.map((t) => t.id));
  const [date, setDate] = useState(DATE_PRESETS[0]);
  const [segment, setSegment] = useState('All');
  const [studies, setStudies] = useState(STUDIES);
  const [toast, setToast] = useState('');
  const sel = useMemo(() => IC_TENANTS.filter((t) => tenants.includes(t.id) && (segment === 'All' || t.segment === segment)), [tenants, segment]);
  const total = (k) => sel.reduce((a, t) => a + t[k], 0);
  const avg = (k) => (sel.length ? Math.round(sel.reduce((a, t) => a + t[k], 0) / sel.length) : 0);
  const worst = [...sel].sort((a, b) => b.reject - a.reject).slice(0, 5);
  const flagged = sel.filter((t) => t.precision < 50);
  const scale = sel.length / IC_TENANTS.length || 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
        <Select multiple displayEmpty value={tenants} onChange={(e) => setTenants(e.target.value)} input={<OutlinedInput size="small" />} sx={{ width: 230 }}
          renderValue={(v) => (v.length === IC_TENANTS.length ? 'All tenants' : `${v.length} selected`)}>
          {IC_TENANTS.map((t) => <MenuItem key={t.id} value={t.id}><Checkbox size="small" checked={tenants.includes(t.id)} /><ListItemText primary={t.name} /></MenuItem>)}
        </Select>
        <TextField select value={date} onChange={(e) => setDate(e.target.value)} sx={{ width: 170 }}>{DATE_PRESETS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}</TextField>
        <TextField select value={segment} onChange={(e) => setSegment(e.target.value)} sx={{ width: 150 }}>
          <MenuItem value="All">All segments</MenuItem>{SEGMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
        </TextField>
        <Select multiple value={studies} onChange={(e) => setStudies(e.target.value)} input={<OutlinedInput size="small" />} sx={{ width: 200 }}
          renderValue={(v) => `Women's Health · ${v.length} of 6`}>
          {STUDIES.map((s) => <MenuItem key={s} value={s}><Checkbox size="small" checked={studies.includes(s)} /><ListItemText primary={s} /></MenuItem>)}
        </Select>
        <div className="flex-1" />
        <Button variant="outlined" color="inherit" startIcon={<TableChartIcon />} onClick={() => setToast('Exported as XLS')}>Export as XLS</Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
        <Kpi label="Tenants Subscribed to IC" value={<>{sel.length}<span className="text-sm font-normal text-muted"> /100</span></>} sub="Active IC subscriber organizations" delta="↑ +2 vs Q4 2024" />
        <Kpi label="Revenue Captured" value={money(total('rev'))} sub={date} delta="↑ +12.4% vs prior period" />
        <Kpi label="Denials Prevented" value={money(total('denials'))} sub="Estimated" delta="↑ +8.1% vs prior period" />
        <Kpi label="Avg. Precision" value={`${avg('precision')}%`} sub="Across selected tenants" />
        <Kpi label="Avg. Acceptance" value={`${avg('accept')}%`} sub="Suggestions accepted" />
      </div>

      <Card title="Coding Quality Benchmarks Across Subscriber Organizations" sub="Compare tenant-level outcomes and act when a quality threshold is crossed.">
        {flagged.length > 0 && <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>Precision below 50% · Model routing review ({flagged.length}): {flagged.map((t) => t.name).join(', ')}</Alert>}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {sel.map((t) => (
            <div key={t.id} className="rounded-[10px] border border-line p-3.5">
              <div className="mb-2 flex items-center gap-2 text-[13.5px] font-semibold">{t.name}{t.precision < 50 && <Chip size="small" color="error" variant="outlined" label="Attention required" />}</div>
              {[['Precision', t.precision], ['Accepted', t.accept], ['Rejected', t.reject], ['Skipped', t.skip]].map(([l, v]) => (
                <div key={l} className="mb-1.5 grid grid-cols-[80px_1fr_40px] items-center gap-2 text-xs"><span className="text-muted">{l}</span>
                  <LinearProgress variant="determinate" value={v} sx={{ height: 6, borderRadius: 3, bgcolor: '#efefef', '& .MuiLinearProgress-bar': { bgcolor: l === 'Rejected' ? '#c0392b' : '#0a0a0a' } }} />
                  <span className="text-right tabular-nums">{v}%</span></div>
              ))}
            </div>
          ))}
          {sel.length === 0 && <div className="py-8 text-center text-muted md:col-span-2">No tenants selected</div>}
        </div>
      </Card>

      <Card title="Top 5 Tenants by Rejection Rate" sub="Prioritize coaching and workflow review for organizations with the highest rejected suggestion rate">
        {worst.map((t, i) => (
          <div key={t.id} className="flex items-center gap-3 border-b border-[#f1f1f1] py-2 text-[13px] last:border-0">
            <span className="w-5 text-muted">{i + 1}</span><span className="flex-1">{t.name}</span>
            {t.reject > 30 && <Chip size="small" color="error" variant="outlined" label="Attention required" />}<b className="tabular-nums">{t.reject}%</b>
          </div>
        ))}
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card title={`Revenue Trend · ${date}`} sub="Captured revenue and prevented denials, $K per month">
          <LineChart labels={MONTHS} format={(v) => `$${Math.round(v * scale)}K`}
            series={[{ name: 'Captured', color: '#0a0a0a', data: REV_TREND.captured }, { name: 'Denials prevented', color: '#1f6feb', data: REV_TREND.denials }]} />
        </Card>
        <Card title="Revenue Impact by Category" sub="Compare captured revenue and denials reduction.">
          {REV_CATEGORIES.map((c) => (
            <div key={c.title} className="mb-3">
              <div className="mb-1 flex justify-between text-[13px]"><span>{c.title}</span><b className="tabular-nums">{money((c.captured + c.denials) * scale)}</b></div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-[#efefef]">
                <div className="bg-ink" style={{ width: `${(c.captured / 200000) * 100}%` }} /><div className="bg-[#1f6feb]" style={{ width: `${(c.denials / 200000) * 100}%` }} />
              </div>
            </div>
          ))}
          <div className="mt-2 flex gap-4 text-xs text-muted"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-ink" />Captured</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#1f6feb]" />Denials reduction</span></div>
        </Card>
      </div>

      <Card title="Coding Variance Analytics — System vs. Final Codes" sub="CPT code acceptance/rejection rates and ICD-10 validation error breakdown across all tenants">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <div className="mb-2 text-[13px] font-semibold">ICD-10 Code Validation Errors</div>
            <div className="mb-2 flex gap-6"><div><div className="text-[20px] font-medium tabular-nums">5,241</div><div className="text-xs text-muted">Codes Validated</div></div>
              <div><div className="text-[20px] font-medium tabular-nums text-[#c0392b]">196</div><div className="text-xs text-muted">Validation Errors · 3.7% error rate</div></div></div>
            {ICD_ERRORS.map((e) => <div key={e.type} className="flex justify-between border-b border-[#f1f1f1] py-1.5 text-[13px]"><span>{e.type}</span><span className="tabular-nums">{e.count} ({Math.round((e.count / 196) * 100)}%)</span></div>)}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[['CPT Code Validation Quality', QUALITY_METRICS.cpt], ['ICD Code Validation Quality', QUALITY_METRICS.icd]].map(([t, m]) => (
              <div key={t}><div className="mb-2 text-[13px] font-semibold">{t}</div>
                {m.map((x) => <div key={x.title} className="mb-2"><div className="flex justify-between text-xs"><span title={x.description}>{x.title}</span><b>{x.value}%</b></div><LinearProgress variant="determinate" value={x.value} sx={{ height: 6, borderRadius: 3, bgcolor: '#efefef', '& .MuiLinearProgress-bar': { bgcolor: '#0a0a0a' } }} /></div>)}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card title="High-Variance & Frequently Rejected CPT Codes" sub="Codes where IC suggestions are most frequently rejected or skipped — sorted by rejection rate">
        <Table size="small">
          <TableHead><TableRow sx={{ '& th': { fontWeight: 600, fontSize: 12, color: '#6b6b6b' } }}>{['CPT Code', 'Description', 'Encounters', 'Rejection Rate', 'System Missed'].map((h) => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
          <TableBody>{REJECTED_CPT.map((r) => <TableRow key={r.code} hover><TableCell><span className="font-mono text-xs">{r.code}</span></TableCell><TableCell>{r.description}</TableCell><TableCell>{r.enc.toLocaleString()}</TableCell><TableCell>{r.rate}%</TableCell><TableCell>{r.missed}</TableCell></TableRow>)}</TableBody>
        </Table>
      </Card>
      <Snackbar open={!!toast} autoHideDuration={2400} onClose={() => setToast('')} message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </div>
  );
}

function CostSheet() {
  const [vals, setVals] = useState(Object.fromEntries(CPT_COSTS.map(([c, , v]) => [c, String(v)])));
  const [q, setQ] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState('');
  const bad = (c) => !/^\d+(\.\d{1,2})?$/.test(vals[c]);
  const anyBad = CPT_COSTS.some(([c]) => bad(c));
  const rows = CPT_COSTS.filter(([c, d]) => !q || (c + d).toLowerCase().includes(q.toLowerCase()));
  return (
    <Card title="Global CPT Cost sheet" sub="These default values will be used for all tenants unless customized by them. Used in Intelligent Coding metrics and Projected Impact Analysis.">
      <TextField placeholder="Search CPT code or description" value={q} onChange={(e) => setQ(e.target.value)} sx={{ maxWidth: 320, mb: 2 }} />
      <Table size="small">
        <TableHead><TableRow sx={{ '& th': { fontWeight: 600, fontSize: 12, color: '#6b6b6b' } }}><TableCell>CPT CODE</TableCell><TableCell>DESCRIPTION</TableCell><TableCell width={200}>DEFAULT VALUE (USD)</TableCell></TableRow></TableHead>
        <TableBody>
          {rows.map(([c, d]) => (
            <TableRow key={c}><TableCell><span className="font-mono text-xs">{c}</span></TableCell><TableCell>{d}</TableCell>
              <TableCell><TextField value={vals[c]} error={bad(c)} onChange={(e) => setVals({ ...vals, [c]: e.target.value })} slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }} /></TableCell></TableRow>
          ))}
        </TableBody>
      </Table>
      {rows.length === 0 && <div className="py-8 text-center text-muted">No CPT codes match the filters.</div>}
      <div className="mt-4 flex justify-end gap-3">
        <Button variant="outlined" color="inherit" onClick={() => setVals(Object.fromEntries(CPT_COSTS.map(([c, , v]) => [c, String(v)])))}>Cancel</Button>
        <Button variant="contained" disabled={anyBad} onClick={() => setConfirm(true)}>Save changes</Button>
      </div>
      <Dialog open={confirm} onClose={() => setConfirm(false)} maxWidth="xs" fullWidth>
        <div className="p-6"><div className="text-[17px] font-semibold">Save default values?</div>
          <div className="mt-2 text-[13.5px] text-[#444]">New defaults apply to every tenant that has not set its own cost sheet.</div>
          <div className="mt-5 flex justify-end gap-2.5"><Button variant="outlined" color="inherit" onClick={() => setConfirm(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => { setConfirm(false); setToast('Default values saved'); }}>Save</Button></div></div>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={2400} onClose={() => setToast('')} message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Card>
  );
}

function ImpactAnalysis() {
  const [file, setFile] = useState(null);
  const [target, setTarget] = useState(IC_TENANTS[0].name);
  const [filter, setFilter] = useState('');
  const [runs, setRuns] = useState(IMPACT_HISTORY);
  const [toast, setToast] = useState('');
  const run = () => {
    const id = 'r' + Date.now();
    setRuns((r) => [{ id, date: '2026-10-28', tenant: target, model: 'IC v2.3', by: 'AS Admin', status: 'Queued' }, ...r]);
    setTimeout(() => setRuns((r) => r.map((x) => (x.id === id ? { ...x, status: 'Processing' } : x))), 1200);
    setTimeout(() => setRuns((r) => r.map((x) => (x.id === id ? { ...x, status: 'Completed' } : x))), 4000);
    setFile(null); setToast('Analysis queued');
  };
  const color = { Completed: 'success', Failed: 'error', Processing: 'info', Queued: 'default' };
  return (
    <div className="flex flex-col gap-4">
      <Card title="Projected Impact Analysis" sub="Projected annual impact of Intelligent Coding for a tenant or prospect. Download the template, fill it in, then import it.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-[10px] border border-line p-4"><div className="text-[11px] font-semibold tracking-[.08em] text-muted">STEP 1</div>
            <div className="mt-1 text-sm font-semibold">Download template</div>
            <div className="my-2 text-[12.5px] text-muted">Add one row per encounter for the last 12 months. Keep the column headers unchanged and save the file as XLSX.</div>
            <Button variant="outlined" color="inherit" startIcon={<DownloadIcon />} onClick={() => setToast('Template downloaded')}>Download template</Button></div>
          <div className="rounded-[10px] border border-line p-4"><div className="text-[11px] font-semibold tracking-[.08em] text-muted">STEP 2</div>
            <div className="mt-1 text-sm font-semibold">Import</div>
            <div className="my-2 text-[12.5px] text-muted">Upload the filled template (XLSX only) for a tenant or prospect. The analysis runs in the background.</div>
            <div className="flex flex-wrap items-center gap-2">
              <TextField select value={target} onChange={(e) => setTarget(e.target.value)} sx={{ width: 230 }}>{IC_TENANTS.map((t) => <MenuItem key={t.id} value={t.name}>{t.name}</MenuItem>)}<MenuItem value="New prospect">New prospect</MenuItem></TextField>
              <Button component="label" variant="outlined" color="inherit" startIcon={<UploadIcon />}>{file ? file.name : 'Import file'}
                <input hidden type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files[0] || null)} /></Button>
              <Button variant="contained" disabled={!file} onClick={run}>Run analysis</Button>
            </div></div>
        </div>
      </Card>
      <Card title="History" sub="Most recent first. The Excel export includes revenue captured and denials prevented, so it can be shared with prospects.">
        <TextField select value={filter} onChange={(e) => setFilter(e.target.value)} slotProps={{ select: { displayEmpty: true, renderValue: (v) => v || 'All statuses' } }} sx={{ width: 180, mb: 2 }}>
          <MenuItem value="">All statuses</MenuItem>{['Queued', 'Processing', 'Completed', 'Failed'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
        <Table size="small">
          <TableHead><TableRow sx={{ '& th': { fontWeight: 600, fontSize: 12, color: '#6b6b6b' } }}>{['DATE', 'TENANT / PROSPECT', 'MODEL', 'RUN BY', 'STATUS', 'ACTIONS'].map((h) => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
          <TableBody>
            {runs.filter((r) => !filter || r.status === filter).map((r) => (
              <TableRow key={r.id} hover><TableCell><span className="font-mono text-xs">{r.date}</span></TableCell><TableCell>{r.tenant}</TableCell><TableCell>{r.model}</TableCell><TableCell>{r.by}</TableCell>
                <TableCell><Chip size="small" variant="outlined" color={color[r.status]} label={r.status} /></TableCell>
                <TableCell>{r.status === 'Completed' ? <Button size="small" startIcon={<DownloadIcon />} onClick={() => setToast('Export downloaded')}>Export</Button> : r.status === 'Failed' ? <Button size="small" color="error" onClick={() => setToast('Re-run queued')}>Re-run</Button> : '—'}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
        {runs.filter((r) => !filter || r.status === filter).length === 0 && <div className="py-8 text-center text-muted">No runs match the filters.</div>}
      </Card>
      <Snackbar open={!!toast} autoHideDuration={2400} onClose={() => setToast('')} message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </div>
  );
}

export default function IntelligentCodingAnalytics() {
  const [tab, setTab] = useState('metrics');
  return (
    <div className="flex flex-col gap-4">
      <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="inherit" slotProps={{ indicator: { style: { background: '#111' } } }} sx={{ borderBottom: '1px solid #e0e0e0', '& .MuiTab-root': { fontWeight: 600, fontSize: 13.5, color: '#6b6b6b' }, '& .Mui-selected': { color: '#111 !important' } }}>
        <Tab value="metrics" label="Intelligent Coding Metrics" /><Tab value="cost" label="Global CPT Cost sheet" /><Tab value="impact" label="Projected Impact Analysis" />
      </Tabs>
      {tab === 'metrics' && <Metrics />}{tab === 'cost' && <CostSheet />}{tab === 'impact' && <ImpactAnalysis />}
    </div>
  );
}
