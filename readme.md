# ShopSmart storefront (demo merchant)

React + Vite storefront and store admin. The AI assistant is **not built in**:
it's Unicorn's embeddable widget, integrated exactly as a merchant would in
`src/components/shop/AssistantEmbed.tsx`:

1. loads `widget.js` with `VITE_ASSISTANT_WIDGET_ID`
2. handles `add_to_cart` / `remove_from_cart` / `add_to_wishlist` client actions with the store's own cart
3. `identify()`s signed-in shoppers with an HMAC from the store backend
4. shares the cart via `setCart()`

```bash
npm install
cp .env.example .env   # VITE_ASSISTANT_SCRIPT_URL, VITE_ASSISTANT_WIDGET_ID (from the Unicorn dashboard)
npm run dev            # :7007, proxies /api to the store backend :7008
```
Everything except the hero loads from the store backend (settings, nav,
footer, home sections, collections, products with variants).
