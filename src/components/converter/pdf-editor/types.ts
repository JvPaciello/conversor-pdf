import type { EditItem } from '@/lib/pdf/edit-pdf';

export type EditorTool = 'select' | 'text' | 'draw' | 'rect' | 'whiteout' | 'highlight' | 'image';

export const COLORS = [
  { value: '#111111', label: 'Preto' },
  { value: '#1d4ed8', label: 'Azul' },
  { value: '#c4271b', label: 'Vermelho' },
  { value: '#15803d', label: 'Verde' },
  { value: '#ffffff', label: 'Branco' },
  { value: '#facc15', label: 'Amarelo' },
];

export const TEXT_SIZES = [10, 12, 14, 18, 24, 32, 48];
export const LINE_WIDTHS = [
  { value: 1.5, label: 'Fino' },
  { value: 3, label: 'Médio' },
  { value: 6, label: 'Grosso' },
];

export const HIGHLIGHT_COLOR = '#facc15';
export const WHITEOUT_COLOR = '#ffffff';

/** Changes an item; `record` saves the previous state for “Desfazer”. */
export type UpdateItem = (id: string, patch: Partial<EditItem>, record?: boolean) => void;

let counter = 0;
export const newId = () => `item-${Date.now().toString(36)}-${counter++}`;
