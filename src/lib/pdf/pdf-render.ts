import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy, type PDFPageProxy, type RenderTask } from 'pdfjs-dist';
import { normalizeRotation, type PageBox, type Rotation } from './edit-geometry';
import { ConversionError } from './result';

export type { PDFDocumentProxy, PDFPageProxy, RenderTask };

export interface PageInfo {
  box: PageBox;
  /** Rotation saved in the file (/Rotate). */
  rotation: Rotation;
}

let worker: Worker | null = null;

function ensureWorker() {
  if (worker) return;
  worker = new Worker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url), { type: 'module' });
  GlobalWorkerOptions.workerPort = worker;
}

/** Opens a PDF for display. pdf.js takes ownership of the bytes it gets, so a copy is passed. */
export async function openPdf(
  bytes: Uint8Array,
): Promise<{ doc: PDFDocumentProxy; pages: PageInfo[]; close: () => Promise<void> }> {
  ensureWorker();
  const task = getDocument({ data: bytes.slice() });
  const close = () => task.destroy();
  let doc: PDFDocumentProxy;
  try {
    doc = await task.promise;
  } catch (error) {
    close();
    if (error instanceof Error && error.name === 'PasswordException') {
      throw new ConversionError('Este PDF está protegido por senha e não pode ser editado. Remova a senha e tente de novo.');
    }
    throw new ConversionError('Não foi possível abrir o PDF. O arquivo pode estar corrompido.');
  }
  const pages: PageInfo[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const [x1, y1, x2, y2] = page.view;
    pages.push({
      box: { x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) },
      rotation: normalizeRotation(page.rotate),
    });
  }
  return { doc, pages, close };
}

/** Draws a page on a canvas; `scale` is canvas pixels per PDF point. */
export function renderPage(page: PDFPageProxy, canvas: HTMLCanvasElement, scale: number, rotation: Rotation): RenderTask {
  const viewport = page.getViewport({ scale, rotation });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  return page.render({ canvas, viewport });
}
