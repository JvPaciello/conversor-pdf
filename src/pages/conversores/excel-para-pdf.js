import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { FileUp, Table, CheckCircle2, AlertCircle } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import Link from 'next/link';

const SITE_URL = 'https://www.converterpdfbr.com.br';
const PAGE_PATH = '/conversores/excel-para-pdf';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Convert ARGB hex (e.g. "FF4472C4") to CSS hex ("#4472C4")
// Returns null if transparent or missing
function argbToHex(argb) {
  if (!argb || argb.length < 6) return null;
  const rgb = argb.slice(-6);
  if (rgb.toLowerCase() === '000000' && argb.toUpperCase().startsWith('00')) return null;
  return `#${rgb}`;
}

function getCellStyle(cell) {
  if (!cell || !cell.s) return '';
  const s = cell.s;
  let css = '';

  if (s.font) {
    if (s.font.bold) css += 'font-weight:bold;';
    if (s.font.italic) css += 'font-style:italic;';
    if (s.font.underline) css += 'text-decoration:underline;';
    if (s.font.sz) css += `font-size:${Math.round(s.font.sz * 0.75)}pt;`;
    const fc = s.font.color?.rgb ? argbToHex(s.font.color.rgb) : null;
    if (fc) css += `color:${fc};`;
  }

  if (s.fill?.fgColor?.rgb) {
    const bg = argbToHex(s.fill.fgColor.rgb);
    if (bg) css += `background-color:${bg};`;
  }

  if (s.alignment) {
    const hMap = { center: 'center', right: 'right', left: 'left', general: '' };
    const h = hMap[s.alignment.horizontal];
    if (h) css += `text-align:${h};`;
    if (s.alignment.wrapText) css += 'white-space:pre-wrap;';
    if (s.alignment.vertical) {
      const vMap = { center: 'middle', top: 'top', bottom: 'bottom' };
      const v = vMap[s.alignment.vertical];
      if (v) css += `vertical-align:${v};`;
    }
  }

  return css;
}

