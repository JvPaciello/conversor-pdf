'use client';

import { CircleAlert, Download, X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { FormatBadge } from '@/components/format-badge';
import { downloadBlob } from '@/lib/download';
import { extensionOf, formatBytes } from '@/lib/format';
import type { FormatFamily } from '@/lib/tools';
import type { Converted } from './use-conversion';

export function FileRow({
  file,
  family,
  onRemove,
  disabled,
}: {
  file: File;
  family: FormatFamily;
  onRemove?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-desk px-4 py-3">
      <FormatBadge ext={extensionOf(file.name)} family={family} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{file.name}</p>
        <p className="text-sm text-ink-2">{formatBytes(file.size)}</p>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="flex size-10 shrink-0 items-center justify-center rounded-md text-ink-2 hover:bg-paper hover:text-ink disabled:opacity-40"
          aria-label={`Remover ${file.name}`}
        >
          <X aria-hidden size={18} />
        </button>
      )}
    </div>
  );
}

export function Progress({ done, total, label }: { done: number; total: number; label: string }) {
  const percent = total ? Math.round((done / total) * 100) : null;
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm text-ink-2">
        <span aria-live="polite">{label}</span>
        {percent !== null && <span>{percent}%</span>}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent ?? undefined}
        className="h-2 overflow-hidden rounded-full bg-desk"
      >
        {percent === null ? (
          <div className="h-full w-1/3 animate-pulse rounded-full bg-stamp" />
        ) : (
          <div className="h-full rounded-full bg-stamp transition-[width] duration-300" style={{ width: `${percent}%` }} />
        )}
      </div>
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div role="alert" className="flex gap-3 rounded-lg bg-danger-wash px-4 py-3 text-sm leading-relaxed text-danger">
      <CircleAlert aria-hidden size={18} className="mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

export function ResultPanel({
  result,
  onRestart,
  restartLabel = 'Converter outro arquivo',
  children,
}: {
  result: Converted;
  onRestart: () => void;
  restartLabel?: string;
  children?: ReactNode;
}) {
  const pages = result.pages === 1 ? '1 página' : `${result.pages} páginas`;
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The form above may have been taller: bring the result into view and
    // move focus to it so screen readers announce it.
    const el = panel.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    el.focus({ preventScroll: true });
  }, []);

  return (
    <div
      ref={panel}
      tabIndex={-1}
      aria-live="polite"
      className="flex scroll-mt-24 flex-col items-center py-4 text-center outline-none"
    >
      <Stamp />
      <p className="mt-6 max-w-full truncate text-lg font-semibold">{result.fileName}</p>
      <p className="text-sm text-ink-2">
        {pages}, {formatBytes(result.blob.size)}
      </p>
      <p className="mt-4 max-w-sm text-sm text-ink-2">
        O download começou. Se o arquivo não apareceu, use o botão abaixo.
      </p>
      <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <button type="button" className="btn btn-primary" onClick={() => downloadBlob(result.blob, result.fileName)}>
          <Download aria-hidden size={18} />
          Baixar PDF
        </button>
        <button type="button" className="btn btn-secondary" onClick={onRestart}>
          {restartLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

/** A rubber stamp, inked unevenly, that lands when the PDF is ready. */
export function Stamp() {
  const filterId = `ink${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg viewBox="0 0 260 120" className="stamp w-56 text-stamp" role="img" aria-label="PDF pronto">
      <defs>
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="noise" />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 2.1"
            result="wear"
          />
          <feComposite in="SourceGraphic" in2="wear" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        <rect x="6" y="6" width="248" height="108" rx="10" fill="none" stroke="currentColor" strokeWidth="6" />
        <rect x="17" y="17" width="226" height="86" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <text
          x="130"
          y="76"
          textAnchor="middle"
          fill="currentColor"
          fontSize="46"
          fontWeight="800"
          textLength="196"
          lengthAdjust="spacingAndGlyphs"
          style={{ fontStretch: '75%' }}
        >
          PDF PRONTO
        </text>
      </g>
    </svg>
  );
}

export function Segmented<T extends string>({
  legend,
  value,
  options,
  onChange,
  disabled,
}: {
  legend: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  const name = useId();
  return (
    <fieldset disabled={disabled} className="min-w-0 disabled:opacity-50">
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      <div className="inline-flex max-w-full flex-wrap gap-1 rounded-lg bg-desk p-1">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className="block rounded-md px-3 py-1.5 text-sm text-ink-2 peer-checked:bg-paper peer-checked:font-semibold peer-checked:text-ink peer-checked:shadow-[0_1px_0_var(--paper-edge)] peer-focus-visible:outline-3 peer-focus-visible:outline-stamp">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer gap-3 has-disabled:cursor-not-allowed has-disabled:opacity-50">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-5 shrink-0 accent-[var(--stamp)]"
      />
      <span>
        <span className="block text-[0.9375rem] font-medium">{label}</span>
        {description && <span className="block text-sm text-ink-2">{description}</span>}
      </span>
    </label>
  );
}
