export type PageSize = 'a4' | 'letter' | 'fit';
export type Orientation = 'auto' | 'portrait' | 'landscape';
export type MarginSize = 'none' | 'small' | 'large';

export interface PageOptions {
  pageSize: PageSize;
  orientation: Orientation;
  margin: MarginSize;
}

export const PAGE_SIZES_PT: Record<Exclude<PageSize, 'fit'>, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

export const MARGINS_PT: Record<MarginSize, number> = { none: 0, small: 18, large: 36 };

/** CSS pixels (96 dpi) to PDF points (72 dpi). */
export const PX_TO_PT = 72 / 96;

export interface Placement {
  pageWidth: number;
  pageHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function placeImage(imageWidth: number, imageHeight: number, options: PageOptions): Placement {
  const margin = MARGINS_PT[options.margin];

  if (options.pageSize === 'fit') {
    const width = imageWidth * PX_TO_PT;
    const height = imageHeight * PX_TO_PT;
    return { pageWidth: width + margin * 2, pageHeight: height + margin * 2, x: margin, y: margin, width, height };
  }

  const [short, long] = PAGE_SIZES_PT[options.pageSize];
  const landscape =
    options.orientation === 'landscape' || (options.orientation === 'auto' && imageWidth > imageHeight);
  const pageWidth = landscape ? long : short;
  const pageHeight = landscape ? short : long;

  const boxWidth = pageWidth - margin * 2;
  const boxHeight = pageHeight - margin * 2;
  const scale = Math.min(boxWidth / imageWidth, boxHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  return {
    pageWidth,
    pageHeight,
    x: (pageWidth - width) / 2,
    y: (pageHeight - height) / 2,
    width,
    height,
  };
}
