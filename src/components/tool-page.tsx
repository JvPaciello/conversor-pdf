import { ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { absoluteUrl, SITE } from '@/lib/site';
import { TOOLS, type Tool } from '@/lib/tools';
import { ToolConverter } from './converter/tool-converter';
import { FaqList } from './faq-list';
import { FormatBadge } from './format-badge';
import { JsonLd } from './json-ld';
import { ToolIndex } from './tool-index';

function toolJsonLd(tool: Tool) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: absoluteUrl('/') },
          { '@type': 'ListItem', position: 2, name: tool.name, item: absoluteUrl(tool.path) },
        ],
      },
      {
        '@type': 'WebApplication',
        name: tool.headline,
        url: absoluteUrl(tool.path),
        description: tool.metaDescription,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requer um navegador atual com JavaScript ativado',
        inLanguage: 'pt-BR',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
        publisher: { '@id': `${SITE.url}/#organization` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: tool.faqs.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };
}

export function ToolPage({ tool }: { tool: Tool }) {
  const formats = tool.formats.filter((f) => f.ext !== 'jpeg');

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <JsonLd data={toolJsonLd(tool)} />

      <nav aria-label="Trilha de navegação" className="pt-6 text-sm text-ink-2">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-ink hover:underline">
              Início
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight size={14} />
          </li>
          <li aria-current="page" className="text-ink">
            {tool.name}
          </li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-16">
        <div>
          <header className="max-w-2xl">
            <p aria-hidden className="flex flex-wrap items-center gap-1.5">
              {formats.map((f) => (
                <FormatBadge key={f.ext} ext={f.ext} family={f.family} />
              ))}
              <ArrowRight size={14} className="mx-0.5 text-ink-3" />
              <FormatBadge ext="pdf" family="pdf" />
            </p>
            <h1 className="display mt-4 text-[2.25rem] sm:text-5xl">{tool.headline}</h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-2">{tool.lead}</p>
          </header>
          <div className="sheet mt-8 p-5 sm:p-8">
            <ToolConverter id={tool.id} />
          </div>
        </div>

        <aside className="space-y-12 lg:pt-2">
          <section aria-labelledby="como-converter">
            <h2 id="como-converter" className="heading text-2xl">
              Como converter
            </h2>
            <ol className="mt-6 space-y-6">
              {tool.steps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span
                    aria-hidden
                    className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-stamp text-sm font-bold text-stamp"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1 leading-relaxed text-ink-2">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="bom-saber">
            <h2 id="bom-saber" className="heading text-2xl">
              Bom saber
            </h2>
            <ul className="mt-5 space-y-3 leading-relaxed text-ink-2">
              {tool.notes.map((note) => (
                <li key={note} className="border-l-2 border-rule pl-4">
                  {note}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <section aria-labelledby="perguntas" className="mt-24 max-w-3xl">
        <h2 id="perguntas" className="heading text-3xl">
          Perguntas frequentes
        </h2>
        <div className="mt-6">
          <FaqList items={tool.faqs} />
        </div>
      </section>

      <section aria-labelledby="outros" className="mt-24">
        <h2 id="outros" className="heading text-3xl">
          Outros conversores
        </h2>
        <div className="mt-6">
          <ToolIndex tools={TOOLS.filter((t) => t.id !== tool.id)} />
        </div>
      </section>
    </div>
  );
}
