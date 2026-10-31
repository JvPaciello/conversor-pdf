import { Menu } from 'lucide-react';
import { Brand } from './brand';
import { NavLinks } from './nav-links';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-desk/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Brand />
        <nav aria-label="Conversores" className="hidden md:block">
          <NavLinks
            className="flex items-center gap-1"
            linkClassName="rounded-md px-3 py-2 text-[0.9375rem] font-medium"
          />
        </nav>
        {/* Mobile menu: a native disclosure, no JavaScript needed. */}
        <details className="relative md:hidden">
          <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-md text-ink [&::-webkit-details-marker]:hidden">
            <Menu aria-hidden size={22} />
            <span className="sr-only">Abrir menu</span>
          </summary>
          <nav aria-label="Conversores" className="sheet absolute top-12 right-0 w-60 p-2 [--fold:1rem]">
            <NavLinks className="flex flex-col" linkClassName="block rounded-md px-3 py-3 text-base font-medium" />
          </nav>
        </details>
      </div>
    </header>
  );
}
