import React, { useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';
import Popover from '@mui/material/Popover';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Snackbar from '@mui/material/Snackbar';
import Badge from '@mui/material/Badge';
import TableChartIcon from '@mui/icons-material/TableChartOutlined';
import PdfIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ScheduleIcon from '@mui/icons-material/ScheduleOutlined';
import FilterIcon from '@mui/icons-material/FilterAltOutlined';
import ViewColumnIcon from '@mui/icons-material/ViewColumnOutlined';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import FolderOpenIcon from '@mui/icons-material/FolderOpenOutlined';
import RestartIcon from '@mui/icons-material/RestartAlt';
import StarIcon from '@mui/icons-material/StarBorder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { OPS_TENANTS, OPS_TEMPLATES, OPS_PERFORMERS, OPS_COLS, opsData } from '../../data/ops';

const PS = 30;
const GROUP_KEY = { Template: 'tpl', 'Performed By': 'by' };
const INIT = { sort: { k: 'date', d: -1 }, group: 'None', hide: [], q: '', tpl: '', by: '', page: 0, closed: [], filtersOpen: false };

export default function OperationalUsage() {
  const all = useMemo(opsData, []);
  const [tenant, setTenant] = useState(OPS_TENANTS[0]);
  const [sub, setSub] = useState('tbl');
  const [s, setS] = useState(INIT);
  const [colsEl, setColsEl] = useState(null);
  const [toast, setToast] = useState('');
  const set = (p) => setS((x) => ({ ...x, ...p }));

  const rows = useMemo(() => {
    const q = s.q.trim().toLowerCase();
    const r = all.filter((x) => (!s.tpl || x.tpl === s.tpl) && (!s.by || x.by === s.by) && (!q || `${x.mrn} ${x.pid} ${x.first} ${x.last}`.toLowerCase().includes(q)));
    return [...r].sort((a, b) => (a[s.sort.k] > b[s.sort.k] ? 1 : a[s.sort.k] < b[s.sort.k] ? -1 : 0) * s.sort.d);
  }, [all, s.tpl, s.by, s.q, s.sort]);

  const cols = OPS_COLS.filter((c) => !s.hide.includes(c[0]));
  const gk = GROUP_KEY[s.group];
  const items = useMemo(() => {
    if (!gk) return rows.map((r) => ({ row: r }));
    const m = {};
    rows.forEach((r) => (m[r[gk]] = m[r[gk]] || []).push(r));
    return Object.keys(m).sort().flatMap((key) => {
      const closed = s.closed.includes(key);
      return [{ group: key || 'None', raw: key, count: m[key].length, closed }, ...(closed ? [] : m[key].map((r) => ({ row: r })))];
    });
  }, [rows, gk, s.closed]);
  const page = Math.min(s.page, Math.max(0, Math.ceil(items.length / PS) - 1));
  const hasFilter = !!(s.q || s.tpl || s.by);
  const flash = (t) => () => setToast(t);

  const count = (key) => { const m = {}; rows.forEach((r) => (m[r[key]] = (m[r[key]] || 0) + 1)); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
  const mon = {}; rows.forEach((r) => { const k = r.date.slice(0, 7); mon[k] = (mon[k] || 0) + 1; });
  const charts = [
    { title: 'Visits by template', sub: 'Filtered visits grouped by study template', data: count('tpl') },
    { title: 'Visits by performing user', sub: 'Utilization across users', data: count('by').map(([l, n]) => [l || 'Unassigned', n]) },
    { title: 'Visits by month', sub: 'Last 60 days of activity', data: Object.entries(mon).sort() },
  ];
  const kpis = [
    ['Number of Visits', rows.length.toLocaleString(), '#111'], ['Number of Patients', new Set(rows.map((r) => r.pid)).size.toLocaleString(), '#111'],
    ['Number of Procedures', '3', '#111'], ['Number of Indications', '3', '#1f6feb'],
    ['Average Scan Time by Procedure', '496m', '#1a9b57'], ['Average Total Study Duration', '190m', '#d9731a'],
  ];
  const outBtn = { height: 34, bgcolor: '#fff', borderColor: '#d6d6d6', color: '#111' };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <TextField select label="Tenant" value={tenant} onChange={(e) => { setTenant(e.target.value); set({ page: 0 }); }} sx={{ minWidth: 220, width: 'auto', bgcolor: '#fff' }}>
          {OPS_TENANTS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
        <div className="flex-1" />
        <Button variant="outlined" startIcon={<TableChartIcon />} onClick={flash('XLS exported')} sx={outBtn}>XLS</Button>
        <Button variant="outlined" startIcon={<PdfIcon />} onClick={flash('PDF exported')} sx={outBtn}>PDF</Button>
        <Button variant="outlined" startIcon={<ScheduleIcon />} onClick={flash('Schedule saved')} sx={outBtn}>Schedule</Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        {kpis.map(([l, v, c]) => (
          <div key={l} className="rounded-[10px] bg-white px-4 py-3.5 shadow-sm">
            <div className="text-xs text-muted">{l}</div>
            <div className="mt-1 text-[26px] font-semibold" style={{ color: c }}>{v}</div>
          </div>
        ))}
      </div>

      <Tabs value={sub} onChange={(_, v) => setSub(v)} textColor="inherit" slotProps={{ indicator: { style: { background: '#111' } } }} sx={{ borderBottom: '1px solid #e0e0e0', '& .MuiTab-root': { fontWeight: 600, letterSpacing: '.06em', fontSize: 13, color: '#6b6b6b' }, '& .Mui-selected': { color: '#111 !important' } }}>
        <Tab value="tbl" label="Configurable Table" />
        <Tab value="vol" label="Volume & Utilization Metrics" />
      </Tabs>

      {sub === 'tbl' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="dot" color="primary" invisible={!hasFilter}>
              <Button variant="outlined" startIcon={<FilterIcon />} onClick={() => set({ filtersOpen: !s.filtersOpen })} sx={{ ...outBtn, bgcolor: s.filtersOpen ? '#ececec' : '#fff' }}>Filters</Button>
            </Badge>
            <span className="text-xs font-semibold text-[#555]">Group By</span>
            <TextField select value={s.group} onChange={(e) => set({ group: e.target.value, page: 0, closed: [] })} sx={{ width: 150, bgcolor: '#fff' }}>
              {['None', 'Template', 'Performed By'].map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
            </TextField>
            <Button variant="outlined" startIcon={<ViewColumnIcon />} onClick={(e) => setColsEl(e.currentTarget)} sx={outBtn}>Columns {cols.length}/{OPS_COLS.length}</Button>
            <Popover open={!!colsEl} anchorEl={colsEl} onClose={() => setColsEl(null)}>
              <div className="flex max-h-80 w-60 flex-col overflow-y-auto p-2">
                {OPS_COLS.map(([k, label]) => (
                  <FormControlLabel key={k} label={<span className="text-[13px]">{label}</span>}
                    control={<Checkbox size="small" checked={!s.hide.includes(k)} onChange={() => set({ hide: s.hide.includes(k) ? s.hide.filter((z) => z !== k) : [...s.hide, k] })} />} />
                ))}
              </div>
            </Popover>
            <div className="flex-1" />
            <div className="text-xs text-muted">{rows.length.toLocaleString()} records</div>
          </div>

          {s.filtersOpen && (
            <div className="flex flex-wrap items-end gap-3 rounded-[10px] bg-white px-3.5 py-3 shadow-sm">
              <TextField label="Search" placeholder="Patient name, ID or MRN" value={s.q} onChange={(e) => set({ q: e.target.value, page: 0 })} sx={{ width: 240 }} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField select label="Template" value={s.tpl} onChange={(e) => set({ tpl: e.target.value, page: 0 })} sx={{ width: 160 }} slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}>
                <MenuItem value="">All</MenuItem>{OPS_TEMPLATES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField select label="Performed by" value={s.by} onChange={(e) => set({ by: e.target.value, page: 0 })} sx={{ width: 200 }} slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}>
                <MenuItem value="">All</MenuItem>{OPS_PERFORMERS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <Button onClick={() => set({ q: '', tpl: '', by: '', page: 0 })} sx={{ textDecoration: 'underline', color: '#111' }}>Clear</Button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#555]">Template Name</span>
            <TextField placeholder="Choose a saved template" sx={{ width: 220, bgcolor: '#fff' }} />
            <Button variant="contained" startIcon={<SaveIcon />} onClick={flash('Template saved')} sx={{ height: 34 }}>Save Template</Button>
            <Button variant="outlined" startIcon={<FolderOpenIcon />} disabled sx={outBtn}>Load Template</Button>
            <Button variant="outlined" startIcon={<RestartIcon />} onClick={() => setS(INIT)} sx={outBtn}>Reset to Default View</Button>
            <Button variant="outlined" startIcon={<StarIcon />} disabled sx={outBtn}>Set as Default on Open</Button>
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <Table size="small" sx={{ minWidth: cols.reduce((a, c) => a + c[2], 0) }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f7f7f7', '& th': { fontWeight: 600, fontSize: 12.5, whiteSpace: 'nowrap' } }}>
                    {cols.map(([k, label, w]) => (
                      <TableCell key={k} sx={{ minWidth: w }} sortDirection={s.sort.k === k ? (s.sort.d === 1 ? 'asc' : 'desc') : false}>
                        <TableSortLabel active={s.sort.k === k} direction={s.sort.d === 1 ? 'asc' : 'desc'}
                          onClick={() => set({ sort: { k, d: s.sort.k === k ? -s.sort.d : 1 }, page: 0 })}>{label}</TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.slice(page * PS, (page + 1) * PS).map((it, i) => it.group !== undefined ? (
                    <TableRow key={'g' + it.raw} hover onClick={() => set({ closed: it.closed ? s.closed.filter((z) => z !== it.raw) : [...s.closed, it.raw] })} sx={{ bgcolor: '#efefef', cursor: 'pointer' }}>
                      <TableCell colSpan={cols.length} sx={{ fontWeight: 600 }}>
                        <span className="inline-flex items-center gap-1.5">{it.closed ? <ChevronRightIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}{it.group}<span className="font-normal text-muted">{it.count} records</span></span>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={i} hover>{cols.map(([k]) => <TableCell key={k} sx={{ whiteSpace: 'nowrap', fontSize: 13 }}>{String(it.row[k])}</TableCell>)}</TableRow>
                  ))}
                </TableBody>
              </Table>
              {items.length === 0 && <div className="p-10 text-center text-muted">No records match the current filters.</div>}
            </div>
            <TablePagination component="div" count={items.length} page={page} rowsPerPage={PS} rowsPerPageOptions={[PS]} onPageChange={(_, p) => set({ page: p })}
              labelDisplayedRows={() => `${rows.length.toLocaleString()} total records`} />
          </div>
        </div>
      )}

      {sub === 'vol' && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-3">
          {charts.map((ch) => {
            const mx = Math.max(1, ...ch.data.map((d) => d[1]));
            return (
              <div key={ch.title} className="rounded-xl bg-white p-[18px] shadow-sm">
                <div className="text-sm font-semibold">{ch.title}</div>
                <div className="mb-3.5 mt-0.5 text-xs text-muted">{ch.sub}</div>
                {ch.data.map(([l, n]) => (
                  <div key={l} className="mb-2 grid grid-cols-[130px_minmax(0,1fr)_56px] items-center gap-2.5 text-[13px]">
                    <div className="truncate">{l || 'Unassigned'}</div>
                    <div className="h-3 rounded-md bg-[#efefef]"><div className="h-3 rounded-md bg-ink" style={{ width: `${Math.round((n / mx) * 100)}%` }} /></div>
                    <div className="text-right text-[#444]">{n}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
      <Snackbar open={!!toast} autoHideDuration={2400} onClose={() => setToast('')} message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </div>
  );
}
