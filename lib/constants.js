export const MISSION_START = new Date('2026-01-01T00:00:00Z');

export const METRICS_CONFIG = {
  heartRate: {
    key: 'heartRate', label: 'Heart Rate', unit: 'bpm',
    normal: [60, 100], warn: [50, 110], critical: [0, 50, 110, 999],
    icon: '♥', bodySystem: 'cardiovascular',
    description: 'Resting heart rate. In microgravity, the heart works less hard due to fluid redistribution.',
    spaceEffect: 'Microgravity causes fluid shift toward the upper body, temporarily increasing cardiac load. Long-duration spaceflight can lead to cardiac deconditioning.',
    guidance: { low: 'Report to flight surgeon immediately. Avoid exertion.', high: 'Rest immediately, monitor continuously, contact flight surgeon if sustained above 110 bpm.', normal: 'Continue regular aerobic exercise protocol (150 min/week minimum).' }
  },
  systolicBP: {
    key: 'systolicBP', label: 'Systolic BP', unit: 'mmHg',
    normal: [90, 120], warn: [80, 140], critical: [0, 80, 140, 999],
    icon: '⬆', bodySystem: 'cardiovascular',
    description: 'Systolic blood pressure — pressure when heart beats.',
    spaceEffect: 'Blood pressure can decrease in microgravity due to fluid shifts and reduced blood volume. Orthostatic hypotension is a risk upon return to gravity.',
    guidance: { low: 'Increase fluid intake. Lie down. Contact flight surgeon if below 80 mmHg.', high: 'Reduce physical exertion. Contact flight surgeon. Monitor every 15 minutes.', normal: 'Maintain fluid and sodium intake per mission protocol.' }
  },
  diastolicBP: {
    key: 'diastolicBP', label: 'Diastolic BP', unit: 'mmHg',
    normal: [60, 80], warn: [50, 90], critical: [0, 50, 90, 999],
    icon: '⬇', bodySystem: 'cardiovascular',
    description: 'Diastolic blood pressure — pressure between heartbeats.',
    spaceEffect: 'Related to vascular resistance. Can be affected by dehydration and autonomic changes in microgravity.',
    guidance: { low: 'Increase fluid intake. Rest in horizontal position.', high: 'Reduce workload. Report to flight surgeon if sustained.', normal: 'Maintain regular hydration schedule.' }
  },
  spO2: {
    key: 'spO2', label: 'Blood Oxygen', unit: '%',
    normal: [95, 100], warn: [90, 94], critical: [0, 89],
    icon: '○', bodySystem: 'respiratory',
    description: 'Blood oxygen saturation. Critical for brain and organ function.',
    spaceEffect: 'Altered atmospheric pressure and CO2 levels in spacecraft can affect oxygen saturation. Requires continuous monitoring.',
    guidance: { low: 'Activate emergency O2 supply immediately. Alert crew. Contact mission control.', normal: 'Cabin atmosphere nominal. Continue breathing exercises.' }
  },
  bodyTemp: {
    key: 'bodyTemp', label: 'Body Temp', unit: '°C',
    normal: [36.1, 37.2], warn: [35.5, 38.0], critical: [0, 35.0, 38.5, 999],
    icon: '◈', bodySystem: 'metabolic',
    description: 'Core body temperature. Altered thermoregulation in microgravity.',
    spaceEffect: 'Thermoregulation is impaired in microgravity as convection is absent. Exercise-induced hyperthermia is elevated. Immune dysregulation can cause fever.',
    guidance: { low: 'Increase thermal insulation. Hot beverage if available. Alert crew.', high: 'Rest immediately. Apply cooling. Alert crew. Contact flight surgeon.', normal: 'Nominal. Continue regular temperature monitoring.' }
  },
  bloodGlucose: {
    key: 'bloodGlucose', label: 'Blood Glucose', unit: 'mg/dL',
    normal: [70, 100], warn: [60, 125], critical: [0, 59, 126, 999],
    icon: '◇', bodySystem: 'metabolic',
    description: 'Fasting blood glucose level. Important for energy management.',
    spaceEffect: 'Space missions alter insulin sensitivity. Stress hormones during launch and high-workload periods can elevate glucose. Adequate nutrition is critical.',
    guidance: { low: 'Consume 15g fast-acting carbohydrates. Recheck in 15 min. Alert crew.', high: 'Reduce carbohydrate intake. Increase activity if safe. Report to flight surgeon if above 180 mg/dL.', normal: 'Maintain scheduled meal plan. Balance carbohydrate intake.' }
  },
  sleepHours: {
    key: 'sleepHours', label: 'Sleep Duration', unit: 'hrs',
    normal: [7, 9], warn: [5, 6.9], critical: [0, 4.9],
    icon: '◑', bodySystem: 'behavioral',
    description: 'Total sleep in past 24 hours. Critical for cognitive function and recovery.',
    spaceEffect: 'Circadian rhythm disruption in space (16 sunrises/day on ISS), noise, CO2 buildup, and stress reduce sleep quality. Sleep deprivation impairs mission performance.',
    guidance: { low: 'Prioritize sleep. Use sleep mask and ear protection. Consider melatonin per formulary. Alert crew to workload.', high: 'Review for excess fatigue or illness. Ensure sleep quality monitoring.', normal: 'Good sleep hygiene. Maintain consistent sleep schedule.' }
  },
  mood: {
    key: 'mood', label: 'Mood Score', unit: '/10',
    normal: [7, 10], warn: [5, 6], critical: [0, 4],
    icon: '☽', bodySystem: 'behavioral',
    description: 'Self-reported mood and psychological wellbeing score (1=very low, 10=excellent).',
    spaceEffect: 'Isolation, confinement, monotony, interpersonal tension, and distance from Earth affect behavioral health. Depression and anxiety are mission risks.',
    guidance: { low: 'Contact crew behavioral health officer. Schedule private communication with Earth. Use stress reduction protocols.', normal: 'Maintain social connections. Schedule leisure activities. Use mindfulness protocols.' }
  },
  radiationDose: {
    key: 'radiationDose', label: 'Radiation (Daily)', unit: 'mSv',
    normal: [0, 1.0], warn: [1.0, 2.0], critical: [2.0, 999],
    icon: '⚡', bodySystem: 'radiation',
    description: 'Daily radiation exposure dose. ISS averages ~0.3-1.0 mSv/day.',
    spaceEffect: 'Galactic cosmic rays and solar particle events increase cancer risk, cause cellular DNA damage, and may affect cognition. No cure — only monitoring and shielding.',
    guidance: { high: 'Seek shielded area immediately. Alert crew. Contact mission control. Document exposure.', normal: 'Nominal. Continue dosimeter logging. Avoid unshielded EVA during elevated solar activity.' }
  },
  fluidIntake: {
    key: 'fluidIntake', label: 'Fluid Intake', unit: 'mL',
    normal: [2000, 3500], warn: [1500, 1999], critical: [0, 1499],
    icon: '◎', bodySystem: 'metabolic',
    description: 'Total fluid consumed in past 24 hours. Dehydration accelerates bone/muscle loss.',
    spaceEffect: 'Dehydration is a risk in space. Increased urination post-launch, altered thirst response, and kidney stone risk all increase with inadequate hydration.',
    guidance: { low: 'Increase fluid intake immediately. Target 250mL/hr until normalized. Alert crew if unable to hydrate.', normal: 'Good hydration. Maintain current fluid schedule.' }
  },
};

