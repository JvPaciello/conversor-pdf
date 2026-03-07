import Head from 'next/head';
import { useState, useRef } from 'react';
import { FileUp, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

export default function JpgParaPdf() {
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
    if (!file) return alert('Selecione uma imagem primeiro.');
    setLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async function (e) {
        const imgDataUrl = e.target.result;

        const element = document.createElement('div');
        element.innerHTML = `<img src="${imgDataUrl}" style="width:100%; height:auto;" />`;

        const html2pdf = (await import('html2pdf.js')).default;
        html2pdf()
          .set({
            margin: 0,
            filename: file.name.replace(/\.[^/.]+$/, '') + '.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          })
          .from(element)
          .save()
          .finally(() => setLoading(false));
      };

      reader.readAsDataURL(file);
    } catch (error) {
      alert("Ocorreu um erro ao processar a imagem.");
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Converter JPG para PDF Grátis</title>
        <meta name="description" content="Converta imagens JPG ou PNG para PDF gratuitamente, sem precisar se cadastrar. Ferramenta simples e rápida, ideal para estudantes." />
      </Head>

      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-neutral-950 font-sans pt-28">
        
        {/* Decorative elements matching index */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-blue-900/10 blur-[100px]"></div>
        </div>

        <div className="w-full max-w-2xl text-center mb-10 relative z-10">
          <div className="w-16 h-16 bg-blue-900/40 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]">
            <ImageIcon size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">Conversor de Imagem para PDF</h1>
          <p className="text-lg text-neutral-400">Gere um documento PDF limpo e formatado a partir de suas fotos e imagens (.png, .jpg, .jpeg).</p>
        </div>

        <div className="w-full max-w-2xl bg-neutral-900/50 backdrop-blur-md rounded-3xl p-8 border border-neutral-800 shadow-xl relative z-10">
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 
            ${isDragActive ? "border-blue-500 bg-blue-900/20" : "border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/60 hover:border-blue-500/50"}`}
          >
            <input 
              type="file" 
              accept=".jpg,.jpeg,.png" 
              onChange={handleFileChange} 
              className="hidden" 
              ref={fileInputRef}
            />
            {file ? (
              <>
                <CheckCircle2 size={48} className="text-blue-500 mb-4" />
                <p className="text-lg font-medium text-white text-center">Imagem Selecionada</p>
                <p className="text-sm text-neutral-400 mb-2 truncate max-w-sm text-center">{file.name}</p>
                <p className="text-xs text-blue-400 mt-2 hover:underline">Clique para trocar</p>
              </>
            ) : (
              <>
                <FileUp size={48} className="text-neutral-500 mb-4" />
                <p className="text-lg font-medium text-white text-center">Arraste e solte sua imagem aqui</p>
                <p className="text-sm text-neutral-400 mb-4">ou clique para procurar no seu dispositivo</p>
                <span className="px-5 py-2 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-400 text-sm font-semibold pointer-events-none">Selecionar Imagem</span>
              </>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={handleConvert}
              className={`w-full py-4 text-white text-lg font-bold rounded-2xl transition-all duration-300 flex items-center justify-center
                ${!file || loading 
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700" 
                  : "bg-blue-600 hover:bg-blue-500 hover:-translate-y-1 shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] border border-blue-500/50"}`}
              disabled={!file || loading}
            >
              {loading ? (
                <span className="flex items-center text-blue-200">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando Imagem...
                </span>
              ) : 'Converter e Baixar PDF'}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
