import { useState, useRef } from 'react';
import { FileUp, Image as ImageIcon, CheckCircle2, AlertCircle, X } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import Link from 'next/link';

const SITE_URL = 'https://www.converterpdfbr.com.br';
const PAGE_PATH = '/conversores/jpg-para-pdf';
const MAX_FILES = 30;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = dataUrl;
  });
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'JPG para PDF', item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Converter JPG/PNG para PDF — ConverterPDF BR',
      url: `${SITE_URL}${PAGE_PATH}`,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      featureList: [
        'Converte .jpg, .jpeg e .png para PDF com qualidade original',
        'Suporte a múltiplas imagens em um único PDF',
        'Orientação automática por imagem (retrato/paisagem)',
        'Processamento local no navegador sem upload',
      ],
      description: 'Converta imagens JPG e PNG para PDF com qualidade original, sem compressão extra. Combine múltiplas fotos em um único PDF. Processamento 100% local.',
    },
    {
      '@type': 'HowTo',
      name: 'Como converter JPG para PDF',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Selecione as imagens', text: 'Clique na área de upload ou arraste uma ou mais imagens .jpg, .jpeg ou .png.' },
        { '@type': 'HowToStep', position: 2, name: 'Clique em Converter', text: 'Pressione o botão para combinar todas as imagens em um PDF no seu navegador.' },
        { '@type': 'HowToStep', position: 3, name: 'Baixe o PDF', text: 'O download do PDF com todas as imagens será iniciado automaticamente.' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Posso converter múltiplas imagens em um único PDF?', acceptedAnswer: { '@type': 'Answer', text: `Sim! Você pode selecionar até ${MAX_FILES} imagens de uma vez. Cada imagem ocupa uma página do PDF, com orientação automática.` } },
        { '@type': 'Question', name: 'Quais formatos de imagem são aceitos?', acceptedAnswer: { '@type': 'Answer', text: 'Aceitamos arquivos .jpg, .jpeg e .png.' } },
        { '@type': 'Question', name: 'As imagens ficam com boa qualidade no PDF?', acceptedAnswer: { '@type': 'Answer', text: 'Sim. As imagens são embutidas diretamente no PDF sem compressão adicional, preservando a qualidade original.' } },
        { '@type': 'Question', name: 'Minhas imagens são enviadas para algum servidor?', acceptedAnswer: { '@type': 'Answer', text: 'Não. Todo o processamento acontece diretamente no seu navegador. Suas imagens nunca saem do seu dispositivo.' } },
      ],
    },
  ],
};

const steps = [
  { n: '1', title: 'Selecione as imagens', desc: 'Clique na área de upload ou arraste uma ou mais imagens .jpg, .jpeg ou .png.' },
  { n: '2', title: 'Clique em Converter', desc: 'Todas as imagens são embutidas diretamente no PDF no seu próprio navegador.' },
  { n: '3', title: 'Baixe o PDF', desc: 'O PDF com todas as imagens (uma por página, orientação automática) é baixado automaticamente.' },
];

const faqs = [
  { q: 'Posso converter múltiplas imagens em um único PDF?', a: `Sim! Você pode selecionar até ${MAX_FILES} imagens de uma vez. Cada imagem ocupa uma página do PDF, com orientação automática detectada por imagem.` },
  { q: 'Quais formatos de imagem são aceitos?', a: 'Aceitamos arquivos .jpg, .jpeg e .png.' },
  { q: 'As imagens ficam com boa qualidade no PDF?', a: 'Sim. As imagens são embutidas diretamente no PDF sem compressão adicional, preservando a qualidade original da foto.' },
  { q: 'Minhas imagens são enviadas para algum servidor?', a: 'Não. Todo o processamento acontece diretamente no seu navegador. Suas imagens nunca saem do seu dispositivo.' },
];

