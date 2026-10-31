import * as XLSX from 'xlsx';
import type { CellObject, WorkBook, WorkSheet } from 'xlsx';
import { PX_TO_PT } from './page-layout';

export interface TableCell {
  text: string;
  align: 'left' | 'center' | 'right';
  /** Solid fill as RRGGBB, when the cell has one. */
  fill?: string;
  colSpan?: number;
  rowSpan?: number;
}

export interface SheetTable {
  name: string;
  /** Width of each visible column, in points. */
  columnWidths: number[];
  rows: TableCell[][];
}

export interface SheetSummary {
  name: string;
  hidden: boolean;
  empty: boolean;
}

export interface TableOptions {
  /** Show 1234.5 as "1.234,50" instead of SheetJS's US-style "1,234.50". */
  brazilianNumbers: boolean;
}

const MIN_AUTO_WIDTH = 36;
const MAX_AUTO_WIDTH = 220;
const CHAR_WIDTH = 5.4; // average Helvetica 10pt glyph, in points

export function listSheets(workbook: WorkBook): SheetSummary[] {
  return workbook.SheetNames.map((name, i) => ({
    name,
    hidden: Boolean(workbook.Workbook?.Sheets?.[i]?.Hidden),
    empty: contentBounds(workbook.Sheets[name]) === null,
  }));
}

export function buildSheetTable(sheet: WorkSheet, name: string, options: TableOptions): SheetTable | null {
  const bounds = contentBounds(sheet);
  if (!bounds) return null;

  const colInfo = sheet['!cols'] ?? [];
  const rowInfo = sheet['!rows'] ?? [];
  const visibleRows = range(bounds.s.r, bounds.e.r).filter((r) => !rowInfo[r]?.hidden);
  const visibleCols = range(bounds.s.c, bounds.e.c).filter((c) => !colInfo[c]?.hidden);
  const rowSet = new Set(visibleRows);
  const colSet = new Set(visibleCols);

  const spans = new Map<string, { rowSpan: number; colSpan: number }>();
  const covered = new Set<string>();
  for (const merge of sheet['!merges'] ?? []) {
    const { s, e } = merge;
    if (!rowSet.has(s.r) || !colSet.has(s.c)) continue;
    const rowSpan = visibleRows.filter((r) => r >= s.r && r <= e.r).length;
    const colSpan = visibleCols.filter((c) => c >= s.c && c <= e.c).length;
    if (rowSpan * colSpan <= 1) continue;
    spans.set(key(s.r, s.c), { rowSpan, colSpan });
    for (let r = s.r; r <= e.r; r++) {
      for (let c = s.c; c <= e.c; c++) if (r !== s.r || c !== s.c) covered.add(key(r, c));
    }
  }

  const rows: TableCell[][] = [];
  const longest = new Map<number, number>();

  for (const r of visibleRows) {
    const row: TableCell[] = [];
    for (const c of visibleCols) {
      if (covered.has(key(r, c))) continue;
      const cell: CellObject | undefined = sheet[XLSX.utils.encode_cell({ r, c })];
      const tableCell: TableCell = {
        text: cellText(cell, options),
        align: 'left',
      };
      tableCell.align = alignment(cell, tableCell.text);
      const fill = solidFill(cell);
      if (fill) tableCell.fill = fill;
      const span = spans.get(key(r, c));
      if (span) {
        if (span.rowSpan > 1) tableCell.rowSpan = span.rowSpan;
        if (span.colSpan > 1) tableCell.colSpan = span.colSpan;
      } else {
        const chars = Math.max(0, ...tableCell.text.split('\n').map((l) => l.length));
        longest.set(c, Math.max(longest.get(c) ?? 0, chars));
      }
      row.push(tableCell);
    }
    rows.push(row);
  }

  const columnWidths = visibleCols.map((c) => {
    const info = colInfo[c];
    if (info?.wpx) return info.wpx * PX_TO_PT;
    if (info?.wch) return (info.wch * 7 + 5) * PX_TO_PT;
    const chars = longest.get(c) ?? 0;
    return clamp(chars * CHAR_WIDTH + 8, MIN_AUTO_WIDTH, MAX_AUTO_WIDTH);
  });

  return { name, columnWidths, rows };
}

/** Smallest range holding every non-empty cell, or null for a blank sheet. */
export function contentBounds(sheet: WorkSheet | undefined): XLSX.Range | null {
  if (!sheet) return null;
  let found: XLSX.Range | null = null;
  for (const address of Object.keys(sheet)) {
    if (address.startsWith('!')) continue;
    const cell = sheet[address] as CellObject;
    if (cell.v === undefined || cell.v === null || cell.v === '' || cell.t === 'z') continue;
    const { r, c } = XLSX.utils.decode_cell(address);
    if (!found) found = { s: { r, c }, e: { r, c } };
    else {
      found.s.r = Math.min(found.s.r, r);
      found.s.c = Math.min(found.s.c, c);
      found.e.r = Math.max(found.e.r, r);
      found.e.c = Math.max(found.e.c, c);
    }
  }
  if (!found) return null;
  // Keep merged areas that start inside the content whole.
  for (const merge of sheet['!merges'] ?? []) {
    if (merge.s.r >= found.s.r && merge.s.r <= found.e.r && merge.s.c >= found.s.c && merge.s.c <= found.e.c) {
      found.e.r = Math.max(found.e.r, merge.e.r);
      found.e.c = Math.max(found.e.c, merge.e.c);
    }
  }
  return found;
}

function cellText(cell: CellObject | undefined, options: TableOptions): string {
  if (!cell || cell.v === undefined || cell.v === null) return '';
  if (cell.t === 'b') return cell.v ? 'VERDADEIRO' : 'FALSO';
  const text = XLSX.utils.format_cell(cell);
  if (options.brazilianNumbers && cell.t === 'n' && !isDateFormat(cell.z)) {
    return text.replace(/[.,]/g, (ch) => (ch === '.' ? ',' : '.'));
  }
  return text;
}

const NUMERIC_TEXT = /^[-+]?(R\$\s?)?[\d.,]+%?$/;

function alignment(cell: CellObject | undefined, text: string): TableCell['align'] {
  if (cell?.t === 'n' || cell?.t === 'd') return 'right';
  if (cell?.t === 'b' || cell?.t === 'e') return 'center';
  // CSV files are read as plain text; still right-align what looks numeric.
  return NUMERIC_TEXT.test(text) ? 'right' : 'left';
}

function isDateFormat(format: CellObject['z']): boolean {
  return typeof format === 'string' && format !== 'General' && XLSX.SSF.is_date(format);
}

function solidFill(cell: CellObject | undefined): string | undefined {
  const style = cell?.s as { patternType?: string; fgColor?: { rgb?: string } } | undefined;
  const rgb = style?.patternType === 'solid' ? style.fgColor?.rgb : undefined;
  return rgb && /^[0-9a-f]{6,8}$/i.test(rgb) ? rgb.slice(-6).toUpperCase() : undefined;
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

function key(r: number, c: number) {
  return `${r}:${c}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
