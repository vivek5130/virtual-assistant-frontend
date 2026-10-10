import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Badge, ErrorNote, Field, PageHeader, Section, Toggle, btn } from '../../components/admin/ui';
import { api } from '../../lib/api';
import type { Collection, Link as NavLink, StoreSettings } from '../../lib/types';

// Collections + store settings: everything the storefront renders except the hero.
export default function Storefront() {
  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader title="Storefront" description="Store name, announcement bar, navigation, footer, home page sections and collections. Changes go live on the next page load." />
      <StoreSettingsForm />
      <Collections />
    </div>
  );
}

function LinksEditor({ links, onChange }: { links: NavLink[]; onChange: (l: NavLink[]) => void }) {
  return (
    <div className="space-y-2">
      {links.map((l, i) => (
        <div key={i} className="flex gap-2">
          <input className="input w-48" placeholder="Label" value={l.label} onChange={(e) => onChange(links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
          <input className="input flex-1 font-mono text-sm" placeholder="/collections/new-arrivals" value={l.url} onChange={(e) => onChange(links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
          <button className={btn.subtle} onClick={() => onChange(links.filter((_, j) => j !== i))} aria-label="Remove link"><Trash2 size={14} /></button>
        </div>
      ))}
      <button className="inline-flex items-center gap-1 text-sm font-semibold text-blue" onClick={() => onChange([...links, { label: '', url: '/' }])}><Plus size={14} /> Add link</button>
    </div>
  );
}

function StoreSettingsForm() {
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    api<{ store: StoreSettings }>('/store').then((r) => setStore(r.store)).catch((e) => setError(e.message));
    api<{ collections: Collection[] }>('/collections').then((r) => setCollections(r.collections)).catch(() => undefined);
  }, []);
  if (!store) return <ErrorNote error={error} />;
  const set = <K extends keyof StoreSettings>(k: K, v: StoreSettings[K]) => { setSaved(false); setStore({ ...store, [k]: v }); };
  const save = () => api<{ store: StoreSettings }>('/admin/store', { method: 'PUT', body: store }).then((r) => { setStore(r.store); setSaved(true); }).catch((e) => setError(e.message));

  return (
    <Section title="Store settings" aside={<button className={btn.primary} onClick={save}><Save size={15} /> {saved ? 'Saved' : 'Save'}</button>}>
      <ErrorNote error={error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Store name"><input className="input" value={store.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="Support email"><input className="input" value={store.supportEmail} onChange={(e) => set('supportEmail', e.target.value)} /></Field>
      </div>
      <Field label="Tagline"><input className="input" value={store.tagline} onChange={(e) => set('tagline', e.target.value)} /></Field>
      <Field label="Announcement bar" hint="Empty hides the bar."><input className="input" value={store.announcement} onChange={(e) => set('announcement', e.target.value)} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Free shipping over (₹)"><input className="input" type="number" value={store.freeShippingOver} onChange={(e) => set('freeShippingOver', Number(e.target.value))} /></Field>
        <Field label="Flat shipping fee (₹)"><input className="input" type="number" value={store.shippingFee} onChange={(e) => set('shippingFee', Number(e.target.value))} /></Field>
      </div>
      <Field label="Main navigation"><LinksEditor links={store.navigation} onChange={(v) => set('navigation', v)} /></Field>
      <Field label="Home page sections" hint="Rendered after the hero, in order.">
        <div className="space-y-2">
          {store.homeSections.map((s, i) => {
            const update = (patch: Partial<typeof s>) => set('homeSections', store.homeSections.map((x, j) => (j === i ? { ...x, ...patch } : x)));
            return (
              <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-line p-2">
                <select className="input w-36" value={s.type} onChange={(e) => update({ type: e.target.value as typeof s.type })} aria-label="Section type">
                  <option value="categories">Categories</option><option value="collection">Collection</option>
                </select>
                <input className="input w-48" placeholder="Heading" value={s.title || ''} onChange={(e) => update({ title: e.target.value })} />
                {s.type === 'collection' && (
                  <select className="input w-48" value={s.collectionHandle || ''} onChange={(e) => update({ collectionHandle: e.target.value })} aria-label="Collection">
                    {collections.map((c) => <option key={c.handle} value={c.handle}>{c.title}</option>)}
                  </select>
                )}
                <input className="input w-20" type="number" min={1} max={24} value={s.limit || 8} onChange={(e) => update({ limit: Number(e.target.value) })} aria-label="Items" />
                {s.type === 'collection' && (
                  <select className="input w-32" value={s.tone || 'plain'} onChange={(e) => update({ tone: e.target.value })} aria-label="Style"><option value="plain">Plain</option><option value="crimson">Crimson band</option></select>
                )}
                <button className={btn.subtle} onClick={() => set('homeSections', store.homeSections.filter((_, j) => j !== i))} aria-label="Remove section"><Trash2 size={14} /></button>
              </div>
            );
          })}
          <button className="inline-flex items-center gap-1 text-sm font-semibold text-blue" onClick={() => set('homeSections', [...store.homeSections, { type: 'collection', collectionHandle: collections[0]?.handle, limit: 4 }])}><Plus size={14} /> Add section</button>
        </div>
      </Field>
      {store.footer.map((col, i) => (
        <Field key={i} label={`Footer column: ${col.title}`}>
          <LinksEditor links={col.links} onChange={(links) => set('footer', store.footer.map((c, j) => (j === i ? { ...c, links } : c)))} />
        </Field>
      ))}
    </Section>
  );
}

function Collections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [form, setForm] = useState({ title: '', description: '', image: '' });
  const [error, setError] = useState<string | null>(null);
  const load = () => api<{ collections: Collection[] }>('/collections').then((r) => setCollections(r.collections)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  const update = (c: Collection, patch: Partial<Collection>) => api(`/admin/collections/${c.id}`, { method: 'PUT', body: patch }).then(load).catch((e) => setError(e.message));

  return (
    <Section title="Collections" description="Group products for navigation, home sections and AI recommendations. Assign products from each product's page.">
      <ErrorNote error={error} />
      <ul className="divide-y divide-line">
        {collections.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-3 py-3">
            {c.image && <img src={c.image} alt="" className="h-10 w-10 rounded-lg object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{c.title} <span className="font-mono text-xs text-muted">/collections/{c.handle}</span></p>
              <p className="truncate text-xs text-muted">{c.description}</p>
            </div>
            <Badge>{c.productCount ?? 0} products</Badge>
            <select className="input w-36 py-1 text-sm" value={c.sortOrder} onChange={(e) => update(c, { sortOrder: e.target.value })} aria-label="Sort order">
              <option value="best">Best selling</option><option value="newest">Newest</option><option value="price_asc">Price ↑</option><option value="price_desc">Price ↓</option><option value="rating">Rating</option>
            </select>
            <Toggle checked={c.featured} onChange={(v) => update(c, { featured: v })} label="Featured" />
            <button className={btn.subtle} onClick={() => window.confirm(`Delete ${c.title}?`) && api(`/admin/collections/${c.id}`, { method: 'DELETE' }).then(load)} aria-label="Delete collection"><Trash2 size={14} /></button>
          </li>
        ))}
      </ul>
      <form
        className="grid gap-2 rounded-xl border border-dashed border-line p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          api('/admin/collections', { method: 'POST', body: form }).then(() => { setForm({ title: '', description: '', image: '' }); load(); }).catch((err) => setError(err.message));
        }}
      >
        <input className="input" required placeholder="New collection title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="input" placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <button className={btn.primary}><Plus size={15} /> Create</button>
      </form>
    </Section>
  );
}
