import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bike, ChevronRight, ChevronLeft, User, Mail, Wallet, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { auth, googleProvider } from '../../utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import { authenticateWithFirebase } from '../../services/dbServices';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad'];
const ZONES = {
  Mumbai: ['Andheri', 'Powai', 'Dharavi', 'Bandra', 'Kurla', 'Dadar', 'Malad'],
  Delhi: ['Dwarka', 'Rohini', 'Saket', 'Noida', 'Gurgaon', 'Karol Bagh'],
  Bangalore: ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Jayanagar'],
  Chennai: ['T Nagar', 'Adyar', 'Tambaram', 'Velachery', 'Anna Nagar'],
  Pune: ['Kothrud', 'Viman Nagar', 'Hinjewadi', 'Shivaji Nagar', 'Hadapsar'],
  Hyderabad: ['Banjara Hills', 'Gachibowli', 'Madhapur', 'Secunderabad', 'Kukatpally'],
};

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, setScore } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [[step, dir], setStep] = useState([0, 0]);

  const fbData = location.state?.firebaseData || {};
  const sanitize = (ph) => ph ? ph.replace(/\D/g, '').slice(-10) : '';

  const [form, setForm] = useState({
    name: fbData.name || '',
    email: fbData.email || '',
    phone: sanitize(fbData.phone),
    password: '',
    city: 'Mumbai',
    zone: '',
    platform: 'Swiggy',
    avg_weekly_earnings: '',
    hours_per_day: '8',
    experience: '6-12 months',
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v, ...(k === 'city' ? { zone: '' } : {}) }));

  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim()) { toast.error('Name is required'); return false; }
      if (!form.email.trim() || !form.email.includes('@')) { toast.error('Valid email is required'); return false; }
      if (!/^[6-9]\d{9}$/.test(form.phone)) { toast.error('Valid phone is required'); return false; }
      if (!form.password || form.password.length < 8) { toast.error('Password must be at least 8 characters'); return false; }
    } else if (step === 1) {
      if (!form.zone) { toast.error('Select your zone'); return false; }
      if (!form.avg_weekly_earnings || +form.avg_weekly_earnings < 500) { toast.error('Min earnings ₹500'); return false; }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep([step + 1, 1]); };
  const back = () => { if (step > 0) setStep([step - 1, -1]); };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await authenticateWithFirebase(idToken);
      if (res.needsRegistration) {
        setForm(p => ({
          ...p,
          name: res.firebaseData.name || p.name,
          email: res.firebaseData.email || p.email,
        }));
        toast.success('Google linked! Complete your profile.');
      } else {
        setAuth(res.rider);
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') toast.error('Google sign-up failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    try {
      const res = await api.post('/api/riders/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        city: form.city,
        zone: form.zone,
        platform: form.platform,
        avg_weekly_earnings: +form.avg_weekly_earnings,
        firebase_uid: fbData.uid || auth.currentUser?.uid,
      });
      setAuth(res.data.rider);
      if (res.data.score) setScore(res.data.score);
      toast.success('🎉 Registration complete!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={topBar}>
        {step === 0 ? (
          <Link to="/" style={topLink}><ChevronLeft size={18} /> Back to Home</Link>
        ) : (
          <button type="button" onClick={back} style={{ ...topLink, background: 'none', border: 'none', cursor: 'pointer' }}>
            <ChevronLeft size={18} /> Previous Step
          </button>
        )}
      </div>

      <div style={center}>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={card}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={logoWrapper}>
               <img src="/logo.png" alt="GigShield" style={{ height: 32 }} />
            </div>
            <h1 style={heading}>Create Account</h1>
            <p style={subheading}>
              {step === 0 && "Let's start with your basic details"}
              {step === 1 && "Tell us about your delivery work"}
            </p>
          </div>

          <div style={progressContainer}>
            <div style={{ ...progressBar, width: `${((step + 1) / 2) * 100}%` }} />
          </div>

          <form onSubmit={handleSubmit} style={{ position: 'relative', minHeight: 400 }}>
            <AnimatePresence mode="wait" initial={false}>
              {step === 0 && (
                <Step1 
                  key="step0"
                  form={form} 
                  update={update} 
                  next={next} 
                  handleGoogle={handleGoogle} 
                  googleLoading={googleLoading}
                />
              )}
              {step === 1 && (
                <Step2 
                  key="step1"
                  form={form} 
                  update={update} 
                  back={back} 
                  loading={loading} 
                />
              )}
            </AnimatePresence>
          </form>

          <p style={footerText}>
            Step {step + 1} of 2
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Step Components ───

function Step1({ form, update, next, handleGoogle, googleLoading }) {
  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      exit={{ x: -20, opacity: 0 }} 
      transition={{ duration: 0.3 }}
      style={{ background: '#fff' }}
    >
      <div style={fieldWrap}>
        <label style={label}>Full Name</label>
        <div style={inputContainer}>
          <User style={fieldIcon} />
          <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Rahul Sharma" style={boxInput} />
        </div>
      </div>
      
      <div style={fieldWrap}>
        <label style={label}>Email ID</label>
        <div style={inputContainer}>
          <Mail style={fieldIcon} />
          <input value={form.email} onChange={(e) => update('email', e.target.value)} type="email" placeholder="rahul@example.com" style={boxInput} />
        </div>
      </div>

      <div style={fieldWrap}>
        <label style={label}>Phone Number</label>
        <div style={{ display: 'flex' }}>
          <div style={prefixBox}>+91</div>
          <input 
            value={form.phone} 
            onChange={(e) => update('phone', e.target.value)} 
            type="tel" 
            pattern="[6-9][0-9]{9}" 
            placeholder="98765 43210" 
            style={{ ...boxInput, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} 
          />
        </div>
      </div>

      <div style={fieldWrap}>
        <label style={label}>Password</label>
        <div style={inputContainer}>
          <User style={fieldIcon} />
          <input 
            value={form.password} 
            onChange={(e) => update('password', e.target.value)} 
            type="password" 
            placeholder="Create a strong password" 
            style={boxInput} 
          />
        </div>
      </div>

      <button type="button" onClick={next} style={{ ...primaryBtn, background: '#10b981' }}>
        Continue <ChevronRight style={{ width: 18, height: 18 }} />
      </button>

      <>
        <div style={divider}>
          <span style={line} />
          <span style={dividerText}>or</span>
          <span style={line} />
        </div>

        <button type="button" onClick={handleGoogle} disabled={googleLoading} style={socialBtn}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" style={{ width: 18, height: 18 }} />
          Sign up with Google
        </button>
      </>

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#666' }}>
        Already have an account? <Link to="/login" style={linkStyle}>Log in</Link>
      </p>
    </motion.div>
  );
}

function Step2({ form, update, back, loading }) {
  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      exit={{ x: -20, opacity: 0 }} 
      transition={{ duration: 0.3 }}
      style={{ background: '#fff' }}
    >
      <div style={fieldWrap}>
        <label style={label}>Platform</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Swiggy', 'Zomato'].map(p => (
            <button key={p} type="button" onClick={() => update('platform', p)} style={{ ...pillBtn, background: form.platform === p ? 'var(--forest-green)' : '#fff', color: form.platform === p ? '#fff' : 'var(--forest-green)', borderColor: form.platform === p ? 'var(--forest-green)' : 'var(--border)' }}>
              <Bike style={{ width: 14, height: 14 }} /> {p}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, ...fieldWrap }}>
        <div style={{ flex: 1 }}>
          <label style={label}>City</label>
          <select value={form.city} onChange={(e) => update('city', e.target.value)} style={selectBox}>
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={label}>Zone</label>
          <select value={form.zone} onChange={(e) => update('zone', e.target.value)} required style={selectBox}>
            <option value="">Select</option>
            {(ZONES[form.city] || []).map(z => <option key={z}>{z}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, ...fieldWrap }}>
        <div style={{ flex: 1 }}>
          <label style={label}>Weekly Earnings</label>
          <div style={inputContainer}>
            <Wallet style={fieldIcon} />
            <input type="number" value={form.avg_weekly_earnings} onChange={(e) => update('avg_weekly_earnings', e.target.value)} placeholder="5000" style={boxInput} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={label}>Hours / Day</label>
          <div style={inputContainer}>
            <Clock style={fieldIcon} />
            <input type="number" value={form.hours_per_day} onChange={(e) => update('hours_per_day', e.target.value)} placeholder="8" style={boxInput} />
          </div>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <button type="submit" disabled={loading} style={{ ...primaryBtn, marginTop: 0 }}>
          {loading ? 'Processing...' : 'Complete Registration'}
        </button>
      </div>
    </motion.div>
  );
}


