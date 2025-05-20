import Head from 'next/head';
import { useState } from 'react';
import styles from '../../styles/Home.module.css';
import * as XLSX from 'xlsx';

export default function ExcelParaPdf() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleConvert = async () => {
        if (!file) return alert('Selecione um arquivo Excel primeiro.');
        setLoading(true);

        const reader = new FileReader();
        reader.onload = async function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Pegando a primeira planilha
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            // Convertendo para tabela HTML
            const html = XLSX.utils.sheet_to_html(worksheet);

            const element = document.createElement('div');
            element.innerHTML = `
  <style>
    table { width: 100%; border-collapse: collapse; font-family: 'Inter', sans-serif; }
    th, td { border: 1px solid #ccc; padding: 8px; color: #000; font-size: 14px; }
    th { background-color: #f0f0f0; font-weight: bold; }
  </style>
  ${html}
`;


            const html2pdf = (await import('html2pdf.js')).default;
            html2pdf()
                .set({
                    margin: 1,
                    filename: file.name.replace(/\.[^/.]+$/, '') + '.pdf',
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
                })
                .from(element)
                .save()
                .finally(() => setLoading(false));
        };

        reader.readAsArrayBuffer(file); // importante!
    };

    return (
        <>
            <Head>
                <title>Converter Excel para PDF Grátis - Online e Sem Login</title>
                <meta name="description" content="Ferramenta gratuita para converter arquivos Excel (.xls, .xlsx) para PDF online, sem necessidade de cadastro. Rápido, simples e ideal para estudantes!" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2458442591696135"
     crossorigin="anonymous"></script>
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Converter Excel para PDF</h1>

                <input
                    type="file"
                    accept=".xls,.xlsx,.csv"
                    onChange={handleFileChange}
                    className={styles.input}
                />

                <button
                    onClick={handleConvert}
                    className={styles.button}
                    style={{
                        opacity: !file || loading ? 0.6 : 1,
                        cursor: !file || loading ? 'not-allowed' : 'pointer',
                    }}
                    disabled={!file || loading}
                >
                    {loading ? 'Convertendo...' : 'Converter para PDF'}
                </button>
            </main>
        </>
    );
}
