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
    const userData = localStorage.getItem("userData");
    const token = localStorage.getItem("token");

    // Check if token is old mock token and clear it
    if (
      token &&
      (token.startsWith("mock_token_") || token.startsWith("token_"))
    ) {
      localStorage.removeItem("userData");
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
      return;
    }

    if (userData && token) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();

      // Create user object for localStorage
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || data.user.email.split("@")[0],
      };

      localStorage.setItem("userData", JSON.stringify(user));
      localStorage.setItem("token", data.token);
      setUser(user);

      return { success: true, user: user };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      const data = await response.json();

      // Create user object for localStorage from backend response
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || userData.name || userData.email.split("@")[0],
      };

      localStorage.setItem("userData", JSON.stringify(user));
      localStorage.setItem("token", data.token);
      setUser(user);

      return { success: true, user: user };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
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
