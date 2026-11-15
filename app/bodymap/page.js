'use client';
import { useState, useMemo } from 'react';
import { useStore, useLatestReadings } from '@/lib/store';
import { METRICS_CONFIG, getMetricStatus, STATUS_COLORS, BODY_SYSTEMS } from '@/lib/constants';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';

const REGIONS = [
  {
    id: 'head',
    name: 'Head & Neuro-Behavioral',
    subtitle: 'Circadian rhythms, core thermoregulation, and psychological resilience',
    metrics: ['mood', 'sleepHours', 'bodyTemp'],
    svgShape: 'head',
    clinicalFocus: 'Monitors neurocognitive performance, sleep architecture disruption from lack of 24h solar cycle, and thermoregulatory resetting in microgravity.',
  },
  {
    id: 'chest',
    name: 'Cardiovascular & Respiratory',
    subtitle: 'Cardiac workload, central venous fluid shift, and cabin oxygenation',
    metrics: ['heartRate', 'systolicBP', 'diastolicBP', 'spO2'],
    svgShape: 'chest',
    clinicalFocus: 'Assesses cephalad fluid shifts (puffy face syndrome), reduced stroke volume, cardiac deconditioning, and gas exchange efficiency.',
  },
  {
    id: 'abdomen',
    name: 'Metabolic & Gastrointestinal',
    subtitle: 'Insulin sensitivity, nutrient absorption, and hydration status',
    metrics: ['bloodGlucose', 'fluidIntake'],
    svgShape: 'abdomen',
    clinicalFocus: 'Monitors spaceflight-associated insulin resistance, negative fluid balance, and kidney stone risk exacerbated by bone demineralization.',
  },
  {
    id: 'leftArm',
    name: 'Left Upper Extremity (BP Site)',
    subtitle: 'Vascular resistance and systemic arterial pressure',
    metrics: ['systolicBP', 'diastolicBP'],
    svgShape: 'leftArm',
    clinicalFocus: 'Site for blood pressure measurement cuff. Evaluates orthostatic intolerance risk and vascular tone changes.',
  },
  {
    id: 'rightArm',
    name: 'Right Upper Extremity (Pulse Ox)',
    subtitle: 'Peripheral capillary oxygenation and microvascular perfusion',
    metrics: ['spO2'],
    svgShape: 'rightArm',
    clinicalFocus: 'Continuous fingertip photoplethysmography site to detect hypoxemia or cabin carbon dioxide scrub failure.',
  },
  {
    id: 'legs',
    name: 'Musculoskeletal & Lower Body',
    subtitle: 'Bone mineral density, calf muscle atrophy, and fluid redistribution',
    metrics: ['sleepHours', 'heartRate'],
    svgShape: 'legs',
    clinicalFocus: 'Lower limbs lose 1–1.5% bone density per month in weight-bearing trabecular bone without 2.5h daily resistive exercise (ARED).',
  },
  {
    id: 'radiationBadge',
    name: 'Collar Dosimeter (Radiation)',
    subtitle: 'Ionizing cosmic rays, solar energetic particles, and tissue absorbed dose',
    metrics: ['radiationDose'],
    svgShape: 'radiationBadge',
    clinicalFocus: 'Active semiconductor dosimeter worn continuously to log galactic cosmic radiation (GCR) and detect solar particle events (SPE).',
  },
];

