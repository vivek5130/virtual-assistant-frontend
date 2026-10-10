import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Save, Trash2, Wand2 } from 'lucide-react';
import { Badge, ChipsInput, ErrorNote, Field, PageHeader, Section, btn } from '../../components/admin/ui';
import ProductImage from '../../components/shop/ProductImage';
import { api } from '../../lib/api';
import { money, timeAgo } from '../../lib/format';
import type { Collection, Product, ProductDetail, ProductOption } from '../../lib/types';

type AdminProduct = Product & { status: string; updatedAt: string };
type VariantRow = {
  id?: string;
  title: string;
  options: Record<string, string>;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  inventoryQuantity: number;
  inventoryPolicy: 'deny' | 'continue';
  weight: number;
  weightUnit: string;
};
type Draft = {
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  category: string;
  tags: string[];
  status: string;
  collections: string[];
  images: string[];
  options: ProductOption[];
  variants: VariantRow[];
  specs: { key: string; value: string }[];
  seo: { title?: string; description?: string };
};

const STATUS_TONE = { active: 'green', draft: 'yellow', archived: 'neutral' } as const;
const EMPTY: Draft = {
  title: '', handle: '', description: '', vendor: '', productType: '', category: '', tags: [], status: 'draft', collections: [], images: [],
  options: [], specs: [], seo: {},
  variants: [{ title: 'Default Title', options: {}, sku: '', price: 0, inventoryQuantity: 0, inventoryPolicy: 'deny', weight: 0, weightUnit: 'g' }],
};

