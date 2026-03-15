import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Award, Star, History, Calendar, Map } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import TierBadge from '../../components/TierBadge';
import ProgressBar from '../../components/ProgressBar';

export default function Score() {
  const { score } = useAuthStore();
  
  // Default to mock data if no score exists yet
  const displayScore = score || {
    total_score: 97,
    rating_score: 20,
    tenure_score: 15,
    earnings_score: 20,
    claims_score: 18,
    consistency_score: 15,
    city_risk_score: 9,
    premium_pct: 1.25,
    tier: 'Titanium'
  };

  const factors = [
    { label: 'Rating', val: displayScore.rating_score, max: 20, icon: Star, color: 'bg-indigo' },
    { label: 'Tenure', val: displayScore.tenure_score, max: 15, icon: Award, color: 'bg-indigo' },
    { label: 'Earnings', val: displayScore.earnings_score, max: 20, icon: Target, color: 'bg-teal' },
    { label: 'Claims History', val: displayScore.claims_score, max: 20, icon: History, color: 'bg-teal' },
    { label: 'Active Days', val: displayScore.consistency_score, max: 15, icon: Calendar, color: 'bg-amber' },
    { label: 'Zone Risk', val: displayScore.city_risk_score, max: 10, icon: Map, color: 'bg-amber' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-ink">Score Profile</h1>
        <p className="text-ink-muted mt-1">Your detailed rider rating and tier benefits.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Col: The Ring */}
        <div className="md:col-span-1">
          <div className="card p-8 flex flex-col items-center text-center relative overflow-hidden h-full justify-center">
            
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f0eef5" strokeWidth="8" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke="url(#score-gradient-ring)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                  animate={{ strokeDashoffset: (2 * Math.PI * 45) * (1 - displayScore.total_score / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                />
                <defs>
                  <linearGradient id="score-gradient-ring" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4a1d96" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-bold text-5xl text-ink">{displayScore.total_score}</span>
                <span className="text-sm font-semibold text-ink-muted">/ 100</span>
              </div>
            </div>

            <TierBadge tier={displayScore.tier} size="lg" className="mb-2" />
            <p className="text-sm text-ink-muted mt-2">
              Based on Last 30 Days
            </p>
          </div>
        </div>

        {/* Right Col: Breakdown */}
        <div className="md:col-span-2">
          <div className="card p-6 sm:p-8 h-full">
             <h3 className="font-bold text-ink uppercase tracking-wider text-xs mb-8 flex items-center justify-between">
                Factor Breakdown
                <span className="badge bg-indigo-soft text-indigo">Premium: {displayScore.premium_pct}%</span>
             </h3>
             
             <div className="space-y-6">
                {factors.map((f, i) => (
                  <motion.div 
                    key={f.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    className="flex items-center gap-4"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-surface-sunken text-ink flex-shrink-0`}>
                      <f.icon className="w-5 h-5 opacity-70" />
                    </div>
                    <div className="flex-1">
                      <ProgressBar 
                        label={f.label} 
                        used={f.val} 
                        cap={f.max} 
                        color={f.color}
                        valueText={`${f.val} / ${f.max}`}
                      />
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {displayScore.tier === 'Titanium' && (
      <div className="mt-8 bg-indigo text-white p-8 rounded-[1.5rem] relative overflow-hidden shadow-float">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
         <h3 className="font-display font-bold text-2xl mb-2 relative z-10">Titanium Benefits</h3>
         <p className="text-indigo-200 mb-6 max-w-lg relative z-10">You're in our top tier! Keep maintaining your rating and consistency to keep these perks.</p>
         
         <div className="grid sm:grid-cols-3 gap-6 relative z-10">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <TrendingUp className="w-6 h-6 text-teal-300 mb-3" />
              <p className="font-bold">40% Cheaper Premium</p>
              <p className="text-xs text-indigo-200 mt-1">Paying lowest rate of 1.25%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <Target className="w-6 h-6 text-amber-300 mb-3" />
              <p className="font-bold">25% Bonus Payout</p>
              <p className="text-xs text-indigo-200 mt-1">On all disruption triggers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <Award className="w-6 h-6 text-coral-300 mb-3" />
              <p className="font-bold">Priority Claims</p>
              <p className="text-xs text-indigo-200 mt-1">Processed in under 30s</p>
            </div>
         </div>
      </div>
      )}

      {displayScore.tier !== 'Titanium' && (
      <div className="mt-8 card p-8 border-amber-200 bg-amber-50">
         <h3 className="font-display font-bold text-xl text-amber-800 mb-2 flex items-center gap-2">
            <Target className="w-5 h-5" /> Next Tier Teaser
         </h3>
         <p className="text-amber-900 mb-4 max-w-lg">Unlock the <strong className="text-amber-700">Titanium Tier</strong> by maintaining a 4.8+ rating and completing 12 active months. You are currently in {displayScore.tier}.</p>
         <div className="flex gap-4">
             <div className="bg-white rounded-lg p-3 shadow-sm border border-amber-100 flex-1">
                 <div className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-1">Perk 1</div>
                 <div className="text-sm text-ink font-semibold">40% Premium Discount</div>
             </div>
             <div className="bg-white rounded-lg p-3 shadow-sm border border-amber-100 flex-1">
                 <div className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-1">Perk 2</div>
                 <div className="text-sm text-ink font-semibold">25% Bonus Payouts</div>
             </div>
         </div>
      </div>
      )}

    </motion.div>
  );
}
