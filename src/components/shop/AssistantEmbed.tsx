import { useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

/**
 * Embeds the third-party AI assistant exactly as any merchant would:
 *   1. load <script src=".../widget.js" data-widget-id="…">
 *   2. Unicorn.on("add_to_cart" | "remove_from_cart" | "add_to_wishlist", …)
 *      — the AI asks; *our* cart performs it
 *   3. Unicorn.identify({...hash}) for signed-in shoppers (HMAC from our server)
 *   4. Unicorn.setCart(...) so the assistant can see the bag
 *   5. Unicorn.setPage / track — browsing signals that personalise recommendations
 * The store holds no AI code or keys.
 */
type Action = { type: string; product?: { externalId: string; title: string }; variant?: { externalId: string } | null; quantity?: number };
type UnicornFn = ((method: string, ...args: unknown[]) => unknown) & { q?: unknown[] };
declare global {
  interface Window { Unicorn?: UnicornFn }
}

const SCRIPT_URL = import.meta.env.VITE_ASSISTANT_SCRIPT_URL as string | undefined;
const WIDGET_ID = import.meta.env.VITE_ASSISTANT_WIDGET_ID as string | undefined;

// Queue calls until the script loads (the standard snippet pattern).
export function unicorn(method: string, ...args: unknown[]) {
  if (!window.Unicorn) {
    const stub = ((...a: unknown[]) => { (stub.q = stub.q || []).push(a); }) as UnicornFn;
    window.Unicorn = stub;
  }
  return window.Unicorn(method, ...args);
}

export default function AssistantEmbed() {
  const { user } = useAuth();
  const { cart, add, remove } = useCart();

  // 1–2: load once and register action handlers.
  useEffect(() => {
    if (!SCRIPT_URL || !WIDGET_ID || document.querySelector('script[data-widget-id]')) return;
    unicorn('on', 'add_to_cart', async (a: Action) => {
      await add(a.product!.externalId, a.quantity || 1, a.variant?.externalId);
    });
    unicorn('on', 'remove_from_cart', async (a: Action) => {
      if (a.variant) await remove(a.product!.externalId, a.variant.externalId);
    });
    unicorn('on', 'add_to_wishlist', async (a: Action) => {
      if (!user) return { message: 'Sign in to save items to your wishlist' };
      await api('/wishlist', { method: 'POST', body: { productId: a.product!.externalId } });
    });
    const s = document.createElement('script');
    s.src = SCRIPT_URL;
    s.async = true;
    s.dataset.widgetId = WIDGET_ID;
    document.body.appendChild(s);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 3: identity verification for signed-in shoppers.
  useEffect(() => {
    if (!SCRIPT_URL) return;
    if (!user) {
      unicorn('identify', null);
      return;
    }
    api<{ userId: string; email: string; name: string; hash: string }>('/assistant/identity')
      .then((identity) => unicorn('identify', identity))
      .catch(() => undefined);
  }, [user]);

  // 4: share the cart so "what's in my bag?" works.
  useEffect(() => {
    if (!SCRIPT_URL || !cart) return;
    unicorn('setCart', {
      currency: cart.currency,
      total: cart.total,
      items: cart.items.map((i) => ({
        productId: i.product.id,
        variantId: i.variant.id,
        title: i.product.title,
        variantTitle: i.variant.title,
        quantity: i.quantity,
        price: i.unitPrice,
      })),
    });
  }, [cart]);

  return null;
}
