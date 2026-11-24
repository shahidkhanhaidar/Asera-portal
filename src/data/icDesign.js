// Mock data for Intelligent Coding analytics, ported from the Claude design.
export const POS = 'oklch(0.76 0.13 162)';
export const POS_T = 'oklch(0.45 0.12 162)';
export const NEG = 'oklch(0.7 0.16 22)';
export const NEG_T = 'oklch(0.5 0.17 22)';
export const SKIP = '#8a8a8a';
export const MISS = '#555';
export const PURPLE = ['oklch(0.46 0.14 290)', 'oklch(0.56 0.15 290)', 'oklch(0.66 0.14 290)', 'oklch(0.76 0.11 290)', 'oklch(0.86 0.07 290)'];

export const TENANTS = [
  { id: 't1', name: 'Mercy Health System', seg: 'East' },
  { id: 't2', name: 'Valley Imaging Associates', seg: 'Southwest' },
  { id: 't3', name: 'Northeast OB/GYN Partners', seg: 'South' },
  { id: 't4', name: 'Summit Radiology Group', seg: 'West' },
  { id: 't5', name: "Pacific Women's Health", seg: 'North' },
  { id: 't6', name: 'Riverside MFM Specialists', seg: 'Central' },
];
export const SEGMENTS = ['North', 'East', 'South', 'West', 'Central', 'Southwest'];
export const STUDY = ['OB', 'NST', 'Pelvic Ultrasound', 'MFM', 'Fetal Echo', 'MFM Consult'];
export const PRESETS = ['Q1 2025', 'Q4 2024', 'Q3 2024', 'Last 6 Months', 'Last 12 Months'];