export default function BodyMapPage() {
  const { state } = useStore();
  const latestReadings = useLatestReadings(state);
  const [selectedRegionId, setSelectedRegionId] = useState('chest');

  // Compute status for each region
  const regionStatuses = useMemo(() => {
    const statuses = {};
    for (const reg of REGIONS) {
      let worst = 'normal';
      let hasData = false;
      for (const mKey of reg.metrics) {
        const reading = latestReadings[mKey];
        if (reading) {
          hasData = true;
          const s = getMetricStatus(mKey, reading.value);
          if (s === 'critical') {
            worst = 'critical';
            break;
          }
          if (s === 'warn') {
            worst = 'warn';
          }
        }
      }
      statuses[reg.id] = hasData ? worst : 'unknown';
    }
    return statuses;
  }, [latestReadings]);

  const selectedRegion = useMemo(() => {
    return REGIONS.find((r) => r.id === selectedRegionId) || REGIONS[0];
  }, [selectedRegionId]);

  function getRegionColor(regionId) {
    const s = regionStatuses[regionId] || 'unknown';
    if (s === 'critical') return { fill: '#ef4444', fillOpacity: 0.25, stroke: '#ef4444', strokeOpacity: 0.85 };
    if (s === 'warn') return { fill: '#f59e0b', fillOpacity: 0.25, stroke: '#f59e0b', strokeOpacity: 0.85 };
    if (s === 'normal') return { fill: '#22c55e', fillOpacity: 0.2, stroke: '#22c55e', strokeOpacity: 0.7 };
    return { fill: '#27272a', fillOpacity: 0.7, stroke: '#3f3f46', strokeOpacity: 0.9 };
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Interactive Physiological Body Map"
        subtitle="Anatomical mapping of active bio-telemetry indicators and localized spaceflight physiological adaptations."
        action={
          <Link
            href="/log"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
          >
            <span>⊕</span> Log Telemetry
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: SVG Body Map */}
        <div className="lg:col-span-6 rounded-lg bg-zinc-900 border border-zinc-800 p-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Anatomical System View (Anterior)
            </span>
            <span className="text-xs text-zinc-500 font-mono">Select region to inspect</span>
          </div>

          {/* SVG Canvas */}
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[200/480]">
            <svg
              viewBox="0 0 200 480"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
            >
              <defs>
                <linearGradient id="bodyBase" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#18181b" />
                  <stop offset="100%" stopColor="#09090b" />
                </linearGradient>
              </defs>

              {/* Anatomical background outline */}
              <g stroke="#3f3f46" strokeWidth="1" fill="url(#bodyBase)">
                {/* Head outline */}
                <ellipse cx="100" cy="45" rx="28" ry="34" />
                {/* Neck */}
                <rect x="92" y="77" width="16" height="20" rx="3" />
                {/* Torso */}
                <path d="M 62 97 Q 100 92 138 97 L 134 255 Q 100 260 66 255 Z" />
                {/* Left Arm */}
                <path d="M 60 98 Q 32 108 30 180 Q 28 220 32 235 L 46 233 Q 46 180 62 125 Z" />
                {/* Right Arm */}
                <path d="M 140 98 Q 168 108 170 180 Q 172 220 168 235 L 154 233 Q 154 180 138 125 Z" />
                {/* Legs */}
                <path d="M 68 255 L 68 440 L 92 440 L 96 260 Z" />
                <path d="M 104 260 L 108 440 L 132 440 L 132 255 Z" />
              </g>

              {/* Interactive Clickable Anatomical Regions */}

              {/* 1. HEAD */}
              {(() => {
                const c = getRegionColor('head');
                const isSelected = selectedRegionId === 'head';
                return (
                  <g
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedRegionId('head')}
                  >
                    <ellipse
                      cx="100"
                      cy="45"
                      rx="27"
                      ry="33"
                      fill={c.fill}
                      fillOpacity={isSelected ? 0.45 : c.fillOpacity}
                      stroke={c.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      strokeOpacity={c.strokeOpacity}
                    />
                    <text
                      x="100"
                      y="48"
                      textAnchor="middle"
                      fill="#fafafa"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      NEURO
                    </text>
                  </g>
                );
              })()}

              {/* 2. CHEST / CARDIOVASCULAR */}
              {(() => {
                const c = getRegionColor('chest');
                const isSelected = selectedRegionId === 'chest';
                return (
                  <g
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedRegionId('chest')}
                  >
                    <rect
                      x="66"
                      y="100"
                      width="68"
                      height="80"
                      rx="6"
                      fill={c.fill}
                      fillOpacity={isSelected ? 0.45 : c.fillOpacity}
                      stroke={c.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      strokeOpacity={c.strokeOpacity}
                    />
                    <text
                      x="100"
                      y="138"
                      textAnchor="middle"
                      fill="#fafafa"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      CARDIO / O₂
                    </text>
                    <text
                      x="100"
                      y="152"
                      textAnchor="middle"
                      fill="#a1a1aa"
                      fontSize="8"
                      fontFamily="monospace"
                    >
                      PULMONARY
                    </text>
                  </g>
                );
              })()}

              {/* 3. ABDOMEN / METABOLIC */}
              {(() => {
                const c = getRegionColor('abdomen');
                const isSelected = selectedRegionId === 'abdomen';
                return (
                  <g
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedRegionId('abdomen')}
                  >
                    <rect
                      x="68"
                      y="184"
                      width="64"
                      height="68"
                      rx="6"
                      fill={c.fill}
                      fillOpacity={isSelected ? 0.45 : c.fillOpacity}
                      stroke={c.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      strokeOpacity={c.strokeOpacity}
                    />
                    <text
                      x="100"
                      y="218"
                      textAnchor="middle"
                      fill="#fafafa"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      METABOLIC
                    </text>
                    <text
                      x="100"
                      y="232"
                      textAnchor="middle"
                      fill="#a1a1aa"
                      fontSize="8"
                      fontFamily="monospace"
                    >
                      GLUCOSE / FLUID
                    </text>
                  </g>
                );
              })()}

              {/* 4. LEFT ARM (BP Cuff) */}
              {(() => {
                const c = getRegionColor('leftArm');
                const isSelected = selectedRegionId === 'leftArm';
                return (
                  <g
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedRegionId('leftArm')}
                  >
                    <rect
                      x="30"
                      y="108"
                      width="26"
                      height="95"
                      rx="8"
                      fill={c.fill}
                      fillOpacity={isSelected ? 0.45 : c.fillOpacity}
                      stroke={c.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      strokeOpacity={c.strokeOpacity}
                    />
                    <text
                      x="43"
                      y="156"
                      textAnchor="middle"
                      fill="#fafafa"
                      fontSize="8"
                      fontFamily="monospace"
                      transform="rotate(-90 43 156)"
                    >
                      BP CUFF
                    </text>
                  </g>
                );
              })()}

              {/* 5. RIGHT ARM (Pulse Ox) */}
              {(() => {
                const c = getRegionColor('rightArm');
                const isSelected = selectedRegionId === 'rightArm';
                return (
                  <g
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedRegionId('rightArm')}
                  >
                    <rect
                      x="144"
                      y="108"
                      width="26"
                      height="95"
                      rx="8"
                      fill={c.fill}
                      fillOpacity={isSelected ? 0.45 : c.fillOpacity}
                      stroke={c.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      strokeOpacity={c.strokeOpacity}
                    />
                    <text
                      x="157"
                      y="156"
                      textAnchor="middle"
                      fill="#fafafa"
                      fontSize="8"
                      fontFamily="monospace"
                      transform="rotate(90 157 156)"
                    >
                      PULSE OX
                    </text>
                  </g>
                );
              })()}

              {/* 6. LEGS (Musculoskeletal) */}
              {(() => {
                const c = getRegionColor('legs');
                const isSelected = selectedRegionId === 'legs';
                return (
                  <g
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedRegionId('legs')}
                  >
                    <rect
                      x="68"
                      y="262"
                      width="26"
                      height="165"
                      rx="5"
                      fill={c.fill}
                      fillOpacity={isSelected ? 0.45 : c.fillOpacity}
                      stroke={c.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      strokeOpacity={c.strokeOpacity}
                    />
                    <rect
                      x="106"
                      y="262"
                      width="26"
                      height="165"
                      rx="5"
                      fill={c.fill}
                      fillOpacity={isSelected ? 0.45 : c.fillOpacity}
                      stroke={c.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      strokeOpacity={c.strokeOpacity}
                    />
                    <text
                      x="100"
                      y="335"
                      textAnchor="middle"
                      fill="#fafafa"
                      fontSize="8"
                      fontFamily="monospace"
                    >
                      BONE & MUSCLE
                    </text>
                    <text
                      x="100"
                      y="348"
                      textAnchor="middle"
                      fill="#a1a1aa"
                      fontSize="7"
                      fontFamily="monospace"
                    >
                      ARED PROTOCOL
                    </text>
                  </g>
                );
              })()}

              {/* 7. RADIATION DOSIMETER BADGE */}
              {(() => {
                const c = getRegionColor('radiationBadge');
                const isSelected = selectedRegionId === 'radiationBadge';
                return (
                  <g
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedRegionId('radiationBadge')}
                  >
                    <circle
                      cx="148"
                      cy="44"
                      r="16"
                      fill={c.fill}
                      fillOpacity={isSelected ? 0.5 : 0.25}
                      stroke={c.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      strokeOpacity={c.strokeOpacity}
                    />
                    <text
                      x="148"
                      y="42"
                      textAnchor="middle"
                      fill="#fafafa"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      ⚡
                    </text>
                    <text
                      x="148"
                      y="52"
                      textAnchor="middle"
                      fill="#a1a1aa"
                      fontSize="7"
                      fontFamily="monospace"
                    >
                      RAD
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-zinc-400 mt-6 pt-4 border-t border-zinc-800 w-full">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span>Normal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Caution</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
              <span>No Telemetry</span>
            </div>
          </div>

          {/* Quick Region Selector Buttons */}
          <div className="flex flex-wrap gap-1.5 mt-4 w-full">
            {REGIONS.map((r) => {
              const active = selectedRegionId === r.id;
              const status = regionStatuses[r.id];
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRegionId(r.id)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
                    active
                      ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-semibold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                      status === 'critical'
                        ? 'bg-red-500'
                        : status === 'warn'
                        ? 'bg-amber-500'
                        : status === 'normal'
                        ? 'bg-green-500'
                        : 'bg-zinc-600'
                    }`}
                  />
                  {r.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Clinical Detail Panel */}
        <div className="lg:col-span-6 rounded-lg bg-zinc-900 border border-zinc-800 p-6 space-y-6">
          <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
            <div>
              <div className="text-xs font-mono text-blue-400 uppercase tracking-wider">
                Anatomical System Telemetry
              </div>
              <h2 className="text-lg font-bold text-zinc-50 mt-0.5">{selectedRegion.name}</h2>
              <p className="text-xs text-zinc-400 mt-1">{selectedRegion.subtitle}</p>
            </div>
            <StatusBadge status={regionStatuses[selectedRegion.id]} />
          </div>

          {/* Clinical Focus Context */}
          <div className="p-3.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs">
            <span className="font-semibold text-zinc-300 block mb-1">
              Microgravity Clinical Rationale:
            </span>
            <p className="text-zinc-400 leading-relaxed">{selectedRegion.clinicalFocus}</p>
          </div>

          {/* Associated Metrics List */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              Active Physiological Indicators ({selectedRegion.metrics.length})
            </h3>

            {selectedRegion.metrics.map((mKey) => {
              const cfg = METRICS_CONFIG[mKey];
              if (!cfg) return null;
              const reading = latestReadings[mKey];
              const status = reading ? getMetricStatus(mKey, reading.value) : 'unknown';

              let guidanceText = cfg.guidance?.normal || '';
              if (reading) {
                const val = parseFloat(reading.value);
                if (val < cfg.normal[0] && cfg.guidance?.low) guidanceText = cfg.guidance.low;
                else if (val > cfg.normal[1] && cfg.guidance?.high) guidanceText = cfg.guidance.high;
              }

              return (
                <div
                  key={mKey}
                  className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base text-zinc-300 font-mono">{cfg.icon}</span>
                      <span className="text-sm font-semibold text-zinc-100">{cfg.label}</span>
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      {reading ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-bold font-mono text-zinc-50">
                            {reading.value}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono">{cfg.unit}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500">No recorded telemetry</span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Nominal: {cfg.normal[0]}–{cfg.normal[1]} {cfg.unit}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-400 border-t border-zinc-800/60 pt-2 space-y-1">
                    <p className="text-[11px] text-zinc-500">
                      <span className="font-semibold text-zinc-400">Space Adaptation: </span>
                      {cfg.spaceEffect}
                    </p>
                    {guidanceText && (
                      <p className="text-[11px] text-blue-400/90 pt-1">
                        <span className="font-semibold text-blue-300">Action Protocol: </span>
                        {guidanceText}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-between">
            <Link
              href="/log"
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>Record New Vitals for this Region</span>
              <span>→</span>
            </Link>
            <Link
              href="/guidance"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors underline"
            >
              Medical Guidelines
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
