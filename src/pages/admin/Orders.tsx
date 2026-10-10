import { useEffect, useState } from 'react';
import { ErrorNote, PageHeader, Section } from '../../components/admin/ui';
import { api } from '../../lib/api';
import { money, titleCase } from '../../lib/format';
import type { Order } from '../../lib/types';

const STATUSES = ['placed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const load = () => api<{ orders: Order[] }>('/admin/orders').then((r) => setOrders(r.orders)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const setStatus = (o: Order, status: string) =>
    api(`/admin/orders/${o.orderNumber}/status`, { method: 'PATCH', body: { status } }).then(load).catch((e) => setError(e.message));

  return (
    <div className="max-w-6xl">
      <PageHeader title="Orders" description="Advance an order's status to see tracking update on the storefront and in the assistant." />
      <ErrorNote error={error} />
      <Section title={`${orders.length} orders`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted">
              <tr><th className="py-2 pr-4">Order</th><th className="pr-4">Customer</th><th className="pr-4">Items</th><th className="pr-4">Total</th><th className="pr-4">Payment</th><th>Status</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.orderNumber}>
                  <td className="py-2 pr-4 font-mono">{o.orderNumber}<div className="font-sans text-xs text-muted">{new Date(o.createdAt).toLocaleDateString('en-IN')}</div></td>
                  <td className="pr-4">{o.shippingAddress.name}<div className="text-xs text-muted">{o.email}</div></td>
                  <td className="pr-4">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                  <td className="pr-4 font-semibold">{money(o.total)}</td>
                  <td className="pr-4 text-xs">{titleCase(o.paymentMethod)} · {o.paymentStatus}</td>
                  <td>
                    <select className="input py-1 text-sm" value={o.status} onChange={(e) => setStatus(o, e.target.value)} aria-label={`Status for ${o.orderNumber}`}>
                      {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="py-6 text-center text-sm text-muted">No orders yet.</p>}
        </div>
      </Section>
    </div>
  );
}
