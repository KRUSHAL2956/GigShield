import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Trophy, Zap, ChevronRight, Check } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const STEPS = [
  {
    icon: Shield,
    color: '#4a1d96',
    title: 'Welcome to GigShield',
    sub: 'Here\'s how we protect your income',
    body: (rider) => (
      <div className="space-y-3">
        <div className="card p-4">
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div><span className="text-ink-muted text-xs">Name</span><p className="font-medium text-ink">{rider?.name || 'Rider'}</p></div>
            <div><span className="text-ink-muted text-xs">Platform</span><p className="font-medium text-ink">{rider?.platform || 'Swiggy'}</p></div>
            <div><span className="text-ink-muted text-xs">City</span><p className="font-medium text-ink">{rider?.city || 'Mumbai'}</p></div>
            <div><span className="text-ink-muted text-xs">Zone</span><p className="font-medium text-ink">{rider?.zone || 'Andheri'}</p></div>
          </div>
        </div>
        <p className="text-ink-muted text-sm leading-relaxed">
          When rain, heat, or floods hit — we detect it automatically and send your payout to UPI. No claims to file, ever.
        </p>
      </div>
    ),
  },
  {
    icon: Trophy,
    color: '#d97706',
    title: 'Your Rider Score',
    sub: 'AI calculates your personalized rate',
    body: (rider, score) => {
      const s = score?.total_score || 72;
      return (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative w-36 h-36">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="58" fill="none" stroke="#f0eef5" strokeWidth="8" />
                <motion.circle
                  cx="70" cy="70" r="58" fill="none"
                  stroke="#4a1d96" strokeWidth="8" strokeLinecap="round"
                  initial={{ strokeDasharray: '0 999' }}
                  animate={{ strokeDasharray: `${s * 3.64} 364` }}
                  transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="text-4xl font-display font-bold text-ink"
                >{s}</motion.span>
                <span className="text-xs text-ink-muted">/100</span>
              </div>
            </div>
          </div>
          <div className="card p-4 flex justify-between text-sm">
            <div><span className="text-ink-muted text-xs">Premium Rate</span><p className="font-bold text-indigo text-lg">{score?.premium_pct || 3.2}%</p></div>
            <div className="text-right"><span className="text-ink-muted text-xs">Weekly Cost</span><p className="font-bold text-teal text-lg">₹{score?.premium_amount || 160}</p></div>
          </div>
        </div>
      );
    },
  },
  {
    icon: Zap,
    color: '#0d9488',
    title: 'You\'re all set!',
    sub: 'Coverage activates in 48 hours',
    body: () => (
      <div className="space-y-3">
        {[
          { t: 'Auto-Detection', d: 'Rain, heat, pollution, floods — detected in real time' },
          { t: 'Instant Payouts', d: 'Money to your UPI within 30 seconds of trigger' },
          { t: 'Zero Paperwork', d: 'No forms, no calls, fully automatic coverage' },
        ].map((item) => (
          <div key={item.t} className="card p-4 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-teal-soft flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 text-teal" strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{item.t}</p>
              <p className="text-xs text-ink-muted mt-0.5">{item.d}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

function Onboarding() {
  const [[step, dir], setStep] = useState([0, 0]);
  const navigate = useNavigate();
  const { rider, score } = useAuthStore();
  const cur = STEPS[step];
  const Icon = cur.icon;

  const next = () => {
    if (step < STEPS.length - 1) setStep([step + 1, 1]);
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === step ? 28 : 8 }}
              className="h-[5px] rounded-full"
              style={{ background: i <= step ? '#4a1d96' : '#e8e5f0' }}
            />
          ))}
        </div>

        {/* Card */}
        <div className="card p-7 overflow-hidden relative min-h-[420px]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: `${cur.color}15` }}>
                  <Icon className="w-6 h-6" style={{ color: cur.color }} strokeWidth={2} />
                </div>
                <h2 className="font-display text-xl font-bold text-ink">{cur.title}</h2>
                <p className="text-ink-muted text-sm mt-1">{cur.sub}</p>
              </div>
              {cur.body(rider, score)}
            </motion.div>
          </AnimatePresence>

          <button onClick={next} className="btn-primary w-full mt-6">
            {step < STEPS.length - 1 ? <>Continue <ChevronRight className="w-4 h-4" /></> : <>Go to Dashboard <ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>

        {step < STEPS.length - 1 && (
          <button onClick={() => navigate('/dashboard')}
            className="text-sm text-ink-muted hover:text-ink transition-colors mx-auto block mt-4">
            Skip
          </button>
        )}
      </div>
    </div>
  );
}

export default Onboarding;
