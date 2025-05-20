import Head from 'next/head';
import { useState } from 'react';
import styles from '../../styles/Home.module.css';

export default function JpgParaPdf() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleConvert = async () => {
    if (!file) return alert('Selecione uma imagem primeiro.');
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async function (e) {
      const imgDataUrl = e.target.result;

      const element = document.createElement('div');
      element.innerHTML = `<img src="${imgDataUrl}" style="width:100%; max-width:700px;" />`;

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
  };

  return (
    <>
      <Head>
        <title>Converter JPG para PDF Grátis - Online e Sem Login</title>
        <meta name="description" content="Converta imagens JPG ou PNG para PDF gratuitamente, sem precisar se cadastrar. Ferramenta simples e rápida, ideal para estudantes." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2458442591696135"
     crossorigin="anonymous"></script>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Converter JPG para PDF</h1>

        <input
          type="file"
          accept=".jpg,.jpeg,.png"
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
