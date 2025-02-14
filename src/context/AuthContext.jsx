import { createContext, useState, useContext, useEffect } from "react";
import { initializeSocket, disconnectSocket } from "../utils/websocket";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_API_URL + "/api/users/me"
      );
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem("token");
    }
    setLoading(false);
  };

  // In the login function
  const login = async (identifier, password) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_API_URL + "/api/auth/local",
        {
          identifier,
          password,
        }
      );
      localStorage.setItem("token", response.data.jwt);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.jwt}`;
      setUser(response.data.user);
      initializeSocket(response.data.jwt);
      return true;
    } catch (error) {
      return false;
    }
  };

  // In the logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    disconnectSocket();
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_API_URL + "/api/auth/local/register",
        {
          username,
          email,
          password,
        }
      );
      localStorage.setItem("token", response.data.jwt);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.jwt}`;
      setUser(response.data.user);
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
