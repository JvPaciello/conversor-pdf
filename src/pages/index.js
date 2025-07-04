import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <>
      <Head>
        <title>Conversor de Arquivos para PDF Grátis</title>
        <meta
          name="description"
          content="Converta Word, Excel, PowerPoint e Imagens para PDF gratuitamente, sem login. Simples, rápido e ideal para estudantes!"
        />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2458442591696135"
          crossorigin="anonymous"></script>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Converter Arquivos para PDF</h1>
        <p className={styles.description}>
          Escolha o tipo de conversão abaixo. Rápido, gratuito e sem necessidade de login.
        </p>

        <p className={styles.description}>
          O <strong>Converter PDF BR</strong> é uma ferramenta gratuita que permite converter arquivos de forma rápida e segura.
          Não armazenamos arquivos e garantimos sua privacidade. Aproveite!
        </p>


        <div className={styles.grid}>
          <Link href="/conversores/word-para-pdf" className={styles.card}>
            <h2>Word → PDF</h2>
            <p>Converta documentos .doc ou .docx em PDF</p>
          </Link>

          <Link href="/conversores/excel-para-pdf" className={styles.card}>
            <h2>Excel → PDF</h2>
            <p>Transforme suas planilhas em arquivos PDF</p>
          </Link>

          <Link href="/conversores/jpg-para-pdf" className={styles.card}>
            <h2>JPG → PDF</h2>
            <p>Imagens transformadas em documentos PDF</p>
          </Link>
        </div>
      </main>
    </>
  );
}
