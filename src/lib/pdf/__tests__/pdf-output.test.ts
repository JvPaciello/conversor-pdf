/** @jest-environment node */
import * as XLSX from 'xlsx';
import { readWorkbook, workbookToPdf, type ExcelOptions } from '../excel-to-pdf';
import { textToPdf } from '../text-to-pdf';

async function pdfText({ blob }: { blob: Blob }) {
  return Buffer.from(await blob.arrayBuffer()).toString('latin1');
}

function pageCount(source: string) {
  return (source.match(/\/Type \/Page[^s]/g) ?? []).length;
}

function mediaBoxes(source: string) {
  return [...source.matchAll(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/g)].map((m) => [Number(m[1]), Number(m[2])]);
}

const options: ExcelOptions = {
  sheets: [],
  orientation: 'auto',
  fitWidth: true,
  repeatFirstRow: false,
  brazilianNumbers: true,
};

describe('textToPdf', () => {
  it('creates a valid PDF and paginates long text', async () => {
    const text = Array.from({ length: 200 }, (_, i) => `Linha ${i + 1}: não há limite de páginas.`).join('\n');
    const source = await pdfText(textToPdf(text));
    expect(source.startsWith('%PDF-')).toBe(true);
    expect(pageCount(source)).toBeGreaterThanOrEqual(4);
  });

  it('handles empty files', async () => {
    expect(textToPdf('').pages).toBe(1);
    expect(pageCount(await pdfText(textToPdf('')))).toBe(1);
  });
});

describe('workbookToPdf', () => {
  function workbook() {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Nome', 'Valor'], ['João', 10]]), 'Estreita');
    const wide = Array.from({ length: 3 }, (_, r) => Array.from({ length: 25 }, (_, c) => `célula ${r}-${c}`));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wide), 'Larga');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([]), 'Vazia');
    return wb;
  }

  it('starts each sheet on its own page with a fitting orientation', async () => {
    const source = await pdfText(workbookToPdf(workbook(), { ...options, sheets: ['Estreita', 'Larga', 'Vazia'] }));
    const boxes = mediaBoxes(source);
    expect(boxes).toHaveLength(2);
    expect(boxes[0][0]).toBeLessThan(boxes[0][1]); // portrait
    expect(boxes[1][0]).toBeGreaterThan(boxes[1][1]); // landscape
  });

  it('splits wide tables across pages when not fitting to width', async () => {
    const fit = await pdfText(workbookToPdf(workbook(), { ...options, sheets: ['Larga'] }));
    const split = await pdfText(workbookToPdf(workbook(), { ...options, sheets: ['Larga'], fitWidth: false }));
    expect(pageCount(fit)).toBe(1);
    expect(pageCount(split)).toBeGreaterThan(1);
  });

  it('rejects selections with no content', () => {
    expect(() => workbookToPdf(workbook(), { ...options, sheets: ['Vazia'] })).toThrow(/vazias/);
  });

  it('reads semicolon CSV files saved as Windows-1252', () => {
    const csv = Uint8Array.from(Buffer.from('cidade;cep\nS\xe3o Paulo;01310-100\n', 'latin1'));
    const wb = readWorkbook(csv, 'dados.csv');
    const sheet = wb.Sheets[wb.SheetNames[0]];
    expect(sheet.A2.v).toBe('São Paulo');
    expect(sheet.B2.v).toBe('01310-100');
  });
});
