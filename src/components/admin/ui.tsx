import { useState, type ReactNode } from 'react';

// Calm admin primitives: thin borders, generous spacing, no stickers.

export function Section({ title, description, children, aside }: { title: string; description?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-paper p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">{title}</h2>
          {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
        </div>
        {aside}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function Field({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; disabled?: boolean }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 ${disabled ? 'opacity-50' : ''}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${checked ? 'bg-green' : 'bg-line'}`}
      >
        <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {description && <span className="block text-xs text-muted">{description}</span>}
      </span>
    </label>
  );
}

export function Badge({ tone = 'neutral', children }: { tone?: 'green' | 'blue' | 'orange' | 'crimson' | 'yellow' | 'neutral'; children: ReactNode }) {
  const tones = {
    green: 'bg-green-soft text-green-deep',
    blue: 'bg-blue-soft text-blue',
    orange: 'bg-orange-soft text-orange',
    crimson: 'bg-crimson-soft text-crimson',
    yellow: 'bg-yellow-soft text-ink',
    neutral: 'bg-cream text-muted',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-line" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold ${value === t.id ? 'border-green text-ink' : 'border-transparent text-muted hover:text-ink'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function ErrorNote({ error }: { error: string | null }) {
  if (!error) return null;
  return <p className="rounded-xl border border-crimson/30 bg-crimson-soft px-3 py-2 text-sm text-crimson">{error}</p>;
}

export function ChipsInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft('');
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-paper p-2 focus-within:border-blue">
      {values.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 rounded-full bg-cream px-2.5 py-0.5 text-sm">
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}>×</button>
        </span>
      ))}
      <input
        className="min-w-[140px] flex-1 bg-transparent px-1 py-0.5 text-sm focus:outline-none"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
      />
    </div>
  );
}

export const btn = {
  primary: 'inline-flex items-center gap-2 rounded-xl bg-green px-4 py-2 text-sm font-semibold text-paper hover:bg-green-deep disabled:opacity-50',
  secondary: 'inline-flex items-center gap-2 rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold hover:border-ink disabled:opacity-50',
  danger: 'inline-flex items-center gap-2 rounded-xl border border-crimson/30 px-4 py-2 text-sm font-semibold text-crimson hover:bg-crimson-soft disabled:opacity-50',
  subtle: 'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-muted hover:bg-cream hover:text-ink',
};