function buildStyledHtml(ws) {
  if (!ws || !ws['!ref']) return '<p style="font-family:Calibri,Arial,sans-serif;color:#000;">Planilha vazia.</p>';

  const range = XLSX.utils.decode_range(ws['!ref']);
  const cols = ws['!cols'] || [];
  const rows = ws['!rows'] || [];
  const merges = ws['!merges'] || [];

  // Build merge lookup
  const skipCells = new Set();
  const mergeSizes = {};
  for (const m of merges) {
    for (let r = m.s.r; r <= m.e.r; r++) {
      for (let c = m.s.c; c <= m.e.c; c++) {
        const key = `${r}_${c}`;
        if (r === m.s.r && c === m.s.c) {
          mergeSizes[key] = { rowspan: m.e.r - m.s.r + 1, colspan: m.e.c - m.s.c + 1 };
        } else {
          skipCells.add(key);
        }
      }
    }
  }

  // Column width definitions
  let colDefs = '';
  for (let c = range.s.c; c <= range.e.c; c++) {
    const col = cols[c];
    // wch = character width; ~7.5px per char is a good approximation
    const w = col?.wch ? `${Math.round(col.wch * 7.5)}px` : '70px';
    colDefs += `<col style="width:${w}">`;
  }

  let bodyRows = '';
  for (let r = range.s.r; r <= range.e.r; r++) {
    const rowInfo = rows[r];
    // hpt = height in points; 1pt ≈ 1.333px
    const rowH = rowInfo?.hpt ? `height:${Math.round(rowInfo.hpt * 1.333)}px;` : 'height:20px;';

    bodyRows += `<tr style="${rowH}">`;
    for (let c = range.s.c; c <= range.e.c; c++) {
      const key = `${r}_${c}`;
      if (skipCells.has(key)) continue;

      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      const val = cell ? XLSX.utils.format_cell(cell) : '';

      const customCss = getCellStyle(cell);
      const mergeSize = mergeSizes[key];
      const mergeAttrs = mergeSize ? ` rowspan="${mergeSize.rowspan}" colspan="${mergeSize.colspan}"` : '';
      const baseCss = 'border:1px solid #d1d5db;padding:4px 6px;overflow:hidden;vertical-align:middle;';

      bodyRows += `<td${mergeAttrs} style="${baseCss}${customCss}">${escapeHtml(val)}</td>`;
    }
    bodyRows += '</tr>';
  }

  return `
    <div style="font-family:Calibri,Arial,sans-serif;font-size:10pt;background:#fff;padding:12px;">
      <table style="border-collapse:collapse;width:max-content;min-width:100%;">
        <colgroup>${colDefs}</colgroup>
        ${bodyRows}
      </table>
    </div>`;
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Excel para PDF', item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Converter Excel para PDF — ConverterPDF BR',
      url: `${SITE_URL}${PAGE_PATH}`,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      featureList: [
        'Converte .xls, .xlsx e .csv para PDF preservando estilos',
        'Mantém larguras de colunas, cores de células e mesclagens',
        'Processamento local no navegador sem upload',
      ],
      description: 'Converta planilhas Excel (.xls, .xlsx, .csv) para PDF com fidelidade total: larguras, cores, bordas e formatação preservados.',
    },
    {
      '@type': 'HowTo',
      name: 'Como converter Excel para PDF',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Selecione a planilha', text: 'Clique na área de upload ou arraste seu arquivo .xls, .xlsx ou .csv.' },
        { '@type': 'HowToStep', position: 2, name: 'Clique em Converter', text: 'Pressione o botão para iniciar a conversão no seu próprio navegador.' },
        { '@type': 'HowToStep', position: 3, name: 'Baixe o PDF', text: 'O PDF com as tabelas formatadas será baixado automaticamente.' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Quais formatos de planilha são suportados?', acceptedAnswer: { '@type': 'Answer', text: 'Aceitamos .xls, .xlsx (Microsoft Excel) e .csv.' } },
        { '@type': 'Question', name: 'Planilhas com múltiplas abas são convertidas?', acceptedAnswer: { '@type': 'Answer', text: 'Atualmente apenas a primeira aba da planilha é convertida para PDF.' } },
        { '@type': 'Question', name: 'O PDF mantém a formatação da planilha?', acceptedAnswer: { '@type': 'Answer', text: 'Sim. Larguras de colunas, cores de células, negrito, itálico, mesclagens e alinhamentos são preservados.' } },
        { '@type': 'Question', name: 'Minha planilha é enviada para algum servidor?', acceptedAnswer: { '@type': 'Answer', text: 'Não. Todo o processamento ocorre diretamente no seu navegador.' } },
      ],
    },
  ],
};

const steps = [
  { n: '1', title: 'Selecione a planilha', desc: 'Clique na área de upload ou arraste seu arquivo .xls, .xlsx ou .csv.' },
  { n: '2', title: 'Clique em Converter', desc: 'Pressione o botão para iniciar a conversão no seu próprio navegador.' },
  { n: '3', title: 'Baixe o PDF', desc: 'O PDF com as tabelas e estilos preservados será baixado automaticamente.' },
];

const faqs = [
  { q: 'Quais formatos de planilha são suportados?', a: 'Aceitamos arquivos .xls, .xlsx (Microsoft Excel) e .csv (valores separados por vírgula).' },
  { q: 'Planilhas com múltiplas abas são convertidas?', a: 'Atualmente apenas a primeira aba da planilha é convertida para PDF.' },
  { q: 'O PDF mantém a formatação da planilha?', a: 'Sim. Larguras de colunas, cores de células, negrito, itálico, mesclagens e alinhamentos são todos preservados no PDF gerado.' },
  { q: 'Minha planilha é enviada para algum servidor?', a: 'Não. Todo o processamento ocorre diretamente no seu navegador. Nenhum dado é enviado para servidores externos.' },
];

