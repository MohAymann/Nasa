"use client";

import { useState } from "react";
import { DAYS, ENVS, REGIONS, STATUS, fmt, statusOf, valueAt, worst } from "../data";

const BADGE = {
  ok: "bg-teal-400/15 text-teal-200 ring-teal-300/30",
  watch: "bg-amber-400/15 text-amber-200 ring-amber-300/30",
  alert: "bg-red-400/15 text-red-200 ring-red-300/40",
};

function Badge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${BADGE[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS[status].hex }} />
      {STATUS[status].label}
    </span>
  );
}

/* ---------- Body map ---------- */

function BodyMap({ statuses, selected, onSelect }) {
  const shapes = {
    head: <ellipse cx="120" cy="58" rx="30" ry="37" />,
    chest: <rect x="80" y="110" width="80" height="92" rx="26" />,
    core: <rect x="86" y="206" width="68" height="78" rx="22" />,
    arms: (
      <>
        <rect x="42" y="114" width="28" height="158" rx="14" />
        <rect x="170" y="114" width="28" height="158" rx="14" />
      </>
    ),
    legs: (
      <>
        <rect x="88" y="290" width="31" height="190" rx="15" />
        <rect x="121" y="290" width="31" height="190" rx="15" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 240 500" className="mx-auto h-auto w-full max-w-[260px]" role="group" aria-label="Clickable body map">
      <defs>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <rect x="106" y="92" width="28" height="22" rx="8" fill="#ffffff" opacity="0.06" />
      {REGIONS.map((r) => {
        const hex = STATUS[statuses[r.id]].hex;
        const isSel = selected === r.id;
        return (
          <g
            key={r.id}
            onClick={() => onSelect(r.id)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(r.id))}
            tabIndex={0}
            role="button"
            aria-label={`${r.name}: ${STATUS[statuses[r.id]].label}`}
            aria-pressed={isSel}
            className="region cursor-pointer outline-none"
            style={{ color: hex }}
          >
            <title>{r.name}</title>
            <g fill={hex} opacity={isSel ? 0.55 : 0.28} filter="url(#glow)" className={statuses[r.id] === "alert" ? "pulse" : ""}>
              {shapes[r.id]}
            </g>
            <g
              fill={hex}
              fillOpacity={isSel ? 0.32 : 0.14}
              stroke={hex}
              strokeWidth={isSel ? 2.5 : 1.25}
              strokeOpacity={isSel ? 1 : 0.7}
              className="region-shape"
            >
              {shapes[r.id]}
            </g>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Trend chart ---------- */

function TrendChart({ metric, env, day, color }) {
  const W = 640, H = 210, L = 46, R = 16, T = 14, B = 28;
  const pts = Array.from({ length: DAYS }, (_, i) => valueAt(metric, env, i + 1));
  const lo0 = Math.min(...pts, metric.warn, metric.alert);
  const hi0 = Math.max(...pts, metric.warn, metric.alert);
  const pad = (hi0 - lo0) * 0.14 || 1;
  const lo = lo0 - pad, hi = hi0 + pad;
  const x = (d) => L + ((d - 1) / (DAYS - 1)) * (W - L - R);
  const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const path = (upto) => pts.slice(0, upto).map((v, i) => `${i ? "L" : "M"}${x(i + 1).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const dangerTop = metric.dir === "up" ? T : y(metric.alert);
  const dangerH = metric.dir === "up" ? y(metric.alert) - T : H - B - y(metric.alert);
  const cur = pts[day - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${metric.label} over ${DAYS} mission days`}>
      <rect x={L} y={dangerTop} width={W - L - R} height={Math.max(dangerH, 0)} fill="#ff6b5e" opacity="0.08" />
      {[
        [metric.warn, "Watch", "#f5b544"],
        [metric.alert, "Act now", "#ff6b5e"],
      ].map(([v, label, c]) => (
        <g key={label}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={c} strokeDasharray="5 5" opacity="0.7" />
          <text x={W - R - 4} y={y(v) - 5} textAnchor="end" fontSize="11" fill={c}>{label}</text>
        </g>
      ))}
      {[lo0, (lo0 + hi0) / 2, hi0].map((v, i) => (
        <text key={i} x={L - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#9aa3d4">{fmt(v, metric.dec)}</text>
      ))}
      {[1, 30, 60, 90].map((d) => (
        <text key={d} x={x(d)} y={H - 8} textAnchor="middle" fontSize="11" fill="#9aa3d4">Day {d}</text>
      ))}
      <path d={path(DAYS)} fill="none" stroke="#9aa3d4" strokeOpacity="0.35" strokeWidth="2" />
      <path d={path(day)} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <line x1={x(day)} x2={x(day)} y1={T} y2={H - B} stroke="#ffffff" strokeOpacity="0.25" />
      <circle cx={x(day)} cy={y(cur)} r="6" fill={color} stroke="#0f1535" strokeWidth="3" />
    </svg>
  );
}

/* ---------- Page ---------- */

export default function Dashboard() {
  const [env, setEnv] = useState("mars");
  const [day, setDay] = useState(72);
  const [selected, setSelected] = useState("head");
  const [metricIdx, setMetricIdx] = useState(0);
  const [flagged, setFlagged] = useState({});

  const reading = (m) => {
    const v = valueAt(m, env, day);
    return { v, s: statusOf(m, v) };
  };
  const statuses = Object.fromEntries(REGIONS.map((r) => [r.id, worst(r.metrics.map((m) => reading(m).s))]));
  const overall = worst(Object.values(statuses));
  const region = REGIONS.find((r) => r.id === selected);
  const metric = region.metrics[metricIdx] ?? region.metrics[0];
  const color = STATUS[statuses[region.id]].hex;
  const e = ENVS[env];

  const issues = REGIONS.flatMap((r) =>
    r.metrics.map((m) => ({ r, m, ...reading(m) })).filter((x) => x.s !== "ok")
  ).sort((a, b) => (a.s === b.s ? 0 : a.s === "alert" ? -1 : 1));

  const pick = (id) => {
    setSelected(id);
    setMetricIdx(0);
  };

  return (
    <div className="space-bg min-h-screen px-4 pb-10 pt-6 sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Astronaut Health Twin</h1>
            <p className="mt-1 max-w-xl text-indigo-200/80">
              Tap a part of the body to check how it is doing, what to do about it, and when to call the ground.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm text-indigo-200/80">Crew status</div>
            <Badge status={overall} />
          </div>
        </header>

        {/* Controls */}
        <section className="panel mt-6 grid gap-5 p-4 sm:p-5 md:grid-cols-[auto_1fr] md:items-center">
          <div role="tablist" aria-label="Mission environment" className="flex flex-wrap gap-2">
            {Object.entries(ENVS).map(([k, v]) => (
              <button
                key={k}
                role="tab"
                aria-selected={env === k}
                onClick={() => setEnv(k)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  env === k ? "bg-indigo-100 text-indigo-950" : "bg-white/5 text-indigo-100 hover:bg-white/10"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
          <div>
            <label htmlFor="day" className="flex items-baseline justify-between text-sm text-indigo-100">
              <span>Mission day</span>
              <span className="tabular-nums text-indigo-200/80">{day} of {DAYS}</span>
            </label>
            <input id="day" type="range" min="1" max={DAYS} value={day} onChange={(ev) => setDay(Number(ev.target.value))} className="mt-2 w-full" />
          </div>
          <p className="text-sm text-indigo-200/80 md:col-span-2">
            <span className="font-medium text-indigo-100">{e.gravity}</span>, {e.comms.toLowerCase()}. {e.note}
          </p>
        </section>

        {/* Body + detail */}
        <main className="mt-5 grid gap-5 lg:grid-cols-[340px_1fr]">
          <section className="panel p-5">
            <BodyMap statuses={statuses} selected={selected} onSelect={pick} />
            <ul className="mt-4 grid gap-1.5">
              {REGIONS.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => pick(r.id)}
                    aria-pressed={selected === r.id}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                      selected === r.id ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                  >
                    <span>{r.name}</span>
                    <Badge status={statuses[r.id]} />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel p-5 sm:p-6" aria-live="polite">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">{region.name}</h2>
                <p className="mt-1 max-w-2xl text-indigo-200/85">{region.function}</p>
              </div>
              <Badge status={statuses[region.id]} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {region.metrics.map((m, i) => {
                const { v, s } = reading(m);
                return (
                  <button
                    key={m.id}
                    onClick={() => setMetricIdx(i)}
                    aria-pressed={metricIdx === i}
                    className={`rounded-2xl p-4 text-left ring-1 transition-colors ${
                      metricIdx === i ? "bg-white/10 ring-white/30" : "bg-white/[0.03] ring-white/10 hover:bg-white/[0.07]"
                    }`}
                  >
                    <div className="text-sm text-indigo-200/85">{m.label}</div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-3xl font-semibold tabular-nums" style={{ color: STATUS[s].hex }}>{fmt(v, m.dec)}</span>
                      <span className="text-sm text-indigo-200/70">{m.unit}</span>
                    </div>
                    <div className="mt-1 text-xs text-indigo-200/65">Healthy range: {m.normal}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
              <div className="mb-1 flex items-baseline justify-between">
                <h3 className="font-medium">{metric.label} over the mission</h3>
                <span className="text-xs text-indigo-200/65">{e.name}</span>
              </div>
              <TrendChart metric={metric} env={env} day={day} color={color} />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div>
                <h3 className="font-medium">Why this changes in space</h3>
                <p className="mt-1.5 text-sm leading-6 text-indigo-200/85">{region.why}</p>
              </div>
              <div>
                <h3 className="font-medium">What to do</h3>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-6 text-indigo-200/85">
                  {region.actions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium">Call the ground if</h3>
                <p className="mt-1.5 text-sm leading-6 text-indigo-200/85">{region.escalate}</p>
              </div>
            </div>
          </section>
        </main>

        {/* Alerts */}
        <section className="panel mt-5 p-5 sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight">Needs attention on day {day}</h2>
          {issues.length === 0 ? (
            <p className="mt-2 text-indigo-200/85">Everything is in the healthy range. Keep up the daily checks.</p>
          ) : (
            <ul className="mt-3 divide-y divide-white/10">
              {issues.map(({ r, m, v, s }) => {
                const key = `${r.id}-${m.id}`;
                return (
                  <li key={key} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <button onClick={() => (pick(r.id), setMetricIdx(r.metrics.indexOf(m)))} className="flex items-center gap-3 text-left">
                      <Badge status={s} />
                      <span>
                        <span className="font-medium">{m.label}</span>
                        <span className="text-indigo-200/80">
                          {" "}is {fmt(v, m.dec)} {m.unit} in {r.name.toLowerCase()}
                        </span>
                      </span>
                    </button>
                    {s === "alert" ? (
                      <button
                        onClick={() => setFlagged((f) => ({ ...f, [key]: !f[key] }))}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                          flagged[key] ? "bg-teal-300 text-teal-950" : "bg-red-300 text-red-950 hover:bg-red-200"
                        }`}
                      >
                        {flagged[key] ? "Flight surgeon notified" : "Notify flight surgeon"}
                      </button>
                    ) : (
                      <span className="text-sm text-indigo-200/70">Follow the steps for this area</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <footer className="mt-6 text-center text-xs text-indigo-200/60">
          NASA Space Apps Challenge 2026 prototype. Simulated data, not a medical device or a diagnosis.
        </footer>
      </div>
    </div>
  );
}
