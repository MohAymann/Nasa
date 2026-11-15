'use client';
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const STORAGE_KEY = 'astrohealth_v1';

export const SAMPLE_MISSION_READINGS = [
  // Heart Rate readings over past days
  { id: 'seed-hr-1', timestamp: new Date(Date.now() - 6 * 86400000).toISOString(), metric: 'heartRate', value: 68, notes: 'Resting morning vitals' },
  { id: 'seed-hr-2', timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), metric: 'heartRate', value: 72, notes: 'Post-EVA recovery' },
  { id: 'seed-hr-3', timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), metric: 'heartRate', value: 70, notes: 'Nominal resting HR' },
  { id: 'seed-hr-4', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), metric: 'heartRate', value: 76, notes: 'After treadmill workout' },
  { id: 'seed-hr-5', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), metric: 'heartRate', value: 74, notes: 'Microgravity adaptation nominal' },
  { id: 'seed-hr-6', timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), metric: 'heartRate', value: 71, notes: 'Morning check-in' },
  { id: 'seed-hr-7', timestamp: new Date().toISOString(), metric: 'heartRate', value: 69, notes: 'Current resting HR' },

  // Blood Pressure readings
  { id: 'seed-sys-1', timestamp: new Date(Date.now() - 6 * 86400000).toISOString(), metric: 'systolicBP', value: 114, notes: 'Baseline' },
  { id: 'seed-sys-2', timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), metric: 'systolicBP', value: 118, notes: 'Nominal' },
  { id: 'seed-sys-3', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), metric: 'systolicBP', value: 112, notes: 'Fluid shift observed' },
  { id: 'seed-sys-4', timestamp: new Date().toISOString(), metric: 'systolicBP', value: 116, notes: 'Stable' },

  { id: 'seed-dia-1', timestamp: new Date(Date.now() - 6 * 86400000).toISOString(), metric: 'diastolicBP', value: 72, notes: 'Baseline' },
  { id: 'seed-dia-2', timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), metric: 'diastolicBP', value: 76, notes: 'Nominal' },
  { id: 'seed-dia-3', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), metric: 'diastolicBP', value: 74, notes: 'Nominal' },
  { id: 'seed-dia-4', timestamp: new Date().toISOString(), metric: 'diastolicBP', value: 75, notes: 'Stable' },

  // Blood Oxygen (spO2)
  { id: 'seed-spo2-1', timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), metric: 'spO2', value: 98, notes: 'Cabin O2 nominal at 21%' },
  { id: 'seed-spo2-2', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), metric: 'spO2', value: 97, notes: 'Pulse ox nominal' },
  { id: 'seed-spo2-3', timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), metric: 'spO2', value: 98, notes: 'Pre-sleep check' },
  { id: 'seed-spo2-4', timestamp: new Date().toISOString(), metric: 'spO2', value: 99, notes: 'Cabin atmosphere optimized' },

  // Core Body Temperature
  { id: 'seed-temp-1', timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), metric: 'bodyTemp', value: 36.8, notes: 'Core body temp' },
  { id: 'seed-temp-2', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), metric: 'bodyTemp', value: 37.0, notes: 'Post-resistance training' },
  { id: 'seed-temp-3', timestamp: new Date().toISOString(), metric: 'bodyTemp', value: 36.7, notes: 'Morning baseline' },

  // Blood Glucose
  { id: 'seed-glu-1', timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), metric: 'bloodGlucose', value: 88, notes: 'Fasting glucose' },
  { id: 'seed-glu-2', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), metric: 'bloodGlucose', value: 94, notes: 'Fasting' },
  { id: 'seed-glu-3', timestamp: new Date().toISOString(), metric: 'bloodGlucose', value: 91, notes: 'Fasting check' },

  // Sleep Duration
  { id: 'seed-sleep-1', timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), metric: 'sleepHours', value: 7.4, notes: 'Sound sleep in sleep station' },
  { id: 'seed-sleep-2', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), metric: 'sleepHours', value: 6.8, notes: 'Slight cabin noise' },
  { id: 'seed-sleep-3', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), metric: 'sleepHours', value: 7.8, notes: 'Restful recovery' },
  { id: 'seed-sleep-4', timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), metric: 'sleepHours', value: 7.2, notes: 'Nominal circadian cycle' },
  { id: 'seed-sleep-5', timestamp: new Date().toISOString(), metric: 'sleepHours', value: 7.5, notes: 'Good sleep efficiency' },

  // Mood Score
  { id: 'seed-mood-1', timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), metric: 'mood', value: 8, notes: 'High morale, Earth call scheduled' },
  { id: 'seed-mood-2', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), metric: 'mood', value: 8, notes: 'Productive science cycle' },
  { id: 'seed-mood-3', timestamp: new Date().toISOString(), metric: 'mood', value: 9, notes: 'Family uplink completed' },

  // Radiation Dose (mSv/day)
  { id: 'seed-rad-1', timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), metric: 'radiationDose', value: 0.42, notes: 'Deep space galactic cosmic ray background' },
  { id: 'seed-rad-2', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), metric: 'radiationDose', value: 0.55, notes: 'Transit trajectory monitoring' },
  { id: 'seed-rad-3', timestamp: new Date().toISOString(), metric: 'radiationDose', value: 0.48, notes: 'Dosimeter badge readout nominal' },

  // Fluid Intake
  { id: 'seed-flu-1', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), metric: 'fluidIntake', value: 2600, notes: 'Hydration protocol met' },
  { id: 'seed-flu-2', timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), metric: 'fluidIntake', value: 2800, notes: 'Electrolyte rehydration' },
  { id: 'seed-flu-3', timestamp: new Date().toISOString(), metric: 'fluidIntake', value: 2750, notes: 'Nominal water consumption' },
];

