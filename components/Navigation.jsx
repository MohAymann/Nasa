'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore, useLatestReadings } from '@/lib/store';
import { METRICS_CONFIG, getMetricStatus, STATUS_COLORS } from '@/lib/constants';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '▤' },
  { href: '/log', label: 'Log Vitals', icon: '⊕' },
  { href: '/history', label: 'Trends', icon: '↗' },
  { href: '/bodymap', label: 'Body Map', icon: '◎' },
  { href: '/guidance', label: 'Protocols', icon: '✦' },
  { href: '/hazards', label: 'Hazards', icon: '⚡' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { state } = useStore();
  const latest = useLatestReadings(state);
  const unacknowledged = state.alerts.filter(a => !a.acknowledged).length;

  const worstStatus = Object.keys(latest).reduce((worst, key) => {
    const s = getMetricStatus(key, latest[key]?.value);
    if (s === 'critical') return 'critical';
    if (s === 'warn' && worst !== 'critical') return 'warn';
    return worst;
  }, 'normal');

  const statusColor = STATUS_COLORS[worstStatus] || STATUS_COLORS.normal;

  return (
    <nav className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800" style={{ width: 220, minWidth: 220 }}>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold">AH</div>
          <div>
            <div className="text-sm font-semibold text-zinc-50 leading-none">AstroHealth</div>
            <div className="text-xs text-zinc-500 mt-0.5">Mission Monitor</div>
          </div>
        </div>
      </div>

      {/* Mission Status */}
      <div className="px-5 py-3 border-b border-zinc-800">
        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Mission Status</div>
        <div className={`flex items-center gap-2 text-xs font-medium ${statusColor.text}`}>
          <span className={`w-2 h-2 rounded-full ${statusColor.dot}`} />
          {worstStatus === 'critical' ? 'Critical Alert' : worstStatus === 'warn' ? 'Caution' : 'All Systems Normal'}
        </div>
        <div className="text-xs text-zinc-500 mt-1">
          Day {state.astronaut.missionDay} · {state.astronaut.name}
        </div>
        {unacknowledged > 0 && (
          <div className="mt-2 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
            {unacknowledged} unreviewed alert{unacknowledged > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Nav Links */}
      <div className="flex-1 px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                active ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}>
              <span className="text-base w-4 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-zinc-800">
        <div className="text-xs text-zinc-600">NASA Space Apps Challenge 2026</div>
      </div>
    </nav>
  );
}
