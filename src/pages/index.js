import Link from 'next/link';
import { FileText, Table, Image as ImageIcon, ArrowRight, ShieldCheck, Zap, BadgeCheck, Smartphone } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const SITE_URL = 'https://www.converterpdfbr.com.br';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'ConverterPDF BR',
      description: 'Converta Word, Excel e Imagens para PDF gratuitamente, direto no navegador.',
      inLanguage: 'pt-BR',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'ConverterPDF BR',
      url: `${SITE_URL}/`,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      featureList: [
        'Converter Word para PDF',
        'Converter Excel para PDF',
        'Converter JPG/PNG para PDF',
        'Converter múltiplas imagens para PDF',
        'Processamento local no navegador sem upload',
      ],
      description:
        'Ferramenta online gratuita para converter Word, Excel e Imagens para PDF diretamente no navegador, sem upload para servidores.',
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'ConverterPDF BR',
      url: `${SITE_URL}/`,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
      sameAs: [],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'É realmente gratuito usar o conversor de PDF?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim, todas as ferramentas são 100% gratuitas e sem limite de uso. Não pedimos cadastro, cartão de crédito ou qualquer dado pessoal.',
          },
        },
        {
          '@type': 'Question',
          name: 'Meus arquivos ficam armazenados nos servidores?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. Todo o processamento acontece diretamente no seu navegador usando JavaScript. Seus arquivos nunca são enviados para nossos servidores, garantindo total privacidade.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quais tipos de arquivo posso converter para PDF?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Você pode converter documentos Word (.doc, .docx, .txt), planilhas Excel (.xls, .xlsx, .csv) e imagens (.jpg, .jpeg, .png) para PDF.',
          },
        },
        {
          '@type': 'Question',
          name: 'O conversor funciona no celular?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim, nosso conversor funciona em qualquer dispositivo com um navegador moderno, incluindo smartphones Android e iOS e tablets.',
          },
        },
      ],
    },
  ],
};

const features = [
  {
    icon: ShieldCheck,
    title: '100% Privado',
    desc: 'Seus arquivos nunca saem do seu navegador. Zero upload para servidores.',
    color: 'text-teal-400',
  },
  {
    icon: Zap,
    title: 'Ultra Rápido',
    desc: 'Conversão em segundos, sem filas de espera ou instalações.',
    color: 'text-yellow-400',
  },
  {
    icon: BadgeCheck,
    title: 'Sempre Gratuito',
    desc: 'Sem cadastro, sem cartão de crédito e sem limite de conversões.',
    color: 'text-emerald-400',
  },
  {
    icon: Smartphone,
    title: 'Qualquer Dispositivo',
    desc: 'Funciona no computador, tablet ou smartphone com qualquer navegador.',
    color: 'text-blue-400',
  },
];

const faqs = [
  {
    q: 'É realmente gratuito usar o conversor de PDF?',
    a: 'Sim, todas as ferramentas são 100% gratuitas e sem limite de uso. Não pedimos cadastro, cartão de crédito ou qualquer dado pessoal.',
  },
  {
    q: 'Meus arquivos ficam armazenados nos servidores?',
    a: 'Não. Todo o processamento acontece diretamente no seu navegador usando JavaScript. Seus arquivos nunca são enviados para nossos servidores, garantindo total privacidade.',
  },
  {
    q: 'Quais tipos de arquivo posso converter para PDF?',
    a: 'Você pode converter documentos Word (.doc, .docx, .txt), planilhas Excel (.xls, .xlsx, .csv) e imagens (.jpg, .jpeg, .png) para PDF.',
  },
  {
    q: 'O conversor funciona no celular?',
    a: 'Sim, nosso conversor funciona em qualquer dispositivo com um navegador moderno, incluindo smartphones Android e iOS e tablets.',
  },
];

