import { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Check, Package } from 'lucide-react';
import ProductImage from '../components/shop/ProductImage';
import { api } from '../lib/api';
import { money, titleCase } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import type { Order } from '../lib/types';

const STEPS = ['placed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

export function OrderTimeline({ order }: { order: Order }) {
  if (order.status === 'cancelled') return <p className="rounded-xl bg-crimson-soft px-4 py-3 font-semibold text-crimson">This order was cancelled.</p>;
  const at = STEPS.indexOf(order.status);
  return (
    <ol className="grid grid-cols-5 gap-1">
      {STEPS.map((s, i) => (
        <li key={s} className="text-center">
          <span className={`mx-auto grid h-9 w-9 place-items-center rounded-full border-2 border-ink ${i <= at ? 'bg-green text-paper' : 'bg-paper'}`}>
            {i <= at ? <Check size={16} /> : i + 1}
          </span>
          <span className={`mt-1 block text-[11px] font-semibold sm:text-xs ${i <= at ? '' : 'text-muted'}`}>{titleCase(s)}</span>
        </li>
      ))}
    </ol>
  );
}

export function OrderCard({ order }: { order: Order }) {
  return (
    <div className="card space-y-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="eyebrow">Order</p>
          <p className="font-mono text-xl font-semibold">{order.orderNumber}</p>
        </div>
        <p className="text-sm text-muted">{new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
      </div>
      <OrderTimeline order={order} />
      <ul className="space-y-3">
        {order.items.map((i) => (
          <li key={`${i.productId}:${i.variantId}`} className="flex items-center gap-3">
            <ProductImage src={i.image} alt={i.name} className="h-14 w-14 rounded-xl border border-line" />
            <span className="flex-1 text-sm">
              <span className="font-semibold">{i.name}</span> × {i.quantity}
              {i.variantTitle && <span className="block text-xs text-muted">{i.variantTitle}{i.sku ? ` · ${i.sku}` : ''}</span>}
            </span>
            <span className="text-sm">{money(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between border-t-2 border-ink/10 pt-3">
        <span className="text-sm text-muted">{titleCase(order.paymentMethod)} · {order.paymentStatus} · to {order.shippingAddress.city}</span>
        <span className="font-display text-xl font-semibold">{money(order.total)}</span>
      </div>
    </div>
  );
}

export function OrderDetail() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const state = location.state as { order?: Order; fresh?: boolean; email?: string } | null;
  const [order, setOrder] = useState<Order | null>(state?.order || null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) return;
    api<{ order: Order }>(`/orders/track/${orderNumber}`).then((r) => setOrder(r.order)).catch((e) => setError(e.message));
  }, [orderNumber, order]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {state?.fresh && (
        <div className="mb-8 rounded-blob border-2 border-ink bg-green p-6 text-paper shadow-sticker-lg">
          <p className="font-display text-4xl font-semibold">Shukriya! 🎉</p>
          <p className="mt-1">Order placed. Ask Mela “track {orderNumber}” anytime{state.email ? ` — use ${state.email} if you're a guest` : ''}.</p>
        </div>
      )}
      {error && <p className="text-crimson">{error}</p>}
      {order && <OrderCard order={order} />}
    </div>
  );
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  useEffect(() => {
    if (user) api<{ orders: Order[] }>('/orders').then((r) => setOrders(r.orders)).catch(() => setOrders([]));
  }, [user]);

  if (!user) return <div className="mx-auto max-w-xl px-4 py-24 text-center"><p className="text-2xl font-bold">Sign in to see your orders.</p><Link className="btn-action mt-6" to="/login">Sign in</Link> <Link className="btn-ghost mt-6" to="/track">Track as guest</Link></div>;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-5xl font-semibold">My orders</h1>
      {orders?.length === 0 && <p className="text-muted">No orders yet.</p>}
      <div className="space-y-6">{orders?.map((o) => <OrderCard key={o.orderNumber} order={o} />)}</div>
    </div>
  );
}

export function Track() {
  const [params] = useSearchParams();
  const [number, setNumber] = useState(params.get('order') || '');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    try {
      const r = await api<{ order: Order }>(`/orders/track/${encodeURIComponent(number.trim())}?email=${encodeURIComponent(email)}`);
      setOrder(r.order);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-5xl font-semibold">Where's my stuff?</h1>
      <form onSubmit={lookup} className="card mt-8 grid gap-4 p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div><label className="label" htmlFor="on">Order number</label><input id="on" className="input font-mono uppercase" placeholder="SS-XXXXXX" required value={number} onChange={(e) => setNumber(e.target.value)} /></div>
        <div><label className="label" htmlFor="em">Checkout email</label><input id="em" className="input" type="email" placeholder="Guests only" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <button className="btn-primary"><Package size={16} /> Track</button>
      </form>
      {error && <p className="mt-4 text-crimson">{error}</p>}
      {order && <div className="mt-8"><OrderCard order={order} /></div>}
    </div>
  );
}
