import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function TermosDeUso() {
  return (
    <>
      <Head>
        <title>Termos de Uso - Converter PDF</title>
        <meta name="description" content="Leia nossos Termos de Uso." />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Termos de Uso</h1>
        <p className={styles.description}>
          Ao utilizar este site, você concorda com os nossos termos. 
          Não nos responsabilizamos por eventuais perdas ou danos decorrentes do uso das ferramentas.
          O site oferece serviços gratuitos, mas podem conter anúncios para manter a operação.
        </p>
      </main>
    </>
  );
}
