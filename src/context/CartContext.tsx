import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { Cart } from '../lib/types';

type CartState = {
  cart: Cart | null;
  bump: number; // increments on every change; drives the badge pop
  toast: string | null;
  refresh: () => Promise<void>;
  add: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  setQuantity: (productId: string, variantId: string, quantity: number) => Promise<void>;
  remove: (productId: string, variantId: string) => Promise<void>;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [bump, setBump] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const apply = useCallback((next: Cart, message?: string) => {
    setCart((prev) => {
      if (prev && prev.count !== next.count) setBump((b) => b + 1);
      return next;
    });
    if (message) {
      setToast(message);
      window.setTimeout(() => setToast(null), 2600);
    }
  }, []);

  const refresh = useCallback(async () => {
    const r = await api<{ cart: Cart }>('/cart');
    apply(r.cart);
  }, [apply]);

  useEffect(() => {
    refresh().catch(() => undefined);
    const onIdentity = () => refresh().catch(() => undefined);
    window.addEventListener('ss:identity', onIdentity);
    // The chatbot announces cart changes it made via tools.
    window.addEventListener('ss:cart-updated', onIdentity);
    return () => {
      window.removeEventListener('ss:identity', onIdentity);
      window.removeEventListener('ss:cart-updated', onIdentity);
    };
  }, [refresh]);

  const value: CartState = {
    cart,
    bump,
    toast,
    refresh,
    add: async (productId, quantity = 1, variantId) => {
      const r = await api<{ cart: Cart; added: { name: string; variant: { title: string } } }>('/cart/items', {
        method: 'POST',
        body: { productId, variantId, quantity },
      });
      const variant = r.added.variant.title !== 'Default Title' ? ` (${r.added.variant.title})` : '';
      apply(r.cart, `${r.added.name}${variant} added to your bag`);
    },
    setQuantity: async (productId, variantId, quantity) => {
      const r = await api<{ cart: Cart }>(`/cart/items/${productId}`, { method: 'PATCH', body: { quantity, variantId } });
      apply(r.cart);
    },
    remove: async (productId, variantId) => {
      const r = await api<{ cart: Cart }>(`/cart/items/${productId}?variantId=${variantId}`, { method: 'DELETE' });
      apply(r.cart);
    },
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
