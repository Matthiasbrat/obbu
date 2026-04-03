import { incidents } from '@/lib/mock-data';
import IncidentDetail from '@/components/incidents/IncidentDetail';

export function generateStaticParams() {
  return incidents.map((i) => ({ id: i.id }));
}

export default function IncidentDetailPage() {
  return <IncidentDetail />;
}
