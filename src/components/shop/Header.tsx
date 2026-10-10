import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, LogOut, Menu, Search, ShoppingBag, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

export function Logo({ small = false }: { small?: boolean }) {
  const store = useStore();
  const name = store?.name || 'ShopSmart';
  // Two-tone wordmark: first half ink, second half crimson ("Shop" + "Smart").
  const capital = name.slice(1).search(/[A-Z]/);
  const split = capital >= 0 ? capital + 1 : Math.ceil(name.length / 2);
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="ShopSmart home">
      <span className={`grid place-items-center rounded-xl border-2 border-ink bg-green font-display font-semibold text-yellow shadow-sticker ${small ? 'h-8 w-8 text-lg' : 'h-10 w-10 text-2xl'}`}>{name[0]}</span>
      <span className={`font-display font-semibold leading-none ${small ? 'text-xl' : 'text-2xl'}`}>
        {name.slice(0, split)}<span className="text-crimson">{name.slice(split)}</span>
      </span>
    </Link>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const { cart, bump } = useCart();
  const store = useStore();
  const links = store?.navigation || [];
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [menu, setMenu] = useState(false);
  const nav = ({ isActive }: { isActive: boolean }) => `font-semibold hover:text-green ${isActive ? 'text-green underline decoration-4 decoration-yellow underline-offset-4' : ''}`;

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-cream/95 backdrop-blur">
      {store?.announcement && <div className="bg-ink px-4 py-1.5 text-center text-xs font-semibold text-yellow">{store.announcement}</div>}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Logo />
        <nav className="ml-6 hidden items-center gap-5 lg:flex">
          {links.map((l) => <NavLink key={l.url} to={l.url} className={nav}>{l.label}</NavLink>)}
        </nav>
        <form
          className="ml-auto hidden max-w-sm flex-1 items-center rounded-full border-2 border-ink bg-paper px-3 sm:flex"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/shop?q=${encodeURIComponent(q)}`);
          }}
        >
          <Search size={16} className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the bazaar…" className="w-full bg-transparent px-2 py-2 text-sm focus:outline-none" aria-label="Search products" />
        </form>
        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          {user ? (
            <>
              <Link to="/wishlist" className="rounded-full p-2 hover:bg-yellow-soft" aria-label="Wishlist"><Heart size={20} /></Link>
              <Link to="/orders" className="hidden rounded-full p-2 hover:bg-yellow-soft sm:block" aria-label="My orders">
                {user.avatarUrl ? <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-6 w-6 rounded-full border border-ink" /> : <UserIcon size={20} />}
              </Link>
              {user.role === 'admin' && <Link to="/admin" className="hidden rounded-full border-2 border-ink bg-blue px-3 py-1 text-xs font-bold text-paper sm:block">Admin</Link>}
              <button onClick={logout} className="hidden rounded-full p-2 hover:bg-yellow-soft sm:block" aria-label="Sign out"><LogOut size={18} /></button>
            </>
          ) : (
            <Link to="/login" className="hidden px-2 text-sm font-semibold hover:text-green sm:block">Sign in</Link>
          )}
          <Link to="/cart" className="relative rounded-full p-2 hover:bg-yellow-soft" aria-label={`Bag, ${cart?.count || 0} items`}>
            <ShoppingBag size={22} />
            {!!cart?.count && (
              <span key={bump} className="animate-pop absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-ink bg-orange px-1 text-[10px] font-bold">
                {cart.count}
              </span>
            )}
          </Link>
          <button className="rounded-full p-2 lg:hidden" onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X /> : <Menu />}</button>
        </div>
      </div>
      {menu && (
        <nav className="flex flex-col gap-3 border-t-2 border-ink px-4 py-4 lg:hidden" onClick={() => setMenu(false)}>
          {links.map((l) => <Link key={l.url} to={l.url} className="font-semibold">{l.label}</Link>)}
          {user ? <Link to="/orders" className="font-semibold">My orders</Link> : <Link to="/login" className="font-semibold">Sign in</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="font-semibold text-blue">Admin console</Link>}
          {user && <button onClick={logout} className="text-left font-semibold text-crimson">Sign out</button>}
        </nav>
      )}
    </header>
  );
}
