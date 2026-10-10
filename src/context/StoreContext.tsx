import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { StoreSettings } from '../lib/types';

// Store-wide settings (name, announcement, nav, footer, home sections) come
// from the backend so merchants change them without a deploy.
const StoreContext = createContext<StoreSettings | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<StoreSettings | null>(null);
  useEffect(() => {
    api<{ store: StoreSettings }>('/store').then((r) => setStore(r.store)).catch(() => undefined);
  }, []);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
