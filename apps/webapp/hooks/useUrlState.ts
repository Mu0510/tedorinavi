'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface UrlStateOptions<T> {
  initialState: T;
  parse: (params: URLSearchParams, current: T) => T;
  serialize: (state: T) => Record<string, string | number | undefined>;
  debounceMs?: number;
}

export function useUrlState<T>({
  initialState,
  parse,
  serialize,
  debounceMs = 300
}: UrlStateOptions<T>) {
  const [state, setState] = useState<T>(initialState);
  const mounted = useRef(false);
  const timerId = useRef<number>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const parsed = parse(params, initialState);
    setState(parsed);
    mounted.current = true;
  }, [initialState, parse]);

  useEffect(() => {
    return () => {
      if (timerId.current) {
        window.clearTimeout(timerId.current);
      }
    };
  }, []);

  const scheduleUpdate = useCallback(
    (nextState: T) => {
      if (typeof window === "undefined") return;
      if (timerId.current) {
        window.clearTimeout(timerId.current);
      }
      timerId.current = window.setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const payload = serialize(nextState);
        Object.entries(payload).forEach(([key, value]) => {
          if (value === undefined || value === null || value === "") {
            params.delete(key);
          } else {
            params.set(key, String(value));
          }
        });
        const nextUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState(null, "", nextUrl);
      }, debounceMs);
    },
    [debounceMs, serialize]
  );

  const update = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setState((prev) => {
        const nextState = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
        scheduleUpdate(nextState);
        return nextState;
      });
    },
    [scheduleUpdate]
  );

  return useMemo(() => [state, update] as const, [state, update]);
}

export default useUrlState;
