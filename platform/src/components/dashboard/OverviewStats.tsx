import {
  Server,
  AlertTriangle,
  Clock,
  Eye,
  ShieldCheck,
  DollarSign,
  Activity,
  Zap,
} from 'lucide-react';
import { overviewStats } from '@/lib/mock-data';

const stats = [
  {
    label: 'Services Healthy',
    value: `${overviewStats.healthyServices}/${overviewStats.totalServices}`,
    icon: Server,
    color: 'text-success',
    bgColor: 'bg-success-muted',
  },
  {
    label: 'Active Incidents',
    value: overviewStats.activeIncidents.toString(),
    icon: AlertTriangle,
    color: 'text-danger',
    bgColor: 'bg-danger-muted',
  },
  {
    label: 'MTTD',
    value: `${overviewStats.mttd}m`,
    icon: Eye,
    color: 'text-info',
    bgColor: 'bg-info-muted',
  },
  {
    label: 'MTTR',
    value: `${overviewStats.mttr}m`,
    icon: Clock,
    color: 'text-accent-light',
    bgColor: 'bg-accent/15',
  },
  {
    label: 'SLA Compliance',
    value: `${overviewStats.slaCompliance}%`,
    icon: ShieldCheck,
    color: 'text-warning',
    bgColor: 'bg-warning-muted',
  },
  {
    label: 'Revenue at Risk',
    value: `$${(overviewStats.revenueAtRisk / 1000).toFixed(0)}K`,
    icon: DollarSign,
    color: 'text-danger',
    bgColor: 'bg-danger-muted',
  },
  {
    label: 'Correlated Events',
    value: overviewStats.correlatedEvents.toLocaleString(),
    icon: Activity,
    color: 'text-accent-light',
    bgColor: 'bg-accent/15',
  },
  {
    label: 'Avg Confidence',
    value: `${overviewStats.avgConfidenceScore}%`,
    icon: Zap,
    color: 'text-success',
    bgColor: 'bg-success-muted',
  },
];

export function OverviewStats() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card border border-border-subtle rounded-xl px-5 py-4 hover:border-border transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </div>
          <div className="text-2xl font-semibold font-mono tracking-tight">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
