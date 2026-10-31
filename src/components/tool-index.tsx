import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Tool } from '@/lib/tools';
import { FormatBadge } from './format-badge';

/** Tools as rows of an index, like a document's table of contents. */
export function ToolIndex({ tools, headingLevel = 'h3' }: { tools: Tool[]; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel;
  return (
    <ul className="border-b border-rule">
      {tools.map((tool) => (
        <li key={tool.id} className="border-t border-rule">
          <Link
            href={tool.path}
            className="group grid gap-x-8 gap-y-2 py-6 sm:grid-cols-[11rem_minmax(0,1fr)_auto] sm:items-center"
          >
            <span aria-hidden className="flex flex-wrap items-center gap-1.5">
              {tool.formats
                .filter((f) => f.ext !== 'jpeg')
                .map((f) => (
                  <FormatBadge key={f.ext} ext={f.ext} family={f.family} />
                ))}
            </span>
            <span>
              <Heading className="heading text-xl group-hover:text-stamp sm:text-2xl">{tool.name}</Heading>
              <span className="mt-1 block text-ink-2">{tool.summary}</span>
            </span>
            <ArrowRight
              aria-hidden
              size={22}
              className="hidden text-ink-3 transition-transform group-hover:translate-x-1 group-hover:text-stamp sm:block"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
