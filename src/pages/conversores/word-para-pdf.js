import { useState, useRef } from 'react';
import { FileUp, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import Link from 'next/link';

const SITE_URL = 'https://www.converterpdfbr.com.br';
const PAGE_PATH = '/conversores/word-para-pdf';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Word para PDF', item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Converter Word para PDF — ConverterPDF BR',
      url: `${SITE_URL}${PAGE_PATH}`,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      featureList: [
        'Converte .doc, .docx e .txt para PDF com fidelidade total',
        'Preserva fontes, estilos, tabelas e imagens do documento',
        'Processamento local no navegador sem upload',
        'Sem cadastro necessário',
      ],
      description:
        'Converta arquivos Word (.doc, .docx) e .txt para PDF gratuitamente, sem cadastro e sem upload. Fidelidade total ao layout original.',
    },
    {
      '@type': 'HowTo',
      name: 'Como converter Word para PDF',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Selecione o arquivo', text: 'Clique na área de upload ou arraste seu arquivo .doc, .docx ou .txt.' },
        { '@type': 'HowToStep', position: 2, name: 'Clique em Converter', text: 'Pressione o botão para iniciar a conversão diretamente no seu navegador.' },
        { '@type': 'HowToStep', position: 3, name: 'Baixe o PDF', text: 'O download do PDF será iniciado automaticamente após a conversão.' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'O conversor Word para PDF é gratuito?',
          acceptedAnswer: { '@type': 'Answer', text: 'Sim, 100% gratuito e sem limite de conversões por dia.' },
        },
        {
          '@type': 'Question',
          name: 'Meu arquivo Word é enviado para algum servidor?',
          acceptedAnswer: { '@type': 'Answer', text: 'Não. Todo o processamento acontece diretamente no seu navegador. Seus documentos nunca saem do seu dispositivo.' },
        },
        {
          '@type': 'Question',
          name: 'Quais formatos de arquivo são aceitos?',
          acceptedAnswer: { '@type': 'Answer', text: 'Aceitamos arquivos .doc, .docx e .txt.' },
        },
        {
          '@type': 'Question',
          name: 'A formatação do documento Word é preservada no PDF?',
          acceptedAnswer: { '@type': 'Answer', text: 'Sim. Para arquivos .docx, usamos docx-preview que preserva fontes, estilos, tabelas, imagens e o layout original com alta fidelidade.' },
        },
      ],
    },
  ],
};

const steps = [
  { n: '1', title: 'Selecione o arquivo', desc: 'Clique na área de upload ou arraste seu arquivo .doc, .docx ou .txt.' },
  { n: '2', title: 'Clique em Converter', desc: 'A conversão acontece inteiramente no seu navegador, sem enviar o arquivo para servidores.' },
  { n: '3', title: 'Baixe o PDF', desc: 'O download do arquivo PDF começa automaticamente em segundos.' },
];

const faqs = [
  { q: 'O conversor Word para PDF é gratuito?', a: 'Sim, 100% gratuito e sem limite de conversões por dia. Não é necessário criar conta ou fazer login.' },
  { q: 'Meu arquivo Word é enviado para algum servidor?', a: 'Não. Todo o processamento acontece diretamente no seu navegador. Seus documentos nunca saem do seu dispositivo.' },
  { q: 'Quais formatos de arquivo são aceitos?', a: 'Aceitamos arquivos .doc, .docx (Microsoft Word) e .txt (texto simples).' },
  { q: 'A formatação do documento Word é preservada no PDF?', a: 'Sim. Para .docx usamos docx-preview, que preserva fontes, estilos, tabelas, imagens e layout com alta fidelidade ao documento original.' },
];

