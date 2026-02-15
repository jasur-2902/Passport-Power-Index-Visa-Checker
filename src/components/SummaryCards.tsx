import { useMemo, useState, useEffect, useRef } from 'react';
import { Plane, ShieldCheck, Globe, Calendar } from 'lucide-react';
import { type GroupResult } from '../data/visaUtils';

interface Props {
  results: GroupResult[];
}

export default function SummaryCards({ results }: Props) {
  const stats = useMemo(() => {
    let visaFree = 0, easyAccess = 0, maxDays = 0;
    const total = results.length;
    results.forEach(r => {
      if (r.category === 'visa-free') { visaFree++; easyAccess++; }
      else if (['eta', 'e-visa', 'visa-on-arrival'].includes(r.category)) easyAccess++;
      if (r.days && r.days > maxDays) maxDays = r.days;
    });
    return { visaFree, easyAccess, total, maxDays };
  }, [results]);

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
      role="region"
      aria-label="Travel access summary"
    >
      <StatCard
        icon={<Plane className="w-[18px] h-[18px]" />}
        label="Visa Free"
        value={stats.visaFree}
        color="emerald"
      />
      <StatCard
        icon={<ShieldCheck className="w-[18px] h-[18px]" />}
        label="Easy Access"
        value={stats.easyAccess}
        color="blue"
        tooltip="Includes visa-free, ETA, e-visa, and visa on arrival"
      />
      <StatCard
        icon={<Globe className="w-[18px] h-[18px]" />}
        label="Total"
        value={stats.total}
        color="violet"
      />
      <StatCard
        icon={<Calendar className="w-[18px] h-[18px]" />}
        label="Longest Stay"
        value={stats.maxDays > 0 ? stats.maxDays : 0}
        suffix={stats.maxDays > 0 ? 'd' : undefined}
        displayValue={stats.maxDays > 0 ? undefined : '--'}
        color="amber"
        tooltip="Maximum visa-free stay duration across all destinations"
      />
    </div>
  );
}

function useAnimatedCounter(target: number, duration = 600): number {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const from = prevTarget.current;
    prevTarget.current = target;

    const startTime = performance.now();
    let raf: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + (target - from) * eased));

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return count;
}

function StatCard({
  icon,
  label,
  value,
  color,
  tooltip,
  suffix,
  displayValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'emerald' | 'blue' | 'violet' | 'amber';
  tooltip?: string;
  suffix?: string;
  displayValue?: string;
}) {
  const animatedValue = useAnimatedCounter(value);

  const colorMap = {
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: 'bg-emerald-500', text: 'text-emerald-500' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', icon: 'bg-blue-500', text: 'text-blue-500' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-500/10', icon: 'bg-violet-500', text: 'text-violet-500' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-500/10', icon: 'bg-amber-500', text: 'text-amber-500' },
  };
  const c = colorMap[color];

  return (
    <div className={`${c.bg} rounded-2xl p-4 border border-white/60 dark:border-white/10 ${tooltip ? 'tooltip-container' : ''}`}>
      <div className={`w-8 h-8 rounded-xl ${c.icon} flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight tabular-nums">
        {displayValue ?? `${animatedValue}${suffix ?? ''}`}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
      {tooltip && <span className="tooltip-text">{tooltip}</span>}
    </div>
  );
}
