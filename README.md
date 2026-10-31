# ConverterPDF BR

[converterpdfbr.com.br](https://www.converterpdfbr.com.br/) converte Word, Excel e imagens para PDF de graça, sem cadastro e **sem enviar arquivos para nenhum servidor**: toda a conversão roda no navegador.

## Conversores

| Rota | Aceita | Como funciona |
| --- | --- | --- |
| `/conversores/word-para-pdf` | `.docx`, `.txt` | O `.docx` é montado com `docx-preview` num iframe isolado, respeitando as quebras de página salvas pelo Word. Cada página é capturada com `html2canvas-pro`, sem cortar linhas ao meio. Também dá para imprimir como PDF com texto selecionável. O `.txt` vira PDF com texto real (UTF-8 ou Windows-1252). |
| `/conversores/excel-para-pdf` | `.xlsx`, `.xls`, `.ods`, `.csv` | Lido com SheetJS e desenhado com `jspdf-autotable`: texto selecionável, uma aba por página, cores de preenchimento, células mescladas, colunas e linhas ocultas, números no formato brasileiro. |
| `/conversores/jpg-para-pdf` | `.jpg`, `.png`, `.webp` | JPG e PNG entram no PDF sem recompressão. Fotos com rotação EXIF são endireitadas. Permite reordenar as imagens e escolher tamanho de página, orientação e margem. |

A página inicial tem um conversor universal que identifica o tipo de arquivo e abre o conversor certo.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, páginas estáticas) e React 19, em TypeScript
- Tailwind CSS v4 com tokens em CSS e tema claro/escuro pelo `prefers-color-scheme`
- `jspdf`, `jspdf-autotable`, `docx-preview`, `html2canvas-pro` e SheetJS (`xlsx`, via CDN oficial), todos carregados sob demanda
- Jest + Testing Library

## Desenvolvimento

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # testes
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run build      # build de produção
```

## Estrutura

```
src/
  app/                 rotas, metadados, sitemap, robots e imagens de Open Graph
  components/          layout e componentes de página
    converter/         interface dos conversores (área de arquivos, opções, resultado)
  lib/
    tools.ts           cadastro dos conversores e textos de cada página
    pdf/               geração de PDF (sem React); testada em Node
```

## Deploy

Hospedado na Vercel, sem variáveis de ambiente. O AdSense é carregado no layout raiz e `public/ads.txt` declara o publisher.
