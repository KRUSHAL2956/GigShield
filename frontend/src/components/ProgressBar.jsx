import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressBar({ label, used, cap, valueText, color = 'bg-indigo-500' }) {
  const nUsed = Number(used) || 0;
  const nCap = Number(cap) || 0;
  const pct = nCap > 0 ? Math.min((nUsed / nCap) * 100, 100) : 0;
  const displayValue = valueText || `₹${nUsed.toLocaleString()} / ₹${nCap.toLocaleString()}`;

  return (
    <div>
      <div className="flex justify-between items-end text-sm mb-1.5">
        <span className="text-ink-muted font-medium block">{label}</span>
        <span className="text-ink font-semibold">{displayValue}</span>
      </div>
      <div className="h-1.5 bg-surface-sunken rounded-full overflow-hidden">
        <motion.div 
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
}
