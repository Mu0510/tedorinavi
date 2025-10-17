'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface UrlStateOptions<T> {
  defaults: T;
  parse: (params: URLSearchParams, current: T) => T;
  serialize: (state: T) => Record<string, string | number | boolean | null | undefined>;
  storageKey?: string;
  debounceMs?: number;
}

export interface UrlStateMeta<T> {
  hydrated: boolean;
  reset: (next?: T) => void;
}

function readStorage<T>(storageKey: string | undefined, fallback: T): T {
  if (typeof window === "undefined" || !storageKey) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<T>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

function syncToStorage<T>(storageKey: string | undefined, value: T) {
  if (typeof window === "undefined" || !storageKey) return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

function syncToUrl<T>(
  serialize: UrlStateOptions<T>["serialize"],
  value: T,
  removeKeys: string[] = []
) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);

  removeKeys.forEach((key) => params.delete(key));

  const payload = serialize(value);
  Object.entries(payload).forEach(([key, raw]) => {
    if (raw === undefined || raw === null || raw === "") {
      params.delete(key);
    } else {
      params.set(key, String(raw));
    }
  });

  const search = params.toString();
  const nextUrl = search ? `${window.location.pathname}?${search}` : window.location.pathname;
  window.history.replaceState(null, "", nextUrl);
}

export function useUrlState<T>({
  defaults,
  parse,
  serialize,
  storageKey,
  debounceMs = 300
}: UrlStateOptions<T>) {
  const [state, setState] = useState<T>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const isMounted = useRef(false);
  const debounceId = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || isMounted.current) return;

    const params = new URLSearchParams(window.location.search);
    const stored = readStorage(storageKey, defaults);
    const parsed = parse(params, stored);

    setState(parsed);
    setHydrated(true);
    isMounted.current = true;
  }, [defaults, parse, storageKey]);

  useEffect(() => {
    return () => {
      if (debounceId.current !== null) {
        window.clearTimeout(debounceId.current);
      }
    };
  }, []);

  const scheduleSync = useCallback(
    (nextState: T) => {
      if (typeof window === "undefined") return;
      if (debounceId.current !== null) {
        window.clearTimeout(debounceId.current);
      }
      debounceId.current = window.setTimeout(() => {
        syncToUrl(serialize, nextState, ["demo"]);
        syncToStorage(storageKey, nextState);
      }, debounceMs);
    },
    [debounceMs, serialize, storageKey]
  );

  const update = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setState((prev) => {
        const nextState = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
        if (isMounted.current) {
          scheduleSync(nextState);
        }
        return nextState;
      });
    },
    [scheduleSync]
  );

  const reset = useCallback(
    (next?: T) => {
      const value = next ?? defaults;
      setState(value);
      if (typeof window !== "undefined") {
        syncToUrl(serialize, value, ["demo"]);
        syncToStorage(storageKey, value);
      }
    },
    [defaults, serialize, storageKey]
  );

  return useMemo(
    () => [state, update, { hydrated, reset }] as const,
    [state, update, hydrated, reset]
  );
}

export default useUrlState;
