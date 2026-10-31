'use client';

import { useState } from 'react';
import { TOOLS, toolForFile, type Tool } from '@/lib/tools';
import { Dropzone } from './dropzone';
import { ToolConverter } from './tool-converter';

const ALL_FORMATS = TOOLS.flatMap((t) => t.formats);

/** Home-page converter: accepts any supported file and picks the right tool. */
export function UniversalConverter() {
  const [pick, setPick] = useState<{ tool: Tool; files: File[]; key: number } | null>(null);

  const choose = (files: File[]) => {
    const tool = toolForFile(files[0].name);
    if (!tool) return;
    const same = files.filter((f) => toolForFile(f.name)?.id === tool.id);
    setPick({ tool, files: tool.multiple ? same : same.slice(0, 1), key: Date.now() });
  };

  if (!pick) {
    return (
      <Dropzone formats={ALL_FORMATS} multiple onFiles={choose} title="Solte seu arquivo aqui" buttonLabel="Escolher arquivo" />
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
