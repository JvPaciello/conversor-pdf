import { UniversalConverter } from '@/components/converter/universal-converter';
import { FaqList } from '@/components/faq-list';
import { JsonLd } from '@/components/json-ld';
import { ToolIndex } from '@/components/tool-index';
import { pageMetadata } from '@/lib/metadata';
import { absoluteUrl, SITE } from '@/lib/site';
import { HOME_FAQS, TOOLS } from '@/lib/tools';

export const metadata = pageMetadata({
  title: 'Conversor de PDF online grátis: Word, Excel e imagem para PDF',
  description:
    'Converta Word, Excel e imagens para PDF de graça, sem cadastro e sem enviar arquivos para a internet. A conversão acontece no seu navegador.',
  path: '/',
  absoluteTitle: true,
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE.url}/#website`,
      url: absoluteUrl('/'),
      name: SITE.name,
      description: SITE.description,
      inLanguage: 'pt-BR',
      publisher: { '@id': `${SITE.url}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE.url}/#organization`,
      name: SITE.name,
      url: absoluteUrl('/'),
      logo: { '@type': 'ImageObject', url: absoluteUrl('/logo-512.png'), width: 512, height: 512 },
      email: SITE.email,
    },
    {
      '@type': 'WebApplication',
      name: SITE.name,
      url: absoluteUrl('/'),
      description: SITE.description,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      inLanguage: 'pt-BR',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      featureList: TOOLS.map((t) => t.headline),
    },
    {
      '@type': 'FAQPage',
      mainEntity: HOME_FAQS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:pt-16">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <div className="lg:pt-8">
            <h1 className="display text-[2.5rem] sm:text-6xl lg:text-[3.75rem]">
              Converta arquivos em PDF sem enviar nada para a internet
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2 sm:text-xl">
              Word, Excel e imagens viram PDF aqui mesmo, no seu navegador. Grátis, sem cadastro e sem limite de uso.
            </p>
          </div>
          <div className="sheet p-5 sm:p-8">
            <UniversalConverter />
          </div>
        </div>
      </section>

      <section aria-labelledby="conversores" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <h2 id="conversores" className="heading text-3xl">
          O que dá para converter
        </h2>
        <div className="mt-6">
          <ToolIndex tools={TOOLS} />
        </div>
      </section>

      <section aria-labelledby="privacidade" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <h2 id="privacidade" className="heading text-3xl">
            Seu arquivo não sai do seu aparelho
          </h2>
          <div className="max-w-[62ch] space-y-4 text-lg leading-relaxed text-ink-2">
            <p>
              A maioria dos conversores online envia o arquivo para um servidor, converte lá e devolve o PDF. Aqui, a
              conversão roda no próprio navegador: o documento é lido, montado e salvo no seu computador ou celular.
            </p>
            <p>
              Isso faz diferença para contratos, holerites, planilhas da empresa e documentos pessoais. Ninguém além de
              você tem acesso ao conteúdo.
            </p>
            <p className="text-base">
              Quer conferir? Escolha um arquivo, desligue a internet e toque em converter. Funciona do mesmo jeito.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="perguntas" className="mx-auto mt-24 max-w-3xl px-4 sm:px-6">
        <h2 id="perguntas" className="heading text-3xl">
          Perguntas frequentes
        </h2>
        <div className="mt-6">
          <FaqList items={HOME_FAQS} />
        </div>
      </section>
    </>
  );
}
