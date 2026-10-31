/** Vertical extent [top, bottom] of something that must not be split. */
export type Span = [number, number];

export interface PagePlanInput {
  /** Full rendered height of the section, in px. */
  height: number;
  /** Height of one page, in px. */
  pageHeight: number;
  /** Top and bottom page margins, in px. */
  marginTop: number;
  marginBottom: number;
  /** Text lines, images and other things that shouldn't be cut. */
  atoms: Span[];
}

export interface PageSlice {
  /** Where the slice starts and ends in the section, in px. */
  start: number;
  end: number;
  /** Where to draw the slice on the page, in px from the top. */
  offset: number;
}

// How far above the ideal break to look for a gap between lines.
const SEARCH_WINDOW = 0.3;

/**
 * Splits a rendered section that may be taller than one page into page-sized
 * slices, moving each break up to the nearest gap between lines so no line
 * of text or image is cut in half.
 */
export function planPages({ height, pageHeight, marginTop, marginBottom, atoms }: PagePlanInput): PageSlice[] {
  const blocks = mergeSpans(atoms);
  const slices: PageSlice[] = [];
  let start = 0;

  while (start < height - 1) {
    const first = slices.length === 0;
    const offset = first ? 0 : marginTop;
    // The last slice carries the section's own bottom margin with it.
    if (height - start <= pageHeight - offset + 1) {
      slices.push({ start, end: height, offset });
      break;
    }
    const capacity = pageHeight - offset - marginBottom;
    const ideal = start + capacity;
    const end = findBreak(blocks, ideal, ideal - capacity * SEARCH_WINDOW, start);
    slices.push({ start, end, offset });
    start = end;
  }

  return slices.length ? slices : [{ start: 0, end: height, offset: 0 }];
}

function findBreak(blocks: Span[], ideal: number, lowest: number, start: number): number {
  const hit = blocks.find(([top, bottom]) => top < ideal && ideal < bottom);
  if (!hit) return ideal;
  const [top] = hit;
  return top >= lowest && top > start + 1 ? top : ideal;
}

// Consecutive lines with tight spacing overlap a little; pieces of the same
// line (a bold word, a link) overlap almost completely.
const LINE_OVERLAP = 0.35;

/**
 * Sorts and merges overlapping spans into blocks that can't be split. Two
 * lines that barely overlap are split halfway through the overlap, which is
 * where the boundary between their line boxes is.
 */
export function mergeSpans(spans: Span[]): Span[] {
  const sorted = spans.filter(([t, b]) => b > t).sort((a, b) => a[0] - b[0]);
  const merged: Span[] = [];
  for (const [top, bottom] of sorted) {
    const last = merged[merged.length - 1];
    if (!last || top >= last[1]) {
      merged.push([top, bottom]);
      continue;
    }
    const overlap = Math.min(last[1], bottom) - top;
    const shorter = Math.min(last[1] - last[0], bottom - top);
    if (bottom > last[1] && overlap < shorter * LINE_OVERLAP) {
      const middle = (top + last[1]) / 2;
      last[1] = middle;
      merged.push([middle, bottom]);
    } else {
      last[1] = Math.max(last[1], bottom);
    }
  }
  return merged;
}