const mk = (rows) => rows.map((r) => ({ month: r[0], a: r[1], s: r[2], r: r[3], m: r[4] }));
const SIX = mk([["Oct '24", 62.1, 21.3, 16.6, 8.1], ["Nov '24", 63.8, 20.1, 16.1, 7.6], ["Dec '24", 65.2, 19.4, 15.4, 7.1], ["Jan '25", 64.7, 19.8, 15.5, 6.9], ["Feb '25", 66.4, 18.9, 14.7, 6.6], ["Mar '25", 67.3, 18.4, 14.3, 6.4]]);
export const ADMIN_VAR = {
  'Q1 2025': SIX,
  'Last 6 Months': SIX,
  'Q4 2024': mk([["Jul '24", 59.2, 23.1, 17.7, 9.4], ["Aug '24", 60.5, 22.4, 17.1, 9.0], ["Sep '24", 61.3, 21.9, 16.8, 8.6], ["Oct '24", 62.1, 21.3, 16.6, 8.1], ["Nov '24", 63.8, 20.1, 16.1, 7.6], ["Dec '24", 65.2, 19.4, 15.4, 7.1]]),
  'Q3 2024': mk([["Apr '24", 56.1, 25.2, 18.7, 10.8], ["May '24", 57.4, 24.6, 18.0, 10.3], ["Jun '24", 58.2, 24.1, 17.7, 9.9], ["Jul '24", 59.2, 23.1, 17.7, 9.4], ["Aug '24", 60.5, 22.4, 17.1, 9.0], ["Sep '24", 61.3, 21.9, 16.8, 8.6]]),
  'Last 12 Months': mk([["Apr '24", 56.1, 25.2, 18.7, 10.8], ["Jun '24", 58.2, 24.1, 17.7, 9.9], ["Aug '24", 60.5, 22.4, 17.1, 9.0], ["Oct '24", 62.1, 21.3, 16.6, 8.1], ["Dec '24", 65.2, 19.4, 15.4, 7.1], ["Feb '25", 66.4, 18.9, 14.7, 6.6]]),
};
export const REV_ADMIN = [
  { month: "Oct '24", cap: 1.2, den: 0.42 }, { month: "Nov '24", cap: 1.4, den: 0.47 }, { month: "Dec '24", cap: 1.5, den: 0.5 },
  { month: "Jan '25", cap: 1.6, den: 0.55 }, { month: "Feb '25", cap: 1.8, den: 0.62 }, { month: "Mar '25", cap: 1.84, den: 0.74 },
];
export const REV_GROUPS = [
  { title: 'Revenue Captured', colors: ['oklch(0.58 0.11 162)', 'oklch(0.72 0.13 162)', 'oklch(0.84 0.09 162)'], rows: [['Accepted CPT codes', 3600000], ['Accepted add-on CPT codes', 2200000], ['Accepted Bundled CPT codes', 1450000]] },
  { title: 'Denials Reduction', colors: PURPLE, rows: [['Reviewed CPT Deletions', 1200000], ['Reviewed ICD Deletions', 700000], ['Reviewed Add-on Additions', 500000], ['Reviewed Primary Additions', 500000], ['Reviewed Bundle Additions', 400000]],
    info: '• Reviewed CPT Deletions: (Count × Cost/CPT)\n• Reviewed ICD Deletions: (Count × Total Claim Cost)\n• Reviewed Add-on Additions: (Count × Cost/CPT)\n• Reviewed Primary Additions: (Count × Cost/CPT)\n• Reviewed Bundle Additions: (Count × Cost/CPT)' },
];
export const HIGH_VAR = [['76811', 'OB US Detailed < 14 Weeks', 512, 34.2, 88], ['76815', 'OB US Limited', 447, 28.7, 74], ['76801', 'OB US < 14 Weeks (Standard)', 398, 24.1, 61], ['76805', 'OB US ≥ 14 Weeks', 371, 21.6, 53], ['76642', 'Breast Ultrasound, Limited', 284, 19.4, 42], ['76816', 'OB US Follow-up', 261, 17.8, 37], ['76820', 'Fetal Doppler, Umbilical Artery', 198, 15.2, 29]];
export const BENCH = [
  { tenant: 'Mercy Health', acceptance: 71.4, rejection: 12.1, precision: 89.2, recall: 93.1 },
  { tenant: 'Valley Imaging', acceptance: 64.8, rejection: 17.2, precision: 85.7, recall: 89.4 },
  { tenant: 'Northeast OB', acceptance: 68.3, rejection: 13.8, precision: 88.1, recall: 91.6 },
  { tenant: 'Summit Radiology', acceptance: 47.4, rejection: 22.6, precision: 27.4, recall: 87.2 },
  { tenant: "Pacific Women's", acceptance: 69.7, rejection: 12.7, precision: 90.1, recall: 92.8 },
  { tenant: 'Riverside MFM', acceptance: 65.9, rejection: 15.9, precision: 86.3, recall: 90.1 },
];
export const CPT_VAL = [
  { title: 'System Missed', description: 'Billed CPT codes with no supporting evidence in the documentation', value: 12.3, status: 'warn' },
  { title: 'Rejected', description: 'CPT codes predicted by the system but not billed by the client', value: 8.7, status: 'warn' },
  { title: 'Missing Bundled Procedure', description: 'Add-on CPT codes billed without the required parent procedure code', value: 5.4, status: 'bad' },
  { title: 'Out-of-Scope CPT', description: "Encounters with CPT codes outside the system's validated scope", value: 3.2, status: 'good' },
];
export const ICD_VAL = [
  { title: 'Trimester Match', description: 'ICD O-codes consistent with gestational age documented in the report', value: 91.2, status: 'good' },
  { title: 'O-code Not Supported', description: 'O-codes suggested that are not supported for the documented encounter', value: 6.4, status: 'warn' },
  { title: 'G. Age Conflict', description: 'ICD codes conflicting with the gestational age documented in the report', value: 4.1, status: 'warn' },
  { title: 'ICD Validated', description: 'ICD codes confirmed correct by the system and accepted without modification', value: 94.2, status: 'good' },
  { title: 'ICD Adjusted', description: 'ICD codes modified by users prior to final submission', value: 5.8, status: 'warn' },
];
export const ICD_ERR = [{ type: 'Trimester Mismatch', count: 72, pct: 36.7 }, { type: 'O-code Not Supported', count: 48, pct: 24.5 }, { type: 'G. age mismatch', count: 43, pct: 21.9 }, { type: 'Fetus count mismatch', count: 33, pct: 16.8 }];
const t5 = (rows) => rows.map((r) => ({ code: r[0], label: r[1], count: r[2], missed: r[3] }));
export const T5 = {
  fp: t5([['76642', 'Breast US Limited', 284, 42], ['76811', 'OB US Detailed < 14wk', 231, 34], ['76815', 'OB US Limited', 198, 29], ['76816', 'OB US Follow-up', 176, 26], ['76700', 'Abd US Complete', 143, 21]]),
  fn: t5([['76801', 'OB US < 14 Weeks', 312, 45], ['76805', 'OB US ≥ 14 Weeks', 267, 39], ['76810', 'OB US ≥ 14wk Addl Fetus', 201, 29], ['76817', 'OB US Transvaginal', 189, 27], ['76820', 'Fetal Doppler Umbilical', 144, 21]]),
  acc: t5([['76816', 'OB US Follow-up', 621, 0], ['76805', 'OB US ≥ 14 Weeks', 584, 0], ['76811', 'OB US Detailed < 14wk', 532, 0], ['76801', 'OB US < 14 Weeks', 487, 0], ['76815', 'OB US Limited', 419, 0]]),
  tri: t5([['O09.90', 'Supervision Preg, Unspecified', 142, 21], ['O26.849', 'Preg-related Condition, Unsp Tri', 118, 17], ['O36.80X0', 'Preg w/ Fetal Problem, Unsp Tri', 97, 14], ['O80', 'Encounter Full-term Delivery', 76, 11], ['Z34.90', 'Supervision Normal Preg, Unsp', 58, 8]]),
  oc: t5([['O99.89', 'Other Condition Complicating Preg', 131, 19], ['O43.90', 'Placental Disorder, Unspecified', 104, 15], ['O36.0990', 'Rh Immunization, Unsp Tri', 88, 13], ['O28.9', 'Abnormal Finding Maternal Screen', 67, 10], ['O40.9XX0', 'Polyhydramnios, Unspecified', 49, 7]]),
  ga: t5([['O09.291', 'Supervision Poor Reprod Hx, 1st Tri', 96, 14], ['O26.611', 'Liver Disorders Preg, 1st Tri', 81, 12], ['O36.5930', 'Poor Fetal Growth, 3rd Tri', 69, 10], ['O24.410', 'Gestational Diabetes, Diet-controlled', 54, 8], ['O44.10', 'Placenta Previa w/ Hemorrhage, Unsp', 41, 6]]),
  val: t5([['Z34.32', 'Supervision Normal Preg, 3rd Tri', 412, 0], ['O80', 'Encounter Full-term Uncomplicated Delivery', 378, 0], ['Z37.0', 'Single Liveborn Infant', 341, 0], ['Z34.22', 'Supervision Normal Preg, 2nd Tri', 298, 0], ['O09.523', 'Supervision Elderly Multigravida, 3rd Tri', 267, 0]]),
  fet: t5([['O30.001', 'Twin Pregnancy, Unspecified Trimester', 74, 11], ['O36.80X0', 'Maternal Care, Unspecified Fetus', 63, 9], ['O31.20X1', 'Continuing Pregnancy, Fetus 1', 51, 8], ['O30.102', 'Twin Pregnancy, Second Trimester', 44, 6], ['O36.5932', 'Poor Fetal Growth, Fetus 2', 37, 5]]),
};

