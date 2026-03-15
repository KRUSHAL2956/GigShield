import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Droplet, Sun, Wind, ChevronDown, MonitorPlay, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import LandingNavbar from '../../components/LandingNavbar';
import MapView from '../../components/MapView';
import publicService from '../../services/publicService';

const STATIC_CITIES = [
  { city: 'Mumbai', risk: 'HIGH', status: 'Heavy Rain 18mm/hr' },
  { city: 'Delhi', risk: 'HIGH', status: 'Extreme Heat 42°C' },
  { city: 'Bangalore', risk: 'LOW', status: 'Clear 28°C' },
  { city: 'Chennai', risk: 'MODERATE', status: 'Humidity 85%' },
  { city: 'Pune', risk: 'LOW', status: 'Clear 30°C' },
  { city: 'Hyderabad', risk: 'LOW', status: 'Clear 32°C' },
  { city: 'Kolkata', risk: 'MODERATE', status: 'Rain 5mm/hr' }
];

export default function Landing() {
  const [activeCity, setActiveCity] = React.useState(null);
  const [citiesData, setCitiesData] = React.useState(STATIC_CITIES);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const liveData = await publicService.getCityStats();
        if (liveData && mounted) {
          setCitiesData(liveData);
        }
      } catch (err) {
        if (mounted) console.error('[LandingPage] Failed to fetch city stats:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 10 minutes
    const interval = setInterval(fetchStats, 10 * 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const revealProps = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  return (
    <div className="min-h-screen bg-surface font-sans selection:bg-indigo-soft selection:text-indigo">
      <LandingNavbar />

      {/* ── 1. Hero Section ── */}
      <motion.section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-6" {...revealProps}>
        {/* Background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-indigo-soft rounded-full blur-3xl opacity-50 z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-coral-soft rounded-full blur-3xl opacity-50 z-0 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Hero Text */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center lg:text-left"
            >
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo/10 text-indigo text-[10px] font-bold tracking-[0.1em] uppercase mb-6 border border-indigo/10"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo"></span>
                </span>
                Live in 6 Cities
              </motion.div>
              
              <h1 className="font-display text-5xl lg:text-7xl/tight font-bold text-ink mb-6 tracking-tight">
                AI Insurance for <br className="hidden lg:block" />
                <span className="bg-gradient-to-r from-indigo via-indigo-600 to-teal bg-clip-text text-transparent">Food Riders</span>
              </h1>
              
              <p className="text-xl text-ink-muted mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                Automatically protect your income from rain, heat, floods and pollution. <span className="text-ink">No claims to file. Instant UPI payouts.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
                <Link to="/register" className="btn-primary w-full sm:w-auto !px-10 !py-4.5 !text-lg !rounded-full shadow-float hover:scale-105 transition-transform">
                  Get Coverage
                </Link>
                <Link to="/onboarding" className="btn-ghost w-full sm:w-auto !px-10 !py-4.5 !text-lg !rounded-full bg-white shadow-sm flex items-center justify-center gap-2 border border-border hover:bg-surface transition-colors">
                  <MonitorPlay className="w-5 h-5 text-indigo" /> Walkthrough
                </Link>
              </div>

              <div className="mt-12 flex items-center justify-center lg:justify-start gap-8">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-ink">14.2k+</span>
                  <span className="text-xs font-bold text-ink-muted/60 uppercase tracking-widest">Active Riders</span>
                </div>
                <div className="w-px h-10 bg-border"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-ink">₹85L+</span>
                  <span className="text-xs font-bold text-ink-muted/60 uppercase tracking-widest">Payouts Sent</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
              className="relative lg:ml-auto"
            >
              <div className="absolute inset-0 bg-indigo/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
              <img src="/hero.png" alt="Delivery Rider protected by GigShield" className="w-[540px] mx-auto drop-shadow-[0_20px_50px_rgba(79,70,229,0.3)] relative z-10" />
              
              {/* Floating Badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 md:right-0 bg-white p-4 rounded-2xl shadow-float border border-border flex items-center gap-3 z-20"
              >
                <div className="w-10 h-10 rounded-full bg-teal-soft flex items-center justify-center text-teal">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-ink-muted uppercase">Payout Status</p>
                  <p className="text-sm font-bold text-ink">Sent to UPI • 28s</p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </motion.section>

      {/* ── 1.5 Trusted By Marquee ── */}
      <motion.section className="py-12 border-y border-border bg-white/50 overflow-hidden" {...revealProps}>
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[10px] font-bold text-ink-muted/50 uppercase tracking-[0.2em] mb-8">Trusted by riders from top platforms</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
             {['Swiggy', 'Zomato'].map(name => (
               <div key={name} className="flex items-center gap-2 group cursor-default">
                  <div className="w-8 h-8 rounded bg-ink flex items-center justify-center text-white font-display font-bold text-xs group-hover:bg-indigo transition-colors">{name[0]}</div>
                  <span className="font-display font-bold text-lg text-ink tracking-tight">{name}</span>
               </div>
             ))}
          </div>
        </div>
      </motion.section>

      {/* ── 2. Problem Section ── */}
      <motion.section id="problem" className="py-24 bg-white px-6" {...revealProps}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-coral-soft rounded-[2rem] transform -rotate-3 transition-transform hover:rotate-0 duration-500"></div>
              <img src="/triggers.png" alt="Weather triggers" className="relative z-10 w-full rounded-[2rem] shadow-soft bg-white p-8 border border-border" />
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="font-display text-4xl font-bold text-ink mb-6">
                Food Delivery Riders Lose <span className="text-coral">20–30% Income</span> to Weather.
              </h2>
              <p className="text-lg text-ink-muted leading-relaxed mb-6">
                When heavy rain or extreme heat strikes, you are forced to stop working. The platforms might offer surge pricing, but only *if* you ride in dangerous conditions. 
              </p>
              <p className="text-lg text-ink-muted leading-relaxed mb-8">
                If you stay safe, you lose your daily earnings target.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Droplet, t: 'Monsoons', d: 'Average 14 days lost per year in Mumbai' },
                  { icon: Sun, t: 'Extreme Heat', d: 'Afternoon earnings drop by 40% in Delhi summers' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-surface">
                    <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-coral">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-ink">{item.t}</h4>
                      <p className="text-sm text-ink-muted">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 3. Solution Section ── */}
      <motion.section id="solution" className="py-24 bg-ink text-white px-6 overflow-hidden" {...revealProps}>
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-indigo-400 font-bold tracking-widest text-sm uppercase mb-3 block">How it Works</span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold mb-16">
            Automatic triggers. <br/>Zero paperwork.
          </h2>

          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-[45px] left-[10%] right-[10%] h-1 bg-ink-border z-0"></div>
            
            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {[
                { step: '1', title: 'Rain Detected', desc: 'Our API detects heavy rain in your working zone.' },
                { step: '2', title: 'AI Calculates', desc: 'We calculate your daily average income automatically.' },
                { step: '3', title: 'Fraud Check', desc: 'System verifies active status against platform.' },
                { step: '4', title: 'Instant Payout', desc: 'Money sent directly to your UPI ID within 30s.' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-24 h-24 mx-auto bg-ink-deep border-4 border-ink-border rounded-full flex items-center justify-center mb-6 text-3xl font-display font-bold text-indigo-400 shadow-[0_0_30px_rgba(74,29,150,0.5)]">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-xl mb-2">{s.title}</h3>
                  <p className="text-indigo-muted text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 3.5 Pricing Section ── */}
      <motion.section id="pricing" className="py-24 bg-white px-6" {...revealProps}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-ink mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-ink-muted">One plan. Full protection. Auto-deducted from your earnings.</p>
          </div>

          <div className="max-w-md mx-auto relative">
             <div className="absolute inset-0 bg-indigo-soft rounded-[2.5rem] rotate-2 -z-10 bg-gradient-to-br from-indigo-soft to-teal-soft/30"></div>
             <div className="card !p-10 border-2 border-indigo relative bg-white">
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-indigo text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Most Popular</div>
                
                <div className="mb-8">
                   <h3 className="text-2xl font-bold text-ink mb-2">GigShield Pro</h3>
                   <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-display font-bold text-indigo">₹150</span>
                      <span className="text-ink-muted font-bold">/week</span>
                   </div>
                </div>

                <ul className="space-y-4 mb-10">
                   {[
                     'Unlimited Rain Payouts',
                     'Heatwave Compensation',
                     'Pollution Health Benefit',
                     'Titanium Tier Eligibility',
                     'Instant UPI Settle',
                     'No Paperwork Claims'
                   ].map((f, i) => (
                     <li key={i} className="flex items-center gap-3 text-sm font-medium text-ink">
                        <div className="w-5 h-5 rounded-full bg-teal-soft flex items-center justify-center text-teal text-[10px]">✓</div>
                        {f}
                     </li>
                   ))}
                </ul>

                <Link to="/register" className="btn-primary w-full justify-center !py-4 shadow-float">Protect My Income</Link>
                <p className="text-center text-[10px] text-ink-muted mt-4 font-bold uppercase tracking-wider">Cancel anytime • No hidden fees</p>
             </div>
          </div>
        </div>
      </motion.section>

      {/* ── 4. Dashboard Preview ── */}
      <motion.section className="py-24 bg-surface px-6 relative" {...revealProps}>
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-ink mb-4">A dashboard made for you</h2>
          <p className="text-lg text-ink-muted">Track payouts, coverage limits, and your Rider Score.</p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-float border border-border bg-white p-2">
            <div className="bg-surface-sunken rounded-xl h-[600px] flex items-center justify-center border border-border/50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative">
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10"></div>
                
                {/* Mock UI Mockup within landing */}
                <div className="relative z-20 w-full max-w-4xl bg-white shadow-2xl rounded-xl border border-border overflow-hidden flex flex-col h-[500px] transform hover:-translate-y-2 transition-transform duration-500">
                  <div className="h-12 border-b border-border flex items-center px-4 bg-surface gap-2">
                     <div className="w-3 h-3 rounded-full bg-coral"></div>
                     <div className="w-3 h-3 rounded-full bg-amber"></div>
                     <div className="w-3 h-3 rounded-full bg-teal"></div>
                  </div>
                  <div className="flex-1 p-8 bg-surface/50 relative overflow-hidden">
                     <div className="grid grid-cols-3 gap-6 mb-8 opacity-30 group-hover:opacity-50 transition-opacity">
                        {['Daily Goal', 'Score', 'Next Payout'].map((label, i) => (
                          <div key={i} className="h-24 bg-gray-50 rounded-xl border border-border shadow-sm p-4 flex flex-col justify-between">
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-indigo-muted uppercase tracking-wider">{label}</span>
                                <div className="w-6 h-6 rounded bg-indigo/10"></div>
                             </div>
                             <div className="h-3 w-16 bg-indigo-soft rounded"></div>
                          </div>
                        ))}
                     </div>
                     <div className="h-64 bg-gray-50 rounded-xl border border-border shadow-sm mb-8 opacity-20 group-hover:opacity-40 transition-opacity flex flex-col p-6">
                        <div className="h-4 w-40 bg-indigo-soft rounded mb-10"></div>
                        <div className="flex-1 flex items-end gap-3 px-4">
                           {[40, 70, 50, 90, 60, 80, 45, 65, 85].map((h, i) => (
                             <div key={i} className="flex-1 bg-gradient-to-t from-indigo-soft to-indigo/20 rounded-t-lg" style={{ height: `${h}%` }}></div>
                           ))}
                        </div>
                     </div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-30">
                        <Link to="/dashboard" className="btn-primary flex items-center gap-2 !px-8 !py-4 shadow-float">
                          Explore Live Dashboard <ChevronRight className="w-5 h-5" />
                        </Link>
                     </div>
                     {/* Decorative blur elements for "Dashboard feeling" */}
                     <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo/5 blur-3xl rounded-full"></div>
                     <div className="absolute -top-24 -left-24 w-64 h-64 bg-coral/5 blur-3xl rounded-full"></div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 4.5 Testimonials ── */}
      <motion.section className="py-24 bg-ink text-white px-6 overflow-hidden relative" {...revealProps}>
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-indigo/10 blur-[120px] rounded-full"></div>
         
         <div className="max-w-6xl mx-auto relative z-10">
           <div className="text-center mb-16">
             <h2 className="font-display text-4xl font-bold mb-4 italic">Voice of the Riders</h2>
             <p className="text-lg text-indigo-200">Thousands of riders now work with peace of mind.</p>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: 'Rahul Sharma', city: 'Mumbai', platform: 'Swiggy', text: 'I lost 3 days last monsoon due to heavy rain. With GigShield, I got ₹1200 instantly. It is literally life-saving for us.' },
                { name: 'Mohit Kumar', city: 'Delhi', platform: 'Zomato', text: 'The heat in Delhi is unbearable. I stopped riding at 12 PM, and GigShield covered my lost afternoon earnings. Amazing.' },
                { name: 'Sankar S.', city: 'Chennai', platform: 'Zepto', text: 'No paperwork is the best part. I didn\'t even have to open the app. The money just arrived in my bank.' }
              ].map((t, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl flex flex-col justify-between hover:bg-white/10 transition-colors">
                   <p className="text-indigo-soft italic leading-relaxed mb-8">"{t.text}"</p>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo to-teal flex items-center justify-center font-bold text-xl">{t.name[0]}</div>
                      <div>
                         <p className="font-bold">{t.name}</p>
                         <p className="text-xs text-indigo-muted font-semibold">{t.platform} • {t.city}</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
         </div>
      </motion.section>

      {/* ── 5. Cities Risk Map ── */}
      <motion.section id="cities" className="py-24 bg-white px-6 border-t border-border" {...revealProps}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-4xl font-bold text-ink mb-6">Live City Triggers</h2>
              <p className="text-lg text-ink-muted mb-8">We monitor real-time weather and pollution APIs across 6 major Indian cities to automatically trigger your payouts.</p>
              <div className="grid grid-cols-2 gap-3 relative">
                {loading && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl">
                    <div className="w-6 h-6 border-2 border-indigo border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {citiesData.slice(0, 4).map(city => (
                  <div key={city.city} 
                       className="card p-4 cursor-pointer"
                       onMouseEnter={() => setActiveCity(city.city)}
                       onMouseLeave={() => setActiveCity(null)}
                  >
                    <p className="font-bold text-ink">{city.city}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${city.risk === 'HIGH' ? 'bg-coral' : city.risk === 'MODERATE' ? 'bg-amber' : 'bg-teal'}`}></div>
                      <span className="text-xs font-semibold text-ink-muted">{city.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div 
                onClick={() => document.getElementById('cities')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-6 text-sm font-semibold text-indigo cursor-pointer flex items-center gap-1 hover:text-indigo-600 hover:bg-indigo-soft/50 px-3 py-1.5 rounded-lg w-fit transition-colors"
              >
                View all supported cities <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            
            <div className="lg:pl-12">
               <MapView citiesData={citiesData} activeCity={activeCity} onCityClick={(c) => setActiveCity(c.city)} />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 5.5 FAQ Section ── */}
      <motion.section id="faq" className="py-24 bg-surface px-6" {...revealProps}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-ink mb-4">Questions? We got you.</h2>
          </div>

          <div className="space-y-4">
             {[
               { q: 'Is there any paperwork to file a claim?', a: 'No. Our system uses real-time weather APIs. If it rains above 5mm/hr in your GPS zone for 2+ hours, the payout is triggered automatically.' },
               { q: 'When do I get the money?', a: 'Payouts are processed within 30 seconds of the event ending. You receive it via UPI instantly.' },
               { q: 'Is heat covered as well?', a: 'Yes! If the temperature exceeds 42°C in your city, we trigger heatwave protection payouts representing your lost afternoon income.' },
               { q: 'How is the premium paid?', a: 'We deduct a small percentage (2.5% avg) from each delivery you complete. If you don\'t work, you don\'t pay.' }
             ].map((item, i) => (
               <details key={i} className="group bg-white rounded-2xl border border-border overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-ink hover:text-indigo transition-colors">
                     {item.q}
                     <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 text-ink-muted leading-relaxed">
                     {item.a}
                  </div>
               </details>
             ))}
          </div>
        </div>
      </motion.section>

      {/* ── Footer ── */}
      <footer className="bg-ink py-16 px-6 border-t border-ink-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-ink-deep flex items-center justify-center">
              <Shield className="w-4 h-4 text-indigo-muted" />
            </div>
            <span className="font-display font-bold text-white text-xl">GigShield</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-indigo-muted hover:text-white transition-colors">About</a>
            <a href="#" className="text-sm text-indigo-muted hover:text-white transition-colors">Docs</a>
            <a href="#" className="text-sm text-indigo-muted hover:text-white transition-colors">GitHub</a>
            <a href="#" className="text-sm text-indigo-muted hover:text-white transition-colors">Team</a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-ink-border text-center text-xs text-ink-muted">
          &copy; 2026 GigShield. DEVTrails Project.
        </div>
      </footer>
    </div>
  );
}
