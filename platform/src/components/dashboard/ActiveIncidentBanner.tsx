import Link from 'next/link';
import { AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { incidents } from '@/lib/mock-data';
import { LayerBadge } from '@/components/shared/StatusBadge';

export function ActiveIncidentBanner() {
  const activeIncident = incidents.find((i) => i.status === 'active');
  if (!activeIncident) return null;

  return (
    <Link href={`/incidents/${activeIncident.id}`}>
      <div className="bg-danger-muted border border-danger/20 rounded-xl px-6 py-4 flex items-center justify-between hover:border-danger/40 transition-colors group">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-danger/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-danger" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-0.5">
              <span className="text-sm font-semibold text-danger">{activeIncident.id}</span>
              <LayerBadge layer={activeIncident.correlationLayer} />
              <span className="text-xs text-muted-foreground font-mono">{activeIncident.confidenceScore}% confidence</span>
            </div>
            <p className="text-sm text-foreground">{activeIncident.title}</p>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activeIncident.affectedServices.length} services affected
              </span>
              <span className="text-xs text-danger font-medium">
                ${(activeIncident.revenueAtRisk / 1000).toFixed(0)}K revenue at risk
              </span>
            </div>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </Link>
  );
}
