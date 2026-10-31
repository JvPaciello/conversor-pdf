import type { jsPDF } from 'jspdf';

export interface PdfResult {
  blob: Blob;
  pages: number;
}

/** Errors whose message is written for the person using the site. */
export class ConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConversionError';
  }
}

export function finish(pdf: jsPDF): PdfResult {
  return { blob: pdf.output('blob'), pages: pdf.getNumberOfPages() };
}
