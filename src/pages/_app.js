import '../styles/globals.css';
import Navbar from '../components/Navbar';
import { Analytics } from '@vercel/analytics/react'
import CookieBanner from '../components/CookieBanner';
import Footer from '../components/Footer';
import Script from 'next/script';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function App({ Component, pageProps }) {
  return (
    <div className={`${inter.variable} font-sans min-h-screen flex flex-col bg-neutral-950 text-neutral-50`}>
      <Analytics />
      <Script 
        strategy="afterInteractive" 
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2458442591696135" 
        crossOrigin="anonymous" 
      />
      <Navbar />
      <CookieBanner />
      <div className="flex-grow pt-24">
        <Component {...pageProps} />
      </div>
      <Footer />
    </div>
  );
}
