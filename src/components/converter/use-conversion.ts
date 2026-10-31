'use client';

import { useCallback, useRef, useState } from 'react';
import { downloadBlob } from '@/lib/download';

export interface Converted {
  blob: Blob;
  fileName: string;
  pages: number;
}

export type ConversionState =
  | { status: 'idle' }
  | { status: 'working'; done: number; total: number }
  | { status: 'done'; result: Converted }
  | { status: 'error'; message: string };

export type ProgressFn = (done: number, total: number) => void;

export function useConversion() {
  const [state, setState] = useState<ConversionState>({ status: 'idle' });
  const runId = useRef(0);

  const run = useCallback(async (task: (progress: ProgressFn) => Promise<Converted>) => {
    const id = ++runId.current;
    setState({ status: 'working', done: 0, total: 0 });
    // Let the progress state paint before heavy, synchronous work starts.
    await new Promise((resolve) => setTimeout(resolve, 30));
    try {
      const result = await task((done, total) => {
        if (runId.current === id) setState({ status: 'working', done, total });
      });
      if (runId.current !== id) return;
      setState({ status: 'done', result });
      downloadBlob(result.blob, result.fileName);
    } catch (error) {
      if (runId.current !== id) return;
      console.error(error);
      setState({ status: 'error', message: describeError(error) });
    }
  }, []);

  const reset = useCallback(() => {
    runId.current += 1;
    setState({ status: 'idle' });
  }, []);

  return { state, run, reset };
}

export function describeError(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'ConversionError') return error.message;
    if (/password|encrypt/i.test(error.message)) {
      return 'O arquivo está protegido por senha. Remova a senha no programa em que ele foi criado e tente de novo.';
    }
  }
  return 'Não foi possível converter o arquivo. Ele pode estar corrompido, protegido por senha ou ter uma extensão que não corresponde ao conteúdo.';
}
