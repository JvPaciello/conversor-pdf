import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Contato() {
  return (
    <>
      <Head>
        <title>Contato - Converter PDF</title>
        <meta name="description" content="Entre em contato conosco." />
      </Head>
      <main className={styles.main}>

        <h1 className={styles.title}>Contato</h1>

        <p className={styles.description}>
          Caso tenha dúvidas ou sugestões, entre em contato pelo email: joaovictorpaciello@gmail.com
        </p>

        <p className={styles.description}>
          Estamos sempre abertos a feedbacks e melhorias para oferecer a melhor experiência possível.
          Sua opinião é muito importante para nós!
        </p>

      </main>
    </>
  );
}
