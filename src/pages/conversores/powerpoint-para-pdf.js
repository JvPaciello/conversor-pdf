import Head from 'next/head';
import { useState } from 'react';
import styles from '../../styles/Home.module.css';

export default function PowerPointParaPdf() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleConvert = async () => {
    if (!file) return alert('Selecione um arquivo PowerPoint primeiro.');
    setLoading(true);

    alert('Atualmente, não é possível converter arquivos .pptx localmente. Estamos trabalhando para adicionar essa funcionalidade com suporte a uma API externa.');

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Converter PowerPoint para PDF Grátis - Online e Sem Login</title>
        <meta name="description" content="Ferramenta gratuita para converter arquivos PowerPoint (.ppt, .pptx) para PDF. Em breve, conversão real com slides preservados!" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2458442591696135"
     crossorigin="anonymous"></script>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Converter PowerPoint para PDF</h1>

        <input
          type="file"
          accept=".ppt,.pptx"
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
          {loading ? 'Verificando...' : 'Converter para PDF'}
        </button>

        <p style={{ marginTop: '1rem', color: '#666', fontSize: '14px' }}>
          Em breve: conversão real de slides com layout preservado usando tecnologia especializada.
        </p>
      </main>
    </>
  );
}
