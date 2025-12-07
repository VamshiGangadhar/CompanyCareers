import { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const AuthContext = createContext({});
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔍 [AUTH] Checking localStorage for user data");
    const userData = localStorage.getItem("userData");
    const token = localStorage.getItem("token");

    console.log("📊 [AUTH] Found in localStorage:", {
      userData: userData ? "Present" : "Missing",
      token: token ? "Present" : "Missing",
    });

    // Check if token is old mock token and clear it
    if (
      token &&
      (token.startsWith("mock_token_") || token.startsWith("token_"))
    ) {
      console.log("⚠️ [AUTH] Detected old mock token, clearing localStorage");
      localStorage.removeItem("userData");
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
      return;
    }

    if (userData && token) {
      const parsedUser = JSON.parse(userData);
      console.log("✅ [AUTH] Setting user from localStorage:", parsedUser);
      setUser(parsedUser);
    } else {
      console.log("❌ [AUTH] No user data found in localStorage");
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      console.log("🔐 [AUTH] Starting login process for:", credentials.email);

      // Call backend API for authentication
      const response = await fetch(`${API_URL}/api/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: "AUTH_LOGIN",
          payload: {
            email: credentials.email,
            password: credentials.password,
          },
        }),
      });

      console.log("📡 [AUTH] Login API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ [AUTH] Login failed:", errorData);
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      console.log("✅ [AUTH] Login successful:", data);

      // Create user object for localStorage
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || data.user.email.split("@")[0],
      };

      console.log("💾 [AUTH] Storing user data and token:", {
        user: user,
        token: data.token ? data.token.substring(0, 20) + "..." : "No token",
      });

      localStorage.setItem("userData", JSON.stringify(user));
      localStorage.setItem("token", data.token);
      setUser(user);

      console.log("✅ [AUTH] Login successful for:", credentials.email);
      return { success: true, user: user };
    } catch (error) {
      console.error("❌ [AUTH] Login error:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      console.log("🔐 [AUTH] Starting signup process for:", userData.email);

      // Call backend API to register user
      const response = await fetch(`${API_URL}/api/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: "AUTH_REGISTER",
          payload: {
            email: userData.email,
            password: userData.password,
            metadata: {
              name: userData.name,
              fullName: userData.name,
            },
          },
        }),
      });

      console.log(
        "📡 [AUTH] Registration API response status:",
        response.status
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ [AUTH] Registration failed:", errorData);
        throw new Error(errorData.error || "Registration failed");
      }

      const data = await response.json();
      console.log("✅ [AUTH] Registration successful:", data);

      // Create user object for localStorage from backend response
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || userData.name || userData.email.split("@")[0],
      };

      console.log("💾 [AUTH] Storing user data and token:", {
        user: user,
        token: data.token ? data.token.substring(0, 20) + "..." : "No token",
      });

      localStorage.setItem("userData", JSON.stringify(user));
      localStorage.setItem("token", data.token);
      setUser(user);

      return { success: true, user: user };
    } catch (error) {
      console.error("❌ [AUTH] Signup error:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log("🚪 [AUTH] Logging out user");
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
