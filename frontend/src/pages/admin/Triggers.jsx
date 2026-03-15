import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Map, Sun, Wind, CloudRain, AlertTriangle, Play } from 'lucide-react';
import Card from '../../components/Card';
import MapView from '../../components/MapView';
import WeatherWidget from '../../components/WeatherWidget';

const CITIES_DATA = [
  { city: 'Mumbai', risk: 'HIGH', status: 'Heavy Rain 18mm/hr' },
  { city: 'Delhi', risk: 'HIGH', status: 'Extreme Heat 42°C' },
  { city: 'Bangalore', risk: 'LOW', status: 'Clear 28°C' },
  { city: 'Chennai', risk: 'MODERATE', status: 'Humidity 85%' },
  { city: 'Pune', risk: 'LOW', status: 'Clear 30°C' },
  { city: 'Hyderabad', risk: 'LOW', status: 'Clear 32°C' },
  { city: 'Kolkata', risk: 'MODERATE', status: 'Rain 5mm/hr' }
];

export default function AdminTriggers() {
  const [activeCity, setActiveCity] = useState(null);
  
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-ink">Live Triggers & APIs</h1>
        <p className="text-ink-muted mt-1">Monitor real-time weather data and trigger status across cities.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Map View */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-ink uppercase tracking-wider text-xs">National Risk Map</h3>
            <span className="badge bg-indigo-soft text-indigo">{CITIES_DATA.length} Active Cities</span>
          </div>
          <MapView citiesData={CITIES_DATA} activeCity={activeCity} onCityClick={(c) => setActiveCity(c.city)} />
        </Card>

        {/* Live Event Feed */}
        <div className="space-y-4">
          <h3 className="font-bold text-ink uppercase tracking-wider text-xs mb-2">Live Alert Feed</h3>
          
          <div className="bg-coral-soft/50 border border-coral-soft rounded-xl p-4 flex gap-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-2 h-full bg-coral animate-pulse"></div>
             <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center flex-shrink-0 text-coral">
                <CloudRain className="w-5 h-5" />
             </div>
             <div>
               <div className="flex items-center gap-2 mb-1">
                 <span className="text-xs font-bold px-2 py-0.5 bg-coral text-white rounded">TRIGGERED</span>
                 <span className="text-xs text-ink-muted">Just now • Mumbai</span>
               </div>
               <p className="font-semibold text-ink">Heavy Rain Protocol Initiated</p>
               <p className="text-sm text-ink-muted mt-1">IMD API reported 18mm/hr in Andheri West. Scanning 840 active riders in zone for automated payouts.</p>
             </div>
          </div>

          <div className="bg-amber-soft/50 border border-amber-soft rounded-xl p-4 flex gap-4">
             <div className="w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center flex-shrink-0 text-amber">
                <Sun className="w-5 h-5" />
             </div>
             <div>
               <div className="flex items-center gap-2 mb-1">
                 <span className="text-xs font-bold px-2 py-0.5 bg-amber text-white rounded">WARNING</span>
                 <span className="text-xs text-ink-muted">2 mins ago • Delhi</span>
               </div>
               <p className="font-semibold text-ink">Temperature Approaching Threshold</p>
               <p className="text-sm text-ink-muted mt-1">Current: 41.5°C. Trigger set at 42°C. Monitoring closely.</p>
             </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 flex gap-4 opacity-75">
             <div className="w-10 h-10 rounded-full bg-surface-sunken flex items-center justify-center flex-shrink-0 text-ink-muted">
                <AlertTriangle className="w-5 h-5" />
             </div>
             <div>
               <div className="flex items-center gap-2 mb-1">
                 <span className="text-xs font-bold px-2 py-0.5 bg-surface-sunken text-ink-muted rounded">RESOLVED</span>
                 <span className="text-xs text-ink-muted">4 hours ago • Chennai</span>
               </div>
               <p className="font-semibold text-ink">AQI Dropped Below Critical</p>
               <p className="text-sm text-ink-muted mt-1">Pollution alert lifted. Normal coverage resumed.</p>
             </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
}
