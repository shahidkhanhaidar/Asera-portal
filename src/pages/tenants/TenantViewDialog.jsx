import React from 'react';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import StatusChip from '../../components/StatusChip';
import { PKG, isSp } from '../../data/packages';
import { fmt, addDays, daysBetween } from '../../lib/dates';

const Rows = ({ rows }) => (
  <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-[13.5px]">
    {rows.map(([k, v]) => (<React.Fragment key={k}><div className="text-muted">{k}</div><div>{v}</div></React.Fragment>))}
  </div>
);
const Section = ({ title, children }) => (
  <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-6 border-b border-[#f1f1f1] py-5">
    <div className="pt-0.5 text-[11px] font-semibold tracking-[.08em] text-muted">{title}</div>
    {children}
  </div>
);

export default function TenantViewDialog({ tenant: t, onClose }) {
  const N = t.n, g = +t.grace || 0;
  const rems = N.r.filter((r) => r.on).map((r) => r.days).sort((a, b) => b - a);
  const ex = N.extra.split(',').map((x) => x.trim()).filter(Boolean);
  const ig = (on, v) => (on ? v || 'Connected' : 'Not connected');
  const groups = Object.keys(PKG).filter((x) => t.pk.some((k) => k.startsWith(x + '|'))).map((x) => {
    const rg = t.pk.filter((k) => k.startsWith(x + '|') && !isSp(k)).map((k) => k.split('|')[1]);
    const sp = t.pk.filter((k) => k.startsWith(x + '|') && isSp(k)).map((k) => k.split('|')[1]);
    return { g: x, cnt: `${rg.length} of ${PKG[x].length}`, items: rg, sp };
  });
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth={false} slotProps={{ paper: { style: { width: 720, maxWidth: '100%' } } }}>
      <div className="flex items-start gap-3.5 px-7 pb-5 pt-6">
        <div className="min-w-0 flex-1">
          <div className="text-[21px] font-semibold tracking-tight">{t.name}</div>
          <div className="mt-[3px] text-[13px] text-muted">{t.domain}</div>
        </div>
        <StatusChip status={t.status} large />
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </div>
      <div className="overflow-y-auto border-t border-[#ececec] px-7 pb-2">
        <Section title="SUBSCRIPTION"><Rows rows={[['Subscription ID', t.sub], ['Start date', fmt(t.start)], ['End date', fmt(t.end)], ['Term', `${daysBetween(t.start, t.end)} days`], ['Grace period', `${g} days, until ${fmt(addDays(t.end, g))}`]]} /></Section>
        <Section title="PRODUCT PACKAGES">
          <div>{groups.map((x) => (
            <div key={x.g} className="mb-4">
              <div className="mb-2 text-[13.5px] font-semibold">{x.g}<span className="ml-2 font-normal text-[#8a8a8a]">{x.cnt}</span></div>
              <div className="flex flex-wrap gap-1.5">{x.items.map((i) => <span key={i} className="inline-flex h-6 items-center rounded-full bg-[#f1f1f1] px-2.5 text-[12.5px]">{i}</span>)}</div>
              {x.sp.length > 0 && <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted">Special feature{x.sp.map((i) => <span key={i} className="inline-flex h-6 items-center rounded-full bg-ink px-2.5 text-white">{i}</span>)}</div>}
            </div>))}</div>
        </Section>
        <Section title="INTEGRATIONS"><Rows rows={[['Fax', ig(!!t.fax, `Concord Fax${t.faxUser ? ' · ' + t.faxUser : ''}${t.faxNum ? ' · ' + t.faxNum : ''}`)], ['HL7', ig(!!t.hl7, t.hl7)], ['PACS', ig(!!t.pacs, t.pacs)]]} /></Section>
        <Section title="CORPORATE MODE"><Rows rows={[['Corporate mode', t.corp ? 'On' : 'Off']]} /></Section>
        <Section title="NOTIFICATIONS"><Rows rows={N.on ? [
          ['Reminders', rems.length ? `${rems.join(', ')} days before end date` : 'None'],
          ['Read-Only', N.end ? (N.endOff ? `${N.endOff} days after end date` : 'On end date') : 'Off'],
          ['Inactive', N.grace ? `${g} days after end date` : 'Off'],
          ['Recipients', [...N.to, ...ex].join(', ') || 'None'], ['Channels', N.ch.join(', ') || 'None'],
        ] : [['Automated notifications', 'Off']]} /></Section>
      </div>
      <div className="flex justify-end border-t border-[#ececec] px-7 py-3.5"><Button variant="outlined" color="inherit" onClick={onClose}>Close</Button></div>
    </Dialog>
  );
}
