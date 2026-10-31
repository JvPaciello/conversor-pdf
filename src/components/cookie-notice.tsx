'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export const CONSENT_KEY = 'cookie-consent';

function readConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return 'unavailable'; // storage blocked: don't show the notice on every page
  }
}

export function CookieNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Storage only exists on the client, so the server never renders the notice.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!readConsent()) setOpen(true);
  }, []);

  if (!open) return null;

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, 'true');
    } catch {}
    setOpen(false);
  };

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="sheet fixed right-4 bottom-4 left-4 z-50 p-5 pr-8 [--fold:1.25rem] sm:left-auto sm:w-[24rem]"
    >
      <p className="text-sm leading-relaxed text-ink-2">
        Usamos cookies para medir o acesso e exibir anúncios. Os arquivos que você converte não são coletados. Saiba
        mais na{' '}
        <Link href="/politica-de-privacidade" className="link">
          Política de privacidade
        </Link>
        .
      </p>
      <button type="button" onClick={accept} className="btn btn-primary mt-4 w-full">
        Entendi
      </button>
    </div>
  );
}
