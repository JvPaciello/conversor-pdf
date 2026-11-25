import { extensionOf } from './format';

export type ToolId = 'word' | 'excel' | 'imagem' | 'editar' | 'juntar';
export type FormatFamily = 'doc' | 'sheet' | 'image' | 'pdf';

export interface FileFormat {
  ext: string;
  family: FormatFamily;
}

export interface Tool {
  id: ToolId;
  path: string;
  name: string;
  navLabel: string;
  family: FormatFamily;
  formats: FileFormat[];
  multiple: boolean;
  headline: string;
  lead: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  steps: { title: string; text: string }[];
  notes: string[];
  faqs: { q: string; a: string }[];
}

const doc = (ext: string): FileFormat => ({ ext, family: 'doc' });
const sheet = (ext: string): FileFormat => ({ ext, family: 'sheet' });
const image = (ext: string): FileFormat => ({ ext, family: 'image' });
const pdf = (ext: string): FileFormat => ({ ext, family: 'pdf' });

export const MAX_IMAGES = 100;
export const MAX_MERGE_FILES = 50;

const DOC_FORMATS = [doc('docx'), doc('txt')];
const SHEET_FORMATS = [sheet('xlsx'), sheet('xls'), sheet('ods'), sheet('csv')];
const IMAGE_FORMATS = [image('jpg'), image('jpeg'), image('png'), image('webp')];