export default function ExcelParaPdf() {
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

    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      // cellStyles: true extracts bold, italic, colors, alignment, borders
      const workbook = XLSX.read(data, { type: 'array', cellStyles: true, cellDates: true });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const styledHtml = buildStyledHtml(worksheet);

      const element = document.createElement('div');
      element.innerHTML = styledHtml;

      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf()
        .set({
          margin: 8,
          filename: file.name.replace(/\.[^/.]+$/, '') + '.pdf',
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            scrollX: 0,
            scrollY: 0,
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        })
        .from(element)
        .save();
    } catch (err) {
      console.error(err);
      setError('Erro ao processar a planilha. Verifique se o arquivo não está corrompido e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Converter Excel para PDF Grátis Online — .xls, .xlsx e .csv sem cadastro"
        description="Converta planilhas Excel (.xls, .xlsx, .csv) para PDF com fidelidade total: larguras de colunas, cores, bordas e formatação preservados. Sem cadastro, sem upload."
        path={PAGE_PATH}
        jsonLd={jsonLd}
      />

      <main className="min-h-screen flex flex-col items-center p-8 bg-neutral-950 font-sans pt-28">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-emerald-900/10 blur-[100px]"></div>
        </div>

        <nav className="w-full max-w-2xl mb-6 relative z-10" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-neutral-500">
            <li><Link href="/" className="hover:text-neutral-300 transition-colors">Início</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-neutral-300">Excel para PDF</li>
          </ol>
        </nav>

        <div className="w-full max-w-2xl text-center mb-10 relative z-10">
          <div className="w-16 h-16 bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
            <Table size={32} aria-hidden="true" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">Converter Excel para PDF</h1>
          <p className="text-lg text-neutral-400">
            Transforme planilhas .xls, .xlsx e .csv em PDF com larguras, cores e formatação preservadas — sem upload, sem cadastro.
          </p>
        </div>

        <div className="w-full max-w-2xl bg-neutral-900/50 backdrop-blur-md rounded-3xl p-8 border border-neutral-800 shadow-xl relative z-10">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            role="button" tabIndex={0} aria-label="Área de upload de planilha Excel"
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
              ${isDragActive ? 'border-emerald-500 bg-emerald-900/20' : 'border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/60 hover:border-emerald-500/50'}`}
          >
            <input type="file" accept=".xls,.xlsx,.csv" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
            {file ? (
              <>
                <CheckCircle2 size={48} className="text-emerald-500 mb-4" aria-hidden="true" />
                <p className="text-lg font-medium text-white text-center">Planilha Selecionada</p>
                <p className="text-sm text-neutral-400 truncate max-w-sm text-center">{file.name}</p>
                <p className="text-xs text-neutral-500 mt-1">{formatBytes(file.size)}</p>
                <p className="text-xs text-emerald-400 mt-3 hover:underline">Clique para trocar</p>
              </>
            ) : (
              <>
                <FileUp size={48} className="text-neutral-500 mb-4" aria-hidden="true" />
                <p className="text-lg font-medium text-white text-center">Arraste e solte o arquivo aqui</p>
                <p className="text-sm text-neutral-400 mb-4">ou clique para procurar no seu dispositivo</p>
                <span className="px-5 py-2 rounded-full bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 text-sm font-semibold pointer-events-none">Selecionar Planilha</span>
                <p className="text-xs text-neutral-600 mt-4">Formatos aceitos: .xls, .xlsx, .csv</p>
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
                  : 'bg-emerald-600 hover:bg-emerald-500 hover:-translate-y-1 shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] border border-emerald-500/50'}`}
            >
              {loading ? (
                <span className="flex items-center text-emerald-200">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Convertendo Planilha...
                </span>
              ) : 'Converter e Baixar PDF'}
            </button>
          </div>
        </div>

        <section className="w-full max-w-4xl mt-20 relative z-10" aria-labelledby="how-to-excel-heading">
          <h2 id="how-to-excel-heading" className="text-2xl font-bold text-center text-white mb-10">Como converter Excel para PDF</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-full bg-emerald-900/50 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center mb-4 text-lg">{n}</div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-3xl mt-16 mb-16 relative z-10" aria-labelledby="faq-excel-heading">
          <h2 id="faq-excel-heading" className="text-2xl font-bold text-center text-white mb-10">Perguntas Frequentes</h2>
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
