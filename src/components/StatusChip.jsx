import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { STATUS_COLOR } from '../data/packages';

export default function StatusChip({ status, large = false }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white font-medium whitespace-nowrap ${large ? 'h-[26px] px-3 text-[12.5px]' : 'h-6 px-2.5 text-xs'}`}>
      {status === 'Processing' ? (
        <CircularProgress size={12} thickness={5} sx={{ color: STATUS_COLOR.Processing }} />
      ) : (
        <span className="h-[7px] w-[7px] rounded-full" style={{ background: STATUS_COLOR[status] }} />
      )}
      {status}
    </span>
  );
}
