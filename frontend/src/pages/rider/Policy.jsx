import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CreditCard, FileText, CheckCircle2 } from 'lucide-react';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

export default function Policy() {
  const { rider } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      if (!rider?.id) {
        setError('Rider not authenticated. Please log in.');
        setData(null);
        setLoading(false);
        return;
      }
      try {
        setError(null);
        setLoading(true);
        const res = await api.get(`/api/riders/${rider.id}/policy`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch policy:', err);
        setError('Failed to load policy details. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [rider?.id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo"></div>
      <p className="text-ink-muted italic">Loading coverage details...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-3xl mx-auto card p-12 text-center">
      <Shield className="w-12 h-12 text-coral mx-auto mb-4" />
      <h3 className="text-xl font-bold text-ink mb-2">Policy Load failed</h3>
      <p className="text-ink-muted mb-6">{error}</p>
      <button 
        onClick={() => { setError(null); setLoading(true); window.location.reload(); }}
        className="btn-primary"
      >
        Retry Fetch
      </button>
    </div>
  );

  const policy = data?.policy || { status: 'loading', premium_amount: 0, weekly_premium: 0, next_deduction: 'N/A', weekly_cap: 2000, monthly_cap: 5000, per_event_cap: 800 };
  const usage = data?.usage || { weekly_total: 0, monthly_total: 0 };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <h1 className="font-display font-bold text-3xl text-ink mb-2">My Policy</h1>
      <p className="text-ink-muted mb-8">Manage your active coverage and premium payments.</p>

      {/* Active Policy Status Container */}
      <div className="bg-white rounded-[1.5rem] border border-border shadow-soft overflow-hidden mb-8">
        
        {/* Header Section */}
        <div className="bg-indigo p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[300px] h-[300px] bg-white/10 rounded-full blur-2xl z-0" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-0.5">Active Plan</p>
                <h2 className="text-2xl font-bold">{policy.status === 'active' ? 'Standard Income Shield' : 'No Active Plan'}</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white text-indigo px-4 py-2 rounded-lg font-bold shadow-sm whitespace-nowrap self-start md:self-auto">
              <CheckCircle2 className="w-4 h-4 text-teal" />
              Status: {policy.status === 'active' ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Payment Details */}
            <div className="space-y-5">
              <h3 className="font-bold text-ink uppercase tracking-wider text-xs">Payment Information</h3>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-ink-muted">Weekly Premium</span>
                <span className="font-semibold text-ink">₹{policy.premium_amount || 0}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-ink-muted">Next Deduction</span>
                <span className="font-semibold text-ink">{policy.week_start ? new Date(policy.week_start).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-ink-muted">Payment Method</span>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo" />
                  <span className="font-semibold text-ink">UPI Auto-pay</span>
                </div>
              </div>
            </div>

            {/* Coverage Details */}
            <div className="space-y-5">
              <h3 className="font-bold text-ink uppercase tracking-wider text-xs">Coverage Limits</h3>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-ink-muted">Per Event Cap</span>
                <span className="font-semibold text-ink">₹{policy.per_event_cap?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-ink-muted">Weekly Max Cap</span>
                <span className="font-semibold text-ink">₹{policy.weekly_cap?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-ink-muted">Monthly Max Cap</span>
                <span className="font-semibold text-ink">₹{policy.monthly_cap?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="bg-surface-sunken p-5 rounded-xl border border-border/50">
            <h3 className="font-bold text-ink uppercase tracking-wider text-xs mb-4">Coverage Usage</h3>
            <div className="space-y-4">
              <ProgressBar label="Weekly Cap Utilized" used={usage.weekly_total} cap={policy.weekly_cap || 2000} color="bg-indigo" />
              <ProgressBar label="Monthly Cap Utilized" used={usage.monthly_total} cap={policy.monthly_cap || 5000} color="bg-teal" />
            </div>
          </div>
        </div>
      </div>

      <h3 className="font-display font-bold text-xl text-ink mb-4">Policy Documents</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4 flex items-center justify-between" interactive>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-soft flex items-center justify-center text-indigo">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-ink">Terms of Coverage</p>
              <p className="text-xs text-ink-muted">Updated Oct 2026</p>
            </div>
          </div>
          <button type="button" disabled className="text-indigo text-sm font-semibold hover:underline opacity-50 cursor-not-allowed">View PDF</button>
        </Card>
        <Card className="p-4 flex items-center justify-between" interactive>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-soft flex items-center justify-center text-teal">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-ink">Auto-pay Mandate</p>
              <p className="text-xs text-ink-muted">UPI ID: ***@upi</p>
            </div>
          </div>
          <button type="button" disabled className="text-teal text-sm font-semibold hover:underline opacity-50 cursor-not-allowed">Manage</button>
        </Card>
      </div>
    </motion.div>
  );
}
