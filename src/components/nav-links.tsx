'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TOOLS } from '@/lib/tools';

export function NavLinks({ className, linkClassName }: { className?: string; linkClassName?: string }) {
  const pathname = usePathname();
  return (
    <ul className={className}>
      {TOOLS.map((tool) => {
        const current = pathname === tool.path;
        return (
          <li key={tool.id}>
            <Link
              href={tool.path}
              aria-current={current ? 'page' : undefined}
              className={`${linkClassName} ${current ? 'text-stamp' : 'text-ink-2 hover:text-ink'}`}
            >
              {tool.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
