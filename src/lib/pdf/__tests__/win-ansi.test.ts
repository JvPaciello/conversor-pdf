/** @jest-environment node */
import { decodeText, toWinAnsi } from '../win-ansi';

describe('toWinAnsi', () => {
  it('keeps Portuguese text and maps the em dash', () => {
    expect(toWinAnsi('Ação, coração e pão — R$ 10')).toBe('Ação, coração e pão \x97 R$ 10');
  });

  it('maps typographic characters to their Windows-1252 codes', () => {
    expect(toWinAnsi('“ok” – €')).toBe('\x93ok\x94 \x96 \x80');
  });

  it('replaces characters the PDF fonts cannot draw', () => {
    expect(toWinAnsi('ő ✓ 日本 →')).toBe('o v ?? ->');
    expect(toWinAnsi('a​b c')).toBe('ab c');
  });

  it('never produces characters above 0xFF', () => {
    const out = toWinAnsi('Ünïcödé ★ \u{1F600} ∑ ŁŻ');
    expect([...out].every((c) => c.charCodeAt(0) <= 0xff)).toBe(true);
  });
});

describe('decodeText', () => {
  it('reads UTF-8 and strips the BOM', () => {
    const bytes = new TextEncoder().encode('﻿São Paulo');
    expect(decodeText(bytes)).toBe('São Paulo');
  });

  it('falls back to Windows-1252 for legacy files', () => {
    // "São Paulo" saved as Windows-1252
    const bytes = Uint8Array.from([0x53, 0xe3, 0x6f, 0x20, 0x50, 0x61, 0x75, 0x6c, 0x6f]);
    expect(decodeText(bytes)).toBe('São Paulo');
  });
});
