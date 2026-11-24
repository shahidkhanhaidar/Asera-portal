import React, { useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';
import TenantDetailsSection from './TenantDetailsSection';
import SubscriptionSection from './SubscriptionSection';
import NotificationsSection from './NotificationsSection';
import { validate } from '../../lib/validation';
import { daysBetween } from '../../lib/dates';

const STEPS = [
  ['Tenant details', 'Identity, integrations and corporate mode.'],
  ['Subscription', 'Term, status and product packages.'],
  ['Notifications', 'Automated notices and status changes tied to the end date.'],
];

/** mode 'add' = 3-step wizard; mode 'update' = single dialog (subscription + notifications). */
export default function TenantDialog({ mode, initial, tenants, onClose, onSubmit, onAskCancel, onInvalid }) {
  const isAdd = mode === 'add';
  const [f, setFull] = useState(initial);
  const [step, setStep] = useState(isAdd ? 1 : 2);
  const [tried, setTried] = useState(false);
  const cancelled = f.status === 'Cancelled';

  const setF = (k, v) => setFull((s) => ({ ...s, [k]: v }));
  const setN = (p) => setFull((s) => ({ ...s, n: { ...s.n, ...p } }));
  const E = useMemo(() => validate(f, tenants, isAdd), [f, tenants, isAdd]);

  const shown = isAdd ? E[`s${step}`] : [...E.s2, ...E.s3];
  const ok1 = !E.s1.length, ok2 = !E.s2.length;
  const last = step === 3;
  const nInteg = ['fax', 'hl7', 'pacs'].filter((k) => f[k + 'On']).length;
  const days = daysBetween(f.start, f.end);
  const nEv = f.n.on ? f.n.r.filter((r) => r.on).length + (f.n.end ? 1 : 0) + (f.n.grace ? 1 : 0) : 0;
  const subs = [
    `${f.domain.trim() || 'No domain yet'} · ${nInteg} integration${nInteg === 1 ? '' : 's'}`,
    f.end > f.start ? `${days} days · ${f.pk.length} package${f.pk.length === 1 ? '' : 's'}` : 'Check dates',
    f.n.on ? `${nEv} automated event${nEv === 1 ? '' : 's'}` : 'Off',
  ];

  const goStep = (n) => { if (!isAdd || n <= step || (n === 2 && ok1) || (n === 3 && ok1 && ok2)) setStep(n); };
  const next = () => {
    if (E[`s${step}`].length) { setTried(true); onInvalid(); return; }
    setStep(step + 1); setTried(false);
  };
  const submit = () => {
    const bad = isAdd ? [1, 2, 3].find((n) => E[`s${n}`].length) : E.s2.length || E.s3.length ? 2 : 0;
    if (bad) { if (isAdd) setStep(bad); setTried(true); onInvalid(); return; }
    onSubmit(f);
  };

  return (
    <Dialog open onClose={isAdd ? undefined : onClose} fullWidth maxWidth={false}
      slotProps={{ paper: { style: { width: isAdd ? 1020 : 720, maxWidth: '100%', height: isAdd ? 'min(720px, calc(100vh - 40px))' : 'auto', maxHeight: 'calc(100vh - 40px)' } } }}>
      <div className="flex items-center gap-3 border-b border-[#ececec] px-7 py-5">
        <div className="text-[19px] font-semibold">{isAdd ? 'Add - Tenant' : 'Update subscription'}</div>
        <div className="truncate text-[13px] text-muted">{f.name.trim() || 'Untitled tenant'}</div>
        <div className="flex-1" />
        <IconButton size="small" onClick={onClose} aria-label="Close"><CloseIcon /></IconButton>
      </div>

      <div className="flex min-h-0 flex-1 gap-2 px-4 pt-4">
        {isAdd && (
          <div className="mb-4 w-[232px] flex-none overflow-y-auto rounded-[10px] bg-[#f4f4f5] px-5 py-6">
            {STEPS.map(([label], i) => {
              const n = i + 1, cur = step === n, done = n < step;
              return (
                <div key={label} onClick={() => goStep(n)} className="flex cursor-pointer gap-3.5">
                  <div className="flex flex-col items-center">
                    <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full border text-[12.5px] font-semibold ${cur ? 'border-ink bg-ink text-white' : done ? 'border-[#1a9b57] bg-[#1a9b57] text-white' : 'border-[#b5b5b5] text-[#555]'}`}>
                      {done ? <CheckIcon sx={{ fontSize: 15 }} /> : n}
                    </span>
                    {i < 2 && <span className={`my-1 min-h-[26px] w-px flex-1 ${done ? 'bg-[#1a9b57]' : 'bg-[#d0d0d0]'}`} />}
                  </div>
                  <div className="min-w-0 pb-[18px] pt-1">
                    <div className={`text-sm ${cur ? 'font-semibold text-[#111]' : 'font-medium text-[#555]'}`}>{label}</div>
                    <div className="mt-[3px] text-xs leading-snug text-[#7a7a7a]">{subs[i]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          {isAdd && (
            <div className="border-b border-[#ececec] px-4 pb-3.5 pt-2">
              <div className="text-[17px] font-semibold">{STEPS[step - 1][0]}</div>
              <div className="mt-1 text-[13px] text-muted">{STEPS[step - 1][1]}</div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-4">
            {cancelled && (
              <Alert severity="error" icon={<BlockIcon />} sx={{ mt: 2.25 }}>This subscription is cancelled, so the tenant is cancelled too. Details are read-only.</Alert>
            )}
            {tried && shown.length > 0 && (
              <Alert severity="error" sx={{ mt: 2.25 }}>
                <div className="font-semibold">Fix the following to continue</div>
                {shown.map((m) => <div key={m} className="mt-0.5">• {m}</div>)}
              </Alert>
            )}
            <div className={cancelled ? 'pointer-events-none' : ''}>
              {isAdd && step === 1 && <TenantDetailsSection f={f} setF={setF} errors={E} tried={tried} />}
              {step === 2 && <SubscriptionSection f={f} setF={setF} isEdit={!isAdd} compact={!isAdd} cancelled={cancelled} onAskCancel={() => onAskCancel(f)} />}
              {(step === 3 || !isAdd) && <NotificationsSection f={f} setF={setF} setN={setN} cancelled={cancelled} compact={!isAdd} />}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-[#ececec] px-7 py-4">
        <Button variant="outlined" color="inherit" onClick={isAdd && step > 1 ? () => { setStep(step - 1); setTried(false); } : onClose}>
          {isAdd && step > 1 ? 'Back' : 'Cancel'}
        </Button>
        {isAdd && !last && <Button variant="contained" onClick={next}>Next</Button>}
        {((isAdd && last) || (!isAdd && !cancelled)) && (
          <Button variant="contained" onClick={submit}>{isAdd ? 'Create tenant' : 'Update'}</Button>
        )}
      </div>
    </Dialog>
  );
}
