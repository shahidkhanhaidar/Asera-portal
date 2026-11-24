export const IC_TENANTS = [
  { id: 't1', name: 'Riverside Presbyterian', segment: 'North', precision: 82, accept: 78, reject: 14, skip: 8, rev: 412000, denials: 38000 },
  { id: 't2', name: 'Lakeside Women\'s Health', segment: 'North', precision: 74, accept: 71, reject: 19, skip: 10, rev: 318000, denials: 29000 },
  { id: 't3', name: 'Summit Radiology', segment: 'South', precision: 47, accept: 52, reject: 33, skip: 15, rev: 156000, denials: 11000 },
  { id: 't4', name: 'Metro Vascular Group', segment: 'East', precision: 88, accept: 84, reject: 9, skip: 7, rev: 503000, denials: 52000 },
  { id: 't5', name: 'Harbor Imaging', segment: 'West', precision: 68, accept: 66, reject: 21, skip: 13, rev: 241000, denials: 21000 },
  { id: 't6', name: 'Cedar Valley Clinic', segment: 'South', precision: 44, accept: 49, reject: 37, skip: 14, rev: 98000, denials: 8000 },
];
export const SEGMENTS = ['North', 'South', 'East', 'West'];
export const STUDIES = ['OB', 'MFM', 'MFM Consult', 'Pelvic US', 'Fetal ECHO', 'NST'];
export const DATE_PRESETS = ['Q1 2025', 'Q4 2024', 'Q3 2024', 'Last 6 Months', 'Last 12 Months'];

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const REV_TREND = {
  captured: [38, 41, 44, 47, 52, 55, 58, 63, 67, 71, 76, 82],
  denials: [4, 4, 5, 5, 6, 6, 7, 8, 8, 9, 10, 11],
};
export const REV_CATEGORIES = [
  { title: 'Added codes', captured: 184000, denials: 12000 },
  { title: 'Modifier corrections', captured: 96000, denials: 31000 },
  { title: 'Upgraded specificity', captured: 142000, denials: 24000 },
  { title: 'Bundling fixes', captured: 63000, denials: 18000 },
];
export const REJECTED_CPT = [
  { code: '76805', description: 'US OB complete, single/first fetus', enc: 1240, rate: 31.2, missed: 84, rejections: 387 },
  { code: '76811', description: 'US OB detailed, single/first fetus', enc: 842, rate: 27.8, missed: 61, rejections: 234 },
  { code: '76817', description: 'US transvaginal OB', enc: 612, rate: 24.1, missed: 40, rejections: 148 },
  { code: '76815', description: 'US OB limited, 1+ fetuses', enc: 521, rate: 21.5, missed: 33, rejections: 112 },
  { code: '76818', description: 'Fetal biophysical profile with NST', enc: 410, rate: 19.0, missed: 27, rejections: 78 },
];
export const ICD_ERRORS = [
  { type: 'Invalid code format', count: 82 }, { type: 'Code not billable', count: 54 },
  { type: 'Laterality mismatch', count: 38 }, { type: 'Missing 7th character', count: 22 },
];
export const QUALITY_METRICS = {
  cpt: [{ title: 'Precision', description: 'Share of suggested CPT codes that were correct', value: 78.4 }, { title: 'Recall', description: 'Share of required CPT codes the system suggested', value: 71.9 }, { title: 'Acceptance', description: 'Suggestions accepted as-is by users', value: 69.3 }],
  icd: [{ title: 'Precision', description: 'Share of suggested ICD-10 codes that were correct', value: 81.2 }, { title: 'Recall', description: 'Share of required ICD-10 codes the system suggested', value: 74.6 }, { title: 'Validation pass rate', description: 'Codes passing ICD-10 validation', value: 96.3 }],
};

export const CPT_COSTS = [
  ['76801', 'OB US < 14 wks, single fetus', 118.5], ['76805', 'OB US ≥ 14 wks, single fetus', 146.2], ['76811', 'OB US detailed, single fetus', 212.9],
  ['76815', 'OB US limited', 92.4], ['76817', 'Transvaginal OB US', 108.7], ['76818', 'Fetal biophysical profile with NST', 134.0],
  ['76856', 'US pelvic complete', 121.3], ['93306', 'TTE with Doppler, complete', 288.6],
];

export const IMPACT_HISTORY = [
  { id: 'r1', date: '2026-10-22', tenant: 'Riverside Presbyterian', model: 'IC v2.3', by: 'AS Admin', status: 'Completed' },
  { id: 'r2', date: '2026-10-19', tenant: 'Prospect · Oakview Health', model: 'IC v2.3', by: 'AS Admin', status: 'Completed' },
  { id: 'r3', date: '2026-10-15', tenant: 'Summit Radiology', model: 'IC v2.2', by: 'AS Admin', status: 'Failed' },
  { id: 'r4', date: '2026-10-12', tenant: 'Harbor Imaging', model: 'IC v2.3', by: 'AS Admin', status: 'Processing' },
];
