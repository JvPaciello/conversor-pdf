import type { Metadata } from 'next';
import { SITE } from './site';

interface PageMeta {
  title: string;
  description: string;
  path: string;
  /** Use the title as-is instead of appending the site name. */
  absoluteTitle?: boolean;
}

export function pageMetadata({ title, description, path, absoluteTitle }: PageMeta): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
      title,
      description,
      siteName: SITE.name,
      locale: SITE.locale,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}
