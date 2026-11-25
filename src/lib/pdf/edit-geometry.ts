/**
 * Coordinates for the PDF editor.
 *
 * - PDF space: points, origin at the bottom-left of the unrotated page.
 * - View space: points, origin at the top-left of the page as it is shown,
 *   after the page's rotation (always a multiple of 90°, clockwise).
 *
 * Items are stored in PDF space so they stay attached to the page content when
 * the page is rotated. Each item remembers the rotation it was created at:
 * its own frame (x right, y down) matches the view at that rotation.
 */

export type Rotation = 0 | 90 | 180 | 270;

export interface PageBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export function normalizeRotation(angle: number): Rotation {
  return ((((Math.round(angle / 90) * 90) % 360) + 360) % 360) as Rotation;
}

/** Size of the page as shown at a rotation. */
export function viewSize(box: PageBox, rotation: Rotation): { width: number; height: number } {
  return rotation === 90 || rotation === 270
    ? { width: box.height, height: box.width }
    : { width: box.width, height: box.height };
}

export function pdfToView(p: Point, box: PageBox, rotation: Rotation): Point {
  const x = p.x - box.x;
  const y = p.y - box.y;
  switch (rotation) {
    case 0:
      return { x, y: box.height - y };
    case 90:
      return { x: y, y: x };
    case 180:
      return { x: box.width - x, y };
    case 270:
      return { x: box.height - y, y: box.width - x };
  }
}

export function viewToPdf(p: Point, box: PageBox, rotation: Rotation): Point {
  let x: number;
  let y: number;
  switch (rotation) {
    case 0:
      [x, y] = [p.x, box.height - p.y];
      break;
    case 90:
      [x, y] = [p.y, p.x];
      break;
    case 180:
      [x, y] = [box.width - p.x, p.y];
      break;
    case 270:
      [x, y] = [box.width - p.y, box.height - p.x];
      break;
  }
  return { x: x + box.x, y: y + box.y };
}

/** Unit vectors, in PDF space, of an item frame created at a rotation. */
export function frameAxes(rotation: Rotation): { right: Point; down: Point } {
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.round(Math.cos(rad));
  const sin = Math.round(Math.sin(rad));
  return { right: { x: cos, y: sin }, down: { x: sin, y: -cos } };
}

/** A point given in an item's frame, relative to its anchor, in PDF space. */
export function frameToPdf(anchor: Point, rotation: Rotation, local: Point): Point {
  const { right, down } = frameAxes(rotation);
  return {
    x: anchor.x + local.x * right.x + local.y * down.x,
    y: anchor.y + local.x * right.y + local.y * down.y,
  };
}

/** Rotates a vector clockwise (screen convention: y points down). */
export function rotateVector(v: Point, rotation: Rotation): Point {
  switch (rotation) {
    case 0:
      return v;
    case 90:
      return { x: -v.y, y: v.x };
    case 180:
      return { x: -v.x, y: -v.y };
    case 270:
      return { x: v.y, y: -v.x };
  }
}
