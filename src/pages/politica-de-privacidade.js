import Head from 'next/head';

export default function PoliticaDePrivacidade() {
  return (
    <>
      <Head>
        <title>Política de Privacidade - Converter PDF</title>
        <meta name="description" content="Leia nossa Política de Privacidade." />
      </Head>
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-r from-neutral-200 to-white font-sans pt-24">
        <h1 className="text-3xl font-bold mb-6 text-neutral-800 text-center">Política de Privacidade</h1>
        <p className="text-lg text-neutral-600 text-center mb-8 max-w-2xl">
          Este site respeita a sua privacidade. Não coletamos dados pessoais sensíveis.
          As conversões são realizadas localmente no seu navegador e nenhum arquivo é armazenado.
          Utilizamos cookies apenas para fins analíticos e publicitários, conforme as normas do Google AdSense.
        </p>
      </main>
    </>
  );
}
