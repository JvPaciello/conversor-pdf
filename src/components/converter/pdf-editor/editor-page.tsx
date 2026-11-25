'use client';

import { RotateCw, Trash2, Undo2 } from 'lucide-react';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  normalizeRotation,
  pdfToView,
  rotateVector,
  viewSize,
  viewToPdf,
  type Point,
  type Rotation,
} from '@/lib/pdf/edit-geometry';
import { TEXT_LINE_HEIGHT, type EditImage, type EditItem, type EditPage } from '@/lib/pdf/edit-pdf';
import type { PageInfo, PDFDocumentProxy, RenderTask } from '@/lib/pdf/pdf-render';
import { IconButton } from '../parts';
import { HIGHLIGHT_COLOR, newId, WHITEOUT_COLOR, type EditorTool, type UpdateItem } from './types';

const FONT_FAMILY = 'Helvetica, Arial, sans-serif';
const MAX_CANVAS_PIXELS = 16_000_000;
const MIN_BOX = 6;

export interface PendingImage {
  image: EditImage;
  width: number;
  height: number;
}

interface Props {
  index: number;
  doc: PDFDocumentProxy;
  info: PageInfo;
  edit: EditPage;
  width: number;
  tool: EditorTool;
  color: string;
  textSize: number;
  lineWidth: number;
  selectedId: string | null;
  pendingImage: PendingImage | null;
  imageUrl: (image: EditImage) => string;
  onSelect: (id: string | null) => void;
  onAdd: (page: number, item: EditItem) => void;
  onUpdate: UpdateItem;
  onRecord: () => void;
  onImagePlaced: () => void;
  onRotate: (page: number) => void;
  onToggleDelete: (page: number) => void;
}

type Draft =
  | { kind: 'ink'; start: Point; points: Point[] }
  | { kind: 'box'; start: Point; end: Point }
  | null;

