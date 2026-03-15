import React from 'react';

export default function StatCard({ icon: Icon, label, value, sub, accent = 'indigo' }) {
  const styles = {
    coral: { bg: 'bg-coral-soft', fg: 'text-coral' },
    indigo: { bg: 'bg-indigo-soft', fg: 'text-indigo' },
    teal: { bg: 'bg-teal-soft', fg: 'text-teal' },
    amber: { bg: 'bg-amber-soft', fg: 'text-amber' },
  }[accent] || { bg: 'bg-indigo-soft', fg: 'text-indigo' };

  return (
    <div className="card p-5 transition-all duration-300 hover:shadow-card hover:-translate-y-[2px]">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${styles.bg} flex items-center justify-center`}>
          {Icon && <Icon className={`w-[18px] h-[18px] ${styles.fg}`} strokeWidth={2} />}
        </div>
      </div>
      <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-display font-bold text-ink mt-0.5">{value}</p>
      {sub && <p className="text-xs text-ink-muted mt-1">{sub}</p>}
    </div>
  );
}
