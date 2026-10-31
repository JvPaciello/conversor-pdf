import { ogImage, OG_SIZE } from '@/lib/og';
import { getTool } from '@/lib/tools';

const tool = getTool('word');

export const alt = tool.headline;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return ogImage({ title: tool.headline, formats: tool.formats });
}
