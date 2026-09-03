import { createContext, useContext, useEffect, useState } from "react";

import { loginAdmin, getCurrentAdmin } from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() =>
    localStorage.getItem("hu_admin_token"),
  );

  const [loading, setLoading] = useState(true);

  // RESTORE AUTHENTICATION

  useEffect(() => {
    async function restoreAuthentication() {
      const savedToken = localStorage.getItem("hu_admin_token");

      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentAdmin();

        if (response.success && response.admin) {
          setAdmin(response.admin);
          setToken(savedToken);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Authentication restore failed:", error);

        // Token is invalid or expired
        localStorage.removeItem("hu_admin_token");
        localStorage.removeItem("hu_admin_user");

        setAdmin(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    restoreAuthentication();
  }, []);

  // LOGIN

  async function login(email, password) {
    const response = await loginAdmin(email, password);

    if (!response.success || !response.data) {
      throw new Error(response.message || "Unable to login right now.");
    }

    const { token, admin } = response.data;

    localStorage.setItem("hu_admin_token", token);
    localStorage.setItem("hu_admin_user", JSON.stringify(admin));

    setToken(token);
    setAdmin(admin);

    return response;
  }

  // LOGOUT

  function logout() {
    localStorage.removeItem("hu_admin_token");
    localStorage.removeItem("hu_admin_user");

    setToken(null);
    setAdmin(null);
  }

  // AUTHENTICATED STATE

  const isAuthenticated = Boolean(token && admin);

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// CUSTOM HOOK

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}