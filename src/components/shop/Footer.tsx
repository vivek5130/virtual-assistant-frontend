import { Link } from 'react-router-dom';
import { Logo } from './Header';
import { useStore } from '../../context/StoreContext';

export default function Footer() {
  const store = useStore();
  return (
    <footer className="mt-24 border-t-2 border-ink bg-green-deep text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="inline-block rounded-2xl bg-cream p-2"><Logo small /></div>
          {store?.tagline && <p className="mt-4 max-w-sm font-display text-2xl font-bold leading-snug">{store.tagline}</p>}
          {store?.supportEmail && <p className="mt-3 text-sm text-cream/70">{store.supportEmail}</p>}
        </div>
        {store?.footer.map((col) => (
          <div key={col.title} className="space-y-2 text-sm">
            <p className="eyebrow !text-cream/60">{col.title}</p>
            {col.links.map((l) => <Link key={l.url} to={l.url} className="block hover:text-yellow">{l.label}</Link>)}
          </div>
        ))}
      </div>
    </footer>
  );
}
