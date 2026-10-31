// jsPDF's built-in fonts (Helvetica, Courier, Times) use WinAnsiEncoding.
// Any character outside it makes jsPDF switch the whole string to a
// two-byte encoding those fonts can't render, so text is mapped first.

const CP1252_EXTRAS: Record<string, number> = {
  '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87,
  'ˆ': 0x88, '‰': 0x89, 'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e, '‘': 0x91,
  '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, '˜': 0x98,
  '™': 0x99, 'š': 0x9a, '›': 0x9b, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f,
};

const LOOKALIKES: Record<string, string> = {
  '‐': '-', '‑': '-', '‒': '-', '−': '-', '―': '—',
  '′': "'", '″': '"', ' ': ' ', ' ': ' ', ' ': ' ',
  ' ': ' ', ' ': ' ', ' ': ' ', ' ': ' ', '←': '<-',
  '→': '->', '≤': '<=', '≥': '>=', '≠': '!=', '✓': 'v',
  '✔': 'v', '●': '•', '▪': '•', '◦': '•',
  '⁃': '-', '­': '',
};

const ZERO_WIDTH = /[​-‍⁠﻿]/g;

function mapChar(ch: string): string {
  const cp = ch.codePointAt(0)!;
  if (cp === 0x09 || cp === 0x0a || cp === 0x0d) return ch;
  if (cp < 0x20 || cp === 0x7f) return '';
  if (cp < 0x80 || (cp >= 0xa0 && cp <= 0xff)) return LOOKALIKES[ch] ?? ch;
  if (ch in CP1252_EXTRAS) return String.fromCharCode(CP1252_EXTRAS[ch]);
  if (ch in LOOKALIKES) return mapChar(LOOKALIKES[ch]);
  // "ő" -> "o", "ǵ" -> "g": keep the base letter when it is Latin-1.
  const base = ch.normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (base && base !== ch && [...base].every((c) => c.codePointAt(0)! <= 0xff)) return base;
  return '?';
}

export function toWinAnsi(text: string): string {
  let out = '';
  for (const ch of text.normalize('NFC').replace(ZERO_WIDTH, '')) out += mapChar(ch);
  return out;
}

/**
 * Decodes text files saved either as UTF-8 or as Windows-1252 (the default
 * "ANSI" encoding of older Windows apps in Brazil).
 */
export function decodeText(bytes: Uint8Array): string {
  const utf8 = new TextDecoder('utf-8').decode(bytes);
  if (!utf8.includes('�')) return utf8.replace(/^﻿/, '');
  return new TextDecoder('windows-1252').decode(bytes);
}
