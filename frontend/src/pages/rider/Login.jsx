import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { auth, googleProvider } from '../../utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import useAuthStore from '../../store/authStore';
import { authenticateWithFirebase } from '../../services/dbServices';

function Login() {
  const navigate = useNavigate();
  const { rider, setAuth } = useAuthStore();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (rider) {
      navigate('/dashboard', { replace: true });
    }
  }, [rider, navigate]);

  const handleManualLogin = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) return toast.error('Enter a valid 10-digit phone number');
    if (!password) return toast.error('Enter your password');

    setLoading(true);
    try {
      const res = await api.post('/api/riders/login', { phone, password });
      setAuth(res.data.rider);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await authenticateWithFirebase(idToken);
      
      if (res.needsRegistration) {
        toast.success('Google authenticated!');
        navigate('/register', { state: { firebaseData: res.firebaseData, idToken } });
      } else {
        setAuth(res.rider);
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Google login error:', err);
        toast.error('Google login failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={topBar}>
        <Link to="/" style={topLink}><ChevronLeft size={18} /> Back</Link>
        <Link to="/register" style={topLink}>Sign Up</Link>
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
            <h1 style={heading}>Log in</h1>
            <p style={subheading}>Access your rider protection dashboard</p>
          </div>

          <form onSubmit={handleManualLogin}>
            <div style={fieldWrap}>
              <label style={label}>Phone Number</label>
              <div style={inputContainer}>
                <span style={inputPrefix}>+91</span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  style={{ ...boxInput, paddingLeft: 48 }}
                />
              </div>
            </div>

            <div style={fieldWrap}>
              <label style={label}>Password</label>
              <div style={inputContainer}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={boxInput}
                />
              </div>
            </div>

            <button type="submit" disabled={loading || googleLoading} style={primaryBtn}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div style={divider}>
            <span style={line} />
            <span style={dividerText}>or</span>
            <span style={line} />
          </div>

          <button type="button" onClick={handleGoogleLogin} disabled={loading || googleLoading} style={socialBtn}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" style={{ width: 18, height: 18 }} />
            {googleLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          <p style={footerText}>
            Don't have an account? <Link to="/register" style={link}>Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

const page = {
  minHeight: '100vh', display: 'flex', flexDirection: 'column',
  background: '#f8f7f5', fontFamily: "'Inter', sans-serif",
};

const topBar = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '24px 40px',
};

const topLink = {
  fontSize: 14, color: 'var(--forest-green)', fontWeight: 700, textDecoration: 'none',
  display: 'flex', alignItems: 'center', gap: 4
};

const center = {
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px 60px',
};

const card = {
  width: '100%', maxWidth: 420,
  background: '#ffffff',
  padding: '40px',
  borderRadius: 24,
  boxShadow: '0 20px 40px rgba(0,51,44,0.05)',
  border: '1.5px solid var(--border)',
};

const logoWrapper = {
  marginBottom: 16, display: 'flex', justifyContent: 'center'
};

const heading = {
  fontSize: 28, fontWeight: 800, color: 'var(--forest-green)', margin: '0 0 8px',
};

const subheading = {
  fontSize: 14, color: 'var(--ink-muted)', margin: 0,
};

const fieldWrap = { marginBottom: 20 };

const label = {
  display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--forest-green)', marginBottom: 8,
};

const inputContainer = {
  position: 'relative', display: 'flex', alignItems: 'center',
};

const inputPrefix = {
  position: 'absolute', left: 16, fontSize: 15, color: '#999', fontWeight: 600,
};

const boxInput = {
  width: '100%', padding: '14px 16px',
  fontSize: 15, color: 'var(--forest-green)',
  background: '#fcfbf9', border: '1.5px solid var(--border)', borderRadius: 12,
  outline: 'none', transition: 'all 0.2s',
};

const primaryBtn = {
  width: '100%', padding: '15.5px', borderRadius: 12,
  background: 'var(--mint-green)', color: 'var(--forest-green)', fontSize: 15, fontWeight: 800,
  border: 'none', cursor: 'pointer',
  boxShadow: '0 8px 20px rgba(41, 245, 159, 0.25)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
};

const divider = {
  display: 'flex', alignItems: 'center', margin: '24px 0', gap: 12,
};

const line = { flex: 1, height: 1.5, background: 'var(--border)' };

const dividerText = { fontSize: 13, color: '#bbb', fontWeight: 600 };

const socialBtn = {
  width: '100%', padding: '14px', borderRadius: 12,
  background: '#fff', border: '1.5px solid var(--border)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  fontSize: 14, fontWeight: 700, color: 'var(--forest-green)', cursor: 'pointer',
};

const footerText = {
  textAlign: 'center', marginTop: 32, fontSize: 14, color: 'var(--ink-muted)',
};

const link = {
  color: 'var(--mint-green)', fontWeight: 700, textDecoration: 'none',
};

export default Login;
