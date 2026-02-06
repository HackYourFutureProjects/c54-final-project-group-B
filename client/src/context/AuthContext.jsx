import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    async function fetchMe() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMe();
  }, []);

  // Login function
  async function login(emailOrUsername, password) {
    setIsLoading(true);
    const res = await fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ emailOrUsername, password }),
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setIsAuthenticated(true);
      setIsLoading(false);
      return { success: true };
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
      return { success: false, msg: (await res.json()).msg };
    }
  }

  // Signup function
  async function signup(username, email, password) {
    setIsLoading(true);
    const res = await fetch("/api/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setIsAuthenticated(true);
      setIsLoading(false);
      return { success: true };
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
      return { success: false, msg: (await res.json()).msg };
    }
  }

  // Logout function
  async function logout() {
    setIsLoading(true);
    await fetch("/api/users/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  }

  // Update user in context
  function updateUser(newUser) {
    setUser(newUser);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
