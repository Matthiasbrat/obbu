'use client';

import { useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import {
  ChevronDown,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { businessCapabilities, services } from '@/lib/mock-data';
import { StatusBadge, StatusDot } from '@/components/shared/StatusBadge';
import { Sparkline } from '@/components/charts/Sparkline';
import type { BusinessCapability, KPI, ClientRequirement } from '@/lib/types';

const trendIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const priorityStyles: Record<string, string> = {
  critical: 'bg-danger-muted text-danger',
  high: 'bg-warning-muted text-warning',
  medium: 'bg-info-muted text-info',
  low: 'bg-card text-muted-foreground',
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function SLAGauge({ current, target, status }: { current: number; target: number; status: string }) {
  const percentage = Math.min((current / target) * 100, 100);
  const barColor =
    status === 'met' ? 'bg-success' : status === 'at-risk' ? 'bg-warning' : 'bg-danger';
  const bgColor =
    status === 'met' ? 'bg-success/10' : status === 'at-risk' ? 'bg-warning/10' : 'bg-danger/10';

  return (
    <div className="flex items-center gap-3 min-w-[180px]">
      <div className={clsx('flex-1 h-2 rounded-full', bgColor)}>
        <div
          className={clsx('h-full rounded-full transition-all', barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
        {current}% / {target}%
      </span>
    </div>
  );
}

function KPICard({ kpi }: { kpi: KPI }) {
  const TrendIcon = trendIcon[kpi.trend];
  const isInverse = kpi.name === 'Cart Abandonment' || kpi.name === 'False Positive Rate';
  const isGood = isInverse ? kpi.value <= kpi.target : kpi.value >= kpi.target;
  const sparkColor = isGood ? '#22c55e' : '#ef4444';

  return (
    <div className="bg-background rounded-lg px-3.5 py-3 border border-border-subtle">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-muted-foreground truncate">{kpi.name}</span>
        <TrendIcon className={clsx('w-3.5 h-3.5', isGood ? 'text-success' : 'text-danger')} />
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <span
            className={clsx(
              'text-lg font-mono font-semibold',
              isGood ? 'text-foreground' : 'text-danger'
            )}
          >
            {kpi.value}
          </span>
          <span className="text-xs text-muted ml-1">
            {kpi.unit === '$' ? '' : kpi.unit}
          </span>
          <div className="text-[10px] text-muted mt-0.5">
            Target: {kpi.target}{kpi.unit}
          </div>
        </div>
        <Sparkline data={kpi.sparkline} color={sparkColor} width={64} height={24} />
      </div>
    </div>
  );
}

function ClientRequirementRow({ req }: { req: ClientRequirement }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-background rounded-lg border border-border-subtle">
      <span
        className={clsx(
          'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize shrink-0',
          priorityStyles[req.priority]
        )}
      >
        {req.priority}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">{req.name}</div>
        <div className="text-xs text-muted-foreground truncate">{req.description}</div>
      </div>
      <SLAGauge current={req.slaCurrent} target={req.slaTarget} status={req.status} />
      <StatusBadge status={req.status} />
    </div>
  );
}

function BusinessToTechFlow({ requirements, capability }: { requirements: ClientRequirement[]; capability: BusinessCapability }) {
  const allLinkedServiceIds = Array.from(
    new Set(requirements.flatMap((r) => r.linkedServices))
  );
  const linkedServices = allLinkedServiceIds
    .map((id) => services.find((s) => s.id === id))
    .filter(Boolean);

  return (
    <div className="flex items-stretch gap-0 overflow-x-auto">
      {/* Left: Client Requirements */}
      <div className="flex flex-col gap-2 min-w-[220px] shrink-0">
        <div className="text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
          Client Requirements
        </div>
        {requirements.map((req) => (
          <div
            key={req.id}
            className={clsx(
              'px-3 py-2 rounded-lg border text-xs',
              req.status === 'breached'
                ? 'border-danger/30 bg-danger-muted'
                : req.status === 'at-risk'
                ? 'border-warning/30 bg-warning-muted'
                : 'border-border-subtle bg-background'
            )}
          >
            <div className="font-medium text-foreground truncate">{req.name}</div>
            <div className="text-muted-foreground mt-0.5">
              SLA: {req.slaCurrent}% / {req.slaTarget}%
            </div>
          </div>
        ))}
      </div>

      {/* Center: Arrow connector */}
      <div className="flex items-center justify-center px-6 shrink-0">
        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center gap-1 text-muted">
            <div className="w-12 h-px bg-border" />
            <ArrowRight className="w-4 h-4 text-accent-light" />
            <div className="w-12 h-px bg-border" />
          </div>
          <div className="text-[10px] text-muted-foreground">maps to</div>
          <div className="w-px h-8 bg-border" />
        </div>
      </div>

      {/* Right: Technical Services */}
      <div className="flex flex-col gap-2 min-w-[220px] shrink-0">
        <div className="text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
          Technical Services
        </div>
        {linkedServices.map((svc) =>
          svc ? (
            <Link
              key={svc.id}
              href={`/services/${svc.id}`}
              className="group flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border-subtle bg-background hover:bg-card-hover hover:border-accent/30 transition-all"
            >
              <StatusDot status={svc.status} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground group-hover:text-accent-light truncate transition-colors">
                  {svc.name}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {svc.tier} &middot; {svc.slaCurrent}% SLA
                </div>
              </div>
              <ArrowRight className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ) : null
        )}
      </div>
    </div>
  );
}

function CapabilityCard({
  capability,
  isExpanded,
  onToggle,
}: {
  capability: BusinessCapability;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const breachCount = capability.clientRequirements.filter(
    (cr) => cr.status === 'breached'
  ).length;

  return (
    <div
      className={clsx(
        'bg-card border rounded-xl transition-all',
        isExpanded ? 'border-border' : 'border-border-subtle',
        breachCount > 0 && 'ring-1 ring-danger/20'
      )}
    >
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-card-hover/50 transition-colors rounded-xl"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <StatusDot status={capability.status} size="md" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-foreground">{capability.name}</span>
          <span className="text-xs text-muted-foreground ml-3">{capability.description}</span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            {capability.owner}
          </div>
          {capability.revenueContribution > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <DollarSign className="w-3.5 h-3.5" />
              {formatCurrency(capability.revenueContribution)}
            </div>
          )}
          <StatusBadge status={capability.status} />
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-6 animate-slide-up">
          <div className="border-t border-border-subtle" />

          {/* Client Requirements section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              Client Requirements
            </h3>
            <div className="space-y-2">
              {capability.clientRequirements.map((req) => (
                <ClientRequirementRow key={req.id} req={req} />
              ))}
            </div>
          </div>

          {/* Business-to-Technical Flow */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Target className="w-3.5 h-3.5" />
              Business-to-Technical Flow
            </h3>
            <div className="bg-background rounded-lg border border-border-subtle p-5">
              <BusinessToTechFlow
                requirements={capability.clientRequirements}
                capability={capability}
              />
            </div>
          </div>

          {/* KPIs section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Key Performance Indicators
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {capability.kpis.map((kpi) => (
                <KPICard key={kpi.name} kpi={kpi} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BusinessTracingPage() {
  const [expandedId, setExpandedId] = useState<string | null>(
    businessCapabilities[0]?.id ?? null
  );

  // Summary computations
  const totalCapabilities = businessCapabilities.length;
  const slaBreaches = businessCapabilities.reduce(
    (count, cap) =>
      count + cap.clientRequirements.filter((cr) => cr.status === 'breached').length,
    0
  );
  const revenueAtRisk = businessCapabilities
    .filter((cap) => cap.status !== 'healthy')
    .reduce((sum, cap) => sum + cap.revenueContribution, 0);
  const totalRequirements = businessCapabilities.reduce(
    (count, cap) => count + cap.clientRequirements.length,
    0
  );
  const metRequirements = businessCapabilities.reduce(
    (count, cap) =>
      count + cap.clientRequirements.filter((cr) => cr.status === 'met').length,
    0
  );
  const metPercentage =
    totalRequirements > 0 ? Math.round((metRequirements / totalRequirements) * 100) : 0;

  const summaryCards = [
    {
      label: 'Total Capabilities',
      value: totalCapabilities.toString(),
      icon: Target,
      color: 'text-accent-light',
      bg: 'bg-accent/10',
    },
    {
      label: 'SLA Breaches',
      value: slaBreaches.toString(),
      icon: AlertTriangle,
      color: slaBreaches > 0 ? 'text-danger' : 'text-success',
      bg: slaBreaches > 0 ? 'bg-danger-muted' : 'bg-success-muted',
    },
    {
      label: 'Revenue at Risk',
      value: formatCurrency(revenueAtRisk),
      icon: DollarSign,
      color: revenueAtRisk > 0 ? 'text-warning' : 'text-success',
      bg: revenueAtRisk > 0 ? 'bg-warning-muted' : 'bg-success-muted',
    },
    {
      label: 'Requirements Met',
      value: `${metPercentage}%`,
      icon: CheckCircle2,
      color: metPercentage >= 90 ? 'text-success' : metPercentage >= 70 ? 'text-warning' : 'text-danger',
      bg: metPercentage >= 90 ? 'bg-success-muted' : metPercentage >= 70 ? 'bg-warning-muted' : 'bg-danger-muted',
    },
  ];

  return (
    <div className="min-h-screen">
      <Header
        title="Business Tracing"
        description="Client requirements to technical delivery mapping"
      />
      <div className="p-8 space-y-6 animate-fade-in">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="bg-card border border-border-subtle rounded-xl px-5 py-4 flex items-center gap-4"
            >
              <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', card.bg)}>
                <card.icon className={clsx('w-5 h-5', card.color)} />
              </div>
              <div>
                <div className="text-2xl font-semibold font-mono text-foreground">{card.value}</div>
                <div className="text-xs text-muted-foreground">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Capability cards */}
        <div className="space-y-4">
          {businessCapabilities.map((cap) => (
            <CapabilityCard
              key={cap.id}
              capability={cap}
              isExpanded={expandedId === cap.id}
              onToggle={() =>
                setExpandedId((prev) => (prev === cap.id ? null : cap.id))
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
