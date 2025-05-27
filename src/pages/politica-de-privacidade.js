import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function PoliticaDePrivacidade() {
  return (
    <>
      <Head>
        <title>Política de Privacidade - Converter PDF</title>
        <meta name="description" content="Leia nossa Política de Privacidade." />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Política de Privacidade</h1>
        <p className = {styles.description}>
          Este site respeita a sua privacidade. Não coletamos dados pessoais sensíveis.
          As conversões são realizadas localmente no seu navegador e nenhum arquivo é armazenado.
          Utilizamos cookies apenas para fins analíticos e publicitários, conforme as normas do Google AdSense.
        </p>
      </main>
    </>
  );
}