export default function WordParaPdf() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) { setFile(e.target.files[0]); setError(''); }
  };
  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else setIsDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) { setFile(e.dataTransfer.files[0]); setError(''); }
  };

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    const bodyContainer = document.createElement('div');
    const styleContainer = document.createElement('div');

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Temporarily mount off-screen so CSS applies before capture
      bodyContainer.style.cssText = 'position:absolute;top:-99999px;left:-99999px;background:#fff;';
      document.body.appendChild(bodyContainer);
      document.head.appendChild(styleContainer);

      if (file.name.match(/\.docx$/i)) {
        // docx-preview: highest fidelity — preserves fonts, tables, images, layout
        const { renderAsync } = await import('docx-preview');
        await renderAsync(arrayBuffer, bodyContainer, styleContainer, {
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          useBase64URL: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
        });
      } else if (file.name.match(/\.txt$/i)) {
        const text = new TextDecoder('utf-8').decode(arrayBuffer);
        bodyContainer.innerHTML = `
          <div style="width:816px;padding:96px;background:#fff;box-sizing:border-box;">
            <pre style="white-space:pre-wrap;font-family:'Calibri',Arial,sans-serif;font-size:11pt;line-height:1.5;color:#000;margin:0;">${escapeHtml(text)}</pre>
          </div>`;
      } else {
        // .doc — fallback to Mammoth with Word-faithful CSS
        const mammothBrowser = await import('mammoth/mammoth.browser.min.js');
        const mammoth = mammothBrowser.default || window.mammoth;
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value || '<p>Documento vazio.</p>';
        bodyContainer.innerHTML = `
          <div style="width:816px;padding:96px;background:#fff;box-sizing:border-box;">
            <style>
              * { font-family: 'Calibri', Arial, sans-serif; }
              p { margin: 0 0 8pt; font-size: 11pt; line-height: 1.5; color: #000; }
              h1 { font-size: 16pt; font-weight: bold; margin: 12pt 0 6pt; color: #000; }
              h2 { font-size: 13pt; font-weight: bold; margin: 10pt 0 4pt; color: #000; }
              h3 { font-size: 12pt; font-weight: bold; margin: 8pt 0 4pt; color: #000; }
              h4, h5, h6 { font-size: 11pt; font-weight: bold; margin: 6pt 0 4pt; color: #000; }
              table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
              td, th { border: 1px solid #000; padding: 3pt 6pt; font-size: 10pt; vertical-align: top; }
              ul, ol { padding-left: 24pt; margin: 4pt 0; }
              li { font-size: 11pt; line-height: 1.5; color: #000; }
              strong, b { font-weight: bold; }
              em, i { font-style: italic; }
              u { text-decoration: underline; }
              img { max-width: 100%; height: auto; }
            </style>
            ${html}
          </div>`;
      }

      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf()
        .set({
          margin: 0,
          filename: file.name.replace(/\.[^/.]+$/, '') + '.pdf',
          html2canvas: {
            scale: 1.5,
            useCORS: true,
            allowTaint: true,
            logging: false,
            scrollX: 0,
            scrollY: 0,
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] },
        })
        .from(bodyContainer)
        .save();
    } catch (err) {
      console.error(err);
      setError('Erro ao processar o arquivo. Verifique se o documento não está corrompido e tente novamente.');
    } finally {
      if (bodyContainer.parentNode) document.body.removeChild(bodyContainer);
      if (styleContainer.parentNode) document.head.removeChild(styleContainer);
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Converter Word para PDF Grátis Online — .doc e .docx sem cadastro"
        description="Converta arquivos Word (.doc, .docx) e .txt para PDF gratuitamente, sem cadastro e sem upload. Layout e formatação preservados com fidelidade total."
        path={PAGE_PATH}
        jsonLd={jsonLd}
      />

      <main className="min-h-screen flex flex-col items-center p-8 bg-neutral-950 font-sans pt-28">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-teal-900/10 blur-[100px]"></div>
        </div>

        <nav className="w-full max-w-2xl mb-6 relative z-10" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-neutral-500">
            <li><Link href="/" className="hover:text-neutral-300 transition-colors">Início</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-neutral-300">Word para PDF</li>
          </ol>
        </nav>

        <div className="w-full max-w-2xl text-center mb-10 relative z-10">
          <div className="w-16 h-16 bg-teal-900/40 border border-teal-500/30 text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-5px_rgba(20,184,166,0.3)]">
            <FileText size={32} aria-hidden="true" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">Converter Word para PDF</h1>
          <p className="text-lg text-neutral-400">
            Transforme documentos .doc, .docx e .txt em PDF com layout e formatação preservados — sem upload, sem cadastro.
          </p>
        </div>

        <div className="w-full max-w-2xl bg-neutral-900/50 backdrop-blur-md rounded-3xl p-8 border border-neutral-800 shadow-xl relative z-10">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            role="button" tabIndex={0} aria-label="Área de upload de arquivo Word"
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
              ${isDragActive ? 'border-teal-500 bg-teal-900/20' : 'border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/60 hover:border-teal-500/50'}`}
          >
            <input type="file" accept=".txt,.doc,.docx" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
            {file ? (
              <>
                <CheckCircle2 size={48} className="text-teal-500 mb-4" aria-hidden="true" />
                <p className="text-lg font-medium text-white text-center">Arquivo Selecionado</p>
                <p className="text-sm text-neutral-400 truncate max-w-sm text-center">{file.name}</p>
                <p className="text-xs text-neutral-500 mt-1">{formatBytes(file.size)}</p>
                <p className="text-xs text-teal-400 mt-3 hover:underline">Clique para trocar</p>
              </>
            ) : (
              <>
                <FileUp size={48} className="text-neutral-500 mb-4" aria-hidden="true" />
                <p className="text-lg font-medium text-white text-center">Arraste e solte o arquivo aqui</p>
                <p className="text-sm text-neutral-400 mb-4">ou clique para procurar no seu dispositivo</p>
                <span className="px-5 py-2 rounded-full bg-teal-900/40 border border-teal-500/30 text-teal-400 text-sm font-semibold pointer-events-none">Selecionar Arquivo</span>
                <p className="text-xs text-neutral-600 mt-4">Formatos aceitos: .doc, .docx, .txt</p>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-3 bg-red-900/30 border border-red-500/30 rounded-xl p-4" role="alert">
              <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleConvert}
              disabled={!file || loading}
              className={`w-full py-4 text-white text-lg font-bold rounded-2xl transition-all duration-300 flex items-center justify-center
                ${!file || loading
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                  : 'bg-teal-600 hover:bg-teal-500 hover:-translate-y-1 shadow-[0_0_20px_-5px_rgba(20,184,166,0.5)] border border-teal-500/50'}`}
            >
              {loading ? (
                <span className="flex items-center text-teal-200">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Convertendo Documento...
                </span>
              ) : 'Converter e Baixar PDF'}
            </button>
          </div>
        </div>

        <section className="w-full max-w-4xl mt-20 relative z-10" aria-labelledby="how-to-heading">
          <h2 id="how-to-heading" className="text-2xl font-bold text-center text-white mb-10">Como converter Word para PDF</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-full bg-teal-900/50 border border-teal-500/30 text-teal-400 font-bold flex items-center justify-center mb-4 text-lg">{n}</div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-3xl mt-16 mb-16 relative z-10" aria-labelledby="faq-word-heading">
          <h2 id="faq-word-heading" className="text-2xl font-bold text-center text-white mb-10">Perguntas Frequentes</h2>
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
