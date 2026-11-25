import { normalizeRotation, pdfToView, rotateVector, type PageBox, type Point, type Rotation } from './edit-geometry';
import { TEXT_LINE_HEIGHT, type EditItem } from './edit-pdf';

/** A rectangle in view space (points, origin top-left of the page as shown). */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A reference line: vertical (`x`) or horizontal (`y`), drawn from `from` to `to`. */
export interface Guide {
  axis: 'x' | 'y';
  at: number;
  from: number;
  to: number;
  /** Page edge or centre, or another item. */
  source: 'page' | 'item';
}

/** Width, in points, of the widest line at a font size. */
export type MeasureText = (lines: string[], size: number) => number;

/** The item's own rectangle, in its frame, relative to its anchor. */
function localBox(item: EditItem, measure: MeasureText): Box {
  switch (item.kind) {
    case 'text': {
      const lines = item.text.split('\n');
      return { x: 0, y: 0, w: measure(lines, item.size), h: lines.length * TEXT_LINE_HEIGHT * item.size };
    }
    case 'rect':
    case 'image':
      return { x: 0, y: 0, w: item.w, h: item.h };
    case 'ink': {
      const xs = item.points.map((p) => p.x);
      const ys = item.points.map((p) => p.y);
      const pad = item.lineWidth / 2;
      const x = Math.min(...xs) - pad;
      const y = Math.min(...ys) - pad;
      return { x, y, w: Math.max(...xs) + pad - x, h: Math.max(...ys) + pad - y };
    }
  }
}

/** Bounding box of an item as it is shown on a page at a rotation. */
export function itemViewBox(item: EditItem, page: PageBox, rotation: Rotation, measure: MeasureText): Box {
  const at = pdfToView(item.anchor, page, rotation);
  const turn = normalizeRotation(rotation - item.rot);
  const b = localBox(item, measure);
  const corners: Point[] = [
    { x: b.x, y: b.y },
    { x: b.x + b.w, y: b.y },
    { x: b.x, y: b.y + b.h },
    { x: b.x + b.w, y: b.y + b.h },
  ].map((c) => {
    const v = rotateVector(c, turn);
    return { x: at.x + v.x, y: at.y + v.y };
  });
  const x = Math.min(...corners.map((c) => c.x));
  const y = Math.min(...corners.map((c) => c.y));
  return { x, y, w: Math.max(...corners.map((c) => c.x)) - x, h: Math.max(...corners.map((c) => c.y)) - y };
}

interface Line {
  at: number;
  box: Box | null; // null: the page
}

const lines = (start: number, size: number) => [start, start + size / 2, start + size];

/**
 * Finds how far to shift a box being moved so one of its edges or its centre
 * lines up with the page (edges and centre) or with another item, and the
 * reference lines to show. `edges: 'end'` only snaps the right and bottom
 * edges, for resizing.
 */
export function snapBox(
  moving: Box,
  others: Box[],
  page: { width: number; height: number },
  threshold: number,
  edges: 'all' | 'end' = 'all',
): { dx: number; dy: number; guides: Guide[] } {
  const pick = (axis: 'x' | 'y') => {
    const start = axis === 'x' ? moving.x : moving.y;
    const size = axis === 'x' ? moving.w : moving.h;
    const pageSize = axis === 'x' ? page.width : page.height;
    const own = edges === 'end' ? [start + size] : lines(start, size);
    const targets: Line[] = [
      ...lines(0, pageSize).map((at) => ({ at, box: null })),
      ...others.flatMap((box) =>
        lines(axis === 'x' ? box.x : box.y, axis === 'x' ? box.w : box.h).map((at) => ({ at, box })),
      ),
    ];
    let best: number | null = null;
    for (const o of own) {
      for (const t of targets) {
        const d = t.at - o;
        if (Math.abs(d) <= threshold && (best === null || Math.abs(d) < Math.abs(best))) best = d;
      }
    }
    const shift = best ?? 0;
    if (best === null) return { shift, guides: [] as Guide[] };

    // Every target that lines up once shifted gets a guide.
    const moved = { ...moving, [axis]: start + shift };
    const ownAfter = own.map((o) => o + shift);
    const guides: Guide[] = [];
    const seen = new Set<string>();
    for (const t of targets) {
      if (!ownAfter.some((o) => Math.abs(o - t.at) < 0.5)) continue;
      const key = `${Math.round(t.at * 2)}:${t.box ? 'i' : 'p'}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const span = (b: Box) => (axis === 'x' ? [b.y, b.y + b.h] : [b.x, b.x + b.w]);
      const [a1, a2] = span(moved);
      const [from, to] = t.box
        ? [Math.min(a1, span(t.box)[0]), Math.max(a2, span(t.box)[1])]
        : [0, axis === 'x' ? page.height : page.width];
      guides.push({ axis, at: t.at, from, to, source: t.box ? 'item' : 'page' });
    }
    return { shift, guides };
  };

  const x = pick('x');
  const y = pick('y');
  return { dx: x.shift, dy: y.shift, guides: [...x.guides, ...y.guides] };
}
