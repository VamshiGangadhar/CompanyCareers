import axios from "axios";
import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Simple API call with step/payload
const callAPI = async (step, payload = {}) => {
  try {
    // Get Supabase session token for protected routes
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    const response = await apiClient.post("/api/event", {
      step,
      payload: { ...payload, ...(token && { token }) },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Auth methods using Backend API
export const authAPI = {
  login: async (email, password) => {
    return await callAPI("AUTH_LOGIN", { email, password });
  },

  register: async (email, password, metadata = {}) => {
    return await callAPI("AUTH_REGISTER", { email, password, metadata });
  },

  logout: async () => {
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    // Backend logout
    if (token) {
      await callAPI("AUTH_LOGOUT", { token });
    }

    // Frontend logout
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  },

  verifyToken: async (token) => {
    return await callAPI("AUTH_VERIFY", { token });
  },

  getUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Company methods
export const companyAPI = {
  getBySlug: (slug) => callAPI("GET_COMPANY", { slug }),
  update: (slug, data) => callAPI("UPDATE_COMPANY", { slug, ...data }),
  getJobs: (slug, params) =>
    callAPI("GET_JOBS", { companySlug: slug, ...params }),
};

// Jobs methods
export const jobsAPI = {
  list: (params) => callAPI("GET_JOBS", params),
  create: (data) => callAPI("ADD_JOB", data),
  update: (id, data) => callAPI("UPDATE_JOB", { id, ...data }),
  delete: (id) => callAPI("DELETE_JOB", { id }),
};

export { supabase };
export default apiClient;
