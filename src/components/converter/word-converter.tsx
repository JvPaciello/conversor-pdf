'use client';

import { Printer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { RenderedDocx } from '@/lib/pdf/docx-to-pdf';
import { extensionOf, pdfName } from '@/lib/format';
import { getTool } from '@/lib/tools';
import { Dropzone } from './dropzone';
import { ErrorNote, FileRow, Progress, ResultPanel } from './parts';
import { useConversion } from './use-conversion';

const tool = getTool('word');

export function WordConverter({ initialFiles }: { initialFiles?: File[] }) {
  const [file, setFile] = useState<File | null>(initialFiles?.[0] ?? null);
  const { state, run, reset } = useConversion();
  const rendered = useRef<RenderedDocx | null>(null);
  const isDocx = file !== null && extensionOf(file.name) === 'docx';

  const hasFile = file !== null;
  useEffect(() => {
    if (!hasFile) return;
    // Fetch the converter while the person is still looking at the button.
    const load = isDocx
      ? import('@/lib/pdf/docx-to-pdf').then((lib) => lib.preloadDocxTools())
      : Promise.all([import('@/lib/pdf/text-to-pdf'), import('@/lib/pdf/win-ansi')]);
    load.catch(() => {});
  }, [hasFile, isDocx]);

  useEffect(() => () => rendered.current?.dispose(), []);

  const restart = () => {
    rendered.current?.dispose();
    rendered.current = null;
    setFile(null);
    reset();
  };

  const convert = () => {
    if (!file) return;
    run(async (progress) => {
      if (!isDocx) {
        const [{ textToPdf }, { decodeText }] = await Promise.all([
          import('@/lib/pdf/text-to-pdf'),
          import('@/lib/pdf/win-ansi'),
        ]);
        const { blob, pages } = textToPdf(decodeText(new Uint8Array(await file.arrayBuffer())));
        return { blob, pages, fileName: pdfName(file.name) };
      }
      const lib = await import('@/lib/pdf/docx-to-pdf');
      rendered.current?.dispose();
      rendered.current = await lib.renderDocx(await file.arrayBuffer());
      const { blob, pages } = await lib.renderedDocxToPdf(rendered.current, progress);
      return { blob, pages, fileName: pdfName(file.name) };
    });
  };

  const print = async () => {
    const lib = await import('@/lib/pdf/docx-to-pdf');
    if (rendered.current) lib.printRenderedDocx(rendered.current);
  };

  if (!file) {
    return (
      <Dropzone
        formats={tool.formats}
        onFiles={([picked]) => setFile(picked)}
        title="Solte o documento aqui"
        buttonLabel="Escolher arquivo"
      />
    );
  }

  if (state.status === 'done') {
    return (
      <ResultPanel result={state.result} onRestart={restart}>
        {isDocx && (
          <div className="mt-8 w-full border-t border-rule pt-6 text-sm text-ink-2">
            <p>Precisa copiar ou pesquisar o texto?</p>
            <button type="button" onClick={print} className="link mt-1 inline-flex items-center gap-1.5 font-semibold">
              <Printer aria-hidden size={16} />
              Imprimir como PDF
            </button>
            <p className="mt-1 text-ink-3">Na janela de impressão, escolha “Salvar como PDF”.</p>
          </div>
        )}
      </ResultPanel>
    );
  }

  const working = state.status === 'working';
  return (
    <div className="space-y-5">
      <FileRow file={file} family="doc" onRemove={restart} disabled={working} />
      {working && (
        <Progress
          done={state.done}
          total={state.total}
          label={state.total ? `Montando página ${state.done} de ${state.total}` : 'Lendo o documento…'}
        />
      )}
      {state.status === 'error' && <ErrorNote message={state.message} />}
      <button type="button" onClick={convert} disabled={working} className="btn btn-primary w-full">
        {working ? 'Convertendo…' : 'Converter para PDF'}
      </button>
    </div>
  );
}
