import React from 'react';

const TIERS = {
  Titanium: {
    bg: 'bg-gradient-to-r from-slate-600 to-slate-800',
    color: 'text-white',
    icon: '💎'
  },
  Gold: {
    bg: 'bg-gradient-to-r from-amber-400 to-amber-600',
    color: 'text-white',
    icon: '🥇'
  },
  Silver: {
    bg: 'bg-gradient-to-r from-slate-200 to-slate-300',
    color: 'text-slate-800',
    icon: '🥈'
  }
};

export default function TierBadge({ tier = 'Silver', showIcon = true, size = 'md', className = '' }) {
  const config = TIERS[tier] || TIERS.Silver;
  
  const sizeClasses = ({
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-5 py-2 text-sm'
  }[size]) || 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold shadow-sm ${config.bg} ${config.color} ${sizeClasses} ${className}`}>
      {showIcon && <span>{config.icon}</span>}
      {tier}
    </span>
  );
}
