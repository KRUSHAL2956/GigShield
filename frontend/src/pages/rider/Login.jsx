import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ChevronRight, Shield, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth, googleProvider, RecaptchaVerifier } from '../../utils/firebase';
import { signInWithPhoneNumber, signInWithPopup } from 'firebase/auth';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';

const ease = [0.4, 0, 0.2, 1];

function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const initRecaptcha = async () => {
      try {
        if (!window.recaptchaVerifier) {
          const container = document.getElementById('recaptcha-container');
          if (container) container.innerHTML = ''; // Clear any existing widgets
          
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {
              console.log('reCAPTCHA verified');
            },
            'expired-callback': () => {
              toast.error('reCAPTCHA expired. Please try again.');
              window.recaptchaVerifier?.render();
            }
          });
          await window.recaptchaVerifier.render();
        }
      } catch (err) {
        // Demote to warning as this is often caused by ad-blockers/firewalls and falls back gracefully
        console.warn('reCAPTCHA Init Warning (Check ad-blockers):', err);
      }
    };

    initRecaptcha();

    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (err) {
          console.warn('reCAPTCHA Clear Error:', err);
        }
      }
    };
  }, []);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const res = await api.post('/api/riders/auth/firebase', { idToken });
      
      if (res.data.needsRegistration) {
        toast.success('Google authenticated! Please complete your profile.');
        navigate('/register', { 
          state: { 
            firebaseData: res.data.firebaseData,
            idToken 
          } 
        });
        return;
      }

      setAuth(res.data.rider, res.data.token);
      toast.success('Welcome Back!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Google Login Failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedPhone = phone.startsWith('+') ? phone : '+91' + phone;
    if (!/^\+[1-9]\d{1,14}$/.test(formattedPhone)) {
      return toast.error('Invalid phone number (include country code)');
    }
    
    setLoading(true);
    try {
      if (!window.recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized. Please refresh the page.');
      }
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      window.phoneForVerify = formattedPhone;
      toast.success('OTP sent to ' + formattedPhone);
      navigate('/verify');
    } catch (err) {
      console.error('OTP Send Error:', err);
      toast.error('Unable to send OTP. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-5 relative">
      <Link to="/" className="absolute top-8 left-8 z-50 flex items-center gap-2 text-ink-muted hover:text-indigo transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      
      <div id="recaptcha-container"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo flex items-center justify-center mx-auto mb-3">
            <Shield className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">Sign in to GigShield</h1>
          <p className="text-ink-muted text-sm mt-1">Get back to coverage in seconds</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-muted/50" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button type="submit" disabled={loading || googleLoading} className="btn-primary w-full">
              {loading ? <span className="spinner" /> : <>Get OTP <ChevronRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-surface px-3 text-ink-muted font-medium">Or continue with</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-[1.5px] border-border rounded-xl font-semibold text-ink hover:bg-surface-hover hover:border-ink/10 transition-all duration-300"
          >
            {googleLoading ? <span className="spinner !border-indigo" /> : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Google
              </>
            )}
          </button>

          <p className="text-center text-sm text-ink-muted mt-8">
            New to GigShield?{' '}
            <Link to="/register" className="text-indigo font-semibold hover:underline">Create account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
