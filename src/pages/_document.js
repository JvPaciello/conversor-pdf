import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="pt-BR" className="dark">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body className="antialiased bg-neutral-950 text-neutral-50 overflow-x-hidden">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
