import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setShowBanner(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className={styles.cookieBanner}>
      <p>
        Usamos cookies para personalizar anúncios e analisar o tráfego, conforme nossa <a href="/politica-de-privacidade">Política de Privacidade</a>.
      </p>
      <button onClick={acceptCookies}>Aceitar</button>
    </div>
  );
}
