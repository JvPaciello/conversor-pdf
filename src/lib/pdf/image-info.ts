export type ImageType = 'jpeg' | 'png' | 'webp' | 'gif';

export function detectImageType(bytes: Uint8Array): ImageType | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'webp';
  if (ascii(bytes, 0, 4) === 'GIF8') return 'gif';
  return null;
}

export interface JpegInfo {
  width: number;
  height: number;
  /** EXIF orientation, 1 (upright) to 8. */
  orientation: number;
  components: number;
}

const SOF_MARKERS = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

export function readJpegInfo(bytes: Uint8Array): JpegInfo | null {
  if (detectImageType(bytes) !== 'jpeg') return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let orientation = 1;
  let offset = 2;

  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];
    if (marker === 0xff) {
      offset += 1; // fill byte
      continue;
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    const length = view.getUint16(offset + 2);
    const segment = offset + 4;

    if (marker === 0xe1 && ascii(bytes, segment, 6) === 'Exif\0\0') {
      orientation = readExifOrientation(view, segment + 6) ?? orientation;
    } else if (SOF_MARKERS.has(marker)) {
      if (segment + 6 > bytes.length) return null;
      return {
        height: view.getUint16(segment + 1),
        width: view.getUint16(segment + 3),
        components: bytes[segment + 5],
        orientation,
      };
    } else if (marker === 0xda) {
      return null; // reached image data without a frame header
    }
    offset += 2 + length;
  }
  return null;
}

function readExifOrientation(view: DataView, tiff: number): number | null {
  if (tiff + 8 > view.byteLength) return null;
  const order = view.getUint16(tiff);
  if (order !== 0x4949 && order !== 0x4d4d) return null;
  const little = order === 0x4949;
  const ifd = tiff + view.getUint32(tiff + 4, little);
  if (ifd + 2 > view.byteLength) return null;
  const entries = view.getUint16(ifd, little);
  for (let i = 0; i < entries; i++) {
    const entry = ifd + 2 + i * 12;
    if (entry + 12 > view.byteLength) return null;
    if (view.getUint16(entry, little) === 0x0112) {
      const value = view.getUint16(entry + 8, little);
      return value >= 1 && value <= 8 ? value : null;
    }
  }
  return null;
}

export interface PngInfo {
  width: number;
  height: number;
  bitDepth: number;
  interlaced: boolean;
}

export function readPngInfo(bytes: Uint8Array): PngInfo | null {
  if (detectImageType(bytes) !== 'png' || bytes.length < 29 || ascii(bytes, 12, 4) !== 'IHDR') return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return {
    width: view.getUint32(16),
    height: view.getUint32(20),
    bitDepth: bytes[24],
    interlaced: bytes[28] === 1,
  };
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}
