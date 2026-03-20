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
      console.log("Auth handshake failed, continuing as guest state.");
      set({ rider: null, score: null }); 
      return false;
    }
  }
}));

export default useAuthStore;
