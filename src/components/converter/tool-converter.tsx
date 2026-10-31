'use client';

import type { ToolId } from '@/lib/tools';
import { ExcelConverter } from './excel-converter';
import { ImageConverter } from './image-converter';
import { WordConverter } from './word-converter';

const CONVERTERS = {
  word: WordConverter,
  excel: ExcelConverter,
  imagem: ImageConverter,
} satisfies Record<ToolId, React.ComponentType<{ initialFiles?: File[] }>>;

export function ToolConverter({ id, initialFiles }: { id: ToolId; initialFiles?: File[] }) {
  const Converter = CONVERTERS[id];
  return <Converter initialFiles={initialFiles} />;
}
