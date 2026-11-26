const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5086';

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running.', 0);
  }
  if (res.ok) return res.status === 204 ? null : res.json();
  let body = null;
  try { body = await res.json(); } catch { /* no body */ }
  const fields = body?.errors || {};
  const first = Object.values(fields).flat()[0];
  throw new ApiError(first || body?.title || `Request failed (${res.status})`, res.status, fields);
}

// Backend shape <-> shape the screens already use.
const fromNotifications = (n) => ({
  on: n.enabled,
  r: n.reminders.map((r) => ({ k: `r${r.days}`, days: r.days, on: r.enabled })),
  end: n.notifyOnEndDate, endOff: n.endDateOffsetDays, grace: n.notifyOnGraceEnd,
  to: n.recipients, ch: n.channels, extra: n.extraEmails,
});
const toNotifications = (n) => ({
  enabled: n.on,
  reminders: n.r.map((r) => ({ days: +r.days, enabled: r.on })),
  notifyOnEndDate: n.end, endDateOffsetDays: +n.endOff || 0, notifyOnGraceEnd: n.grace,
  recipients: n.to, channels: n.ch, extraEmails: n.extra || '',
});

export const fromApi = (t) => ({
  id: t.id, name: t.name, domain: t.domain, sub: t.subscriptionNumber, status: t.status,
  start: t.startDate, end: t.endDate, grace: t.graceDays, corp: t.corporate, pk: t.packages,
  fax: t.faxEnabled ? 'Concord Fax' : '', faxUrl: t.faxUrl, faxUser: t.faxUserName, faxPass: '', faxNum: t.faxNumber,
  hl7: t.hl7MessageType, pacs: t.pacsName, n: fromNotifications(t.notifications),
});

const toCreateBody = (f) => ({
  name: f.name.trim(), domain: f.domain.trim(), corporate: f.corp,
  faxEnabled: f.faxOn, faxUrl: f.faxUrl, faxUserName: f.faxUser.trim(), faxPassword: f.faxPass, faxNumber: f.faxNum.trim(),
  hl7Enabled: f.hl7On, hl7MessageType: f.hl7, pacsEnabled: f.pacsOn, pacsName: f.pacs.trim(),
  status: f.status, startDate: f.start, endDate: f.end, graceDays: +f.grace || 0, packages: f.pk,
  notifications: toNotifications(f.n),
});
const toUpdateBody = (f) => ({
  status: f.status, startDate: f.start, endDate: f.end, graceDays: +f.grace || 0, packages: f.pk,
  notifications: toNotifications(f.n),
});

export const tenantsApi = {
  list: async () => (await request('/api/tenants')).map(fromApi),
  create: async (f) => fromApi(await request('/api/tenants', { method: 'POST', body: JSON.stringify(toCreateBody(f)) })),
  update: async (id, f) => fromApi(await request(`/api/tenants/${id}/subscription`, { method: 'PUT', body: JSON.stringify(toUpdateBody(f)) })),
  cancel: async (id) => fromApi(await request(`/api/tenants/${id}/cancel`, { method: 'POST' })),
};

// SQLite returns timestamps without a zone; they are UTC.
const asUtc = (s) => (s && !/[zZ]$|[+-]\d\d:\d\d$/.test(s) ? `${s}Z` : s);
const stamp = (s) => {
  const d = new Date(asUtc(s)), p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const fromRun = (r) => ({
  id: r.id, date: stamp(r.createdAt), tenant: r.tenant, pro: r.isProspect, model: r.model, mv: r.modelVersion,
  by: r.runBy, status: r.status, reason: r.failureReason, cost: r.subscriptionCost, file: r.fileName,
});

export const costsApi = {
  get: () => request('/api/cpt-costs'),
  impact: (changes) => request('/api/cpt-costs/impact', { method: 'POST', body: JSON.stringify({ changes }) }),
  save: (changes) => request('/api/cpt-costs', { method: 'PUT', body: JSON.stringify({ changes }) }),
};

export const impactApi = {
  models: async () => (await request('/api/impact/models')).map((m) => [m.name, m.version]),
  tenants: async () => (await request('/api/impact/tenants')).map((t) => [t.name, t.kind]),
  runs: async () => (await request('/api/impact/runs')).map(fromRun),
  results: (id) => request(`/api/impact/runs/${id}/results`),
  importRun: async ({ tenant, model, cost, raw }) => {
    const fd = new FormData();
    fd.append('tenant', tenant); fd.append('model', model); fd.append('subscriptionCost', String(cost)); fd.append('file', raw);
    return fromRun(await request('/api/impact/runs', { method: 'POST', body: fd, headers: {} }));
  },
  rerun: async (id, model) => fromRun(await request(`/api/impact/runs/${id}/rerun`, { method: 'POST', body: JSON.stringify({ model }) })),
};
