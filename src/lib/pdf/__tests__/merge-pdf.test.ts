/** @jest-environment node */
import { PDFDocument } from 'pdf-lib';
import { countPdfPages, mergePdfs } from '../merge-pdf';
import { textToPdf } from '../text-to-pdf';

async function makePdf(sizes: [number, number][]) {
  const doc = await PDFDocument.create();
  for (const size of sizes) doc.addPage(size);
  return doc.save();
}

describe('mergePdfs', () => {
  it('keeps every page, in order, with its own size', async () => {
    const a = await makePdf([[100, 200], [110, 210]]);
    const b = await makePdf([[300, 150]]);
    const progress: number[] = [];
    const { blob, pages } = await mergePdfs(
      [
        { name: 'a.pdf', bytes: a },
        { name: 'b.pdf', bytes: b },
      ],
      (done) => progress.push(done),
    );
    expect(pages).toBe(3);
    expect(progress).toEqual([1, 2]);
    const merged = await PDFDocument.load(await blob.arrayBuffer());
    expect(merged.getPages().map((p) => [p.getWidth(), p.getHeight()])).toEqual([
      [100, 200],
      [110, 210],
      [300, 150],
    ]);
  });

  it('accepts PDFs made by the other converters', async () => {
    const text = await textToPdf('Olá, mundo').blob.arrayBuffer();
    const { pages } = await mergePdfs([
      { name: 'texto.pdf', bytes: text },
      { name: 'outro.pdf', bytes: await makePdf([[200, 200]]) },
    ]);
    expect(pages).toBe(2);
  });

  it('names the file that cannot be read', async () => {
    await expect(mergePdfs([{ name: 'quebrado.pdf', bytes: new TextEncoder().encode('não é pdf') }])).rejects.toThrow(
      /quebrado\.pdf/,
    );
  });

  it('rejects an empty list', async () => {
    await expect(mergePdfs([])).rejects.toThrow(/pelo menos um/);
  });
});

describe('countPdfPages', () => {
  it('counts pages and returns null for unreadable files', async () => {
    expect(await countPdfPages(await makePdf([[10, 10], [10, 10]]))).toBe(2);
    expect(await countPdfPages(new Uint8Array([1, 2, 3]))).toBeNull();
  });
});
