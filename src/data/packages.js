export const PKG = {
  "Women's Health": ['OB', 'MFM', 'MFM Consult', 'Pelvic US', 'Fetal ECHO', 'NST'],
  Radiology: ['Follicles', 'Female Pelvis', 'Abdominal', 'Breast', 'Thyroid', 'Male Pelvis', 'Scrotal', 'Other Ultrasound', 'Neonatal Head', 'Renal', 'Aorta', 'Transplant', 'Ultrasound Guided', 'Chest', 'Extremity', 'Echocardiography'],
  Vascular: ['Carotid', 'Peripheral Venous Dx', 'Abdominal Duplex', 'Transplant', 'Hemodialysis Access Dx', 'Lower Arterial Duplex', 'Upper Arterial Duplex', 'Radial Artery Dx Harvest', 'Renal Artery Duplex', 'Mesenteric Duplex', 'Aortic-Inferior V. Cava Dx', 'Temporal Artery Duplex', 'Arterial Physiol. Testing', 'Transcranial Doppler'],
};
export const SP = { "Women's Health": ['Intelligent Coding'] };

export const grp = (g) => PKG[g].map((i) => `${g}|${i}`);
export const grpAll = (g) => [...grp(g), ...(SP[g] || []).map((i) => `${g}|${i}`)];
export const isSp = (k) => { const [g, i] = k.split('|'); return (SP[g] || []).includes(i); };
export const groupTotal = (g) => PKG[g].length + (SP[g] || []).length;
export const pkLabels = (pk) =>
  Object.keys(PKG)
    .filter((g) => pk.some((k) => k.startsWith(g + '|') && !isSp(k)))
    .map((g) => `${g} (${pk.filter((k) => k.startsWith(g + '|') && !isSp(k)).length})`);

export const STATUSES = ['Processing', 'Active', 'Read-Only', 'Inactive', 'Cancelled'];
export const STATUS_COLOR = {
  Processing: '#3b6fd4', Active: '#1a9b57', 'Read-Only': '#b26a00', Inactive: '#8a8a8a', Cancelled: '#c0392b',
};
