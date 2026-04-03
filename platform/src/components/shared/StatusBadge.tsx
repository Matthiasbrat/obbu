import { clsx } from 'clsx';
import type { ServiceStatus, Severity, CorrelationLayer } from '@/lib/types';

interface StatusBadgeProps {
  status: ServiceStatus | Severity | string;
  size?: 'sm' | 'md';
}

const statusStyles: Record<string, string> = {
  healthy: 'bg-success-muted text-success',
  degraded: 'bg-warning-muted text-warning',
  critical: 'bg-danger-muted text-danger',
  unknown: 'bg-card text-muted',
  high: 'bg-warning-muted text-warning',
  medium: 'bg-info-muted text-info',
  low: 'bg-card text-muted-foreground',
  met: 'bg-success-muted text-success',
  'at-risk': 'bg-warning-muted text-warning',
  breached: 'bg-danger-muted text-danger',
  active: 'bg-danger-muted text-danger',
  investigating: 'bg-warning-muted text-warning',
  resolved: 'bg-success-muted text-success',
  suppressed: 'bg-card text-muted',
  confirmed: 'bg-success-muted text-success',
  rejected: 'bg-card text-muted',
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium capitalize',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        statusStyles[status] || 'bg-card text-muted'
      )}
    >
      {status}
    </span>
  );
}

interface StatusDotProps {
  status: ServiceStatus;
  size?: 'sm' | 'md';
}

const dotColors: Record<ServiceStatus, string> = {
  healthy: 'bg-success',
  degraded: 'bg-warning',
  critical: 'bg-danger',
  unknown: 'bg-muted',
};

export function StatusDot({ status, size = 'sm' }: StatusDotProps) {
  return (
    <span
      className={clsx(
        'inline-block rounded-full',
        size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5',
        dotColors[status],
        status === 'critical' && 'animate-pulse-dot'
      )}
    />
  );
}

interface LayerBadgeProps {
  layer: CorrelationLayer;
}

const layerStyles: Record<CorrelationLayer, { bg: string; text: string; label: string }> = {
  direct: { bg: 'bg-success-muted', text: 'text-success', label: 'L1 Direct' },
  deterministic: { bg: 'bg-info-muted', text: 'text-info', label: 'L2 Deterministic' },
  statistical: { bg: 'bg-accent/15', text: 'text-accent-light', label: 'L3 Statistical' },
};

export function LayerBadge({ layer }: LayerBadgeProps) {
  const style = layerStyles[layer];
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium', style.bg, style.text)}>
      {style.label}
    </span>
  );
}
