'use client';
import { useState, useEffect } from 'react';
import { useStore, useLatestReadings } from '@/lib/store';
import { METRICS_CONFIG, getMetricStatus, STATUS_COLORS, SPACE_HAZARDS } from '@/lib/constants';
import MetricCard from '@/components/MetricCard';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';

const METRIC_KEYS = [
  'heartRate', 'systolicBP', 'diastolicBP', 'spO2',
  'bodyTemp', 'bloodGlucose', 'sleepHours', 'mood',
  'radiationDose', 'fluidIntake',
];

const STATUS_PRIORITY = { critical: 3, warn: 2, normal: 1, unknown: 0 };

function getWorstStatus(latestReadings) {
  let worst = 'unknown';
  for (const key of METRIC_KEYS) {
    const reading = latestReadings[key];
    if (!reading) continue;
    const s = getMetricStatus(key, reading.value);
    if (STATUS_PRIORITY[s] > STATUS_PRIORITY[worst]) worst = s;
  }
  return worst;
}

function getGuidance(cfg, value) {
  if (!cfg || value == null) return null;
  const v = parseFloat(value);
  const [nLow, nHigh] = cfg.normal;
  if (v >= nLow && v <= nHigh) return cfg.guidance?.normal ?? null;
  if (v < nLow) return cfg.guidance?.low ?? null;
  return cfg.guidance?.high ?? null;
}