const initialState = {
  readings: SAMPLE_MISSION_READINGS, // Preloaded with realistic astronaut mission vitals
  astronaut: { name: 'Dr. Elena Vance', missionDay: 42, role: 'Flight Engineer / Science Officer', missionName: 'Artemis Deep Space Transit', baselines: {} },
  alerts: [
    {
      id: 'seed-alt-1',
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
      metric: 'radiationDose',
      value: 1.15,
      status: 'warn',
      message: 'Solar energetic particle event minor spike observed on dosimeter. Advised to stay in storm shelter module.',
      acknowledged: true,
    }
  ],
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD': return { ...state, ...action.payload };
    case 'ADD_READING': {
      const reading = { ...action.payload, id: Date.now().toString(), timestamp: new Date().toISOString() };
      const readings = [reading, ...state.readings].slice(0, 1000);
      return { ...state, readings };
    }
    case 'DELETE_READING': {
      return { ...state, readings: state.readings.filter(r => r.id !== action.id) };
    }
    case 'SET_ASTRONAUT': return { ...state, astronaut: { ...state.astronaut, ...action.payload } };
    case 'ADD_ALERT': {
      const alert = { ...action.payload, id: Date.now().toString(), timestamp: new Date().toISOString(), acknowledged: false };
      return { ...state, alerts: [alert, ...state.alerts].slice(0, 100) };
    }
    case 'ACK_ALERT': return { ...state, alerts: state.alerts.map(a => a.id === action.id ? { ...a, acknowledged: true } : a) };
    case 'CLEAR_ALERTS': return { ...state, alerts: state.alerts.map(a => ({ ...a, acknowledged: true })) };
    case 'RESET_DATA': return { ...initialState, readings: [] };
    case 'SEED_SAMPLE_DATA': return { ...state, readings: SAMPLE_MISSION_READINGS, astronaut: { ...state.astronaut, missionDay: 42 } };
    default: return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If saved state exists and has readings, load it; otherwise keep initial sample data
        if (parsed && Array.isArray(parsed.readings) && parsed.readings.length > 0) {
          dispatch({ type: 'LOAD', payload: parsed });
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
}

export function useLatestReadings(state) {
  const byMetric = {};
  for (const r of state.readings) {
    if (!byMetric[r.metric]) byMetric[r.metric] = r;
  }
  return byMetric;
}

export function useMetricHistory(state, metricKey, days = 7) {
  const forMetric = state.readings.filter(r => r.metric === metricKey);
  if (!forMetric || forMetric.length === 0) return [];

  // Sort chronologically ascending (oldest to newest)
  const sorted = [...forMetric].sort((a, b) => {
    const tA = typeof a.timestamp === 'string' ? Date.parse(a.timestamp) : Number(a.timestamp);
    const tB = typeof b.timestamp === 'string' ? Date.parse(b.timestamp) : Number(b.timestamp);
    return tA - tB;
  });

  // Take entries matching the window based on latest recorded reading
  if (sorted.length === 0) return [];
  const latestTs = Date.parse(sorted[sorted.length - 1].timestamp);
  const windowMs = days * 24 * 60 * 60 * 1000;
  const cutoff = latestTs - windowMs;

  return sorted.filter(r => Date.parse(r.timestamp) >= cutoff);
}
