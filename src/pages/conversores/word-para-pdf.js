import Head from 'next/head';
import { useState } from 'react';
import styles from '../../styles/Home.module.css';

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleConvert = async () => {
    if (!file) return alert('Selecione um arquivo primeiro.');
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async function (e) {
      const content = e.target.result;

      const element = document.createElement('div');
      element.innerHTML = `<pre style="font-size:14px;white-space:pre-wrap; color: #000; font-family: 'Inter', sans-serif;">${content}</pre>`;

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

    reader.readAsText(file);
  };

  return (
    <>
      <Head>
        <title>Converter para PDF Grátis</title>
        <meta name="description" content="Converta arquivos para PDF gratuitamente e sem login. Rápido, simples e ideal para estudantes." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Conversor Word para PDF</h1>

        <input
          type="file"
          accept=".txt,.doc,.docx"
          onChange={handleFileChange}
          className={styles.input}
        />

        <button
          onClick={handleConvert}
          className={styles.button}
          style={{
            opacity: !file || loading ? 0.6 : 1,
            cursor: !file || loading ? 'not-allowed' : 'pointer'
          }}
          disabled={!file || loading}
        >
          {loading ? 'Convertendo...' : 'Converter para PDF'}
        </button>
      </main>
    </>
  );
}
