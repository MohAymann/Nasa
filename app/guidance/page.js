'use client';
import { useState, useMemo } from 'react';
import { useStore, useLatestReadings } from '@/lib/store';
import { METRICS_CONFIG, getMetricStatus, STATUS_COLORS } from '@/lib/constants';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';

const GENERAL_PROTOCOLS = [
  {
    id: 'emergency',
    title: 'Emergency Medical Communication (CAPCOM)',
    category: 'Urgent Intervention',
    icon: '🚨',
    summary:
      'Immediate alert sequence when any biometric parameter exceeds critical threshold or an acute clinical event occurs.',
    steps: [
      'Cease all strenuous activity or extravehicular activity (EVA) immediately.',
      'Alert fellow crew members to your location inside the habitation module.',
      'Establish priority medical comms channel with the Flight Surgeon via Ground Support / CAPCOM.',
      'If communication blackout exists (e.g. lunar far-side or Mars orbital occlusion), execute autonomous medical stabilization kit protocols per the onboard medical formulary.',
      'Initiate continuous vital logging (every 5–15 minutes) until flight surgeon consultation or vital stabilization.',
    ],
  },
  {
    id: 'exercise',
    title: 'Countermeasure Exercise Protocol (2.5h / Sol)',
    category: 'Musculoskeletal & Cardiovascular',
    icon: '⚡',
    summary:
      'Mandatory daily physical countermeasures to prevent 1–2% monthly bone mineral loss and myocardial deconditioning.',
    steps: [
      'Advanced Resistive Exercise Device (ARED): 60 minutes of high-load squats, deadlifts, and heel raises targeting spine, hip, and femur bone density.',
      'T-2 Treadmill / CEVIS Cycle Ergometer: 30–45 minutes of interval aerobic training maintaining 75–85% target heart rate.',
      'Continuous heart rate and pulse oximetry monitoring during all high-intensity intervals.',
      'Pre- and post-workout hydration: consume minimum 500 mL electrolyte solution to offset thermal sweating in microgravity convection deficit.',
    ],
  },
  {
    id: 'nutrition',
    title: 'Microgravity Nutritional & Bone Support Plan',
    category: 'Metabolic & Renal',
    icon: '🥦',
    summary:
      'Nutritional intake designed to mitigate negative calcium balance, fluid depletion, and renal calculi (kidney stone) formation.',
    steps: [
      'Maintain daily caloric intake between 2,800–3,200 kcal balanced across stabilized macronutrients.',
      'Strict sodium restriction (<2,300 mg/day) to prevent excess urinary calcium excretion.',
      'Daily supplementation: 800–1,000 IU Vitamin D3, 1,000 mg Calcium, and Omega-3 fatty acids for immune resilience.',
      'Daily fluid intake target: 2.5–3.0 Liters water to maintain urinary specific gravity <1.010 and prevent calcium oxalate crystallization.',
    ],
  },
  {
    id: 'sleep',
    title: 'Circadian Entrainment & Sleep Architecture',
    category: 'Neurocognitive Health',
    icon: '◑',
    summary:
      'Countermeasures against circadian desynchronization, 90-minute orbital light cycles, and cabin acoustic stress.',
    steps: [
      'Enforce an 8.5-hour scheduled sleep opportunity in the personal crew quarters (CQ).',
      'Dynamic Solid-State Light (SSL) regulation: shift cabin lighting to blue-depleted warm light 2 hours prior to sleep period.',
      'Mandatory acoustic mitigation: use fitted high-attenuation earplugs or active noise cancellation to suppress pump and fan noise (<50 dBA).',
      'If sleep latency exceeds 60 minutes: follow onboard sleep hygiene checklist; consult medical kit for low-dose melatonin (0.5–3 mg) per flight surgeon standing orders.',
    ],
  },
  {
    id: 'behavioral',
    title: 'Behavioral Health & Cognitive Resilience',
    category: 'Psychological Support',
    icon: '🧠',
    summary:
      'Mitigating the psychological burdens of long-duration isolation, extreme confinement, and distance from Earth.',
    steps: [
      'Log daily self-assessed mood score (1–10) and subjective sleep quality evaluation.',
      'Dedicate 20 minutes daily to mindfulness, meditation, or unstructured recreational rest.',
      'Weekly private family videoconference and bi-weekly private psychological conference (PPC) with the mission psychologist.',
      'If mood score remains ≤5 for 3 consecutive days: notify Crew Medical Officer (CMO) for stress debrief and schedule non-emergency psychiatric consultation.',
    ],
  },
];

