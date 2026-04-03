'use client';

import { useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { ArrowUpRight, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { services } from '@/lib/mock-data';
import { StatusDot } from '@/components/shared/StatusBadge';
import { Sparkline } from '@/components/charts/Sparkline';
import type { ServiceStatus } from '@/lib/types';

const filterTabs: { label: string; value: ServiceStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Healthy', value: 'healthy' },
  { label: 'Degraded', value: 'degraded' },
  { label: 'Critical', value: 'critical' },
];

const tierColors: Record<string, string> = {
  T1: 'bg-danger-muted text-danger',
  T2: 'bg-warning-muted text-warning',
  T3: 'bg-card text-muted-foreground',
};

const statusSparklineColor: Record<ServiceStatus, string> = {
  healthy: '#22c55e',
  degraded: '#f59e0b',
  critical: '#ef4444',
  unknown: '#6b7280',
};

function formatThroughput(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toString();
}

export default function ServicesPage() {
  const [activeFilter, setActiveFilter] = useState<ServiceStatus | 'all'>('all');

  const filteredServices =
    activeFilter === 'all'
      ? services
      : services.filter((s) => s.status === activeFilter);

  const counts: Record<string, number> = {
    all: services.length,
    healthy: services.filter((s) => s.status === 'healthy').length,
    degraded: services.filter((s) => s.status === 'degraded').length,
    critical: services.filter((s) => s.status === 'critical').length,
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Services"
        description="Service catalog with SLA and health metrics"
      />

      <div className="p-8 space-y-6 animate-fade-in">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-card rounded-lg border border-border-subtle w-fit">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={clsx(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                activeFilter === tab.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              <span
                className={clsx(
                  'ml-1.5 text-xs',
                  activeFilter === tab.value
                    ? 'text-muted-foreground'
                    : 'text-muted'
                )}
              >
                {counts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Services table */}
        <div className="bg-card rounded-xl border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 w-8" />
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Service
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Tier
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Team
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    SLA
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                    Error Rate
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                    P99 Latency
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                    Throughput
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 w-28">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => {
                  const slaMet = service.slaCurrent >= service.slaTarget;
                  return (
                    <tr
                      key={service.id}
                      className="border-b border-border-subtle last:border-b-0 hover:bg-card-hover transition-colors"
                    >
                      {/* Status dot */}
                      <td className="px-4 py-3">
                        <StatusDot status={service.status} />
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/services/${service.id}`}
                          className="group flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent-light transition-colors"
                        >
                          {service.name}
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        {service.activeIncidents > 0 && (
                          <span className="flex items-center gap-1 mt-0.5 text-[11px] text-warning">
                            <AlertTriangle className="w-3 h-3" />
                            {service.activeIncidents} active incident
                            {service.activeIncidents > 1 ? 's' : ''}
                          </span>
                        )}
                      </td>

                      {/* Tier */}
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                            tierColors[service.tier]
                          )}
                        >
                          {service.tier}
                        </span>
                      </td>

                      {/* Team */}
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {service.team}
                      </td>

                      {/* SLA */}
                      <td className="px-4 py-3">
                        <div className="flex items-baseline gap-1.5">
                          <span
                            className={clsx(
                              'text-sm font-mono font-medium',
                              slaMet ? 'text-success' : 'text-danger'
                            )}
                          >
                            {service.slaCurrent}%
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            / {service.slaTarget}%
                          </span>
                        </div>
                      </td>

                      {/* Error Rate */}
                      <td className="px-4 py-3 text-right">
                        <span
                          className={clsx(
                            'text-sm font-mono',
                            service.errorRate > 1
                              ? 'text-danger'
                              : service.errorRate > 0.1
                                ? 'text-warning'
                                : 'text-muted-foreground'
                          )}
                        >
                          {service.errorRate}%
                        </span>
                      </td>

                      {/* P99 Latency */}
                      <td className="px-4 py-3 text-right">
                        <span
                          className={clsx(
                            'text-sm font-mono',
                            service.latencyP99 > 1000
                              ? 'text-danger'
                              : service.latencyP99 > 500
                                ? 'text-warning'
                                : 'text-muted-foreground'
                          )}
                        >
                          {service.latencyP99}ms
                        </span>
                      </td>

                      {/* Throughput */}
                      <td className="px-4 py-3 text-right text-sm font-mono text-muted-foreground">
                        {formatThroughput(service.throughput)}/s
                      </td>

                      {/* Sparkline */}
                      <td className="px-4 py-3 text-right">
                        <Sparkline
                          data={service.sparklineData}
                          color={statusSparklineColor[service.status]}
                          width={80}
                          height={24}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredServices.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No services match the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
