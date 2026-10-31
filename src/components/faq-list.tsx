import { Plus } from 'lucide-react';

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-rule border-y border-rule">
      {items.map(({ q, a }) => (
        <details key={q} className="group">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left text-[1.0625rem] font-semibold [&::-webkit-details-marker]:hidden">
            {q}
            <Plus
              aria-hidden
              size={20}
              className="mt-0.5 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-45"
            />
          </summary>
          <p className="max-w-[68ch] pb-6 leading-relaxed text-ink-2">{a}</p>
        </details>
      ))}
    </div>
  );
}
