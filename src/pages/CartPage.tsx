import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import ProductImage from '../components/shop/ProductImage';
import { money } from '../lib/format';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cart, setQuantity, remove } = useCart();
  if (!cart) return <p className="mx-auto max-w-5xl px-4 py-20 text-muted">Loading…</p>;

  if (!cart.items.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-5xl font-semibold">Your bag is empty.</h1>
        <p className="mt-3 text-muted">The aisles are calling. So is Mela.</p>
        <Link to="/shop" className="btn-action mt-8">Start shopping</Link>
      </div>
    );
  }

  const toFree = cart.freeShippingOver - cart.subtotal;
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_340px]">
      <div>
        <h1 className="mb-6 text-5xl font-semibold">Your bag</h1>
        <ul className="divide-y-2 divide-ink/10 rounded-blob border-2 border-ink bg-paper">
          {cart.items.map(({ lineId, product, variant, quantity, lineTotal }) => (
            <li key={lineId} className="flex gap-4 p-4">
              <ProductImage src={variant.image || product.image} alt={product.title} className="h-24 w-24 shrink-0 rounded-2xl border-2 border-ink" />
              <div className="flex flex-1 flex-col">
                <Link to={`/p/${product.handle}`} className="font-display text-lg font-bold hover:underline">{product.title}</Link>
                {variant.title !== 'Default Title' && <p className="text-sm font-semibold">{variant.title}</p>}
                <p className="text-sm text-muted">{product.vendor} · {money(variant.price)}{variant.sku ? ` · ${variant.sku}` : ''}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-full border-2 border-ink">
                    <button className="p-2" onClick={() => (quantity > 1 ? setQuantity(product.id, variant.id, quantity - 1) : remove(product.id, variant.id))} aria-label="Decrease"><Minus size={14} /></button>
                    <span className="w-6 text-center text-sm font-bold">{quantity}</span>
                    <button className="p-2" onClick={() => setQuantity(product.id, variant.id, quantity + 1).catch((e) => alert(e.message))} aria-label="Increase"><Plus size={14} /></button>
                  </div>
                  <span className="font-display text-lg font-bold">{money(lineTotal)}</span>
                </div>
              </div>
              <button onClick={() => remove(product.id, variant.id)} className="self-start p-1 text-muted hover:text-crimson" aria-label={`Remove ${product.title}`}><Trash2 size={18} /></button>
            </li>
          ))}
        </ul>
      </div>
      <Summary subtotal={cart.subtotal} shipping={cart.shipping} total={cart.total}>
        {toFree > 0 && <p className="rounded-xl bg-yellow-soft px-3 py-2 text-sm">Add {money(toFree)} more for free shipping.</p>}
        <p className="text-xs text-muted">Parcel weight ≈ {cart.weightGrams >= 1000 ? `${(cart.weightGrams / 1000).toFixed(1)} kg` : `${cart.weightGrams} g`}</p>
        <Link to="/checkout" className="btn-action w-full text-lg">Checkout</Link>
      </Summary>
    </div>
  );
}

export function Summary({ subtotal, shipping, total, children }: { subtotal: number; shipping: number; total: number; children?: React.ReactNode }) {
  return (
    <aside className="h-fit space-y-4 rounded-blob border-2 border-ink bg-yellow-soft p-6 shadow-sticker-lg lg:sticky lg:top-28">
      <h2 className="text-2xl font-semibold">Summary</h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-semibold">{money(subtotal)}</dd></div>
        <div className="flex justify-between"><dt>Shipping</dt><dd className="font-semibold">{shipping ? money(shipping) : 'Free'}</dd></div>
        <div className="flex justify-between border-t-2 border-ink pt-2 text-lg"><dt className="font-bold">Total</dt><dd className="font-display font-semibold">{money(total)}</dd></div>
      </dl>
      {children}
    </aside>
  );
}
