// Simulated mission data for the Astronaut Health Twin prototype.
// Every value is derived from (metric, environment, mission day), so the
// whole dashboard stays consistent when the user moves the day slider.

export const DAYS = 90;

export const ENVS = {
  iss: {
    name: "Space station",
    gravity: "Microgravity",
    comms: "Live contact with ground",
    note: "Exercise gear and medical supplies on board; ground team reachable at any time.",
  },
  moon: {
    name: "Moon base",
    gravity: "0.16 g",
    comms: "About 3 seconds round trip",
    note: "Partial gravity slows bone loss a little, but dust and higher radiation add new risks.",
  },
  mars: {
    name: "Mars transit",
    gravity: "Microgravity",
    comms: "Up to 44 minutes round trip",
    note: "Long exposure to deep-space radiation, minimal equipment, and a delayed link to ground.",
  },
};

// dir "up": higher is worse. dir "down": lower is worse.
// drift: how far the value moves over the 90 days in each environment.
export const REGIONS = [
  {
    id: "head",
    name: "Brain and eyes",
    function:
      "Vision, memory, focus and sleep. Fluid shifts toward the head in microgravity and can change the back of the eye.",
    why: "Fluid moving upward can swell the optic nerve (spaceflight-associated neuro-ocular syndrome). Isolation and light cycles also disturb sleep and slow thinking.",
    actions: [
      "Do the daily eye and reaction check before breakfast.",
      "Keep a fixed sleep window and dim cabin lights two hours before it.",
      "Sleep with the head end slightly raised if your crew bunk allows it.",
    ],
    escalate:
      "Blurred or changed vision, a headache that will not clear, or sleep under 6 hours for 3 nights in a row.",
    metrics: [
      { id: "retina", label: "Retinal thickness", unit: "µm", normal: "under 310", dir: "up", base: 285, drift: { iss: 14, moon: 28, mars: 52 }, warn: 310, alert: 330, wig: 3, dec: 0 },
      { id: "rt", label: "Reaction time", unit: "ms", normal: "under 300", dir: "up", base: 255, drift: { iss: 20, moon: 35, mars: 80 }, warn: 300, alert: 340, wig: 6, dec: 0 },
      { id: "sleep", label: "Sleep per night", unit: "h", normal: "6.5 to 8", dir: "down", base: 7.4, drift: { iss: -0.5, moon: -0.9, mars: -1.8 }, warn: 6.5, alert: 6.0, wig: 0.15, dec: 1 },
    ],
  },
  {
    id: "chest",
    name: "Heart and lungs",
    function:
      "Pumps blood and delivers oxygen. Without gravity the heart works less and can lose conditioning.",
    why: "The heart gets smaller and weaker with less load, and blood pressure regulation changes. Cabin air quality and dust affect breathing.",
    actions: [
      "Do 30 minutes of aerobic exercise on the treadmill or bike each day.",
      "Check blood pressure and oxygen after exercise, not before.",
      "Run the cabin air check if oxygen reads low twice in a row.",
    ],
    escalate:
      "Resting heart rate above 95, oxygen below 92%, chest pain, or fainting when standing.",
    metrics: [
      { id: "hr", label: "Resting heart rate", unit: "bpm", normal: "50 to 80", dir: "up", base: 62, drift: { iss: 4, moon: 6, mars: 12 }, warn: 80, alert: 95, wig: 2, dec: 0 },
      { id: "spo2", label: "Blood oxygen", unit: "%", normal: "95 to 100", dir: "down", base: 98, drift: { iss: -0.3, moon: -0.8, mars: -1.5 }, warn: 95, alert: 92, wig: 0.3, dec: 1 },
      { id: "bp", label: "Systolic pressure", unit: "mmHg", normal: "under 130", dir: "up", base: 114, drift: { iss: 4, moon: 8, mars: 15 }, warn: 130, alert: 140, wig: 2, dec: 0 },
    ],
  },
  {
    id: "core",
    name: "Spine, bones and radiation",
    function:
      "Holds the body up and shields vital organs. Bone is rebuilt only when it is loaded.",
    why: "Bone loses about 1% of its density each month without load. Radiation passes through the whole body and adds up over the mission.",
    actions: [
      "Do resistance training with the loading device 6 days a week.",
      "Take vitamin D and calcium as prescribed by the flight surgeon.",
      "Stay in the shielded area during a solar particle alert.",
    ],
    escalate:
      "Back or hip pain that does not ease, bone density down more than 7%, or radiation dose above the mission limit.",
    metrics: [
      { id: "bmd", label: "Bone density change", unit: "%", normal: "above −4", dir: "down", base: 0, drift: { iss: -3, moon: -4.5, mars: -8 }, warn: -4, alert: -7, wig: 0.1, dec: 1 },
      { id: "rad", label: "Radiation dose so far", unit: "mSv", normal: "under 100", dir: "up", base: 0, drift: { iss: 50, moon: 130, mars: 162 }, warn: 100, alert: 150, wig: 0, dec: 0 },
    ],
  },
  {
    id: "arms",
    name: "Upper-body muscle",
    function:
      "Arms, shoulders and back. Used for every task, and still shrinks when nothing pushes against it.",
    why: "Muscle used mainly for floating and light tasks loses size and strength. Fewer exercise machines on a long trip makes it worse.",
    actions: [
      "Do your full resistance routine, even on busy days.",
      "Add protein to the next two meals.",
      "Test grip strength once a week at the same time of day.",
    ],
    escalate:
      "Grip strength drops under 34 kg, sudden weakness on one side, or a joint that will not move normally.",
    metrics: [
      { id: "grip", label: "Grip strength", unit: "kg", normal: "above 38", dir: "down", base: 42, drift: { iss: -2, moon: -3, mars: -6 }, warn: 38, alert: 34, wig: 0.6, dec: 1 },
      { id: "sessions", label: "Strength sessions per week", unit: "", normal: "4 or more", dir: "down", base: 6, drift: { iss: -0.3, moon: -1, mars: -2.2 }, warn: 4, alert: 3, wig: 0.1, dec: 1 },
    ],
  },
  {
    id: "legs",
    name: "Lower-body muscle and balance",
    function:
      "Legs carry the body on landing and provide balance. They are the first to weaken in microgravity.",
    why: "Legs barely work while floating, so calf and thigh muscle shrinks quickly. Balance is affected after long flights, which matters when landing on the Moon or Mars.",
    actions: [
      "Run on the treadmill with the harness for at least 30 minutes.",
      "Do the eyes-closed balance test twice a week.",
      "Practice slow standing and walking drills in the last week before landing.",
    ],
    escalate:
      "Calf muscle down more than 12%, a fall, or calf swelling and pain on one side.",
    metrics: [
      { id: "calf", label: "Calf muscle change", unit: "%", normal: "above −8", dir: "down", base: 0, drift: { iss: -4, moon: -7, mars: -12 }, warn: -8, alert: -12, wig: 0.15, dec: 1 },
      { id: "balance", label: "Eyes-closed balance hold", unit: "s", normal: "above 22", dir: "down", base: 30, drift: { iss: -3, moon: -6, mars: -12 }, warn: 22, alert: 15, wig: 1, dec: 0 },
    ],
  },
];

export const STATUS = {
  ok: { label: "Nominal", hex: "#2dd4bf" },
  watch: { label: "Watch", hex: "#f5b544" },
  alert: { label: "Act now", hex: "#ff6b5e" },
};

const RANK = { ok: 0, watch: 1, alert: 2 };

export function worst(list) {
  return list.reduce((a, b) => (RANK[b] > RANK[a] ? b : a), "ok");
}

export function valueAt(m, env, day) {
  const t = day / DAYS;
  const phase = m.id.length * 1.3;
  return m.base + m.drift[env] * t + m.wig * Math.sin(day * 0.7 + phase);
}

export function statusOf(m, v) {
  if (m.dir === "up") return v >= m.alert ? "alert" : v >= m.warn ? "watch" : "ok";
  return v <= m.alert ? "alert" : v <= m.warn ? "watch" : "ok";
}

export function fmt(v, dec) {
  const s = Math.abs(v).toFixed(dec);
  return v < 0 && Number(s) !== 0 ? `−${s}` : s;
}