export const TOOLS: Tool[] = [
  {
    id: 'word',
    path: '/conversores/word-para-pdf',
    name: 'Word para PDF',
    navLabel: 'Word',
    family: 'doc',
    formats: DOC_FORMATS,
    multiple: false,
    headline: 'Converter Word para PDF',
    lead: 'Transforme documentos .docx e arquivos de texto em PDF mantendo fontes, tabelas, imagens e quebras de página. A conversão acontece no seu navegador.',
    summary: 'Documentos .docx e .txt, com tabelas, imagens e quebras de página.',
    metaTitle: 'Converter Word para PDF grátis e sem cadastro',
    metaDescription:
      'Converta arquivos Word (.docx) e .txt para PDF online, de graça e sem cadastro. O documento é processado no seu navegador e não é enviado para nenhum servidor.',
    steps: [
      { title: 'Escolha o documento', text: 'Arraste o arquivo .docx ou .txt para a folha ou toque em “Escolher arquivo”.' },
      { title: 'Converta', text: 'Toque em “Converter para PDF”. O documento é montado página por página no seu aparelho.' },
      { title: 'Baixe o PDF', text: 'O download começa sozinho. Se precisar, baixe de novo pelo botão que aparece no fim.' },
    ],
    notes: [
      'Arquivos .doc (Word 97–2003) não são suportados. Abra no Word ou no LibreOffice e use “Salvar como” .docx.',
      'No PDF padrão, cada página vira uma imagem em alta resolução. Para ter texto selecionável, use “Imprimir como PDF” depois da conversão.',
      'Se o documento usa uma fonte que não está instalada no seu aparelho, o navegador usa uma fonte parecida.',
    ],
    faqs: [
      {
        q: 'Posso converter arquivos .doc antigos?',
        a: 'Não. O formato .doc é binário e não pode ser lido com segurança no navegador. Abra o arquivo no Word, Google Docs ou LibreOffice, salve como .docx e converta aqui.',
      },
      {
        q: 'O texto do PDF fica pesquisável?',
        a: 'No download padrão, as páginas são salvas como imagens de alta resolução, o que preserva a aparência do documento. Se precisar copiar ou pesquisar o texto, use “Imprimir como PDF” e escolha “Salvar como PDF” na janela de impressão. Arquivos .txt sempre geram texto selecionável.',
      },
      {
        q: 'A formatação é mantida?',
        a: 'Fontes, cores, tabelas, imagens, cabeçalhos, rodapés e quebras de página do .docx são reproduzidos. Recursos avançados, como caixas de texto flutuantes e gráficos, podem aparecer diferentes do Word.',
      },
      {
        q: 'Meu documento é enviado para algum servidor?',
        a: 'Não. O arquivo é lido e convertido pelo próprio navegador. Nada é enviado para o ConverterPDF BR nem para terceiros.',
      },
    ],
  },
  {
    id: 'excel',
    path: '/conversores/excel-para-pdf',
    name: 'Excel para PDF',
    navLabel: 'Excel',
    family: 'sheet',
    formats: SHEET_FORMATS,
    multiple: false,
    headline: 'Converter Excel para PDF',
    lead: 'Transforme planilhas .xlsx, .xls, .ods e .csv em PDF com tabelas legíveis, cores de preenchimento e células mescladas. Você escolhe quais abas entram no arquivo.',
    summary: 'Planilhas .xlsx, .xls, .ods e .csv, com escolha de abas.',
    metaTitle: 'Converter Excel para PDF grátis e sem cadastro',
    metaDescription:
      'Converta planilhas Excel (.xlsx, .xls), LibreOffice (.ods) e CSV para PDF online e de graça. Escolha as abas, a orientação e ajuste à largura da página. Sem upload.',
    steps: [
      { title: 'Escolha a planilha', text: 'Arraste o arquivo .xlsx, .xls, .ods ou .csv para a folha ou toque em “Escolher arquivo”.' },
      { title: 'Ajuste as opções', text: 'Marque as abas que quer converter, a orientação da página e se a tabela deve caber na largura da folha.' },
      { title: 'Baixe o PDF', text: 'Toque em “Converter para PDF”. O arquivo é gerado no seu aparelho e baixado em seguida.' },
    ],
    notes: [
      'O texto do PDF é selecionável e pesquisável.',
      'Cores de preenchimento, células mescladas, larguras de coluna e linhas e colunas ocultas são respeitadas. Cor e estilo da fonte não são lidos do arquivo.',
      'Gráficos, imagens e comentários da planilha não entram no PDF.',
    ],
    faqs: [
      {
        q: 'Planilhas com várias abas são convertidas?',
        a: 'Sim. Todas as abas com conteúdo aparecem marcadas; desmarque as que não quiser. Cada aba começa em uma página nova.',
      },
      {
        q: 'E se a planilha tiver muitas colunas?',
        a: 'Com “Ajustar à largura da página” ligado, a tabela é reduzida para caber na folha. Desligado, as colunas que sobrarem continuam nas páginas seguintes.',
      },
      {
        q: 'Os números ficam no formato brasileiro?',
        a: 'Sim. Por padrão, valores como 1234.5 aparecem como 1.234,50, seguindo o formato definido na célula. Você pode desligar essa opção.',
      },
      {
        q: 'Arquivos CSV com ponto e vírgula funcionam?',
        a: 'Sim. O separador (vírgula, ponto e vírgula ou tabulação) é detectado automaticamente, e acentos em UTF-8 ou no padrão antigo do Windows são lidos corretamente.',
      },
    ],
  },
  {
    id: 'imagem',
    path: '/conversores/jpg-para-pdf',
    name: 'Imagem para PDF',
    navLabel: 'Imagens',
    family: 'image',
    formats: IMAGE_FORMATS,
    multiple: true,
    headline: 'Converter JPG e PNG para PDF',
    lead: 'Junte fotos e imagens JPG, PNG ou WebP em um único PDF, na ordem que você escolher. Fotos tiradas com o celular ficam na posição certa.',
    summary: 'Uma ou várias fotos JPG, PNG e WebP em um único PDF.',
    metaTitle: 'Converter JPG para PDF grátis: junte várias imagens em um PDF',
    metaDescription:
      'Converta imagens JPG, PNG e WebP para PDF online e de graça. Junte várias fotos em um único arquivo, escolha a ordem, o tamanho da página e as margens. Sem upload.',
    steps: [
      { title: 'Escolha as imagens', text: 'Arraste uma ou várias imagens para a folha ou toque em “Escolher imagens”. Dá para adicionar mais depois.' },
      { title: 'Organize', text: 'Mude a ordem com as setas, remova o que não quiser e escolha o tamanho da página e as margens.' },
      { title: 'Baixe o PDF', text: 'Toque em “Converter para PDF”. Cada imagem vira uma página, e o arquivo é baixado em seguida.' },
    ],
    notes: [
      'Imagens JPG e PNG entram no PDF sem recompressão, com a qualidade original.',
      'Fotos de celular com a rotação salva nos metadados (EXIF) são endireitadas automaticamente.',
      `Até ${MAX_IMAGES} imagens por PDF.`,
    ],
    faqs: [
      {
        q: 'Posso juntar várias imagens em um único PDF?',
        a: `Sim. Selecione até ${MAX_IMAGES} imagens de uma vez ou adicione aos poucos. Cada imagem ocupa uma página, na ordem da lista.`,
      },
      {
        q: 'A qualidade da imagem diminui?',
        a: 'Não. Arquivos JPG e PNG são colocados no PDF como estão. Só imagens WebP e fotos que precisam ser endireitadas são regravadas, em alta qualidade.',
      },
      {
        q: 'Qual tamanho de página devo usar?',
        a: 'A4 é o padrão para documentos no Brasil. “Tamanho da imagem” cria cada página com as proporções exatas da foto, sem bordas.',
      },
      {
        q: 'Minhas fotos são enviadas para algum servidor?',
        a: 'Não. As imagens são lidas e convertidas pelo navegador e não saem do seu aparelho.',
      },
    ],
  },
  {
    id: 'editar',
    path: '/conversores/editar-pdf',
    name: 'Editar PDF',
    navLabel: 'Editar',
    family: 'pdf',
    formats: [pdf('pdf')],
    multiple: false,
    headline: 'Editar PDF online',
    lead: 'Escreva, assine, desenhe, destaque e tape trechos de um PDF. Também dá para girar e excluir páginas. Tudo acontece no seu navegador, sem enviar o arquivo.',
    summary: 'Texto, assinatura, desenhos, destaques e páginas giradas ou excluídas.',
    metaTitle: 'Editar PDF grátis: escreva, assine e destaque no PDF',
    metaDescription:
      'Edite PDF online, de graça e sem cadastro: adicione texto, assinatura e imagens, desenhe, destaque, tape trechos e gire ou exclua páginas. O arquivo não sai do seu aparelho.',
    steps: [
      { title: 'Escolha o PDF', text: 'Arraste o arquivo para a folha ou toque em “Escolher PDF”. As páginas aparecem logo abaixo das ferramentas.' },
      { title: 'Edite', text: 'Escolha uma ferramenta (Texto, Desenhar, Retângulo, Tapar, Destacar ou Imagem) e toque na página. Use “Selecionar” para mover e redimensionar.' },
      { title: 'Salve', text: 'Toque em “Salvar PDF editado”. O arquivo é gerado no seu aparelho e baixado em seguida.' },
    ],
    notes: [
      'As edições são desenhadas por cima da página. O conteúdo original continua no arquivo, com texto selecionável e a qualidade de antes.',
      'Para trocar um trecho de texto, use “Tapar” sobre ele e escreva o novo texto por cima com a ferramenta “Texto”.',
      'O texto adicionado usa a fonte Helvetica. Letras fora do alfabeto latino (como chinês ou árabe) não são suportadas.',
      'PDFs protegidos por senha ou com restrição de edição não podem ser editados.',
    ],
    faqs: [
      {
        q: 'Dá para alterar o texto que já está no PDF?',
        a: 'Não diretamente. Use a ferramenta “Tapar” para cobrir o trecho com um retângulo branco e escreva o texto novo por cima com “Texto”. No arquivo salvo, o trecho tapado fica escondido.',
      },
      {
        q: 'Como assino um PDF?',
        a: 'Use “Desenhar” para assinar com o dedo ou o mouse, ou “Imagem” para colocar uma foto da sua assinatura (PNG com fundo transparente fica melhor). Depois, arraste e redimensione com “Selecionar”.',
      },
      {
        q: 'O tapado esconde o texto de verdade?',
        a: 'Ele cobre o trecho visualmente, mas o texto original continua no arquivo e pode ser copiado. Para dados sigilosos, use um programa de tarjamento (redação) que remova o conteúdo.',
      },
      {
        q: 'Meu PDF é enviado para algum servidor?',
        a: 'Não. O PDF é aberto, editado e salvo pelo próprio navegador. Nada sai do seu aparelho.',
      },
    ],
  },
  {
    id: 'juntar',
    path: '/conversores/juntar-pdf',
    name: 'Juntar PDF',
    navLabel: 'Juntar',
    family: 'pdf',
    formats: [pdf('pdf'), ...DOC_FORMATS, ...SHEET_FORMATS, ...IMAGE_FORMATS],
    multiple: true,
    headline: 'Juntar PDF e outros arquivos em um só PDF',
    lead: 'Combine vários PDFs em um único arquivo, na ordem que você escolher. Dá para misturar documentos Word, planilhas e fotos: eles são convertidos e entram no mesmo PDF.',
    summary: 'Vários PDFs, documentos, planilhas e imagens em um único PDF.',
    metaTitle: 'Juntar PDF grátis: combine vários arquivos em um único PDF',
    metaDescription:
      'Junte vários PDFs em um só arquivo online, de graça e sem cadastro. Misture também Word, Excel e imagens, escolha a ordem e baixe um único PDF. Sem upload.',
    steps: [
      { title: 'Escolha os arquivos', text: 'Arraste PDFs, documentos, planilhas ou imagens para a folha ou toque em “Escolher arquivos”. Dá para adicionar mais depois.' },
      { title: 'Organize', text: 'Coloque os arquivos na ordem certa com as setas e remova o que não quiser.' },
      { title: 'Baixe o PDF', text: 'Toque no botão “Juntar”. As páginas de todos os arquivos são combinadas e o PDF é baixado em seguida.' },
    ],
    notes: [
      'As páginas dos PDFs são copiadas como estão: o texto continua selecionável e as imagens mantêm a qualidade original. Marcadores (sumário lateral) e campos de formulário não são mantidos.',
      'Documentos, planilhas e imagens são convertidos com as opções padrão (A4, todas as abas visíveis da planilha). Para ajustar, converta antes no conversor específico e junte o PDF aqui.',
      `Até ${MAX_MERGE_FILES} arquivos por vez. PDFs protegidos (por senha ou com restrição de edição) não podem ser juntados.`,
    ],
    faqs: [
      {
        q: 'Como juntar vários PDFs em um só?',
        a: 'Selecione os arquivos, coloque na ordem desejada com as setas e toque no botão “Juntar”. O arquivo combinado é baixado em seguida.',
      },
      {
        q: 'Posso juntar PDF com Word, Excel e fotos?',
        a: 'Sim. Arquivos .docx, .txt, .xlsx, .xls, .ods, .csv, .jpg, .png e .webp são convertidos para PDF e entram na posição em que estão na lista.',
      },
      {
        q: 'A qualidade dos PDFs diminui?',
        a: 'Não. As páginas são copiadas sem recompressão, então o texto continua selecionável e as imagens mantêm a resolução original.',
      },
      {
        q: 'Meus arquivos são enviados para algum servidor?',
        a: 'Não. Tudo é lido, convertido e combinado pelo seu navegador. Os arquivos não saem do seu aparelho.',
      },
    ],
  },
];

