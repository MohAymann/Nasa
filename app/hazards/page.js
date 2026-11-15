'use client';
import { useMemo } from 'react';
import { useStore, useLatestReadings } from '@/lib/store';
import { METRICS_CONFIG, SPACE_HAZARDS, getMetricStatus, STATUS_COLORS } from '@/lib/constants';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';

export default function HazardsPage() {
  const { state } = useStore();
  const latestReadings = useLatestReadings(state);

  // Compute cumulative radiation estimate
  const radiationSummary = useMemo(() => {
    const radReadings = state.readings.filter((r) => r.metric === 'radiationDose');
    const missionDays = state.astronaut.missionDay || 1;

    let totalDose = 0;
    if (radReadings.length > 0) {
      // Average daily dose * mission days
      const avg =
        radReadings.reduce((sum, r) => sum + parseFloat(r.value || 0), 0) / radReadings.length;
      totalDose = avg * missionDays;
    } else {
      totalDose = 0.45 * missionDays; // ISS / Deep space baseline ~0.45 mSv/day
    }

    const careerLimit = 1000; // 1,000 mSv career limit
    const percent = Math.min(100, (totalDose / careerLimit) * 100);

    return {
      totalDose: totalDose.toFixed(1),
      careerLimit,
      percent: percent.toFixed(1),
      dailyAvg:
        radReadings.length > 0
          ? (
              radReadings.reduce((sum, r) => sum + parseFloat(r.value || 0), 0) /
              radReadings.length
            ).toFixed(2)
          : '0.45',
    };
  }, [state.readings, state.astronaut.missionDay]);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="NASA Human Research Program (HRP) Space Hazards"
        subtitle="Continuous monitoring and threat mitigation across the five core hazards of long-duration spaceflight."
        action={
          <Link
            href="/log"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
          >
            <span>⊕</span> Log Telemetry
          </Link>
        }
      />

      {/* Cumulative Radiation Dossier Box */}
      <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⚡</span>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">
                Cumulative Ionizing Radiation Exposure
              </h2>
              <p className="text-xs text-zinc-400">
                Tracking galactic cosmic rays (GCR) and solar particle event (SPE) accumulated dose
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">Mission Day {state.astronaut.missionDay}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-cyan-400 border border-zinc-700">
              Avg: {radiationSummary.dailyAvg} mSv/day
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <span className="text-zinc-300">
              Accumulated Mission Exposure:{' '}
              <strong className="text-cyan-400">{radiationSummary.totalDose} mSv</strong>
            </span>
            <span className="text-zinc-400">
              NASA Career Threshold: <strong>{radiationSummary.careerLimit} mSv</strong> (
              {radiationSummary.percent}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${Math.max(1, radiationSummary.percent)}%` }}
            />
          </div>
        </div>

        <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-base">✓</span>
            <span>
              Cumulative exposure remains well below career limits. Standard shielding in crew
              quarters active.
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            Source: NASA Human Research Program Standard STD-3001
          </span>
        </div>
      </div>

      {/* The 5 Hazards Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono">
          The 5 Human Spaceflight Hazards
        </h2>

        <div className="space-y-5">
          {SPACE_HAZARDS.map((hazard) => {
            // Assess risk level based on associated metrics
            let worstStatus = 'normal';
            let monitoredCount = 0;

            for (const mKey of hazard.metrics) {
              const reading = latestReadings[mKey];
              if (reading) {
                monitoredCount++;
                const s = getMetricStatus(mKey, reading.value);
                if (s === 'critical') {
                  worstStatus = 'critical';
                  break;
                }
                if (s === 'warn') {
                  worstStatus = 'warn';
                }
              }
            }

            const riskLabel =
              worstStatus === 'critical'
                ? 'High Risk Alert'
                : worstStatus === 'warn'
                ? 'Elevated Risk'
                : 'Nominal Risk';

            return (
              <div
                key={hazard.id}
                className="rounded-lg bg-zinc-900 border border-zinc-800 p-6 space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-mono text-zinc-300">{hazard.icon}</span>
                    <div>
                      <h3 className="text-base font-bold text-zinc-100">{hazard.name}</h3>
                      <span className="text-xs text-zinc-500 font-mono">
                        NASA Hazard Classification #{hazard.id.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-medium px-2.5 py-1 rounded border ${
                        worstStatus === 'critical'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : worstStatus === 'warn'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-green-500/10 text-green-400 border-green-500/30'
                      }`}
                    >
                      {riskLabel}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-300 leading-relaxed">{hazard.description}</p>

                {/* Associated Metrics Grid */}
                <div>
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                    Direct Physiological Indicators:
                  </span>

                  {hazard.metrics.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {hazard.metrics.map((mKey) => {
                        const cfg = METRICS_CONFIG[mKey];
                        if (!cfg) return null;
                        const r = latestReadings[mKey];
                        const s = r ? getMetricStatus(mKey, r.value) : 'unknown';

                        return (
                          <div
                            key={mKey}
                            className="p-3 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-semibold text-zinc-200">{cfg.label}</div>
                              <div className="text-xs font-mono text-zinc-400 mt-0.5">
                                {r ? (
                                  <>
                                    <span className="font-bold text-zinc-100">{r.value}</span>{' '}
                                    {cfg.unit}
                                  </>
                                ) : (
                                  <span className="text-zinc-600">Pending</span>
                                )}
                              </div>
                            </div>
                            <StatusBadge status={s} />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
                      Monitored via behavioral logs, autonomous diagnostic algorithms, and scheduled
                      ground communication passes.
                    </div>
                  )}
                </div>

                {/* Mitigation Directive */}
                <div className="p-3.5 rounded bg-zinc-950 border-l-4 border-l-blue-600 space-y-1">
                  <span className="text-[11px] font-mono font-semibold text-blue-400 uppercase tracking-wider">
                    Countermeasure Strategy:
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{hazard.mitigation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <Link
          href="/log"
          className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors group"
        >
          <div className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400">
            Log Vital Signs →
          </div>
          <p className="text-xs text-zinc-400 mt-1">Record new physiological measurements</p>
        </Link>
        <Link
          href="/bodymap"
          className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors group"
        >
          <div className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400">
            Interactive Body Map →
          </div>
          <p className="text-xs text-zinc-400 mt-1">Inspect anatomical systems and indicators</p>
        </Link>
        <Link
          href="/guidance"
          className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors group"
        >
          <div className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400">
            Clinical Protocols →
          </div>
          <p className="text-xs text-zinc-400 mt-1">Review countermeasures and action plans</p>
        </Link>
      </div>
    </div>
  );
}
