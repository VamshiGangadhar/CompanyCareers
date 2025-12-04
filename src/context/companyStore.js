import { create } from "zustand";
import { companyAPI } from "../utils/apiClient";

const useCompanyStore = create((set, get) => ({
  company: null,
  jobs: [],
  loading: false,
  error: null,

  // Actions
  setCompany: (company) => set({ company }),
  setJobs: (jobs) => set({ jobs }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Fetch company data
  fetchCompany: async (slug) => {
    set({ loading: true, error: null });
    try {
      const response = await companyAPI.getBySlug(slug);
      set({ company: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch company",
        loading: false,
      });
      throw error;
    }
  },

  // Update company data
  updateCompany: async (slug, data) => {
    set({ loading: true, error: null });
    try {
      const response = await companyAPI.update(slug, data);
      set({ company: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update company",
        loading: false,
      });
      throw error;
    }
  },

  // Fetch jobs
  fetchJobs: async (slug, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await companyAPI.getJobs(slug, filters);
      set({ jobs: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch jobs",
        loading: false,
      });
      throw error;
    }
  },

  // Update company branding
  updateBranding: (branding) => {
    const { company } = get();
    if (company) {
      set({
        company: {
          ...company,
          branding: { ...company.branding, ...branding },
        },
      });
    }
  },

  // Update company sections
  updateSections: (sections) => {
    const { company } = get();
    if (company) {
      set({
        company: {
          ...company,
          sections,
        },
      });
    }
  },

  // Clear store
  clear: () => set({ company: null, jobs: [], loading: false, error: null }),
}));

export default useCompanyStore;
