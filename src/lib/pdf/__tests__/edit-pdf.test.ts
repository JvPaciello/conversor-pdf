/** @jest-environment node */
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { applyEdits, sanitizeText, type EditPage } from '../edit-pdf';

// 1×1 transparent PNG
const PNG = Uint8Array.from(
  Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'),
);

async function source(count: number) {
  const doc = await PDFDocument.create();
  for (let i = 0; i < count; i++) doc.addPage([200 + i, 300]);
  return doc.save();
}

const page = (source: number, extra: Partial<EditPage> = {}): EditPage => ({
  source,
  rotate: 0,
  deleted: false,
  items: [],
  ...extra,
});

describe('applyEdits', () => {
  it('rotates and deletes pages, keeping the order', async () => {
    const { blob, pages } = await applyEdits(await source(3), [
      page(0, { rotate: 90 }),
      page(1, { deleted: true }),
      page(2, { rotate: 270 }),
    ]);
    expect(pages).toBe(2);
    const out = await PDFDocument.load(await blob.arrayBuffer());
    expect(out.getPages().map((p) => [p.getWidth(), p.getRotation().angle])).toEqual([
      [200, 90],
      [202, 270],
    ]);
  });

  it('draws every kind of item', async () => {
    const before = await source(1);
    const { blob } = await applyEdits(before, [
      page(0, {
        items: [
          { id: 't', kind: 'text', anchor: { x: 20, y: 280 }, rot: 0, text: 'Olá, João!\nSegunda linha ✓', size: 14, color: '#112233' },
          { id: 'r', kind: 'rect', anchor: { x: 20, y: 200 }, rot: 0, w: 50, h: 20, color: '#ffffff', style: 'fill', lineWidth: 2 },
          { id: 'o', kind: 'rect', anchor: { x: 20, y: 150 }, rot: 90, w: 50, h: 20, color: '#ff0000', style: 'outline', lineWidth: 2 },
          { id: 'i', kind: 'ink', anchor: { x: 30, y: 100 }, rot: 0, points: [{ x: 0, y: 0 }, { x: 10, y: 5 }], color: '#0000ff', lineWidth: 3 },
          { id: 'g', kind: 'image', anchor: { x: 100, y: 100 }, rot: 0, w: 40, h: 40, image: { key: 'a', bytes: PNG, type: 'png' } },
          { id: 'h', kind: 'image', anchor: { x: 150, y: 100 }, rot: 180, w: 40, h: 40, image: { key: 'a', bytes: PNG, type: 'png' } },
        ],
      }),
    ]);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    expect(bytes.length).toBeGreaterThan(before.length);
    const out = await PDFDocument.load(bytes);
    expect(out.getPageCount()).toBe(1);
    // The same picture is embedded only once.
    // (A PNG with transparency is an image plus its alpha mask.)
    const text = Buffer.from(bytes).toString('latin1');
    expect(text.match(/\/Subtype \/Image/g)).toHaveLength(2);
    expect(text.match(/\/SMask \d+ 0 R/g)).toHaveLength(1);
  });

  it('refuses to delete every page', async () => {
    await expect(applyEdits(await source(1), [page(0, { deleted: true })])).rejects.toThrow(/pelo menos uma/);
  });
});

describe('sanitizeText', () => {
  it('keeps Portuguese text and replaces what Helvetica cannot draw', async () => {
    const font = await (await PDFDocument.create()).embedFont(StandardFonts.Helvetica);
    expect(sanitizeText('Ação, coração — “ok” €', font)).toBe('Ação, coração — “ok” €');
    expect(sanitizeText('ő ✓ 日', font)).toBe('o ? ?');
  });
});
