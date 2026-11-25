import { viewToPdf } from '../edit-geometry';
import type { EditItem } from '../edit-pdf';
import { itemViewBox, snapBox } from '../edit-snap';

const page = { width: 600, height: 800 };
const pdfBox = { x: 0, y: 0, ...page };
const measure = (lines: string[], size: number) => Math.max(...lines.map((l) => l.length)) * size * 0.5;

describe('snapBox', () => {
  it('snaps the centre of a box to the centre of the page', () => {
    const { dx, dy, guides } = snapBox({ x: 247, y: 500, w: 100, h: 20 }, [], page, 5);
    expect(dx).toBe(3); // centre 297 → 300
    expect(dy).toBe(0);
    expect(guides).toEqual([{ axis: 'x', at: 300, from: 0, to: 800, source: 'page' }]);
  });

  it('aligns left edges with another item and draws the guide between them', () => {
    const other = { x: 100, y: 100, w: 200, h: 30 };
    const { dx, guides } = snapBox({ x: 103, y: 300, w: 50, h: 20 }, [other], page, 5);
    expect(dx).toBe(-3);
    expect(guides).toContainEqual({ axis: 'x', at: 100, from: 100, to: 320, source: 'item' });
  });

  it('snaps both axes at once and prefers the closest line', () => {
    const other = { x: 100, y: 200, w: 100, h: 40 };
    const { dx, dy } = snapBox({ x: 198, y: 217, w: 50, h: 4 }, [other], page, 5);
    expect(dx).toBe(2); // left edge → other's right edge (200)
    expect(dy).toBe(1); // centre 219 → other's centre 220
  });

  it('does nothing when nothing is near', () => {
    expect(snapBox({ x: 40, y: 40, w: 10, h: 10 }, [], page, 5)).toEqual({ dx: 0, dy: 0, guides: [] });
  });

  it('only moves the far edges when resizing', () => {
    const { dx } = snapBox({ x: 1, y: 40, w: 296, h: 10 }, [], page, 5, 'end');
    expect(dx).toBe(3); // right edge 297 → page centre 300; left edge ignored
  });
});

describe('itemViewBox', () => {
  it('measures text, shapes and drawings, also on rotated pages', () => {
    const text: EditItem = { id: 't', kind: 'text', anchor: viewToPdf({ x: 10, y: 20 }, pdfBox, 0), rot: 0, text: 'abcd\nab', size: 10, color: '#000' };
    expect(itemViewBox(text, pdfBox, 0, measure)).toEqual({ x: 10, y: 20, w: 20, h: 24 });

    const ink: EditItem = { id: 'i', kind: 'ink', anchor: viewToPdf({ x: 50, y: 50 }, pdfBox, 0), rot: 0, points: [{ x: -10, y: 0 }, { x: 10, y: 5 }], color: '#000', lineWidth: 2 };
    expect(itemViewBox(ink, pdfBox, 0, measure)).toEqual({ x: 39, y: 49, w: 22, h: 7 });

    // A 40×10 box created upright, then the page is turned 90°: it becomes 10×40.
    const rect: EditItem = { id: 'r', kind: 'rect', anchor: viewToPdf({ x: 100, y: 100 }, pdfBox, 0), rot: 0, w: 40, h: 10, color: '#000', style: 'fill', lineWidth: 1 };
    const turned = itemViewBox(rect, pdfBox, 90, measure);
    expect([turned.w, turned.h]).toEqual([10, 40]);
  });
});
