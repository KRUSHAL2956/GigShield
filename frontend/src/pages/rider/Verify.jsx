import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

function Verify() {
  const navigate = useNavigate();
  const { rider, token } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const refs = useRef([]);
  const verifyTimeoutRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (verifyTimeoutRef.current) clearTimeout(verifyTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

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

  const handleVerify = () => {
    if (otp.join('').length !== 6) return toast.error('Enter 6-digit code');
    setLoading(true);
    verifyTimeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        toast.success('Phone verified!');
        navigate(token ? '/onboarding' : '/register');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo flex items-center justify-center mx-auto mb-3">
            <Shield className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">Verify your phone</h1>
          <p className="text-ink-muted text-sm mt-2">
            Code sent to <span className="font-semibold text-ink">{rider?.phone || '98765xxxxx'}</span>
          </p>
        </div>

        {/* OTP Card */}
        <div className="card p-7">
          <div className="flex justify-center gap-2.5 mb-2">
            {otp.map((d, i) => (
              <motion.input
                key={i}
                ref={(el) => (refs.current[i] = el)}
                type="text" inputMode="numeric" maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKey(i, e)}
                whileFocus={{ scale: 1.05 }}
                aria-label={`Digit ${i + 1} of 6`}
                className={`w-12 h-14 text-center text-xl font-display font-bold rounded-sm border-[1.5px] outline-none transition-all ${
                  d ? 'border-indigo bg-indigo-soft text-indigo' : 'border-border bg-surface text-ink'
                } focus:border-indigo focus:shadow-glow`}
              />
            ))}
          </div>

          <p className="text-center text-xs text-ink-muted/60 mb-5">
            Demo: enter any 6 digits
          </p>

          <button onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="btn-primary w-full">
            {loading ? <span className="spinner" /> : 'Verify'}
          </button>

          <div className="text-center mt-4">
            {countdown > 0 ? (
              <p className="text-sm text-ink-muted">
                Resend in <span className="font-semibold text-indigo">{countdown}s</span>
              </p>
            ) : (
              <button onClick={() => { setCountdown(30); toast('OTP sent!', { icon: '📱' }); }}
                className="text-sm text-indigo font-semibold hover:underline">
                Resend code
              </button>
            )}
          </div>
        </div>

        <button onClick={() => navigate('/register')}
          className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mx-auto mt-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </motion.div>
    </div>
  );
}

export default Verify;