export const CPT_COST = [['93975', 'Duplex scan, complete', 285], ['93976', 'Duplex scan, limited', 160], ['76805', 'OB US ≥14 wks, complete', 190], ['76816', 'OB US, follow-up / limited', 120], ['76817', 'OB US, transvaginal', 95], ['76801', 'OB US <14 wks, single gestation', 175], ['76811', 'OB US, detailed fetal anatomy', 260], ['76818', 'Fetal biophysical profile', 110], ['59025', 'Fetal non-stress test', 65], ['76856', 'Pelvic US, complete', 150], ['76830', 'Transvaginal US', 140], ['76825', 'Fetal echocardiography', 310]];
export const CPT_OVERRIDES = { 93975: ['Valley Imaging Associates', 'Summit Radiology Group'], 76805: ['Mercy Health System'], 76811: ['Northeast OB/GYN Partners', 'Summit Radiology Group', "Pacific Women's Health"], 76830: ['Valley Imaging Associates'] };

// Projected impact analysis: segment models + seeded history
export const MODELS = [['Global', 3], ['Central', 2], ['Southwest', 2], ['East', 1], ['West', 2], ['North', 1], ['South', 1]];
export const modelLabel = (m, v) => `${m} Model (v${v})`;
export const modelVersion = (m) => (MODELS.find((x) => x[0] === m) || [0, 1])[1];
export const IMPACT_TENANTS = [
  ...TENANTS.map((t) => [t.name, 'Tenant']),
  ['aseraautomation', 'Tenant'],
  ["Granite Women's Care", 'Prospect'],
];
export const IMPACT_RUNS = [
  { id: 6, date: '2026-10-28 11:12', tenant: 'Mercy Health System', model: 'Global', mv: 3, by: 'AS Admin', status: 'Failed', reason: 'Required column CPT Codes is empty in 212 rows.', cost: 120000 },
  { id: 5, date: '2026-10-27 16:40', tenant: 'Mercy Health System', model: 'Global', mv: 3, by: 'AS Admin', status: 'Completed', cost: 120000 },
  { id: 4, date: '2026-10-20 14:05', tenant: 'aseraautomation', model: 'Global', mv: 3, by: 'AS Admin', status: 'Completed', cost: 96000 },
  { id: 3, date: '2026-10-09 10:02', tenant: 'Mercy Health System', model: 'Central', mv: 2, by: 'AS Admin', status: 'Completed', cost: 120000 },
  { id: 2, date: '2026-10-02 09:31', tenant: 'aseraautomation', model: 'Central', mv: 2, by: 'AS Admin', status: 'Completed', cost: 96000 },
  { id: 1, date: '2026-09-18 13:20', tenant: "Granite Women's Care", pro: true, model: 'Global', mv: 2, by: 'AS Admin', status: 'Completed', cost: 84000 },
];
export const BM = { enc: 12519, rev: 852012 };
