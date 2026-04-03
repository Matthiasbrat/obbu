import { Link2, Layers, Brain } from 'lucide-react';

const layers = [
  {
    name: 'Direct Correlation',
    layer: 'L1',
    description: 'Trace IDs, correlation IDs, foreign keys',
    confidence: '100%',
    icon: Link2,
    color: 'text-success',
    bgColor: 'bg-success-muted',
    barColor: 'bg-success',
    barWidth: '100%',
    events: 892,
  },
  {
    name: 'Deterministic Linking',
    layer: 'L2',
    description: 'Shared hostname, service, environment labels',
    confidence: '85-99%',
    icon: Layers,
    color: 'text-info',
    bgColor: 'bg-info-muted',
    barColor: 'bg-info',
    barWidth: '72%',
    events: 641,
  },
  {
    name: 'Statistical Intent',
    layer: 'L3',
    description: 'Semantic meaning, pattern recognition, AI',
    confidence: '50-85%',
    icon: Brain,
    color: 'text-accent-light',
    bgColor: 'bg-accent/15',
    barColor: 'bg-accent',
    barWidth: '35%',
    events: 314,
  },
];

export function CorrelationLayersViz() {
  return (
    <div className="bg-card border border-border-subtle rounded-xl">
      <div className="px-5 py-4 border-b border-border-subtle">
        <h2 className="text-sm font-semibold text-foreground">Three-Layer RCA Model</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Correlation discovery vs accuracy tradeoff</p>
      </div>
      <div className="p-5 space-y-4">
        {layers.map((layer) => (
          <div key={layer.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg ${layer.bgColor} flex items-center justify-center`}>
                  <layer.icon className={`w-3.5 h-3.5 ${layer.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted">{layer.layer}</span>
                    <span className="text-xs font-medium text-foreground">{layer.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{layer.description}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-medium text-foreground">{layer.events}</div>
                <div className="text-[10px] text-muted-foreground">events</div>
              </div>
            </div>
            <div className="h-1.5 bg-background rounded-full overflow-hidden">
              <div
                className={`h-full ${layer.barColor} rounded-full transition-all duration-500`}
                style={{ width: layer.barWidth }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-muted-foreground">Confidence: {layer.confidence}</span>
            </div>
          </div>
        ))}

        {/* Tradeoff visualization */}
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
            <span>Higher accuracy</span>
            <span>More discovery</span>
          </div>
          <div className="h-2 rounded-full bg-gradient-to-r from-success via-info to-accent" />
        </div>
      </div>
    </div>
  );
}
