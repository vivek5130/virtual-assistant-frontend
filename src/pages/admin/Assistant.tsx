import { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';

/**
 * The AI assistant's configuration UI (agent, chat widget design, knowledge,
 * conversations, analytics…) provided by Unicorn and mounted right here.
 * Our backend vouches for the signed-in admin (/admin/assistant/session);
 * the secret platform key never reaches the browser.
 */
type Session = { token: string; expiresIn: number; scriptUrl: string };
type Mounted = { destroy: () => void };
declare global {
  interface Window { UnicornAdmin?: { mount: (o: { container: Element; height?: string; view?: string; getToken: () => Promise<string>; onError?: (e: unknown) => void }) => Mounted } }
}

const fetchSession = () => api<Session>('/admin/assistant/session', { method: 'POST' });

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (window.UnicornAdmin) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load the Unicorn console script'));
    document.head.appendChild(s);
  });
}

export default function Assistant() {
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted: Mounted | undefined;
    let cancelled = false;
    (async () => {
      try {
        const first = await fetchSession();
        await loadScript(first.scriptUrl);
        if (cancelled || !host.current || !window.UnicornAdmin) return;
        let initial: string | null = first.token; // reuse the token we already have for the first handshake
        mounted = window.UnicornAdmin.mount({
          container: host.current,
          height: 'calc(100vh - 7rem)',
          view: new URLSearchParams(window.location.search).get('view') || undefined,
          getToken: async () => {
            if (initial) { const t = initial; initial = null; return t; }
            return (await fetchSession()).token;
          },
          onError: (e) => setError(e instanceof Error ? e.message : String(e)),
        });
        setLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not open the assistant console');
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      mounted?.destroy();
    };
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-display text-3xl font-bold">AI assistant</h1>
        <p className="text-sm text-muted">Configure your shopping assistant — agent, chat design, knowledge, conversations — without leaving the admin.</p>
      </div>
      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {loading && !error && <p className="text-sm text-muted">Opening console…</p>}
      <div ref={host} className="overflow-hidden rounded-2xl border border-line bg-paper" />
    </div>
  );
}
