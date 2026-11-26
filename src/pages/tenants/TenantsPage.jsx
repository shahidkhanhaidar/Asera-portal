import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import StatusChip from '../../components/StatusChip';
import ConfirmDialog from '../../components/ConfirmDialog';
import TenantDialog from './TenantDialog';
import TenantViewDialog from './TenantViewDialog';
import { defaultNotifications } from '../../data/tenants';
import { tenantsApi } from '../../lib/api';
import { PKG, STATUSES, pkLabels } from '../../data/packages';
import { TODAY, addYears } from '../../lib/dates';

const nextSub = (list) => `SUB-${Math.max(10420, ...list.map((t) => +t.sub.replace('SUB-', '') || 0)) + 1}`;
const blank = (list) => ({
  name: '', domain: '', fax: '', faxOn: false, faxUrl: 'https://www.concordfax.com/', faxUser: '', faxPass: '', faxNum: '',
  hl7: '', hl7On: false, pacs: '', pacsOn: false, corp: false, sub: nextSub(list),
  start: TODAY, end: addYears(TODAY, 1), term: '1', grace: 30, status: 'Active', pk: [], n: defaultNotifications(),
});
const toForm = (t) => ({
  ...t, faxOn: !!t.fax, hl7On: !!t.hl7, pacsOn: !!t.pacs, term: (function () {
    for (let n = 1; n <= 5; n++) if (addYears(t.start, n) === t.end) return String(n);
    return 'custom';
  })(), pk: [...t.pk], n: JSON.parse(JSON.stringify(t.n)),
});
const integText = (t) => [t.fax && `Fax · ${t.fax}${t.faxNum ? ' · ' + t.faxNum : ''}`, t.hl7 && `HL7 · ${t.hl7}`, t.pacs && `PACS · ${t.pacs}`].filter(Boolean).join('\n') || '—';
const lc = (x) => (x || '').toLowerCase();
const EMPTY_F = { name: '', sub: '', pk: '', status: '', integ: '' };

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const load = () => {
    setLoading(true); setLoadError('');
    tenantsApi.list().then(setTenants).catch((e) => setLoadError(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);
  const [F, setFilters] = useState(EMPTY_F);
  const headRef = useRef(null);
  const [head1, setHead1] = useState(34);
  useLayoutEffect(() => {
    const el = headRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setHead1(el.getBoundingClientRect().height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [dialog, setDialog] = useState(null); // { mode, initial, editId }
  const [view, setView] = useState(null);
  const [confirm, setConfirm] = useState(null); // { kind:'cancel'|'status', sub, form? }
  const [toast, setToast] = useState('');

  const setFk = (k) => (e) => setFilters((s) => ({ ...s, [k]: e.target.value }));
  const hasF = Object.values(F).some(Boolean);
  const list = useMemo(() => tenants.filter((t) =>
    (!F.name || lc(t.name + ' ' + t.domain).includes(lc(F.name))) && (!F.sub || lc(t.sub).includes(lc(F.sub))) &&
    (!F.pk || t.pk.some((x) => x.startsWith(F.pk + '|'))) && (!F.status || t.status === F.status) &&
    (!F.integ || lc(integText(t)).includes(lc(F.integ)))), [tenants, F]);

  const settingUp = () => setToast('This tenant is still being set up. It can be opened once it is Active.');
  const save = async (f, editId) => {
    const isAdd = !editId;
    setSaving(true);
    try {
      if (isAdd) {
        const rec = await tenantsApi.create(f);
        setTenants((s) => [rec, ...s]);
        setToast(`Tenant ${rec.name} added`);
      } else {
        const cur = tenants.find((t) => t.sub === editId);
        const rec = await tenantsApi.update(cur.id, f);
        setTenants((s) => s.map((t) => (t.id === rec.id ? rec : t)));
        setToast('Subscription updated');
      }
      setDialog(null);
    } catch (e) {
      setToast(e.message);
    } finally {
      setSaving(false);
    }
  };
  const onSubmit = (f) => {
    const cur = tenants.find((x) => x.sub === dialog.editId);
    if (dialog.mode === 'update' && cur && cur.status === 'Active' && f.status !== 'Active') setConfirm({ kind: 'status', form: f });
    else save(f, dialog.editId);
  };
  const doCancel = async (sub) => {
    try {
      const rec = await tenantsApi.cancel(tenants.find((t) => t.sub === sub).id);
      setTenants((s) => s.map((t) => (t.id === rec.id ? rec : t)));
      setConfirm(null); setDialog(null); setToast('Subscription and tenant cancelled');
    } catch (e) {
      setConfirm(null); setToast(e.message);
    }
  };

  const confirmTenant = confirm && tenants.find((t) => t.sub === (confirm.sub || dialog?.editId));
  const scNote = { 'Read-Only': 'Users will be able to view studies but not create new ones.', Inactive: 'Users will no longer be able to sign in.' };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-[18px] flex flex-none items-start gap-4">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Tenants</div>
          <div className="mt-[3px] text-[13px] text-muted">Onboard and manage customer environments, with their subscription and product packages.</div>
        </div>
        <div className="flex-1" />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ mode: 'add', initial: blank(tenants) })} sx={{ height: 38, whiteSpace: 'nowrap', flex: 'none' }}>Add Tenant</Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-line bg-white">
        <div className="min-h-0 flex-1 overflow-auto">
        <Table sx={{ minWidth: 1130 }} size="small">
          <TableHead>
            <TableRow ref={headRef} sx={{ '& th': { fontSize: 11, fontWeight: 600, letterSpacing: '.08em', color: '#6b6b6b', borderBottom: 'none', pb: 0.5, pt: 1.5, position: 'sticky', top: 0, zIndex: 3, bgcolor: '#fff' } }}>
              {['CLIENT NAME', 'SUBSCRIPTION', 'PRODUCT PACKAGES', 'STATUS', 'END DATE', 'INTEGRATIONS', ''].map((h) => <TableCell key={h} sx={{ whiteSpace: 'nowrap' }}>{h}</TableCell>)}
            </TableRow>
            <TableRow sx={{ '& th': { pb: 1.5, fontWeight: 400, position: 'sticky', top: head1, zIndex: 3, bgcolor: '#fff', borderBottom: '1px solid #e6e6e6' } }}>
              <TableCell><TextField placeholder="Search client" value={F.name} onChange={setFk('name')} /></TableCell>
              <TableCell><TextField placeholder="Search ID" value={F.sub} onChange={setFk('sub')} /></TableCell>
              <TableCell>
                <TextField select slotProps={{ select: { displayEmpty: true, renderValue: (v) => v || <span className="text-[#8a8a8a]">All product packages</span> } }} value={F.pk} onChange={setFk('pk')}>
                  <MenuItem value="">All product packages</MenuItem>
                  {Object.keys(PKG).map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </TextField>
              </TableCell>
              <TableCell>
                <TextField select slotProps={{ select: { displayEmpty: true, renderValue: (v) => v || <span className="text-[#8a8a8a]">All status</span> } }} value={F.status} onChange={setFk('status')}>
                  <MenuItem value="">All status</MenuItem>
                  {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </TableCell>
              <TableCell />
              <TableCell><TextField placeholder="Search integration" value={F.integ} onChange={setFk('integ')} /></TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((t) => {
              const pr = t.status === 'Processing', c = t.status === 'Cancelled';
              return (
                <TableRow key={t.sub} hover onClick={() => (pr ? settingUp() : setView(t))}
                  sx={{ cursor: pr ? 'not-allowed' : 'pointer', opacity: pr ? 0.5 : c ? 0.55 : 1, verticalAlign: 'middle' }}>
                  <TableCell>
                    <div className="font-semibold">{t.name}</div>
                    <div className="mt-0.5 text-xs text-[#8a8a8a]">{t.domain}</div>
                  </TableCell>
                  <TableCell><span className="font-mono text-[12.5px]">{t.sub}</span></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">{pkLabels(t.pk).map((p) => <span key={p} className="inline-flex h-[22px] items-center rounded-full bg-[#f1f1f1] px-2 text-[11.5px] whitespace-nowrap">{p}</span>)}</div>
                  </TableCell>
                  <TableCell><StatusChip status={t.status} /></TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}><span className="font-mono text-[12.5px] text-[#333]">{t.end}</span></TableCell>
                  <TableCell><span className="whitespace-pre-line text-[12.5px] leading-normal text-[#444]">{integText(t)}</span></TableCell>
                  <TableCell>
                    <Tooltip title={pr ? 'Setting up. Available once Active.' : 'Update subscription'}>
                      <span>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); pr ? settingUp() : setDialog({ mode: 'update', initial: toForm(t), editId: t.sub }); }} sx={{ opacity: pr ? 0.35 : 1 }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
        {loading && <div className="px-5 py-12 text-center text-[13px] text-[#8a8a8a]">Loading tenants…</div>}
        {loadError && (
          <div className="px-5 py-12 text-center text-[13px] text-[#c0392b]">
            {loadError} <span onClick={load} className="cursor-pointer text-[#111] underline">Try again</span>
          </div>
        )}
        {!loading && !loadError && list.length === 0 && <div className="px-5 py-12 text-center text-[13px] text-[#8a8a8a]">No tenants match your search.</div>}
        <div className="flex flex-none gap-4 border-t border-line px-5 py-3 text-[12.5px] text-muted">
          <span>Showing {list.length} of {tenants.length} tenants</span>
          {hasF && <span onClick={() => setFilters(EMPTY_F)} className="cursor-pointer text-[#111] underline">Clear filters</span>}
        </div>
      </div>

      {dialog && (
        <TenantDialog key={dialog.editId || 'add'} mode={dialog.mode} initial={dialog.initial} tenants={tenants}
          saving={saving} onClose={() => setDialog(null)} onSubmit={onSubmit} onInvalid={() => setToast('Fix the highlighted details to continue')}
          onAskCancel={() => setConfirm({ kind: 'cancel', sub: dialog.editId })} />
      )}
      {view && <TenantViewDialog tenant={view} onClose={() => setView(null)} />}

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.kind === 'status' ? `Change status to ${confirm.form.status}?` : 'Cancel subscription?'}
        confirmName={confirm?.kind === 'status' ? confirm.form.name : confirmTenant?.name || ''}
        note={confirm?.kind === 'status'
          ? `${confirm.form.name} will move from Active to ${confirm.form.status}. ${scNote[confirm.form.status] || ''}`
          : confirmTenant ? `${confirmTenant.name} (${confirmTenant.sub}) will be cancelled along with its subscription. Every tenant is linked to its subscription, so users lose access. This cannot be undone.` : ''}
        keepLabel={confirm?.kind === 'status' ? 'Go back' : 'Keep subscription'}
        confirmLabel={confirm?.kind === 'status' ? `Change status to ${confirm.form.status}` : 'Cancel subscription and tenant'}
        onClose={() => setConfirm(null)}
        onConfirm={() => { if (confirm.kind === 'status') { const f = confirm.form; setConfirm(null); save(f, dialog.editId); } else doCancel(confirm.sub); }}
      />
      <Snackbar open={!!toast} autoHideDuration={2800} onClose={() => setToast('')} message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </div>
  );
}
