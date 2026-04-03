'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { clsx } from 'clsx';
import {
  ArrowLeft,
  Users,
  Shield,
  Clock,
  Activity,
  Zap,
  DollarSign,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { services, businessCapabilities } from '@/lib/mock-data';
import { StatusBadge, StatusDot } from '@/components/shared/StatusBadge';
import { Sparkline } from '@/components/charts/Sparkline';
import type { ServiceStatus } from '@/lib/types';

const statusColors: Record<ServiceStatus, string> = {
  healthy: '#22c55e',
  degraded: '#f59e0b',
  critical: '#ef4444',
  unknown: '#6b7280',
};

const tierDescriptions: Record<string, string> = {
  T1: 'Business Critical',
  T2: 'Important',
  T3: 'Standard',
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function formatThroughput(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toString();
}

export default function ServiceDetail() {
  const params = useParams<{ id: string }>();
  const serviceId = params.id;

  const service = services.find((s) => s.id === serviceId);

  if (!service) {
    return (
      <div className="min-h-screen">
        <Header title="Service Not Found" />
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-card rounded-xl border border-border-subtle p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No service found with ID &quot;{serviceId}&quot;
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm text-accent-light hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const slaMet = service.slaCurrent >= service.slaTarget;
  const slaPercent = Math.min(
    (service.slaCurrent / service.slaTarget) * 100,
    100
  );

  // Find dependencies that are also known services
  const dependencyServices = service.dependencies
    .map((depId) => services.find((s) => s.id === depId))
    .filter(Boolean);

  // Find client services
  const clientServices = service.clients
    .map((clientId) => services.find((s) => s.id === clientId))
    .filter(Boolean);

  // Find business capabilities that reference this service
  const relatedCapabilities = businessCapabilities.filter((cap) =>
    cap.services.includes(service.id)
  );

  // Find client requirements that link to this service
  const relatedRequirements = relatedCapabilities.flatMap((cap) =>
    cap.clientRequirements
      .filter((cr) => cr.linkedServices.includes(service.id))
      .map((cr) => ({ ...cr, capabilityName: cap.name }))
  );

  return (
    <div className="min-h-screen">
      <Header title={service.name}>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Services
        </Link>
      </Header>

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
        {/* Hero section */}
        <div className="bg-card rounded-xl border border-border-subtle p-6">
          <div className="flex flex-col sm:flex-row items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <StatusDot status={service.status} size="md" />
                <StatusBadge status={service.status} size="md" />
                <span
                  className={clsx(
                    'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                    service.tier === 'T1'
                      ? 'bg-danger-muted text-danger'
                      : service.tier === 'T2'
                        ? 'bg-warning-muted text-warning'
                        : 'bg-card text-muted-foreground border border-border-subtle'
                  )}
                >
                  {service.tier} — {tierDescriptions[service.tier]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xl">
                {service.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {service.team}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  {service.businessOwner}
                </span>
                {service.activeIncidents > 0 && (
                  <span className="flex items-center gap-1.5 text-warning">
                    <AlertTriangle className="w-4 h-4" />
                    {service.activeIncidents} active incident
                    {service.activeIncidents > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            <div className="hidden sm:block">
              <Sparkline
                data={service.sparklineData}
                color={statusColors[service.status]}
                width={140}
                height={48}
              />
            </div>
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* SLA */}
          <div className="bg-card rounded-xl border border-border-subtle p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                SLA
              </span>
              <Activity className="w-4 h-4 text-muted" />
            </div>
            <div>
              <span
                className={clsx(
                  'text-2xl font-semibold font-mono',
                  slaMet ? 'text-success' : 'text-danger'
                )}
              >
                {service.slaCurrent}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                / {service.slaTarget}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-background overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all',
                    slaMet ? 'bg-success' : 'bg-danger'
                  )}
                  style={{ width: `${slaPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {slaMet ? 'Target met' : `${(service.slaTarget - service.slaCurrent).toFixed(2)}% below target`}
              </p>
            </div>
          </div>

          {/* Error Rate */}
          <div className="bg-card rounded-xl border border-border-subtle p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Error Rate
              </span>
              <AlertTriangle className="w-4 h-4 text-muted" />
            </div>
            <span
              className={clsx(
                'text-2xl font-semibold font-mono',
                service.errorRate > 1
                  ? 'text-danger'
                  : service.errorRate > 0.1
                    ? 'text-warning'
                    : 'text-foreground'
              )}
            >
              {service.errorRate}%
            </span>
          </div>

          {/* P50 Latency */}
          <div className="bg-card rounded-xl border border-border-subtle p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                P50 Latency
              </span>
              <Clock className="w-4 h-4 text-muted" />
            </div>
            <span className="text-2xl font-semibold font-mono text-foreground">
              {service.latencyP50}
              <span className="text-sm text-muted-foreground ml-0.5">ms</span>
            </span>
          </div>

          {/* P99 Latency */}
          <div className="bg-card rounded-xl border border-border-subtle p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                P99 Latency
              </span>
              <Zap className="w-4 h-4 text-muted" />
            </div>
            <span
              className={clsx(
                'text-2xl font-semibold font-mono',
                service.latencyP99 > 1000
                  ? 'text-danger'
                  : service.latencyP99 > 500
                    ? 'text-warning'
                    : 'text-foreground'
              )}
            >
              {service.latencyP99}
              <span className="text-sm text-muted-foreground ml-0.5">ms</span>
            </span>
          </div>

          {/* Throughput */}
          <div className="bg-card rounded-xl border border-border-subtle p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Throughput
              </span>
              <Activity className="w-4 h-4 text-muted" />
            </div>
            <span className="text-2xl font-semibold font-mono text-foreground">
              {formatThroughput(service.throughput)}
              <span className="text-sm text-muted-foreground ml-0.5">/s</span>
            </span>
          </div>
        </div>

        {/* Bottom sections grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Dependencies */}
          <div className="col-span-1 lg:col-span-4 bg-card rounded-xl border border-border-subtle p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Dependencies
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                ({service.dependencies.length})
              </span>
            </h3>
            <div className="space-y-2">
              {service.dependencies.map((depId) => {
                const dep = services.find((s) => s.id === depId);
                return (
                  <div
                    key={depId}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-background"
                  >
                    <div className="flex items-center gap-2">
                      {dep ? (
                        <StatusDot status={dep.status} />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-muted" />
                      )}
                      {dep ? (
                        <Link
                          href={`/services/${depId}`}
                          className="text-sm text-foreground hover:text-accent-light transition-colors"
                        >
                          {dep.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {depId}
                        </span>
                      )}
                    </div>
                    {dep && (
                      <ExternalLink className="w-3 h-3 text-muted" />
                    )}
                  </div>
                );
              })}
            </div>

            {clientServices.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-foreground pt-2 border-t border-border-subtle">
                  Consumed By
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    ({clientServices.length})
                  </span>
                </h3>
                <div className="space-y-2">
                  {clientServices.map((client) => (
                    <div
                      key={client!.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-background"
                    >
                      <div className="flex items-center gap-2">
                        <StatusDot status={client!.status} />
                        <Link
                          href={`/services/${client!.id}`}
                          className="text-sm text-foreground hover:text-accent-light transition-colors"
                        >
                          {client!.name}
                        </Link>
                      </div>
                      <ExternalLink className="w-3 h-3 text-muted" />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Business Impact */}
          <div className="col-span-1 lg:col-span-4 bg-card rounded-xl border border-border-subtle p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Business Impact
            </h3>
            <div className="space-y-4">
              <div className="px-4 py-3 rounded-lg bg-background">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Revenue Impact
                  </span>
                </div>
                <span className="text-xl font-semibold font-mono text-foreground">
                  {formatCurrency(service.revenueImpact)}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Estimated monthly revenue at risk if unavailable
                </p>
              </div>

              {relatedCapabilities.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Business Capabilities
                  </p>
                  <div className="space-y-2">
                    {relatedCapabilities.map((cap) => (
                      <div
                        key={cap.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-background"
                      >
                        <div className="flex items-center gap-2">
                          <StatusDot status={cap.status} />
                          <span className="text-sm text-foreground">
                            {cap.name}
                          </span>
                        </div>
                        {cap.revenueContribution > 0 && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {formatCurrency(cap.revenueContribution)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Client Requirements */}
          <div className="col-span-1 lg:col-span-4 bg-card rounded-xl border border-border-subtle p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Client Requirements
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                ({relatedRequirements.length})
              </span>
            </h3>
            {relatedRequirements.length > 0 ? (
              <div className="space-y-3">
                {relatedRequirements.map((req) => {
                  const reqSlaMet = req.slaCurrent >= req.slaTarget;
                  return (
                    <div
                      key={req.id}
                      className="px-3 py-3 rounded-lg bg-background space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {req.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {req.capabilityName}
                          </p>
                        </div>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {req.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="flex items-center gap-1">
                          {reqSlaMet ? (
                            <CheckCircle2 className="w-3 h-3 text-success" />
                          ) : (
                            <XCircle className="w-3 h-3 text-danger" />
                          )}
                          <span
                            className={clsx(
                              reqSlaMet ? 'text-success' : 'text-danger'
                            )}
                          >
                            {req.slaCurrent}%
                          </span>
                        </span>
                        <span className="text-muted-foreground">
                          target {req.slaTarget}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No client requirements linked to this service.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
