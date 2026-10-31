/** @jest-environment node */
import * as XLSX from 'xlsx';
import { buildSheetTable, contentBounds, listSheets } from '../sheet-table';

function sheetFrom(rows: unknown[][]) {
  return XLSX.utils.aoa_to_sheet(rows);
}

const BR = { brazilianNumbers: true };

describe('buildSheetTable', () => {
  it('returns null for blank sheets', () => {
    expect(buildSheetTable(sheetFrom([]), 'Vazia', BR)).toBeNull();
    expect(contentBounds(sheetFrom([[null, '']]))).toBeNull();
  });

  it('trims empty rows and columns around the content', () => {
    const sheet = sheetFrom([[], [null, null], [null, 'a', 'b'], [null, 'c', null]]);
    const table = buildSheetTable(sheet, 'S', BR)!;
    expect(table.rows.map((r) => r.map((c) => c.text))).toEqual([
      ['a', 'b'],
      ['c', ''],
    ]);
    expect(table.columnWidths).toHaveLength(2);
  });

  it('turns merges into spans and skips the covered cells', () => {
    const sheet = sheetFrom([
      ['Título', null, null],
      ['a', 'b', 'c'],
    ]);
    sheet['!merges'] = [XLSX.utils.decode_range('A1:C1')];
    const table = buildSheetTable(sheet, 'S', BR)!;
    expect(table.rows[0]).toEqual([{ text: 'Título', align: 'left', colSpan: 3 }]);
    expect(table.rows[1]).toHaveLength(3);
  });

  it('drops hidden columns and rows, shrinking merges across them', () => {
    const sheet = sheetFrom([
      ['Título', null, null],
      ['a', 'oculto', 'c'],
      ['linha oculta', 'x', 'y'],
    ]);
    sheet['!merges'] = [XLSX.utils.decode_range('A1:C1')];
    sheet['!cols'] = [{}, { hidden: true }, {}];
    sheet['!rows'] = [{}, {}, { hidden: true }];
    const table = buildSheetTable(sheet, 'S', BR)!;
    expect(table.rows.map((r) => r.map((c) => c.text))).toEqual([['Título'], ['a', 'c']]);
    expect(table.rows[0][0].colSpan).toBe(2);
  });

  it('formats numbers the Brazilian way, except dates', () => {
    const sheet = sheetFrom([[1234.5, 0.25, new Date(Date.UTC(2026, 9, 30))]]);
    sheet.A1.z = '#,##0.00';
    sheet.B1.z = '0.0%';
    delete sheet.A1.w;
    delete sheet.B1.w;
    const [row] = buildSheetTable(sheet, 'S', BR)!.rows;
    expect(row[0]).toMatchObject({ text: '1.234,50', align: 'right' });
    expect(row[1].text).toBe('25,0%');
    expect(row[2].text).not.toContain(',');

    const [us] = buildSheetTable(sheet, 'S', { brazilianNumbers: false })!.rows;
    expect(us[0].text).toBe('1,234.50');
  });

  it('translates booleans and right-aligns numeric text', () => {
    const [row] = buildSheetTable(sheetFrom([[true, '1.234,56', 'texto']]), 'S', BR)!.rows;
    expect(row.map((c) => [c.text, c.align])).toEqual([
      ['VERDADEIRO', 'center'],
      ['1.234,56', 'right'],
      ['texto', 'left'],
    ]);
  });

  it('uses explicit column widths and sizes the rest by content', () => {
    const sheet = sheetFrom([['curto', 'um texto bem mais comprido que o normal']]);
    sheet['!cols'] = [{ wpx: 100 }];
    const { columnWidths } = buildSheetTable(sheet, 'S', BR)!;
    expect(columnWidths[0]).toBe(75);
    expect(columnWidths[1]).toBeGreaterThan(150);
  });

  it('reads solid fills', () => {
    const sheet = sheetFrom([['x']]);
    sheet.A1.s = { patternType: 'solid', fgColor: { rgb: 'FF1F4E79' } };
    expect(buildSheetTable(sheet, 'S', BR)!.rows[0][0].fill).toBe('1F4E79');
  });
});

describe('listSheets', () => {
  it('reports hidden and empty sheets', () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheetFrom([['a']]), 'Dados');
    XLSX.utils.book_append_sheet(wb, sheetFrom([]), 'Vazia');
    XLSX.utils.book_append_sheet(wb, sheetFrom([['b']]), 'Oculta');
    wb.Workbook = { Sheets: [{ Hidden: 0 }, { Hidden: 0 }, { Hidden: 1 }] };
    expect(listSheets(wb)).toEqual([
      { name: 'Dados', hidden: false, empty: false },
      { name: 'Vazia', hidden: false, empty: true },
      { name: 'Oculta', hidden: true, empty: false },
    ]);
  });
});
