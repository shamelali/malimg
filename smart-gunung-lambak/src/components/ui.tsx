import type { ReactNode } from 'react';

export function StatCard({
  label,
  value,
  sub,
  tone = 'blue',
  onClick
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'teal' | 'slate';
  onClick?: () => void;
}) {
  const tones: Record<string, string> = {
    blue: 'from-blue-50 to-white dark:from-[#13302b] dark:to-[#1a3d37]',
    green: 'from-emerald-50 to-white dark:from-[#13302b] dark:to-[#1a3d37]',
    amber: 'from-amber-50 to-white dark:from-[#2a2817] dark:to-[#1a3d37]',
    red: 'from-red-50 to-white dark:from-[#3a1d1d] dark:to-[#1a3d37]',
    teal: 'from-teal-50 to-white dark:from-[#123735] dark:to-[#1a3d37]',
    slate: 'from-slate-50 to-white dark:from-[#13302b] dark:to-[#1a3d37]'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`card bg-gradient-to-br ${tones[tone]} p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-emerald-100/70">{label}</div>
      <div className="mt-1 text-2xl font-black text-brand-600 dark:text-teal-400">{value}</div>
      {sub ? <div className="mt-1 text-[11px] font-medium text-slate-600 dark:text-emerald-50/70">{sub}</div> : null}
    </button>
  );
}

export function ProgressBar({ value, tone = 'brand' }: { value: number; tone?: 'brand' | 'green' | 'amber' | 'red' }) {
  const colors = {
    brand: 'linear-gradient(90deg,#004AAD,#22C0C7)',
    green: 'linear-gradient(90deg,#16A34A,#22C0C7)',
    amber: 'linear-gradient(90deg,#D97706,#FFD23F)',
    red: 'linear-gradient(90deg,#DC2626,#F97316)'
  };

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-forest-500">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: colors[tone] }} />
    </div>
  );
}

export function Pill({ children, tone = 'slate' }: { children: ReactNode; tone?: 'blue' | 'green' | 'amber' | 'red' | 'teal' | 'slate' | 'yellow' }) {
  const tones = {
    blue: 'border-blue-200 bg-blue-100 text-blue-800 dark:border-teal-400/30 dark:bg-forest-800 dark:text-teal-300',
    green: 'border-green-200 bg-green-100 text-green-800 dark:border-teal-400/30 dark:bg-forest-800 dark:text-emerald-300',
    amber: 'border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-300/30 dark:bg-[#2a2817] dark:text-amber-200',
    red: 'border-red-200 bg-red-100 text-red-900 dark:border-red-300/30 dark:bg-[#3a1d1d] dark:text-red-200',
    teal: 'border-teal-200 bg-teal-100 text-teal-900 dark:border-teal-400/30 dark:bg-forest-800 dark:text-teal-300',
    yellow: 'border-yellow-300 bg-yellow-100 text-yellow-900',
    slate: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-forest-500 dark:bg-forest-800 dark:text-emerald-50/80'
  };

  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}

export function SectionTitle({ title, subtitle, action }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-black tracking-tight md:text-lg">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-emerald-50/70">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
