import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Download } from 'lucide-react';
import Card from '../../components/Card';
import Timeline from '../../components/Timeline';
import StatCard from '../../components/StatCard';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

// Mock data removed

export default function Claims() {
  const { rider } = useAuthStore();
  const [filter, setFilter] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClaims = async () => {
      if (!rider?.id) {
        setLoading(false);
        return;
      }
      try {
        setError(null);
        setLoading(true);
        const res = await api.get(`/api/riders/${rider.id}/claims`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch claims:', err);
        setError(err.message || 'Failed to load claims profile');
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, [rider?.id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo"></div>
      <p className="text-ink-muted italic">Syncing claims history...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto card p-12 text-center">
      <Activity className="w-12 h-12 text-coral mx-auto mb-4" />
      <h3 className="text-xl font-bold text-ink mb-2">Sync Interrupted</h3>
      <p className="text-ink-muted mb-6">{error}</p>
      <button 
        onClick={() => { setError(null); setLoading(true); window.location.reload(); }}
        className="btn-primary"
      >
        Retry Sync
      </button>
    </div>
  );

  const claims = (data?.claims || []).map(c => {
    const isDateValid = c.event_date && !isNaN(new Date(c.event_date).getTime());
    const parsedAmount = Number(c.final_payout);
    const amount = isNaN(parsedAmount) ? 0 : parsedAmount;
    return {
      ...c,
      title: (c.disruption_type || 'Unknown').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      date: isDateValid ? new Date(c.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Invalid Date',
      description: `Automated ${(c.disruption_type || 'disruption').replace('_', ' ')} payout for ${c.city || 'Unknown city'}.`,
      amount
    };
  });

  const { total_count = 0, total_paid = 0, total_pending = 0, blocked_count = 0 } = data?.stats || {};
  const stats = { total_count, total_paid, total_pending, blocked_count };

  const filteredClaims = filter === 'all' 
    ? claims 
    : claims.filter(c => c.status === filter);

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
        <StatCard icon={Activity} label="Total Claims" value={stats.total_count.toString()} accent="indigo" />
        <StatCard icon={Activity} label="Total Paid" value={`₹${stats.total_paid.toLocaleString()}`} accent="teal" />
        <StatCard icon={Activity} label="Pending" value={`₹${stats.total_pending.toLocaleString()}`} accent="amber" />
        <StatCard icon={Activity} label="Blocked/Denied" value={stats.blocked_count.toString()} accent="coral" />
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
