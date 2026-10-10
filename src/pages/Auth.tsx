import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bot, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleButton from '../components/shop/GoogleButton';

type Role = 'shopper' | 'admin';

// Dev-only quick fill for the seeded accounts (see backend scripts/seed.js).
const DEV_ACCOUNTS: Record<Role, { identifier: string; password: string }> = {
  shopper: { identifier: 'demo', password: 'demo12345' },
  admin: { identifier: 'vivek', password: 'vivek5926' },
};

export default function Auth({ mode }: { mode: 'login' | 'register' }) {
  const { login, register, logout, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState<Role>((location.state as { role?: Role } | null)?.role || 'shopper');
  const [form, setForm] = useState({ name: '', identifier: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const next = (location.state as { from?: string } | null)?.from;
  const isAdmin = mode === 'login' && role === 'admin';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = mode === 'login' ? await login(form.identifier, form.password) : await register(form.name, form.identifier, form.password);
      if (isAdmin && user.role !== 'admin') {
        logout();
        throw new Error('That account is not a store admin.');
      }
      navigate(next || (user.role === 'admin' && isAdmin ? '/admin' : '/'));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async (credential: string) => {
    setBusy(true);
    setError('');
    try {
      const user = await loginWithGoogle(credential);
      if (isAdmin && user.role !== 'admin') {
        logout();
        throw new Error('That Google account is not linked to a store admin.');
      }
      navigate(next || (user.role === 'admin' && isAdmin ? '/admin' : '/'));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
      <div className="hidden md:block">
        <p className="font-display text-6xl font-semibold leading-[0.95]">
          {isAdmin ? <>Back of <span className="text-blue">house.</span></> : mode === 'login' ? <>Welcome <span className="text-green">back.</span></> : <>Pull up <span className="text-orange">a stool.</span></>}
        </p>
        <p className="mt-4 text-lg text-muted">
          {isAdmin
            ? 'Configure agents, test them in the playground, manage products and knowledge. Admins also see how Mela answers right in the storefront chat.'
            : 'Your bag follows you in — anything you added as a guest comes along.'}
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-blob border-2 border-ink bg-paper p-8 shadow-sticker-lg">
        {mode === 'login' && (
          <div className="grid grid-cols-2 gap-1 rounded-full border-2 border-ink p-1" role="tablist" aria-label="Sign in as">
            {([['shopper', 'Shopper', ShoppingBag], ['admin', 'Store admin', Bot]] as const).map(([id, label, Icon]) => (
              <button key={id} type="button" role="tab" aria-selected={role === id} onClick={() => { setRole(id); setError(''); }} className={`flex items-center justify-center gap-2 rounded-full py-2 text-sm font-bold ${role === id ? (id === 'admin' ? 'bg-blue text-paper' : 'bg-green text-paper') : 'text-muted'}`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        )}
        <h1 className="text-3xl font-bold">{mode === 'register' ? 'Create account' : isAdmin ? 'Admin sign in' : 'Sign in'}</h1>
        <GoogleButton onCredential={onGoogle} text={mode === 'register' ? 'signup_with' : 'continue_with'} />
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted" aria-hidden>
          <span className="h-px flex-1 bg-line" /> or with {mode === 'register' ? 'email' : 'username / email'} <span className="h-px flex-1 bg-line" />
        </div>
        {mode === 'register' && (
          <div><label className="label" htmlFor="name">Name</label><input id="name" className="input" required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        )}
        <div>
          <label className="label" htmlFor="identifier">{mode === 'register' ? 'Email' : 'Email or username'}</label>
          <input id="identifier" className="input" type={mode === 'register' ? 'email' : 'text'} required autoComplete="username" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" className="input" type="password" required minLength={mode === 'register' ? 8 : undefined} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {mode === 'register' && <p className="hint">At least 8 characters.</p>}
        </div>
        {error && <p className="rounded-xl bg-crimson-soft px-3 py-2 text-sm text-crimson">{error}</p>}
        <button className={`${isAdmin ? 'btn bg-blue text-paper hover:bg-ink' : 'btn-primary'} w-full`} disabled={busy}>{busy ? 'One sec…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
        {import.meta.env.DEV && mode === 'login' && (
          <button type="button" className="w-full rounded-xl border border-dashed border-line px-3 py-2 text-xs text-muted hover:border-ink" onClick={() => setForm({ ...form, ...DEV_ACCOUNTS[role] })}>
            Dev: fill seeded {role} login ({DEV_ACCOUNTS[role].identifier})
          </button>
        )}
        {!isAdmin && (
          <p className="text-center text-sm text-muted">
            {mode === 'login' ? <>New here? <Link to="/register" className="font-semibold text-blue">Create an account</Link></> : <>Have an account? <Link to="/login" className="font-semibold text-blue">Sign in</Link></>}
          </p>
        )}
      </form>
    </div>
  );
}
