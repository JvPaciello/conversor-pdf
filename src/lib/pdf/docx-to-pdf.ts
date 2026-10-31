import { jsPDF } from 'jspdf';
import { planPages, type PageSlice, type Span } from './page-cuts';
import { PX_TO_PT } from './page-layout';
import { ConversionError, finish, type PdfResult } from './result';

export interface RenderedDocx {
  frame: HTMLIFrameElement;
  sections: HTMLElement[];
  dispose(): void;
}

export type ProgressFn = (done: number, total: number) => void;

// ~190 dpi on a Letter/A4 page; capped for large paper sizes.
const SCALE = 2;
const MAX_CANVAS_WIDTH = 2600;
const JPEG_QUALITY = 0.85;

const FRAME_CSS = `
html, body { margin: 0; padding: 0; background: #fff; }
body { width: max-content; }
section.docx { background: #fff; margin: 0 0 24px; box-shadow: none; }
`;

/** Starts downloading the rendering libraries before they're needed. */
export function preloadDocxTools() {
  return Promise.all([import('docx-preview'), import('html2canvas-pro')]);
}

/**
 * Renders a .docx inside an isolated, off-screen iframe so the site's own CSS
 * can't change how the document looks.
 */
export async function renderDocx(data: ArrayBuffer): Promise<RenderedDocx> {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  frame.style.cssText = 'position:fixed;left:-20000px;top:0;width:1400px;height:1000px;border:0;';
  document.body.appendChild(frame);
  const dispose = () => frame.remove();

  try {
    const doc = frame.contentDocument!;
    doc.open();
    doc.write(`<!doctype html><html><head><meta charset="utf-8"><style>${FRAME_CSS}</style></head><body></body></html>`);
    doc.close();

    const { renderAsync } = await import('docx-preview');
    await renderAsync(data, doc.body, doc.head, {
      className: 'docx',
      inWrapper: false,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      breakPages: true,
      // Word stores where it last broke pages; following it matches Word's pagination.
      ignoreLastRenderedPageBreak: false,
      experimental: true,
      useBase64URL: true,
      renderHeaders: true,
      renderFooters: true,
      renderFootnotes: true,
      renderEndnotes: true,
    });

    addFontFallbacks(doc);
    await doc.fonts?.ready;
    await Promise.all(Array.from(doc.images, (img) => (img.complete ? null : img.decode().catch(() => null))));

    const sections = Array.from(doc.querySelectorAll<HTMLElement>('section.docx'));
    if (sections.length === 0) throw new ConversionError('O documento não tem conteúdo para converter.');
    return { frame, sections, dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}

export async function renderedDocxToPdf(rendered: RenderedDocx, onProgress?: ProgressFn): Promise<PdfResult> {
  const { default: html2canvas } = await import('html2canvas-pro');
  const plans = rendered.sections.map((section) => ({ section, ...measureSection(section) }));
  const total = plans.reduce((sum, p) => sum + p.slices.length, 0);
  let pdf: jsPDF | null = null;
  let done = 0;

  for (const { section, width, pageHeight, slices } of plans) {
    const scale = Math.min(SCALE, MAX_CANVAS_WIDTH / width);
    const format: [number, number] = [width * PX_TO_PT, pageHeight * PX_TO_PT];
    const orientation = format[0] > format[1] ? 'l' : 'p';

    for (const slice of slices) {
      const canvas = await html2canvas(section, {
        backgroundColor: '#ffffff',
        scale,
        logging: false,
        useCORS: true,
        y: slice.start,
        height: Math.ceil(slice.end - slice.start),
        width: Math.ceil(width),
      });

      if (!pdf) pdf = new jsPDF({ unit: 'pt', format, orientation, compress: true });
      else pdf.addPage(format, orientation);

      const image = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      pdf.addImage(image, 'JPEG', 0, slice.offset * PX_TO_PT, format[0], (slice.end - slice.start) * PX_TO_PT);
      canvas.width = canvas.height = 0; // release memory early on mobile

      done += 1;
      onProgress?.(done, total);
    }
  }

  return finish(pdf!);
}

/**
 * Opens the browser's print dialog for the rendered document. "Save as PDF"
 * there produces a PDF with real, selectable text.
 */
export function printRenderedDocx(rendered: RenderedDocx) {
  const doc = rendered.frame.contentDocument!;
  const first = rendered.sections[0];
  const size = `${first.style.width || '210mm'} ${first.style.minHeight || '297mm'}`;
  const margin = [first.style.paddingTop, first.style.paddingRight, first.style.paddingBottom, first.style.paddingLeft]
    .map((v) => v || '2cm')
    .join(' ');

  let style = doc.getElementById('print-css');
  if (!style) {
    style = doc.createElement('style');
    style.id = 'print-css';
    doc.head.appendChild(style);
  }
  style.textContent = `
@page { size: ${size}; margin: ${margin}; }
@media print {
  body { width: auto; }
  section.docx { width: auto !important; min-height: 0 !important; padding: 0 !important; margin: 0 !important; break-after: page; }
  section.docx:last-of-type { break-after: auto; }
}`;
  rendered.frame.contentWindow!.focus();
  rendered.frame.contentWindow!.print();
}

function measureSection(section: HTMLElement): { width: number; pageHeight: number; slices: PageSlice[] } {
  const box = section.getBoundingClientRect();
  const width = box.width;
  const pageHeight = cssLength(section.style.minHeight, section) ?? width * Math.SQRT2;
  const computed = section.ownerDocument.defaultView!.getComputedStyle(section);

  const slices = planPages({
    height: box.height,
    pageHeight,
    marginTop: parseFloat(computed.paddingTop) || 0,
    marginBottom: parseFloat(computed.paddingBottom) || 0,
    atoms: box.height > pageHeight + 1 ? collectAtoms(section, box.top) : [],
  });
  return { width, pageHeight, slices };
}

function collectAtoms(section: HTMLElement, origin: number): Span[] {
  const doc = section.ownerDocument;
  const atoms: Span[] = [];
  const range = doc.createRange();
  const walker = doc.createTreeWalker(section, NodeFilter.SHOW_TEXT);

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue;
    range.selectNodeContents(node);
    for (const rect of Array.from(range.getClientRects())) {
      if (rect.height > 0) atoms.push([rect.top - origin, rect.bottom - origin]);
    }
  }
  for (const el of Array.from(section.querySelectorAll('img, svg, canvas, object, picture'))) {
    const rect = el.getBoundingClientRect();
    atoms.push([rect.top - origin, rect.bottom - origin]);
  }
  return atoms;
}

/** Converts a CSS length such as "792pt" into px using the element's document. */
function cssLength(value: string, context: HTMLElement): number | null {
  if (!value) return null;
  const probe = context.ownerDocument.createElement('div');
  probe.style.cssText = `position:absolute;visibility:hidden;height:${value};`;
  context.ownerDocument.body.appendChild(probe);
  const px = probe.getBoundingClientRect().height;
  probe.remove();
  return px > 0 ? px : null;
}

const SERIF_HINT = /times|georgia|garamond|cambria|book|serif|palatino|century|minion/i;
const FALLBACKS: Record<string, string> = {
  calibri: "Carlito, 'Segoe UI', Arial, sans-serif",
  'calibri light': "Carlito, 'Segoe UI Light', Arial, sans-serif",
  cambria: 'Caladea, Georgia, serif',
  arial: "'Liberation Sans', Arimo, Helvetica, sans-serif",
  'times new roman': "'Liberation Serif', Tinos, Times, serif",
  'courier new': "'Liberation Mono', Cousine, Courier, monospace",
  aptos: "'Segoe UI', Carlito, Arial, sans-serif",
};

/**
 * docx-preview writes fonts without fallbacks ("font-family: Calibri"), so
 * phones and Macs without Office fonts fall back to Times. Add similar fonts.
 */
function addFontFallbacks(doc: Document) {
  const withFallback = (value: string) => {
    if (!value || /(sans-serif|serif|monospace)\s*$/.test(value)) return value;
    const last = value.split(',').pop()!.trim().replace(/^['"]|['"]$/g, '').toLowerCase();
    if (last.startsWith('var(')) return `${value}, sans-serif`;
    return `${value}, ${FALLBACKS[last] ?? (SERIF_HINT.test(last) ? 'serif' : 'sans-serif')}`;
  };

  for (const sheet of Array.from(doc.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      // Duck-typed: rules may come from either the page's or the iframe's realm.
      if (!('selectorText' in rule) || !('style' in rule)) continue;
      const style = (rule as CSSStyleRule).style;
      if (style.fontFamily) style.fontFamily = withFallback(style.fontFamily);
      for (const prop of Array.from(style)) {
        // Theme fonts: --docx-minorHAnsi-font: Calibri
        if (prop.startsWith('--docx-') && prop.endsWith('-font')) {
          style.setProperty(prop, withFallback(style.getPropertyValue(prop).trim()));
        }
      }
    }
  }
  for (const el of Array.from(doc.querySelectorAll<HTMLElement>('[style*="font-family"]'))) {
    el.style.fontFamily = withFallback(el.style.fontFamily);
  }
}
