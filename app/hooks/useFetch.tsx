import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for efficient data fetching with loading and error states.
 * Prevents infinite request loops and handles cleanup on unmount.
 *
 * @param fetchFn - The function that fetches data
 * @param dependencies - Array of dependencies that should trigger a refetch when changed
 * @returns Object containing data, loading state, error state, and refetch function
 */
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  dependencies: readonly unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the fetch function to prevent unnecessary rerenders
  const memoizedFetchFn = useCallback(fetchFn, dependencies);

  // Execute the fetch operation in useEffect
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await memoizedFetchFn();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(typeof err === "string" ? err : "An error occurred");
          console.error("Fetch error:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [memoizedFetchFn]);

  // Function to manually trigger a refetch
  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await memoizedFetchFn();
      setData(result);
      return result;
    } catch (err) {
      setError(typeof err === "string" ? err : "An error occurred");
      console.error("Fetch error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [memoizedFetchFn]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
