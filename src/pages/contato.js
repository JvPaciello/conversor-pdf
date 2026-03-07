import Head from 'next/head';

export default function Contato() {
  return (
    <>
      <Head>
        <title>Contato - Converter PDF</title>
        <meta name="description" content="Entre em contato conosco." />
      </Head>
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-r from-neutral-200 to-white font-sans pt-24">

        <h1 className="text-3xl font-bold mb-6 text-neutral-800 text-center">Contato</h1>

        <p className="text-lg text-neutral-600 text-center mb-8 max-w-2xl">
          Caso tenha dúvidas ou sugestões, entre em contato pelo email: joaovictorpaciello@gmail.com
        </p>

        <p className="text-lg text-neutral-600 text-center mb-8 max-w-2xl">
          Estamos sempre abertos a feedbacks e melhorias para oferecer a melhor experiência possível.
          Sua opinião é muito importante para nós!
        </p>

      </main>
    </>
  );
}
