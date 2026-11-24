import React, { useState } from 'react';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActiveOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import PowerIcon from '@mui/icons-material/PowerSettingsNewOutlined';
import ManageAccountsIcon from '@mui/icons-material/ManageAccountsOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import ReceiptIcon from '@mui/icons-material/ReceiptLongOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CloseIcon from '@mui/icons-material/Close';
import FormRow from '../../components/FormRow';
import { addDays, fmt } from '../../lib/dates';

const RECIPS = [['Tenant admins', ManageAccountsIcon], ['Account owner', AccountCircleIcon], ['Billing contact', ReceiptIcon]];
const CHANS = [['Application alert', NotificationsNoneIcon]];

export default function NotificationsSection({ f, setN, setF, cancelled, compact }) {
  const N = f.n, g = +f.grace || 0, lock = cancelled;
  const [sel, setSel] = useState('r30');

  const nEv = N.on ? N.r.filter((r) => r.on).length + (N.end ? 1 : 0) + (N.grace ? 1 : 0) : 0;
  const events = [
    ...[...N.r].sort((a, b) => b.days - a.days).map((r) => ({
      key: r.k, on: r.on, isRem: true, min: 1, unit: 'days before end', days: r.days, Icon: NotificationsActiveIcon,
      title: 'Expiry reminder', sub: 'Alert recipients before the subscription ends', date: fmt(addDays(f.end, -r.days)),
      setDays: (v) => setN({ r: N.r.map((x) => (x.k === r.k ? { ...x, days: Math.max(1, +v || 1) } : x)) }),
      flip: () => setN({ r: N.r.map((x) => (x.k === r.k ? { ...x, on: !x.on } : x)) }),
      remove: () => setN({ r: N.r.filter((x) => x.k !== r.k) }),
    })),
    { key: 'end', on: N.end, min: 0, unit: 'days after end date', days: N.endOff || 0, Icon: VisibilityIcon, title: 'Subscription ends',
      sub: 'Status moves to Read-Only and a notice is sent', date: fmt(addDays(f.end, N.endOff || 0)),
      setDays: (v) => setN({ endOff: Math.max(0, +v || 0) }), flip: () => setN({ end: !N.end }) },
    { key: 'grace', on: N.grace, min: 0, unit: 'days after end date', days: f.grace, Icon: PowerIcon, title: 'Grace period ends',
      sub: 'Status moves to Inactive and a notice is sent', date: fmt(addDays(f.end, g)),
      setDays: (v) => setF('grace', Math.max(0, +v || 0)), flip: () => setN({ grace: !N.grace }) },
  ];
  const se = events.find((e) => e.key === sel) || events[0];

  const addReminder = () => {
    if (lock) return;
    const used = N.r.map((x) => x.days);
    const d = [60, 45, 30, 21, 14, 10, 7, 5, 3, 2, 1].find((x) => !used.includes(x)) || 1, k = 'r' + Date.now();
    setN({ r: [...N.r, { k, days: d, on: true }] });
    setSel(k);
  };
  const toggleIn = (arr, label) => !lock && setN({ [arr]: N[arr].includes(label) ? N[arr].filter((x) => x !== label) : [...N[arr], label] });

  const nm = f.name.trim() || 'Your tenant';
  const to = [...N.to, ...N.extra.split(',').map((x) => x.trim()).filter(Boolean)];
  const bodies = {
    end: `Subscription ${f.sub} ended on ${fmt(f.end)}. The tenant is now Read-Only for ${g} days. Renew to restore full access.`,
    grace: `The grace period for ${f.sub} ended on ${fmt(addDays(f.end, g))}. Users can no longer sign in. Contact your account owner to reactivate.`,
  };
  const subject = se.isRem ? `${nm} subscription ends in ${se.days} days` : se.key === 'end' ? `${nm} subscription has ended` : `${nm} is now inactive`;
  const body = se.isRem
    ? `Subscription ${f.sub} ends on ${fmt(f.end)}. Renew before this date to keep full access. After it ends, the tenant is Read-Only for ${g} days.`
    : bodies[se.key];
  const dim = N.on ? '' : 'opacity-45';
  const Pill = ({ arr, label, Icon }) => {
    const on = N[arr].includes(label);
    return <Chip clickable onClick={() => toggleIn(arr, label)} icon={<Icon sx={{ fontSize: 16 }} />} label={label} variant={on ? 'filled' : 'outlined'} color={on ? 'primary' : 'default'} />;
  };

  return (
    <>
      <FormRow title="Automation" desc="Notices and status changes run from the dates in step 2. Nobody has to remember to send them." stacked={compact}>
        <label onClick={(e) => { e.preventDefault(); !lock && setN({ on: !N.on }); }} className="flex cursor-pointer items-center gap-3.5 rounded-[10px] border border-line bg-[#fafafa] px-4 py-3.5">
          <Switch checked={N.on} disabled={lock} />
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold">Automated notifications</div>
            <div className="mt-0.5 text-[12.5px] text-muted">{N.on ? `On. ${nEv} events scheduled from the end date ${fmt(f.end)}.` : 'Off. No notices are sent and status is changed manually.'}</div>
          </div>
        </label>
      </FormRow>

      <div className={dim}>
        <FormRow title="Schedule" desc="Set how many days before or after the end date each event fires. Select one to preview the message." stacked={compact}>
          {events.map((e) => (
            <div key={e.key} onClick={() => setSel(e.key)} className={`mb-2 flex cursor-pointer items-center gap-3 rounded-[10px] border px-3.5 py-2.5 ${se.key === e.key ? 'border-ink bg-[#fafafa]' : 'border-line bg-white'}`}>
              <span onClick={(ev) => ev.stopPropagation()}><Switch checked={e.on} disabled={lock || !N.on} onChange={e.flip} /></span>
              <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-[#f1f1f1]"><e.Icon sx={{ fontSize: 16 }} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[13.5px] font-semibold">
                  {e.title}
                  <span onClick={(ev) => ev.stopPropagation()} className="inline-flex items-center gap-1.5 text-[12.5px] font-normal text-[#555]">
                    <TextField type="number" value={e.days} disabled={lock || !N.on} onChange={(ev) => e.setDays(ev.target.value)} slotProps={{ htmlInput: { min: e.min, style: { padding: '4px 8px', textAlign: 'center' } } }} sx={{ width: 72, '& .MuiOutlinedInput-root': { height: 30 } }} />{e.unit}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-muted">{e.sub}</div>
              </div>
              <div className="whitespace-nowrap font-mono text-[12.5px] text-[#333]">{e.date}</div>
              {e.isRem && <IconButton size="small" title="Remove reminder" disabled={lock || !N.on} onClick={(ev) => { ev.stopPropagation(); e.remove(); }}><DeleteIcon fontSize="small" /></IconButton>}
            </div>
          ))}
          <Button variant="outlined" color="inherit" size="small" startIcon={<AddIcon />} onClick={addReminder} disabled={!N.on} sx={{ borderStyle: 'dashed' }}>Add reminder</Button>
        </FormRow>

        <FormRow title="Recipients and channels" desc="Who is notified, and where." stacked={compact}>
          <div className="flex flex-wrap gap-2">{RECIPS.map(([l, I]) => <Pill key={l} arr="to" label={l} Icon={I} />)}</div>
          <div className="mb-2 mt-[18px] text-[11px] font-semibold tracking-[.08em] text-muted">CHANNELS</div>
          <div className="flex flex-wrap gap-2">{CHANS.map(([l, I]) => <Pill key={l} arr="ch" label={l} Icon={I} />)}</div>
        </FormRow>

        <FormRow title="Preview" desc="Shown as a banner at the top of the application. Content fills in from the subscription." stacked={compact} last>
          <div className="mb-2 text-xs text-muted">Visible to: <span className="text-[#111]">{to.join(', ') || 'No recipients selected'}</span></div>
          <div className="overflow-hidden rounded-[10px] border border-line bg-[#f4f4f5]">
            <div className="flex h-[34px] items-center gap-2 bg-ink px-3.5">{[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 rounded-full bg-[#555]" />)}</div>
            <div className="flex items-start gap-3 border-b border-[#ecd9a0] bg-[#fff4d6] px-4 py-3">
              <NotificationsActiveIcon sx={{ fontSize: 20, color: '#7a5200', mt: '1px' }} />
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold text-[#3d2a00]">{subject}</div>
                <div className="mt-0.5 text-[12.5px] leading-normal text-[#5c4200]">{body}</div>
              </div>
              <CloseIcon sx={{ fontSize: 16, color: '#7a5200', mt: '2px' }} />
            </div>
            <div className="grid gap-2 px-4 py-3.5">
              <div className="h-2.5 w-[30%] rounded bg-[#e2e2e5]" /><div className="h-2.5 w-4/5 rounded bg-[#eaeaec]" /><div className="h-2.5 w-3/5 rounded bg-[#eaeaec]" />
            </div>
          </div>
        </FormRow>
      </div>
    </>
  );
}
