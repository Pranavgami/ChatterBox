import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = BACKEND_URL;

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    if (token) {
      try {
        const response = await axios.get("/api/auth/check-auth", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setAuthUser(response.data.data);
          connectSocket(response.data.data);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Session expired");
        setAuthUser(null);
      }
    }
    setLoading(false);
  };

  const login = async (state, credentails) => {
    try {
      const response = await axios.post(`/api/auth/${state}`, credentails);
      
      if (response.data.success) {
        const token = response.data.token;
        const user = response.data.data; 

        // Validate user data before proceeding
        if (!user || !user.id) {
          toast.error("Invalid user data received");
          return false;
        }
        
        // Set everything in the correct order
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setToken(token);
        setAuthUser(user);
        
        connectSocket(user);
        toast.success(response.data.message);
        
        return true;
      } else {
        console.log("AuthContext - Login failed, response not successful");
        toast.error("Login failed");
        return false;
      }
    } catch (error) {
      console.error("AuthContext - Login error:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
      setAuthUser(null);
      return false;
    }
  };

  const logout = () => {
    setAuthUser(null);
    setToken(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["Authorization"] = null;
    localStorage.removeItem("token");
    socket?.disconnect();
    setSocket(null);
    toast.success("Logged out successfully");
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(`/api/auth/update-profile`, profileData);

      if (response.data.success) {
        setAuthUser(response.data.data);
        toast.success("Profile updated successfully");
        return true;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const connectSocket = (userData) => {
    if (!userData || !userData._id || socket?.connected) {
      console.log("connectSocket - Invalid userData or socket already connected:", { userData: !!userData, hasId: !!userData?._id, socketConnected: socket?.connected });
      return;
    }
    
    console.log("connectSocket - Connecting with user ID:", userData._id);
    
    const newSocket = io(BACKEND_URL, {
      query: { userId: userData._id },
      transports: ["websocket"],
    });
    newSocket.connect();

    newSocket.emit("setup", userData._id);

    setSocket(newSocket);
    newSocket.on("online-users", (users) => {
      setOnlineUsers(users);
    });
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    checkAuth();
  }, []);

  const value = {
    token,
    authUser,
    onlineUsers,
    socket,
    loading,
    login,
    logout,
    updateProfile,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
