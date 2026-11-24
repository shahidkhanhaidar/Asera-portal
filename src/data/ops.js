const F = ['Hilbert', 'Gus', 'Alejandrin', 'Rita', 'Randall', 'Stanford', 'Nichole', 'Kailey', 'Yoshiko', 'Karianne', 'Retta', 'Myrtis', 'Prudence', 'Beulah', 'Efrain', 'Jonas', 'Nakia', 'Vivianne', 'Lambert', 'Will', 'Melody', 'Jennyfer', 'Sterling', 'Cierra'];
const L = ['Feest-Upton', 'West', 'Greenfelder', 'Becker', 'Reichert', 'Herzog', 'Douglas', 'Miller', 'Conn', 'Bauch', 'Torp', 'Cummerata', 'Wolff', 'Metz', 'Howe', 'Koch', 'McCullough', 'Littel', 'Gleichner', 'Lang', 'Windler', 'Schmeler', 'Bode', 'Bailey'];
const T = ['OB', 'OB', 'OB', 'MFMConsult', 'Echo', 'Echo', 'PELVIC', 'NST', 'NST', 'MFM'];
const B = ['Users DataDog', 'User Physician', 'User Physician', 'User Physician', 'User Fellow', 'Kerry Faulk, Echo'];
const SG = ['', '', 'Physician User', 'DataDog Users', ''];
const AT = ['', '', '', 'Alan Morimoto'];
const LC = ['', '', '', 'MFM Department', 'MAGGIOBO Clinic'];
const RF = ['Alexandre Nolan', 'Brant MacGregor', 'Torrance Hume', 'Adeline Breitenberg', 'Emile Legrosse', '', 'Shanon Von Rueden', 'Elza Watsica', 'Lesley Langosh', 'Cara Kshlerin'];

export const OPS_TENANTS = ['aseraautomation', 'tenanta', 'tenantb'];
export const OPS_TEMPLATES = ['OB', 'MFM', 'MFMConsult', 'Echo', 'NST', 'PELVIC'];
export const OPS_PERFORMERS = ['Users DataDog', 'User Physician', 'User Fellow', 'Kerry Faulk, Echo'];

/** Columns: [key, label, minWidth] */
export const OPS_COLS = [
  ['mrn', 'MRN', 130], ['pid', 'Patient ID', 140], ['first', 'First Name', 120], ['last', 'Last Name', 130], ['date', 'Date', 110],
  ['tpl', 'Template', 120], ['by', 'Performed By', 150], ['signed', 'Signed By', 140], ['att', 'Attending', 140],
  ['loc', 'Location', 150], ['ref', 'Referred By', 160], ['fet', 'Number of Fetuses', 140],
];

let cache;
/** Deterministic pseudo-random seed data (1,427 visits) so the demo is stable between reloads. */
export function opsData() {
  if (cache) return cache;
  let x = 7;
  const rnd = () => (x = (x * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const base = Date.UTC(2026, 9, 25), rows = [];
  for (let i = 0; i < 1427; i++) {
    const p = i < 858 ? i : Math.floor(rnd() * 858), pm = (p * 37) % 858;
    rows.push({
      mrn: (rnd() < 0.2 ? 'Automation_' : 'MRN-') + String(1000 + Math.floor(rnd() * 8999)) + '-' + (p % 90 + 10),
      pid: 'Automation_' + (100000 + p), first: F[pm % 24], last: L[(pm * 7) % 24],
      date: new Date(base - Math.floor((i * 58) / 1427) * 864e5).toISOString().slice(0, 10),
      tpl: pick(T), by: pick(B), signed: pick(SG), att: pick(AT), loc: pick(LC), ref: pick(RF),
      fet: rnd() < 0.12 ? 0 : rnd() < 0.8 ? 1 : 2,
    });
  }
  return (cache = rows);
}
