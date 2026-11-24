import React, { useState } from 'react';
import ToggleTabs from '../../components/ToggleTabs';
import OperationalUsage from './OperationalUsage';
import IntelligentCodingAnalytics from './IntelligentCodingAnalytics';

export default function UsagePage() {
  const [tab, setTab] = useState('ops');
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-6">
        <div className="text-[22px] font-semibold tracking-tight">Usage</div>
        <ToggleTabs value={tab} onChange={setTab} options={[['ops', 'Operational Usage'], ['ai', 'Intelligent coding analytics']]} />
      </div>
      {tab === 'ops' ? <OperationalUsage /> : <IntelligentCodingAnalytics />}
    </div>
  );
}
