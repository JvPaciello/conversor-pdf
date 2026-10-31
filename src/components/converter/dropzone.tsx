'use client';

import { FileUp } from 'lucide-react';
import { useEffect, useId, useRef, useState, type DragEvent } from 'react';
import { FormatBadge } from '@/components/format-badge';
import { extensionOf } from '@/lib/format';
import { acceptAttr, matchesFormats, type FileFormat } from '@/lib/tools';

interface DropzoneProps {
  formats: FileFormat[];
  onFiles: (files: File[]) => void;
  buttonLabel: string;
  title?: string;
  multiple?: boolean;
  /** Small inline variant, used to add more files to a list. */
  compact?: boolean;
}

export function Dropzone({ formats, onFiles, buttonLabel, title, multiple = false, compact = false }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const depth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const hintId = useId();

  useBlockStrayDrops();

  const take = (list: FileList | File[]) => {
    const files = Array.from(list);
    const accepted = files.filter((f) => matchesFormats(f.name, formats));
    const rejected = files.filter((f) => !matchesFormats(f.name, formats));
    setRejection(rejected.length ? rejectionMessage(rejected, formats) : null);
    if (accepted.length) onFiles(multiple ? accepted : accepted.slice(0, 1));
  };

  const onDrag = (event: DragEvent) => {
    if (!event.dataTransfer.types.includes('Files')) return;
    event.preventDefault();
    if (event.type === 'dragenter') depth.current += 1;
    if (event.type === 'dragleave') depth.current -= 1;
    setDragging(depth.current > 0);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    depth.current = 0;
    setDragging(false);
    if (event.dataTransfer.files.length) take(event.dataTransfer.files);
  };

  const shown = formats.filter((f) => f.ext !== 'jpeg');

  return (
    <div
      onDragEnter={onDrag}
      onDragOver={onDrag}
      onDragLeave={onDrag}
      onDrop={onDrop}
      onClick={(event) => {
        if (!(event.target as HTMLElement).closest('button, a')) inputRef.current?.click();
      }}
      data-dragging={dragging || undefined}
      className={`relative flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-rule text-center transition-colors hover:border-ink-3 data-dragging:border-stamp data-dragging:bg-stamp-wash ${
        compact ? 'gap-2 px-4 py-5' : 'gap-4 px-5 py-10 sm:py-14'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr(formats)}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          if (event.target.files?.length) take(event.target.files);
          event.target.value = ''; // allow picking the same file again
        }}
      />

      {!compact && (
        <span className="flex size-14 items-center justify-center rounded-full bg-stamp-wash text-stamp">
          <FileUp aria-hidden size={26} strokeWidth={1.75} />
        </span>
      )}
      {title && !compact && (
        <p className="heading text-xl sm:text-2xl">{dragging ? 'Pode soltar' : title}</p>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-describedby={hintId}
        className={compact ? 'btn btn-secondary' : 'btn btn-primary px-6'}
      >
        {buttonLabel}
      </button>

      <p id={hintId} className="text-sm text-ink-2">
        {compact ? 'ou arraste para cá' : 'ou arraste para esta folha'}
        <span className="sr-only">. Formatos aceitos: {shown.map((f) => f.ext).join(', ')}</span>
      </p>

      {!compact && (
        <div aria-hidden className="flex max-w-xs flex-wrap justify-center gap-1.5">
          {shown.map((f) => (
            <FormatBadge key={f.ext} ext={f.ext} family={f.family} />
          ))}
        </div>
      )}

      {rejection && (
        <p role="alert" className="max-w-sm rounded-md bg-danger-wash px-3 py-2 text-sm text-danger">
          {rejection}
        </p>
      )}
    </div>
  );
}

function rejectionMessage(rejected: File[], formats: FileFormat[]): string {
  const ext = extensionOf(rejected[0].name);
  if (ext === 'doc') return 'Arquivos .doc (Word 97–2003) não são aceitos. Abra no Word e salve como .docx.';
  if (ext === 'pdf') return 'Esse arquivo já está em PDF.';
  const names = rejected.length > 1 ? `“${rejected[0].name}” e mais ${rejected.length - 1}` : `“${rejected[0].name}”`;
  const list = formats.filter((f) => f.ext !== 'jpeg').map((f) => `.${f.ext}`).join(', ');
  return `${names} não ${rejected.length > 1 ? 'são aceitos' : 'é aceito'} aqui. Formatos aceitos: ${list}.`;
}

/** Stops the browser from opening a file dropped next to the drop area. */
function useBlockStrayDrops() {
  useEffect(() => {
    const block = (event: globalThis.DragEvent) => {
      if (event.dataTransfer?.types.includes('Files')) event.preventDefault();
    };
    window.addEventListener('dragover', block);
    window.addEventListener('drop', block);
    return () => {
      window.removeEventListener('dragover', block);
      window.removeEventListener('drop', block);
    };
  }, []);
}
