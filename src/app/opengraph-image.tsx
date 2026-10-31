import { ogImage, OG_SIZE } from '@/lib/og';
import { ALL_FORMATS } from '@/lib/tools';

export const alt = 'ConverterPDF BR: Word, Excel e imagens em PDF, direto no navegador';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return ogImage({
    title: 'Word, Excel e imagens em PDF, direto no navegador',
    formats: ALL_FORMATS.filter((f) => ['docx', 'xlsx', 'jpg', 'png'].includes(f.ext)),
  });
}