// ─── Styles ───
const page = { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8f7f5', fontFamily: "'Inter', sans-serif" };
const topBar = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px' };
const topLink = { fontSize: 13, color: 'var(--forest-green)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 };
const center = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px 60px' };
const card = { width: '100%', maxWidth: 440, background: '#fff', padding: '40px', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,51,44,0.05)', border: '1.5px solid var(--border)' };
const logoWrapper = { marginBottom: 16, display: 'flex', justifyContent: 'center' };
const heading = { fontSize: 26, fontWeight: 800, color: 'var(--forest-green)', margin: '0 0 6px' };
const subheading = { fontSize: 14, color: 'var(--ink-muted)', margin: 0 };
const progressContainer = { width: '100%', height: 4, background: '#f0f0f0', borderRadius: 2, margin: '16px 0 24px', overflow: 'hidden' };
const progressBar = { height: '100%', background: 'var(--mint-green)', transition: 'width 0.4s ease' };
const fieldWrap = { marginBottom: 20 };
const label = { display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--forest-green)', marginBottom: 8 };
const inputContainer = { position: 'relative' };
const fieldIcon = { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#ccc' };
const boxInput = { width: '100%', padding: '13px 14px 13px 40px', fontSize: 14, color: 'var(--forest-green)', background: '#fcfbf9', border: '1.5px solid var(--border)', borderRadius: 10, outline: 'none' };
const prefixBox = { padding: '13px 14px', fontSize: 14, color: '#999', fontWeight: 600, background: '#fcfbf9', border: '1.5px solid var(--border)', borderRight: 'none', borderTopLeftRadius: 10, borderBottomLeftRadius: 10 };
const selectBox = { ...boxInput, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23bbb' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' };
const primaryBtn = { width: '100%', padding: '14.5px', borderRadius: 10, background: 'var(--mint-green)', color: 'var(--forest-green)', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 20px rgba(41, 245, 159, 0.25)', marginTop: 24 };
const outlineBtn = { width: '100%', padding: '14px', borderRadius: 10, background: '#fff', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: 'var(--forest-green)', cursor: 'pointer' };
const socialBtn = { width: '100%', padding: '13px', borderRadius: 10, background: '#fff', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 14, fontWeight: 700, color: 'var(--forest-green)', cursor: 'pointer' };
const divider = { display: 'flex', alignItems: 'center', margin: '24px 0', gap: 12 };
const line = { flex: 1, height: 1.5, background: 'var(--border)' };
const dividerText = { fontSize: 13, color: '#bbb', fontWeight: 600 };
const linkStyle = { color: 'var(--mint-green)', fontWeight: 700, textDecoration: 'none' };
const pillBtn = { padding: '9px 18px', borderRadius: 40, fontSize: 13, fontWeight: 700, border: '1.5px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 };
const footerText = { textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--ink-muted)', fontWeight: 600 };

export default Register;
