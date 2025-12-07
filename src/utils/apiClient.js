import axios from "axios";
import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Simple API call with step/payload
const callAPI = async (step, payload = {}) => {
  try {
    // Get token from localStorage (for mock auth) or Supabase session
    let token = localStorage.getItem("token");

    // Try to get Supabase session token as fallback
    if (!token) {
      const { data: session } = await supabase.auth.getSession();
      token = session?.session?.access_token;
    }

    const headers = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if token is available
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/event`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        step,
        payload: payload,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
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
  create: (data) => callAPI("CREATE_COMPANY", data),
  getBySlug: (slug) => callAPI("GET_COMPANY", { slug }),
  update: (slug, data) => callAPI("UPDATE_COMPANY", { slug, ...data }),
  getJobs: (slug, params) =>
    callAPI("GET_JOBS", { companySlug: slug, ...params }),
  uploadLogo: (slug, params) => {
    const payload = { companySlug: slug, ...params };
    return callAPI("UPLOAD_LOGO", payload);
  },
  uploadBanner: (slug, params) => {
    const payload = { companySlug: slug, ...params };
    return callAPI("UPLOAD_BANNER", payload);
  },
  deleteLogo: (slug) => callAPI("DELETE_LOGO", { companySlug: slug }),
  deleteBanner: (slug) => callAPI("DELETE_BANNER", { companySlug: slug }),
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
