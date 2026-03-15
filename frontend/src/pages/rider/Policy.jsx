import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CreditCard, FileText, CheckCircle2 } from 'lucide-react';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';

export default function Policy() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <h1 className="font-display font-bold text-3xl text-ink mb-2">My Policy</h1>
      <p className="text-ink-muted mb-8">Manage your active coverage and premium payments.</p>

      {/* Active Policy Status Container */}
      <div className="bg-white rounded-[1.5rem] border border-border shadow-soft overflow-hidden mb-8">
        
        {/* Header Section */}
        <div className="bg-indigo p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[300px] h-[300px] bg-white/10 rounded-full blur-2xl z-0" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-0.5">Active Plan</p>
                <h2 className="text-2xl font-bold">Standard Income Shield</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white text-indigo px-4 py-2 rounded-lg font-bold shadow-sm whitespace-nowrap self-start md:self-auto">
              <CheckCircle2 className="w-4 h-4 text-teal" />
              Status: Active
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Payment Details */}
            <div className="space-y-5">
              <h3 className="font-bold text-ink uppercase tracking-wider text-xs">Payment Information</h3>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-ink-muted">Weekly Premium</span>
                <span className="font-semibold text-ink">₹125.00</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-ink-muted">Next Deduction</span>
                <span className="font-semibold text-ink">Mon, Oct 15</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-ink-muted">Payment Method</span>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo" />
                  <span className="font-semibold text-ink">UPI Auto-pay</span>
                </div>
              </div>
            </div>

            {/* Coverage Details */}
            <div className="space-y-5">
              <h3 className="font-bold text-ink uppercase tracking-wider text-xs">Coverage Limits</h3>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-ink-muted">Per Event Cap</span>
                <span className="font-semibold text-ink">₹800</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-ink-muted">Weekly Max Cap</span>
                <span className="font-semibold text-ink">₹2,000</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-ink-muted">Monthly Max Cap</span>
                <span className="font-semibold text-ink">₹5,000</span>
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="bg-surface-sunken p-5 rounded-xl border border-border/50">
            <h3 className="font-bold text-ink uppercase tracking-wider text-xs mb-4">Coverage Usage</h3>
            <div className="space-y-4">
              <ProgressBar label="Weekly Cap Utilized" used={580} cap={2000} color="bg-indigo" />
              <ProgressBar label="Monthly Cap Utilized" used={1450} cap={5000} color="bg-teal" />
            </div>
          </div>
        </div>
      </div>

      <h3 className="font-display font-bold text-xl text-ink mb-4">Policy Documents</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4 flex items-center justify-between" interactive>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-soft flex items-center justify-center text-indigo">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-ink">Terms of Coverage</p>
              <p className="text-xs text-ink-muted">Updated Oct 2026</p>
            </div>
          </div>
          <button type="button" disabled className="text-indigo text-sm font-semibold hover:underline opacity-50 cursor-not-allowed">View PDF</button>
        </Card>
        <Card className="p-4 flex items-center justify-between" interactive>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-soft flex items-center justify-center text-teal">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-ink">Auto-pay Mandate</p>
              <p className="text-xs text-ink-muted">UPI ID: ***@upi</p>
            </div>
          </div>
          <button type="button" disabled className="text-teal text-sm font-semibold hover:underline opacity-50 cursor-not-allowed">Manage</button>
        </Card>
      </div>
    </motion.div>
  );
}
