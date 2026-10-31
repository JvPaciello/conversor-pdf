'use client';

import { ArrowDown, ArrowUp, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { MarginSize, Orientation, PageSize } from '@/lib/pdf/page-layout';
import { formatBytes, pdfName } from '@/lib/format';
import { getTool, MAX_IMAGES } from '@/lib/tools';
import { Dropzone } from './dropzone';
import { ErrorNote, Progress, ResultPanel, Segmented } from './parts';
import { useConversion } from './use-conversion';

const tool = getTool('imagem');

interface Item {
  id: number;
  file: File;
}

let nextId = 0;
const toItems = (files: File[]): Item[] => files.map((file) => ({ id: nextId++, file }));

export function ImageConverter({ initialFiles }: { initialFiles?: File[] }) {
  const [items, setItems] = useState<Item[]>(() => toItems((initialFiles ?? []).slice(0, MAX_IMAGES)));
  const [overflow, setOverflow] = useState(false);
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [orientation, setOrientation] = useState<Orientation>('auto');
  const [margin, setMargin] = useState<MarginSize>('small');
  const { state, run, reset } = useConversion();
  const hasItems = items.length > 0;

  useEffect(() => {
    if (!hasItems) return;
    import('@/lib/pdf/images-to-pdf').catch(() => {});
  }, [hasItems]);

  const add = (files: File[]) => {
    setOverflow(items.length + files.length > MAX_IMAGES);
    setItems((prev) => [...prev, ...toItems(files)].slice(0, MAX_IMAGES));
    if (state.status !== 'working') reset();
  };

  const remove = (id: number) => {
    setOverflow(false);
    setItems((prev) => prev.filter((item) => item.id !== id));
    reset();
  };

  const move = (index: number, delta: number) => {
    setItems((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item);
      return next;
    });
    reset();
  };

  const restart = () => {
    setItems([]);
    setOverflow(false);
    reset();
  };

  const convert = () => {
    const files = items.map((item) => item.file);
    run(async (progress) => {
      const { imagesToPdf } = await import('@/lib/pdf/images-to-pdf');
      const { blob, pages } = await imagesToPdf(files, { pageSize, orientation, margin }, progress);
      return { blob, pages, fileName: files.length === 1 ? pdfName(files[0].name) : 'imagens.pdf' };
    });
  };

  if (!hasItems) {
    return (
      <Dropzone
        formats={tool.formats}
        multiple
        onFiles={add}
        title="Solte as imagens aqui"
        buttonLabel="Escolher imagens"
      />
    );
  }

  if (state.status === 'done') {
    return <ResultPanel result={state.result} onRestart={restart} restartLabel="Converter outras imagens" />;
  }

  const working = state.status === 'working';
  const total = items.reduce((sum, item) => sum + item.file.size, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 flex justify-between text-sm text-ink-2">
          <span className="font-semibold text-ink">
            {items.length === 1 ? '1 imagem' : `${items.length} imagens`}
          </span>
          <span>{formatBytes(total)}</span>
        </p>
        <ol className="max-h-[26rem] space-y-2 overflow-y-auto" aria-label="Imagens na ordem das páginas">
          {items.map((item, index) => (
            <li key={item.id} className="flex items-center gap-3 rounded-lg bg-desk p-2 pr-1">
              <span className="w-6 shrink-0 text-center text-sm font-semibold text-ink-3">{index + 1}</span>
              <Thumbnail file={item.file} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.file.name}</p>
                <p className="text-xs text-ink-2">{formatBytes(item.file.size)}</p>
              </div>
              <div className="flex shrink-0">
                <IconButton label={`Mover ${item.file.name} para cima`} disabled={working || index === 0} onClick={() => move(index, -1)}>
                  <ArrowUp aria-hidden size={18} />
                </IconButton>
                <IconButton
                  label={`Mover ${item.file.name} para baixo`}
                  disabled={working || index === items.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown aria-hidden size={18} />
                </IconButton>
                <IconButton label={`Remover ${item.file.name}`} disabled={working} onClick={() => remove(item.id)}>
                  <X aria-hidden size={18} />
                </IconButton>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {overflow && <ErrorNote message={`O limite é de ${MAX_IMAGES} imagens por PDF. As imagens a mais foram ignoradas.`} />}
      {items.length < MAX_IMAGES && !working && (
        <Dropzone formats={tool.formats} multiple compact onFiles={add} buttonLabel="Adicionar mais imagens" />
      )}

      <div className="grid gap-5">
        <Segmented
          legend="Tamanho da página"
          value={pageSize}
          onChange={setPageSize}
          disabled={working}
          options={[
            { value: 'a4', label: 'A4' },
            { value: 'letter', label: 'Carta' },
            { value: 'fit', label: 'Igual à imagem' },
          ]}
        />
        <Segmented
          legend="Orientação"
          value={orientation}
          onChange={setOrientation}
          disabled={working || pageSize === 'fit'}
          options={[
            { value: 'auto', label: 'Automática' },
            { value: 'portrait', label: 'Retrato' },
            { value: 'landscape', label: 'Paisagem' },
          ]}
        />
        <Segmented
          legend="Margem"
          value={margin}
          onChange={setMargin}
          disabled={working}
          options={[
            { value: 'none', label: 'Sem margem' },
            { value: 'small', label: 'Pequena' },
            { value: 'large', label: 'Grande' },
          ]}
        />
      </div>

      {working && (
        <Progress
          done={state.done}
          total={state.total}
          label={state.total ? `Adicionando imagem ${state.done} de ${state.total}` : 'Preparando as imagens…'}
        />
      )}
      {state.status === 'error' && <ErrorNote message={state.message} />}

      <button type="button" onClick={convert} disabled={working} className="btn btn-primary w-full">
        {working
          ? 'Convertendo…'
          : items.length === 1
            ? 'Converter para PDF'
            : `Converter ${items.length} imagens para PDF`}
      </button>
    </div>
  );
}

function Thumbnail({ file }: { file: File }) {
  // Object URLs are created and revoked with the <img> element itself.
  const ref = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) return;
      const url = URL.createObjectURL(file);
      img.src = url;
      return () => URL.revokeObjectURL(url);
    },
    [file],
  );
  // eslint-disable-next-line @next/next/no-img-element -- local blob URL, nothing to optimize
  return <img ref={ref} alt="" decoding="async" className="size-12 shrink-0 rounded bg-paper object-cover" />;
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-md text-ink-2 hover:bg-paper hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
