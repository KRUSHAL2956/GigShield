import React from 'react';
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

const WEEKLY_EARNINGS_DATA = [
  { name: 'Mon', value: 850 },
  { name: 'Tue', value: 920 },
  { name: 'Wed', value: 1100 },
  { name: 'Thu', value: 0 }, // Rained out
  { name: 'Fri', value: 1250 },
  { name: 'Sat', value: 1600 },
  { name: 'Sun', value: 1800 },
];

const RECENT_CLAIMS = [
  { id: 1, date: 'Oct 12, 2026', type: 'Extreme Heat', amount: 265, status: 'paid' },
  { id: 2, date: 'Oct 08, 2026', type: 'Heavy Rain', amount: 310, status: 'paid' }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { rider, score } = useAuthStore();
  const activeScore = score || { total_score: 97, premium_pct: 1.25, tier: 'Titanium' };

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
      {/* ── Header ── */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink">
            Hello, {rider?.name?.split(' ')[0] || 'Rider'}
          </h1>
          <p className="text-ink-muted mt-1">Here's your {rider?.platform || 'Food Delivery'} coverage overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <TierBadge tier={activeScore.tier} size="lg" />
          <div className="text-right">
            <p className="text-sm font-semibold text-ink">Score: {activeScore.total_score}</p>
            <p className="text-xs text-ink-muted">Top 5% in Mumbai</p>
          </div>
        </div>
      </motion.div>

      {/* ── Weather Widget Alert ── */}
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

      {/* ── Key Metrics ── */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={IndianRupee} label="Weekly Earnings" value="₹5,200" accent="indigo" />
        <StatCard icon={Shield} label="Premium Paid" value="₹130" accent="teal" />
        <StatCard icon={ShieldAlert} label="Coverage Left" value="₹1,870" accent="amber" />
        <StatCard icon={CloudLightning} label="Payouts Recv." value="₹2,450" accent="coral" />
      </motion.div>

      {/* ── Charts & Policy ── */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        
        {/* Earnings Chart */}
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="md:col-span-2 card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-ink uppercase tracking-wider text-xs">Earnings Overview</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-surface-sunken rounded-md text-ink-muted">This Week</span>
          </div>
          <Chart data={WEEKLY_EARNINGS_DATA} type="area" color="#4a1d96" valueFormatter={(val) => `₹${val}`} />
        </motion.div>

        {/* Coverage Usage */}
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-ink uppercase tracking-wider text-xs mb-6">Policy Usage</h3>
            <div className="space-y-6">
              <ProgressBar label="Weekly Cap" used={130} cap={2000} color="bg-indigo" />
              <ProgressBar label="Monthly Cap" used={2450} cap={5000} color="bg-teal" />
            </div>
          </div>
          <button 
            onClick={() => navigate('/policy')}
            className="btn-ghost w-full justify-center mt-6 text-indigo text-sm"
          >
            View Policy Details
          </button>
        </motion.div>

      </div>

      {/* ── Micro-Premiums Live Ticker ── */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="card p-6 mb-8 bg-indigo-soft/50 border-indigo-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-indigo uppercase tracking-wider text-xs flex items-center gap-2">
             <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo"></span>
             </span>
             Live Ticker: Today's Deliveries
          </h3>
          <span className="text-xs font-semibold px-2 py-1 bg-white rounded-md text-indigo shadow-sm">Cap Progress: ₹130 / ₹150</span>
        </div>
        
        <div className="space-y-3">
          {[
            { id: 101, time: '14:20', earning: 85, premium: 2.12 },
            { id: 102, time: '13:45', earning: 120, premium: 3.00 },
            { id: 103, time: '12:15', earning: 60, premium: 1.50 }
          ].map(delivery => (
             <div key={delivery.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                   <div className="text-xs text-ink-muted w-10">{delivery.time}</div>
                   <div className="font-semibold text-sm text-ink">Delivery #{delivery.id}</div>
                </div>
                <div className="text-right">
                   <div className="text-sm font-bold text-emerald-600">+₹{delivery.earning}</div>
                   <div className="text-xs text-coral font-medium">-₹{delivery.premium.toFixed(2)} premium</div>
                </div>
             </div>
          ))}
        </div>
      </motion.div>

      {/* ── Recent Claims ── */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-ink uppercase tracking-wider text-xs">Recent Claims</h3>
          <button 
            onClick={() => navigate('/claims')}
            className="text-indigo text-sm font-semibold hover:underline"
          >
            View All
          </button>
        </div>
        <div className="space-y-1">
          {RECENT_CLAIMS.map(claim => (
            <ClaimCard key={claim.id} claim={claim} />
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
}
