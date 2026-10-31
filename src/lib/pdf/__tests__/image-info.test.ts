/** @jest-environment node */
import { detectImageType, readJpegInfo, readPngInfo } from '../image-info';

function jpeg({ orientation, little = false }: { orientation?: number; little?: boolean } = {}) {
  const u16 = (v: number) => (little ? [v & 255, v >> 8] : [v >> 8, v & 255]);
  const u32 = (v: number) =>
    little
      ? [v & 255, (v >> 8) & 255, (v >> 16) & 255, v >>> 24]
      : [v >>> 24, (v >> 16) & 255, (v >> 8) & 255, v & 255];

  const parts: number[] = [0xff, 0xd8];
  if (orientation) {
    const tiff = [
      ...(little ? [0x49, 0x49] : [0x4d, 0x4d]),
      ...u16(42),
      ...u32(8),
      ...u16(1), // one IFD entry
      ...u16(0x0112), ...u16(3), ...u32(1), ...u16(orientation), 0, 0,
      ...u32(0),
    ];
    const payload = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff];
    const len = payload.length + 2;
    parts.push(0xff, 0xe1, len >> 8, len & 255, ...payload);
  }
  // An unrelated APP0 segment that must be skipped.
  parts.push(0xff, 0xe0, 0, 4, 0, 0);
  // SOF0: precision 8, height 300, width 400, 3 components.
  parts.push(0xff, 0xc0, 0, 11, 8, 300 >> 8, 300 & 255, 400 >> 8, 400 & 255, 3, 0, 0, 0);
  parts.push(0xff, 0xda, 0, 2);
  return Uint8Array.from(parts);
}

describe('image-info', () => {
  it('detects formats from magic bytes', () => {
    expect(detectImageType(jpeg())).toBe('jpeg');
    expect(detectImageType(new TextEncoder().encode('RIFF\0\0\0\0WEBPVP8 '))).toBe('webp');
    expect(detectImageType(new TextEncoder().encode('GIF89a'))).toBe('gif');
    expect(detectImageType(new TextEncoder().encode('hello world'))).toBeNull();
  });

  it('reads JPEG dimensions and defaults to upright', () => {
    expect(readJpegInfo(jpeg())).toEqual({ width: 400, height: 300, orientation: 1, components: 3 });
  });

  it('reads the EXIF orientation in both byte orders', () => {
    expect(readJpegInfo(jpeg({ orientation: 6 }))?.orientation).toBe(6);
    expect(readJpegInfo(jpeg({ orientation: 3, little: true }))?.orientation).toBe(3);
  });

  it('returns null for truncated files', () => {
    expect(readJpegInfo(jpeg().subarray(0, 8))).toBeNull();
  });

  it('reads PNG headers', () => {
    const png = new Uint8Array(33);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
    const view = new DataView(png.buffer);
    view.setUint32(16, 1920);
    view.setUint32(20, 1080);
    png[24] = 16;
    png[28] = 1;
    expect(readPngInfo(png)).toEqual({ width: 1920, height: 1080, bitDepth: 16, interlaced: true });
  });
});