export default function Home() {
  return (
    <>
      <SEOHead
        title="Conversor de PDF Online Grátis — Word, Excel e Imagem para PDF"
        description="Converta Word, Excel e imagens para PDF gratuitamente, sem cadastro e sem upload. Processamento 100% local no navegador com total privacidade."
        path="/"
        jsonLd={jsonLd}
      />

      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-neutral-950 font-sans">

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-900/20 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]"></div>
        </div>

        {/* Hero */}
        <div className="w-full max-w-4xl text-center mb-20 relative z-10">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-sm font-medium tracking-wide">
            100% Gratuito e Seguro
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-white leading-tight">
            Seus Arquivos em <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-600">PDFs Perfeitos</span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto leading-relaxed font-light">
            Converta documentos e imagens diretamente no seu navegador.{' '}
            <strong className="text-neutral-200 font-medium">Nenhum arquivo</strong> é enviado
            para nossos servidores, garantindo sua privacidade total.
          </p>
        </div>

        {/* Converter cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4 relative z-10">
          <Link
            href="/conversores/word-para-pdf"
            className="group bg-neutral-900/50 backdrop-blur-sm p-10 border border-neutral-800 rounded-3xl text-left no-underline transition-all duration-500 hover:border-teal-500/50 hover:bg-neutral-900 hover:-translate-y-2 hover:shadow-[0_0_40px_-10px_rgba(20,184,166,0.2)] block relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mb-8 text-neutral-400 group-hover:text-teal-400 group-hover:scale-110 transition-all duration-500 border border-neutral-700/50 group-hover:border-teal-500/30">
              <FileText size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white group-hover:text-teal-50 transition-colors">Word para PDF</h2>
            <p className="text-neutral-400 mb-8 text-base leading-relaxed">
              Preserve a formatação dos seus documentos .doc e .docx exportando para um PDF estático de alta qualidade.
            </p>
            <div className="flex items-center text-teal-500 font-semibold text-base group-hover:translate-x-2 transition-transform duration-300">
              Iniciar Conversão <ArrowRight size={18} className="ml-2" />
            </div>
          </Link>

          <Link
            href="/conversores/excel-para-pdf"
            className="group bg-neutral-900/50 backdrop-blur-sm p-10 border border-neutral-800 rounded-3xl text-left no-underline transition-all duration-500 hover:border-emerald-500/50 hover:bg-neutral-900 hover:-translate-y-2 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)] block relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mb-8 text-neutral-400 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-500 border border-neutral-700/50 group-hover:border-emerald-500/30">
              <Table size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white group-hover:text-emerald-50 transition-colors">Excel para PDF</h2>
            <p className="text-neutral-400 mb-8 text-base leading-relaxed">
              Converta suas planilhas .xls, .xlsx e .csv em formato PDF mantendo as tabelas organizadas e legíveis.
            </p>
            <div className="flex items-center text-emerald-500 font-semibold text-base group-hover:translate-x-2 transition-transform duration-300">
              Iniciar Conversão <ArrowRight size={18} className="ml-2" />
            </div>
          </Link>

          <Link
            href="/conversores/jpg-para-pdf"
            className="group bg-neutral-900/50 backdrop-blur-sm p-10 border border-neutral-800 rounded-3xl text-left no-underline transition-all duration-500 hover:border-blue-500/50 hover:bg-neutral-900 hover:-translate-y-2 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)] block relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mb-8 text-neutral-400 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-500 border border-neutral-700/50 group-hover:border-blue-500/30">
              <ImageIcon size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-50 transition-colors">JPG / PNG para PDF</h2>
            <p className="text-neutral-400 mb-8 text-base leading-relaxed">
              Converta uma ou múltiplas imagens JPG, JPEG ou PNG em um único documento PDF perfeitamente formatado.
            </p>
            <div className="flex items-center text-blue-500 font-semibold text-base group-hover:translate-x-2 transition-transform duration-300">
              Iniciar Conversão <ArrowRight size={18} className="ml-2" />
            </div>
          </Link>
        </div>

        {/* Features */}
        <section className="w-full max-w-5xl mt-24 relative z-10" aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-2xl md:text-3xl font-bold text-center text-white mb-12">
            Por que usar o ConverterPDF BR?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 text-center">
                <Icon size={28} className={`${color} mx-auto mb-3`} aria-hidden="true" />
                <h3 className="text-white font-semibold mb-2 text-sm md:text-base">{title}</h3>
                <p className="text-neutral-400 text-xs md:text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="w-full max-w-3xl mt-24 mb-16 relative z-10" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl md:text-3xl font-bold text-center text-white mb-12">
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-2">{q}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
