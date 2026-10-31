import Link from 'next/link';
import { SITE } from '@/lib/site';
import { TOOLS } from '@/lib/tools';

const INFO_LINKS = [
  { href: '/politica-de-privacidade', label: 'Política de privacidade' },
  { href: '/termos-de-uso', label: 'Termos de uso' },
  { href: '/contato', label: 'Contato' },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <p className="font-extrabold [font-stretch:112%]">{SITE.name}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            Conversão feita no seu navegador. Seus arquivos não são enviados para nenhum servidor.
          </p>
        </div>
        <nav aria-label="Conversores no rodapé">
          <p className="text-sm font-semibold">Conversores</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-2">
            {TOOLS.map((tool) => (
              <li key={tool.id}>
                <Link href={tool.path} className="hover:text-ink hover:underline">
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Institucional">
          <p className="text-sm font-semibold">Institucional</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-2">
            {INFO_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-ink hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-10 text-xs text-ink-3 sm:px-6">
        © {new Date().getFullYear()} {SITE.name}
      </div>
    </footer>
  );
}
