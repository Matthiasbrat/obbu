import Link from 'next/link';
import { ArrowUpRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { businessCapabilities } from '@/lib/mock-data';
import { StatusDot } from '@/components/shared/StatusBadge';
import { Sparkline } from '@/components/charts/Sparkline';

const trendIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const trendColor: Record<string, string> = {
  up: '#22c55e',
  down: '#ef4444',
  stable: '#71717a',
};

export function BusinessImpactSummary() {
  return (
    <div className="bg-card border border-border-subtle rounded-xl">
      <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Business Capabilities</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Client requirements mapped to technical delivery</p>
        </div>
        <Link href="/business" className="text-xs text-accent-light hover:text-accent flex items-center gap-1">
          View details <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-border-subtle">
        {businessCapabilities.map((cap) => (
          <div key={cap.id} className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <StatusDot status={cap.status} />
                <span className="text-sm font-medium text-foreground">{cap.name}</span>
                <span className="text-xs text-muted-foreground">{cap.owner}</span>
              </div>
              {cap.revenueContribution > 0 && (
                <span className="text-xs font-mono text-muted-foreground">
                  ${(cap.revenueContribution / 1000000).toFixed(1)}M revenue
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {cap.kpis.slice(0, 4).map((kpi) => {
                const TrendIcon = trendIcon[kpi.trend];
                const isGood = kpi.name === 'Cart Abandonment' || kpi.name === 'False Positive Rate'
                  ? kpi.value <= kpi.target
                  : kpi.value >= kpi.target;

                return (
                  <div key={kpi.name} className="bg-background rounded-lg px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground truncate">{kpi.name}</span>
                      <TrendIcon className={`w-3 h-3 ${isGood ? 'text-success' : 'text-danger'}`} />
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className={`text-sm font-mono font-semibold ${isGood ? 'text-foreground' : 'text-danger'}`}>
                          {kpi.value}{kpi.unit}
                        </span>
                        <span className="text-[10px] text-muted ml-1">/ {kpi.target}{kpi.unit}</span>
                      </div>
                      <Sparkline
                        data={kpi.sparkline}
                        color={isGood ? '#22c55e' : '#ef4444'}
                        width={48}
                        height={18}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Client requirement breaches */}
            {cap.clientRequirements.some((cr) => cr.status === 'breached') && (
              <div className="mt-3 px-3 py-2 bg-danger-muted rounded-lg">
                {cap.clientRequirements
                  .filter((cr) => cr.status === 'breached')
                  .map((cr) => (
                    <div key={cr.id} className="flex items-center justify-between">
                      <span className="text-xs text-danger font-medium">SLA Breach: {cr.name}</span>
                      <span className="text-xs font-mono text-danger">
                        {cr.slaCurrent}% / {cr.slaTarget}% target
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
