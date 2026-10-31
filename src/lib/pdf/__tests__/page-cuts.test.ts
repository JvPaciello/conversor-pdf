/** @jest-environment node */
import { mergeSpans, planPages, type Span } from '../page-cuts';

function lines(from: number, to: number, step: number, height: number): Span[] {
  const out: Span[] = [];
  for (let y = from; y + height <= to; y += step) out.push([y, y + height]);
  return out;
}

describe('planPages', () => {
  it('keeps a section that fits as one page', () => {
    expect(planPages({ height: 1056, pageHeight: 1056, marginTop: 96, marginBottom: 96, atoms: [] })).toEqual([
      { start: 0, end: 1056, offset: 0 },
    ]);
  });

  it('breaks between lines instead of through them', () => {
    // 18px lines every 22px, starting at the top margin.
    const atoms = lines(96, 3000, 22, 18);
    // Tightly spaced lines overlap by 2px; breaks must fall inside the overlap.
    const tight = lines(96, 3000, 16, 18);
    const tightSlices = planPages({ height: 3000, pageHeight: 1056, marginTop: 96, marginBottom: 96, atoms: tight });
    for (const { end } of tightSlices.slice(0, -1)) {
      const crossing = tight.filter(([t, b]) => t < end && end < b);
      expect(crossing.length).toBeLessThanOrEqual(2);
      for (const [t, b] of crossing) expect(Math.min(end - t, b - end)).toBeLessThanOrEqual(2);
    }
    const slices = planPages({ height: 3000, pageHeight: 1056, marginTop: 96, marginBottom: 96, atoms });
    expect(slices.length).toBeGreaterThan(2);
    for (const { end } of slices.slice(0, -1)) {
      expect(atoms.some(([t, b]) => t < end && end < b)).toBe(false);
    }
    // Later pages start below the top margin and never run into the bottom one.
    for (const s of slices.slice(1, -1)) {
      expect(s.offset).toBe(96);
      expect(s.end - s.start).toBeLessThanOrEqual(1056 - 96 - 96);
    }
    expect(slices[slices.length - 1].end).toBe(3000);
  });

  it('cuts at the ideal point when an element is taller than the search window', () => {
    const slices = planPages({ height: 2000, pageHeight: 1000, marginTop: 50, marginBottom: 50, atoms: [[100, 1900]] });
    expect(slices[0].end).toBe(950);
  });
});

describe('mergeSpans', () => {
  it('splits barely overlapping lines halfway through the overlap', () => {
    expect(
      mergeSpans([
        [0, 20],
        [18, 38],
        [2, 19], // a bold word on the first line
      ]),
    ).toEqual([
      [0, 19],
      [19, 38],
    ]);
  });

  it('merges overlaps but keeps touching spans apart', () => {
    expect(
      mergeSpans([
        [30, 40],
        [0, 10],
        [5, 20],
        [20, 25],
      ]),
    ).toEqual([
      [0, 20],
      [20, 25],
      [30, 40],
    ]);
  });
});