export function EditorPage(props: Props) {
  const { index, doc, info, edit, width, tool, selectedId } = props;
  const rotation = normalizeRotation(info.rotation + edit.rotate);
  const size = viewSize(info.box, rotation);
  const scale = width / size.width;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [draft, setDraft] = useState<Draft>(null);

  // Render only pages near the screen.
  useEffect(() => {
    const el = overlayRef.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setVisible(true);
    }, { rootMargin: '800px 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible || width <= 0) return;
    let task: RenderTask | null = null;
    let cancelled = false;
    (async () => {
      const [{ renderPage }, page] = await Promise.all([import('@/lib/pdf/pdf-render'), doc.getPage(index + 1)]);
      if (cancelled || !canvasRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      const ideal = scale * dpr;
      const cap = Math.sqrt(MAX_CANVAS_PIXELS / (size.width * size.height));
      task = renderPage(page, canvasRef.current, Math.min(ideal, cap), rotation);
      try {
        await task.promise;
        if (!cancelled) setRendered(true);
      } catch {
        // Cancelled by a newer render.
      }
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [visible, doc, index, scale, rotation, size.width, size.height, width]);

  const toView = (event: { clientX: number; clientY: number }): Point => {
    const rect = overlayRef.current!.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / scale, y: (event.clientY - rect.top) / scale };
  };

  const drawing = tool === 'draw' || tool === 'rect' || tool === 'whiteout' || tool === 'highlight';

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (edit.deleted || event.target !== event.currentTarget || event.button !== 0) return;
    const p = toView(event);
    if (tool === 'select') {
      props.onSelect(null);
      return;
    }
    if (tool === 'text') {
      const item: EditItem = {
        id: newId(),
        kind: 'text',
        anchor: viewToPdf({ x: p.x, y: p.y - (props.textSize * TEXT_LINE_HEIGHT) / 2 }, info.box, rotation),
        rot: rotation,
        text: '',
        size: props.textSize,
        color: props.color,
      };
      props.onAdd(index, item);
      props.onSelect(item.id);
      event.preventDefault(); // keep the focus on the new text box
      return;
    }
    if (tool === 'image') {
      const pending = props.pendingImage;
      if (!pending) return;
      const w = Math.min(pending.width, size.width * 0.6);
      const h = (w * pending.height) / pending.width;
      const item: EditItem = {
        id: newId(),
        kind: 'image',
        anchor: viewToPdf({ x: p.x - w / 2, y: p.y - h / 2 }, info.box, rotation),
        rot: rotation,
        w,
        h,
        image: pending.image,
      };
      props.onAdd(index, item);
      props.onSelect(item.id);
      props.onImagePlaced();
      return;
    }
    if (drawing) {
      // Without this, a drag selects text and the next drag turns into drag-and-drop.
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setDraft(tool === 'draw' ? { kind: 'ink', start: p, points: [{ x: 0, y: 0 }] } : { kind: 'box', start: p, end: p });
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draft) return;
    const p = toView(event);
    if (draft.kind === 'ink') {
      const last = draft.points[draft.points.length - 1];
      const local = { x: p.x - draft.start.x, y: p.y - draft.start.y };
      if (Math.hypot(local.x - last.x, local.y - last.y) < 0.75) return;
      setDraft({ ...draft, points: [...draft.points, local] });
    } else {
      setDraft({ ...draft, end: p });
    }
  };

  const onPointerUp = () => {
    if (!draft) return;
    setDraft(null);
    if (draft.kind === 'ink') {
      props.onAdd(index, {
        id: newId(),
        kind: 'ink',
        anchor: viewToPdf(draft.start, info.box, rotation),
        rot: rotation,
        points: draft.points,
        color: props.color,
        lineWidth: props.lineWidth,
      });
      return;
    }
    let x = Math.min(draft.start.x, draft.end.x);
    let y = Math.min(draft.start.y, draft.end.y);
    let w = Math.abs(draft.end.x - draft.start.x);
    let h = Math.abs(draft.end.y - draft.start.y);
    if (w < MIN_BOX && h < MIN_BOX) {
      // A tap: a box of a sensible default size, centred on it.
      [w, h] = tool === 'rect' ? [120, 60] : [140, 18];
      x -= w / 2;
      y -= h / 2;
    }
    const item: EditItem = {
      id: newId(),
      kind: 'rect',
      anchor: viewToPdf({ x, y }, info.box, rotation),
      rot: rotation,
      w: Math.max(w, MIN_BOX),
      h: Math.max(h, MIN_BOX),
      color: tool === 'whiteout' ? WHITEOUT_COLOR : tool === 'highlight' ? HIGHLIGHT_COLOR : props.color,
      style: tool === 'rect' ? 'outline' : tool === 'highlight' ? 'highlight' : 'fill',
      lineWidth: props.lineWidth,
    };
    props.onAdd(index, item);
  };

  return (
    <section aria-label={`Página ${index + 1}`} className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink-2">
          Página {index + 1}
          {edit.deleted && <span className="ml-2 font-normal text-danger">(será excluída)</span>}
        </h3>
        <div className="flex">
          <IconButton label={`Girar página ${index + 1}`} disabled={edit.deleted} onClick={() => props.onRotate(index)}>
            <RotateCw aria-hidden size={18} />
          </IconButton>
          <IconButton
            label={edit.deleted ? `Manter página ${index + 1}` : `Excluir página ${index + 1}`}
            onClick={() => props.onToggleDelete(index)}
          >
            {edit.deleted ? <Undo2 aria-hidden size={18} /> : <Trash2 aria-hidden size={18} />}
          </IconButton>
        </div>
      </div>

      <div
        className="relative overflow-hidden bg-white select-none shadow-[0_1px_0_var(--paper-edge),0_0_0_1px_var(--rule)]"
        style={{ width: size.width * scale, height: size.height * scale }}
      >
        <canvas
          ref={canvasRef}
          aria-hidden
          className={`absolute inset-0 size-full transition-opacity ${rendered ? 'opacity-100' : 'opacity-0'} ${edit.deleted ? 'grayscale' : ''}`}
        />
        {!rendered && <div className="absolute inset-0 animate-pulse bg-desk" />}

        <div
          ref={overlayRef}
          role="presentation"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => setDraft(null)}
          className="absolute inset-0"
          style={{
            touchAction: drawing || (tool === 'image' && props.pendingImage) ? 'none' : 'pan-y pinch-zoom',
            cursor: edit.deleted ? 'default' : tool === 'select' ? 'default' : tool === 'text' ? 'text' : 'crosshair',
          }}
        >
          {edit.items.map((item) => (
            <ItemView
              key={item.id}
              item={item}
              rotation={rotation}
              info={info}
              scale={scale}
              selected={item.id === selectedId}
              // With “Texto”, only text boxes catch the pointer, so it is possible to write over shapes.
              interactive={!edit.deleted && (tool === 'select' || (tool === 'text' && item.kind === 'text'))}
              tool={tool}
              imageUrl={props.imageUrl}
              onSelect={props.onSelect}
              onUpdate={props.onUpdate}
              onRecord={props.onRecord}
            />
          ))}
          {draft && <DraftView draft={draft} scale={scale} tool={tool} color={props.color} lineWidth={props.lineWidth} />}
        </div>

        {edit.deleted && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-desk/70">
            <span className="rounded-md bg-paper px-3 py-1.5 text-sm font-semibold text-danger shadow">Página excluída</span>
          </div>
        )}
      </div>
    </section>
  );
}

