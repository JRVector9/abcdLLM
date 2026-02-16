import { useState, useEffect, useCallback, useRef } from 'react';

const CACHE_PREFIX = 'swr:';

interface SWRResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | undefined;
  mutate: () => Promise<void>;
}

export function useSWR<T>(key: string, fetcher: () => Promise<T>): SWRResult<T> {
  const [data, setData] = useState<T | undefined>(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_PREFIX + key);
      return cached ? JSON.parse(cached) : undefined;
    } catch {
      return undefined;
    }
  });
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const mountedRef = useRef(true);

  const revalidate = useCallback(async () => {
    setIsValidating(true);
    try {
      const fresh = await fetcher();
      if (!mountedRef.current) return;
      setData(fresh);
      setError(undefined);
      try {
        sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(fresh));
      } catch { /* quota exceeded */ }
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      if (mountedRef.current) setIsValidating(false);
    }
  }, [key, fetcher]);

  useEffect(() => {
    mountedRef.current = true;
    revalidate();
    return () => { mountedRef.current = false; };
  }, [revalidate]);

  const isLoading = data === undefined && !error;

  return { data, isLoading, isValidating, error, mutate: revalidate };
}
