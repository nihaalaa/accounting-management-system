
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import axios from "axios";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("shopledger_token")
  );

const [user, setUser] = useState(() => {
  const savedUser = localStorage.getItem("shopledger_user");

  try {
    return savedUser && savedUser !== "undefined"
      ? JSON.parse(savedUser)
      : null;
  } catch (error) {
    return null;
  }
});

  const [role, setRole] = useState(
    localStorage.getItem("shopledger_role")
  );

  const [loading, setLoading] = useState(true);

  const saveLogin = (response, userRole) => {
    localStorage.setItem("shopledger_token", response.token);
    localStorage.setItem("shopledger_user", JSON.stringify(
      userRole === "admin" ? response.admin : response.business
    ));
    localStorage.setItem("shopledger_role", userRole);

    setToken(response.token);
    setUser(userRole === "admin" ? response.admin : response.business);
    setRole(userRole);
  };

  const loginAdmin = async (username, password) => {
    const response = await axios.post(
      `${API_URL}/admin/login`,
      { username, password }
    );

    saveLogin(response.data, "admin");
    return response.data;
  };

  const loginBusiness = async (email, password) => {
    const response = await axios.post(
      `${API_URL}/business/login`,
      { email, password }
    );

    saveLogin(response.data, "business");
    return response.data;
  };

  const registerBusiness = async (businessData) => {
    const response = await axios.post(
      `${API_URL}/business/register`,
      businessData
    );

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("shopledger_token");
    localStorage.removeItem("shopledger_user");
    localStorage.removeItem("shopledger_role");

    setToken(null);
    setUser(null);
    setRole(null);
  };

  // Verify saved login when the application starts
  useEffect(() => {
    const verifyLogin = async () => {
      if (!token || !role) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/${role === "admin" ? "admin" : "business"}/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const currentUser =
          role === "admin"
            ? response.data.admin
            : response.data.business;

        setUser(currentUser);
        localStorage.setItem(
          "shopledger_user",
          JSON.stringify(currentUser)
        );
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        loading,
        loginAdmin,
        loginBusiness,
        registerBusiness,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
