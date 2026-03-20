import React from 'react';

export default function StatCard({ icon: Icon, label, value, sub, accent = 'forest' }) {
  const styles = {
    coral: { bg: 'bg-red-50', fg: 'text-red-500' },
    forest: { bg: 'bg-forest/5', fg: 'text-forest' },
    mint: { bg: 'bg-mint/20', fg: 'text-forest' },
    teal: { bg: 'bg-emerald-50', fg: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', fg: 'text-amber-500' },
  }[accent] || { bg: 'bg-forest/5', fg: 'text-forest' };

  return (
    <div className="card-gigshield !p-5 transition-all duration-300 hover:shadow-card hover:-translate-y-[2px]">
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
