import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Public & Landing
import Landing from './pages/landing/Landing';
import Register from './pages/rider/Register';
import Login from './pages/rider/Login';
import Verify from './pages/rider/Verify';
import Onboarding from './pages/rider/Onboarding';

// Rider App
import Layout from './components/Layout';
import Dashboard from './pages/rider/Dashboard';
import Score from './pages/rider/Score';
import Policy from './pages/rider/Policy';
import Claims from './pages/rider/Claims';
import Profile from './pages/rider/Profile';

// Admin App
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminRiders from './pages/admin/Riders';
import AdminTriggers from './pages/admin/Triggers';
import AdminFraud from './pages/admin/Fraud';
import AdminAnalytics from './pages/admin/Analytics';

import useAuthStore from './store/authStore';
import api from './api/axios';

function ProtectedRoute({ children, reqAdmin = false }) {
  const { token, rider } = useAuthStore();
  
  if (!token) return <Navigate to="/login" replace />;

  if (reqAdmin && rider?.role !== 'admin') {
     return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function App() {
  const { token, rider, setAuth, logout } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token && !rider) {
        try {
          const res = await api.get('/api/riders/me');
          setAuth(res.data.rider, token);
        } catch (err) {
          console.error('Failed to re-hydrate auth:', err);
          logout();
        }
      }
      setInitializing(false);
    };
    initAuth();
  }, [token, rider, setAuth, logout]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo"></div>
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' } }} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verify />} />
        
        {/* Onboarding */}
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        
        {/* Protected Rider Routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/score" element={<Score />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute reqAdmin={true}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="riders" element={<AdminRiders />} />
          <Route path="triggers" element={<AdminTriggers />} />
          <Route path="fraud" element={<AdminFraud />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
