import { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';

type GoogleId = {
  initialize: (o: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: string; auto_select?: boolean }) => void;
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
};
declare global {
  interface Window { google?: { accounts: { id: GoogleId } } }
}

const SCRIPT = 'https://accounts.google.com/gsi/client';
let scriptPromise: Promise<void> | null = null;
const loadScript = () =>
  (scriptPromise ??= new Promise<void>((resolve, reject) => {
    const el = document.createElement('script');
    el.src = SCRIPT;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      scriptPromise = null;
      reject(new Error('Could not load Google sign-in'));
    };
    document.head.appendChild(el);
  }));

/**
 * "Sign in with Google" via Google Identity Services. Google returns a signed
 * ID token; the backend verifies it and issues our own session token.
 * Renders nothing when the backend has no GOOGLE_CLIENT_ID configured.
 */
export default function GoogleButton({ onCredential, text = 'continue_with' }: { onCredential: (credential: string) => void; text?: 'signin_with' | 'continue_with' | 'signup_with' }) {
  const ref = useRef<HTMLDivElement>(null);
  const callback = useRef(onCredential);
  callback.current = onCredential;
  const [state, setState] = useState<'loading' | 'ready' | 'disabled' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    api<{ google: { clientId: string } | null }>('/auth/providers')
      .then(async ({ google }) => {
        if (!google) return setState('disabled');
        await loadScript();
        if (cancelled || !ref.current || !window.google) return;
        window.google.accounts.id.initialize({ client_id: google.clientId, callback: (r) => callback.current(r.credential) });
        window.google.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text,
          width: Math.min(ref.current.offsetWidth || 320, 400),
          logo_alignment: 'center',
        });
        setState('ready');
      })
      .catch(() => !cancelled && setState('error'));
    return () => {
      cancelled = true;
    };
  }, [text]);

  if (state === 'disabled') {
    return import.meta.env.DEV ? (
      <p className="rounded-xl border border-dashed border-line px-3 py-2 text-center text-xs text-muted">
        Google sign-in is off — set <code>GOOGLE_CLIENT_ID</code> in the backend <code>.env</code>.
      </p>
    ) : null;
  }
  return (
    <div>
      <div ref={ref} className="flex min-h-[44px] justify-center" />
      {state === 'error' && <p className="mt-1 text-center text-xs text-crimson">Google sign-in couldn't load. Check your connection or ad blocker.</p>}
    </div>
  );
}
