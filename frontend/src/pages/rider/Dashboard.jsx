import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, IndianRupee, CloudLightning, Shield } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import StatCard from '../../components/StatCard';
import WeatherWidget from '../../components/WeatherWidget';
import ProgressBar from '../../components/ProgressBar';
import ClaimCard from '../../components/ClaimCard';
import Chart from '../../components/Chart';
import { useNavigate } from 'react-router-dom';
import TierBadge from '../../components/TierBadge';
import api from '../../api/axios';

// Mock data removed - fetching from API

// Main entry point for the Rider experience. 
// Consolidates weather alerts, earnings stats, and active claims into a single view.
export default function Dashboard() {
  const navigate = useNavigate();
  const { rider, score } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback score if the scoring engine hasn't processed this rider yet
  const activeScore = score || { total_score: 97, premium_pct: 1.25, tier: 'Titanium' };

  // Fetch comprehensive summary of the rider's activity (claims, deliveries, and generic stats)
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!rider?.id) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/api/riders/${rider.id}/dashboard-summary`);
        setData(res.data);
      } catch (err) {
        console.error('Dashboard data sync failed:', err);
        setError('We encountered a problem loading your dashboard. Please refresh or try again later.');
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [rider?.id]);

  // Loading state placeholder - keeps the layout from jumping
  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
    </div>
  );

  // Critical error boundary for the dashboard data
  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-red px-4 py-3 bg-red/10 border border-red/20 rounded-lg">
        {error}
      </div>
    </div>
  );

  const stats = data?.stats || { weekly_earnings: 0, premium_paid: 0, payouts_received: 0, coverage_left: 2000 };
  const claims = data?.recentClaims || [];
  const deliveries = data?.recentDeliveries || [];

  // Transform delivery history into a format suitable for the Area Chart component
  const chartData = deliveries.length > 0 
    ? deliveries.map((d, i) => ({ name: `D${deliveries.length - i}`, value: d.delivery_earning }))
    : [{ name: 'No data', value: 0 }];

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
      className="max-w-4xl mx-auto"
    >
      {/* ── Welcome Header ── */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-ink">
            Hello, {rider?.name?.split(' ')[0] || 'Rider'}
          </h1>
          <p className="text-ink-muted mt-1.5 font-medium">Here's your {rider?.platform || 'Food Delivery'} coverage overview.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2.5 rounded-2xl border border-border sm:border-none sm:p-0 shadow-sm sm:shadow-none">
          <TierBadge tier={activeScore.tier} size="lg" />
          <div className="text-right pr-2 sm:pr-0">
            <p className="text-sm font-bold text-ink">Score: {activeScore.total_score}</p>
            <p className="text-[10px] uppercase font-bold text-ink-muted tracking-wider">Top 5% in Mumbai</p>
          </div>
        </div>
      </motion.div>

      {/* ── Hyper-local Weather Risk Alert ── */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="mb-8">
        <WeatherWidget 
          city={rider?.city || 'Mumbai'}
          status="Heavy Rain Risk (Evening)"
          detail="IMD predicts > 15mm/hr rain between 5 PM - 9 PM in Andheri West."
          level="HIGH"
          type="rain"
          payout={290}
        />
      </motion.div>

      {/* ── Key Financial & Coverage Metrics ── */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={IndianRupee} label="Weekly Earnings" value={`₹${(stats.weekly_earnings ?? 0).toLocaleString()}`} accent="forest" />
        <StatCard icon={Shield} label="Premium Paid" value={`₹${(stats.premium_paid ?? 0).toLocaleString()}`} accent="mint" />
        <StatCard icon={ShieldAlert} label="Coverage Left" value={`₹${(stats.coverage_left ?? 0).toLocaleString()}`} accent="amber" />
        <StatCard icon={CloudLightning} label="Payouts Recv." value={`₹${(stats.payouts_received ?? 0).toLocaleString()}`} accent="coral" />
      </motion.div>

      {/* ── Interactive Charts & Policy Caps ── */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        
        {/* Visual trend of recent delivery income */}
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="md:col-span-2 card-gigshield sm:p-6 p-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-ink uppercase tracking-wider text-xs">Earnings Overview</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-surface-sunken rounded-md text-ink-muted">Recent Deliveries</span>
          </div>
          <Chart data={chartData} type="area" color="#00332c" valueFormatter={(val) => `₹${val}`} />
        </motion.div>

        {/* Real-time bar showing progress against total policy limits */}
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="card-gigshield sm:p-6 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-ink uppercase tracking-wider text-xs mb-6">Policy Usage</h3>
            <div className="space-y-6">
              <ProgressBar label="Weekly Cap" used={2000 - stats.coverage_left} cap={2000} color="bg-forest" />
              <ProgressBar label="Monthly Cap" used={stats.payouts_received} cap={5000} color="bg-mint" />
            </div>
          </div>
          <button 
            onClick={() => navigate('/policy')}
            className="btn-gigshield-outline w-full justify-center mt-6 text-sm !border-forest !text-forest"
          >
            View Policy Details
          </button>
        </motion.div>

      </div>

      {/* ── Micro-Premiums Live Ticker: Showing real-time deductions per delivery ── */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="card-gigshield sm:p-6 p-4 mb-8 bg-mint/5 border-mint/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-forest uppercase tracking-wider text-[10px] flex items-center gap-2">
             <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-mint"></span>
             </span>
             Live Activity: Today's Deliveries
          </h3>
          <span className="text-[10px] font-black px-3 py-1 bg-white border border-mint/20 rounded-full text-forest shadow-sm tracking-widest uppercase">Cap Progress: ₹130 / ₹150</span>
        </div>
        
        <div className="space-y-3">
          {deliveries.length > 0 ? deliveries.map(delivery => (
             <div key={delivery.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                   <div className="text-xs text-ink-muted w-10">{new Date(delivery.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                   <div className="font-semibold text-sm text-ink">Delivery #{delivery.id}</div>
                </div>
                 <div className="text-right">
                    <div className="text-sm font-bold text-forest">+₹{delivery.delivery_earning}</div>
                    <div className="text-xs text-red-500 font-medium">-₹{(Number(delivery.premium_deducted ?? 0)).toFixed(2)} premium</div>
                 </div>
             </div>
          )) : (
            <div className="text-center py-4 text-ink-muted text-sm">No deliveries logged today.</div>
          )}
        </div>
      </motion.div>

      {/* ── Recent Claims: History of automated payouts ── */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="card-gigshield sm:p-6 p-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-ink uppercase tracking-wider text-xs">Recent Claims</h3>
          <button 
            onClick={() => navigate('/claims')}
            className="text-forest text-[11px] font-black tracking-widest uppercase hover:text-mint transition-colors"
          >
            View All
          </button>
        </div>
        <div className="space-y-1">
          {claims.length > 0 ? claims.map(claim => (
            <ClaimCard key={claim.id} claim={{
              ...claim,
              type: (claim.disruption_type || 'Unknown').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              date: !isNaN(new Date(claim.event_date).getTime()) ? new Date(claim.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Invalid Date',
              amount: claim.final_payout
            }} />
          )) : (
            <div className="text-center py-8 text-ink-muted text-sm">No recent claims.</div>
          )}
        </div>
      </motion.div>

    </motion.div>
  );
}
