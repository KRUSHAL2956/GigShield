import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Zap, TrendingDown, Radio } from 'lucide-react';
import StatCard from '../../components/StatCard';
import WeatherWidget from '../../components/WeatherWidget';

export default function AdminDashboard() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [city, setCity] = useState('Mumbai');
  const [disruptionType, setDisruptionType] = useState('Heavy Rain (>15mm/hr)');
  const simulateTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (simulateTimerRef.current) clearTimeout(simulateTimerRef.current);
    };
  }, []);

  const handleSimulate = () => {
    setIsSimulating(true);
    // In a real app, we would use the 'city' and 'disruptionType' state here for the payload
    simulateTimerRef.current = setTimeout(() => {
      setIsSimulating(false);
    }, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-ink">Company Overview</h1>
        <p className="text-ink-muted mt-1">Real-time metrics for the GigShield platform.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        <StatCard icon={Users} label="Active Riders" value="1,245" accent="indigo" />
        <StatCard icon={Shield} label="Weekly Premium Rev" value="₹1.55L" accent="teal" />
        <StatCard icon={Zap} label="Claims Payout" value="₹43,500" accent="amber" />
        <StatCard icon={TrendingDown} label="Loss Ratio" value="28.0%" accent="coral" sub="Target: <35%" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Weather Monitors */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-ink uppercase tracking-wider text-xs">Live Weather Monitors</h3>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-teal bg-teal-soft px-2 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse"></span> active
            </span>
          </div>

          <div className="space-y-4">
            <WeatherWidget city="Mumbai" status="Heavy Rain (18mm/hr)" level="HIGH" type="rain" />
            <WeatherWidget city="Delhi" status="Extreme Heat (43°C)" level="HIGH" type="heat" />
            <WeatherWidget city="Bangalore" status="Clear (28°C)" level="LOW" type="wind" />
          </div>
        </div>

        {/* Disruption Simulator (Admin Demo Tool) */}
        <div className="card p-6 border-2 border-indigo-400/20 bg-indigo-50/30">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-5 h-5 text-indigo" />
            <h3 className="font-bold text-ink">Disruption Engine Simulator</h3>
          </div>
          <p className="text-sm text-ink-muted mb-8">Force trigger an event to demo the system.</p>

          <div className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="city-select" className="text-xs font-bold text-ink-muted uppercase tracking-wider">Select City</label>
              <select 
                id="city-select"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo/20 focus:border-indigo outline-none transition-all"
              >
                <option>Mumbai</option>
                <option>Delhi</option>
                <option>Bangalore</option>
              </select>
            </div>

            <div className="space-y-3">
              <label htmlFor="disruption-select" className="text-xs font-bold text-ink-muted uppercase tracking-wider">Disruption Type</label>
              <select 
                id="disruption-select"
                value={disruptionType}
                onChange={(e) => setDisruptionType(e.target.value)}
                className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo/20 focus:border-indigo outline-none transition-all"
              >
                <option>Heavy Rain (&gt;15mm/hr)</option>
                <option>Extreme Heat (&gt;42°C)</option>
                <option>Pollution Alert (AQI &gt;400)</option>
              </select>
            </div>

            <button 
              onClick={handleSimulate}
              disabled={isSimulating}
              className={`w-full py-3.5 rounded-lg text-sm font-bold shadow-float transition-all text-white ${isSimulating ? 'bg-indigo/70 cursor-not-allowed' : 'bg-gradient-to-r from-indigo to-teal hover:-translate-y-1'}`}
            >
              {isSimulating ? 'Triggering Flow...' : 'SIMULATE EVENT & TRIGGER PAYOUTS'}
            </button>
            <p className="text-center text-xs text-ink-muted">Simulates API trigger → Fraud check → Bank Payouts</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
