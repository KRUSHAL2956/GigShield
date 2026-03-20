import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./utils/firebase";

import Landing from "./pages/landing/Landing";
import Register from "./pages/rider/Register";
import Login from "./pages/rider/Login";


import Layout from "./components/Layout";
import Dashboard from "./pages/rider/Dashboard";
import Score from "./pages/rider/Score";
import Policy from "./pages/rider/Policy";
import Claims from "./pages/rider/Claims";
import Profile from "./pages/rider/Profile";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminRiders from "./pages/admin/Riders";
import AdminTriggers from "./pages/admin/Triggers";
import AdminFraud from "./pages/admin/Fraud";
import AdminAnalytics from "./pages/admin/Analytics";

import useAuthStore from "./store/authStore";

function ProtectedRoute({ children, reqAdmin = false }) {
  const { rider } = useAuthStore();

  if (!rider) return <Navigate to="/login" replace />;

  if (reqAdmin && rider.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const { checkAuth } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      useAuthStore.getState().setFirebaseUser(user);

      if (user) {
        try {
          // If we already have a rider (from a fresh login), don't overwrite it with a potentially slower check
          if (!useAuthStore.getState().rider) {
            await checkAuth();
          }
        } catch (error) {
          console.error("Auth check failed:", error);
        }
      }

      setInitializing(false);
    });

    return () => unsubscribe();
  }, [checkAuth]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "12px",
            fontFamily: "DM Sans, sans-serif",
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />


        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/score" element={<Score />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute reqAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
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
