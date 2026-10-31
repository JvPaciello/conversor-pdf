import * as XLSX from 'xlsx';
import type { WorkBook } from 'xlsx';
import { jsPDF } from 'jspdf';
import { autoTable, type CellInput, type RowInput } from 'jspdf-autotable';
import { extensionOf } from '../format';
import { PAGE_SIZES_PT } from './page-layout';
import { ConversionError, finish, type PdfResult } from './result';
import { buildSheetTable, type SheetTable, type TableCell } from './sheet-table';
import { decodeText, toWinAnsi } from './win-ansi';

export interface ExcelOptions {
  sheets: string[];
  orientation: 'auto' | 'portrait' | 'landscape';
  fitWidth: boolean;
  repeatFirstRow: boolean;
  brazilianNumbers: boolean;
}

const MARGIN = 28; // pt (~1 cm)
const BASE_FONT = 9;
const MIN_FONT = 4.5;
const MAX_CELLS = 400_000;
const GRID: [number, number, number] = [205, 209, 218];
const INK: [number, number, number] = [25, 25, 25];
const MUTED: [number, number, number] = [120, 124, 136];

export function readWorkbook(bytes: Uint8Array, fileName: string): WorkBook {
  if (extensionOf(fileName) === 'csv') {
    // raw keeps CSV values exactly as typed (leading zeros, dates, CEPs).
    return XLSX.read(decodeText(bytes), { type: 'string', raw: true });
  }
  return XLSX.read(bytes, { type: 'array', cellStyles: true });
}

export function workbookToPdf(workbook: WorkBook, options: ExcelOptions): PdfResult {
  const tables = options.sheets
    .map((name) => buildSheetTable(workbook.Sheets[name], name, { brazilianNumbers: options.brazilianNumbers }))
    .filter((t): t is SheetTable => t !== null);

  if (tables.length === 0) throw new ConversionError('As abas escolhidas estão vazias.');
  const cells = tables.reduce((sum, t) => sum + t.rows.length * t.columnWidths.length, 0);
  if (cells > MAX_CELLS) {
    throw new ConversionError(
      'A planilha é grande demais para converter no navegador. Escolha menos abas ou divida o arquivo em partes menores.',
    );
  }

  let pdf: jsPDF | null = null;

  for (const table of tables) {
    const natural = table.columnWidths.reduce((a, b) => a + b, 0);
    const [short, long] = PAGE_SIZES_PT.a4;
    const landscape =
      options.orientation === 'landscape' || (options.orientation === 'auto' && natural > short - MARGIN * 2);
    const orientation = landscape ? 'l' : 'p';

    if (!pdf) pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation });
    else pdf.addPage('a4', orientation);

    const available = (landscape ? long : short) - MARGIN * 2;
    const scale = options.fitWidth && natural > available ? available / natural : 1;
    const fontSize = Math.max(MIN_FONT, BASE_FONT * scale);
    const columnStyles = Object.fromEntries(table.columnWidths.map((w, i) => [i, { cellWidth: w * scale }]));

    const rows = table.rows.map(toRow);
    const head = options.repeatFirstRow && rows.length > 1 ? [headRow(table.rows[0])] : undefined;
    const body = head ? rows.slice(1) : rows;
    const sheetName = toWinAnsi(table.name);
    const doc = pdf;

    autoTable(doc, {
      head,
      body,
      showHead: head ? 'everyPage' : false,
      theme: 'grid',
      startY: MARGIN + 18,
      margin: { top: MARGIN + 18, right: MARGIN, bottom: MARGIN + 10, left: MARGIN },
      tableWidth: 'wrap',
      horizontalPageBreak: !options.fitWidth && natural > available,
      styles: {
        font: 'helvetica',
        fontSize,
        cellPadding: Math.max(1, 3 * scale),
        lineColor: GRID,
        lineWidth: 0.4,
        textColor: INK,
        overflow: 'linebreak',
        valign: 'middle',
      },
      headStyles: { fontStyle: 'bold', fillColor: [240, 242, 246], textColor: INK },
      columnStyles,
      didDrawPage: () => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        doc.text(sheetName, MARGIN, MARGIN + 6);
      },
    });
  }

  const doc = pdf!;
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page++) {
    doc.setPage(page);
    const { width, height } = doc.internal.pageSize;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(`${page} / ${total}`, width - MARGIN, height - MARGIN / 2, { align: 'right' });
  }

  return finish(doc);
}

function toCell(cell: TableCell): CellInput {
  const styles: Record<string, unknown> = { halign: cell.align };
  if (cell.fill) {
    const rgb = hexToRgb(cell.fill);
    styles.fillColor = rgb;
    // Font colours aren't available from the file, so keep text readable on dark fills.
    if (luminance(rgb) < 0.45) styles.textColor = [255, 255, 255];
  }
  return { content: toWinAnsi(cell.text), colSpan: cell.colSpan, rowSpan: cell.rowSpan, styles };
}

function toRow(row: TableCell[]): RowInput {
  return row.map(toCell);
}

function headRow(row: TableCell[]): RowInput {
  return row.map((cell) => toCell({ ...cell, rowSpan: undefined }));
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance([r, g, b]: [number, number, number]): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
