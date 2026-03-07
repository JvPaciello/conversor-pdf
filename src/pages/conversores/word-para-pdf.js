import Head from 'next/head';
import { useState, useRef } from 'react';
import { FileUp, FileText, CheckCircle2 } from 'lucide-react';

export default function WordParaPdf() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    else setIsDragActive(false);
  };

  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleConvert = async () => {
    if (!file) return alert('Selecione um arquivo primeiro.');
    setLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async function (e) {
        try {
          const arrayBuffer = e.target.result;
          
          let htmlContent = '';
          if (file.name.endsWith('.txt')) {
            const text = new TextDecoder("utf-8").decode(arrayBuffer);
            htmlContent = `<pre style="white-space:pre-wrap;">${text}</pre>`;
          } else {
            const mammothBrowser = await import('mammoth/mammoth.browser.min.js');
            const mammoth = mammothBrowser.default || window.mammoth;
            
            const result = await mammoth.convertToHtml({ arrayBuffer });
            htmlContent = result.value || '<p>Documento vazio.</p>';
          }

          const element = document.createElement('div');
          // Add white background for PDF saving context explicitly inside the html snippet
          element.innerHTML = `<div style="font-family: Arial, sans-serif; font-size: 11pt; color: #000; padding: 20px; background: #fff;">${htmlContent}</div>`;

          const html2pdf = (await import('html2pdf.js')).default;

          html2pdf()
            .set({
              margin: 10,
              filename: file.name.replace(/\.[^/.]+$/, '') + '.pdf',
              html2canvas: { scale: 2 },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            })
            .from(element)
            .save()
            .finally(() => setLoading(false));
            
        } catch (innerError) {
          console.error(innerError);
          alert("Erro interno ao processar o conteúdo do arquivo.");
          setLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro ao ler o arquivo.");
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Converter Word para PDF Grátis</title>
        <meta name="description" content="Converta arquivos .doc e .docx para PDF de forma rápida e segura. Solução privada que processa tudo em seu navegador." />
      </Head>

      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-neutral-950 font-sans pt-28">
        
        {/* Decorative elements matching index */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-teal-900/10 blur-[100px]"></div>
        </div>

        <div className="w-full max-w-2xl text-center mb-10 relative z-10">
          <div className="w-16 h-16 bg-teal-900/40 border border-teal-500/30 text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-5px_rgba(20,184,166,0.3)]">
            <FileText size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">Conversor Word para PDF</h1>
          <p className="text-lg text-neutral-400">Transforme rapidamente documentos de texto (.doc, .docx, .txt) em formato PDF limpo e formatado.</p>
        </div>

        <div className="w-full max-w-2xl bg-neutral-900/50 backdrop-blur-md rounded-3xl p-8 border border-neutral-800 shadow-xl relative z-10">
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 
            ${isDragActive ? "border-teal-500 bg-teal-900/20" : "border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/60 hover:border-teal-500/50"}`}
          >
            <input 
              type="file" 
              accept=".txt,.doc,.docx" 
              onChange={handleFileChange} 
              className="hidden" 
              ref={fileInputRef}
            />
            {file ? (
              <>
                <CheckCircle2 size={48} className="text-teal-500 mb-4" />
                <p className="text-lg font-medium text-white text-center">Arquivo Selecionado</p>
                <p className="text-sm text-neutral-400 mb-2 truncate max-w-sm text-center">{file.name}</p>
                <p className="text-xs text-teal-400 mt-2 hover:underline">Clique para trocar</p>
              </>
            ) : (
              <>
                <FileUp size={48} className="text-neutral-500 mb-4" />
                <p className="text-lg font-medium text-white text-center">Arraste e solte o arquivo aqui</p>
                <p className="text-sm text-neutral-400 mb-4">ou clique para procurar no seu dispositivo</p>
                <span className="px-5 py-2 rounded-full bg-teal-900/40 border border-teal-500/30 text-teal-400 text-sm font-semibold pointer-events-none">Selecionar Arquivo</span>
              </>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={handleConvert}
              className={`w-full py-4 text-white text-lg font-bold rounded-2xl transition-all duration-300 flex items-center justify-center
                ${!file || loading 
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700" 
                  : "bg-teal-600 hover:bg-teal-500 hover:-translate-y-1 shadow-[0_0_20px_-5px_rgba(20,184,166,0.5)] border border-teal-500/50"}`}
              disabled={!file || loading}
            >
              {loading ? (
                <span className="flex items-center text-teal-200">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-teal-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Convertendo Documento...
                </span>
              ) : 'Converter e Baixar PDF'}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
