import { create } from 'zustand';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import api from '../api/axios';

/**
 * Global authentication store for GigShield riders.
 * Manages identity state, platform scores, and Firebase integration.
 */
const useAuthStore = create((set) => ({
  rider: null,         // Profile data from our backend
  score: null,         // Real-time rider risk/merit score
  firebaseUser: null,  // Raw Firebase auth object

  // Standard setters for partial state updates
  setAuth: (rider) => set({ rider }),
  setRider: (rider) => set({ rider }),
  setScore: (score) => set({ score }),
  setFirebaseUser: (user) => set({ firebaseUser: user }),

  /**
   * Clears state on both the backend and Firebase.
   */
  logout: async () => {
    try { 
      // Close the session on our API first
      await api.post('/api/riders/logout');
      // Then sign out of the Firebase client
      await signOut(auth); 
    } catch (e) { 
      console.warn('Logout warning - check network:', e); 
    }
    // Deep reset of all identity state
    set({ rider: null, score: null, firebaseUser: null });
  },
  
  /**
   * Synchronizes local state with the backend "me" endpoint.
   * Called on app initialization and protected route changes.
   */
  checkAuth: async () => {
    try {
      const res = await api.get('/api/riders/me');
      set({ rider: res.data.rider });
      return true;
    } catch (e) {
      // Handle expired or invalid tokens
      if (e.response?.status === 401 || e.response?.status === 403) {
        set({ rider: null, score: null }); 
        return false;
      }

      // Handle cases where the rider profile doesn't exist yet
      if (e.response?.status === 404) {
        set({ rider: null, score: null });
        return false;
      }
      
      console.warn('Auth validation failed:', e.message);
      return false;
    }
  }
}));

export default useAuthStore;
