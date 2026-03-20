import React from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Briefcase, Phone, Edit2, ShieldCheck, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Card from '../../components/Card';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { rider, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Fallback redirect
      navigate('/login');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-ink">My Profile</h1>
        <p className="text-ink-muted mt-1">Manage your details and platform connection.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left Col: Avatar & Actions */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-indigo to-teal p-1 mb-4 shadow-soft">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-3xl font-display font-bold text-indigo">
                {rider?.name?.charAt(0) || 'R'}
              </div>
            </div>
            <h2 className="text-xl font-bold text-ink mb-1">{rider?.name || 'Rider Name'}</h2>
            {rider?.isVerified && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-soft text-teal text-xs font-bold rounded-full mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Profile
              </div>
            )}
            
            <button 
              onClick={() => alert('Editing profile is disabled in demo mode.')}
              className="btn-ghost w-full justify-center gap-2 mb-2 text-indigo flex items-center"
            >
              <Edit2 className="w-4 h-4" /> Edit Profile (TODO)
            </button>
            <button onClick={handleLogout} className="btn-ghost w-full justify-center gap-2 text-coral hover:bg-coral-soft">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </Card>
        </div>

        {/* Right Col: Details */}
        <div className="md:col-span-2 space-y-6">
          
          <Card>
            <div className="p-5 border-b border-border bg-surface-sunken/50">
              <h3 className="font-bold text-ink uppercase tracking-wider text-xs">Personal Details</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-border/50">
                <div className="flex items-center gap-3 text-ink-muted mb-1 sm:mb-0">
                  <User className="w-4 h-4" /> Full Name
                </div>
                <div className="font-medium text-ink">{rider?.name || 'Not Available'}</div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-border/50">
                <div className="flex items-center gap-3 text-ink-muted mb-1 sm:mb-0">
                  <Phone className="w-4 h-4" /> Phone Number
                </div>
                <div className="font-medium text-ink">+91 {rider?.phone || '**********'}</div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-border/50">
                <div className="flex items-center gap-3 text-ink-muted mb-1 sm:mb-0">
                  <MapPin className="w-4 h-4" /> Primary City
                </div>
                <div className="font-medium text-ink">{rider?.city || 'Mumbai'}</div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2">
                <div className="flex items-center gap-3 text-ink-muted mb-1 sm:mb-0">
                  <MapPin className="w-4 h-4" /> Working Zone
                </div>
                <div className="font-medium text-ink">{rider?.zone || 'Andheri West'}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5 border-b border-border bg-surface-sunken/50 flex items-center justify-between">
              <h3 className="font-bold text-ink uppercase tracking-wider text-xs">Platform Connection</h3>
              <span className="badge bg-teal text-white border-0 shadow-sm shadow-teal/20">Synced via API</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-border/50">
                <div className="flex items-center gap-3 text-ink-muted mb-1 sm:mb-0">
                  <Briefcase className="w-4 h-4" /> Aggregator
                </div>
                <div className="font-bold text-ink flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${rider?.platform === 'Zomato' ? 'bg-coral' : 'bg-amber'}`} />
                  {rider?.platform || 'Delivery Platform'}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-border/50">
                <div className="flex items-center gap-3 text-ink-muted mb-1 sm:mb-0">
                  Tenure
                </div>
                <div className="font-medium text-ink">{rider?.tenure_months || 0} Months</div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2">
                <div className="flex items-center gap-3 text-ink-muted mb-1 sm:mb-0">
                  Lifetime Rating
                </div>
                <div className="font-medium text-ink flex items-center gap-1">
                  ⭐ {rider?.rating ? `${rider.rating} / 5.0` : 'No rating yet'}
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </motion.div>
  );
}
