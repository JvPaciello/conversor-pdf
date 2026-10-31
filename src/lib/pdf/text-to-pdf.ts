import { jsPDF } from 'jspdf';
import { finish, type PdfResult } from './result';
import { toWinAnsi } from './win-ansi';

const PAGE_MARGIN = 56; // pt (~2 cm)
const FONT_SIZE = 11;
const LINE_HEIGHT = FONT_SIZE * 1.45;

export function textToPdf(text: string): PdfResult {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(FONT_SIZE);
  pdf.setTextColor(20, 20, 20);

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const maxWidth = pageWidth - PAGE_MARGIN * 2;
  const bottom = pageHeight - PAGE_MARGIN;

  const source = toWinAnsi(text.replace(/\r\n?/g, '\n').replace(/\t/g, '    '));
  let y = PAGE_MARGIN + FONT_SIZE;

  for (const paragraph of source.split('\n')) {
    const lines: string[] = paragraph === '' ? [''] : pdf.splitTextToSize(paragraph, maxWidth);
    for (const line of lines) {
      if (y > bottom) {
        pdf.addPage();
        y = PAGE_MARGIN + FONT_SIZE;
      }
      if (line) pdf.text(line, PAGE_MARGIN, y);
      y += LINE_HEIGHT;
    }
  }

  return finish(pdf);
}
