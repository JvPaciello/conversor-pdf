import { degrees, EncryptedPDFError, LineCapStyle, PDFDocument, rgb, StandardFonts, type PDFFont, type PDFImage } from 'pdf-lib';
import { frameToPdf, normalizeRotation, type Point, type Rotation } from './edit-geometry';
import { ConversionError, type PdfResult } from './result';

/** Text boxes: line height and baseline position, as a fraction of the font size. */
export const TEXT_LINE_HEIGHT = 1.2;
export const TEXT_BASELINE = 0.93;

interface ItemBase {
  id: string;
  /** Top-left corner of the item, in PDF space. */
  anchor: Point;
  /** Rotation of the view when the item was created. */
  rot: Rotation;
}

export interface TextItem extends ItemBase {
  kind: 'text';
  text: string;
  size: number;
  color: string;
}

export interface RectItem extends ItemBase {
  kind: 'rect';
  w: number;
  h: number;
  color: string;
  /** Filled shapes cover what is below; outlines only draw the border. */
  style: 'fill' | 'outline' | 'highlight';
  lineWidth: number;
}

export interface InkItem extends ItemBase {
  kind: 'ink';
  /** Points in the item's frame, relative to the anchor. */
  points: Point[];
  color: string;
  lineWidth: number;
}

export interface ImageItem extends ItemBase {
  kind: 'image';
  w: number;
  h: number;
  image: EditImage;
}

export interface EditImage {
  /** Same key for the same picture, so it is embedded once. */
  key: string;
  bytes: Uint8Array;
  type: 'png' | 'jpeg';
}

export type EditItem = TextItem | RectItem | InkItem | ImageItem;

export interface EditPage {
  /** Index of the page in the original file. */
  source: number;
  /** Extra clockwise rotation chosen in the editor. */
  rotate: Rotation;
  deleted: boolean;
  items: EditItem[];
}

export async function loadEditablePdf(bytes: Uint8Array | ArrayBuffer): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (error) {
    if (error instanceof EncryptedPDFError) {
      throw new ConversionError(
        'Este PDF está protegido (por senha ou com restrição de edição) e não pode ser editado. Remova a proteção e tente de novo.',
      );
    }
    throw new ConversionError('Não foi possível ler o PDF. O arquivo pode estar corrompido.');
  }
}

/** Applies the editor's changes to the original file. */
export async function applyEdits(bytes: Uint8Array | ArrayBuffer, pages: EditPage[]): Promise<PdfResult> {
  const kept = pages.filter((p) => !p.deleted);
  if (kept.length === 0) throw new ConversionError('Todas as páginas foram excluídas. Mantenha pelo menos uma.');

  const doc = await loadEditablePdf(bytes);
  const fonts = new FontCache(doc);
  const images = new Map<string, Promise<PDFImage>>();
  const embed = (image: EditImage) => {
    let embedded = images.get(image.key);
    if (!embedded) {
      embedded = image.type === 'png' ? doc.embedPng(image.bytes) : doc.embedJpg(image.bytes);
      images.set(image.key, embedded);
    }
    return embedded;
  };

  const original = doc.getPages();
  for (const edit of pages) {
    if (edit.deleted) continue;
    const page = original[edit.source];
    if (!page) throw new Error(`Página ${edit.source} não existe`);
    if (edit.rotate) page.setRotation(degrees(normalizeRotation(page.getRotation().angle + edit.rotate)));

    for (const item of edit.items) {
      const angle = degrees(item.rot);
      switch (item.kind) {
        case 'text': {
          const font = await fonts.helvetica();
          const lines = sanitizeText(item.text, font).split('\n');
          lines.forEach((line, i) => {
            if (!line) return;
            const at = frameToPdf(item.anchor, item.rot, {
              x: 0,
              y: (i * TEXT_LINE_HEIGHT + TEXT_BASELINE) * item.size,
            });
            page.drawText(line, { x: at.x, y: at.y, size: item.size, font, color: hex(item.color), rotate: angle });
          });
          break;
        }
        case 'rect': {
          const at = frameToPdf(item.anchor, item.rot, { x: 0, y: item.h });
          const color = hex(item.color);
          page.drawRectangle({
            x: at.x,
            y: at.y,
            width: item.w,
            height: item.h,
            rotate: angle,
            ...(item.style === 'outline'
              ? { borderColor: color, borderWidth: item.lineWidth }
              : { color, opacity: item.style === 'highlight' ? 0.35 : 1 }),
          });
          break;
        }
        case 'ink': {
          const color = hex(item.color);
          const points = item.points.map((p) => frameToPdf(item.anchor, item.rot, p));
          if (points.length === 1) points.push({ x: points[0].x + 0.01, y: points[0].y });
          for (let i = 1; i < points.length; i++) {
            page.drawLine({
              start: points[i - 1],
              end: points[i],
              thickness: item.lineWidth,
              color,
              lineCap: LineCapStyle.Round,
            });
          }
          break;
        }
        case 'image': {
          const at = frameToPdf(item.anchor, item.rot, { x: 0, y: item.h });
          page.drawImage(await embed(item.image), { x: at.x, y: at.y, width: item.w, height: item.h, rotate: angle });
          break;
        }
      }
    }
  }

  // Remove from the end so the remaining indices stay valid.
  const deleted = pages.filter((p) => p.deleted).map((p) => p.source).sort((a, b) => b - a);
  for (const index of deleted) doc.removePage(index);

  const out = await doc.save();
  return { blob: new Blob([out as Uint8Array<ArrayBuffer>], { type: 'application/pdf' }), pages: doc.getPageCount() };
}

class FontCache {
  private font?: Promise<PDFFont>;
  constructor(private doc: PDFDocument) {}
  helvetica() {
    this.font ??= this.doc.embedFont(StandardFonts.Helvetica);
    return this.font;
  }
}

/** Keeps the characters Helvetica (WinAnsi) can draw; others fall back to a look-alike or "?". */
export function sanitizeText(text: string, font: PDFFont): string {
  const supported = new Set(font.getCharacterSet());
  let out = '';
  for (const ch of text.normalize('NFC').replace(/\r\n?/g, '\n')) {
    const cp = ch.codePointAt(0)!;
    if (ch === '\n' || supported.has(cp)) {
      out += ch;
      continue;
    }
    if (ch === '\t') {
      out += '    ';
      continue;
    }
    const base = ch.normalize('NFD').replace(/[̀-ͯ]/g, '');
    out += base && [...base].every((c) => supported.has(c.codePointAt(0)!)) ? base : '?';
  }
  return out;
}

function hex(color: string) {
  const n = parseInt(color.replace('#', ''), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}
