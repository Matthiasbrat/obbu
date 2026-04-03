'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Layers,
  Brain,
  ArrowRight,
  Server,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { incidents } from '@/lib/mock-data';
import { StatusBadge, LayerBadge } from '@/components/shared/StatusBadge';

type FilterTab = 'all' | 'active' | 'resolved';

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date('2026-04-03T09:00:00Z');
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
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

export default function IncidentsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filteredIncidents = useMemo(() => {
    if (activeTab === 'all') return incidents;
    if (activeTab === 'active') return incidents.filter((i) => i.status !== 'resolved');
    return incidents.filter((i) => i.status === 'resolved');
  }, [activeTab]);

  const activeCount = incidents.filter((i) => i.status !== 'resolved').length;
  const resolvedTodayCount = incidents.filter(
    (i) => i.status === 'resolved' && i.resolvedAt?.startsWith('2026-04-03')
  ).length;
  const avgMttr = incidents
    .filter((i) => i.resolvedAt)
    .reduce((sum, i) => {
      const start = new Date(i.startedAt).getTime();
      const end = new Date(i.resolvedAt!).getTime();
      return sum + (end - start) / 60_000;
    }, 0);
  const resolvedCount = incidents.filter((i) => i.resolvedAt).length;
  const avgMttrMins = resolvedCount > 0 ? Math.round(avgMttr / resolvedCount) : 0;
  const avgConfidence = Math.round(
    incidents.reduce((sum, i) => sum + i.confidenceScore, 0) / incidents.length
  );

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: incidents.length },
    { key: 'active', label: 'Active', count: activeCount },
    { key: 'resolved', label: 'Resolved', count: incidents.length - activeCount },
  ];

  const stats = [
    {
      label: 'Active Incidents',
      value: activeCount,
      icon: AlertTriangle,
      color: activeCount > 0 ? 'text-danger' : 'text-success',
      bgColor: activeCount > 0 ? 'bg-danger-muted' : 'bg-success-muted',
    },
    {
      label: 'Resolved Today',
      value: resolvedTodayCount,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success-muted',
    },
    {
      label: 'Avg MTTR',
      value: `${avgMttrMins}m`,
      icon: Clock,
      color: 'text-info',
      bgColor: 'bg-info-muted',
    },
    {
      label: 'Avg Confidence',
      value: `${avgConfidence}%`,
      icon: Brain,
      color: 'text-accent-light',
      bgColor: 'bg-accent/15',
    },
  ];

  return (
    <div className="min-h-screen">
      <Header
        title="Incidents"
        description="Correlated incidents with AI-assisted root cause analysis"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 animate-fade-in">
        {/* Stats bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-border-subtle bg-card p-4"
            >
              <div className={clsx('rounded-lg p-2', stat.bgColor)}>
                <stat.icon className={clsx('h-4 w-4', stat.color)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={clsx('text-lg font-semibold', stat.color)}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-card p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-card-hover text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              <span
                className={clsx(
                  'rounded-full px-1.5 py-0.5 text-[10px]',
                  activeTab === tab.key ? 'bg-accent/20 text-accent-light' : 'bg-border text-muted'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Incident cards */}
        <div className="space-y-3">
          {filteredIncidents.map((incident) => (
            <Link
              key={incident.id}
              href={`/incidents/${incident.id}`}
              className="group block rounded-xl border border-border-subtle bg-card p-5 transition-all hover:border-border hover:bg-card-hover"
            >
              <div className="flex items-start justify-between">
                {/* Left section */}
                <div className="flex-1 space-y-3">
                  {/* Top row: ID, severity, status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">{incident.id}</span>
                    <StatusBadge status={incident.severity} />
                    <StatusBadge status={incident.status} />
                    <LayerBadge layer={incident.correlationLayer} />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-medium text-foreground group-hover:text-accent-light transition-colors">
                    {incident.title}
                  </h3>

                  {/* Business impact */}
                  <p className="text-xs text-muted-foreground">{incident.businessImpact}</p>

                  {/* Bottom meta */}
                  <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
                    <span className="flex items-center gap-1">
                      <Server className="h-3 w-3" />
                      {incident.affectedServices.length} service{incident.affectedServices.length !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(incident.revenueAtRisk)} at risk
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {incident.clientsAffected.toLocaleString()} clients
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {incident.status === 'resolved'
                        ? `Duration: ${formatDuration(incident.startedAt, incident.resolvedAt)}`
                        : `Started ${formatTimeAgo(incident.startedAt)}`}
                    </span>
                  </div>
                </div>

                {/* Right section: Confidence score */}
                <div className="flex flex-col items-center gap-1 pl-6">
                  <div
                    className={clsx(
                      'flex h-12 w-12 items-center justify-center rounded-full border-2',
                      incident.confidenceScore >= 85
                        ? 'border-success text-success'
                        : incident.confidenceScore >= 50
                        ? 'border-warning text-warning'
                        : 'border-danger text-danger'
                    )}
                  >
                    <span className="text-sm font-bold">{incident.confidenceScore}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">confidence</span>
                  <ArrowRight className="mt-2 h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
