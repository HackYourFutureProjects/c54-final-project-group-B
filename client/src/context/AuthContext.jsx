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
        // Response is always 200 now, even if not logged in
        if (res.ok) {
          const data = await res.json();
          // Check for the user object or isAuthenticated flag
          if (data.user) {
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            // Server returned 200 but said user is null
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
            // Fallback for true errors (500, etc)
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (e) {
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
  async function signup(userData) {
    setIsLoading(true);
    const res = await fetch("/api/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    if (res.status === 409) {
      alert("User already exists. Please log in instead.");
      setIsLoading(false);
      return {
        success: false,
        msg: "User already exists. Please log in instead.",
      };
    }

    if (res.ok) {
      // Do not log in immediately. Wait for verification.
      // const data = await res.json();
      // setUser(data.user);
      // setIsAuthenticated(true);
      const data = await res.json();
      setIsLoading(false);
      return { success: true, ...data };
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
