import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ShieldCheck, AlertCircle } from 'lucide-react';
import Card from '../../components/Card';
import TierBadge from '../../components/TierBadge';

const MOCK_RIDERS = [
  { id: 1, name: 'Rahul Sharma', phone: '9876543210', city: 'Mumbai', score: 98, tier: 'Titanium', claims: 12, status: 'active' },
  { id: 2, name: 'Amit Kumar', phone: '8765432109', city: 'Delhi', score: 85, tier: 'Gold', claims: 4, status: 'active' },
  { id: 3, name: 'Priya Desai', phone: '7654321098', city: 'Pune', score: 42, tier: 'Silver', claims: 28, status: 'flagged' },
  { id: 4, name: 'Vikas Singh', phone: '6543210987', city: 'Bangalore', score: 91, tier: 'Titanium', claims: 8, status: 'active' },
  { id: 5, name: 'Mohammed Ali', phone: '5432109876', city: 'Hyderabad', score: 76, tier: 'Gold', claims: 15, status: 'active' },
];

export default function AdminRiders() {
  const [search, setSearch] = React.useState('');

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink">Riders Directory</h1>
          <p className="text-ink-muted mt-1">Manage all insured gig workers and view their risk profiles.</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-border bg-surface-sunken/50 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input 
              type="text" 
              placeholder="Search by name, phone or city..." 
              aria-label="Search riders by name, phone or city"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
            />
          </div>
          <button 
            disabled 
            title="Filter Coming Soon"
            className="btn-ghost shadow-sm bg-white border border-border flex items-center justify-center gap-2 whitespace-nowrap opacity-50 cursor-not-allowed"
          >
            <Filter className="w-4 h-4" /> Filter (TODO)
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface text-xs tracking-wider uppercase text-ink-muted">
                <th className="px-5 py-4 font-semibold border-b border-border">Rider</th>
                <th className="px-5 py-4 font-semibold border-b border-border">Location</th>
                <th className="px-5 py-4 font-semibold border-b border-border">Score / Tier</th>
                <th className="px-5 py-4 font-semibold border-b border-border">Total Claims</th>
                <th className="px-5 py-4 font-semibold border-b border-border">Account Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_RIDERS.filter(r => 
                r.name.toLowerCase().includes(search.toLowerCase()) || 
                r.city.toLowerCase().includes(search.toLowerCase()) ||
                r.phone.includes(search)
              ).map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-surface-sunken transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-soft text-indigo flex intelligence-center justify-center font-bold text-xs">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-ink text-sm">{r.name}</p>
                        <p className="text-xs text-ink-muted">{r.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-ink">{r.city}</td>
                  <td className="px-5 py-4">
                     <div className="flex items-center gap-2">
                        <span className={`font-bold ${r.score >= 90 ? 'text-indigo' : r.score >= 70 ? 'text-amber' : 'text-coral'}`}>
                          {r.score}
                        </span>
                        <TierBadge tier={r.tier} showIcon={false} size="sm" />
                     </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-ink">{r.claims}</td>
                  <td className="px-5 py-4">
                    {r.status === 'active' ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-soft text-teal text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Good Standing
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-coral-soft text-coral text-xs font-bold">
                        <AlertCircle className="w-3.5 h-3.5" /> High Risk Flag
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {MOCK_RIDERS.filter(r => 
                r.name.toLowerCase().includes(search.toLowerCase()) || 
                r.city.toLowerCase().includes(search.toLowerCase()) ||
                r.phone.includes(search)
              ).length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-ink-muted bg-surface/30">
                    <p className="text-sm">No riders found matching "{search}"</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}
