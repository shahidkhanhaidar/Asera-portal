import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Visibility from '@mui/icons-material/VisibilityOutlined';
import VisibilityOff from '@mui/icons-material/VisibilityOffOutlined';
import FormRow from '../../components/FormRow';
import Field from '../../components/Field';

export default function TenantDetailsSection({ f, setF, errors, tried }) {
  const [showPass, setShowPass] = useState(false);
  const nameErr = errors.name && (tried || f.name.trim()) ? errors.name : '';
  const domErr = errors.domain && (tried || f.domain.trim()) ? errors.domain : '';

  return (
    <>
      <FormRow title="Identity" desc="Set at creation and locked afterwards.">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Client name" required>
            <TextField value={f.name} onChange={(e) => setF('name', e.target.value)}
              placeholder="e.g. Riverside Presbyterian" error={!!nameErr} helperText={nameErr} slotProps={{ htmlInput: { maxLength: 60 } }} />
          </Field>
          <Field label="Domain name" required>
            <TextField value={f.domain} onChange={(e) => setF('domain', e.target.value)}
              placeholder="e.g. riverside" error={!!domErr} helperText={domErr} slotProps={{ htmlInput: { maxLength: 40 } }} />
          </Field>
        </div>
      </FormRow>

      <FormRow title="Integrations" desc="Turn on the systems this client connects to.">
        <div className="overflow-hidden rounded-[10px] border border-line">
          {/* Fax */}
          <div className="grid grid-cols-[190px_1fr] items-start gap-4 px-4 py-3">
            <label className="flex h-[38px] cursor-pointer items-center gap-2 text-[13.5px] font-medium">
              <Switch checked={f.faxOn} onChange={() => { setF('faxOn', !f.faxOn); setF('fax', !f.faxOn ? 'Concord Fax' : ''); }} />Fax
            </label>
            <div className={`flex flex-col gap-3.5 ${f.faxOn ? '' : 'opacity-50'}`}>
              <div className="flex h-[38px] max-w-[320px] items-center gap-2 rounded-lg border border-[#d6d6d6] bg-[#f7f7f7] px-3 text-[13.5px]">
                <CheckCircleIcon sx={{ fontSize: 16 }} />Concord Fax
              </div>
              {f.faxOn && (
                <div className="flex max-w-[520px] flex-col gap-3.5">
                  <div>
                    <div className="mb-1.5 text-[12.5px] text-muted">Concord Fax link</div>
                    <a href={f.faxUrl} target="_blank" rel="noopener noreferrer" aria-label="Open Concord Fax website"
                      className="flex h-10 items-center justify-between gap-2 rounded-lg border border-[#d6d6d6] bg-[#f7f7f7] px-3 text-sm text-[#1a56db] underline-offset-2 hover:underline">
                      <span className="truncate">{f.faxUrl}</span>
                      <OpenInNewIcon sx={{ fontSize: 16 }} />
                    </a>
                    <div className="mt-1.5 text-[12.5px] text-muted">Open the Concord Fax website to set up this tenant's fax account and number.</div>
                  </div>
                  <div className="text-[13px] font-semibold">Fax account details</div>
                  <div className="flex max-w-[320px] flex-col gap-3">
                    <Field label="User name" required><TextField value={f.faxUser} onChange={(e) => setF('faxUser', e.target.value)} autoComplete="off" /></Field>
                    <Field label="Password" required><TextField type={showPass ? 'text' : 'password'} value={f.faxPass} onChange={(e) => setF('faxPass', e.target.value)} autoComplete="new-password"
                      slotProps={{ input: { endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" aria-label="Show or hide password" onClick={() => setShowPass((s) => !s)}>
                            {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>) } }} /></Field>
                    <Field label="Fax number" required><TextField value={f.faxNum} onChange={(e) => setF('faxNum', e.target.value)} placeholder="e.g. +1 (212) 555-0123" helperText="One fax number per tenant." /></Field>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* HL7 */}
          <div className="grid grid-cols-[190px_1fr] items-start gap-4 border-t border-[#f1f1f1] px-4 py-3">
            <label className="flex h-[38px] cursor-pointer items-center gap-2 text-[13.5px] font-medium">
              <Switch checked={f.hl7On} onChange={() => setF('hl7On', !f.hl7On)} />HL7
            </label>
            <TextField select value={f.hl7} onChange={(e) => setF('hl7', e.target.value)} disabled={!f.hl7On}
              slotProps={{ select: { displayEmpty: true, renderValue: (v) => v || <span className="text-xs text-[#8a8a8a]">Message type</span> } }}>
              {['ADT', 'ORM', 'ORU'].map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField>
          </div>
          {/* PACS */}
          <div className="grid grid-cols-[190px_1fr] items-start gap-4 border-t border-[#f1f1f1] px-4 py-3">
            <label className="flex h-[38px] cursor-pointer items-center gap-2 text-[13.5px] font-medium">
              <Switch checked={f.pacsOn} onChange={() => setF('pacsOn', !f.pacsOn)} />PACS
            </label>
            <TextField placeholder="PACS name" value={f.pacs} onChange={(e) => setF('pacs', e.target.value)} disabled={!f.pacsOn} />
          </div>
        </div>
      </FormRow>

      <FormRow title="Corporate mode" desc="Turn on for corporate tenants." last>
        <label className="flex h-10 cursor-pointer items-center gap-3 text-[13.5px] font-medium">
          <Switch checked={f.corp} onChange={() => setF('corp', !f.corp)} />Corporate mode
        </label>
      </FormRow>
    </>
  );
}
