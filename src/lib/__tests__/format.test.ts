import { baseName, extensionOf, formatBytes, pdfName } from '../format';

describe('format', () => {
  it('formats sizes in Brazilian notation', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1536)).toBe('1,5 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5 MB');
  });

  it('derives the PDF name from the original file', () => {
    expect(baseName('relatorio.final.docx')).toBe('relatorio.final');
    expect(baseName('.env')).toBe('.env');
    expect(pdfName('Planilha 2026.xlsx')).toBe('Planilha 2026.pdf');
    expect(extensionOf('FOTO.JPEG')).toBe('jpeg');
    expect(extensionOf('sem-extensao')).toBe('');
  });
});
