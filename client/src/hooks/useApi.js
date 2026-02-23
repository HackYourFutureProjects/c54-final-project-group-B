import { useState } from "react";

/**
 * useApi hook for imperative API calls (like POST, PUT, DELETE)
 * Provides error handling, loading state, and parses JSON automatically.
 */
const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (route, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      let actualRoute = route.startsWith("/api/") ? route.substring(4) : route;
      const url = `/api${actualRoute}`;

      const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.msg || data.error || `Error ${res.status}`);
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading, error };
};

export default useApi;
