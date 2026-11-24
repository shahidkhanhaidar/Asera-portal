const validDate = (d) =>
  /^\d{4}-\d{2}-\d{2}$/.test(d || '') && !isNaN(Date.parse(d)) && +d.slice(0, 4) >= 2000 && +d.slice(0, 4) <= 2100;

/** Returns { name, domain, s1:[], s2:[], s3:[] } – s1..s3 are messages per wizard step. */
export function validate(f, tenants, isAdd) {
  const e = { name: '', domain: '', s1: [], s2: [], s3: [] };
  const N = f.n, nm = f.name.trim(), dm = f.domain.trim().toLowerCase();
  if (isAdd) {
    if (!nm) e.name = 'Client name is required';
    else if (nm.length > 60) e.name = 'Client name must be 60 characters or fewer';
    else if (!/^[A-Za-z0-9][A-Za-z0-9 &.,'()_-]*$/.test(nm)) e.name = 'Use letters, numbers and basic punctuation only';
    else if (tenants.some((t) => t.name.toLowerCase() === nm.toLowerCase())) e.name = 'A tenant with this name already exists';
    if (!dm) e.domain = 'Domain name is required';
    else if (!/^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$/.test(dm)) e.domain = 'Use lowercase letters, numbers and hyphens only, not starting or ending with a hyphen';
    else if (tenants.some((t) => t.domain.toLowerCase() === dm)) e.domain = 'This domain name is already in use';
    if (e.name) e.s1.push(e.name);
    if (e.domain) e.s1.push(e.domain);
  }
  if (f.faxOn) {
    if (!(f.faxUser || '').trim()) e.s1.push('Enter the Concord Fax user name');
    if (!(f.faxPass || '').trim()) e.s1.push('Enter the Concord Fax password');
    const d = (f.faxNum || '').replace(/\D/g, '');
    if (!d.length) e.s1.push('Enter the fax number');
    else if (d.length < 10 || d.length > 15) e.s1.push('Enter a valid fax number');
  }
  if (f.hl7On && !String(f.hl7 || '').trim()) e.s1.push('Select an HL7 message type');
  if (f.pacsOn && !String(f.pacs || '').trim()) e.s1.push('Enter a PACS name');

  const vs = validDate(f.start), ve = validDate(f.end);
  if (!f.pk.length) e.s2.push('Select at least one product package');
  if (!vs) e.s2.push('Enter a valid start date');
  if (!ve) e.s2.push('Enter a valid end date');
  else if (vs && f.end <= f.start) e.s2.push('End date must be after the start date');
  const g = String(f.grace).trim();
  if (!/^\d+$/.test(g) || +g > 365) e.s2.push('Grace period must be a whole number from 0 to 365');

  if (N.on) {
    if (!N.to.length) e.s3.push('Select at least one notification recipient');
    if (!N.ch.length) e.s3.push('Select at least one notification channel');
    if (new Set(N.r.map((r) => r.days)).size !== N.r.length) e.s3.push('Reminder days must be different from each other');
    const term = vs && ve ? Math.round((Date.parse(f.end) - Date.parse(f.start)) / 864e5) : null;
    if (term !== null && N.r.some((r) => r.on && r.days > term)) e.s3.push('A reminder is set earlier than the subscription start');
  }
  return e;
}
