import { frameToPdf, normalizeRotation, pdfToView, rotateVector, viewSize, viewToPdf, type Rotation } from '../edit-geometry';

const box = { x: 10, y: 20, width: 600, height: 800 };
const rotations: Rotation[] = [0, 90, 180, 270];

describe('edit geometry', () => {
  it('round-trips points between view and PDF space at every rotation', () => {
    for (const r of rotations) {
      const p = { x: 123, y: 456 };
      const back = pdfToView(viewToPdf(p, box, r), box, r);
      expect(back.x).toBeCloseTo(p.x);
      expect(back.y).toBeCloseTo(p.y);
    }
  });

  it('maps the view corners to the right PDF corners', () => {
    // Unrotated: top-left of the view is the top-left of the page.
    expect(viewToPdf({ x: 0, y: 0 }, box, 0)).toEqual({ x: 10, y: 820 });
    // 90° clockwise: the bottom-left corner of the page ends up top-left.
    expect(viewToPdf({ x: 0, y: 0 }, box, 90)).toEqual({ x: 10, y: 20 });
    expect(viewToPdf({ x: 0, y: 0 }, box, 180)).toEqual({ x: 610, y: 20 });
    expect(viewToPdf({ x: 0, y: 0 }, box, 270)).toEqual({ x: 610, y: 820 });
    expect(viewSize(box, 90)).toEqual({ width: 800, height: 600 });
  });

  it('keeps item frames aligned with the view they were created in', () => {
    for (const r of rotations) {
      const anchor = viewToPdf({ x: 50, y: 60 }, box, r);
      // A point 30 right and 40 down in the item frame...
      const p = frameToPdf(anchor, r, { x: 30, y: 40 });
      // ...is 30 right and 40 down in the view.
      const v = pdfToView(p, box, r);
      expect(v.x).toBeCloseTo(80);
      expect(v.y).toBeCloseTo(100);
    }
  });

  it('rotates vectors clockwise and normalizes angles', () => {
    expect(rotateVector({ x: 1, y: 0 }, 90)).toEqual({ x: -0, y: 1 });
    expect(rotateVector({ x: 1, y: 0 }, 270)).toEqual({ x: 0, y: -1 });
    expect(normalizeRotation(-90)).toBe(270);
    expect(normalizeRotation(450)).toBe(90);
  });
});
