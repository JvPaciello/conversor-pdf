'use client';

import { useState } from 'react';
import { ACCEPTED_FORMATS, getTool, MAX_MERGE_FILES, toolForFile, type Tool } from '@/lib/tools';
import { Dropzone } from './dropzone';
import { ToolConverter } from './tool-converter';

/** Home-page converter: accepts any supported file and picks the right tool. */
export function UniversalConverter() {
  const [pick, setPick] = useState<{ tool: Tool; files: File[]; key: number } | null>(null);

  const choose = (files: File[]) => {
    const tools = new Set(files.map((f) => toolForFile(f.name)?.id));
    // One file, or only images: open that converter. Anything else is joined into one PDF.
    const tool = files.length === 1 || (tools.size === 1 && tools.has('imagem')) ? toolForFile(files[0].name) : getTool('juntar');
    if (!tool) return;
    setPick({ tool, files: tool.id === 'juntar' ? files.slice(0, MAX_MERGE_FILES) : files, key: Date.now() });
  };

  if (!pick) {
    return (
      <Dropzone formats={ACCEPTED_FORMATS} multiple onFiles={choose} title="Solte seus arquivos aqui" buttonLabel="Escolher arquivos" />
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-rule pb-4">
        <p className="heading text-lg">{pick.tool.name}</p>
        <button type="button" onClick={() => setPick(null)} className="link text-sm">
          Outro tipo de arquivo
        </button>
      </div>
      <ToolConverter key={pick.key} id={pick.tool.id} initialFiles={pick.files} />
    </div>
  );
}
