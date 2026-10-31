/** @jest-environment node */
import { placeImage } from '../page-layout';

describe('placeImage', () => {
  it('picks landscape A4 for wide images and centers them', () => {
    const p = placeImage(4000, 3000, { pageSize: 'a4', orientation: 'auto', margin: 'none' });
    expect(p.pageWidth).toBeCloseTo(841.89);
    expect(p.pageHeight).toBeCloseTo(595.28);
    expect(p.height).toBeCloseTo(595.28);
    expect(p.x).toBeCloseTo((841.89 - p.width) / 2);
    expect(p.y).toBeCloseTo(0);
  });

  it('respects a forced orientation and margins', () => {
    const p = placeImage(4000, 3000, { pageSize: 'letter', orientation: 'portrait', margin: 'large' });
    expect(p.pageWidth).toBe(612);
    expect(p.width).toBeCloseTo(612 - 72);
    expect(p.x).toBeCloseTo(36);
  });

  it('sizes the page to the image when asked', () => {
    const p = placeImage(800, 600, { pageSize: 'fit', orientation: 'auto', margin: 'small' });
    expect(p).toEqual({ pageWidth: 636, pageHeight: 486, x: 18, y: 18, width: 600, height: 450 });
  });
});
