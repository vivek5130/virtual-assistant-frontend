import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { unicorn } from '../components/shop/AssistantEmbed';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard, { swatch } from '../components/shop/ProductCard';
import { api, qs } from '../lib/api';
import type { Collection, Facets, SearchResult } from '../lib/types';

const SORTS = [
  ['', 'Best selling'],
  ['price_asc', 'Price: low to high'],
  ['price_desc', 'Price: high to low'],
  ['rating', 'Top rated'],
  ['newest', 'Newest'],
];
const LABELS: Record<string, string> = { q: 'search', productType: 'type', vendor: 'brand', minPrice: 'min ₹', maxPrice: 'max ₹', minRating: 'rating', inStock: 'in stock' };

// URL is the single source of truth for filters, so every view is shareable.
// Also serves /collections/:handle.
export default function Shop() {
  const { handle } = useParams();
  const [params, setParams] = useSearchParams();
  const [facets, setFacets] = useState<Facets | null>(null);
  const [result, setResult] = useState<(SearchResult & { collection?: Collection }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api<Facets>('/products/facets').then(setFacets).catch(() => undefined);
  }, []);

  // Browsing signals for the assistant's personalisation.
  const query = params.get('q');
  useEffect(() => {
    if (query) unicorn('track', 'search', { query });
  }, [query]);
  useEffect(() => {
    if (handle) unicorn('setPage', { collection: handle });
  }, [handle]);

  useEffect(() => {
    setLoading(true);
    const path = handle ? `/collections/${handle}` : '/products';
    api<SearchResult & { collection?: Collection }>(`${path}${qs({ ...Object.fromEntries(params), limit: 24 })}`)
      .then(setResult)
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [params, handle]);

  const set = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  };
  const toggleIn = (key: string, value: string) => {
    const values = new Set((params.get(key) || '').split(',').filter(Boolean));
    if (values.has(value)) values.delete(value);
    else values.add(value);
    set(key, [...values].join(','));
  };
  const has = (key: string, value: string) => (params.get(key) || '').split(',').includes(value);
  const active = [...params.entries()].filter(([k]) => k !== 'sort' && k !== 'page');
  const optionKey = (name: string) => (/^colou?r$/i.test(name) ? 'color' : /^size$/i.test(name) ? 'size' : `option.${name}`);

  const filters = facets && (
    <div className="space-y-7">
      {!handle && (
        <FilterGroup title="Collections">
          {facets.collections.filter((c) => c.productCount).map((c) => (
            <Pill key={c.handle} active={params.get('collection') === c.handle} onClick={() => set('collection', params.get('collection') === c.handle ? undefined : c.handle)}>{c.title}</Pill>
          ))}
        </FilterGroup>
      )}
      <FilterGroup title="Product type">
        {facets.productTypes.map((t) => (
          <Pill key={t.name} active={params.get('productType') === t.name} onClick={() => set('productType', params.get('productType') === t.name ? undefined : t.name)}>
            {t.name} <span className="opacity-60">{t.count}</span>
          </Pill>
        ))}
      </FilterGroup>
      <FilterGroup title="Price (₹)">
        <div className="flex w-full items-center gap-2">
          <input key={'min' + (params.get('minPrice') || '')} className="input" type="number" min={0} placeholder={String(facets.price.min)} defaultValue={params.get('minPrice') || ''} onBlur={(e) => set('minPrice', e.target.value)} aria-label="Minimum price" />
          <span>–</span>
          <input key={'max' + (params.get('maxPrice') || '')} className="input" type="number" min={0} placeholder={String(facets.price.max)} defaultValue={params.get('maxPrice') || ''} onBlur={(e) => set('maxPrice', e.target.value)} aria-label="Maximum price" />
        </div>
      </FilterGroup>
      {Object.entries(facets.options).filter(([, values]) => values.length > 1).map(([name, values]) => {
        const key = optionKey(name);
        const isColor = key === 'color';
        return (
          <FilterGroup key={name} title={name}>
            {values.slice(0, 16).map((o) => (
              <Pill key={o.value} active={has(key, o.value)} onClick={() => toggleIn(key, o.value)}>
                {isColor && <span className="mr-1 inline-block h-3 w-3 rounded-full border border-ink/40 align-[-1px]" style={{ background: swatch(o.value) }} />}
                {o.value}
              </Pill>
            ))}
          </FilterGroup>
        );
      })}
      <FilterGroup title="Brand">
        {facets.vendors.map((b) => (
          <Pill key={b.name} active={params.get('vendor') === b.name} onClick={() => set('vendor', params.get('vendor') === b.name ? undefined : b.name)}>{b.name}</Pill>
        ))}
      </FilterGroup>
      <FilterGroup title="Rating & stock">
        {['4.5', '4'].map((r) => (
          <Pill key={r} active={params.get('minRating') === r} onClick={() => set('minRating', params.get('minRating') === r ? undefined : r)}>★ {r}+</Pill>
        ))}
        <Pill active={params.get('inStock') === 'true'} onClick={() => set('inStock', params.get('inStock') ? undefined : 'true')}>In stock</Pill>
      </FilterGroup>
      <FilterGroup title="Tags">
        {facets.tags.slice(0, 24).map((t) => <Pill key={t.name} active={has('tags', t.name)} onClick={() => toggleIn('tags', t.name)}>#{t.name}</Pill>)}
      </FilterGroup>
    </div>
  );

  const heading = result?.collection?.title || (params.get('q') ? `“${params.get('q')}”` : params.get('category') || params.get('productType') || 'Everything');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{handle ? 'Collection' : 'The bazaar'}</p>
          <h1 className="text-5xl font-semibold">{heading}</h1>
          {result?.collection?.description && <p className="mt-1 max-w-xl text-muted">{result.collection.description}</p>}
          {result && <p className="mt-1 text-muted">{result.total} product{result.total === 1 ? '' : 's'}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost lg:hidden" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={16} /> Filters</button>
          <select className="input w-auto" value={params.get('sort') || ''} onChange={(e) => set('sort', e.target.value)} aria-label="Sort">
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      {active.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {active.map(([k, v]) => (
            <button key={k} onClick={() => set(k)} className="chip border-ink bg-yellow-soft font-semibold">
              {LABELS[k] || k.replace('option.', '')}: {v} <X size={12} />
            </button>
          ))}
          <button onClick={() => setParams({})} className="text-sm font-semibold text-crimson hover:underline">Clear all</button>
        </div>
      )}
      {result?.relaxed?.map((r) => <p key={r.field} className="mb-4 text-sm text-muted">Note: {r.note}.</p>)}

      <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>{filters}</aside>
        <div>
          {loading && !result ? (
            <p className="text-muted">Loading…</p>
          ) : !result || result.products.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="font-display text-2xl font-bold">Nothing on these shelves.</p>
              <p className="mt-2 text-muted">Try fewer filters, or ask Mela to hunt for it.</p>
            </div>
          ) : (
            <div className={`grid gap-6 sm:grid-cols-2 xl:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
              {result.products.map((p, i) => <ProductCard key={p.id} product={p} tone={['bg-yellow', 'bg-orange', 'bg-paper'][i % 3]} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={active} className={`rounded-full border-2 px-3 py-1 text-sm font-semibold ${active ? 'border-ink bg-green text-paper' : 'border-line bg-paper hover:border-ink'}`}>
      {children}
    </button>
  );
}
