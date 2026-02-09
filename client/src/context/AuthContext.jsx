import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status on mount
  // This effect runs once when the component mounts to check if the user is already logged in.
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
            // Server returned 200 but said user is null (not logged in)
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // Fallback for true errors (500, etc)
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

  // Login function - Moved to PR 2
  // async function login(emailOrUsername, password) { ... }

  // Signup function
  // Registers a new user. It does NOT automatically log them in; they must verify email first.
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
      // The backend returns the user object and verification details.
      const data = await res.json();
      setIsLoading(false);
      return { success: true, ...data };
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
      return { success: false, msg: (await res.json()).msg };
    }
  }

  // Logout function - Moved to PR 2
  // async function logout() { ... }

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
        // login, // Moved to PR 2
        signup,
        // logout, // Moved to PR 2
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
