import { Radio } from 'lucide-react';
import { telemetrySources } from '@/lib/mock-data';
import { clsx } from 'clsx';

const statusColors: Record<string, string> = {
  connected: 'bg-success',
  degraded: 'bg-warning',
  disconnected: 'bg-danger',
};

export function TelemetrySourcesPanel() {
  return (
    <div className="bg-card border border-border-subtle rounded-xl">
      <div className="px-5 py-4 border-b border-border-subtle">
        <h2 className="text-sm font-semibold text-foreground">Telemetry Sources</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Data normalization pipeline status</p>
      </div>
      <div className="divide-y divide-border-subtle">
        {telemetrySources.map((source) => (
          <div key={source.name} className="px-5 py-3 flex items-center gap-3">
            <span className={clsx('w-2 h-2 rounded-full', statusColors[source.status])} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground">{source.name}</div>
              <div className="text-[10px] text-muted-foreground font-mono">
                {source.hostnameField} &rarr; hostname | {source.serviceField} &rarr; service
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-medium text-foreground">
                {(source.eventsPerSecond / 1000).toFixed(1)}K
              </div>
              <div className="text-[10px] text-muted-foreground">evt/s</div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-t border-border-subtle bg-background/50 rounded-b-xl">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Radio className="w-3 h-3 text-success" />
          All fields normalized to OTel Semantic Conventions
        </div>
      </div>
    </div>
  );
}
