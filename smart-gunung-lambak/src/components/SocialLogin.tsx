'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Users, X } from 'lucide-react';
import { roleLabels, type AppRole } from '@/components/auth';

type Provider = 'google' | 'facebook' | 'instagram';

type ProviderMeta = {
  name: string;
  buttonClass: string;
  barClass: string;
  prose: { en: string; bm: string };
  identity: { name: string; handle: string };
  Icon: () => React.ReactNode;
};

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="soc-icon" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="soc-icon" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="soc-icon" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const providers: Record<Provider, ProviderMeta> = {
  google: {
    name: 'Google',
    buttonClass: 'soc-btn-google',
    barClass: 'soc-bar-google',
    prose: { en: 'a Google account', bm: 'akaun Google' },
    identity: { name: 'Aiman Rizal', handle: 'aiman.rizal@gmail.com' },
    Icon: GoogleIcon
  },
  facebook: {
    name: 'Facebook',
    buttonClass: 'soc-btn-facebook',
    barClass: 'soc-bar-facebook',
    prose: { en: 'a Facebook account', bm: 'akaun Facebook' },
    identity: { name: 'Nurul Aina', handle: 'nurul.aina@facebook.com' },
    Icon: FacebookIcon
  },
  instagram: {
    name: 'Instagram',
    buttonClass: 'soc-btn-instagram',
    barClass: 'soc-bar-instagram',
    prose: { en: 'an Instagram account', bm: 'akaun Instagram' },
    identity: { name: 'Lambak Hiker', handle: '@lambak.hiker' },
    Icon: InstagramIcon
  }
};

const t = (lang: 'EN' | 'BM', en: string, bm: string) => (lang === 'BM' ? bm : en);

const roleViews: Record<Exclude<AppRole, 'visitor'>, string> = {
  super_admin: 'admin',
  park_manager: 'admin',
  ranger: 'ranger',
  operator: 'ranger',
  finance: 'budget',
  auditor: 'sla'
};

export function SocialLogin({ lang }: { lang: 'EN' | 'BM' }) {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [chosen, setChosen] = useState<AppRole | null>(null);

  const meta = provider ? providers[provider] : null;

  useEffect(() => {
    if (!provider) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (chosen && !done) setChosen(null);
        else setProvider(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [provider, chosen, done]);

  const handleAllow = async () => {
    const role: AppRole = chosen ?? 'visitor';
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    window.localStorage.setItem('lambak-role', role);
    try {
      await fetch('/api/v1/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
    } catch {
      // demo sign-in works offline too; the app re-syncs the role cookie on mount
    }
    setBusy(false);
    setDone(true);
    const view = role === 'visitor' ? 'visitor' : roleViews[role];
    setTimeout(() => router.push(`/app?view=${view}`), 700);
  };

  return (
    <>
      <div className="landing-social" data-lang={lang}>
        {(Object.keys(providers) as Provider[]).map((key) => {
          const item = providers[key];
          const Icon = item.Icon;
          return (
            <button
              key={key}
              type="button"
              className={`landing-social-btn ${item.buttonClass}`}
              onClick={() => setProvider(key)}
              aria-label={`${t(lang, 'Sign in with', 'Log masuk dengan')} ${item.name}`}
            >
              <Icon />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {meta && (
        <div className="landing-oauth" role="dialog" aria-modal="true" onClick={() => !busy && !done && setProvider(null)}>
          <div className="landing-oauth-card" onClick={(event) => event.stopPropagation()}>
            <div className={meta.barClass}>
              <span className="landing-oauth-bar-brand">
                <meta.Icon />
                {meta.name}
              </span>
              <button type="button" className="landing-oauth-close" onClick={() => !busy && setProvider(null)} aria-label={t(lang, 'Close', 'Tutup')}>
                <X />
              </button>
            </div>

            <div className="landing-oauth-body">
              <div className="landing-oauth-badge">
                <ShieldCheck />
                {t(lang, 'DEMO — no real account needed', 'DEMO — tiada akaun sebenar diperlukan')}
              </div>
              <p className="landing-oauth-sub">
                {t(lang, 'to continue', 'untuk meneruskan')} <strong>Gunung Lambak Pilot</strong>
              </p>

              {done ? (
                <div className="landing-oauth-done">
                  <div className="landing-oauth-check">✓</div>
                  <p>{t(lang, 'Signed in — welcome to the mountain', 'Berjaya masuk — selamat datang ke gunung')}</p>
                </div>
              ) : busy ? (
                <div className="landing-oauth-spinning">
                  <span className="landing-oauth-spinner" />
                  <p>{t(lang, 'Contacting provider…', 'Menghubungi pembekal…')}</p>
                </div>
              ) : chosen ? (
                <>
                  <div className="landing-oauth-account">
                    <div className="landing-oauth-avatar">{meta.identity.name.charAt(0)}</div>
                    <div>
                      <div className="landing-oauth-name">{meta.identity.name}</div>
                      <div className="landing-oauth-handle">{meta.identity.handle}</div>
                    </div>
                  </div>
                  <div className="landing-oauth-chosen-row">
                    <span>{t(lang, 'Signing in as', 'Log masuk sebagai')}</span>
                    <strong>{roleLabels[chosen]}</strong>
                    <button type="button" className="landing-oauth-change" onClick={() => setChosen(null)}>
                      {t(lang, 'Change', 'Tukar')}
                    </button>
                  </div>
                  <p className="landing-oauth-perm">
                    {t(lang, 'This will let the app know who you are:', 'Ini membolehkan aplikasi mengenali anda:')} {meta.prose[lang === 'BM' ? 'bm' : 'en']}
                  </p>
                  <div className="landing-oauth-actions">
                    <button type="button" className="landing-oauth-ghost" onClick={() => setProvider(null)}>
                      {t(lang, 'Cancel', 'Batal')}
                    </button>
                    <button type="button" className="landing-oauth-allow" onClick={handleAllow}>
                      {t(lang, 'Continue', 'Teruskan')}
                    </button>
                  </div>
                  <p className="landing-oauth-legal">
                    {t(lang, 'Simulated consent screen for the demo pilot. No data leaves this browser.', 'Skrin kebenaran simulasi untuk perintis demo. Tiada data meninggalkan pelayar ini.')}
                  </p>
                </>
              ) : (
                <>
                  <p className="landing-oauth-role-hint">
                    <Users className="h-3.5 w-3.5" />
                    {t(lang, 'Choose the role to sign in to:', 'Pilih peranan untuk log masuk:')}
                  </p>
                  <div className="landing-oauth-roles">
                    {(Object.keys(roleLabels) as AppRole[]).map((role) => (
                      <button
                        key={role}
                        type="button"
                        className="landing-oauth-role"
                        onClick={() => setChosen(role)}
                      >
                        <span className="landing-oauth-role-dot" />
                        <span className="landing-oauth-role-name">{roleLabels[role]}</span>
                        <span className="landing-oauth-role-view">
                          {role === 'visitor' ? 'Visitor' : roleViews[role]}
                        </span>
                        <ArrowRight className="landing-oauth-role-arrow" />
                      </button>
                    ))}
                  </div>
                  <p className="landing-oauth-legal">
                    {t(lang, 'Demo pilot — every role is a simulated session. No data leaves this browser.', 'Perintis demo — setiap peranan ialah sesi simulasi. Tiada data meninggalkan pelayar ini.')}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}