import { createContext, useContext, useEffect, useState } from 'react';
import type { Settings } from '../lib/types';
import { site } from '../site.config';

type AsyncState<T> = { data?: T; error?: Error; loading: boolean };

export function useAsync<T>(load: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ loading: true });

  useEffect(() => {
    let alive = true;
    setState({ loading: true });
    load().then(
      (data) => alive && setState({ data, loading: false }),
      (error: Error) => alive && setState({ error, loading: false }),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export function useTitle(title: string | undefined) {
  useEffect(() => {
    document.title = title ? `${title} — ${site.title}` : `${site.title} — ${site.fullName}`;
  }, [title]);
}

export const SettingsContext = createContext<Settings | undefined>(undefined);

export const useSettings = () => useContext(SettingsContext);
