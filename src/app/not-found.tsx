import type { Metadata } from 'next';
import Link from 'next/link';
import { ToolIndex } from '@/components/tool-index';
import { TOOLS } from '@/lib/tools';

export const metadata: Metadata = {
  title: 'Página não encontrada',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
      <h1 className="display text-4xl sm:text-5xl">Página não encontrada</h1>
      <p className="mt-4 max-w-xl text-lg text-ink-2">
        O endereço pode ter mudado ou estar digitado errado. Escolha um conversor abaixo ou{' '}
        <Link href="/" className="link">
          volte para a página inicial
        </Link>
        .
      </p>
      <div className="mt-10">
        <ToolIndex tools={TOOLS} headingLevel="h2" />
      </div>
    </div>
  );
}
