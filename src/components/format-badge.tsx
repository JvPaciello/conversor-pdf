import type { FormatFamily } from '@/lib/tools';

export function FormatBadge({ ext, family }: { ext: string; family: FormatFamily | 'pdf' }) {
  return (
    <span className="badge" data-family={family}>
      {ext.toUpperCase()}
    </span>
  );
}
