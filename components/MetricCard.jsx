import StatusBadge from './StatusBadge';
import { METRICS_CONFIG, getMetricStatus } from '@/lib/constants';

export default function MetricCard({ metricKey, reading, onClick }) {
  const cfg = METRICS_CONFIG[metricKey];
  if (!cfg) return null;
  const status = reading ? getMetricStatus(metricKey, reading.value) : 'unknown';
  const hasData = reading !== null && reading !== undefined;

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-zinc-400 text-xs uppercase tracking-wider">{cfg.label}</div>
        <StatusBadge status={status} />
      </div>
      <div className="flex items-baseline gap-1.5">
        {hasData ? (
          <>
            <span className="text-2xl font-semibold text-zinc-50">{reading.value}</span>
            <span className="text-sm text-zinc-500">{cfg.unit}</span>
          </>
        ) : (
          <span className="text-zinc-600 text-sm">No reading yet</span>
        )}
      </div>
      {hasData && (
        <div className="mt-2 text-xs text-zinc-500">
          {new Date(reading.timestamp).toLocaleString()}
        </div>
      )}
    </button>
  );
}
