import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { auth, RecaptchaVerifier } from '../../utils/firebase';
import { signInWithPhoneNumber } from 'firebase/auth';

function Verify() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const refs = useRef([]);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    refs.current[0]?.focus();
    if (!window.confirmationResult) {
      toast.error('Session expired. Please login again.');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Enter 6-digit code');
    
    if (!window.confirmationResult) {
      toast.error('Verification session not found. Please restart login.');
      navigate('/login');
      return;
    }
    if (!window.phoneForVerify) {
       toast.error('Identity missing. Please restart login.');
       navigate('/login');
       return;
    }
    
    setLoading(true);
    try {
      const confirmationResult = window.confirmationResult;
      const result = await confirmationResult.confirm(code);
      const idToken = await result.user.getIdToken();
      
      const res = await api.post('/api/riders/auth/firebase', { 
        idToken
      });
      
      setAuth(res.data.rider, res.data.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Verification failed. Try again.');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo flex items-center justify-center mx-auto mb-3">
            <Shield className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">Verify your phone</h1>
          <p className="text-ink-muted text-sm mt-2">
            Code sent to <span className="font-semibold text-ink">{window.phoneForVerify || 'your phone'}</span>
          </p>
        </div>

        <div className="card p-7">
          <div className="flex justify-center gap-2.5 mb-6">
            {otp.map((d, i) => (
              <motion.input
                key={i}
                ref={(el) => (refs.current[i] = el)}
                type="text" inputMode="numeric" maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKey(i, e)}
                whileFocus={{ scale: 1.05 }}
                className={`w-12 h-14 text-center text-xl font-display font-bold rounded-xl border-[1.5px] outline-none transition-all ${
                  d ? 'border-indigo bg-indigo-soft text-indigo' : 'border-border bg-surface text-ink'
                } focus:border-indigo focus:shadow-glow`}
              />
            ))}
          </div>

          <button onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="btn-primary w-full">
            {loading ? <span className="spinner" /> : 'Verify & Continue'}
          </button>

          <div className="text-center mt-6">
            {countdown > 0 ? (
              <p className="text-sm text-ink-muted">
                Resend in <span className="font-semibold text-indigo">{countdown}s</span>
              </p>
            ) : (
              <button 
                onClick={async () => {
                  try {
                    if (!window.phoneForVerify) {
                      toast.error('Identity missing. Please restart login.');
                      navigate('/login');
                      return;
                    }

                    setLoading(true);
                    if (!window.recaptchaVerifier) {
                      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'login-container', { size: 'invisible' });
                    }
                    const result = await signInWithPhoneNumber(auth, window.phoneForVerify, window.recaptchaVerifier);
                    window.confirmationResult = result;
                    setCountdown(30);
                    toast.success('New code sent!');
                  } catch (err) {
                    toast.error('Failed to resend. Please go back and try again.');
                  } finally {
                    if (isMounted.current) setLoading(false);
                  }
                }}
                className="text-sm text-indigo font-semibold hover:underline"
              >
                Resend code
              </button>
            )}
          </div>
        </div>

        <button onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mx-auto mt-6">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        {/* Hidden container for reCAPTCHA Verifier */}
        <div id="login-container"></div>
      </motion.div>
    </div>
  );
}

export default Verify;
