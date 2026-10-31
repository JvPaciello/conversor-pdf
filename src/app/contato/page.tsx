import { Mail } from 'lucide-react';
import { DocPage } from '@/components/doc-page';
import { pageMetadata } from '@/lib/metadata';
import { SITE } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Contato',
  description: 'Fale com o ConverterPDF BR para tirar dúvidas, relatar problemas ou sugerir melhorias.',
  path: '/contato',
});

export default function Contact() {
  return (
    <DocPage title="Contato">
      <p>Tem uma dúvida, encontrou um problema ou quer sugerir um novo conversor? Escreva para:</p>
      <p>
        <a
          href={`mailto:${SITE.email}`}
          className="inline-flex items-center gap-2 text-lg font-semibold no-underline hover:underline"
        >
          <Mail aria-hidden size={20} />
          {SITE.email}
        </a>
      </p>

      <h2>Para relatar um problema</h2>
      <p>Ajuda muito saber:</p>
      <ul>
        <li>qual conversor você usou e o tipo do arquivo (por exemplo, .docx ou .xlsx);</li>
        <li>o navegador e o aparelho (por exemplo, Chrome no Android ou Safari no iPhone);</li>
        <li>o que aconteceu: uma mensagem de erro, uma página em branco ou uma diferença no PDF.</li>
      </ul>
      <p>
        Não envie arquivos com dados pessoais ou confidenciais. Se precisar mostrar o problema, prefira um arquivo de
        exemplo sem informações sensíveis.
      </p>
    </DocPage>
  );
}
