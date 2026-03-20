import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Zap, UserCheck, CloudRain, BarChart3, 
  Globe, Check, ChevronDown,
  Droplet, Sun, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LandingNavbar from '../../components/LandingNavbar';
import MapView from '../../components/MapView';
import publicService from '../../services/publicService';

// Fallback data for live city monitoring. In production, this syncs with real-time weather APIs.
const STATIC_CITIES = [
  { city: 'Mumbai', risk: 'HIGH', status: 'Heavy Rain 18mm/hr' },
  { city: 'Delhi', risk: 'HIGH', status: 'Extreme Heat 42°C' },
  { city: 'Bangalore', risk: 'LOW', status: 'Clear 28°C' },
  { city: 'Chennai', risk: 'MODERATE', status: 'Humidity 85%' },
  { city: 'Hyderabad', risk: 'LOW', status: 'Clear 31°C' },
  { city: 'Pune', risk: 'LOW', status: 'Clear 26°C' },
];

export default function Landing() {
  const [activeCity, setActiveCity] = React.useState(null);
  const [citiesData, setCitiesData] = React.useState(STATIC_CITIES);
  const [showAllCities, setShowAllCities] = React.useState(false);
  const [globalStats, setGlobalStats] = React.useState({ activeRiders: 14240, payoutsSent: 8524190, liveEvents: 6 });

  // Initialize stats on mount. We fetch both city-specific and global platform stats concurrently.
  React.useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const [liveData, stats] = await Promise.all([
          publicService.getCityStats(),
          publicService.getGlobalStats()
        ]);
        if (liveData && mounted) setCitiesData(liveData);
        if (stats && mounted) setGlobalStats(stats);
      } catch (err) {
        // If the API is down, we fail silently and stick with the static fallback data
        if (mounted) console.error('[LandingPage] Failed to fetch stats:', err);
      }
    };
    fetchStats();
    return () => { mounted = false; }; // Cleanup to prevent state updates on unmounted component
  }, []);

  // 🎨 Animation Framer Motion Configs
  // Custom cubic-bezier for that "premium" feel (smooth entrance, subtle deceleration)
  const premiumEase = [0.16, 1, 0.3, 1];

  // Base entrance animation for most elements
  const reveal = {
    initial: { opacity: 0, y: 30, filter: "blur(10px)" },
    whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 1, ease: premiumEase }
  };

  // Parent container variant to coordinate staggered child animations
  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-white selection:bg-mint/30">
      <LandingNavbar />

      {/* ── 1. Hero Section ── */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="hero-mint-aura" />
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
               variants={reveal} 
               initial="initial" 
               whileInView="whileInView" 
               viewport={{ once: false, amount: 0.1 }}
               className="max-w-2xl"
            >
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-forest text-mint text-[10px] font-black tracking-[0.2em] uppercase mb-10 border border-mint/20 shadow-xl shadow-mint/5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-mint"></span>
                  </span>
                  Live in 6 Cities
                </div>
              
              <h1 className="text-6xl lg:text-[84px] leading-[0.95] font-extrabold text-forest mb-8 tracking-tighter">
                AI Insurance for <br /> <span className="text-mint">Food Riders</span>
              </h1>
              <p className="text-xl text-ink-muted mb-12 max-w-lg leading-relaxed font-medium">
                Automatically protect your income from rain, heat, floods and pollution. <span className="text-forest font-bold text-lg">No claims to file. Instant UPI payouts.</span>
              </p>
              
               <div className="flex items-center gap-5 mb-16">
                 <Link to="/register" className="btn-gigshield-primary !px-10 !py-5">
                   Get Coverage &rarr;
                 </Link>
                 <a href="#how-it-works" className="btn-gigshield-outline !px-10 !py-5">
                   Walkthrough &rarr;
                 </a>
              </div>

              <div className="flex items-center gap-10">
                 <div>
                    <p className="text-3xl font-bold text-forest">{globalStats.activeRiders.toLocaleString('en-IN')}+</p>
                    <p className="text-[10px] font-bold text-ink-muted uppercase tracking-[0.2em] mt-1">Active Riders</p>
                 </div>
                 <div className="w-px h-10 bg-border" />
                 <div>
                    <p className="text-3xl font-bold text-forest">₹{(globalStats.payoutsSent / 100000).toFixed(1)}L+</p>
                    <p className="text-[10px] font-bold text-ink-muted uppercase tracking-[0.2em] mt-1">Payouts Sent</p>
                 </div>
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, x: 50 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8 }}
               className="relative hidden lg:block"
            >
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative group"
                >
                  <img src="/problem_weather.png" alt="GigShield Protection" className="w-full rounded-[40px] drop-shadow-2xl relative z-10" />
                 <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-float border border-border flex items-center gap-3 z-20">
                    <div className="w-10 h-10 rounded-full bg-mint/20 flex items-center justify-center text-forest">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Payout Status</p>
                      <p className="text-sm font-bold text-forest">Sent to UPI • 28s</p>
                    </div>
                 </div>
               </motion.div>
               <div className="absolute inset-0 bg-[#f4fffb] flex items-center justify-center -z-10 rounded-3xl" />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 2. Trusted By ── */}
      <section className="py-12 border-y border-border bg-[#f8fbf9]">
         <div className="container-custom">
            <p className="text-center text-[11px] font-bold text-ink-muted uppercase tracking-[0.2em] mb-10">Trusted by riders from top platforms</p>
            <motion.div 
               variants={staggerContainer}
               initial="initial"
               whileInView="whileInView"
               viewport={{ once: false, amount: 0.1 }}
               className="flex flex-wrap justify-center items-center gap-12 lg:gap-24"
             >
                {['Swiggy', 'Zomato'].map(brand => (
                  <motion.div key={brand} variants={reveal} viewport={{ once: false, amount: 0.1 }} className="group flex items-center gap-3 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-forest/5 text-forest/40 group-hover:bg-forest group-hover:text-white flex items-center justify-center font-bold text-sm transition-all grayscale group-hover:grayscale-0 border border-forest/10">{brand[0]}</div>
                    <span className="text-2xl font-black italic text-forest/20 group-hover:text-forest uppercase tracking-tighter transition-all">{brand}</span>
                  </motion.div>
                ))}
            </motion.div>
         </div>
      </section>

      {/* ── 3. Problem Section ── */}
      <section id="problem" className="py-16 bg-white overflow-hidden">
         <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
                <motion.div 
                  initial={{ opacity: 0.4, y: 15, filter: "blur(4px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  <img src="/hero_india.png" alt="Weather struggle" className="w-full rounded-[40px] shadow-2xl relative z-10" />
                  <div className="absolute -inset-4 bg-mint/5 -rotate-2 rounded-[40px] -z-0" />
               </motion.div>
               
               <motion.div variants={reveal} initial="initial" whileInView="whileInView" viewport={{ once: false, amount: 0.1 }}>
                  <h2 className="text-[44px] font-extrabold text-forest mb-6 leading-[1.1]">
                    Food Delivery Riders Lose <span className="text-red-500">20–30% Income</span> to Weather.
                  </h2>
                  <p className="text-lg text-ink-muted leading-relaxed mb-10">
                    When heavy rain or extreme heat strikes, you are forced to stop working. The platforms might offer surge pricing, but only *if* you ride in dangerous conditions. <br /><br />
                    <span className="text-forest font-bold">If you stay safe, you lose your daily earnings target.</span>
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                     <div className="p-6 bg-[#f9fdfb] rounded-2xl border border-mint-border">
                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-red-400 mb-4">
                           <Droplet size={24} />
                        </div>
                        <h4 className="font-bold text-lg mb-2">Monsoons</h4>
                        <p className="text-sm text-ink-muted">Average 14 days lost per year in Mumbai</p>
                     </div>
                     <div className="p-6 bg-[#f9fdfb] rounded-2xl border border-mint-border">
                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-amber-500 mb-4">
                           <Sun size={24} />
                        </div>
                        <h4 className="font-bold text-lg mb-2">Extreme Heat</h4>
                        <p className="text-sm text-ink-muted">Afternoon earnings drop by 40% in Delhi summers</p>
                     </div>
                  </div>
               </motion.div>
            </div>
         </div>
      </section>

      {/* ── 4. How it Works ── */}
      <section id="how-it-works" className="py-16 bg-[#00332c] text-white">
         <div className="container-custom">
            <div className="text-center mb-24">
               <span className="text-mint font-bold tracking-widest text-[10px] uppercase mb-4 block">How it Works</span>
               <h2 className="text-5xl font-extrabold mb-4">Automatic triggers. <br /> Zero paperwork.</h2>
            </div>

            <motion.div 
               variants={staggerContainer}
               initial="initial"
               whileInView="whileInView"
               viewport={{ once: false, amount: 0.1 }}
               className="grid md:grid-cols-4 gap-8"
             >
                {[
                  { step: '1', title: 'Rain Detected', desc: 'Our API detects heavy rain in your working zone.', icon: CloudRain },
                  { step: '2', title: 'AI Calculates', desc: 'We calculate your daily average income automatically.', icon: BarChart3 },
                  { step: '3', title: 'Fraud Check', desc: 'System verifies active status against platform.', icon: UserCheck },
                  { step: '4', title: 'Instant Payout', desc: 'Money sent directly to your UPI ID within 30s.', icon: Zap }
                ].map((s, i) => (
                   <motion.div 
                     key={i} 
                     variants={reveal}
                     viewport={{ once: false, amount: 0.1 }}
                     className="text-center group"
                   >
                      <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative transition-all duration-500 group-hover:border-mint group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(40,255,191,0.1)]">
                         <span className="text-4xl font-extrabold text-mint transition-transform duration-500 group-hover:scale-110">{s.step}</span>
                         <div className="absolute inset-0 rounded-full border border-mint/0 group-hover:border-mint/30 transition-all duration-700 scale-125 opacity-0 group-hover:opacity-100" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 transition-colors duration-500 group-hover:text-mint">{s.title}</h3>
                      <p className="text-white/40 text-sm leading-relaxed font-medium transition-opacity duration-500 group-hover:opacity-100">{s.desc}</p>
                   </motion.div>
                 ))}
            </motion.div>
         </div>
      </section>

      
      {/* ── 5. Pricing Section ── */}
      <section className="py-24 bg-white overflow-hidden relative" id="pricing">
         <div className="container-custom">
            <div className="text-center mb-20">
               <motion.div variants={reveal} initial="initial" whileInView="whileInView" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint/10 text-forest text-[10px] font-black uppercase tracking-widest mb-4 border border-mint/20">
                 Pricing
               </motion.div>
               <h2 className="text-[52px] font-black text-forest mb-4 tracking-tight">Simple, Transparent Pricing</h2>
               <p className="text-xl text-ink-muted font-medium">One plan. Full protection. Auto-deducted from your earnings.</p>
            </div>

            <motion.div 
               initial={{ opacity: 0, y: 40, scale: 0.95 }}
               whileInView={{ opacity: 1, y: 0, scale: 1 }}
               viewport={{ once: false, amount: 0.1 }}
               transition={{ duration: 1, ease: premiumEase }}
               className="max-w-xl mx-auto relative"
            >
               <div className="absolute -inset-10 bg-gradient-to-tr from-mint/20 via-transparent to-mint/10 rounded-[60px] blur-3xl -z-10" />
               
               <div className="bg-white rounded-[40px] border border-border shadow-[0_32px_64px_-16px_rgba(0,51,44,0.08)] overflow-hidden relative group transition-all duration-700 hover:shadow-[0_48px_120px_-24px_rgba(0,51,44,0.15)] hover:-translate-y-2">
                  <div className="h-2 w-full bg-gradient-to-r from-mint via-forest to-mint" />
                  
                  <div className="p-10 lg:p-14">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h3 className="text-[11px] font-black text-mint uppercase tracking-[0.3em] mb-3">Professional Plan</h3>
                        <p className="text-4xl font-black text-forest">GigShield Pro</p>
                      </div>
                      <div className="bg-forest text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-forest/20 animate-pulse">
                        Most Popular
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 mb-12">
                       <span className="text-7xl font-black text-forest tracking-tighter flex items-baseline">
                         <span className="text-3xl mr-1 self-center">₹</span>150
                       </span>
                       <span className="text-ink-muted font-bold text-xl">/ week</span>
                    </div>

                    <motion.div 
                       variants={staggerContainer}
                       initial="initial"
                       whileInView="whileInView"
                       className="grid sm:grid-cols-2 gap-y-5 gap-x-8 mb-12"
                    >
                       {[
                         'Unlimited Rain Payouts',
                         'Heatwave Compensation',
                         'Pollution Health Benefit',
                         'Titanium Tier Eligibility',
                         'Instant UPI Settle',
                         'No Paperwork Claims'
                       ].map((f, i) => (
                         <motion.div key={i} variants={reveal} className="flex items-center gap-3 group/item">
                            <div className="w-6 h-6 rounded-full bg-mint/10 flex items-center justify-center text-mint group-hover/item:bg-mint group-hover/item:text-forest transition-all">
                               <Check size={14} strokeWidth={3} />
                            </div>
                            <span className="text-[13px] font-bold text-forest transition-all group-hover/item:translate-x-1">{f}</span>
                         </motion.div>
                       ))}
                    </motion.div>

                    <div className="space-y-4">
                       <Link to="/register" className="flex items-center justify-center w-full py-6 bg-forest text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-forest/90 hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-forest/20 group">
                          Protect My Income
                          <div className="ml-2 w-6 h-6 rounded-full bg-mint/20 flex items-center justify-center group-hover:bg-mint transition-all">
                            <Zap size={10} className="text-mint group-hover:text-forest" fill="currentColor" />
                          </div>
                       </Link>
                       <p className="text-center text-[10px] text-ink-muted font-bold uppercase tracking-[0.2em]">
                         Cancel anytime • No hidden fees
                       </p>
                    </div>

                    <div className="mt-12 pt-10 border-t border-border/60">
                       <p className="text-center text-[10px] font-black text-ink-muted/40 uppercase tracking-[0.2em] mb-6">Preferred by top riders from</p>
                       <div className="flex justify-center items-center gap-10 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default lg:gap-14">
                          <span className="font-black italic text-xl tracking-tighter">SWIGGY</span>
                          <span className="font-black italic text-xl tracking-tighter">ZOMATO</span>
                       </div>
                    </div>
                  </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* ── 6. Dashboard Preview ── */}
      <section className="py-20 bg-[#f8fbf9]">
         <div className="container-custom">
            <div className="text-center mb-20">
               <h2 className="text-[44px] font-extrabold text-forest mb-4">A dashboard made for you</h2>
               <p className="text-lg text-ink-muted">Track payouts, coverage limits, and your Rider Score.</p>
            </div>

            <motion.div 
               variants={reveal}
               initial="initial"
               whileInView="whileInView"
               className="max-w-5xl mx-auto rounded-[40px] overflow-hidden shadow-[0_32px_80px_rgba(0,51,44,0.1)] border border-white p-3 bg-gradient-to-b from-white to-[#f4fffb]"
            >
               <div className="bg-[#00332c] rounded-[32px] overflow-hidden h-[580px] relative flex shadow-inner">
                  
                  {/* Mock Sidebar */}
                  <div className="w-20 border-r border-white/5 flex flex-col items-center py-8 gap-10">
                    <div className="w-10 h-10 rounded-xl bg-mint/20 flex items-center justify-center text-mint">
                      <Shield size={20} />
                    </div>
                    <div className="flex flex-col gap-8 opacity-40">
                      <BarChart3 size={20} className="text-white" />
                      <Clock size={20} className="text-white" />
                      <Globe size={20} className="text-white" />
                      <UserCheck size={20} className="text-white" />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    {/* Mock Window Header */}
                    <div className="h-16 bg-white/5 border-b border-white/10 flex items-center justify-between px-10">
                       <div className="flex gap-8">
                          <div className="text-[11px] font-bold text-mint uppercase tracking-widest border-b-2 border-mint-green pb-5 mt-5">Earnings Overview</div>
                          <div className="text-[11px] font-bold text-white/30 uppercase tracking-widest pb-5 mt-5 cursor-pointer hover:text-white/60">Payout History</div>
                       </div>
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white text-xs font-bold">R</div>
                         <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-white">Rahul S.</span>
                           <span className="text-[8px] text-white/40">Swiggy • Mumbai</span>
                         </div>
                       </div>
                    </div>

                    {/* 📱 Mock Dashboard Interface - Showcasing the internal rider experience */}
                    <div className="flex-1 p-10 grid grid-cols-12 gap-8 overflow-hidden">
                       <div className="col-span-8 space-y-8 flex flex-col">
                          {/* Live statistics for the currently viewing rider (hypothetical default) */}
                          <div className="grid grid-cols-3 gap-5">
                             {[
                               { label: 'Protected Income', val: `₹${(globalStats.payoutsSent / 100000).toFixed(1)}L`, color: 'text-mint' },
                               { label: 'Rider Rating', val: '9.8', color: 'text-white' },
                               { label: 'Avg. Payout', val: '₹420', color: 'text-white' }
                             ].map((s, i) => (
                               <div key={i} className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                  <p className="text-[9px] uppercase font-bold text-white/30 tracking-widest mb-2">{s.label}</p>
                                  <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                               </div>
                             ))}
                          </div>

                          {/* Visualizing "Earnings vs Weather" performance over the last few months */}
                          <div className="flex-1 bg-white/5 rounded-3xl border border-white/10 p-8 flex flex-col relative overflow-hidden">
                             <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-white">Daily Performance</p>
                                  <p className="text-[10px] text-white/40 uppercase tracking-tighter">Income protection active across all shifts</p>
                                </div>
                                <div className="flex gap-2">
                                  <div className="px-3 py-1 rounded-full bg-mint/10 text-mint text-[9px] font-bold">Weekly</div>
                                </div>
                             </div>
                             
                             <div className="flex-1 flex items-end gap-3 pb-2 pt-4 relative">
                                {/* Grid lines */}
                                <div className="absolute inset-0 flex flex-col justify-between opacity-5">
                                  <div className="w-full h-px bg-white" />
                                  <div className="w-full h-px bg-white" />
                                  <div className="w-full h-px bg-white" />
                                </div>
                                
                                // Staggered chart bars showing hypothetical data points
                                {[45, 65, 40, 85, 55, 95, 75, 50, 60, 90, 80, 70].map((h, i) => (
                                   <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                      <motion.div 
                                         initial={{ height: 0 }} 
                                         whileInView={{ height: `${h}%` }}
                                         className="w-full bg-gradient-to-t from-mint-green/5 to-mint-green/40 rounded-t-lg group-hover:to-mint-green/60 transition-all" 
                                      />
                                      <span className="text-[8px] text-white/20 font-bold">{i + 1}M</span>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>

                       {/* 📈 Live Status & Activity Feed */}
                       <div className="col-span-4 space-y-6">
                          <div className="p-6 rounded-3xl bg-mint text-forest relative overflow-hidden shadow-lg shadow-mint-green/10">
                             <p className="text-[9px] uppercase font-bold opacity-60 tracking-widest mb-1">Current Status</p>
                             <div className="flex items-center gap-2 mb-4">
                               <div className="w-2 h-2 rounded-full bg-forest animate-pulse" />
                               <p className="text-2xl font-black">Titanium 💎</p>
                             </div>
                             <p className="text-[10px] font-bold opacity-60 leading-relaxed">You are in the top 2% of riders. <br /> Enjoy 25% faster payout processing.</p>
                             <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full border-[1.2rem] border-forest-green/5" />
                          </div>

                          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col">
                             <p className="text-[10px] font-bold text-white tracking-widest uppercase mb-6 flex items-center gap-2">
                               <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                               Recent Activity
                             </p>
                             <div className="space-y-5">
                                {[
                                  { t: 'Rain Coverage Payout', d: '2 mins ago', val: '+ ₹340', p: 'Swiggy' },
                                  { t: 'Policy Renewal', d: 'Today, 8:00 AM', val: 'Active', p: 'Zomato' },
                                  { t: 'Heatwave Buffer', d: 'Yesterday', val: '+ ₹180', p: 'Swiggy' }
                                ].map((act, i) => (
                                  <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                    <div className="space-y-1">
                                      <p className="text-[11px] font-bold text-white">{act.t}</p>
                                      <p className="text-[9px] text-white/40 uppercase tracking-tighter">{act.d} • {act.p}</p>
                                    </div>
                                    <div className="text-[11px] font-black text-mint">{act.val}</div>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* ── 7. Testimonials ── */}
      <section className="py-20 bg-white overflow-hidden">
         <div className="container-custom">
            <div className="text-center mb-24">
               <h2 className="text-[44px] font-extrabold text-forest mb-4 italic">Voice of the Riders</h2>
               <p className="text-lg text-ink-muted">Thousands of riders now work with peace of mind.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
               {[
                 { name: 'Rahul Sharma', city: 'Mumbai', platform: 'Swiggy', text: 'I lost 3 days last monsoon due to heavy rain. With GigShield, I got ₹1200 instantly. It is literally life-saving for us.' },
                 { name: 'Mohit Kumar', city: 'Delhi', platform: 'Zomato', text: 'The heat in Delhi is unbearable. I stopped riding at 12 PM, and GigShield covered my lost afternoon earnings. Amazing.' }
               ].map((t, i) => (
                 <div key={i} className="card-gigshield !p-10 flex flex-col justify-between hover:bg-[#f9fdfb]">
                    <p className="text-forest italic leading-relaxed mb-10 opacity-70">"{t.text}"</p>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-forest text-white flex items-center justify-center font-bold text-xl">{t.name[0]}</div>
                       <div>
                          <p className="font-bold text-forest">{t.name}</p>
                          <p className="text-xs text-ink-muted font-semibold">{t.platform} • {t.city}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── 8. Live City Triggers ── */}
      <section id="cities" className="py-20 bg-[#f4fffb]">
         <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
               <div className="lg:pl-12 order-2 lg:order-1">
                  <MapView citiesData={citiesData} activeCity={activeCity} onCityClick={(c) => setActiveCity(c.city)} />
               </div>
               <div className="order-1 lg:order-2">
                  <h2 className="text-4xl lg:text-5xl font-extrabold text-forest mb-8 leading-[1.1]">Live City Triggers</h2>
                  <p className="text-ink-muted text-lg mb-12">We monitor real-time weather and pollution APIs across 6 major Indian cities to automatically trigger your payouts.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {citiesData.slice(0, showAllCities ? undefined : 4).map(city => (
                       <div key={city.city} 
                            className="bg-white p-5 rounded-2xl border border-mint-border flex items-center justify-between cursor-pointer hover:border-mint-green transition-all shadow-sm"
                            onMouseEnter={() => setActiveCity(city.city)}
                            onMouseLeave={() => setActiveCity(null)}
                       >
                          <div>
                             <p className="font-bold text-forest">{city.city}</p>
                             <p className="text-[10px] uppercase font-bold text-ink-muted tracking-widest mt-1">{city.status}</p>
                          </div>
                          <div className={`w-2.5 h-2.5 rounded-full ${city.risk === 'HIGH' ? 'bg-red-400 animate-pulse' : city.risk === 'MODERATE' ? 'bg-amber-400' : 'bg-mint'}`} />
                       </div>
                     ))}
                  </div>

                  <div className="mt-12">
                     <button 
                        onClick={() => setShowAllCities(!showAllCities)}
                        className="flex items-center gap-2 text-forest font-bold text-sm tracking-widest uppercase hover:text-mint transition-all"
                     >
                        {showAllCities ? 'Show fewer cities' : 'View all supported cities'} <ChevronDown size={14} className={showAllCities ? 'rotate-180' : ''} />
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </section>

      
      {/* ── 9. FAQ Section ── */}
      <section className="py-24 bg-white" id="faq">
         <div className="container-custom max-w-4xl">
            <div className="text-center mb-16">
               <motion.div variants={reveal} initial="initial" whileInView="whileInView" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint/10 text-forest text-[10px] font-bold tracking-[0.1em] uppercase mb-4 border border-mint/20">
                  Common Questions
               </motion.div>
               <h2 className="text-[52px] font-black text-forest mb-4 tracking-tight">Questions? We got you.</h2>
               <p className="text-xl text-ink-muted font-medium">Everything you need to know about GigShield protection.</p>
            </div>
 
            <motion.div 
               variants={staggerContainer}
               initial="initial"
               whileInView="whileInView"
               viewport={{ once: false, amount: 0.1 }}
               className="max-w-3xl mx-auto space-y-4"
             >
                {[
                  { q: 'Which platforms do you support?', a: 'GigShield works seamlessly with Swiggy and Zomato.' },
                  { q: 'Is there any paperwork to file a claim?', a: 'No. Our system uses real-time weather APIs. If it rains above 5mm/hr in your GPS zone for 2+ hours, the payout is triggered automatically.' },
                  { q: 'When do I get the money?', a: 'Payouts are processed within 30 seconds of the event ending. You receive it via UPI instantly.' },
                  { q: 'Is heat covered as well?', a: 'Yes! If the temperature exceeds 42°C in your city, we trigger heatwave protection payouts representing your lost afternoon income.' },
                  { q: 'How is the premium paid?', a: 'The weekly premium is auto-deducted from your linked account or wallet. If you stop working, you can pause anytime.' }
                ].map((item, i) => (
                  <motion.details 
                    key={i} 
                    variants={reveal}
                    viewport={{ once: false, amount: 0.1 }}
                    className="group bg-[#f9fdfb] rounded-2xl border border-mint-border overflow-hidden hover:border-mint transition-all"
                  >
                     <summary className="flex items-center justify-between p-7 cursor-pointer list-none font-bold text-forest hover:text-mint transition-colors">
                        {item.q}
                        <div className="w-8 h-8 rounded-full bg-mint/10 flex items-center justify-center text-mint group-open:rotate-180 transition-transform">
                           <ChevronDown size={14} />
                        </div>
                     </summary>
                     <div className="px-7 pb-7 text-ink-muted leading-relaxed text-sm font-medium">
                        {item.a}
                     </div>
                  </motion.details>
                ))}
            </motion.div>
         </div>
      </section>

      {/* ── 11. Footer ── */}
      <footer className="bg-[#002621] text-white pt-24 pb-12">
         <div className="container-custom">
             <motion.div 
               variants={staggerContainer}
               initial="initial"
               whileInView="whileInView"
               className="grid lg:grid-cols-4 gap-16 pb-20 border-b border-white/5"
             >
                <motion.div variants={reveal} className="lg:col-span-1">
                   <motion.img 
                     src="/logo.png" 
                     alt="GigShield Logo" 
                     className="h-10 mb-8 opacity-100 cursor-pointer relative z-10" 
                     whileHover={{ scale: 1.02, filter: "brightness(0) invert(1) drop-shadow(0 0 8px rgba(255,255,255,0.3))" }}
                     initial={{ filter: "brightness(0) invert(1) blur(4px)", opacity: 0.3 }}
                     whileInView={{ filter: "brightness(0) invert(1) blur(0px)", opacity: 1 }}
                     viewport={{ once: false, amount: 0.1 }}
                     transition={{ duration: 0.8, ease: premiumEase }}
                   />
                   <p className="text-white/40 text-[13px] leading-relaxed mb-8 max-w-xs font-medium">
                      "Building the world's first AI-driven safety net for the gig economy. Starting with India's food delivery heroes."
                   </p>
                </motion.div>
                
                <motion.div variants={reveal} className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-10">
                   <div>
                      <h4 className="text-[12px] font-black uppercase tracking-[0.2em] mb-8 text-mint">Platform</h4>
                      <ul className="space-y-4 text-white/50 text-[13px] font-bold">
                         <li className="cursor-pointer hover:text-white transition-colors"><Link to="/dashboard">Rider Dashboard</Link></li>
                         <li className="cursor-pointer hover:text-white transition-colors"><Link to="/claims">Instant Claims</Link></li>
                         <li className="cursor-pointer hover:text-white transition-colors"><Link to="/score">Rider Score</Link></li>
                         <li className="cursor-pointer hover:text-white transition-colors"><Link to="/policy">My Policy</Link></li>
                      </ul>
                   </div>
                   <div>
                      <h4 className="text-[12px] font-black uppercase tracking-[0.2em] mb-8 text-white/30">Resources</h4>
                      <ul className="space-y-4 text-white/50 text-[13px] font-bold">
                         <li className="cursor-pointer hover:text-white transition-colors"><a href="#how-it-works">How it works</a></li>
                         <li className="cursor-pointer hover:text-white transition-colors"><a href="#cities">Supported Cities</a></li>
                         <li className="cursor-pointer hover:text-white transition-colors"><Link to="/faq">Help Center</Link></li>
                      </ul>
                   </div>
                   <div className="col-span-2 md:col-span-1">
                      <h4 className="text-[12px] font-black uppercase tracking-[0.2em] mb-8 text-white/30">Legal</h4>
                      <ul className="space-y-4 text-white/50 text-[13px] font-bold">
                         <li className="cursor-pointer hover:text-white transition-colors">
                            <a href="https://github.com/KRUSHAL2956/GigShield" target="_blank" rel="noopener noreferrer">GitHub</a>
                         </li>
                         <li className="cursor-pointer hover:text-white transition-colors"><Link to="/privacy">Privacy Policy</Link></li>
                         <li className="cursor-pointer hover:text-white transition-colors"><Link to="/terms">Terms of Service</Link></li>
                      </ul>
                   </div>
                </motion.div>

                <motion.div variants={reveal} className="lg:col-span-1">
                   <h4 className="text-[12px] font-black uppercase tracking-[0.2em] mb-8 text-mint">Get in Touch</h4>
                   <div className="space-y-6">
                      <p className="text-white/50 text-[13px] font-bold flex items-center gap-3">
                         <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                         HQ: India
                      </p>
                      <div className="pt-2">
                         <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-mint text-forest text-[11px] font-black uppercase tracking-widest shadow-lg shadow-mint/10 hover:scale-105 transition-all">
                            Protect My Ride
                         </Link>
                      </div>
                   </div>
                </motion.div>
             </motion.div>

            <div className="pt-12 text-center text-white/10 text-[10px] font-bold tracking-widest uppercase">
               © 2026 GigShield. Built for DEVTrails.
            </div>
         </div>
      </footer>
    </div>
  );
}