export default function GuidancePage() {
  const { state } = useStore();
  const latestReadings = useLatestReadings(state);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTabPerCard, setActiveTabPerCard] = useState({}); // { [metricKey]: 'actions' | 'about' }

  const filteredMetrics = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return Object.entries(METRICS_CONFIG).filter(([key, cfg]) => {
      if (!term) return true;
      return (
        cfg.label.toLowerCase().includes(term) ||
        cfg.description.toLowerCase().includes(term) ||
        cfg.bodySystem.toLowerCase().includes(term) ||
        cfg.spaceEffect.toLowerCase().includes(term)
      );
    });
  }, [searchTerm]);

  const toggleTab = (key, tab) => {
    setActiveTabPerCard((prev) => ({ ...prev, [key]: tab }));
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Medical Protocols & Clinical Guidance"
        subtitle="Operational flight surgeon guidelines, indicator diagnostic thresholds, and standardized spaceflight countermeasures."
        action={
          <Link
            href="/log"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
          >
            <span>⊕</span> Log Telemetry
          </Link>
        }
      />

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter protocols by metric, symptom, or system..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
        />
        <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">🔍</span>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-2.5 text-xs text-zinc-500 hover:text-zinc-300"
          >
            ✕
          </button>
        )}
      </div>

      {/* Metric-Specific Action Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono">
            Physiological Metric Protocols ({filteredMetrics.length})
          </h2>
          <span className="text-xs text-zinc-500 font-mono">
            Threshold-Driven Clinical Recommendations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMetrics.map(([key, cfg]) => {
            const reading = latestReadings[key];
            const status = reading ? getMetricStatus(key, reading.value) : 'unknown';
            const activeTab = activeTabPerCard[key] || 'actions';

            return (
              <div
                key={key}
                className="rounded-lg bg-zinc-900 border border-zinc-800 p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl font-mono text-zinc-300">{cfg.icon}</span>
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-100">{cfg.label}</h3>
                        <span className="text-[11px] text-zinc-500 uppercase font-mono">
                          {cfg.bodySystem}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={status} />
                      {reading && (
                        <div className="text-xs font-mono font-bold text-zinc-200 mt-1">
                          Current: {reading.value} {cfg.unit}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sub-Tabs: Actions vs About */}
                  <div className="flex items-center gap-1 border-b border-zinc-800 mb-4 pb-1">
                    <button
                      onClick={() => toggleTab(key, 'actions')}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        activeTab === 'actions'
                          ? 'bg-zinc-800 text-zinc-100 font-semibold'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Action Protocol
                    </button>
                    <button
                      onClick={() => toggleTab(key, 'about')}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        activeTab === 'about'
                          ? 'bg-zinc-800 text-zinc-100 font-semibold'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Pathophysiology & Risks
                    </button>
                  </div>

                  {/* Tab 1: Actions */}
                  {activeTab === 'actions' && (
                    <div className="space-y-3 text-xs">
                      {/* Normal Range Reference */}
                      <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-between font-mono">
                        <span className="text-zinc-400">Target Range:</span>
                        <span className="text-green-400 font-semibold">
                          {cfg.normal[0]} – {cfg.normal[1]} {cfg.unit}
                        </span>
                      </div>

                      {/* Low Guidance */}
                      {cfg.guidance?.low && (
                        <div className="p-2.5 rounded bg-zinc-950 border-l-2 border-red-500 pl-3">
                          <span className="text-red-400 font-semibold block mb-0.5 font-mono">
                            If Low (&lt; {cfg.normal[0]} {cfg.unit}):
                          </span>
                          <p className="text-zinc-300">{cfg.guidance.low}</p>
                        </div>
                      )}

                      {/* Normal Guidance */}
                      {cfg.guidance?.normal && (
                        <div className="p-2.5 rounded bg-zinc-950 border-l-2 border-green-500 pl-3">
                          <span className="text-green-400 font-semibold block mb-0.5 font-mono">
                            If Nominal:
                          </span>
                          <p className="text-zinc-300">{cfg.guidance.normal}</p>
                        </div>
                      )}

                      {/* High Guidance */}
                      {cfg.guidance?.high && (
                        <div className="p-2.5 rounded bg-zinc-950 border-l-2 border-amber-500 pl-3">
                          <span className="text-amber-400 font-semibold block mb-0.5 font-mono">
                            If Elevated (&gt; {cfg.normal[1]} {cfg.unit}):
                          </span>
                          <p className="text-zinc-300">{cfg.guidance.high}</p>
                        </div>
                      )}

                      {/* Surgeon Warning */}
                      <div className="text-[11px] text-zinc-500 pt-1 flex items-start gap-1.5">
                        <span>ℹ️</span>
                        <span>
                          Notify Flight Surgeon if value persists in caution/critical status across 2
                          consecutive logs.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: About */}
                  {activeTab === 'about' && (
                    <div className="space-y-3 text-xs text-zinc-300">
                      <div>
                        <span className="text-zinc-500 uppercase text-[10px] font-mono block mb-1">
                          Clinical Description
                        </span>
                        <p className="leading-relaxed">{cfg.description}</p>
                      </div>
                      <div className="p-3 rounded bg-zinc-950 border border-zinc-800">
                        <span className="text-blue-400 uppercase text-[10px] font-mono font-semibold block mb-1">
                          Spaceflight Hazard Impact
                        </span>
                        <p className="text-zinc-400 leading-relaxed">{cfg.spaceEffect}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Link */}
                <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-mono text-[11px]">
                    System: {cfg.bodySystem}
                  </span>
                  <Link
                    href="/log"
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Log Vital →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* General Core Protocols Section */}
      <div className="pt-6 border-t border-zinc-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100">
            Standard Spaceflight Health Directives
          </h2>
          <p className="text-xs text-zinc-400">
            NASA Human Research Program (HRP) baseline health protocols for long-duration space
            missions.
          </p>
        </div>

        <div className="space-y-4">
          {GENERAL_PROTOCOLS.map((proto) => (
            <div
              key={proto.id}
              className="rounded-lg bg-zinc-900 border border-zinc-800 p-5 border-l-4 border-l-blue-600 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{proto.icon}</span>
                  <h3 className="text-sm font-bold text-zinc-100">{proto.title}</h3>
                </div>
                <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded w-fit">
                  {proto.category}
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">{proto.summary}</p>

              <div className="bg-zinc-950 rounded p-3.5 border border-zinc-850">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                  Action Checklist:
                </span>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {proto.steps.map((st, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-400 font-mono font-bold">•</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
