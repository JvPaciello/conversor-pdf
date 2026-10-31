'use client';

import { useEffect, useState } from 'react';
import type { WorkBook } from 'xlsx';
import type { SheetSummary } from '@/lib/pdf/sheet-table';
import type { ExcelOptions } from '@/lib/pdf/excel-to-pdf';
import { pdfName } from '@/lib/format';
import { getTool } from '@/lib/tools';
import { Dropzone } from './dropzone';
import { ErrorNote, FileRow, Progress, ResultPanel, Segmented, Toggle } from './parts';
import { describeError, useConversion } from './use-conversion';

const tool = getTool('excel');

interface Loaded {
  file: File;
  workbook?: WorkBook;
  sheets?: SheetSummary[];
  error?: string;
}

export function ExcelConverter({ initialFiles }: { initialFiles?: File[] }) {
  const [file, setFile] = useState<File | null>(initialFiles?.[0] ?? null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [orientation, setOrientation] = useState<ExcelOptions['orientation']>('auto');
  const [fitWidth, setFitWidth] = useState(true);
  const [repeatFirstRow, setRepeatFirstRow] = useState(false);
  const [brazilianNumbers, setBrazilianNumbers] = useState(true);
  const { state, run, reset } = useConversion();

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    (async () => {
      try {
        const [lib, model] = await Promise.all([import('@/lib/pdf/excel-to-pdf'), import('@/lib/pdf/sheet-table')]);
        const workbook = lib.readWorkbook(new Uint8Array(await file.arrayBuffer()), file.name);
        const sheets = model.listSheets(workbook).filter((s) => !s.hidden);
        if (cancelled) return;
        setLoaded({ file, workbook, sheets });
        setSelected(sheets.filter((s) => !s.empty).map((s) => s.name));
      } catch (error) {
        if (!cancelled) setLoaded({ file, error: describeError(error) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  // Results from a previous file are ignored until the new one is read.
  const current = loaded?.file === file ? loaded : null;

  const restart = () => {
    setFile(null);
    reset();
  };

  const convert = () => {
    if (!file || !current?.workbook || !current.sheets) return;
    const { workbook, sheets } = current;
    run(async () => {
      const { workbookToPdf } = await import('@/lib/pdf/excel-to-pdf');
      const ordered = sheets.map((s) => s.name).filter((name) => selected.includes(name));
      const { blob, pages } = workbookToPdf(workbook, {
        sheets: ordered,
        orientation,
        fitWidth,
        repeatFirstRow,
        brazilianNumbers,
      });
      return { blob, pages, fileName: pdfName(file.name) };
    });
  };

  if (!file) {
    return (
      <Dropzone
        formats={tool.formats}
        onFiles={([picked]) => setFile(picked)}
        title="Solte a planilha aqui"
        buttonLabel="Escolher arquivo"
      />
    );
  }

  if (state.status === 'done') return <ResultPanel result={state.result} onRestart={restart} />;

  const working = state.status === 'working';
  const withContent = current?.sheets?.filter((s) => !s.empty) ?? [];
  const toggleSheet = (name: string, on: boolean) =>
    setSelected((prev) => (on ? [...prev, name] : prev.filter((n) => n !== name)));

  return (
    <div className="space-y-6">
      <FileRow file={file} family="sheet" onRemove={restart} disabled={working} />

      {!current && <Progress done={0} total={0} label="Lendo a planilha…" />}
      {current?.error && <ErrorNote message={current.error} />}
      {current?.sheets && withContent.length === 0 && (
        <ErrorNote message="A planilha não tem nenhuma célula preenchida." />
      )}

      {withContent.length > 0 && current?.sheets && (
        <>
          {current.sheets.length > 1 && (
            <fieldset disabled={working}>
              <legend className="mb-2 text-sm font-semibold">Abas</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {current.sheets.map((sheet) => (
                  <Toggle
                    key={sheet.name}
                    label={sheet.name}
                    description={sheet.empty ? 'Sem conteúdo' : undefined}
                    checked={selected.includes(sheet.name)}
                    disabled={sheet.empty}
                    onChange={(on) => toggleSheet(sheet.name, on)}
                  />
                ))}
              </div>
            </fieldset>
          )}

          <Segmented
            legend="Orientação da página"
            value={orientation}
            onChange={setOrientation}
            disabled={working}
            options={[
              { value: 'auto', label: 'Automática' },
              { value: 'portrait', label: 'Retrato' },
              { value: 'landscape', label: 'Paisagem' },
            ]}
          />

          <div className="space-y-3">
            <Toggle
              label="Ajustar à largura da página"
              description="Reduz tabelas largas para caber na folha."
              checked={fitWidth}
              onChange={setFitWidth}
              disabled={working}
            />
            <Toggle
              label="Repetir a primeira linha em cada página"
              description="Útil quando a primeira linha tem os títulos das colunas."
              checked={repeatFirstRow}
              onChange={setRepeatFirstRow}
              disabled={working}
            />
            <Toggle
              label="Números no formato brasileiro"
              description="Mostra 1234.5 como 1.234,50."
              checked={brazilianNumbers}
              onChange={setBrazilianNumbers}
              disabled={working}
            />
          </div>

          {working && <Progress done={0} total={0} label="Gerando o PDF…" />}
          {state.status === 'error' && <ErrorNote message={state.message} />}

          <button
            type="button"
            onClick={convert}
            disabled={working || selected.length === 0}
            className="btn btn-primary w-full"
          >
            {working ? 'Convertendo…' : selected.length === 0 ? 'Escolha ao menos uma aba' : 'Converter para PDF'}
          </button>
        </>
      )}
    </div>
  );
}
