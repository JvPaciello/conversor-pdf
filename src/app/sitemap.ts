import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';
import { TOOLS } from '@/lib/tools';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: absoluteUrl('/'), lastModified, changeFrequency: 'weekly', priority: 1 },
    ...TOOLS.map((tool) => ({
      url: absoluteUrl(tool.path),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    ...['/contato', '/politica-de-privacidade', '/termos-de-uso'].map((path) => ({
      url: absoluteUrl(path),
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ];
}
