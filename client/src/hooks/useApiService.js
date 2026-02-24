import { useState, useCallback } from "react";

/**
 * A universally reusable hook for triggering API calls from components.
 * It manages isLoading and error states automatically.
 */
export const useApiService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCallFunction) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiCallFunction();
      return { success: true, data: result, error: null };
    } catch (err) {
      const errorMessage = err.message || "An unexpected error occurred.";
      setError(errorMessage);
      return { success: false, data: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { execute, isLoading, error, setError };
};

export default useApiService;