// ── Metric Detail Panel ──────────────────────────────────────────────────────
function MetricDetailPanel({ metricKey, reading, onClose }) {
  const cfg = METRICS_CONFIG[metricKey];
  if (!cfg) return null;
  const status = reading ? getMetricStatus(metricKey, reading.value) : 'unknown';
  const colors = STATUS_COLORS[status];
  const guidance = reading ? getGuidance(cfg, reading.value) : null;

  return (
    <div className="mt-4 p-5 rounded-lg bg-zinc-900 border border-zinc-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{cfg.icon}</span>
          <div>
            <h3 className="text-base font-semibold text-zinc-50">{cfg.label}</h3>
            {reading && (
              <p className={`text-sm font-medium ${colors.text}`}>
                {reading.value} {cfg.unit}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-300 text-xl leading-none transition-colors"
          aria-label="Close detail panel"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Description</p>
          <p className="text-zinc-300">{cfg.description}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Space Effect</p>
          <p className="text-zinc-300">{cfg.spaceEffect}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Normal Range</p>
          <p className="text-zinc-300">
            {cfg.normal[0]} – {cfg.normal[1]} {cfg.unit}
          </p>
          {cfg.warn && (
            <p className="text-amber-500/80 text-xs mt-0.5">
              Caution: {cfg.warn[0]} – {cfg.warn[1]} {cfg.unit}
            </p>
          )}
        </div>
        {guidance && (
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Guidance</p>
            <p className={`${colors.text}`}>{guidance}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { state, dispatch } = useStore();
  const latestReadings = useLatestReadings(state);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [utcTime, setUtcTime] = useState('');

  // Live UTC clock
  useEffect(() => {
    const fmt = () =>
      new Date().toUTCString().replace(' GMT', ' UTC').split(' ').slice(1).join(' ');
    setUtcTime(fmt());
    const id = setInterval(() => setUtcTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  const totalReadings = state.readings.length;
  const unacknowledgedAlerts = state.alerts.filter((a) => !a.acknowledged);
  const worstStatus = getWorstStatus(latestReadings);
  const statusColors = STATUS_COLORS[worstStatus];
  const hasAnyReadings = totalReadings > 0;

  function handleCardClick(key) {
    setSelectedMetric((prev) => (prev === key ? null : key));
  }

  function acknowledgeAll() {
    unacknowledgedAlerts.forEach((a) => dispatch({ type: 'ACK_ALERT', id: a.id }));
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">

      {/* ── A. Top Status Bar ─────────────────────────────────────────── */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-zinc-500 font-mono">
              Mission Day{' '}
              <span className="text-zinc-200 font-semibold">
                {state.astronaut.missionDay}
              </span>
            </span>
            <span className="text-zinc-500">
              Crew:{' '}
              <span className="text-zinc-200">{state.astronaut.name}</span>
            </span>
            <span className="text-zinc-600 font-mono text-xs">{utcTime}</span>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
            Health: {statusColors.label}
          </span>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        <PageHeader
          title="Mission Dashboard"
          subtitle="Real-time astronaut health telemetry & physiological status"
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch({ type: 'SEED_SAMPLE_DATA' })}
                className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono border border-zinc-700 transition-colors"
                title="Populate realistic astronaut telemetry for Sol 42"
              >
                ⟳ Seed Sol 42 Data
              </button>
              <Link
                href="/log"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                <span>⊕</span> Log Vitals
              </Link>
            </div>
          }
        />

        {/* ── B. Quick Overview Cards ───────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Vitals Logged</p>
            <p className="text-3xl font-bold text-zinc-50">{totalReadings}</p>
            <p className="text-xs text-zinc-600 mt-1">total readings</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Active Alerts</p>
            <p className={`text-3xl font-bold ${unacknowledgedAlerts.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {unacknowledgedAlerts.length}
            </p>
            <p className="text-xs text-zinc-600 mt-1">unacknowledged</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Mission Day</p>
            <p className="text-3xl font-bold text-blue-400">{state.astronaut.missionDay}</p>
            <p className="text-xs text-zinc-600 mt-1">days elapsed</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Overall Status</p>
            <p className={`text-3xl font-bold ${statusColors.text}`}>
              {statusColors.label}
            </p>
            <p className="text-xs text-zinc-600 mt-1">worst metric</p>
          </div>
        </div>

        {/* ── F. Empty State ────────────────────────────────────────── */}
        {!hasAnyReadings && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-10 text-center">
            <div className="text-5xl mb-4 text-zinc-600">◎</div>
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">No Health Data Yet</h2>
            <p className="text-zinc-500 text-sm mb-6 max-w-md mx-auto">
              Record your first vital signs to begin monitoring your health, or load realistic mission simulation data to explore all features.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/log"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                Go to Log Vitals →
              </Link>
              <button
                onClick={() => dispatch({ type: 'SEED_SAMPLE_DATA' })}
                className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium px-5 py-2.5 rounded-lg border border-zinc-700 transition-colors font-mono"
              >
                ⟳ Load Sol 42 Data
              </button>
            </div>
          </div>
        )}

        {/* ── C. Health Metrics Grid ────────────────────────────────── */}
        {hasAnyReadings && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              Health Metrics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {METRIC_KEYS.map((key) => (
                <div key={key}>
                  <MetricCard
                    metricKey={key}
                    reading={latestReadings[key] ?? null}
                    onClick={() => handleCardClick(key)}
                  />
                  {selectedMetric === key && (
                    <MetricDetailPanel
                      metricKey={key}
                      reading={latestReadings[key] ?? null}
                      onClose={() => setSelectedMetric(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── D. Active Alerts ──────────────────────────────────────── */}
        {unacknowledgedAlerts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-red-500">
                ⚠ Active Alerts ({unacknowledgedAlerts.length})
              </h2>
              <button
                onClick={acknowledgeAll}
                className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-500 px-3 py-1 rounded-md transition-colors"
              >
                Acknowledge All
              </button>
            </div>
            <div className="space-y-2">
              {unacknowledgedAlerts.map((alert) => {
                const cfg = METRICS_CONFIG[alert.metric];
                const alertStatus = STATUS_COLORS[alert.status] || STATUS_COLORS.unknown;
                return (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${alertStatus.bg} ${alertStatus.border}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{cfg?.icon ?? '!'}</span>
                      <div>
                        <p className="text-sm font-medium text-zinc-100">
                          {cfg?.label ?? alert.metric}
                        </p>
                        <p className="text-xs text-zinc-400">
                          Value: <span className={alertStatus.text}>{alert.value} {cfg?.unit}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium border ${alertStatus.bg} ${alertStatus.text} ${alertStatus.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${alertStatus.dot}`} />
                        {alertStatus.label}
                      </span>
                      <span className="text-xs text-zinc-600 hidden sm:block">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => dispatch({ type: 'ACK_ALERT', id: alert.id })}
                        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── E. Space Hazards ──────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Space Hazards
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {SPACE_HAZARDS.map((hazard) => (
              <div
                key={hazard.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-400 text-lg">{hazard.icon}</span>
                  <span className="text-xs font-semibold text-zinc-200">{hazard.name}</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3">
                  {hazard.description}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
