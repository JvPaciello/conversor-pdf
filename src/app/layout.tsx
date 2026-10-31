import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { CookieNotice } from '@/components/cookie-notice';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SITE } from '@/lib/site';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { siteName: SITE.name, locale: SITE.locale, type: 'website' },
  other: { 'google-adsense-account': SITE.adsenseClient },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e9ecf2' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1226' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={archivo.variable}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#conteudo"
          className="sr-only z-50 rounded-md bg-paper px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Pular para o conteúdo
        </a>
        <SiteHeader />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <CookieNotice />
        <Analytics />
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
