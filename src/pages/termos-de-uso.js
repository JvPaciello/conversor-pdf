import Head from 'next/head';

export default function TermosDeUso() {
  return (
    <>
      <Head>
        <title>Termos de Uso - Converter PDF</title>
        <meta name="description" content="Leia nossos Termos de Uso." />
      </Head>
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-r from-neutral-200 to-white font-sans pt-24">
        <h1 className="text-3xl font-bold mb-6 text-neutral-800 text-center">Termos de Uso</h1>
        <p className="text-lg text-neutral-600 text-center mb-8 max-w-2xl">
          Ao utilizar este site, você concorda com os nossos termos. 
          Não nos responsabilizamos por eventuais perdas ou danos decorrentes do uso das ferramentas.
          O site oferece serviços gratuitos, mas podem conter anúncios para manter a operação.
        </p>
      </main>
    </>
  );
}
