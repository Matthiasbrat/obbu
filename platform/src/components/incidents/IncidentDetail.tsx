'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { clsx } from 'clsx';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Shield,
  Brain,
  Link2,
  Layers,
  DollarSign,
  Users,
  Server,
  ExternalLink,
  Activity,
  Zap,
  Target,
  Eye,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { incidents, services } from '@/lib/mock-data';
import { StatusBadge, LayerBadge, StatusDot } from '@/components/shared/StatusBadge';
import type { CorrelationLayer, IncidentEvent, RCAHypothesis } from '@/lib/types';

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDuration(startStr: string, endStr?: string): string {
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : new Date('2026-04-03T09:00:00Z');
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 60) return `${diffMins}m`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
}

function formatElapsed(prevStr: string, currStr: string): string {
  const prev = new Date(prevStr).getTime();
  const curr = new Date(currStr).getTime();
  const diffSec = Math.round((curr - prev) / 1000);
  if (diffSec < 60) return `+${diffSec}s`;
  const mins = Math.floor(diffSec / 60);
  const secs = diffSec % 60;
  if (mins < 60) return `+${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  return `+${hours}h ${mins % 60}m`;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

const eventTypeConfig: Record<IncidentEvent['type'], { color: string; bgColor: string; borderColor: string; icon: React.ElementType }> = {
  alert: { color: 'text-danger', bgColor: 'bg-danger-muted', borderColor: 'border-danger', icon: AlertTriangle },
  correlation: { color: 'text-info', bgColor: 'bg-info-muted', borderColor: 'border-info', icon: Link2 },
  hypothesis: { color: 'text-accent-light', bgColor: 'bg-accent/15', borderColor: 'border-accent', icon: Brain },
  action: { color: 'text-warning', bgColor: 'bg-warning-muted', borderColor: 'border-warning', icon: Zap },
  resolved: { color: 'text-success', bgColor: 'bg-success-muted', borderColor: 'border-success', icon: CheckCircle },
};

function ConfidenceGauge({ value, size = 'lg' }: { value: number; size?: 'sm' | 'lg' }) {
  const radius = size === 'lg' ? 40 : 24;
  const strokeWidth = size === 'lg' ? 6 : 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  const color =
    value >= 85 ? '#22c55e' : value >= 50 ? '#f59e0b' : '#ef4444';

  const textColor =
    value >= 85 ? 'text-success' : value >= 50 ? 'text-warning' : 'text-danger';

  return (
    <div className="relative flex items-center justify-center">
      <svg width={svgSize} height={svgSize} className="-rotate-90">
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-border"
        />
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={clsx('font-bold', textColor, size === 'lg' ? 'text-xl' : 'text-sm')}>
          {value}%
        </span>
      </div>
    </div>
  );
}

export default function IncidentDetail() {
  const params = useParams<{ id: string }>();
  const incident = incidents.find((i) => i.id === params.id);

  if (!incident) {
    return (
      <div className="min-h-screen">
        <Header title="Incident Not Found" />
        <div className="flex flex-col items-center justify-center p-16 text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-lg">Incident {params.id} not found</p>
          <Link href="/incidents" className="mt-4 text-accent-light hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to incidents
          </Link>
        </div>
      </div>
    );
  }

  const confirmedHypothesis = incident.rcaHypotheses.find((h) => h.status === 'confirmed');

  const impactCards = [
    {
      label: 'Revenue at Risk',
      value: formatCurrency(incident.revenueAtRisk),
      icon: DollarSign,
      color: incident.revenueAtRisk > 0 ? 'text-danger' : 'text-success',
      bgColor: incident.revenueAtRisk > 0 ? 'bg-danger-muted' : 'bg-success-muted',
    },
    {
      label: 'Clients Affected',
      value: incident.clientsAffected.toLocaleString(),
      icon: Users,
      color: incident.clientsAffected > 0 ? 'text-warning' : 'text-success',
      bgColor: incident.clientsAffected > 0 ? 'bg-warning-muted' : 'bg-success-muted',
    },
    {
      label: 'Services Affected',
      value: incident.affectedServices.length.toString(),
      icon: Server,
      color: 'text-info',
      bgColor: 'bg-info-muted',
    },
    {
      label: 'Confidence Score',
      value: `${incident.confidenceScore}%`,
      icon: Brain,
      color:
        incident.confidenceScore >= 85
          ? 'text-success'
          : incident.confidenceScore >= 50
          ? 'text-warning'
          : 'text-danger',
      bgColor:
        incident.confidenceScore >= 85
          ? 'bg-success-muted'
          : incident.confidenceScore >= 50
          ? 'bg-warning-muted'
          : 'bg-danger-muted',
    },
  ];

  return (
    <div className="min-h-screen">
      <Header title={incident.id} description={incident.title}>
        <Link
          href="/incidents"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Incidents
        </Link>
      </Header>

      <div className="p-8 space-y-6 animate-fade-in">
        {/* Header section */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusBadge status={incident.severity} size="md" />
              <StatusBadge status={incident.status} size="md" />
              <LayerBadge layer={incident.correlationLayer} />
            </div>
            <h2 className="text-xl font-semibold text-foreground">{incident.title}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Started: {formatDate(incident.startedAt)} {formatTimestamp(incident.startedAt)}
              </span>
              {incident.resolvedAt && (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-success" />
                  Resolved: {formatTimestamp(incident.resolvedAt)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Activity className="h-3.5 w-3.5" />
                Duration: {formatDuration(incident.startedAt, incident.resolvedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Impact summary cards */}
        <div className="grid grid-cols-4 gap-4">
          {impactCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-border-subtle bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className={clsx('rounded-lg p-2', card.bgColor)}>
                  <card.icon className={clsx('h-4 w-4', card.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className={clsx('text-lg font-semibold', card.color)}>{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main content: 2-column layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left column: RCA Hypotheses + Timeline */}
          <div className="col-span-8 space-y-6">
            {/* RCA Hypotheses */}
            <div className="rounded-xl border border-border-subtle bg-card">
              <div className="flex items-center gap-2 border-b border-border-subtle px-5 py-4">
                <Brain className="h-4 w-4 text-accent-light" />
                <h3 className="text-sm font-semibold text-foreground">RCA Hypotheses</h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  {incident.rcaHypotheses.length} hypothes{incident.rcaHypotheses.length === 1 ? 'is' : 'es'}
                </span>
              </div>

              <div className="p-5 space-y-4">
                {incident.rcaHypotheses.map((hypothesis) => (
                  <div
                    key={hypothesis.id}
                    className={clsx(
                      'rounded-lg border p-4 transition-all',
                      hypothesis.status === 'confirmed'
                        ? 'border-success/50 bg-success-muted/30'
                        : hypothesis.status === 'rejected'
                        ? 'border-border-subtle opacity-50'
                        : 'border-border-subtle bg-card-hover'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Confidence gauge */}
                      <div className="flex-shrink-0">
                        <ConfidenceGauge value={hypothesis.confidence} size="lg" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        {/* Top: badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <LayerBadge layer={hypothesis.layer} />
                          <StatusBadge status={hypothesis.status} />
                          {hypothesis.status === 'confirmed' && (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-success">
                              <CheckCircle className="h-3 w-3" /> Root Cause Identified
                            </span>
                          )}
                          {hypothesis.status === 'rejected' && (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-muted">
                              <XCircle className="h-3 w-3" /> Ruled Out
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-foreground">{hypothesis.description}</p>

                        {/* Evidence */}
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Evidence
                          </p>
                          <ul className="space-y-1">
                            {hypothesis.evidence.map((ev, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <span className="mt-1 h-1 w-1 rounded-full bg-muted-foreground flex-shrink-0" />
                                {ev}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Manual validation warning */}
                        {hypothesis.confidence < 85 && hypothesis.status !== 'rejected' && (
                          <div className="flex items-center gap-2 rounded-md bg-warning-muted px-3 py-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-warning flex-shrink-0" />
                            <span className="text-xs text-warning">
                              Manual validation required via Grafana Drilldown
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Incident Timeline */}
            <div className="rounded-xl border border-border-subtle bg-card">
              <div className="flex items-center gap-2 border-b border-border-subtle px-5 py-4">
                <Clock className="h-4 w-4 text-info" />
                <h3 className="text-sm font-semibold text-foreground">Incident Timeline</h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  {incident.timeline.length} events
                </span>
              </div>

              <div className="p-5">
                <div className="relative">
                  {incident.timeline.map((event, idx) => {
                    const config = eventTypeConfig[event.type];
                    const EventIcon = config.icon;
                    const isLast = idx === incident.timeline.length - 1;
                    const elapsed = idx > 0 ? formatElapsed(incident.timeline[idx - 1].timestamp, event.timestamp) : null;

                    return (
                      <div key={idx} className="relative flex gap-4">
                        {/* Timeline line */}
                        {!isLast && (
                          <div className="absolute left-[15px] top-[32px] bottom-0 w-px bg-border-subtle" />
                        )}

                        {/* Node */}
                        <div className={clsx('relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full', config.bgColor)}>
                          <EventIcon className={clsx('h-3.5 w-3.5', config.color)} />
                        </div>

                        {/* Content */}
                        <div className={clsx('flex-1 pb-6', isLast && 'pb-0')}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-muted-foreground">
                              {formatTimestamp(event.timestamp)}
                            </span>
                            {elapsed && (
                              <span className="text-[10px] text-muted rounded bg-card-hover px-1.5 py-0.5">
                                {elapsed}
                              </span>
                            )}
                            {event.layer && <LayerBadge layer={event.layer} />}
                          </div>
                          <p className="mt-1 text-sm text-foreground">{event.description}</p>
                          <p className="mt-0.5 text-xs text-muted">Source: {event.source}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Affected Services + Business Impact */}
          <div className="col-span-4 space-y-6">
            {/* Affected Services */}
            <div className="rounded-xl border border-border-subtle bg-card">
              <div className="flex items-center gap-2 border-b border-border-subtle px-5 py-4">
                <Server className="h-4 w-4 text-info" />
                <h3 className="text-sm font-semibold text-foreground">Affected Services</h3>
              </div>

              <div className="p-3">
                {incident.affectedServices.map((serviceId) => {
                  const svc = services.find((s) => s.id === serviceId);
                  return (
                    <Link
                      key={serviceId}
                      href={`/services/${serviceId}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-card-hover transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <StatusDot status={svc?.status ?? 'unknown'} />
                        <span className="text-sm text-foreground group-hover:text-accent-light transition-colors">
                          {svc?.name ?? serviceId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {svc && (
                          <span className="text-[10px] text-muted bg-card-hover rounded px-1.5 py-0.5">
                            {svc.tier}
                          </span>
                        )}
                        <ExternalLink className="h-3 w-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Business Impact */}
            <div className="rounded-xl border border-border-subtle bg-card">
              <div className="flex items-center gap-2 border-b border-border-subtle px-5 py-4">
                <Shield className="h-4 w-4 text-warning" />
                <h3 className="text-sm font-semibold text-foreground">Business Impact</h3>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Impact Summary
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{incident.businessImpact}</p>
                </div>

                {incident.rootCause && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                      Root Cause
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">{incident.rootCause}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Correlation Layer Explanation */}
            <div className="rounded-xl border border-border-subtle bg-card">
              <div className="flex items-center gap-2 border-b border-border-subtle px-5 py-4">
                <Layers className="h-4 w-4 text-accent-light" />
                <h3 className="text-sm font-semibold text-foreground">Correlation Layer</h3>
              </div>

              <div className="p-5 space-y-3">
                {[
                  {
                    layer: 'direct' as CorrelationLayer,
                    desc: 'Direct reference via trace ID, log correlation, or explicit link',
                    icon: Target,
                  },
                  {
                    layer: 'deterministic' as CorrelationLayer,
                    desc: 'Shared label match (hostname, service, environment)',
                    icon: Link2,
                  },
                  {
                    layer: 'statistical' as CorrelationLayer,
                    desc: 'AI/ML temporal correlation, pattern matching, topology analysis',
                    icon: Brain,
                  },
                ].map((item) => (
                  <div
                    key={item.layer}
                    className={clsx(
                      'flex items-start gap-2.5 rounded-lg p-2.5 transition-colors',
                      incident.correlationLayer === item.layer
                        ? 'bg-card-hover'
                        : 'opacity-40'
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <LayerBadge layer={item.layer} />
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
