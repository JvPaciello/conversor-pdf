import type { MeasureText } from '@/lib/pdf/edit-snap';

export const FONT_FAMILY = 'Helvetica, Arial, sans-serif';

let canvas: HTMLCanvasElement | null = null;

/** Width, in CSS pixels, of the widest line at a font size in pixels. */
export function measureLines(lines: string[], fontPx: number): number {
  canvas ??= document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = `${fontPx}px ${FONT_FAMILY}`;
  return Math.max(...lines.map((line) => ctx.measureText(line).width));
}

/** Width in points of text set at `size` points (measured large for precision). */
export const measureTextPt: MeasureText = (lines, size) => (measureLines(lines, 100) * size) / 100;
