import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function Timeline({ items = [] }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-10 bg-surface-sunken rounded-lg border border-dashed border-border mt-5">
        <p className="text-sm text-ink-muted">No activity to show</p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-surface-sunken ml-3 space-y-6 py-2">
      {items.map((item, index) => {
        let StatusIcon = Clock;
        let statusColor = 'text-amber';
        let statusBg = 'bg-amber-soft';

        const status = (item.status || 'pending').toLowerCase();

        if (status === 'paid' || status === 'approved' || status === 'processed') {
          StatusIcon = CheckCircle;
          statusColor = 'text-teal';
          statusBg = 'bg-teal-soft';
        } else if (status === 'fraud_blocked' || status === 'rejected' || status === 'failed') {
          StatusIcon = AlertCircle;
          statusColor = 'text-coral';
          statusBg = 'bg-coral-soft';
        }

        return (
          <div key={item.id || index} className="relative pl-6">
            {/* Timeline Dot */}
            <div className={`absolute -left-[13px] top-1 w-6 h-6 rounded-full border-4 border-white ${statusBg} flex items-center justify-center`}>
              <div className={`w-2 h-2 rounded-full ${statusColor.replace('text-', 'bg-')}`} />
            </div>

            <div className="bg-white border flex flex-col sm:flex-row sm:items-center justify-between border-border rounded-lg p-4 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="text-xs text-ink-muted mt-0.5">{item.date} • {item.description}</p>
              </div>
              <div className="mt-2 sm:mt-0 text-right">
                <p className="text-sm font-bold text-ink">₹{item.amount}</p>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <StatusIcon className={`w-3.5 h-3.5 ${statusColor}`} />
                  <span className={`text-[11px] font-medium capitalize ${statusColor}`}>
                    {status.replaceAll('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
