import Link from 'next/link';
import { services } from '@/lib/mock-data';
import { StatusDot } from '@/components/shared/StatusBadge';
import { Sparkline } from '@/components/charts/Sparkline';
import { ArrowUpRight } from 'lucide-react';

const statusColors: Record<string, string> = {
  healthy: '#22c55e',
  degraded: '#f59e0b',
  critical: '#ef4444',
  unknown: '#71717a',
};

export function ServiceHealthGrid() {
  return (
    <div className="bg-card border border-border-subtle rounded-xl">
      <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Service Health</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time status across all services</p>
        </div>
        <Link href="/services" className="text-xs text-accent-light hover:text-accent flex items-center gap-1">
          View all <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-border-subtle">
        {services.map((service) => (
          <Link key={service.id} href={`/services/${service.id}`}>
            <div className="px-5 py-3.5 flex items-center gap-4 hover:bg-card-hover transition-colors group flex-wrap">
              <StatusDot status={service.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground group-hover:text-accent-light transition-colors truncate">
                    {service.name}
                  </span>
                  <span className="text-[10px] font-mono text-muted bg-background px-1.5 py-0.5 rounded">
                    {service.tier}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{service.team}</span>
              </div>
              <div className="hidden sm:block text-right mr-4">
                <div className="text-xs text-muted-foreground">P99 Latency</div>
                <div className="text-sm font-mono font-medium">{service.latencyP99}ms</div>
              </div>
              <div className="text-right mr-4">
                <div className="text-xs text-muted-foreground">Error Rate</div>
                <div className={`text-sm font-mono font-medium ${service.errorRate > 1 ? 'text-danger' : service.errorRate > 0.1 ? 'text-warning' : 'text-foreground'}`}>
                  {service.errorRate}%
                </div>
              </div>
              <div className="hidden md:block text-right mr-2">
                <div className="text-xs text-muted-foreground">Throughput</div>
                <div className="text-sm font-mono font-medium">{(service.throughput / 1000).toFixed(1)}K/s</div>
              </div>
              <div className="hidden md:block">
                <Sparkline
                  data={service.sparklineData}
                  color={statusColors[service.status]}
                  width={80}
                  height={28}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
