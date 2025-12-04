import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({});

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
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // Simple mock login - replace with your backend API call later
      const mockUser = {
        id: 1,
        email: credentials.email,
        name: credentials.email.split("@")[0],
      };

      localStorage.setItem("userData", JSON.stringify(mockUser));
      setUser(mockUser);

      return { success: true, user: mockUser };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    try {
      // Simple mock signup - replace with your backend API call later
      const mockUser = {
        id: Date.now(),
        email: userData.email,
        name: userData.name || userData.email.split("@")[0],
      };

      localStorage.setItem("userData", JSON.stringify(mockUser));
      setUser(mockUser);

      return { success: true, user: mockUser };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("userData");
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
