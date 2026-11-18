import { extensionOf } from '@/lib/format';
import { mergePdfs, type PdfSource, type ProgressFn } from './merge-pdf';
import { ConversionError, type PdfResult } from './result';

const SHEETS = new Set(['xlsx', 'xls', 'ods', 'csv']);
const IMAGES = new Set(['jpg', 'jpeg', 'png', 'webp']);

/**
 * Turns every file into a PDF with each converter's default options, then
 * joins them, in order, into one document. Progress counts files.
 */
export async function filesToPdf(files: File[], onProgress?: ProgressFn): Promise<PdfResult> {
  const total = files.length + 1; // the final merge counts as one step
  const sources: PdfSource[] = [];
  onProgress?.(0, total);
  for (const [index, file] of files.entries()) {
    sources.push({ name: file.name, bytes: await toPdfBytes(file) });
    onProgress?.(index + 1, total);
  }
  const result = await mergePdfs(sources);
  onProgress?.(total, total);
  return result;
}

async function toPdfBytes(file: File): Promise<ArrayBuffer> {
  const ext = extensionOf(file.name);
  if (ext === 'pdf') return file.arrayBuffer();
  try {
    const { blob } = await convert(file, ext);
    return blob.arrayBuffer();
  } catch (error) {
    if (error instanceof ConversionError) {
      throw new ConversionError(`“${file.name}”: ${error.message}`);
    }
    throw new ConversionError(
      `Não foi possível converter “${file.name}”. Ele pode estar corrompido, protegido por senha ou ter uma extensão que não corresponde ao conteúdo.`,
    );
  }
}

async function convert(file: File, ext: string): Promise<PdfResult> {
  if (IMAGES.has(ext)) {
    const { imagesToPdf } = await import('./images-to-pdf');
    return imagesToPdf([file], { pageSize: 'a4', orientation: 'auto', margin: 'small' });
  }
  if (SHEETS.has(ext)) {
    const [{ readWorkbook, workbookToPdf }, { listSheets }] = await Promise.all([
      import('./excel-to-pdf'),
      import('./sheet-table'),
    ]);
    const workbook = readWorkbook(new Uint8Array(await file.arrayBuffer()), file.name);
    const sheets = listSheets(workbook)
      .filter((s) => !s.hidden && !s.empty)
      .map((s) => s.name);
    if (sheets.length === 0) throw new ConversionError('A planilha não tem dados para converter.');
    return workbookToPdf(workbook, {
      sheets,
      orientation: 'auto',
      fitWidth: true,
      repeatFirstRow: false,
      brazilianNumbers: true,
    });
  }
  if (ext === 'txt') {
    const [{ textToPdf }, { decodeText }] = await Promise.all([import('./text-to-pdf'), import('./win-ansi')]);
    return textToPdf(decodeText(new Uint8Array(await file.arrayBuffer())));
  }
  if (ext === 'docx') {
    const { renderDocx, renderedDocxToPdf } = await import('./docx-to-pdf');
    const rendered = await renderDocx(await file.arrayBuffer());
    try {
      return await renderedDocxToPdf(rendered);
    } finally {
      rendered.dispose();
    }
  }
  throw new ConversionError('Formato de arquivo não suportado.');
}

/** Loads every converter a list of files will need, ahead of time. */
export function preloadFor(files: File[]) {
  const exts = new Set(files.map((f) => extensionOf(f.name)));
  const loads: Promise<unknown>[] = [import('./merge-pdf')];
  if ([...exts].some((e) => IMAGES.has(e))) loads.push(import('./images-to-pdf'));
  if ([...exts].some((e) => SHEETS.has(e))) loads.push(import('./excel-to-pdf'), import('./sheet-table'));
  if (exts.has('txt')) loads.push(import('./text-to-pdf'), import('./win-ansi'));
  if (exts.has('docx')) loads.push(import('./docx-to-pdf').then((lib) => lib.preloadDocxTools()));
  return Promise.all(loads);
}
