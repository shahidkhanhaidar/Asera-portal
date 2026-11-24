import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

/** Type-to-confirm dialog used for cancel subscription and status downgrades. */
export default function ConfirmDialog({ open, title, note, confirmName, keepLabel, confirmLabel, onClose, onConfirm }) {
  const [typed, setTyped] = useState('');
  useEffect(() => { if (open) setTyped(''); }, [open]);
  const disabled = !confirmName || typed.trim().toLowerCase() !== confirmName.toLowerCase();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <div className="p-6">
        <div className="text-[17px] font-semibold">{title}</div>
        <div className="mt-2.5 text-[13.5px] leading-normal text-[#444]">{note}</div>
        <div className="mt-4">
          <div className="mb-1.5 text-xs text-[#555]">Type <b>{confirmName}</b> to confirm</div>
          <TextField value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={confirmName} />
        </div>
        <div className="mt-5 flex justify-end gap-2.5">
          <Button variant="outlined" color="inherit" onClick={onClose}>{keepLabel}</Button>
          <Button variant="contained" color="error" disabled={disabled} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Dialog>
  );
}
