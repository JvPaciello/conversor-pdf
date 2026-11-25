'use client';

import {
  Eraser,
  Highlighter,
  ImagePlus,
  MousePointer2,
  Pencil,
  Square,
  Trash2,
  Type,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { EditImage, EditItem, EditPage } from '@/lib/pdf/edit-pdf';
import type { PageInfo, PDFDocumentProxy } from '@/lib/pdf/pdf-render';
import { baseName } from '@/lib/format';
import { getTool } from '@/lib/tools';
import { Dropzone } from '../dropzone';
import { ErrorNote, FileRow, Progress, ResultPanel } from '../parts';
import { describeError, useConversion } from '../use-conversion';
import { EditorPage, type PendingImage } from './editor-page';
import { COLORS, LINE_WIDTHS, newId, TEXT_SIZES, type EditorTool, type UpdateItem } from './types';

const tool = getTool('editar');
const MAX_HISTORY = 100;

const TOOLS: { id: EditorTool; label: string; icon: LucideIcon; hint: string }[] = [
  { id: 'select', label: 'Selecionar', icon: MousePointer2, hint: 'Toque em um item para selecionar, arraste para mover e use o canto para redimensionar.' },
  { id: 'text', label: 'Texto', icon: Type, hint: 'Toque na página onde quer escrever.' },
  { id: 'draw', label: 'Desenhar', icon: Pencil, hint: 'Desenhe ou assine com o dedo ou o mouse.' },
  { id: 'rect', label: 'Retângulo', icon: Square, hint: 'Arraste para desenhar um retângulo.' },
  { id: 'whiteout', label: 'Tapar', icon: Eraser, hint: 'Arraste sobre o que quer esconder. Depois use “Texto” para escrever por cima.' },
  { id: 'highlight', label: 'Destacar', icon: Highlighter, hint: 'Arraste sobre o trecho que quer destacar.' },
  { id: 'image', label: 'Imagem', icon: ImagePlus, hint: 'Escolha uma imagem ou assinatura e toque na página para posicioná-la.' },
];

const mapItems = (fn: (items: EditItem[]) => EditItem[]) => (pages: EditPage[]) =>
  pages.map((page) => {
    const items = fn(page.items);
    return items === page.items ? page : { ...page, items };
  });

interface Loaded {
  file: File;
  bytes: Uint8Array;
  doc: PDFDocumentProxy;
  pages: PageInfo[];
}

export function EditConverter({ initialFiles }: { initialFiles?: File[] }) {
  const [file, setFile] = useState<File | null>(initialFiles?.[0] ?? null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [edits, setEdits] = useState<EditPage[]>([]);
  const history = useRef<EditPage[][]>([]);
  /** The edits as of the last change, for snapshots taken mid-gesture. */
  const latest = useRef<EditPage[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [active, setActive] = useState<EditorTool>('text');
  const [color, setColor] = useState(COLORS[0].value);
  const [textSize, setTextSize] = useState(14);
  const [lineWidth, setLineWidth] = useState(LINE_WIDTHS[1].value);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const imageInput = useRef<HTMLInputElement>(null);
  const imageUrls = useRef(new Map<string, string>());
  const { state, run, reset } = useConversion();

  // Open the file: pdf.js shows the pages, pdf-lib checks it can be saved.
  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    let close: (() => Promise<void>) | null = null;
    (async () => {
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const [{ openPdf }, { loadEditablePdf }] = await Promise.all([
          import('@/lib/pdf/pdf-render'),
          import('@/lib/pdf/edit-pdf'),
        ]);
        await loadEditablePdf(bytes);
        const opened = await openPdf(bytes);
        close = opened.close;
        const { doc, pages } = opened;
        if (cancelled) {
          opened.close();
          return;
        }
        setLoaded({ file, bytes, doc, pages });
        const initial = pages.map((_, i): EditPage => ({ source: i, rotate: 0, deleted: false, items: [] }));
        latest.current = initial;
        setEdits(initial);
        history.current = [];
        setCanUndo(false);
      } catch (error) {
        if (!cancelled) setLoadError(describeError(error));
      }
    })();
    return () => {
      cancelled = true;
      close?.();
    };
  }, [file]);

  useEffect(() => {
    const urls = imageUrls.current;
    return () => {
      for (const url of urls.values()) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  // Pages fill the width of the editor.
  const observer = useRef<ResizeObserver | null>(null);
  const pagesRef = useCallback((el: HTMLDivElement | null) => {
    observer.current?.disconnect();
    if (!el) return;
    observer.current = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.current.observe(el);
  }, []);

  const record = useCallback(() => {
    history.current = [...history.current.slice(-(MAX_HISTORY - 1)), latest.current];
    setCanUndo(true);
    if (state.status === 'done' || state.status === 'error') reset();
  }, [state.status, reset]);

  const change = useCallback(
    (fn: (pages: EditPage[]) => EditPage[], save = true) => {
      if (save) record();
      setEdits((pages) => (latest.current = fn(pages)));
    },
    [record],
  );

  const undo = useCallback(() => {
    const previous = history.current.pop();
    if (!previous) return;
    latest.current = previous;
    setEdits(previous);
    setSelectedId(null);
    setCanUndo(history.current.length > 0);
  }, []);

  const updateItem: UpdateItem = useCallback(
    (id, patch, save = true) =>
      change(
        mapItems((items) =>
          items.some((i) => i.id === id) ? items.map((i) => (i.id === id ? ({ ...i, ...patch } as EditItem) : i)) : items,
        ),
        save,
      ),
    [change],
  );

  const removeItem = useCallback(
    (id: string, save = true) =>
      change(mapItems((items) => (items.some((i) => i.id === id) ? items.filter((i) => i.id !== id) : items)), save),
    [change],
  );

  const findItem = (id: string | null) => {
    if (!id) return null;
    for (const page of edits) for (const item of page.items) if (item.id === id) return item;
    return null;
  };
  const selected = findItem(selectedId);

  const select = (id: string | null) => {
    // An empty text box disappears when it loses the selection.
    if (selected && selected.id !== id && selected.kind === 'text' && !selected.text.trim()) {
      removeItem(selected.id, false);
    }
    setSelectedId(id);
  };

  const addItem = (page: number, item: EditItem) => {
    change((pages) => pages.map((p, i) => (i === page ? { ...p, items: [...p.items, item] } : p)));
  };

  // Keyboard: Delete removes the selected item, Ctrl/Cmd+Z undoes.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) {
        event.preventDefault();
        removeItem(selectedId);
        setSelectedId(null);
      } else if (event.key === 'z' && (event.ctrlKey || event.metaKey) && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (event.key === 'Escape') {
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, removeItem, undo]);

  const chooseTool = (id: EditorTool) => {
    select(null);
    if (id === 'image') {
      imageInput.current?.click();
      if (!pendingImage) return;
    }
    setActive(id);
  };

  const onImageChosen = async (picked: File | undefined) => {
    if (!picked) return;
    setImageError(null);
    try {
      const { prepareImage } = await import('@/lib/pdf/images-to-pdf');
      const prepared = await prepareImage(picked);
      // Pixels to points, but not bigger than a signature-sized default.
      const w = Math.min(200, prepared.width * 0.75);
      setPendingImage({
        image: { key: newId(), bytes: prepared.data, type: prepared.format === 'PNG' ? 'png' : 'jpeg' },
        width: w,
        height: (w * prepared.height) / prepared.width,
      });
      setActive('image');
    } catch (error) {
      setImageError(describeError(error));
    }
  };

  const imageUrl = useCallback((image: EditImage) => {
    let url = imageUrls.current.get(image.key);
    if (!url) {
      url = URL.createObjectURL(new Blob([image.bytes as Uint8Array<ArrayBuffer>], { type: `image/${image.type}` }));
      imageUrls.current.set(image.key, url);
    }
    return url;
  }, []);

  const applyStyle = (patch: { color?: string; size?: number; lineWidth?: number }) => {
    if (patch.color) setColor(patch.color);
    if (patch.size) setTextSize(patch.size);
    if (patch.lineWidth) setLineWidth(patch.lineWidth);
    if (!selected) return;
    if (selected.kind === 'text' && (patch.color || patch.size)) {
      updateItem(selected.id, { ...(patch.color && { color: patch.color }), ...(patch.size && { size: patch.size }) });
    } else if ((selected.kind === 'ink' || (selected.kind === 'rect' && selected.style === 'outline')) && (patch.color || patch.lineWidth)) {
      updateItem(selected.id, {
        ...(patch.color && { color: patch.color }),
        ...(patch.lineWidth && { lineWidth: patch.lineWidth }),
      });
    }
  };

  const restart = () => {
    setFile(null);
    setLoaded(null);
    setLoadError(null);
    setEdits([]);
    setSelectedId(null);
    setPendingImage(null);
    history.current = [];
    setCanUndo(false);
    reset();
  };

  const save = () => {
    if (!loaded) return;
    select(null);
    const pages = edits.map((p) => ({ ...p, items: p.items.filter((i) => i.kind !== 'text' || i.text.trim()) }));
    run(async () => {
      const { applyEdits } = await import('@/lib/pdf/edit-pdf');
      const { blob, pages: count } = await applyEdits(loaded.bytes, pages);
      return { blob, pages: count, fileName: `${baseName(loaded.file.name)}-editado.pdf` };
    });
  };

  if (!file) {
    return (
      <Dropzone
        formats={tool.formats}
        onFiles={([picked]) => setFile(picked)}
        title="Solte o PDF aqui"
        buttonLabel="Escolher PDF"
      />
    );
  }

  if (state.status === 'done') {
    return (
      <ResultPanel result={state.result} onRestart={restart} restartLabel="Editar outro PDF">
        <button type="button" onClick={reset} className="link mt-6 text-sm font-semibold">
          Voltar e continuar editando
        </button>
      </ResultPanel>
    );
  }

  if (!loaded) {
    return (
      <div className="space-y-5">
        <FileRow file={file} family="pdf" onRemove={restart} />
        {loadError ? <ErrorNote message={loadError} /> : <Progress done={0} total={0} label="Abrindo o PDF…" />}
      </div>
    );
  }

  const working = state.status === 'working';
  const current = TOOLS.find((t) => t.id === active)!;
  const styleTarget = selected ?? null;
  const showColors =
    active === 'text' || active === 'draw' || active === 'rect' ||
    (styleTarget !== null && (styleTarget.kind === 'text' || styleTarget.kind === 'ink' || (styleTarget.kind === 'rect' && styleTarget.style === 'outline')));
  const showTextSize = active === 'text' || styleTarget?.kind === 'text';
  const showLineWidth =
    active === 'draw' || active === 'rect' || styleTarget?.kind === 'ink' || (styleTarget?.kind === 'rect' && styleTarget.style === 'outline');
  const shownColor = styleTarget && 'color' in styleTarget ? styleTarget.color : color;
  const shownSize = styleTarget?.kind === 'text' ? styleTarget.size : textSize;
  const shownWidth = styleTarget && 'lineWidth' in styleTarget ? styleTarget.lineWidth : lineWidth;
  const kept = edits.filter((p) => !p.deleted).length;

  return (
    <div className="space-y-5">
      <FileRow file={loaded.file} family="pdf" onRemove={restart} disabled={working} />

      <div className="sticky top-16 z-20 -mx-2 space-y-3 rounded-lg bg-paper/95 px-2 py-3 shadow-[0_1px_0_var(--rule)] backdrop-blur">
        <div role="toolbar" aria-label="Ferramentas" className="flex flex-wrap gap-1">
          {TOOLS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={active === id}
              onClick={() => chooseTool(id)}
              disabled={working}
              className="flex min-w-16 flex-col items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-ink-2 hover:bg-desk hover:text-ink aria-pressed:bg-stamp-wash aria-pressed:text-stamp disabled:opacity-50"
            >
              <Icon aria-hidden size={20} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {showColors && (
            <div role="radiogroup" aria-label="Cor" className="flex gap-1">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  role="radio"
                  aria-checked={shownColor === c.value}
                  aria-label={c.label}
                  title={c.label}
                  onClick={() => applyStyle({ color: c.value })}
                  className="size-7 rounded-full border border-ink-3/40 aria-checked:ring-2 aria-checked:ring-stamp aria-checked:ring-offset-2 aria-checked:ring-offset-paper"
                  style={{ background: c.value }}
                />
              ))}
            </div>
          )}
          {showTextSize && (
            <label className="flex items-center gap-2 text-sm">
              Tamanho
              <select
                value={shownSize}
                onChange={(e) => applyStyle({ size: Number(e.target.value) })}
                className="rounded-md border border-rule bg-paper px-2 py-1"
              >
                {TEXT_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          )}
          {showLineWidth && (
            <label className="flex items-center gap-2 text-sm">
              Traço
              <select
                value={shownWidth}
                onChange={(e) => applyStyle({ lineWidth: Number(e.target.value) })}
                className="rounded-md border border-rule bg-paper px-2 py-1"
              >
                {LINE_WIDTHS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="ml-auto flex gap-1">
            <button type="button" onClick={undo} disabled={!canUndo || working} className="btn btn-secondary px-3 py-1.5 text-sm">
              <Undo2 aria-hidden size={16} />
              Desfazer
            </button>
            {selected && (
              <button
                type="button"
                onClick={() => {
                  removeItem(selected.id);
                  setSelectedId(null);
                }}
                className="btn btn-secondary px-3 py-1.5 text-sm text-danger"
              >
                <Trash2 aria-hidden size={16} />
                Excluir item
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-ink-2" aria-live="polite">
          {active === 'image' && pendingImage
            ? 'Toque na página para colocar a imagem.'
            : current.hint}
        </p>
        {imageError && <ErrorNote message={imageError} />}
      </div>

      <input
        ref={imageInput}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          onImageChosen(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <div ref={pagesRef} className="space-y-6">
        {width > 0 &&
          edits.map((edit, i) => (
            <EditorPage
              key={i}
              index={i}
              doc={loaded.doc}
              info={loaded.pages[i]}
              edit={edit}
              width={width}
              tool={working ? 'select' : active}
              color={color}
              textSize={textSize}
              lineWidth={lineWidth}
              selectedId={selectedId}
              pendingImage={pendingImage}
              imageUrl={imageUrl}
              onSelect={select}
              onAdd={addItem}
              onUpdate={updateItem}
              onRecord={record}
              onImagePlaced={() => {
                setPendingImage(null);
                setActive('select');
              }}
              onRotate={(page) =>
                change((pages) =>
                  pages.map((p, j) => (j === page ? { ...p, rotate: ((p.rotate + 90) % 360) as EditPage['rotate'] } : p)),
                )
              }
              onToggleDelete={(page) =>
                change((pages) => pages.map((p, j) => (j === page ? { ...p, deleted: !p.deleted } : p)))
              }
            />
          ))}
      </div>

      <div className="sticky bottom-0 z-20 -mx-2 space-y-3 bg-paper/95 px-2 py-3 backdrop-blur">
        {working && <Progress done={0} total={0} label="Salvando o PDF…" />}
        {state.status === 'error' && <ErrorNote message={state.message} />}
        <button type="button" onClick={save} disabled={working || kept === 0} className="btn btn-primary w-full">
          {working ? 'Salvando…' : kept === 0 ? 'Mantenha pelo menos uma página' : 'Salvar PDF editado'}
        </button>
      </div>
    </div>
  );
}
