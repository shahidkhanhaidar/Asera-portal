import React from 'react';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';

/** Pill-style segmented tabs used for the page-level Usage tabs. */
export default function ToggleTabs({ value, onChange, options }) {
  return (
    <ToggleButtonGroup exclusive value={value} onChange={(_, v) => v && onChange(v)}
      className="rounded-xl bg-[#e4e4e4] p-1" sx={{ '& .MuiToggleButton-root': { border: 0, borderRadius: '9px !important', px: 2.5, py: 1.1, fontWeight: 600, fontSize: 14, color: '#444', textTransform: 'none' }, '& .Mui-selected': { bgcolor: '#0a0a0a !important', color: '#fff !important', boxShadow: '0 1px 3px rgba(0,0,0,.3)' } }}>
      {options.map(([k, label]) => <ToggleButton key={k} value={k}>{label}</ToggleButton>)}
    </ToggleButtonGroup>
  );
}
