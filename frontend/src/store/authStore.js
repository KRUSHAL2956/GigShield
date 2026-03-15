import { create } from 'zustand';

const getSafeToken = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('gigshield_token');
  }
  return null;
};

const useAuthStore = create((set) => ({
  rider: null,
  token: getSafeToken(),
  score: null,

  setAuth: (rider, token) => {
    const isBrowser = typeof window !== 'undefined' && window.localStorage;
    if (token && typeof token === 'string' && token.trim() !== '' && token !== 'null' && token !== 'undefined') {
      if (isBrowser) localStorage.setItem('gigshield_token', token);
      set({ rider, token });
    } else {
      if (isBrowser) localStorage.removeItem('gigshield_token');
      set({ rider, token: null });
    }
  },

  setRider: (rider) => set({ rider }),

  setScore: (score) => set({ score }),

  logout: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('gigshield_token');
    }
    set({ rider: null, token: null, score: null });
  },
}));

export default useAuthStore;
