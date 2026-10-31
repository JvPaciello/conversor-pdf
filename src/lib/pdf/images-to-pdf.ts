import { jsPDF } from 'jspdf';
import { detectImageType, readJpegInfo, readPngInfo } from './image-info';
import { placeImage, type PageOptions } from './page-layout';
import { ConversionError, finish, type PdfResult } from './result';

// iOS Safari refuses canvases above ~16.7 million pixels.
const MAX_CANVAS_PIXELS = 16_000_000;

interface PreparedImage {
  data: Uint8Array;
  format: 'JPEG' | 'PNG';
  width: number;
  height: number;
}

export type ProgressFn = (done: number, total: number) => void;

export async function imagesToPdf(files: File[], options: PageOptions, onProgress?: ProgressFn): Promise<PdfResult> {
  if (files.length === 0) throw new ConversionError('Nenhuma imagem selecionada.');
  let pdf: jsPDF | null = null;

  for (let i = 0; i < files.length; i++) {
    const image = await prepareImage(files[i]);
    const place = placeImage(image.width, image.height, options);
    const orientation = place.pageWidth > place.pageHeight ? 'l' : 'p';
    const format: [number, number] = [place.pageWidth, place.pageHeight];

    if (!pdf) pdf = new jsPDF({ unit: 'pt', format, orientation, compress: true });
    else pdf.addPage(format, orientation);

    pdf.addImage(image.data, image.format, place.x, place.y, place.width, place.height, undefined, 'FAST');
    onProgress?.(i + 1, files.length);
    await nextFrame();
  }

  return finish(pdf!);
}

async function prepareImage(file: File): Promise<PreparedImage> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectImageType(bytes);

  if (type === 'jpeg') {
    const info = readJpegInfo(bytes);
    // Upright RGB/greyscale JPEGs go in untouched. Rotated photos (EXIF
    // orientation) and CMYK files are redrawn so viewers show them correctly.
    if (info && info.orientation === 1 && info.components !== 4) {
      return { data: bytes, format: 'JPEG', width: info.width, height: info.height };
    }
    return redraw(file, 'image/jpeg');
  }

  if (type === 'png') {
    const info = readPngInfo(bytes);
    if (info && !info.interlaced && info.bitDepth <= 8) {
      return { data: bytes, format: 'PNG', width: info.width, height: info.height };
    }
    return redraw(file, 'image/png');
  }

  if (type === 'webp' || type === 'gif') return redraw(file, 'image/jpeg');

  throw new ConversionError(`“${file.name}” não é uma imagem JPG, PNG ou WebP válida.`);
}

/** Decodes with the browser (which applies EXIF rotation) and re-encodes. */
async function redraw(file: File, mime: 'image/jpeg' | 'image/png'): Promise<PreparedImage> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode().catch(() => {
      throw new ConversionError(`Não foi possível abrir “${file.name}”. O arquivo pode estar corrompido.`);
    });

    const scale = Math.min(1, Math.sqrt(MAX_CANVAS_PIXELS / (img.naturalWidth * img.naturalHeight)));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d')!;
    if (mime === 'image/jpeg') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, 0.92));
    if (!blob) throw new ConversionError(`Não foi possível processar “${file.name}”.`);
    return {
      data: new Uint8Array(await blob.arrayBuffer()),
      format: mime === 'image/png' ? 'PNG' : 'JPEG',
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function nextFrame() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}
