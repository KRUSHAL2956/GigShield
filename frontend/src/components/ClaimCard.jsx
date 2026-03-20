import React from 'react';
import { CloudRain, CheckCircle, AlertCircle } from 'lucide-react';

export default function ClaimCard({ claim }) {
  const { date, type, amount, status } = claim;
  
  const isPaid = status === 'paid' || status === 'approved';
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-surface/50 transition-colors px-2 rounded-md">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPaid ? 'bg-mint/20' : 'bg-red-50'}`}>
          <CloudRain className={`w-5 h-5 ${isPaid ? 'text-forest' : 'text-red-500'}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-ink">{type}</p>
          <p className="text-xs text-ink-muted">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${isPaid ? 'text-forest' : 'text-ink-muted line-through'}`}>₹{amount}</p>
        <div className="flex items-center gap-1.5 justify-end mt-0.5">
          {isPaid ? (
            <CheckCircle className="w-3.5 h-3.5 text-mint" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className={`text-[11px] font-medium capitalize ${isPaid ? 'text-forest' : 'text-red-500'}`}>
            {status?.replaceAll('_', ' ') || ''}
          </span>
        </div>
      </div>
    </div>
  );
}
