import React from 'react';
import { motion } from 'framer-motion';
import {
  Droplet, Sun, ChevronDown,
  Shield, Zap, Star, ArrowRight, Check,
  TrendingUp, Users, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LandingNavbar from '../../components/LandingNavbar';
import MapView from '../../components/MapView';
import publicService from '../../services/publicService';

const STATIC_CITIES = [
  { city: 'Mumbai',    risk: 'HIGH',     status: 'Heavy Rain 18mm/hr' },
  { city: 'Delhi',     risk: 'HIGH',     status: 'Extreme Heat 42\u00b0C' },
  { city: 'Bangalore', risk: 'LOW',      status: 'Clear 28\u00b0C' },
  { city: 'Chennai',   risk: 'MODERATE', status: 'Humidity 85%' },
  { city: 'Pune',      risk: 'LOW',      status: 'Clear 30\u00b0C' },
  { city: 'Hyderabad', risk: 'LOW',      status: 'Clear 32\u00b0C' },
  { city: 'Kolkata',   risk: 'MODERATE', status: 'Rain 5mm/hr' },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

const staggerChildren = {
  initial: {},
  whileInView: {},
  viewport: { once: true, margin: '-60px' },
  transition: { staggerChildren: 0.12 },
};

const childItem = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export default function Landing() {
  const [activeCity, setActiveCity] = React.useState(null);
  const [citiesData, setCitiesData] = React.useState(STATIC_CITIES);
  const [globalStats, setGlobalStats] = React.useState({
    activeRiders: 14240,
    payoutsSent: 8524190,
    liveEvents: 6,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [liveData, stats] = await Promise.all([
          publicService.getCityStats(),
          publicService.getGlobalStats(),
        ]);
        if (liveData && mounted) setCitiesData(liveData);
        if (stats   && mounted) setGlobalStats(stats);
      } catch (err) {
        if (mounted) console.error('[LandingPage] Failed to fetch stats:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10 * 60 * 1000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: '#06060f' }}>
      <LandingNavbar />

      {/* ====== 1. HERO ====== */}
      <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-20 px-6 overflow-hidden">
        {/* BG orbs + grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="glow-orb w-[700px] h-[700px] bg-violet-700/20 top-[-200px] right-[-200px]" />
          <div className="glow-orb w-[500px] h-[500px] bg-cyan-500/10 bottom-[-100px] left-[-100px]" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 mb-8"
              >
                <span className="badge-premium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
                  </span>
                  Live in 6 Cities
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="font-display font-bold text-white leading-[1.1] tracking-tight mb-6"
                style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}
              >
                AI-powered insurance
                <br />
                <span className="gradient-text text-glow">for food riders.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25 }}
                className="text-lg text-white/50 mb-10 max-w-lg leading-relaxed"
              >
                Automatically protect your income from rain, heat, floods and pollution.{' '}
                <span className="text-white/80 font-medium">No claims. Instant UPI payouts.</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35 }}
                className="flex flex-col sm:flex-row gap-4 mb-14"
              >
                <Link to="/register" className="btn-primary !rounded-xl !px-8 !py-4 !text-base group">
                  Get Coverage Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/onboarding" className="btn-dark-ghost !rounded-xl !px-8 !py-4 !text-base">
                  See how it works
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex items-center gap-8"
              >
                {[
                  { value: `${globalStats.activeRiders.toLocaleString('en-IN')}+`, label: 'Active Riders', icon: <Users className="w-4 h-4" /> },
                  { value: `\u20b9${(globalStats.payoutsSent / 100000).toFixed(1)}L+`, label: 'Payouts Sent', icon: <TrendingUp className="w-4 h-4" /> },
                  { value: `${globalStats.liveEvents}`, label: 'Live Events', icon: <Zap className="w-4 h-4" /> },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-violet-400 mb-0.5">{s.icon}</div>
                    <span className="font-display font-bold text-2xl text-white tracking-tight">{s.value}</span>
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">{s.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Dashboard card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-violet-600/20 rounded-3xl blur-[60px]" />
              <div className="relative glass-dark overflow-hidden" style={{ border: '1px solid rgba(139,92,246,0.2)', borderRadius: '24px' }}>
                {/* Window chrome */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-teal-500/60" />
                  </div>
                  <div className="px-3 py-1 rounded-full text-[10px] font-bold text-violet-300 uppercase tracking-widest" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    Live Dashboard
                  </div>
                </div>

                <div className="p-6">
                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: 'Protected Income', value: `\u20b9${(globalStats.payoutsSent / 100000).toFixed(1)}L`, color: 'text-violet-400' },
                      { label: 'Rider Score',       value: '9.8 / 10',                                              color: 'text-cyan-400'   },
                      { label: 'Active Days',       value: '28 / 30',                                               color: 'text-emerald-400' },
                    ].map((c, i) => (
                      <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">{c.label}</p>
                        <p className={`font-display font-bold text-lg leading-none ${c.color}`}>{c.value}</p>
                        <div className="mt-2.5 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '82%' }}
                            transition={{ duration: 1.2, delay: 0.8 + i * 0.15 }}
                            className={`h-full rounded-full ${i === 0 ? 'bg-violet-500' : i === 1 ? 'bg-cyan-500' : 'bg-emerald-500'}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mini chart */}
                  <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-white/50">Monthly Payouts</span>
                      <span className="text-[10px] font-bold text-violet-400">+24% this month</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-20">
                      {[45, 65, 40, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.8, delay: 0.9 + i * 0.04 }}
                          className="flex-1 rounded-t"
                          style={{ background: i >= 9 ? 'linear-gradient(180deg,#a78bfa,#7c3aed)' : 'rgba(167,139,250,0.2)' }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Payout pill */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.5 }}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(6,182,212,0.06))', border: '1px solid rgba(16,185,129,0.2)' }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.15)' }}>
                      <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Payout Sent</p>
                      <p className="text-sm font-semibold text-white">\u20b9480 \u2192 UPI in 28 seconds</p>
                    </div>
                    <div className="ml-auto text-[10px] text-white/30 font-bold">just now</div>
                  </motion.div>
                </div>
              </div>

              {/* Floating tier badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-5 -right-5 rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ background: 'rgba(19,19,42,0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
              >
                <Award className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Your Tier</p>
                  <p className="text-sm font-display font-bold text-white">Titanium \ud83d\udcc8</p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-25">
          <span className="text-white text-[10px] font-bold uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* ====== 1.5 TRUSTED BY ====== */}
      <section className="py-10 px-6 overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-8">Trusted by riders across top platforms</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
            {['Swiggy', 'Zomato', 'Zepto', 'Blinkit'].map(name => (
              <div key={name} className="flex items-center gap-3 group cursor-default">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-xs text-white/30 group-hover:text-white transition-all duration-300" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {name[0]}
                </div>
                <span className="font-display font-bold text-xl text-white/20 group-hover:text-white/60 transition-colors tracking-tight">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 2. PROBLEM ====== */}
      <motion.section id="problem" className="py-28 px-6" style={{ background: '#ffffff' }} {...fadeUp}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-6 h-px bg-violet-500" />
            <span className="text-xs font-bold text-violet-600 uppercase tracking-[0.15em]">The Problem</span>
          </div>
          <h2 className="font-display font-bold text-ink leading-tight mb-16 max-w-2xl" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
            Food riders lose <span style={{ color: '#ef4444' }}>20\u201330% of their income</span> to weather every year.
          </h2>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative group order-2 lg:order-1">
              <div className="absolute -inset-4 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(34,211,238,0.06))' }} />
              <img src="/triggers.png" alt="Weather triggers" className="relative z-10 w-full rounded-[2rem]" style={{ border: '1px solid #e8e5f0', boxShadow: '0 24px 80px rgba(26,16,50,0.08)' }} />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-lg text-ink-muted leading-relaxed mb-8">
                When heavy rain or extreme heat strikes, riders stop working. Platforms may offer surge pricing\u2014but <strong className="text-ink">only if you ride in dangerous conditions</strong>. If you stay safe, you lose your daily earnings.
              </p>
              <motion.div className="space-y-4" {...staggerChildren}>
                {[
                  { icon: Droplet,    color: '#3b82f6', bg: '#eff6ff', title: 'Monsoons',       desc: 'Average 14 days of lost income per year in Mumbai alone.' },
                  { icon: Sun,        color: '#f59e0b', bg: '#fffbeb', title: 'Extreme Heat',   desc: 'Afternoon earnings drop 40% in Delhi summers above 42\u00b0C.' },
                  { icon: TrendingUp, color: '#8b5cf6', bg: '#f5f3ff', title: 'No Safety Net', desc: 'Zero formal protections. No insurance. No sick pay.' },
                ].map((item, i) => (
                  <motion.div key={i} {...childItem} className="flex items-start gap-4 p-5 rounded-2xl hover-border-violet" style={{ border: '1px solid #e8e5f0', background: '#faf9fe' }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-ink mb-1">{item.title}</h4>
                      <p className="text-sm text-ink-muted leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ====== 3. HOW IT WORKS ====== */}
      <motion.section id="how-it-works" className="py-28 px-6 relative overflow-hidden" style={{ background: '#06060f' }} {...fadeUp}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="glow-orb w-[600px] h-[600px] bg-violet-700/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-6 h-px bg-violet-500" />
            <span className="text-xs font-bold text-violet-400 uppercase tracking-[0.15em]">How it Works</span>
            <div className="w-6 h-px bg-violet-500" />
          </div>
          <h2 className="font-display font-bold text-white mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Automatic triggers. <span className="gradient-text">Zero paperwork.</span>
          </h2>
          <p className="text-white/40 mb-20 max-w-lg mx-auto leading-relaxed">
            Our AI monitors weather conditions 24/7 and processes payouts the moment a trigger fires.
          </p>
          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-[38px] left-[12.5%] right-[12.5%] h-px" style={{ background: 'linear-gradient(90deg,rgba(139,92,246,0.4),rgba(34,211,238,0.2))' }} />
            {[
              { step: '01', icon: Droplet,    title: 'Rain Detected',  desc: 'Real-time weather API flags heavy rain \u2265 5mm/hr in your zone.', color: '#3b82f6' },
              { step: '02', icon: TrendingUp, title: 'AI Calculates',  desc: 'We compute your average daily income from delivery history.',        color: '#8b5cf6' },
              { step: '03', icon: Shield,     title: 'Fraud Check',    desc: 'System verifies your active-rider status instantly.',                 color: '#22d3ee' },
              { step: '04', icon: Zap,        title: 'Instant Payout', desc: 'Money hits your UPI ID within 30 seconds. Always.',                  color: '#10b981' },
            ].map((s, i) => (
              <motion.div key={i} {...childItem} className="relative flex flex-col items-center text-center group">
                <div className="w-[76px] h-[76px] rounded-full flex items-center justify-center mb-6 relative z-10 transition-transform duration-300 group-hover:-translate-y-1" style={{ background: 'radial-gradient(circle at 30% 30%,rgba(255,255,255,0.07),transparent)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: `0 0 30px ${s.color}30` }}>
                  <s.icon className="w-7 h-7" style={{ color: s.color }} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: s.color + 'aa' }}>Step {s.step}</span>
                <h3 className="font-display font-bold text-white text-lg mb-3">{s.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ====== 3.5 PRICING ====== */}
      <motion.section id="pricing" className="py-28 px-6" style={{ background: 'linear-gradient(180deg,#faf9fe 0%,#f0eef5 100%)' }} {...fadeUp}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-6 h-px bg-violet-500" />
              <span className="text-xs font-bold text-violet-600 uppercase tracking-[0.15em]">Pricing</span>
              <div className="w-6 h-px bg-violet-500" />
            </div>
            <h2 className="font-display font-bold text-ink mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Simple, transparent pricing.</h2>
            <p className="text-ink-muted text-lg max-w-md mx-auto">One plan. Full protection. Auto-deducted from your earnings.</p>
          </div>
          <div className="max-w-md mx-auto">
            <div className="relative rounded-[28px] p-px overflow-hidden" style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.6),rgba(34,211,238,0.3))', boxShadow: '0 40px 80px rgba(109,40,217,0.2)' }}>
              <div className="rounded-[27px] bg-white p-10 relative">
                <div className="absolute top-0 right-10 -translate-y-1/2 px-5 py-1.5 rounded-full text-[10px] font-bold text-white uppercase tracking-widest" style={{ background: 'linear-gradient(135deg,#6d28d9,#7c3aed)' }}>
                  Most Popular
                </div>
                <h3 className="font-display font-bold text-ink text-2xl mb-2">GigShield Pro</h3>
                <div className="flex items-baseline gap-1.5 mb-8">
                  <span className="font-display font-bold text-5xl text-ink tracking-tight">\u20b9150</span>
                  <span className="text-ink-muted font-semibold text-lg">/week</span>
                </div>
                <ul className="space-y-3.5 mb-10">
                  {['Unlimited Rain Payouts','Heatwave Compensation','Pollution Health Benefit','Titanium Tier Eligibility','Instant UPI Settlement','No Paperwork Claims'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-ink">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.1)' }}>
                        <Check className="w-3 h-3 text-violet-600" strokeWidth={2.5} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="btn-primary w-full !py-4 !rounded-xl !text-base justify-center">
                  Protect My Income
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-center text-[10px] text-ink-muted mt-4 font-bold uppercase tracking-wider">Cancel anytime \u00b7 No hidden fees</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ====== 4. TESTIMONIALS ====== */}
      <motion.section className="py-28 px-6 relative overflow-hidden" style={{ background: '#06060f' }} {...fadeUp}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="glow-orb w-[500px] h-[500px] bg-cyan-600/10 top-0 right-0" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-6 h-px bg-violet-500" />
              <span className="text-xs font-bold text-violet-400 uppercase tracking-[0.15em]">Testimonials</span>
              <div className="w-6 h-px bg-violet-500" />
            </div>
            <h2 className="font-display font-bold text-white mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Voice of the riders.</h2>
            <p className="text-white/40 max-w-md mx-auto">Thousands of riders now work with real peace of mind.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Rahul Sharma', city: 'Mumbai', platform: 'Swiggy', rating: 5, text: 'I lost 3 days last monsoon. With GigShield, \u20b91,200 hit my UPI in seconds. It\'s literally life-saving for riders like us.' },
              { name: 'Mohit Kumar',  city: 'Delhi',  platform: 'Zomato', rating: 5, text: 'Delhi heat is brutal. I stopped at noon, GigShield covered my lost afternoon. No app-open, no claim. Just money.' },
              { name: 'Sankar S.',    city: 'Chennai', platform: 'Zepto', rating: 5, text: 'No paperwork is the best part. I didn\'t even open the app \u2014 the money just arrived. Incredible product.' },
            ].map((t, i) => (
              <motion.div key={i} {...childItem} className="glass-dark p-8 flex flex-col hover-border-violet" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/60 leading-relaxed mb-6 flex-1 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#0891b2)' }}>{t.name[0]}</div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-white/30 font-semibold">{t.platform} \u00b7 {t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ====== 5. CITIES MAP ====== */}
      <motion.section id="cities" className="py-28 px-6" style={{ background: '#ffffff', borderTop: '1px solid #e8e5f0' }} {...fadeUp}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-px bg-violet-500" />
                <span className="text-xs font-bold text-violet-600 uppercase tracking-[0.15em]">Live Coverage</span>
              </div>
              <h2 className="font-display font-bold text-ink mb-5" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>Real-time city triggers.</h2>
              <p className="text-ink-muted text-lg leading-relaxed mb-10">We monitor weather and pollution APIs across 6 major Indian cities 24/7 to automatically fire your payouts.</p>
              <div className="grid grid-cols-2 gap-3 relative">
                {loading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)' }}>
                    <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {citiesData.slice(0, 4).map(city => (
                  <div key={city.city} className="p-4 rounded-2xl cursor-pointer transition-all duration-200 hover-border-violet" style={{ border: `1px solid ${activeCity === city.city ? 'rgba(139,92,246,0.4)' : '#e8e5f0'}`, background: activeCity === city.city ? 'rgba(139,92,246,0.04)' : '#faf9fe' }} onMouseEnter={() => setActiveCity(city.city)} onMouseLeave={() => setActiveCity(null)}>
                    <p className="font-bold text-ink text-sm mb-1.5">{city.city}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: city.risk === 'HIGH' ? '#ef4444' : city.risk === 'MODERATE' ? '#f59e0b' : '#10b981' }} />
                      <span className="text-xs font-semibold text-ink-muted">{city.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <a href="#cities" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                View all covered cities <ChevronDown className="w-4 h-4" />
              </a>
            </div>
            <div>
              <MapView citiesData={citiesData} activeCity={activeCity} onCityClick={(c) => setActiveCity(c.city)} />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ====== 5.5 FAQ ====== */}
      <motion.section id="faq" className="py-28 px-6" style={{ background: '#faf9fe', borderTop: '1px solid #e8e5f0' }} {...fadeUp}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-6 h-px bg-violet-500" />
              <span className="text-xs font-bold text-violet-600 uppercase tracking-[0.15em]">FAQ</span>
              <div className="w-6 h-px bg-violet-500" />
            </div>
            <h2 className="font-display font-bold text-ink" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>Questions? We got you.</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: 'Is there any paperwork to file a claim?', a: 'No. Our system uses real-time weather APIs. If it rains above 5mm/hr in your GPS zone for 2+ hours, the payout is triggered automatically. You don\'t need to do anything.' },
              { q: 'When do I receive the money?', a: 'Payouts are processed within 30 seconds of the weather event ending. You receive it directly via UPI \u2014 instantly.' },
              { q: 'Is heat covered too?', a: 'Yes! If temperature exceeds 42\u00b0C in your city, heatwave protection kicks in and covers your lost afternoon earnings automatically.' },
              { q: 'How is the premium paid?', a: 'We deduct a small flat amount (\u20b9150/week). If you don\'t ride, you don\'t pay \u2014 the plan is paused automatically.' },
            ].map((item, i) => (
              <details key={i} className="group rounded-2xl overflow-hidden" style={{ border: '1px solid #e8e5f0', background: '#ffffff' }}>
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-ink hover:text-violet-600 transition-colors text-[15px]">
                  {item.q}
                  <ChevronDown className="w-5 h-5 text-ink-muted transition-transform duration-300 group-open:rotate-180 flex-shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-6 text-ink-muted leading-relaxed text-[15px]" style={{ borderTop: '1px solid #f0eef5' }}>{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ====== 6. CTA BANNER ====== */}
      <motion.section className="py-28 px-6 relative overflow-hidden" style={{ background: '#06060f' }} {...fadeUp}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="glow-orb w-[700px] h-[700px] bg-violet-700/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="font-display font-bold text-white mb-5" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
            Start protecting your income <span className="gradient-text">today.</span>
          </h2>
          <p className="text-white/40 text-lg mb-10 max-w-lg mx-auto leading-relaxed">Join 14,000+ riders already covered. Setup takes under 2 minutes.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="btn-primary !rounded-xl !px-10 !py-4 !text-base group">
              Get Coverage Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="btn-dark-ghost !rounded-xl !px-10 !py-4 !text-base">
              Already a rider? Log in
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ====== FOOTER ====== */}
      <footer className="px-6 pt-16 pb-10" style={{ background: '#06060f', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6d28d9,#7c3aed)' }}>
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-white text-lg">GigShield</span>
              </div>
              <p className="text-white/30 text-sm max-w-xs leading-relaxed">AI-powered parametric insurance for gig economy delivery riders in India.</p>
            </div>
            <div className="flex flex-wrap gap-16">
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.15em] mb-4">Product</p>
                <div className="flex flex-col gap-3">
                  {[{ label: 'How it works', href: '#how-it-works' }, { label: 'Pricing', href: '#pricing' }, { label: 'Cities', href: '#cities' }].map(l => (
                    <a key={l.href} href={l.href} className="text-sm text-white/40 hover:text-white transition-colors">{l.label}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.15em] mb-4">Company</p>
                <div className="flex flex-col gap-3">
                  {[{ label: 'About', href: '#problem' }, { label: 'GitHub', href: 'https://github.com/KRUSHAL2956/GigShield' }].map(l => (
                    <a key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined} className="text-sm text-white/40 hover:text-white transition-colors">{l.label}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-white/20" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p>&copy; 2026 GigShield \u00b7 DEVTrails Project</p>
            <p>Built for the gig economy \ud83c\uddee\ud83c\uddf3</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
