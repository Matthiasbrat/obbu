import { defaultPlugins } from '@/lib/plugins/registry';
import PluginDetail from '@/components/plugins/PluginDetail';

export function generateStaticParams() {
  return defaultPlugins.map((p) => ({ id: p.id }));
}

export default function PluginDetailPage() {
  return <PluginDetail />;
}