function DraftView({
  draft,
  scale,
  tool,
  color,
  lineWidth,
}: {
  draft: NonNullable<Draft>;
  scale: number;
  tool: EditorTool;
  color: string;
  lineWidth: number;
}) {
  if (draft.kind === 'ink') {
    return (
      <svg className="pointer-events-none absolute overflow-visible" style={{ left: draft.start.x * scale, top: draft.start.y * scale }} width={1} height={1}>
        <polyline
          points={draft.points.map((p) => `${p.x * scale},${p.y * scale}`).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth={lineWidth * scale}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  const x = Math.min(draft.start.x, draft.end.x) * scale;
  const y = Math.min(draft.start.y, draft.end.y) * scale;
  const w = Math.abs(draft.end.x - draft.start.x) * scale;
  const h = Math.abs(draft.end.y - draft.start.y) * scale;
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        ...(tool === 'rect'
          ? { border: `${lineWidth * scale}px solid ${color}` }
          : tool === 'highlight'
            ? { background: HIGHLIGHT_COLOR, opacity: 0.35 }
            : { background: WHITEOUT_COLOR, outline: '1px dashed var(--ink-3)' }),
      }}
    />
  );
}

interface ItemViewProps {
  item: EditItem;
  rotation: Rotation;
  info: PageInfo;
  scale: number;
  selected: boolean;
  interactive: boolean;
  tool: EditorTool;
  imageUrl: (image: EditImage) => string;
  onSelect: (id: string | null) => void;
  onUpdate: UpdateItem;
  onRecord: () => void;
}

