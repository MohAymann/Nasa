'use client';
import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { METRICS_CONFIG, getMetricStatus, STATUS_COLORS } from '@/lib/constants';
import StatusBadge from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';

const QUICK_LOG_METRICS = ['heartRate', 'systolicBP', 'diastolicBP', 'spO2', 'bodyTemp'];

function getGuidance(cfg, status, value) {
  if (!cfg?.guidance) return '';
  const v = parseFloat(value);
  const [nLow, nHigh] = cfg.normal;
  if (status === 'normal') return cfg.guidance.normal || '';
  if (v < nLow) return cfg.guidance.low || cfg.guidance.normal || '';
  if (v > nHigh) return cfg.guidance.high || cfg.guidance.normal || '';
  return cfg.guidance.normal || '';
}

const FEEDBACK_STYLES = {
  normal: 'bg-green-500/10 border border-green-500/30 text-green-400',
  warn:   'bg-amber-500/10 border border-amber-500/30 text-amber-400',
  critical: 'bg-red-500/10 border border-red-500/30 text-red-400',
  unknown: 'bg-zinc-800 border border-zinc-700 text-zinc-400',
};

export default function LogVitalsPage() {
  const { state, dispatch } = useStore();

  const [selectedMetric, setSelectedMetric] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [lastResult, setLastResult] = useState(null); // { status, guidance, value, metric }
  // Local delete set — IDs to hide
  const [deletedIds, setDeletedIds] = useState(new Set());

  const cfg = selectedMetric ? METRICS_CONFIG[selectedMetric] : null;

  // Last 20 readings, filtered for local deletes, most-recent first
  const visibleReadings = useMemo(() => {
    return state.readings
      .filter(r => !deletedIds.has(r.id))
      .slice(0, 20);
  }, [state.readings, deletedIds]);

  function selectMetric(key) {
    setSelectedMetric(key);
    setInputValue('');
    setNotes('');
    setError('');
    setLastResult(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const raw = inputValue.trim();
    if (!raw) { setError('Please enter a value.'); return; }
    const val = parseFloat(raw);
    if (isNaN(val) || val < 0) { setError('Value must be a positive number.'); return; }

    const status = getMetricStatus(selectedMetric, val);
    const guidance = getGuidance(cfg, status, val);

    dispatch({ type: 'ADD_READING', payload: { metric: selectedMetric, value: val, notes: notes.trim() } });

    if (status === 'warn' || status === 'critical') {
      dispatch({
        type: 'ADD_ALERT',
        payload: { metric: selectedMetric, value: val, status, message: guidance },
      });
    }

    setLastResult({ status, guidance, value: val, metric: selectedMetric });
    setInputValue('');
    setNotes('');
  }

  function handleDelete(id) {
    setDeletedIds(prev => new Set([...prev, id]));
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Log Vitals"
          subtitle="Record your health readings and track trends over time"
        />

        {/* Quick-log shortcuts */}
        <div className="mb-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-medium">Quick Log</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_LOG_METRICS.map(key => {
              const m = METRICS_CONFIG[key];
              return (
                <button
                  key={key}
                  onClick={() => selectMetric(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors
                    ${selectedMetric === key
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
                    }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Two-column layout: selector + form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Metric Selector */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3 font-medium">Select Metric</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(METRICS_CONFIG).map(([key, m]) => (
                <button
                  key={key}
                  onClick={() => selectMetric(key)}
                  className={`flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-lg border transition-colors text-left
                    ${selectedMetric === key
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{m.icon}</span>
                    <span className="text-xs font-medium leading-tight">{m.label}</span>
                  </div>
                  <span className={`text-xs ${selectedMetric === key ? 'text-blue-200' : 'text-zinc-500'}`}>
                    {m.unit}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col">
            {!selectedMetric ? (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <div className="text-3xl mb-2 text-zinc-600">◎</div>
                  <p className="text-zinc-500 text-sm">Select a metric to log a reading</p>
                </div>
              </div>
            ) : (
              <>
                {/* Metric info */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{cfg.icon}</span>
                    <h2 className="text-base font-semibold text-zinc-50">{cfg.label}</h2>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-2">{cfg.description}</p>
                  <div className="flex gap-3 text-xs">
                    <span className="text-zinc-500">Normal range:</span>
                    <span className="text-green-400 font-medium">
                      {cfg.normal[0]} – {cfg.normal[1]} {cfg.unit}
                    </span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Value</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={inputValue}
                        onChange={e => { setInputValue(e.target.value); setError(''); setLastResult(null); }}
                        placeholder="0.0"
                        step="any"
                        className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-50 text-sm
                          placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30
                          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-zinc-400 text-sm font-medium min-w-[40px]">{cfg.unit}</span>
                    </div>
                    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Notes <span className="text-zinc-600">(optional, max 200 chars)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value.slice(0, 200))}
                      placeholder="Any relevant context..."
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-50 text-sm
                        placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30
                        resize-none"
                    />
                    <p className="text-zinc-600 text-xs text-right mt-0.5">{notes.length}/200</p>
                  </div>

                  <button
                    type="submit"
                    className="mt-auto w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm
                      py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    Log Reading
                  </button>
                </form>

                {/* Immediate feedback */}
                {lastResult && lastResult.metric === selectedMetric && (
                  <div className={`mt-3 rounded-lg p-3 ${FEEDBACK_STYLES[lastResult.status] || FEEDBACK_STYLES.unknown}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <StatusBadge status={lastResult.status} />
                      <span className="text-xs font-medium">
                        {lastResult.value} {METRICS_CONFIG[lastResult.metric]?.unit} logged
                      </span>
                    </div>
                    {lastResult.guidance && (
                      <p className="text-xs leading-relaxed opacity-90">{lastResult.guidance}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Recent Readings Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-50">Recent Readings</h2>
            <span className="text-xs text-zinc-500">{visibleReadings.length} shown (last 20)</span>
          </div>

          {visibleReadings.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-3xl text-zinc-700 mb-2">◎</div>
              <p className="text-zinc-500 text-sm">No readings logged yet.</p>
              <p className="text-zinc-600 text-xs mt-1">Select a metric above to log your first reading.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-xs text-zinc-500 font-medium px-4 py-2">Metric</th>
                    <th className="text-left text-xs text-zinc-500 font-medium px-4 py-2">Value</th>
                    <th className="text-left text-xs text-zinc-500 font-medium px-4 py-2">Status</th>
                    <th className="text-left text-xs text-zinc-500 font-medium px-4 py-2">Date / Time</th>
                    <th className="text-left text-xs text-zinc-500 font-medium px-4 py-2">Notes</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleReadings.map((r, i) => {
                    const metricCfg = METRICS_CONFIG[r.metric];
                    const status = getMetricStatus(r.metric, r.value);
                    const statusCfg = STATUS_COLORS[status] || STATUS_COLORS.unknown;
                    const rowBg = i % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-950';
                    return (
                      <tr key={r.id} className={`${rowBg} border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors`}>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{metricCfg?.icon ?? '?'}</span>
                            <span className="text-zinc-200 font-medium text-xs">{metricCfg?.label ?? r.metric}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`font-semibold ${statusCfg.text}`}>
                            {r.value}
                          </span>
                          <span className="text-zinc-500 text-xs ml-1">{metricCfg?.unit}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-4 py-2.5 text-zinc-400 text-xs whitespace-nowrap">
                          {new Date(r.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-400 text-xs max-w-[180px] truncate">
                          {r.notes || <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          <button
                            onClick={() => handleDelete(r.id)}
                            title="Remove from view"
                            className="text-zinc-600 hover:text-red-400 text-sm transition-colors leading-none"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