export default function JpgParaPdf() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const addFiles = (newFiles) => {
    const imageFiles = Array.from(newFiles).filter((f) => /\.(jpe?g|png)$/i.test(f.name));
    setFiles((prev) => [...prev, ...imageFiles].slice(0, MAX_FILES));
    setError('');
  };

  const handleFileChange = (e) => { if (e.target.files?.length) addFiles(e.target.files); };
  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else setIsDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };
  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleConvert = async () => {
    if (!files.length) return;
    setLoading(true);
    setError('');

    try {
      // Load jsPDF directly — embeds images natively without canvas re-encoding
      const { jsPDF } = await import('jspdf');

      const dataUrls = await Promise.all(files.map(readFileAsDataURL));

      let pdf = null;

      for (let i = 0; i < files.length; i++) {
        const dataUrl = dataUrls[i];
        const { width, height } = await getImageDimensions(dataUrl);

        // Auto-detect orientation: landscape for wide images, portrait for tall
        const isLandscape = width > height;
        const pageW = isLandscape ? 297 : 210; // A4 dimensions in mm
        const pageH = isLandscape ? 210 : 297;

        // Fit image to page (contain: no cropping, preserve aspect ratio)
        const imgRatio = width / height;
        const pageRatio = pageW / pageH;
        let imgW, imgH, x, y;
        if (imgRatio > pageRatio) {
          imgW = pageW;
          imgH = pageW / imgRatio;
          x = 0;
          y = (pageH - imgH) / 2;
        } else {
          imgH = pageH;
          imgW = pageH * imgRatio;
          x = (pageW - imgW) / 2;
          y = 0;
        }

        const format = files[i].name.toLowerCase().endsWith('.png') ? 'PNG' : 'JPEG';

        if (i === 0) {
          pdf = new jsPDF({
            orientation: isLandscape ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [pageW, pageH],
          });
        } else {
          pdf.addPage(
            [pageW, pageH],
            isLandscape ? 'landscape' : 'portrait'
          );
        }

        // addImage embeds the image directly — no lossy canvas re-render
        pdf.addImage(dataUrl, format, x, y, imgW, imgH, undefined, 'FAST');
      }

      const outputName =
        files.length === 1
          ? files[0].name.replace(/\.[^/.]+$/, '') + '.pdf'
          : 'imagens.pdf';

      pdf.save(outputName);
    } catch (err) {
      console.error(err);
      setError('Erro ao processar as imagens. Verifique os arquivos e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <>
      <SEOHead
        title="Converter JPG para PDF Grátis Online — Múltiplas Imagens sem cadastro"
        description="Converta uma ou várias imagens JPG e PNG para PDF com qualidade original, sem cadastro e sem upload. Orientação automática por imagem. Processamento local no navegador."
        path={PAGE_PATH}
        jsonLd={jsonLd}
      />

      <main className="min-h-screen flex flex-col items-center p-8 bg-neutral-950 font-sans pt-28">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-blue-900/10 blur-[100px]"></div>
        </div>

        <nav className="w-full max-w-2xl mb-6 relative z-10" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-neutral-500">
            <li><Link href="/" className="hover:text-neutral-300 transition-colors">Início</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-neutral-300">JPG / PNG para PDF</li>
          </ol>
        </nav>

        <div className="w-full max-w-2xl text-center mb-10 relative z-10">
          <div className="w-16 h-16 bg-blue-900/40 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]">
            <ImageIcon size={32} aria-hidden="true" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">Converter Imagem para PDF</h1>
          <p className="text-lg text-neutral-400">
            Converta uma ou múltiplas imagens .jpg e .png para PDF com qualidade original — orientação automática, sem upload, sem cadastro.
          </p>
        </div>

        <div className="w-full max-w-2xl bg-neutral-900/50 backdrop-blur-md rounded-3xl p-8 border border-neutral-800 shadow-xl relative z-10">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            role="button" tabIndex={0} aria-label="Área de upload de imagens"
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
              ${isDragActive ? 'border-blue-500 bg-blue-900/20' : 'border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/60 hover:border-blue-500/50'}`}
          >
            <input type="file" accept=".jpg,.jpeg,.png" onChange={handleFileChange} multiple className="hidden" ref={fileInputRef} />
            {files.length > 0 ? (
              <>
                <CheckCircle2 size={48} className="text-blue-500 mb-4" aria-hidden="true" />
                <p className="text-lg font-medium text-white text-center">
                  {files.length === 1 ? '1 Imagem Selecionada' : `${files.length} Imagens Selecionadas`}
                </p>
                <p className="text-xs text-neutral-500 mt-1">{formatBytes(totalSize)} no total</p>
                <p className="text-xs text-blue-400 mt-3 hover:underline">Clique para adicionar mais</p>
              </>
            ) : (
              <>
                <FileUp size={48} className="text-neutral-500 mb-4" aria-hidden="true" />
                <p className="text-lg font-medium text-white text-center">Arraste e solte suas imagens aqui</p>
                <p className="text-sm text-neutral-400 mb-4">ou clique para procurar no seu dispositivo</p>
                <span className="px-5 py-2 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-400 text-sm font-semibold pointer-events-none">Selecionar Imagens</span>
                <p className="text-xs text-neutral-600 mt-4">Formatos aceitos: .jpg, .jpeg, .png — até {MAX_FILES} imagens</p>
              </>
            )}
          </div>

          {files.length > 0 && (
            <ul className="mt-4 space-y-2 max-h-48 overflow-y-auto" aria-label="Imagens selecionadas">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center justify-between bg-neutral-800/50 rounded-xl px-4 py-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <ImageIcon size={16} className="text-blue-400 shrink-0" aria-hidden="true" />
                    <span className="text-sm text-neutral-300 truncate">{f.name}</span>
                    <span className="text-xs text-neutral-500 shrink-0">{formatBytes(f.size)}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    aria-label={`Remover ${f.name}`}
                    className="ml-3 text-neutral-500 hover:text-red-400 transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-3 bg-red-900/30 border border-red-500/30 rounded-xl p-4" role="alert">
              <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleConvert}
              disabled={!files.length || loading}
              className={`w-full py-4 text-white text-lg font-bold rounded-2xl transition-all duration-300 flex items-center justify-center
                ${!files.length || loading
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                  : 'bg-blue-600 hover:bg-blue-500 hover:-translate-y-1 shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] border border-blue-500/50'}`}
            >
              {loading ? (
                <span className="flex items-center text-blue-200">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Gerando PDF...
                </span>
              ) : files.length > 1 ? (
                `Combinar ${files.length} Imagens e Baixar PDF`
              ) : (
                'Converter e Baixar PDF'
              )}
            </button>
          </div>
        </div>

        <section className="w-full max-w-4xl mt-20 relative z-10" aria-labelledby="how-to-jpg-heading">
          <h2 id="how-to-jpg-heading" className="text-2xl font-bold text-center text-white mb-10">Como converter imagem para PDF</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-full bg-blue-900/50 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center mb-4 text-lg">{n}</div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-3xl mt-16 mb-16 relative z-10" aria-labelledby="faq-jpg-heading">
          <h2 id="faq-jpg-heading" className="text-2xl font-bold text-center text-white mb-10">Perguntas Frequentes</h2>
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
