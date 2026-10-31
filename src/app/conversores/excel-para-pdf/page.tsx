import { ToolPage } from '@/components/tool-page';
import { pageMetadata } from '@/lib/metadata';
import { getTool } from '@/lib/tools';

const tool = getTool('excel');

export const metadata = pageMetadata({ title: tool.metaTitle, description: tool.metaDescription, path: tool.path });

export default function Page() {
  return <ToolPage tool={tool} />;
}
