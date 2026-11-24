import React, { useState } from 'react';
import TenantsPage from './pages/tenants/TenantsPage';
import UsagePage from './pages/usage/UsagePage';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import LayersIcon from '@mui/icons-material/LayersOutlined';
import GroupsIcon from '@mui/icons-material/GroupsOutlined';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AppsIcon from '@mui/icons-material/Apps';
import HelpIcon from '@mui/icons-material/HelpOutlineOutlined';

const NAV = [
  ['tenant', 'Tenant', SettingsIcon], ['form', 'Form Config', LayersIcon], ['cust', 'Customers', GroupsIcon],
  ['usage', 'Usage', ShowChartIcon], ['apps', 'Apps', AppsIcon],
];
const LIVE = ['tenant', 'usage'];

export default function App() {
  const [page, setPage] = useState('tenant');
  return (
    <div className="flex min-h-screen bg-canvas text-sm text-[#111]">
      <aside className="sticky top-0 flex h-screen w-[82px] flex-none flex-col items-center bg-ink pb-3 pt-3.5 text-[#c9c9c9]">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white text-sm font-semibold text-ink">as</div>
        <div className="mt-[5px] text-[8px] tracking-[.14em] text-[#9a9a9a]">SOFTWARE</div>
        <div className="my-3.5 mb-2.5 w-16 border-t border-[#262626]" />
        <div className="mb-2 text-[8px] tracking-[.14em] text-[#6a6a6a]">ADMIN</div>
        {NAV.map(([k, label, Icon]) => (
          <div key={k} onClick={() => LIVE.includes(k) && setPage(k)} title={LIVE.includes(k) ? label : `${label} (not in this scope)`}
            className={`mb-1 flex w-[62px] flex-col items-center gap-1 rounded-xl pb-[7px] pt-[9px] ${LIVE.includes(k) ? 'cursor-pointer hover:bg-[#1c1c1c]' : 'cursor-default opacity-50'} ${page === k ? 'bg-[#262626] text-white' : 'text-[#b5b5b5]'}`}>
            <Icon sx={{ fontSize: 22 }} /><span className="text-[10px] font-medium">{label}</span>
          </div>
        ))}
        <div className="flex-1" />
        <div className="mb-3 w-16 border-t border-[#262626]" />
        <div className="flex flex-col items-center gap-1"><HelpIcon sx={{ fontSize: 22 }} /><span className="text-[10px] font-medium">Help</span></div>
        <div className="mt-2.5 flex w-[66px] flex-col items-center gap-1 pb-1.5 pt-[7px]">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#262626] text-xs font-semibold text-white ring-1 ring-[#3a3a3a]">S</div>
          <div className="text-[9px] text-[#b5b5b5]">AS Admin</div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-7 pb-10 pt-[22px]">
        {page === 'tenant' ? <TenantsPage /> : <UsagePage />}
      </main>
    </div>
  );
}
