import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Zap, TrendingDown, Radio, AlertTriangle } from 'lucide-react';
import StatCard from '../../components/StatCard';
import WeatherWidget from '../../components/WeatherWidget';
import axios from '../../api/axios';

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

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      // Map display name to event_type
      const event_type = disruptionType.includes('Rain') ? 'RAIN' : 
                         disruptionType.includes('Heat') ? 'HEAT' : 'POLLUTION';
      
      const res = await axios.post('/api/payouts/trigger', {
        city,
        event_type,
        severity: 'HIGH'
      });
      
      console.log('Disruption Triggered:', res.data);
      alert(`Success: ${res.data.riders_processed} payouts initiated for ${city}!`);
    } catch (err) {
      console.error('Simulation failed:', err);
      alert('Error triggering simulation. Check console.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-ink">Company Overview</h1>
        <p className="text-ink-muted mt-1">Real-time metrics for the GigShield platform.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        <StatCard icon={Users} label="Active Riders" value="1,245" accent="forest" />
        <StatCard icon={Shield} label="Weekly Premium Rev" value="₹1.55L" accent="mint" />
        <StatCard icon={Zap} label="Claims Payout" value="₹43,500" accent="amber" />
        <StatCard icon={TrendingDown} label="Loss Ratio" value="28.0%" accent="coral" sub="Target: <35%" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Weather Monitors */}
        <div className="card-gigshield sm:!p-6 !p-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-ink uppercase tracking-wider text-xs">Live Weather Monitors</h3>
            <span className="flex items-center gap-1.5 text-xs font-bold text-forest bg-mint/20 px-2 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse"></span> active
            </span>
          </div>

          <div className="space-y-4">
            <WeatherWidget city="Mumbai" status="Heavy Rain (18mm/hr)" level="HIGH" type="rain" />
            <WeatherWidget city="Delhi" status="Extreme Heat (43°C)" level="HIGH" type="heat" />
            <WeatherWidget city="Bangalore" status="Clear (28°C)" level="LOW" type="wind" />
          </div>
        </div>

        {/* Disruption Simulator (Admin Demo Tool) */}
        <div className="card-gigshield sm:!p-6 !p-4 border-2 !border-mint/20 !bg-mint/5">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-5 h-5 text-forest" />
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
                className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all"
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
                className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all"
              >
                <option>Heavy Rain (&gt;15mm/hr)</option>
                <option>Extreme Heat (&gt;42°C)</option>
                <option>Pollution Alert (AQI &gt;400)</option>
              </select>
            </div>

            <button 
              onClick={handleSimulate}
              disabled={isSimulating}
              className={`w-full py-3.5 rounded-lg text-sm font-bold shadow-float transition-all ${isSimulating ? 'bg-forest/70 text-white cursor-not-allowed' : 'btn-gigshield-primary'}`}
            >
              {isSimulating ? 'Triggering Flow...' : 'SIMULATE EVENT & TRIGGER PAYOUTS'}
            </button>
            <p className="text-center text-xs text-ink-muted">Simulates API trigger → Fraud check → Bank Payouts</p>
          </div>
        </div>
      </div>

      {/* Fraud Monitoring Feed */}
      <div className="mt-10 card-gigshield !p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-ink">Recent Anti-Spoofing Activity</h3>
          </div>
          <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest italic">Live Analysis Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-ink-muted text-[10px] font-black uppercase tracking-widest">
                <th className="pb-4">Rider ID</th>
                <th className="pb-4">Time</th>
                <th className="pb-4">Velocity</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Risk</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: '#420', time: '2m ago', vel: '22 km/h', status: 'Verified', risk: 'bg-mint' },
                { id: '#881', time: '5m ago', vel: '190 km/h', status: 'SUSPICIOUS', risk: 'bg-red-500' },
                { id: '#102', time: '8m ago', vel: '14 km/h', status: 'Verified', risk: 'bg-mint' },
                { id: '#993', time: '12m ago', vel: '88 km/h', status: 'Anomalous', risk: 'bg-amber-400' },
              ].map((log, i) => (
                <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-surface-sunken transition-colors">
                  <td className="py-4 font-bold text-forest">{log.id}</td>
                  <td className="py-4 text-ink-muted">{log.time}</td>
                  <td className="py-4 font-medium">{log.vel}</td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${log.status === 'Verified' ? 'text-forest bg-mint/20' : 'text-white bg-red-400'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className={`w-2 h-2 rounded-full ${log.risk}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
