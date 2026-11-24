import { TODAY, addDays } from '../lib/dates';
import { grp } from './packages';

export const defaultNotifications = () => ({
  on: true,
  r: [{ k: 'r30', days: 30, on: true }, { k: 'r14', days: 14, on: true }, { k: 'r7', days: 7, on: true }],
  end: true, endOff: 0, grace: true,
  to: ['Tenant admins', 'Account owner'], ch: ['Application alert'], extra: '',
});

const W = grp("Women's Health"), V = grp('Vascular'), G = grp('Radiology'), C = G.slice(0, 3);
const A = (n) => addDays(TODAY, n);
const T = (name, sub, status, end, pk, fax, hl7, pacs, corp) => ({
  name, domain: name, sub, status, start: '2025-11-09', end, pk: pk.flat(), grace: 30,
  fax, hl7, pacs, corp, faxUrl: 'https://www.concordfax.com/', faxUser: '', faxPass: '', faxNum: fax ? '+1 (212) 555-0123' : '',
  n: defaultNotifications(),
});

export const seedTenants = () => [
  T('tenanta', 'SUB-10421', 'Active', A(14), [W, G], 'Concord Fax', 'ADT', 'Extended PACS', false),
  T('tenantab', 'SUB-10440', 'Active', A(157), [W, V, G], 'Concord Fax', 'ORM', 'Enterprise PACS', true),
  T('qatestone', 'SUB-10441', 'Active', A(220), [W], '', '', '', false),
  T('qatesttwo', 'SUB-10442', 'Active', A(90), [W, C], '', '', '', true),
  T('qatestthree', 'SUB-10443', 'Read-Only', A(-12), [G], '', '', '', false),
  T('qatestfour', 'SUB-10444', 'Inactive', A(-60), [V], '', '', '', false),
  T('qatestfive', 'SUB-10445', 'Active', A(300), [W, V, G, C], '', '', '', false),
  T('qatestzeroone', 'SUB-10446', 'Cancelled', A(-30), [W], '', '', '', false),
  T('qatestzerotwo', 'SUB-10447', 'Active', A(45), [G], '', '', '', false),
];
