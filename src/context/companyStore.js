import { create } from "zustand";
import { companyAPI } from "../utils/apiClient";

const useCompanyStore = create((set, get) => ({
  company: null,
  jobs: [],
  loading: false,
  saving: false,
  error: null,

  // Actions
  setCompany: (company) => set({ company }),
  setJobs: (jobs) => set({ jobs }),
  setLoading: (loading) => set({ loading }),
  setSaving: (saving) => set({ saving }),
  setError: (error) => set({ error }),

  // Create company
  createCompany: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await companyAPI.create(data);
      set({ company: response.company, loading: false });
      return response.company;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Failed to create company",
        loading: false,
      });
      throw error;
    }
  },

  // Fetch company data
  fetchCompany: async (slug) => {
    console.log("CompanyStore: fetchCompany called with slug:", slug);
    set({ loading: true, error: null });
    try {
      console.log("CompanyStore: Making API call to fetch company");
      const response = await companyAPI.getBySlug(slug);
      console.log("CompanyStore: API response received:", response);
      set({ company: response, loading: false });
      return response;
    } catch (error) {
      console.error("CompanyStore: Error fetching company:", error);
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch company",
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
      // Extract jobs array from response.data.jobs
      const jobs = response.data?.jobs || [];
      set({ jobs, loading: false });
      return jobs;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch jobs",
        loading: false,
      });
      throw error;
    }
  },

  // Update company branding with auto-save
  updateBranding: async (branding) => {
    const { company } = get();
    if (company) {
      // Update local state immediately for UI responsiveness
      const updatedCompany = {
        ...company,
        branding: { ...company.branding, ...branding },
      };
      set({ company: updatedCompany, saving: true });

      // Auto-save to backend
      try {
        const response = await companyAPI.update(company.slug, {
          branding: updatedCompany.branding,
        });
        // Update with server response to ensure consistency
        set({ company: { ...updatedCompany, ...response }, saving: false });
      } catch (error) {
        console.error("Failed to auto-save branding changes:", error);
        // Revert local state on error
        set({ company, saving: false });
      }
    }
  },

  // Update company sections with auto-save
  updateSections: async (sections) => {
    console.log("Store: updateSections called with:", sections);
    const { company } = get();
    console.log("Store: current company:", company);
    if (company) {
      const updatedCompany = {
        ...company,
        sections,
      };
      console.log("Store: updating company with new sections:", updatedCompany);

      // Update local state immediately
      set({ company: updatedCompany });

      // Auto-save to backend
      try {
        const response = await companyAPI.update(company.slug, {
          sections: updatedCompany.sections,
        });
        console.log("Store: sections auto-saved successfully");
        // Update with server response to ensure consistency
        set({ company: { ...updatedCompany, ...response } });
      } catch (error) {
        console.error("Failed to auto-save sections:", error);
        // Revert local state on error
        set({ company });
      }
    } else {
      console.log("Store: No company found to update sections");
    }
  },

  // Upload logo
  uploadLogo: async (params) => {
    const { company } = get();
    if (company) {
      set({ saving: true, error: null });
      try {
        const response = await companyAPI.uploadLogo(company.slug, params);
        // Re-fetch company data to get updated branding with actual uploaded URL
        const updatedCompany = await companyAPI.getBySlug(company.slug);
        set({ company: updatedCompany, saving: false });
        return response;
      } catch (error) {
        set({
          error: error.response?.data?.error || "Failed to upload logo",
          saving: false,
        });
        throw error;
      }
    }
  },

  // Upload banner
  uploadBanner: async (params) => {
    const { company } = get();
    if (company) {
      set({ saving: true, error: null });
      try {
        const response = await companyAPI.uploadBanner(company.slug, params);
        // Re-fetch company data to get updated branding with actual uploaded URL
        const updatedCompany = await companyAPI.getBySlug(company.slug);
        set({ company: updatedCompany, saving: false });
        return response;
      } catch (error) {
        set({
          error: error.response?.data?.error || "Failed to upload banner",
          saving: false,
        });
        throw error;
      }
    }
  },

  // Delete logo
  deleteLogo: async (params) => {
    const { company } = get();
    if (company) {
      set({ saving: true, error: null });
      try {
        const response = await companyAPI.deleteLogo(company.slug);
        // Re-fetch company data to get updated branding
        const updatedCompany = await companyAPI.getBySlug(company.slug);
        set({ company: updatedCompany, saving: false });
        return response;
      } catch (error) {
        set({
          error: error.response?.data?.error || "Failed to delete logo",
          saving: false,
        });
        throw error;
      }
    }
  },

  // Delete banner
  deleteBanner: async (params) => {
    const { company } = get();
    if (company) {
      set({ saving: true, error: null });
      try {
        const response = await companyAPI.deleteBanner(company.slug);
        // Re-fetch company data to get updated branding
        const updatedCompany = await companyAPI.getBySlug(company.slug);
        set({ company: updatedCompany, saving: false });
        return response;
      } catch (error) {
        set({
          error: error.response?.data?.error || "Failed to delete banner",
          saving: false,
        });
        throw error;
      }
    }
  },

  // Clear store
  clear: () =>
    set({
      company: null,
      jobs: [],
      loading: false,
      saving: false,
      error: null,
    }),
}));

export default useCompanyStore;
