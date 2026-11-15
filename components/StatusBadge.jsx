import { STATUS_COLORS } from '@/lib/constants';

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_COLORS[status] || STATUS_COLORS.unknown;
  const cls = size === 'lg'
    ? 'px-3 py-1 text-sm'
    : 'px-2 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${cls} ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