export const BODY_SYSTEMS = {
  cardiovascular: { label: 'Cardiovascular', color: '#ef4444', metrics: ['heartRate', 'systolicBP', 'diastolicBP'] },
  respiratory: { label: 'Respiratory', color: '#3b82f6', metrics: ['spO2'] },
  metabolic: { label: 'Metabolic', color: '#f59e0b', metrics: ['bodyTemp', 'bloodGlucose', 'fluidIntake'] },
  behavioral: { label: 'Behavioral', color: '#8b5cf6', metrics: ['sleepHours', 'mood'] },
  radiation: { label: 'Radiation', color: '#06b6d4', metrics: ['radiationDose'] },
};

export const SPACE_HAZARDS = [
  { id: 'radiation', name: 'Space Radiation', icon: '⚡', description: 'Galactic cosmic rays and solar particle events cause DNA damage, increasing cancer risk and potentially affecting cognition.', metrics: ['radiationDose'], mitigation: 'Stay in shielded areas during solar events. Monitor dosimeter daily.' },
  { id: 'isolation', name: 'Isolation & Confinement', icon: '◉', description: 'Psychological stress from isolation, monotony, and interpersonal conflicts affect behavioral health and mission performance.', metrics: ['mood', 'sleepHours'], mitigation: 'Scheduled Earth communications, leisure activities, mindfulness protocols.' },
  { id: 'microgravity', name: 'Altered Gravity', icon: '↑', description: 'Microgravity causes bone density loss (~1-2%/month), muscle atrophy, fluid shifts, and cardiovascular deconditioning.', metrics: ['heartRate', 'systolicBP', 'diastolicBP'], mitigation: 'Mandatory exercise 2.5 hrs/day. Resistance and aerobic training.' },
  { id: 'distance', name: 'Distance from Earth', icon: '◎', description: 'Communication delays limit real-time medical support. Autonomous medical decision-making becomes critical.', metrics: [], mitigation: 'Follow onboard medical protocols. Use autonomous health AI for preliminary assessment.' },
  { id: 'environment', name: 'Hostile Closed Environment', icon: '◈', description: 'Altered atmospheric composition, temperature changes, CO2 buildup, and microbial changes affect health.', metrics: ['spO2', 'bodyTemp', 'sleepHours'], mitigation: 'Monitor cabin atmosphere continuously. Report anomalies to mission control.' },
];

export function getMetricStatus(key, value) {
  const cfg = METRICS_CONFIG[key];
  if (!cfg || value === null || value === undefined) return 'unknown';
  const v = parseFloat(value);
  const [nLow, nHigh] = cfg.normal;
  if (v >= nLow && v <= nHigh) return 'normal';
  const [wLow, wHigh] = cfg.warn || [null, null];
  if (wLow !== null && v >= wLow && v <= wHigh) return 'warn';
  if (wHigh !== null && v >= nHigh && v <= wHigh) return 'warn';
  return 'critical';
}

export const STATUS_COLORS = {
  normal: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30', dot: 'bg-green-500', label: 'Normal' },
  warn: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30', dot: 'bg-amber-500', label: 'Caution' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/30', dot: 'bg-red-500', label: 'Critical' },
  unknown: { bg: 'bg-zinc-800', text: 'text-zinc-400', border: 'border-zinc-700', dot: 'bg-zinc-500', label: 'No Data' },
};
