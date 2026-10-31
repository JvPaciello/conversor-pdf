import { DocPage } from '@/components/doc-page';
import { pageMetadata } from '@/lib/metadata';
import { SITE } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Política de privacidade',
  description:
    'Como o ConverterPDF BR trata seus dados: os arquivos são convertidos no seu navegador e não são enviados. Saiba quais dados de navegação e cookies usamos.',
  path: '/politica-de-privacidade',
});

export default function PrivacyPolicy() {
  return (
    <DocPage title="Política de privacidade" updated="30 de outubro de 2026">
      <p>
        Esta política explica quais dados o {SITE.name} coleta, por que coleta e quais são os seus direitos, de acordo
        com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
      </p>

      <h2>Os arquivos que você converte</h2>
      <p>
        <strong>Seus arquivos não são enviados para nenhum servidor.</strong> A leitura do documento e a criação do PDF
        acontecem no seu navegador, no seu próprio aparelho. Não recebemos, armazenamos nem temos acesso ao conteúdo dos
        arquivos. Quando você fecha ou recarrega a página, eles deixam a memória do navegador.
      </p>

      <h2>Dados coletados automaticamente</h2>
      <ul>
        <li>
          <strong>Estatísticas de acesso:</strong> usamos o Vercel Analytics para saber quais páginas são visitadas,
          de quais países e com quais tipos de aparelho e navegador. Os dados são agregados, não usam cookies e não
          identificam você.
        </li>
        <li>
          <strong>Registros técnicos:</strong> a empresa de hospedagem (Vercel) registra dados como endereço IP, data e
          hora de cada acesso para manter o site funcionando e protegido contra abusos.
        </li>
      </ul>

      <h2>Cookies e anúncios</h2>
      <p>
        O site é gratuito e mantido por anúncios do Google AdSense. O Google e seus parceiros usam cookies para exibir
        anúncios, medir resultados e, quando permitido, personalizar anúncios com base nas suas visitas a este e a
        outros sites. Saiba mais em{' '}
        <a href="https://policies.google.com/technologies/ads?hl=pt-BR" rel="noopener" target="_blank">
          Como o Google usa cookies em publicidade
        </a>
        .
      </p>
      <p>
        Você pode desativar a personalização de anúncios na{' '}
        <a href="https://myadcenter.google.com/?hl=pt-BR" rel="noopener" target="_blank">
          Minha Central de Anúncios do Google
        </a>{' '}
        e apagar ou bloquear cookies nas configurações do seu navegador.
      </p>
      <p>
        Quando você toca em “Entendi” no aviso de cookies, guardamos essa escolha no armazenamento local do seu
        navegador apenas para não mostrar o aviso de novo.
      </p>

      <h2>Por que tratamos esses dados</h2>
      <p>
        As estatísticas e os registros técnicos são tratados com base no legítimo interesse de manter, proteger e
        melhorar o site. Os cookies de publicidade personalizada dependem do seu consentimento, que pode ser retirado a
        qualquer momento pelas opções acima.
      </p>

      <h2>Compartilhamento</h2>
      <p>
        Não vendemos dados. Os únicos terceiros envolvidos são a Vercel (hospedagem e estatísticas) e o Google
        (anúncios), cada um com sua própria política de privacidade.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Pela LGPD, você pode pedir a confirmação de que tratamos seus dados, acesso, correção, anonimização ou
        eliminação, informações sobre compartilhamento e a revogação do consentimento. Como não pedimos cadastro, na
        maioria dos casos não temos dados que identifiquem você. Para qualquer pedido, escreva para{' '}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>

      <h2>Mudanças nesta política</h2>
      <p>
        Esta política pode ser atualizada quando o site mudar. A data da última atualização fica sempre no topo da
        página.
      </p>
    </DocPage>
  );
}