export const HOME_FAQS = [
  {
    q: 'O ConverterPDF BR é gratuito?',
    a: 'Sim. Todas as ferramentas são gratuitas, sem cadastro e sem limite de uso. O site é mantido por anúncios.',
  },
  {
    q: 'Meus arquivos são enviados para a internet?',
    a: 'Não. A conversão é feita pelo seu navegador, no seu aparelho. Os arquivos não são enviados para o nosso servidor nem para serviços de terceiros.',
  },
  {
    q: 'Quais formatos posso converter?',
    a: 'Documentos Word (.docx) e texto (.txt), planilhas (.xlsx, .xls, .ods, .csv) e imagens (.jpg, .png, .webp). Também dá para juntar vários PDFs, e misturar esses formatos, em um único arquivo, e editar PDFs.',
  },
  {
    q: 'Funciona no celular?',
    a: 'Sim. O site funciona nos navegadores atuais de Android, iPhone, tablets e computadores. Arquivos muito grandes podem demorar mais em aparelhos com pouca memória.',
  },
];

export function getTool(id: ToolId): Tool {
  const tool = TOOLS.find((t) => t.id === id);
  if (!tool) throw new Error(`Ferramenta desconhecida: ${id}`);
  return tool;
}

export function acceptAttr(formats: FileFormat[]): string {
  return formats.map((f) => `.${f.ext}`).join(',');
}

export function matchesFormats(fileName: string, formats: FileFormat[]): boolean {
  const ext = extensionOf(fileName);
  return formats.some((f) => f.ext === ext);
}

export function toolForFile(fileName: string): Tool | undefined {
  return TOOLS.find((t) => matchesFormats(fileName, t.formats));
}

/** Every format, once each. */
export const ACCEPTED_FORMATS: FileFormat[] = TOOLS.flatMap((t) => t.formats).filter(
  (f, i, all) => all.findIndex((g) => g.ext === f.ext) === i,
);

/** Every format, without the jpeg/jpg duplicate, for display. */
export const ALL_FORMATS: FileFormat[] = ACCEPTED_FORMATS.filter((f) => f.ext !== 'jpeg');
