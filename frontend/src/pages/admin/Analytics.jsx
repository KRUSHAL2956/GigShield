import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, FileSpreadsheet, Lock } from 'lucide-react';
import Card from '../../components/Card';
import Chart from '../../components/Chart';
import StatCard from '../../components/StatCard';

const REVENUE_DATA = [
  { name: 'Week 1', value: 85000 },
  { name: 'Week 2', value: 92000 },
  { name: 'Week 3', value: 110000 },
  { name: 'Week 4', value: 125000 },
  { name: 'Week 5', value: 155000 },
];

const CLAIMS_BY_CITY = [
  { name: 'Mumbai', value: 45000 },
  { name: 'Delhi', value: 38000 },
  { name: 'Pune', value: 12000 },
  { name: 'Kolkata', value: 8000 },
];

export default function AdminAnalytics() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl">
       <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink">Analytics & Reserve</h1>
          <p className="text-ink-muted mt-1">Financial health and payout pool tracking.</p>
        </div>
        <button disabled aria-disabled="true" className="btn-primary flex items-center justify-center gap-2 shadow-sm opacity-50 cursor-not-allowed">
          <FileSpreadsheet className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-2 p-8 bg-gradient-to-tr from-teal-500 to-teal-700 text-white relative overflow-hidden flex flex-col justify-center">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-2 text-teal-100 font-bold uppercase tracking-wider text-sm mb-4">
              <Lock className="w-5 h-5" /> Escrow Reserve Fund
            </div>
            <div className="text-5xl font-display font-bold mb-2">₹12,45,000</div>
            <p className="text-teal-50">Current balance in platform payout pool. Maintained at ≥4x Weekly Expected Claims.</p>
        </Card>
        
        <div className="space-y-6">
           <StatCard icon={TrendingUp} label="Total Premiums Collected" value="₹5.67L" accent="indigo" sub="Since Launch" />
           <StatCard icon={TrendingUp} label="Total Claims Disbursed" value="₹1.2L" accent="amber" sub="Since Launch" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="font-bold text-ink uppercase tracking-wider text-xs mb-6">Premium Growth Trend (5 Weeks)</h3>
          <Chart data={REVENUE_DATA} type="area" color="#4a1d96" height={250} valueFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-ink uppercase tracking-wider text-xs mb-6">Claims by City (This Month)</h3>
          <Chart data={CLAIMS_BY_CITY} type="bar" color="#0d9488" height={250} valueFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
        </Card>
      </div>
    </motion.div>
  );
}
