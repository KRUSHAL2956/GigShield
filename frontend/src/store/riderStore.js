import { create } from 'zustand';

const useRiderStore = create((set) => ({
  policyInfo: null,
  claimsHistory: [],
  coverageUsage: null,
  isLoading: false,

  setPolicyInfo: (info) => set({ policyInfo: info }),
  setClaimsHistory: (claims) => set({ claimsHistory: claims }),
  setCoverageUsage: (usage) => set({ coverageUsage: usage }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  clearRiderData: () => set({ policyInfo: null, claimsHistory: [], coverageUsage: null, isLoading: false })
}));

export default useRiderStore;
