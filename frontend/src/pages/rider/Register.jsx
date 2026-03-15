import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bike, ChevronRight, User, Phone, IndianRupee, Shield, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad'];
const ZONES = {
  Mumbai: ['Andheri', 'Powai', 'Dharavi', 'Bandra', 'Kurla', 'Dadar', 'Malad'],
  Delhi: ['Dwarka', 'Rohini', 'Saket', 'Noida', 'Gurgaon', 'Karol Bagh'],
  Bangalore: ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Jayanagar'],
  Chennai: ['T Nagar', 'Adyar', 'Tambaram', 'Velachery', 'Anna Nagar'],
  Pune: ['Kothrud', 'Viman Nagar', 'Hinjewadi', 'Shivaji Nagar', 'Hadapsar'],
  Hyderabad: ['Banjara Hills', 'Gachibowli', 'Madhapur', 'Secunderabad', 'Kukatpally'],
};

const ease = [0.4, 0, 0.2, 1];

function Register() {
  const navigate = useNavigate();
  const { setAuth, setScore } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', city: 'Mumbai', zone: '', platform: 'Swiggy', avg_weekly_earnings: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value, ...(name === 'city' ? { zone: '' } : {}) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/riders/register', {
        ...form, avg_weekly_earnings: parseFloat(form.avg_weekly_earnings),
      });
      setAuth(res.data.rider, res.data.token);
      if (res.data.score) setScore(res.data.score);
      toast.success('Welcome to GigShield!');
      navigate('/verify');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-bg flex relative">
      <Link to="/" className="absolute top-8 left-8 z-50 flex items-center gap-2 text-ink-muted hover:text-indigo transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      {/* ── Left: Hero ───────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-center items-center p-12 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="relative z-10 max-w-md text-center"
        >
          <div className="flex justify-center mb-12">
            <img src="/logo.png" alt="GigShield Logo" className="h-10 object-contain" />
          </div>
          <img
            src="/hero.png"
            alt="Delivery rider protected by shield"
            className="w-80 mx-auto mb-8 drop-shadow-lg"
          />
          <h2 className="font-display text-3xl font-bold text-ink mb-3">
            Rain or shine, you're&nbsp;covered.
          </h2>
          <p className="text-ink-muted text-base leading-relaxed">
            GigShield auto-detects disruptions and sends payouts to your UPI
            — no claims, no paperwork, zero hassle.
          </p>

          {/* Trust strip */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {['5,000+ riders', 'AI-powered', '< 30s payouts'].map((t) => (
              <span key={t} className="badge bg-white/70 text-ink-muted shadow-soft">
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right: Form ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-5 md:p-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.15 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo flex items-center justify-center mx-auto mb-3">
              <Shield className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink">GigShield</h1>
            <p className="text-ink-muted text-sm mt-1">Income protection for delivery riders</p>
          </div>

          <div className="card p-7 md:p-8">
            <h2 className="font-display text-xl font-bold text-ink mb-1">Create account</h2>
            <p className="text-ink-muted text-sm mb-6">Start your coverage in under 2 minutes</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-muted/50" />
                  <input name="name" value={form.name} onChange={handleChange} required
                    placeholder="Ravi Kumar" className="input-field" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-muted/50" />
                  <input name="phone" value={form.phone} onChange={handleChange} required
                    type="tel" pattern="[6-9][0-9]{9}" placeholder="9876543210" className="input-field" />
                </div>
              </div>

              {/* City + Zone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">City</label>
                  <select name="city" value={form.city} onChange={handleChange} className="select-field">
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Zone</label>
                  <select name="zone" value={form.zone} onChange={handleChange} required className="select-field">
                    <option value="">Select</option>
                    {(ZONES[form.city] || []).map((z) => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
              </div>

              {/* Platform */}
              <div>
                <label className="label">Platform</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Swiggy', 'Zomato'].map((p) => (
                    <button key={p} type="button"
                      onClick={() => setForm((f) => ({ ...f, platform: p }))}
                      className={`py-3 rounded-sm border-[1.5px] font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                        form.platform === p
                          ? 'bg-indigo-soft border-indigo text-indigo'
                          : 'bg-surface border-border text-ink-muted hover:border-ink-muted/40'
                      }`}
                    >
                      <Bike className="w-4 h-4" /> {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Earnings */}
              <div>
                <label className="label">Avg Weekly Earnings</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-muted/50" />
                  <input name="avg_weekly_earnings" value={form.avg_weekly_earnings} onChange={handleChange}
                    required type="number" min="500" max="20000" placeholder="5000" className="input-field" />
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? <span className="spinner" /> : <>Get Started <ChevronRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-center text-sm text-ink-muted mt-5">
              Already have an account?{' '}
              <Link to="/verify" className="text-indigo font-semibold hover:underline">Log in</Link>
            </p>
          </div>

          <p className="text-center text-xs text-ink-muted/60 mt-6">
            By signing up you agree to our <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo">Terms</a> & <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;
