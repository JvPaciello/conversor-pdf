import { acceptAttr, getTool, matchesFormats, toolForFile, TOOLS } from '../tools';

describe('tools', () => {
  it('routes files to the right converter by extension', () => {
    expect(toolForFile('contrato.DOCX')?.id).toBe('word');
    expect(toolForFile('notas.txt')?.id).toBe('word');
    expect(toolForFile('vendas.ods')?.id).toBe('excel');
    expect(toolForFile('dados.csv')?.id).toBe('excel');
    expect(toolForFile('foto.jpeg')?.id).toBe('imagem');
    expect(toolForFile('antigo.doc')).toBeUndefined();
  });

  it('builds the accept attribute for file inputs', () => {
    expect(acceptAttr(getTool('word').formats)).toBe('.docx,.txt');
    expect(matchesFormats('a.webp', getTool('imagem').formats)).toBe(true);
  });

  it('keeps tool paths unique', () => {
    expect(new Set(TOOLS.map((t) => t.path)).size).toBe(TOOLS.length);
  });
});
