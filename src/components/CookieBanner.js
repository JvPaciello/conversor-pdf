import { useState, useEffect } from 'react';

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
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[400px] bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-2xl p-5 z-[100] transition-colors duration-300">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          Usamos cookies para personalizar anúncios e analisar o tráfego, conforme nossa <a href="/politica-de-privacidade" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Política de Privacidade</a>.
        </p>
        <button 
          onClick={acceptCookies}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
