import React, { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Metrics from './ic/Metrics';
import CostSheet from './ic/CostSheet';
import ImpactAnalysis from './ic/ImpactAnalysis';

export default function IntelligentCodingAnalytics() {
  const [tab, setTab] = useState('metrics');
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="inherit" slotProps={{ indicator: { style: { background: '#111' } } }} sx={{ flex: 'none', borderBottom: '1px solid #e0e0e0', '& .MuiTab-root': { fontWeight: 600, fontSize: 13.5, color: '#6b6b6b' }, '& .Mui-selected': { color: '#111 !important' } }}>
        <Tab value="metrics" label="Intelligent Coding Metrics" /><Tab value="cost" label="Global CPT Cost sheet" /><Tab value="impact" label="Projected Impact Analysis" />
      </Tabs>
      {tab === 'metrics' && <div className="min-h-0 flex-1 overflow-y-auto pr-1"><Metrics /></div>}
      {tab === 'cost' && <CostSheet />}
      {tab === 'impact' && <div className="min-h-0 flex-1 overflow-y-auto pr-1"><ImpactAnalysis /></div>}
    </div>
  );
}
