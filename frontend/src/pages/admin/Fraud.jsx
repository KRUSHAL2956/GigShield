import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon, Check, X } from 'lucide-react';
import Card from '../../components/Card';
import Chart from '../../components/Chart';

const FRAUD_TREND_DATA = [
  { name: 'Mon', value: 2 },
  { name: 'Tue', value: 5 },
  { name: 'Wed', value: 3 },
  { name: 'Thu', value: 12 },
  { name: 'Fri', value: 4 },
  { name: 'Sat', value: 1 },
  { name: 'Sun', value: 3 },
];

const SUSPICIOUS_CLAIMS = [
  { id: 'CLM-8821', rider: 'Priya Desai', reason: 'Platform logout > 1hr before trigger', fraudScore: 88, amount: 250, date: 'Oct 13, 2026' },
  { id: 'CLM-8845', rider: 'Ramesh Singh', reason: 'Location spoofing detected', fraudScore: 94, amount: 300, date: 'Oct 13, 2026' },
  { id: 'CLM-8702', rider: 'Ali Khan', reason: 'Unusual earnings pattern', fraudScore: 72, amount: 180, date: 'Oct 12, 2026' },
];

export default function AdminFraud() {
  const [claims, setClaims] = useState(SUSPICIOUS_CLAIMS);

  const handleBlock = async (id) => {
    if (window.confirm('Are you sure you want to BLOCK this payout? This action is irreversible.')) {
      // In a real app, call API here
      // await api.post(`/api/fraud/block/${id}`);
      setClaims(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleOverride = async (id) => {
    if (window.confirm('Are you sure you want to OVERRIDE and approve this payout?')) {
      // In a real app, call API here
      // await api.post(`/api/fraud/override/${id}`);
      setClaims(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink">Fraud Detection (ML)</h1>
          <p className="text-ink-muted mt-1">Review AI-flagged suspicious claims before payout.</p>
        </div>
        <div className="bg-coral-soft text-coral px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
          <AlertOctagon className="w-4 h-4" /> {claims.length} Action Required
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <Card className="lg:col-span-2 p-6 flex flex-col justify-center">
          <h3 className="font-bold text-ink uppercase tracking-wider text-xs mb-6">Flagged Claims Trend (This Week)</h3>
          <Chart data={FRAUD_TREND_DATA} type="bar" color="#ff6b6b" height={220} />
        </Card>
        <Card className="p-6 bg-gradient-to-br from-indigo to-[#251842] text-white">
          <h3 className="font-bold text-indigo-200 uppercase tracking-wider text-xs mb-6">System Accuracy</h3>
          <div className="mb-8">
            <span className="text-5xl font-display font-bold text-white">99.2%</span>
            <p className="text-sm text-indigo-300 mt-2">True Positive Rate (Last 30 days)</p>
          </div>
          <div className="space-y-4">
            <div className="justify-between items-center text-sm border-b border-white/10 pb-2 hidden sm:flex">
              <span className="text-indigo-200">Total Scanned</span>
              <span className="font-bold">14,250</span>
            </div>
            <div className="justify-between items-center text-sm border-b border-white/10 pb-2 hidden sm:flex">
              <span className="text-indigo-200">Auto-Approved</span>
              <span className="font-bold">14,180</span>
            </div>
            <div className="flex justify-between items-center text-sm text-coral-300">
              <span>Blocked/Flagged</span>
              <span className="font-bold">70</span>
            </div>
          </div>
        </Card>
      </div>

      <h3 className="font-display font-bold text-xl text-ink mb-4">Manual Review Queue</h3>
      
      {claims.length === 0 ? (
        <div className="card p-12 text-center border-dashed bg-surface-sunken">
          <div className="w-16 h-16 bg-teal-soft text-teal rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-ink">Zero pending reviews.</h3>
          <p className="text-ink-muted">All clear! The ML engine has no flagged claims right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id} className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-xl shadow-inner ${claim.fraudScore > 90 ? 'bg-coral text-white' : 'bg-amber text-white'}`}>
                    {claim.fraudScore}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-ink">{claim.id}</span>
                      <span className="text-xs text-ink-muted">• {claim.date}</span>
                    </div>
                    <p className="text-sm text-ink-muted leading-relaxed">
                      <strong className="text-ink">{claim.rider}</strong> flagged for: <br/>
                      <span className="text-coral font-medium">{claim.reason}</span>
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                  <button onClick={() => handleBlock(claim.id)} className="flex-1 w-full bg-coral-soft text-coral hover:bg-coral hover:text-white transition-colors px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                    <X className="w-4 h-4" /> Block Payout
                  </button>
                  <button onClick={() => handleOverride(claim.id)} className="flex-1 w-full text-ink-muted hover:text-teal hover:bg-teal-soft transition-colors px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Override (Approve)
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
