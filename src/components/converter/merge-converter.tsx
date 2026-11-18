'use client';

import { ArrowDown, ArrowDownAZ, ArrowUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormatBadge } from '@/components/format-badge';
import { extensionOf, formatBytes } from '@/lib/format';
import { getTool, MAX_MERGE_FILES, toolForFile } from '@/lib/tools';
import { Dropzone } from './dropzone';
import { ErrorNote, IconButton, Progress, ResultPanel } from './parts';
import { useConversion } from './use-conversion';

const tool = getTool('juntar');

interface Item {
  id: number;
  file: File;
}

let nextId = 0;
const toItems = (files: File[]): Item[] => files.map((file) => ({ id: nextId++, file }));
const isPdf = (file: File) => extensionOf(file.name) === 'pdf';

export function MergeConverter({ initialFiles }: { initialFiles?: File[] }) {
  const [items, setItems] = useState<Item[]>(() => toItems((initialFiles ?? []).slice(0, MAX_MERGE_FILES)));
  const [overflow, setOverflow] = useState(false);
  const [pageCounts, setPageCounts] = useState<Map<File, number | null>>(() => new Map());
  const { state, run, reset } = useConversion();
  const hasItems = items.length > 0;

  // Load the converters the chosen files need, and count the pages of each PDF.
  useEffect(() => {
    if (!hasItems) return;
    let cancelled = false;
    const files = items.map((item) => item.file);
    import('@/lib/pdf/files-to-pdf')
      .then((lib) => lib.preloadFor(files))
      .catch(() => {});
    const uncounted = files.filter((f) => isPdf(f) && !pageCounts.has(f));
    if (uncounted.length) {
      import('@/lib/pdf/merge-pdf')
        .then(async ({ countPdfPages }) => {
          const counted = await Promise.all(
            uncounted.map(async (f) => [f, await countPdfPages(await f.arrayBuffer())] as const),
          );
          if (!cancelled) setPageCounts((prev) => new Map([...prev, ...counted]));
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [hasItems, items, pageCounts]);

  const add = (files: File[]) => {
    setOverflow(items.length + files.length > MAX_MERGE_FILES);
    setItems((prev) => [...prev, ...toItems(files)].slice(0, MAX_MERGE_FILES));
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

  const sortByName = () => {
    const collator = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' });
    setItems((prev) => [...prev].sort((a, b) => collator.compare(a.file.name, b.file.name)));
    reset();
  };

  const restart = () => {
    setItems([]);
    setOverflow(false);
    reset();
  };

  const merge = () => {
    const files = items.map((item) => item.file);
    run(async (progress) => {
      const { filesToPdf } = await import('@/lib/pdf/files-to-pdf');
      const { blob, pages } = await filesToPdf(files, progress);
      return { blob, pages, fileName: 'arquivos-juntos.pdf' };
    });
  };

  if (!hasItems) {
    return (
      <Dropzone
        formats={tool.formats}
        multiple
        onFiles={add}
        title="Solte os arquivos aqui"
        buttonLabel="Escolher arquivos"
      />
    );
  }

  if (state.status === 'done') {
    return <ResultPanel result={state.result} onRestart={restart} restartLabel="Juntar outros arquivos" />;
  }

  const working = state.status === 'working';
  const total = items.reduce((sum, item) => sum + item.file.size, 0);
  const steps = items.length + 1;

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-4 text-sm text-ink-2">
          <span>
            <span className="font-semibold text-ink">
              {items.length === 1 ? '1 arquivo' : `${items.length} arquivos`}
            </span>
            , {formatBytes(total)}
          </span>
          {items.length > 1 && (
            <button
              type="button"
              onClick={sortByName}
              disabled={working}
              className="link inline-flex items-center gap-1 disabled:opacity-40"
            >
              <ArrowDownAZ aria-hidden size={16} />
              Ordenar por nome
            </button>
          )}
        </div>
        <ol className="max-h-[26rem] space-y-2 overflow-y-auto" aria-label="Arquivos na ordem em que entram no PDF">
          {items.map((item, index) => {
            const ext = extensionOf(item.file.name);
            const family = toolForFile(item.file.name)?.family ?? 'pdf';
            const pages = pageCounts.get(item.file);
            return (
              <li key={item.id} className="flex items-center gap-3 rounded-lg bg-desk p-2 pr-1">
                <span className="w-6 shrink-0 text-center text-sm font-semibold text-ink-3">{index + 1}</span>
                <span className="flex w-14 shrink-0 justify-center">
                  <FormatBadge ext={ext === 'jpeg' ? 'jpg' : ext} family={family} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.file.name}</p>
                  <p className="text-xs text-ink-2">
                    {formatBytes(item.file.size)}
                    {typeof pages === 'number' && ` · ${pages === 1 ? '1 página' : `${pages} páginas`}`}
                    {!isPdf(item.file) && ' · será convertido'}
                  </p>
                </div>
                <div className="flex shrink-0">
                  <IconButton
                    label={`Mover ${item.file.name} para cima`}
                    disabled={working || index === 0}
                    onClick={() => move(index, -1)}
                  >
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
            );
          })}
        </ol>
      </div>

      {overflow && (
        <ErrorNote message={`O limite é de ${MAX_MERGE_FILES} arquivos por PDF. Os arquivos a mais foram ignorados.`} />
      )}
      {items.length < MAX_MERGE_FILES && !working && (
        <Dropzone formats={tool.formats} multiple compact onFiles={add} buttonLabel="Adicionar mais arquivos" />
      )}

      {working && (
        <Progress
          done={state.done}
          total={state.total}
          label={
            !state.total
              ? 'Preparando os arquivos…'
              : state.done < steps - 1
                ? `Lendo arquivo ${state.done + 1} de ${items.length}`
                : 'Juntando as páginas…'
          }
        />
      )}
      {state.status === 'error' && <ErrorNote message={state.message} />}

      <button type="button" onClick={merge} disabled={working} className="btn btn-primary w-full">
        {working ? 'Juntando…' : items.length === 1 ? 'Gerar PDF' : `Juntar ${items.length} arquivos em um PDF`}
      </button>
    </div>
  );
}
