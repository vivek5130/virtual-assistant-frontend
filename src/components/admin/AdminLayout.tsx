import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Bot, LayoutTemplate, Package, ShoppingBag, Store } from 'lucide-react';
import { Logo } from '../shop/Header';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin/products', label: 'Products', icon: ShoppingBag },
  { to: '/admin/storefront', label: 'Storefront & collections', icon: LayoutTemplate },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/assistant', label: 'AI assistant', icon: Bot },
];

export default function AdminLayout() {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (user.role !== 'admin') return <p className="p-10 text-center">This area is for store admins.</p>;

  return (
    <div className="min-h-screen bg-[#FBF8F1] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-paper px-4 py-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between lg:block">
          <Logo small />
          <p className="eyebrow mt-1 hidden lg:block">Admin console</p>
        </div>
        <nav className="mt-4 flex gap-1 overflow-x-auto lg:mt-8 lg:flex-col">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${isActive ? 'bg-green-soft text-green-deep' : 'text-muted hover:bg-cream hover:text-ink'}`
              }
            >
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="mt-8 hidden items-center gap-2 px-3 text-sm font-semibold text-blue hover:underline lg:flex">
          <Store size={16} /> View storefront
        </Link>
      </aside>
      <main className="min-w-0 px-4 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