export function ProductsList() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const t = window.setTimeout(() => {
      api<{ products: AdminProduct[] }>(`/admin/products?q=${encodeURIComponent(q)}&status=${status}`).then((r) => setProducts(r.products)).catch((e) => setError(e.message));
    }, 200);
    return () => window.clearTimeout(t);
  }, [q, status]);

  return (
    <div className="max-w-6xl">
      <PageHeader title="Products" description="Shopify-style catalog: options, variants (SKU, price, stock, weight), collections, tags and specs. The storefront and the AI tools read from here." actions={<Link to="/admin/products/new" className={btn.primary}><Plus size={16} /> Add product</Link>} />
      <ErrorNote error={error} />
      <div className="mb-4 flex gap-2">
        <input className="input max-w-sm" placeholder="Search by title" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
        <select className="input w-40" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status filter">
          <option value="">All statuses</option><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line bg-paper">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-xs text-muted">
            <tr><th className="p-3">Product</th><th className="p-3">Status</th><th className="p-3">Inventory</th><th className="p-3">Type</th><th className="p-3">Vendor</th><th className="p-3">Price</th><th className="p-3">Updated</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-cream/60">
                <td className="p-3">
                  <Link to={`/admin/products/${p.id}`} className="flex items-center gap-3 font-semibold hover:underline">
                    <ProductImage src={p.image} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-line" />
                    {p.title}
                  </Link>
                </td>
                <td className="p-3"><Badge tone={STATUS_TONE[p.status as keyof typeof STATUS_TONE] || 'neutral'}>{p.status}</Badge></td>
                <td className={`p-3 ${p.totalInventory ? '' : 'text-crimson'}`}>{p.totalInventory} in stock · {p.variantCount} variant{p.variantCount === 1 ? '' : 's'}</td>
                <td className="p-3">{p.productType}</td>
                <td className="p-3">{p.vendor}</td>
                <td className="p-3 whitespace-nowrap">{money(p.price)}{p.priceMax > p.price ? ` – ${money(p.priceMax)}` : ''}</td>
                <td className="p-3 text-muted">{timeAgo(p.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-6 text-center text-muted">No products.</p>}
      </div>
    </div>
  );
}

const cartesian = (lists: string[][]) => lists.reduce<string[][]>((acc, values) => acc.flatMap((c) => values.map((v) => [...c, v])), [[]]);

export function ProductEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Draft | null>(isNew ? EMPTY : null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ collections: Collection[] }>('/collections').then((r) => setCollections(r.collections)).catch(() => undefined);
    if (isNew) return;
    api<{ product: ProductDetail }>(`/admin/products/${id}`)
      .then(({ product: p }) =>
        setDraft({
          title: p.title, handle: p.handle, description: p.description, vendor: p.vendor, productType: p.productType, category: p.category,
          tags: p.tags, status: p.status, collections: p.collections.map((c) => c.id), images: p.images.map((i) => i.url), options: p.options,
          variants: p.variants.map((v) => ({ id: v.id, title: v.title, options: v.options, sku: v.sku || '', price: v.price, compareAtPrice: v.compareAtPrice, inventoryQuantity: v.inventoryQuantity, inventoryPolicy: v.inventoryPolicy, weight: v.weight, weightUnit: v.weightUnit })),
          specs: Object.entries(p.specs).map(([key, value]) => ({ key, value })),
          seo: p.seo || {},
        })
      )
      .catch((e) => setError(e.message));
  }, [id, isNew]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));
  const outOfSync = !!draft && cartesian(draft.options.filter((o) => o.values.length).map((o) => o.values)).length !== draft.variants.length;

  // Rebuild the variant table from options, keeping data for combinations that still exist.
  const generateVariants = () => {
    if (!draft) return;
    const opts = draft.options.filter((o) => o.name && o.values.length);
    const base = draft.variants[0];
    const rows = cartesian(opts.map((o) => o.values)).map((values) => {
      const options = Object.fromEntries(values.map((v, i) => [opts[i].name, v]));
      const title = values.length ? values.join(' / ') : 'Default Title';
      const existing = draft.variants.find((v) => v.title === title);
      return existing || { ...base, id: undefined, title, options, sku: base.sku ? `${base.sku.split('-').slice(0, 2).join('-')}-${values.join('-').toUpperCase().replace(/\s+/g, '')}` : '' };
    });
    set('variants', rows);
  };

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const body = { ...draft, images: draft.images.filter(Boolean), specs: Object.fromEntries(draft.specs.filter((s) => s.key).map((s) => [s.key, s.value])), metafields: undefined };
      if (isNew) {
        const r = await api<{ product: ProductDetail }>('/admin/products', { method: 'POST', body });
        navigate(`/admin/products/${r.product.id}`, { replace: true });
      } else {
        await api(`/admin/products/${id}`, { method: 'PUT', body });
        setNotice('Saved. The storefront and AI tools see the change immediately.');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!draft) return <ErrorNote error={error} />;
  const updateVariant = (i: number, patch: Partial<VariantRow>) => set('variants', draft.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)));

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/admin/products" className="text-sm font-semibold text-muted hover:text-ink">Products /</Link>
        <h1 className="flex-1 font-display text-3xl font-bold">{draft.title || 'New product'}</h1>
        {!isNew && <a href={`/p/${draft.handle}`} target="_blank" rel="noreferrer" className={btn.secondary}>View in store</a>}
        <button className={btn.primary} onClick={save} disabled={busy}><Save size={15} /> {busy ? 'Saving…' : 'Save'}</button>
      </div>
      {notice && <p className="text-sm font-semibold text-green">{notice}</p>}
      <ErrorNote error={error} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <Section title="Basics">
            <Field label="Title"><input className="input" value={draft.title} onChange={(e) => set('title', e.target.value)} /></Field>
            <Field label="Description"><textarea className="input min-h-[120px]" value={draft.description} onChange={(e) => set('description', e.target.value)} /></Field>
          </Section>

          <Section title="Media" description="Image URLs. The first one is the main image.">
            {draft.images.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <ProductImage src={url} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-line" />
                <input className="input font-mono text-xs" value={url} onChange={(e) => set('images', draft.images.map((x, j) => (j === i ? e.target.value : x)))} />
                <button className={btn.subtle} onClick={() => set('images', draft.images.filter((_, j) => j !== i))} aria-label="Remove image"><Trash2 size={14} /></button>
              </div>
            ))}
            <button className="inline-flex items-center gap-1 text-sm font-semibold text-blue" onClick={() => set('images', [...draft.images, ''])}><Plus size={14} /> Add image URL</button>
          </Section>

          <Section title="Options" description="Up to 3, like Color, Size, Material. Each combination becomes a variant.">
            {draft.options.map((opt, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[160px_1fr_auto]">
                <input className="input" placeholder="Option name" value={opt.name} onChange={(e) => set('options', draft.options.map((o, j) => (j === i ? { ...o, name: e.target.value } : o)))} />
                <ChipsInput values={opt.values} onChange={(values) => set('options', draft.options.map((o, j) => (j === i ? { ...o, values } : o)))} placeholder="Add value, Enter" />
                <button className={btn.subtle} onClick={() => set('options', draft.options.filter((_, j) => j !== i))} aria-label="Remove option"><Trash2 size={14} /></button>
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              {draft.options.length < 3 && <button className="inline-flex items-center gap-1 text-sm font-semibold text-blue" onClick={() => set('options', [...draft.options, { name: '', values: [] }])}><Plus size={14} /> Add option</button>}
              <button className={`${btn.secondary} ${outOfSync ? 'border-orange' : ''}`} onClick={generateVariants}><Wand2 size={14} /> {outOfSync ? 'Options changed — regenerate variants' : 'Regenerate variants'}</button>
            </div>
          </Section>

          <Section title={`Variants (${draft.variants.length})`} description="Price, stock, SKU and shipping weight per combination.">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr><th className="py-1 pr-2">Variant</th><th className="pr-2">Price ₹</th><th className="pr-2">Compare at</th><th className="pr-2">Stock</th><th className="pr-2">SKU</th><th className="pr-2">Weight</th><th>Oversell</th></tr>
                </thead>
                <tbody>
                  {draft.variants.map((v, i) => (
                    <tr key={v.title + i} className="border-t border-line">
                      <td className="py-1.5 pr-2 font-semibold">{v.title}</td>
                      <td className="pr-2"><input className="input w-24 py-1" type="number" min={0} value={v.price} onChange={(e) => updateVariant(i, { price: Number(e.target.value) })} aria-label={`${v.title} price`} /></td>
                      <td className="pr-2"><input className="input w-24 py-1" type="number" min={0} value={v.compareAtPrice ?? ''} onChange={(e) => updateVariant(i, { compareAtPrice: e.target.value ? Number(e.target.value) : null })} aria-label={`${v.title} compare-at price`} /></td>
                      <td className="pr-2"><input className="input w-20 py-1" type="number" value={v.inventoryQuantity} onChange={(e) => updateVariant(i, { inventoryQuantity: Number(e.target.value) })} aria-label={`${v.title} stock`} /></td>
                      <td className="pr-2"><input className="input w-36 py-1 font-mono text-xs" value={v.sku} onChange={(e) => updateVariant(i, { sku: e.target.value })} aria-label={`${v.title} SKU`} /></td>
                      <td className="pr-2">
                        <div className="flex gap-1">
                          <input className="input w-20 py-1" type="number" min={0} step="0.01" value={v.weight} onChange={(e) => updateVariant(i, { weight: Number(e.target.value) })} aria-label={`${v.title} weight`} />
                          <select className="input w-16 py-1" value={v.weightUnit} onChange={(e) => updateVariant(i, { weightUnit: e.target.value })} aria-label={`${v.title} weight unit`}>{['g', 'kg', 'lb', 'oz'].map((u) => <option key={u}>{u}</option>)}</select>
                        </div>
                      </td>
                      <td><input type="checkbox" className="accent-green" checked={v.inventoryPolicy === 'continue'} onChange={(e) => updateVariant(i, { inventoryPolicy: e.target.checked ? 'continue' : 'deny' })} aria-label={`${v.title} allow oversell`} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Specifications" description="Shown on the product page and readable by the AI assistant.">
            {draft.specs.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input className="input w-48" placeholder="e.g. Material" value={s.key} onChange={(e) => set('specs', draft.specs.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)))} />
                <input className="input flex-1" placeholder="e.g. 100% cotton" value={s.value} onChange={(e) => set('specs', draft.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
                <button className={btn.subtle} onClick={() => set('specs', draft.specs.filter((_, j) => j !== i))} aria-label="Remove spec"><Trash2 size={14} /></button>
              </div>
            ))}
            <button className="inline-flex items-center gap-1 text-sm font-semibold text-blue" onClick={() => set('specs', [...draft.specs, { key: '', value: '' }])}><Plus size={14} /> Add spec</button>
          </Section>

          <Section title="Search engine listing">
            <Field label="Page title"><input className="input" value={draft.seo.title || ''} placeholder={draft.title} onChange={(e) => set('seo', { ...draft.seo, title: e.target.value })} /></Field>
            <Field label="Meta description"><textarea className="input min-h-[60px]" value={draft.seo.description || ''} onChange={(e) => set('seo', { ...draft.seo, description: e.target.value })} /></Field>
            <Field label="URL handle" hint={`/p/${draft.handle || 'generated-from-title'}`}><input className="input font-mono text-sm" value={draft.handle} onChange={(e) => set('handle', e.target.value)} /></Field>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Status">
            <select className="input" value={draft.status} onChange={(e) => set('status', e.target.value)} aria-label="Status">
              <option value="active">Active — visible in store</option><option value="draft">Draft — hidden</option><option value="archived">Archived</option>
            </select>
          </Section>
          <Section title="Organization">
            <Field label="Product type"><input className="input" value={draft.productType} onChange={(e) => set('productType', e.target.value)} placeholder="e.g. Sneakers" /></Field>
            <Field label="Category" hint="Taxonomy path, e.g. Apparel & Accessories > Shoes"><input className="input" value={draft.category} onChange={(e) => set('category', e.target.value)} /></Field>
            <Field label="Vendor"><input className="input" value={draft.vendor} onChange={(e) => set('vendor', e.target.value)} /></Field>
            <Field label="Tags" hint="Used for filters and AI recommendations."><ChipsInput values={draft.tags} onChange={(v) => set('tags', v.map((t) => t.toLowerCase()))} placeholder="Add tag" /></Field>
            <Field label="Collections">
              <div className="space-y-1">
                {collections.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="accent-green" checked={draft.collections.includes(c.id)} onChange={(e) => set('collections', e.target.checked ? [...draft.collections, c.id] : draft.collections.filter((x) => x !== c.id))} />
                    {c.title}
                  </label>
                ))}
              </div>
            </Field>
          </Section>
          {!isNew && (
            <button className={`${btn.danger} w-full justify-center`} onClick={() => window.confirm('Delete this product?') && api(`/admin/products/${id}`, { method: 'DELETE' }).then(() => navigate('/admin/products'))}>
              <Trash2 size={14} /> Delete product
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