function ItemView({ item, rotation, info, scale, selected, interactive, tool, imageUrl, onSelect, onUpdate, onRecord }: ItemViewProps) {
  const at = pdfToView(item.anchor, info.box, rotation);
  // Typing is saved for “Desfazer” once per editing session, on the first change.
  const typing = useRef(false);
  const turn = normalizeRotation(rotation - item.rot);

  /** Moves the item, or resizes it from the corner handle, following the pointer. */
  const startGesture = (event: ReactPointerEvent, mode: 'move' | 'resize') => {
    if (!interactive || event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    onSelect(item.id);
    const startX = event.clientX;
    const startY = event.clientY;
    const startAt = at;
    const startW = 'w' in item ? item.w : 0;
    const startH = 'h' in item ? item.h : 0;
    let recorded = false;

    const move = (e: PointerEvent) => {
      const delta = { x: (e.clientX - startX) / scale, y: (e.clientY - startY) / scale };
      if (!recorded) {
        if (Math.hypot(delta.x, delta.y) < 1) return;
        onRecord();
        recorded = true;
      }
      if (mode === 'move') {
        onUpdate(item.id, { anchor: viewToPdf({ x: startAt.x + delta.x, y: startAt.y + delta.y }, info.box, rotation) }, false);
        return;
      }
      // Resize happens in the item's own frame.
      const local = rotateVector(delta, normalizeRotation(item.rot - rotation));
      if (item.kind === 'image') {
        const w = Math.max(12, startW + local.x);
        onUpdate(item.id, { w, h: (w * startH) / startW }, false);
      } else if (item.kind === 'rect') {
        onUpdate(item.id, { w: Math.max(MIN_BOX, startW + local.x), h: Math.max(MIN_BOX, startH + local.y) }, false);
      }
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const frame = {
    position: 'absolute' as const,
    left: at.x * scale,
    top: at.y * scale,
    transform: turn ? `rotate(${turn}deg)` : undefined,
    transformOrigin: '0 0',
    pointerEvents: interactive ? ('auto' as const) : ('none' as const),
    touchAction: 'none',
  };
  const outline = selected ? 'outline-2 outline-offset-2 outline-dashed outline-stamp' : '';

  if (item.kind === 'text') {
    return (
      <div style={{ ...frame, cursor: interactive ? 'move' : undefined }}>
        <TextBox
          item={item}
          scale={scale}
          selected={selected}
          editable={interactive}
          onPointerDown={(e) => startGesture(e, 'move')}
          onFocus={() => {
            onSelect(item.id);
            typing.current = true;
          }}
          onChange={(text) => {
            if (typing.current) onRecord();
            typing.current = false;
            onUpdate(item.id, { text }, false);
          }}
          autoFocus={selected && tool === 'text' && item.text === ''}
        />
      </div>
    );
  }

  if (item.kind === 'ink') {
    const points = item.points.map((p) => `${p.x * scale},${p.y * scale}`).join(' ');
    return (
      <svg style={{ ...frame, overflow: 'visible', pointerEvents: 'none' }} width={1} height={1} className={selected ? 'drop-shadow-[0_0_2px_var(--stamp)]' : ''}>
        <polyline
          points={points}
          fill="none"
          stroke="transparent"
          strokeWidth={Math.max(item.lineWidth * scale, 14)}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pointerEvents: interactive ? 'stroke' : 'none', cursor: 'move' }}
          onPointerDown={(e) => startGesture(e, 'move')}
        />
        <polyline
          points={points}
          fill="none"
          stroke={item.color}
          strokeWidth={item.lineWidth * scale}
          strokeLinecap="round"
          strokeLinejoin="round"
          pointerEvents="none"
        />
      </svg>
    );
  }

  const body =
    item.kind === 'image' ? (
      // eslint-disable-next-line @next/next/no-img-element -- local blob URL
      <img src={imageUrl(item.image)} alt="" draggable={false} className="size-full select-none" />
    ) : null;

  const boxStyle =
    item.kind === 'rect'
      ? item.style === 'outline'
        ? { border: `${item.lineWidth * scale}px solid ${item.color}` }
        : { background: item.color, opacity: item.style === 'highlight' ? 0.35 : 1 }
      : {};

  return (
    <div
      style={{ ...frame, width: item.w * scale, height: item.h * scale, cursor: interactive ? 'move' : undefined }}
      className={outline}
      onPointerDown={(e) => startGesture(e, 'move')}
    >
      <div className="size-full" style={boxStyle}>
        {body}
      </div>
      {selected && interactive && (
        <span
          role="presentation"
          onPointerDown={(e) => startGesture(e, 'resize')}
          className="absolute -right-2 -bottom-2 size-4 cursor-nwse-resize rounded-sm border-2 border-paper bg-stamp"
          style={{ touchAction: 'none' }}
        />
      )}
    </div>
  );
}

let measureCanvas: HTMLCanvasElement | null = null;
function measureLines(lines: string[], fontPx: number) {
  measureCanvas ??= document.createElement('canvas');
  const ctx = measureCanvas.getContext('2d')!;
  ctx.font = `${fontPx}px ${FONT_FAMILY}`;
  return Math.max(...lines.map((line) => ctx.measureText(line).width));
}

function TextBox({
  item,
  scale,
  selected,
  editable,
  autoFocus,
  onPointerDown,
  onFocus,
  onChange,
}: {
  item: Extract<EditItem, { kind: 'text' }>;
  scale: number;
  selected: boolean;
  editable: boolean;
  autoFocus: boolean;
  onPointerDown: (event: ReactPointerEvent) => void;
  onFocus: () => void;
  onChange: (text: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fontPx = item.size * scale;
  const lines = item.text.split('\n');
  const placeholder = 'Digite aqui';
  const width = measureLines(item.text ? lines : [placeholder], fontPx) + fontPx * 0.6;
  const height = lines.length * TEXT_LINE_HEIGHT * fontPx;

  useEffect(() => {
    if (autoFocus) ref.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  // The dashed frame around the text is the handle to move it.
  const pad = 6;
  return (
    <div
      onPointerDown={onPointerDown}
      className={`absolute rounded-sm border border-dashed ${selected ? 'border-stamp' : editable ? 'border-transparent hover:border-ink-3' : 'border-transparent'}`}
      style={{ left: -pad, top: -pad, padding: pad - 1 }}
    >
      <textarea
        ref={ref}
        value={item.text}
        placeholder={placeholder}
        aria-label="Texto"
        spellCheck={false}
        readOnly={!editable}
        tabIndex={editable ? 0 : -1}
        onPointerDown={(e) => e.stopPropagation()}
        onFocus={onFocus}
        onChange={(e) => onChange(e.target.value)}
        className="block resize-none overflow-hidden select-text border-0 bg-transparent p-0 whitespace-pre outline-none placeholder:text-ink-3/70"
        style={{
          width,
          height,
          font: `${fontPx}px/${TEXT_LINE_HEIGHT} ${FONT_FAMILY}`,
          color: item.color,
          cursor: editable ? 'text' : 'default',
        }}
      />
    </div>
  );
}
