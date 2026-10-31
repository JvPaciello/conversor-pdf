import { DocPage } from '@/components/doc-page';
import { pageMetadata } from '@/lib/metadata';
import { SITE } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Termos de uso',
  description: 'Condições para usar as ferramentas gratuitas de conversão para PDF do ConverterPDF BR.',
  path: '/termos-de-uso',
});

export default function TermsOfUse() {
  return (
    <DocPage title="Termos de uso" updated="30 de outubro de 2026">
      <p>
        Ao usar o {SITE.name}, você concorda com estes termos. Se não concordar, não use o site.
      </p>

      <h2>O serviço</h2>
      <p>
        O {SITE.name} oferece ferramentas gratuitas para converter documentos, planilhas e imagens em PDF. A conversão
        é feita pelo seu navegador, no seu aparelho. O site pode mudar, ficar fora do ar ou deixar de oferecer alguma
        ferramenta a qualquer momento, sem aviso prévio.
      </p>

      <h2>Uso permitido</h2>
      <ul>
        <li>Use as ferramentas apenas para fins lícitos.</li>
        <li>Você é responsável pelo conteúdo dos arquivos que converte e por ter o direito de usá-los.</li>
        <li>Não tente interferir no funcionamento do site nem usá-lo de forma automatizada em grande escala.</li>
      </ul>

      <h2>Resultado das conversões</h2>
      <p>
        Os PDFs são gerados da forma como estão, sem garantia de que fiquem idênticos ao arquivo original. Fontes que
        não estão instaladas no seu aparelho, recursos avançados de formatação e arquivos danificados podem causar
        diferenças. <strong>Confira o PDF antes de usá-lo</strong> em situações importantes, como protocolos, processos
        seletivos ou documentos oficiais, e guarde sempre uma cópia do arquivo original.
      </p>

      <h2>Limitação de responsabilidade</h2>
      <p>
        Na máxima extensão permitida pela lei, o {SITE.name} não se responsabiliza por perdas ou danos decorrentes do
        uso ou da impossibilidade de uso das ferramentas, incluindo erros de conversão e perda de dados.
      </p>

      <h2>Anúncios</h2>
      <p>
        O site exibe anúncios de terceiros para se manter gratuito. Não controlamos nem endossamos os produtos e
        serviços anunciados.
      </p>

      <h2>Propriedade intelectual</h2>
      <p>
        O nome, o visual e o código do {SITE.name} pertencem aos seus responsáveis. Os arquivos que você converte
        continuam sendo seus.
      </p>

      <h2>Alterações e lei aplicável</h2>
      <p>
        Estes termos podem ser atualizados a qualquer momento; a data no topo indica a versão em vigor. Eles são regidos
        pelas leis da República Federativa do Brasil.
      </p>

      <h2>Contato</h2>
      <p>
        Dúvidas sobre estes termos podem ser enviadas para <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </DocPage>
  );
}
