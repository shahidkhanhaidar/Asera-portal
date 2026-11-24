import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BlockIcon from '@mui/icons-material/Block';
import FormRow from '../../components/FormRow';
import Field from '../../components/Field';
import { PKG, SP, grpAll, groupTotal, STATUS_COLOR } from '../../data/packages';
import { addYears, addDays, daysBetween, fmt } from '../../lib/dates';

const STATUS_OPTS = [['Active', 'Full access'], ['Read-Only', 'View only, no new studies'], ['Inactive', 'Users cannot sign in']];

export default function SubscriptionSection({ f, setF, isEdit, compact, cancelled, onAskCancel }) {
  const [pkg, setPkg] = useState("Women's Health");
  const dateErr = !(f.end > f.start);
  const days = daysBetween(f.start, f.end);
  const count = (g) => f.pk.filter((k) => k.startsWith(g + '|')).length;
  const allOn = count(pkg) === groupTotal(pkg);
  const toggle = (key) => !cancelled && setF('pk', f.pk.includes(key) ? f.pk.filter((x) => x !== key) : [...f.pk, key]);
  const selectAll = () => !cancelled && setF('pk', allOn ? f.pk.filter((k) => !k.startsWith(pkg + '|')) : [...new Set([...f.pk, ...grpAll(pkg)])]);

  const PkgItem = ({ label }) => {
    const key = `${pkg}|${label}`, on = f.pk.includes(key);
    return (
      <div onClick={() => toggle(key)} className={`flex items-center gap-1 rounded-lg border pr-3 ${on ? 'border-ink bg-[#f7f7f7]' : 'border-[#e0e0e0] bg-white'} ${cancelled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <Checkbox size="small" checked={on} disabled={cancelled} tabIndex={-1} disableRipple />
        <span className="text-[13.5px]">{label}</span>
      </div>
    );
  };

  const onTerm = (v) => { setF('term', v); if (v !== 'custom' && f.start) setF('end', addYears(f.start, +v)); };
  const onStart = (v) => { setF('start', v); if (f.term !== 'custom' && v) setF('end', addYears(v, +f.term)); };

  return (
    <>
      <FormRow title="Term" desc={compact ? null : 'Subscription ID is generated automatically.'} stacked={compact}>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Select term" required>
            <TextField select value={f.term} onChange={(e) => onTerm(e.target.value)} disabled={cancelled}>
              {[1, 2, 3, 4, 5].map((n) => <MenuItem key={n} value={String(n)}>{n} year{n > 1 ? 's' : ''}</MenuItem>)}
              <MenuItem value="custom">Custom</MenuItem>
            </TextField>
          </Field>
          <Field label="Start date" required>
            <TextField type="date" value={f.start} onChange={(e) => onStart(e.target.value)} disabled={cancelled} />
          </Field>
          <Field label="End date" required>
            {/* Read-only (auto-calculated from term) unless the term is Custom */}
            <TextField type="date" value={f.end} onChange={(e) => setF('end', e.target.value)} disabled={cancelled}
              helperText={f.term === 'custom' ? undefined : 'Calculated from the term'}
              slotProps={{ input: { readOnly: f.term !== 'custom', sx: f.term !== 'custom' ? { bgcolor: '#f4f4f4', color: '#555' } : undefined } }} />
          </Field>
          <Field label="Grace period (days)">
            <TextField type="number" value={f.grace} onChange={(e) => setF('grace', e.target.value)} disabled={cancelled} slotProps={{ htmlInput: { min: 0, max: 365 } }} />
          </Field>
        </div>
        {dateErr ? (
          <div className="mt-2 text-xs text-[#c0392b]">End date must be after the start date.</div>
        ) : (
          <div className="mt-2.5 flex items-center gap-1.5 text-[12.5px] text-muted">
            <CalendarMonthIcon sx={{ fontSize: 16 }} />
            {days} days · ends {fmt(f.end)} · grace until {fmt(addDays(f.end, +f.grace || 0))}
          </div>
        )}
      </FormRow>

      {isEdit && (
        <FormRow title="Status" desc={compact ? null : 'Changes automatically at the end date and grace period when notifications are on.'} stacked={compact}>
          <div className="grid grid-cols-3 gap-2.5">
            {STATUS_OPTS.map(([s, desc]) => {
              const sel = f.status === s;
              return (
                <Button key={s} variant={sel ? 'contained' : 'outlined'} color={sel ? 'primary' : 'inherit'} disabled={cancelled}
                  onClick={() => setF('status', s)} aria-pressed={sel}
                  sx={{ display: 'block', textAlign: 'left', px: 1.75, py: 1.5, borderColor: '#d6d6d6', '&.Mui-disabled': { opacity: 0.5 } }}>
                  <div className="flex items-center gap-2 text-[13.5px] font-semibold">
                    <span className="h-[7px] w-[7px] rounded-full" style={{ background: cancelled ? '#8a8a8a' : STATUS_COLOR[s] }} />{s}
                  </div>
                  <div className="mt-1 text-xs font-normal opacity-75">{desc}</div>
                </Button>
              );
            })}
          </div>
          {!cancelled && (
            <Button color="error" size="small" startIcon={<BlockIcon />} onClick={onAskCancel} sx={{ mt: 1.5 }}>Cancel subscription</Button>
          )}
        </FormRow>
      )}

      <FormRow title="Product packages" desc={`${f.pk.length} selected`} stacked={compact} last>
        <div className="grid min-h-[300px] grid-cols-[190px_minmax(0,1fr)] overflow-hidden rounded-[10px] border border-line">
          <div className="border-r border-[#ececec] bg-[#fafafa] p-2">
            {Object.keys(PKG).map((g) => (
              <div key={g} onClick={() => setPkg(g)} className={`mb-0.5 flex cursor-pointer items-center gap-2 rounded-lg p-2.5 ${g === pkg ? 'bg-white' : ''}`}>
                <span className="flex-1 text-[13.5px] font-medium">{g}</span>
                <span className={`flex h-5 min-w-[34px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${count(g) ? 'bg-ink text-white' : 'bg-[#e6e6e6] text-[#555]'}`}>{count(g)}/{groupTotal(g)}</span>
              </div>
            ))}
          </div>
          <div className="min-w-0 px-4 py-3.5">
            <div className="mb-2.5 flex items-center gap-2.5">
              <div className="flex-1 text-[13.5px] font-semibold">{pkg}</div>
              <span onClick={selectAll} className="cursor-pointer text-[12.5px] underline">{allOn ? 'Clear all' : 'Select all'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">{PKG[pkg].map((l) => <PkgItem key={l} label={l} />)}</div>
            {(SP[pkg] || []).length > 0 && (
              <div className="mt-[18px]">
                <div className="mb-2 text-[11px] font-semibold tracking-[.08em] text-muted">SPECIAL FEATURE</div>
                <div className="grid grid-cols-2 gap-2">{SP[pkg].map((l) => <PkgItem key={l} label={l} />)}</div>
              </div>
            )}
          </div>
        </div>
      </FormRow>
    </>
  );
}
