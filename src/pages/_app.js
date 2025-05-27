import '../styles/globals.css';
import Navbar from '../components/Navbar';
import { Analytics } from '@vercel/analytics/react'
import CookieBanner from '../components/CookieBanner';
import Footer from '../components/Footer';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Analytics />
      <Navbar />
      <CookieBanner />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}
