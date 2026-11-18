import { EncryptedPDFError, PDFDocument } from 'pdf-lib';
import { ConversionError, type PdfResult } from './result';

export interface PdfSource {
  name: string;
  bytes: Uint8Array | ArrayBuffer;
}

export type ProgressFn = (done: number, total: number) => void;

/**
 * Copies every page of each source, in order, into a single PDF. Pages are
 * copied as they are (text, vectors and images keep their quality).
 */
export async function mergePdfs(sources: PdfSource[], onProgress?: ProgressFn): Promise<PdfResult> {
  if (sources.length === 0) throw new ConversionError('Adicione pelo menos um arquivo.');

  const merged = await PDFDocument.create();
  merged.setProducer('ConverterPDF BR');
  merged.setCreator('ConverterPDF BR');

  for (const [index, source] of sources.entries()) {
    const doc = await loadSource(source);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    for (const page of pages) merged.addPage(page);
    onProgress?.(index + 1, sources.length);
  }

  if (merged.getPageCount() === 0) throw new ConversionError('Os arquivos escolhidos não têm nenhuma página.');

  const bytes = await merged.save();
  return {
    blob: new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' }),
    pages: merged.getPageCount(),
  };
}

/** Number of pages in a PDF, or null when it can't be read. */
export async function countPdfPages(bytes: Uint8Array | ArrayBuffer): Promise<number | null> {
  try {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
    return doc.getPageCount();
  } catch {
    return null;
  }
}

async function loadSource({ name, bytes }: PdfSource): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (error) {
    if (error instanceof EncryptedPDFError) {
      throw new ConversionError(
        `O arquivo “${name}” está protegido (por senha ou com restrição de edição) e não pode ser combinado. Remova a proteção e tente de novo.`,
      );
    }
    throw new ConversionError(`Não foi possível ler “${name}”. O arquivo pode estar corrompido ou não ser um PDF.`);
  }
}
