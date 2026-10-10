import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import ProductCard from '../components/shop/ProductCard';
import ProductImage from '../components/shop/ProductImage';
import { api } from '../lib/api';
import { ACCENTS, money } from '../lib/format';
import { useStore } from '../context/StoreContext';
import type { Collection, Facets, Product, SearchResult, StoreSettings } from '../lib/types';

const BADGE_ICONS = { truck: Truck, shield: ShieldCheck, sparkles: Sparkles } as const;

export default function Home() {
  const store = useStore();
  return (
    <div>
      <Hero />
      {store && store.trustBadges.length > 0 && (
        <div className="border-b-2 border-ink bg-paper">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-10 gap-y-2 px-4 py-3 text-sm font-semibold">
            {store.trustBadges.map((b) => {
              const Icon = BADGE_ICONS[b.icon as keyof typeof BADGE_ICONS] || Sparkles;
              return <span key={b.text} className="flex items-center gap-2"><Icon size={16} className="text-green" /> {b.text}</span>;
            })}
          </div>
        </div>
      )}
      {store?.homeSections.map((section, i) => <HomeSection key={i} section={section} />)}
    </div>
  );
}

// The hero is the one deliberately static, hand-designed block.
function Hero() {
  const [picks, setPicks] = useState<Product[]>([]);
  useEffect(() => {
    api<SearchResult>('/products?sort=rating&limit=3').then((r) => setPicks(r.products)).catch(() => undefined);
  }, []);

  return (
    <section className="relative overflow-hidden border-b-2 border-ink">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.15fr_1fr] lg:py-20">
        <div>
          <p className="eyebrow mb-4">Est. 2025 · Curated in India</p>
          <h1 className="text-[3.2rem] font-semibold leading-[0.95] sm:text-7xl lg:text-[5.5rem]">
            Good things,
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">haggled</span>
              <span className="absolute inset-x-0 bottom-1 -z-0 h-5 -rotate-1 bg-yellow sm:h-7" aria-hidden />
            </span>{' '}
            <span className="text-green">for you.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted">
            Things we'd actually buy, plus <strong className="text-ink">Mela</strong> — an AI concierge who knows the whole catalog, your bag, and our fine print.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="btn-action text-lg">Browse the bazaar <ArrowRight size={18} /></Link>
            <span className="btn-ghost cursor-default"><MessageCircle size={18} className="text-green" /> Or ask Mela, bottom right</span>
          </div>
        </div>
        <div className="relative mx-auto h-[380px] w-full max-w-md sm:h-[440px]">
          {picks.map((p, i) => (
            <Link
              key={p.id}
              to={`/p/${p.handle}`}
              className={`absolute w-[58%] overflow-hidden rounded-blob border-2 border-ink bg-paper shadow-sticker-lg ${['left-0 top-6 -rotate-6', 'right-0 top-0 rotate-3', 'left-[22%] bottom-0 -rotate-2'][i]}`}
            >
              <ProductImage src={p.image} alt={p.title} className="aspect-square w-full" />
              <div className="flex items-center justify-between border-t-2 border-ink px-3 py-2">
                <span className="truncate text-sm font-semibold">{p.title}</span>
                <span className={`ml-2 shrink-0 rounded-full border-2 border-ink px-2 text-sm font-bold ${ACCENTS[i]}`}>{money(p.price)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeSection({ section }: { section: StoreSettings['homeSections'][number] }) {
  if (section.type === 'categories') return <CategoryTiles title={section.title} limit={section.limit} />;
  if (section.type === 'collection' && section.collectionHandle) return <CollectionRow section={section} />;
  return null;
}

// Soft tinted tiles; the first one is the "feature" tile of the bento grid.
const TILE_STYLES = [
  { bg: 'bg-yellow-soft', blob: 'bg-yellow' },
  { bg: 'bg-blue-soft', blob: 'bg-blue' },
  { bg: 'bg-orange-soft', blob: 'bg-orange' },
  { bg: 'bg-green-soft', blob: 'bg-green' },
  { bg: 'bg-crimson-soft', blob: 'bg-crimson' },
  { bg: 'bg-paper', blob: 'bg-yellow' },
];

function SectionHeading({ eyebrow, title, subtitle, link }: { eyebrow: string; title: string; subtitle?: string; link?: { to: string; label: string; light?: boolean } }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className={`eyebrow mb-2 ${link?.light ? '!text-paper/70' : ''}`}>{eyebrow}</p>
        <h2 className="text-4xl font-semibold leading-none sm:text-5xl">{title}</h2>
        {subtitle && <p className={`mt-3 max-w-xl ${link?.light ? 'text-paper/80' : 'text-muted'}`}>{subtitle}</p>}
      </div>
      {link && (
        <Link to={link.to} className={`group inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold ${link.light ? 'border-paper text-paper hover:bg-paper hover:text-crimson' : 'border-ink hover:bg-ink hover:text-paper'}`}>
          {link.label} <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}

function CategoryTiles({ title, limit = 8 }: { title?: string; limit?: number }) {
  const [facets, setFacets] = useState<Facets | null>(null);
  useEffect(() => {
    api<Facets>('/products/facets').then(setFacets).catch(() => undefined);
  }, []);
  if (!facets) return null;
  const total = facets.productTypes.reduce((n, c) => n + c.count, 0);
  // Group by the second taxonomy level so tiles stay broad (Shoes, Audio…).
  const groups = new Map<string, { name: string; count: number; minPrice: number; images: string[] }>();
  for (const c of facets.categories) {
    const segs = c.path.split('>').map((s) => s.trim());
    const name = segs[Math.min(1, segs.length - 1)];
    const g = groups.get(name) || { name, count: 0, minPrice: Infinity, images: [] };
    g.count += c.count;
    g.minPrice = Math.min(g.minPrice, c.minPrice);
    if (c.image && g.images.length < 3) g.images.push(c.image);
    groups.set(name, g);
  }
  // Bento rows are 4 cells wide and the feature tile takes 4 cells, so show
  // 1 + 4k tiles to always end on a full row.
  const sorted = [...groups.values()].sort((a, b) => b.count - a.count);
  const wanted = 1 + 4 * Math.ceil(Math.max(limit - 1, 4) / 4);
  const tiles = sorted.slice(0, Math.max(1, 1 + 4 * Math.floor((Math.min(wanted, sorted.length) - 1) / 4)));

  return (
    <section className="mx-auto max-w-7xl px-4 pt-20">
      <SectionHeading eyebrow={`${tiles.length} aisles · ${total} things`} title={title || 'Shop by category'} subtitle="From trail shoes to slow-morning mugs — pick an aisle, or let Mela walk you through it." link={{ to: '/shop', label: 'Shop everything' }} />
      <div className="grid auto-rows-[180px] grid-cols-2 gap-4 md:grid-cols-4">
        {tiles.map((c, i) => {
          const style = TILE_STYLES[i % TILE_STYLES.length];
          const feature = i === 0;
          return (
            <Link
              key={c.name}
              to={`/shop?category=${encodeURIComponent(c.name)}`}
              className={`lift group relative flex flex-col overflow-hidden rounded-[28px] border-2 border-ink p-5 ${style.bg} ${feature ? 'col-span-2 row-span-2 p-7' : ''}`}
            >
              <span className={`absolute rounded-full ${style.blob} opacity-90 ${feature ? '-bottom-16 -right-12 h-72 w-72' : '-bottom-10 -right-8 h-32 w-32'}`} aria-hidden />
              {c.images[0] && (
                <img
                  src={c.images[0].replace('w=900', feature ? 'w=700' : 'w=360')}
                  alt=""
                  loading="lazy"
                  className={`sticker absolute rounded-[22px] border-2 border-ink object-cover shadow-sticker ${feature ? 'bottom-7 right-7 h-56 w-56 rotate-3' : 'bottom-4 right-4 h-20 w-20 rotate-6'}`}
                />
              )}
              {feature && c.images[1] && (
                <img src={c.images[1].replace('w=900', 'w=360')} alt="" loading="lazy" className="absolute bottom-24 right-56 hidden h-28 w-28 -rotate-6 rounded-[18px] border-2 border-ink object-cover shadow-sticker md:block" />
              )}
              <span className={`relative font-display font-semibold leading-[1.05] ${feature ? 'max-w-[60%] text-4xl sm:text-5xl' : 'max-w-[70%] text-xl sm:text-2xl'}`}>{c.name}</span>
              <span className="relative mt-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-ink/20 bg-paper/80 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                {c.count} {c.count === 1 ? 'item' : 'items'} · from {money(c.minPrice)}
              </span>
              {feature && <span className="relative mt-3 inline-flex items-center gap-1 text-sm font-semibold">Explore the aisle <ArrowRight size={14} /></span>}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function CollectionRow({ section }: { section: StoreSettings['homeSections'][number] }) {
  const [data, setData] = useState<(SearchResult & { collection: Collection }) | null>(null);
  useEffect(() => {
    api<SearchResult & { collection: Collection }>(`/collections/${section.collectionHandle}?limit=${section.limit || 8}`).then(setData).catch(() => undefined);
  }, [section.collectionHandle, section.limit]);
  if (!data || !data.products.length) return null;
  // Keep rows full on the 4-column grid.
  const products = data.products.length >= 4 ? data.products.slice(0, data.products.length - (data.products.length % 4)) : data.products;
  const loud = section.tone === 'crimson';
  const heading = (
    <SectionHeading
      eyebrow={`Collection · ${data.total} products`}
      title={section.title || data.collection.title}
      subtitle={data.collection.description}
      link={{ to: `/collections/${data.collection.handle}`, label: 'See all', light: loud }}
    />
  );
  const grid = (
    <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ${loud ? 'text-ink' : ''}`}>
      {products.map((p, i) => <ProductCard key={p.id} product={p} tone={loud ? 'bg-yellow' : ['bg-yellow', 'bg-orange', 'bg-paper'][i % 3]} />)}
    </div>
  );
  return loud ? (
    <section className="mx-auto mt-20 max-w-7xl px-4">
      <div className="rounded-[36px] border-2 border-ink bg-crimson p-6 text-paper shadow-sticker-lg sm:p-10">{heading}{grid}</div>
    </section>
  ) : (
    <section className="mx-auto max-w-7xl px-4 pt-20">{heading}{grid}</section>
  );
}
