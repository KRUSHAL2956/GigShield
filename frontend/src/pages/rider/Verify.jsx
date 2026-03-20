import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { authenticateWithFirebase } from '../../services/dbServices';

function Verify() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  const phone = window.phoneForVerify || 'your phone';

  useEffect(() => {
    if (!window.confirmationResult) {
      toast.error('Session expired');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    if (timer > 0) return;
    if (!window.phoneForVerify) return toast.error('Phone number missing. Please try logging in again.');
    
    setLoading(true);
    try {
      const { RecaptchaVerifier } = await import('../../utils/firebase');
      const { auth } = await import('../../utils/firebase');
      const { signInWithPhoneNumber } = await import('firebase/auth');

      // Create a temporary hidden container for reCAPTCHA if it doesn't exist
      if (!window.resendRecaptchaVerifier) {
        let container = document.getElementById('resend-recaptcha-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'resend-recaptcha-container';
          document.body.appendChild(container);
        }
        window.resendRecaptchaVerifier = new RecaptchaVerifier(auth, 'resend-recaptcha-container', { size: 'invisible' });
      }
      
      const confirmationResult = await signInWithPhoneNumber(auth, window.phoneForVerify, window.resendRecaptchaVerifier);
      window.confirmationResult = confirmationResult;
      
      setTimer(30);
      toast.success('New OTP sent!');
    } catch (err) {
      console.error('OTP Resend Error:', err);
      toast.error(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter 6 digits');
    if (!window.confirmationResult) return toast.error('Verification session expired. Please resend OTP.');
    
    setLoading(true);
    try {
      const result = await window.confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      const res = await authenticateWithFirebase(idToken);
      if (res.needsRegistration) {
        toast.success('Phone verified!');
        navigate('/register', { state: { firebaseData: res.firebaseData, idToken } });
      } else {
        setAuth(res.rider);
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('OTP Verification Error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        toast.error('Invalid OTP. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        toast.error('OTP has expired. Please resend a new one.');
      } else {
        toast.error('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={topBar}>
        <Link to="/login" style={topLink}><ChevronLeft size={18} /> Back to Login</Link>
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
            <h1 style={heading}>Verify PIN</h1>
            <p style={subheading}>
              We've sent a 6-digit code to <br />
              <b style={{ color: '#1a1a1a' }}>{phone}</b>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={fieldWrap}>
              <label style={label}>Security Code</label>
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000 000"
                style={boxInput}
                autoFocus
              />
            </div>

            <button type="submit" disabled={loading} style={primaryBtn}>
              {loading ? 'Verifying...' : 'Verify account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button 
              onClick={handleResend} 
              disabled={timer > 0 || loading}
              style={{ ...textBtn, cursor: (timer > 0 || loading) ? 'default' : 'pointer', color: (timer > 0 || loading) ? '#bbb' : '#4a1d96' }}
            >
              {timer > 0 ? `Resend in ${timer}s` : 'Resend code'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const page = { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8f7f5', fontFamily: "'Inter', sans-serif" };
const topBar = { padding: '24px 40px' };
const topLink = { fontSize: 14, color: '#4a1d96', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 };
const center = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px 80px' };
const card = { width: '100%', maxWidth: 400, background: '#fff', padding: '40px', borderRadius: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #efeae2' };
const logoWrapper = { marginBottom: 16, display: 'flex', justifyContent: 'center' };
const heading = { fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px' };
const subheading = { fontSize: 14, color: '#666', lineHeight: 1.5, margin: 0 };
const fieldWrap = { marginBottom: 20 };
const label = { display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8 };
const boxInput = { width: '100%', padding: '14px 16px', fontSize: 20, color: '#1a1a1a', background: '#fcfbf9', border: '1.5px solid #ece8e1', borderRadius: 12, outline: 'none', textAlign: 'center', letterSpacing: '0.2em' };
const primaryBtn = { width: '100%', padding: '15.5px', borderRadius: 12, background: '#1a1a1a', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const textBtn = { background: 'none', border: 'none', fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif" };

export default Verify;
