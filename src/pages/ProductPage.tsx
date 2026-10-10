import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart, Minus, Plus, Scale, ShieldCheck, Truck } from 'lucide-react';
import ProductCard, { swatch } from '../components/shop/ProductCard';
import ProductImage from '../components/shop/ProductImage';
import Rating from '../components/shop/Rating';
import { api } from '../lib/api';
import { unicorn } from '../components/shop/AssistantEmbed';
import { money } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import type { Product, ProductDetail, Variant } from '../lib/types';

const formatWeight = (v: Variant) => (v.weightGrams >= 1000 ? `${(v.weightGrams / 1000).toFixed(1)} kg` : `${v.weightGrams} g`);

export default function ProductPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { add } = useCart();
  const store = useStore();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [image, setImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProduct(null);
    setQty(1);
    setImage(0);
    api<{ product: ProductDetail }>(`/products/${slug}`)
      .then((r) => {
        setProduct(r.product);
        unicorn('setPage', { productId: r.product.id });
        // Pre-select the first in-stock variant, like Shopify themes do.
        const first = r.product.variants.find((v) => v.available) || r.product.variants[0];
        setSelected(first.options);
      })
      .catch((e) => setError(e.message));
    api<{ products: Product[] }>(`/products/${slug}/similar`).then((r) => setSimilar(r.products)).catch(() => undefined);
  }, [slug]);

  const variant = useMemo(
    () => product?.variants.find((v) => Object.entries(selected).every(([k, val]) => v.options[k] === val)) || null,
    [product, selected]
  );

  if (error) return <p className="mx-auto max-w-7xl px-4 py-20 text-center text-xl">{error}</p>;
  if (!product) return <p className="mx-auto max-w-7xl px-4 py-20 text-muted">Loading…</p>;

  // Is the value reachable given the other current selections?
  const reachable = (name: string, value: string) =>
    product.variants.some((v) => v.available && v.options[name] === value && Object.entries(selected).every(([k, val]) => k === name || v.options[k] === val));
  const images = variant?.image ? [{ id: 'v', url: variant.image, alt: variant.title }, ...product.images] : product.images;
  const price = variant?.price ?? product.price;
  const compareAt = variant?.compareAtPrice;
  const shippingNote = store ? (price >= store.freeShippingOver ? 'Ships free' : `Free shipping over ${money(store.freeShippingOver)}`) : '';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="eyebrow flex flex-wrap gap-1">
        <Link to="/shop" className="hover:text-ink">Shop</Link>
        {product.category.split('>').map((seg) => (
          <span key={seg}>/ <Link to={`/shop?category=${encodeURIComponent(seg.trim())}`} className="hover:text-ink">{seg.trim()}</Link></span>
        ))}
      </nav>
      <div className="mt-4 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-[32px] border-2 border-ink bg-paper shadow-sticker-lg">
            <ProductImage src={(images[image] || images[0])?.url.replace('w=900', 'w=1200') || ''} alt={product.title} className="aspect-square w-full" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button key={img.id + i} onClick={() => setImage(i)} className={`overflow-hidden rounded-xl border-2 ${i === image ? 'border-ink' : 'border-line'}`} aria-label={`Image ${i + 1}`}>
                  <ProductImage src={img.url} alt="" className="h-16 w-16" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow">{product.vendor} · {product.productType}</p>
          <h1 className="mt-1 text-5xl font-semibold leading-[1.02]">{product.title}</h1>
          <div className="mt-3"><Rating value={product.rating} count={product.ratingCount} /></div>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-semibold">{money(price)}</span>
            {compareAt && compareAt > price && <span className="text-lg text-muted line-through">{money(compareAt)}</span>}
          </div>
          <p className="mt-6 text-lg leading-relaxed text-ink/85">{product.description}</p>

          {product.options.map((opt) => {
            const isColor = /colou?r/i.test(opt.name);
            return (
              <fieldset key={opt.name} className="mt-6">
                <legend className="mb-2 text-sm font-semibold">{opt.name}: <span className="text-muted">{selected[opt.name]}</span></legend>
                <div className="flex flex-wrap gap-2">
                  {opt.values.map((value) => {
                    const on = selected[opt.name] === value;
                    const ok = reachable(opt.name, value);
                    return (
                      <button
                        key={value}
                        onClick={() => setSelected({ ...selected, [opt.name]: value })}
                        aria-pressed={on}
                        className={`flex items-center gap-2 rounded-full border-2 px-4 py-1.5 text-sm font-semibold ${on ? 'border-ink bg-ink text-paper' : 'border-line bg-paper hover:border-ink'} ${ok ? '' : 'opacity-40 line-through'}`}
                      >
                        {isColor && <span className="h-4 w-4 rounded-full border border-ink/40" style={{ background: swatch(value) }} />}
                        {value}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border-2 border-ink bg-paper">
              <button className="p-3" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><Minus size={16} /></button>
              <span className="w-8 text-center font-bold">{qty}</span>
              <button className="p-3" onClick={() => setQty(Math.min(Math.max(1, variant?.inventoryQuantity || 1), qty + 1))} aria-label="Increase"><Plus size={16} /></button>
            </div>
            <button className="btn-action flex-1 text-lg" disabled={!variant?.available} onClick={() => variant && add(product.id, qty, variant.id).then(() => unicorn('track', 'add_to_cart', { productId: product.id, variantId: variant.id, quantity: qty, price: variant.price })).catch((e) => alert(e.message))}>
              {!variant ? 'Unavailable combination' : variant.available ? 'Add to bag' : 'Sold out'}
            </button>
            {user && (
              <button
                className={`grid h-12 w-12 place-items-center rounded-full border-2 border-ink ${saved ? 'bg-crimson text-paper' : 'bg-paper'}`}
                onClick={() => api('/wishlist', { method: 'POST', body: { productId: product.id } }).then(() => { setSaved(true); unicorn('track', 'add_to_wishlist', { productId: product.id }); })}
                aria-label="Save to wishlist"
              >
                <Heart size={18} className={saved ? 'fill-paper' : ''} />
              </button>
            )}
          </div>
          {variant && (
            <p className="mt-2 text-sm text-muted">
              {variant.available ? `${variant.inventoryQuantity} in stock` : 'Back soon'} · SKU {variant.sku} · <Scale size={13} className="inline" /> {formatWeight(variant)}
            </p>
          )}

          <div className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
            {shippingNote && <p className="flex items-center gap-2"><Truck size={18} className="text-green" /> {shippingNote}</p>}
            <p className="flex items-center gap-2"><ShieldCheck size={18} className="text-blue" /> 30-day returns</p>
          </div>

          {Object.keys(product.specs).length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border-2 border-ink bg-ink">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="bg-paper px-4 py-3 [&:last-child:nth-child(odd)]:col-span-2">
                  <dt className="eyebrow">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            {product.collections.filter((c) => c.handle).map((c) => <Link key={c.id} to={`/collections/${c.handle}`} className="chip border-ink bg-yellow-soft font-semibold">{c.title}</Link>)}
            {product.tags.map((t) => <Link key={t} to={`/shop?tags=${t}`} className="chip hover:border-ink">#{t}</Link>)}
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-3xl font-semibold">You might also like</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{similar.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}
