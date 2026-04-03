import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import { incidents } from '@/lib/mock-data';
import { StatusBadge, LayerBadge } from '@/components/shared/StatusBadge';

function timeAgo(date: string): string {
  const now = new Date('2026-04-03T10:00:00Z');
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

export function RecentIncidentsFeed() {
  return (
    <div className="bg-card border border-border-subtle rounded-xl">
      <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Recent Incidents</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Correlated with RCA engine</p>
        </div>
        <Link href="/incidents" className="text-xs text-accent-light hover:text-accent flex items-center gap-1">
          View all <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-border-subtle">
        {incidents.map((incident) => (
          <Link key={incident.id} href={`/incidents/${incident.id}`}>
            <div className="px-5 py-3.5 hover:bg-card-hover transition-colors group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-muted-foreground">{incident.id}</span>
                  <StatusBadge status={incident.status} />
                  <span className="hidden sm:inline"><StatusBadge status={incident.severity} /></span>
                </div>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo(incident.startedAt)}
                </span>
              </div>
              <p className="text-xs text-foreground mb-2 group-hover:text-accent-light transition-colors">
                {incident.title}
              </p>
              <div className="flex items-center gap-2">
                <LayerBadge layer={incident.correlationLayer} />
                <span className="text-[10px] font-mono text-muted-foreground">
                  {incident.confidenceScore}% confidence
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
