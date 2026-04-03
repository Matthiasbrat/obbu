import { services } from '@/lib/mock-data';
import ServiceDetail from '@/components/services/ServiceDetail';

export function generateStaticParams() {
  return services.map((s) => ({ id: s.id }));
}

export default function ServiceDetailPage() {
  return <ServiceDetail />;
}
