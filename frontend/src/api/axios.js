import axios from "axios";
import { auth } from "../utils/firebase";

const isProduction = window.location.hostname.endsWith("vercel.app");

const sanitizeUrl = (url) => (url ? url.replace(/\/+$/, "") : "");

const API_URL = sanitizeUrl(
  process.env.REACT_APP_API_URL ||
    (isProduction
      ? "https://gig-shield-backend.vercel.app"
      : `http://${window.location.hostname}:5000`)
);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

/**
 * Get Firebase ID Token safely
 */
async function getFirebaseToken() {
  const user = auth.currentUser;

  if (!user) return null;

  try {
    return await user.getIdToken();
  } catch (error) {
    console.error("Firebase token error:", error);
    return null;
  }
}

/**
 * Request interceptor
 * Attaches purely Firebase or Custom token automatically
 */
api.interceptors.request.use(
  async (config) => {
    // 1. Try Firebase token (Google Sign-In) - Custom JWTs are now handled via HttpOnly Cookies seamlessly
    const firebaseToken = await getFirebaseToken();

    if (firebaseToken) {
      config.headers.Authorization = `Bearer ${firebaseToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor
 * Handles auth errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authPages = ["/login", "/register", "/verify", "/"];

      if (!authPages.includes(window.location.pathname)) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
