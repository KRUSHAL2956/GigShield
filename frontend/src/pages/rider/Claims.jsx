import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Download } from 'lucide-react';
import Card from '../../components/Card';
import Timeline from '../../components/Timeline';
import StatCard from '../../components/StatCard';

const MOCK_CLAIMS = [
  { id: 1, title: 'Extreme Heat Disruption', date: 'Oct 12, 2026', description: 'Afternoon heatwave > 42°C in your zone. Auto-triggered.', amount: 265, status: 'paid' },
  { id: 2, title: 'Heavy Rain Disruption', date: 'Oct 08, 2026', description: 'Monsoon sudden downpour. Rate > 15mm/hr.', amount: 310, status: 'paid' },
  { id: 3, title: 'Suspicious Activity Flag', date: 'Sep 24, 2026', description: 'Logged out of partner platform during trigger window.', amount: 280, status: 'fraud_blocked' },
  { id: 4, title: 'Moderate Rain', date: 'Sep 10, 2026', description: 'Continuous rain in evening slot.', amount: 150, status: 'approved' }
];

export default function Claims() {
  const [filter, setFilter] = useState('all');

  const filteredClaims = filter === 'all' 
    ? MOCK_CLAIMS 
    : MOCK_CLAIMS.filter(c => c.status === filter);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink flex items-center gap-2">
            <Activity className="w-8 h-8 text-indigo" />
            Claims History
          </h1>
          <p className="text-ink-muted mt-1">Review your automated payouts and tracking history.</p>
        </div>
        <button 
          onClick={() => alert('Download Statement feature coming soon!')}
          className="btn-ghost shadow-sm bg-white border border-border inline-flex items-center gap-2 w-fit hover:bg-surface-sunken"
        >
          <Download className="w-4 h-4" /> Download Statement (TODO)
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Activity} label="Total Claims" value="14" accent="indigo" />
        <StatCard icon={Activity} label="Total Paid" value="₹2,450" accent="teal" />
        <StatCard icon={Activity} label="Pending" value="₹150" accent="amber" />
        <StatCard icon={Activity} label="Blocked/Denied" value="1" accent="coral" />
      </div>

      <Card className="p-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-border pb-4">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'all' ? 'bg-indigo text-white shadow-soft' : 'bg-surface-sunken text-ink-muted hover:text-ink'}`}
          >
            All History
          </button>
          <button 
            onClick={() => setFilter('paid')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'paid' ? 'bg-teal text-white shadow-soft' : 'bg-surface-sunken text-ink-muted hover:text-ink'}`}
          >
            Paid
          </button>
          <button 
            onClick={() => setFilter('fraud_blocked')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'fraud_blocked' ? 'bg-coral text-white shadow-soft' : 'bg-surface-sunken text-ink-muted hover:text-ink'}`}
          >
            Blocked
          </button>
          <button 
            onClick={() => setFilter('approved')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'approved' ? 'bg-indigo text-white shadow-soft' : 'bg-surface-sunken text-ink-muted hover:text-ink'}`}
          >
            Approved
          </button>
        </div>

        {/* Timeline */}
        <Timeline items={filteredClaims} />
      </Card>
    </motion.div>
  );
}
