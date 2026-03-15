import React from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Sun, Wind, Flame, AlertTriangle } from 'lucide-react';
import Card from './Card';

const ICONS = {
  rain: CloudRain,
  heat: Sun,
  wind: Wind,
  pollution: Flame,
  flood: AlertTriangle,
};

const COLORS = {
  HIGH: { bg: 'bg-coral-soft', border: 'border-coral/20', iconBg: 'bg-coral/10', icon: 'text-coral', text: 'text-coral' },
  MODERATE: { bg: 'bg-amber-soft', border: 'border-amber/20', iconBg: 'bg-amber/10', icon: 'text-amber', text: 'text-amber' },
  LOW: { bg: 'bg-teal-soft', border: 'border-teal/20', iconBg: 'bg-teal/10', icon: 'text-teal', text: 'text-teal' },
};

export default function WeatherWidget({ city, status, level = 'LOW', detail, payout, type = 'rain' }) {
  const Icon = ICONS[type] || CloudRain;
  const theme = COLORS[level] || COLORS.LOW;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-[var(--radius)] ${theme.bg} border ${theme.border} p-4 flex items-start gap-3.5`}
    >
      <div className={`w-10 h-10 rounded-lg ${theme.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon className={`w-5 h-5 ${theme.icon}`} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`badge bg-white/50 ${theme.text}`}>{level} RISK</span>
          <span className="text-xs text-ink-muted">{city}</span>
        </div>
        <p className="text-sm font-semibold text-ink mt-1">{status}</p>
        <p className="text-sm text-ink-muted mt-0.5">{detail}</p>
        {payout && (
          <p className="text-xs text-teal font-semibold mt-2">
            If triggered → ~₹{payout} auto payout
          </p>
        )}
      </div>
    </motion.div>
  );
}
