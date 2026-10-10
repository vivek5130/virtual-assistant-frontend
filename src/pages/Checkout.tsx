import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Summary } from './CartPage';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { Order } from '../lib/types';

type StoreConfig = { paymentMethods: { id: string; label: string }[] };
const FIELDS: [keyof Address, string, string][] = [
  ['name', 'Full name', 'name'],
  ['phone', 'Phone', 'tel'],
  ['line1', 'Address', 'street-address'],
  ['city', 'City', 'address-level2'],
  ['state', 'State', 'address-level1'],
  ['postalCode', 'PIN code', 'postal-code'],
];
type Address = { name: string; phone: string; line1: string; city: string; state: string; postalCode: string };

export default function Checkout() {
  const { user } = useAuth();
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreConfig | null>(null);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState<Address>({ name: user?.name || '', phone: '', line1: '', city: '', state: '', postalCode: '' });
  const [payment, setPayment] = useState('cod');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<StoreConfig>('/checkout/config').then(setStore).catch(() => undefined);
  }, []);

  if (cart && !cart.items.length) {
    return <div className="mx-auto max-w-xl px-4 py-24 text-center"><p className="text-2xl font-bold">Nothing to check out.</p><Link to="/shop" className="btn-action mt-6">Shop</Link></div>;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api<{ order: Order }>('/orders', { method: 'POST', body: { email: user?.email || email, shippingAddress: address, paymentMethod: payment } });
      await refresh();
      navigate(`/orders/${r.order.orderNumber}`, { state: { order: r.order, fresh: true, email: user?.email || email } });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_340px]">
      <div className="space-y-8">
        <h1 className="text-5xl font-semibold">Checkout</h1>
        {!user && (
          <section className="card p-6">
            <h2 className="mb-1 text-xl font-bold">Contact</h2>
            <p className="mb-4 text-sm text-muted">Checking out as a guest. <Link to="/login" className="font-semibold text-blue">Sign in</Link> to track orders from your account.</p>
            <label className="label" htmlFor="email">Email (for tracking)</label>
            <input id="email" className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </section>
        )}
        <section className="card p-6">
          <h2 className="mb-4 text-xl font-bold">Delivery address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map(([key, label, ac]) => (
              <div key={key} className={key === 'line1' ? 'sm:col-span-2' : ''}>
                <label className="label" htmlFor={key}>{label}</label>
                <input id={key} className="input" required autoComplete={ac} value={address[key]} onChange={(e) => setAddress({ ...address, [key]: e.target.value })} />
              </div>
            ))}
          </div>
        </section>
        <section className="card p-6">
          <h2 className="mb-4 text-xl font-bold">Payment</h2>
          <div className="space-y-2">
            {store?.paymentMethods.map((m) => (
              <label key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 ${payment === m.id ? 'border-ink bg-green-soft' : 'border-line'}`}>
                <input type="radio" name="payment" value={m.id} checked={payment === m.id} onChange={() => setPayment(m.id)} className="accent-green" />
                <span className="font-semibold">{m.label}</span>
              </label>
            ))}
          </div>
          <p className="hint">Demo store: no real payment is taken.</p>
        </section>
      </div>
      {cart && (
        <Summary subtotal={cart.subtotal} shipping={cart.shipping} total={cart.total}>
          {error && <p className="rounded-xl bg-crimson-soft px-3 py-2 text-sm text-crimson">{error}</p>}
          <button className="btn-action w-full text-lg" disabled={busy}>{busy ? 'Placing order…' : 'Place order'}</button>
        </Summary>
      )}
    </form>
  );
}
