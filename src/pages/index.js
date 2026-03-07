import Head from 'next/head';
import Link from 'next/link';
import { FileText, Table, Image as ImageIcon, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Head>
        <title>Conversor de Arquivos para PDF Grátis - Online e Seguro</title>
        <meta name="description" content="Converta Word, Excel e Imagens para PDF gratuitamente, rápido e seguro. Solução focada na privacidade: nada fica salvo." />
      </Head>

      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-neutral-950 font-sans">
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-900/20 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]"></div>
        </div>

        <div className="w-full max-w-4xl text-center mb-20 relative z-10">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-sm font-medium tracking-wide">
            100% Gratuito e Seguro
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-white leading-tight">
            Seus Arquivos em <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-600">PDFs Perfeitos</span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto leading-relaxed font-light">
            Converta documentos e imagens diretamente no seu navegador. <strong className="text-neutral-200 font-medium">Nenhum arquivo</strong> é enviado para nossos servidores, garantindo sua privacidade total.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4 relative z-10">
          {/* Word Card */}
          <Link href="/conversores/word-para-pdf" className="group bg-neutral-900/50 backdrop-blur-sm p-10 border border-neutral-800 rounded-3xl text-left no-underline transition-all duration-500 hover:border-teal-500/50 hover:bg-neutral-900 hover:-translate-y-2 hover:shadow-[0_0_40px_-10px_rgba(20,184,166,0.2)] block relative overflow-hidden">
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

          {/* Excel Card */}
          <Link href="/conversores/excel-para-pdf" className="group bg-neutral-900/50 backdrop-blur-sm p-10 border border-neutral-800 rounded-3xl text-left no-underline transition-all duration-500 hover:border-emerald-500/50 hover:bg-neutral-900 hover:-translate-y-2 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)] block relative overflow-hidden">
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

          {/* Image Card */}
          <Link href="/conversores/jpg-para-pdf" className="group bg-neutral-900/50 backdrop-blur-sm p-10 border border-neutral-800 rounded-3xl text-left no-underline transition-all duration-500 hover:border-blue-500/50 hover:bg-neutral-900 hover:-translate-y-2 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)] block relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mb-8 text-neutral-400 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-500 border border-neutral-700/50 group-hover:border-blue-500/30">
              <ImageIcon size={32} strokeWidth={1.5} />
            </div>
            
            <h2 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-50 transition-colors">JPG para PDF</h2>
            <p className="text-neutral-400 mb-8 text-base leading-relaxed">
              Agrupe e converta suas imagens JPG, JPEG ou PNG perfeitamente ajustadas em um único documento PDF.
            </p>
            
            <div className="flex items-center text-blue-500 font-semibold text-base group-hover:translate-x-2 transition-transform duration-300">
              Iniciar Conversão <ArrowRight size={18} className="ml-2" />
            </div>
          </Link>
        </div>
      </main>
    </>
  );
}
