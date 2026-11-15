'use client';
import { useState, useMemo } from 'react';
import { useStore, useMetricHistory } from '@/lib/store';
import { METRICS_CONFIG, getMetricStatus, STATUS_COLORS, BODY_SYSTEMS } from '@/lib/constants';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const TIME_RANGES = [
  { label: '7 Days', days: 7 },
  { label: '14 Days', days: 14 },
  { label: '30 Days', days: 30 },
  { label: 'All Time', days: 3650 },
];

function MetricTrendChart({ metricKey, days, state }) {
  const cfg = METRICS_CONFIG[metricKey];
  const history = useMetricHistory(state, metricKey, days);

  const chartData = useMemo(() => {
    return history.map((item) => {
      const d = new Date(item.timestamp);
      return {
        timestamp: item.timestamp,
        dateFormatted: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        timeFormatted: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        value: Number(item.value),
        notes: item.notes || '',
      };
    });
  }, [history]);

  const latest = history[history.length - 1];
  const latestStatus = latest ? getMetricStatus(metricKey, latest.value) : 'unknown';

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    const values = chartData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const first = values[0];
    const last = values[values.length - 1];
    let trend = '→';
    if (last > first * 1.03) trend = '↑';
    else if (last < first * 0.97) trend = '↓';

    return {
      min: min % 1 === 0 ? min : min.toFixed(1),
      max: max % 1 === 0 ? max : max.toFixed(1),
      avg: avg.toFixed(1),
      trend,
      count: values.length,
    };
  }, [chartData]);

  const lineColor =
    latestStatus === 'critical' ? '#ef4444' : latestStatus === 'warn' ? '#f59e0b' : '#22c55e';

  return (
    <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-5 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-sm font-mono">{cfg.icon}</span>
              <h3 className="text-sm font-semibold text-zinc-100">{cfg.label}</h3>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">{cfg.description}</p>
          </div>
          <StatusBadge status={latestStatus} />
        </div>

        {/* Latest Value readout */}
        <div className="flex items-baseline gap-2 mb-4">
          {latest ? (
            <>
              <span className="text-2xl font-bold font-mono text-zinc-50">{latest.value}</span>
              <span className="text-xs text-zinc-400 font-mono">{cfg.unit}</span>
              <span className="text-xs text-zinc-500 ml-auto">
                Normal: {cfg.normal[0]}–{cfg.normal[1]} {cfg.unit}
              </span>
            </>
          ) : (
            <span className="text-xs text-zinc-500">No telemetry recorded</span>
          )}
        </div>

        {/* Chart Container */}
        <div className="h-44 w-full pt-1">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="dateFormatted"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const s = getMetricStatus(metricKey, data.value);
                      return (
                        <div className="rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs shadow-lg">
                          <div className="text-zinc-400 font-mono">
                            {data.dateFormatted} {data.timeFormatted}
                          </div>
                          <div className="font-mono text-sm font-semibold text-zinc-100 mt-0.5">
                            {data.value} {cfg.unit}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                s === 'normal'
                                  ? 'bg-green-500'
                                  : s === 'warn'
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                            />
                            <span className="capitalize text-zinc-300">{s} range</span>
                          </div>
                          {data.notes && (
                            <div className="text-zinc-400 mt-1 italic text-[11px]">
                              &quot;{data.notes}&quot;
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Nominal Reference Thresholds */}
                <ReferenceLine
                  y={cfg.normal[0]}
                  stroke="#3f3f46"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                <ReferenceLine
                  y={cfg.normal[1]}
                  stroke="#3f3f46"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={lineColor}
                  strokeWidth={2}
                  dot={{ r: 3, fill: lineColor, stroke: '#18181b', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: lineColor }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-zinc-800 rounded-md">
              <span className="text-zinc-600 text-xs">No records within chosen timeframe</span>
              <Link
                href="/log"
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Log a reading →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Footer */}
      {stats && (
        <div className="mt-4 pt-3 border-t border-zinc-800 grid grid-cols-4 gap-2 text-center text-xs font-mono">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">Min</div>
            <div className="text-zinc-300 font-semibold">{stats.min}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">Max</div>
            <div className="text-zinc-300 font-semibold">{stats.max}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">Avg</div>
            <div className="text-zinc-300 font-semibold">{stats.avg}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">Trend</div>
            <div className="text-zinc-200 font-bold">{stats.trend}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const { state, dispatch } = useStore();
  const [selectedRange, setSelectedRange] = useState(7);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = useMemo(() => {
    return [
      { id: 'all', label: 'All Systems' },
      ...Object.entries(BODY_SYSTEMS).map(([key, sys]) => ({
        id: key,
        label: sys.label,
        metrics: sys.metrics,
      })),
    ];
  }, []);

  const visibleMetricKeys = useMemo(() => {
    if (activeCategory === 'all') {
      return Object.keys(METRICS_CONFIG);
    }
    const cat = BODY_SYSTEMS[activeCategory];
    return cat ? cat.metrics : [];
  }, [activeCategory]);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Physiological Trends & Historical Telemetry"
        subtitle="Long-term tracking of cardiovascular, respiratory, metabolic, and behavioral adaptations in microgravity."
        action={
          <Link
            href="/log"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
          >
            <span>⊕</span> Log Telemetry
          </Link>
        }
      />

      {/* Control Filters Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  active
                    ? 'bg-zinc-800 text-zinc-50 shadow-sm border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Time Window Selector */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-md border border-zinc-800">
          {TIME_RANGES.map((rng) => {
            const active = selectedRange === rng.days;
            return (
              <button
                key={rng.days}
                onClick={() => setSelectedRange(rng.days)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  active
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {rng.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleMetricKeys.map((key) => (
          <MetricTrendChart key={key} metricKey={key} days={selectedRange} state={state} />
        ))}
      </div>

      {/* Clinical Alerts Timeline */}
      <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-5 mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Clinical Alerts Timeline</h3>
            <p className="text-xs text-zinc-500">Historical caution and critical excursions</p>
          </div>
          {state.alerts.some((a) => !a.acknowledged) && (
            <button
              onClick={() => dispatch({ type: 'CLEAR_ALERTS' })}
              className="text-xs font-mono text-blue-400 hover:text-blue-300 underline"
            >
              Mark all reviewed
            </button>
          )}
        </div>

        {state.alerts.length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-500">
            No clinical alerts on record. All measured indicators have remained within bounds.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60 max-h-72 overflow-y-auto">
            {state.alerts.map((alert) => {
              const cfg = METRICS_CONFIG[alert.metric] || {};
              const isAck = alert.acknowledged;
              return (
                <div
                  key={alert.id}
                  className={`py-3 flex items-start justify-between gap-4 text-xs ${
                    isAck ? 'opacity-60' : 'opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 ${
                        alert.status === 'critical' ? 'bg-red-500' : 'bg-amber-500'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-200">
                          {cfg.label || alert.metric}: {alert.value} {cfg.unit || ''}
                        </span>
                        <StatusBadge status={alert.status} />
                        {isAck && (
                          <span className="text-[10px] text-zinc-500 border border-zinc-800 px-1.5 py-0.2 rounded font-mono">
                            Reviewed
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-xs mt-1">{alert.message}</p>
                    </div>
                  </div>
                  <div className="text-right whitespace-nowrap text-[11px] font-mono text-zinc-500">
                    {new Date(alert.timestamp).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
