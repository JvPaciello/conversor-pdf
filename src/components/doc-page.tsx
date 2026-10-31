import type { ReactNode } from 'react';

/** Layout for long-form institutional pages. */
export function DocPage({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 lg:pt-16">
      <header className="max-w-3xl">
        <h1 className="display text-4xl sm:text-5xl">{title}</h1>
        {updated && <p className="mt-4 text-sm text-ink-2">Última atualização: {updated}</p>}
      </header>
      <div className="prose-doc mt-10">{children}</div>
    </article>
  );
}
