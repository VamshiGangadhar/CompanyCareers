import { supabase } from "../database.js";
import { successResponse, errorResponse } from "../eventHandler.js";

export const authHandlers = {
  // Login with email and password
  AUTH_LOGIN: async (payload) => {
    const { email, password } = payload;

    if (!email || !password) {
      throw errorResponse("Email and password required", 400);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw errorResponse(error.message, 401);
    }

    return successResponse(
      {
        user: data.user,
        session: data.session,
      },
      "Login successful"
    );
  },

  // Register new user
  AUTH_REGISTER: async (payload) => {
    const { email, password, metadata } = payload;

    if (!email || !password) {
      throw errorResponse("Email and password required", 400);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {},
      },
    });

    if (error) {
      throw errorResponse(error.message, 400);
    }

    return successResponse(
      {
        user: data.user,
        session: data.session,
      },
      "Registration successful"
    );
  },

  // Verify token
  AUTH_VERIFY: async (payload) => {
    const { token } = payload;

    if (!token) {
      throw errorResponse("Token required", 400);
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      throw errorResponse("Invalid token", 401);
    }

    return successResponse(
      {
        user: data.user,
      },
      "Token verified"
    );
  },

  // Logout
  AUTH_LOGOUT: async (payload) => {
    const { token } = payload;

    if (token) {
      await supabase.auth.admin.signOut(token);
    }

    return successResponse(null, "Logout successful");
  },
};
