import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/shop/ProductCard';
import { api } from '../lib/api';
import type { Product } from '../lib/types';

export default function Wishlist() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const load = () => api<{ products: Product[] }>('/wishlist').then((r) => setProducts(r.products)).catch(() => setProducts([]));
  useEffect(() => { load(); }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-5xl font-semibold">Saved for later</h1>
      {products?.length === 0 && <p className="text-muted">Nothing saved yet. <Link to="/shop" className="font-semibold text-blue">Browse</Link> or ask Mela to save things for you.</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products?.map((p) => (
          <div key={p.id} className="space-y-2">
            <ProductCard product={p} />
            <button className="text-sm font-semibold text-crimson hover:underline" onClick={() => api(`/wishlist/${p.id}`, { method: 'DELETE' }).then(load)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
