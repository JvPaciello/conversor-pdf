import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 mt-12 py-8 px-4 text-center text-sm text-neutral-600 dark:text-neutral-400 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <p className="mb-4">
          © {new Date().getFullYear()} Converter PDF BR. Todos os direitos reservados.
        </p>
        <div className="flex flex-wrap justify-center items-center gap-4">
          <Link href="/politica-de-privacidade" className="text-neutral-800 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Política de Privacidade</Link>
          <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">|</span>
          <Link href="/termos-de-uso" className="text-neutral-800 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Termos de Uso</Link>
          <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">|</span>
          <Link href="/contato" className="text-neutral-800 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Contato</Link>
        </div>
      </div>
    </footer>
  );
}
