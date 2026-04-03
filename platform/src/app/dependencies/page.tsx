'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import {
  Globe,
  Server,
  Database,
  Radio,
  Shield,
  ArrowRight,
  X,
  Activity,
  GitBranch,
  Zap,
  Clock,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StatusBadge, StatusDot } from '@/components/shared/StatusBadge';
import {
  dependencyNodes,
  dependencyEdges,
  services,
} from '@/lib/mock-data';
import type { DependencyNode, DependencyEdge } from '@/lib/types';

const SCALE = 1.1;
const NODE_WIDTH = 140;
const NODE_HEIGHT = 52;

const statusColor: Record<string, string> = {
  healthy: '#22c55e',
  degraded: '#f59e0b',
  critical: '#ef4444',
  unknown: '#6b7280',
};

const typeConfig: Record<
  DependencyNode['type'],
  { color: string; bg: string; icon: typeof Server }
> = {
  service: { color: '#818cf8', bg: '#818cf820', icon: Server },
  database: { color: '#60a5fa', bg: '#60a5fa20', icon: Database },
  queue: { color: '#fb923c', bg: '#fb923c20', icon: Radio },
  external: { color: '#9ca3af', bg: '#9ca3af20', icon: Globe },
  gateway: { color: '#4ade80', bg: '#4ade8020', icon: Shield },
};

function edgeColor(status: string): string {
  if (status === 'critical') return '#ef4444';
  if (status === 'degraded') return '#f59e0b';
  return '#334155';
}

export default function DependenciesPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodeMap = useMemo(
    () => new Map(dependencyNodes.map((n) => [n.id, n])),
    []
  );

  const edgesForNode = useMemo(() => {
    if (!selectedNode && !hoveredNode) return [];
    const id = selectedNode || hoveredNode;
    return dependencyEdges.filter(
      (e) => e.source === id || e.target === id
    );
  }, [selectedNode, hoveredNode]);

  const connectedNodeIds = useMemo(() => {
    const ids = new Set<string>();
    edgesForNode.forEach((e) => {
      ids.add(e.source);
      ids.add(e.target);
    });
    return ids;
  }, [edgesForNode]);

  const activeId = hoveredNode || selectedNode;

  const criticalPaths = dependencyEdges.filter(
    (e) => e.status === 'critical'
  ).length;
  const avgLatency = Math.round(
    dependencyEdges.reduce((s, e) => s + e.latency, 0) /
      dependencyEdges.length
  );

  const selectedNodeData = selectedNode ? nodeMap.get(selectedNode) : null;
  const selectedEdges = selectedNode
    ? dependencyEdges.filter(
        (e) => e.source === selectedNode || e.target === selectedNode
      )
    : [];

  const matchingService = selectedNodeData
    ? services.find((s) => s.id === selectedNodeData.id)
    : null;

  return (
    <div className="min-h-screen">
      <Header
        title="Dependencies"
        description="Service topology and dependency graph"
      />
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 animate-fade-in">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Nodes',
              value: dependencyNodes.length,
              icon: GitBranch,
            },
            {
              label: 'Total Edges',
              value: dependencyEdges.length,
              icon: Activity,
            },
            {
              label: 'Critical Paths',
              value: criticalPaths,
              icon: Zap,
              highlight: criticalPaths > 0,
            },
            {
              label: 'Avg Latency',
              value: `${avgLatency}ms`,
              icon: Clock,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-border-subtle bg-card p-4"
            >
              <div
                className={clsx(
                  'flex h-9 w-9 items-center justify-center rounded-lg',
                  stat.highlight
                    ? 'bg-danger-muted text-danger'
                    : 'bg-card-hover text-muted-foreground'
                )}
              >
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p
                  className={clsx(
                    'text-lg font-semibold',
                    stat.highlight ? 'text-danger' : 'text-foreground'
                  )}
                >
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main graph + side panel */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* SVG Graph */}
          <div
            className={clsx(
              'flex-1 rounded-xl border border-border-subtle bg-card overflow-hidden',
              selectedNode ? 'min-w-0' : ''
            )}
          >
            <div className="overflow-x-auto">
            <div className="min-w-[700px]">
            <svg
              viewBox="0 0 1050 700"
              className="w-full h-auto"
              style={{ minHeight: 500 }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 8 3, 0 6"
                    fill="#475569"
                    opacity="0.6"
                  />
                </marker>
                <marker
                  id="arrowhead-critical"
                  markerWidth="8"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
                </marker>
                <marker
                  id="arrowhead-degraded"
                  markerWidth="8"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
                </marker>
                <marker
                  id="arrowhead-highlight"
                  markerWidth="8"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="#818cf8" />
                </marker>
              </defs>

              {/* Edges */}
              {dependencyEdges.map((edge) => {
                const src = nodeMap.get(edge.source);
                const tgt = nodeMap.get(edge.target);
                if (!src || !tgt) return null;

                const x1 = src.x * SCALE + NODE_WIDTH / 2;
                const y1 = src.y * SCALE + NODE_HEIGHT / 2;
                const x2 = tgt.x * SCALE + NODE_WIDTH / 2;
                const y2 = tgt.y * SCALE + NODE_HEIGHT / 2;

                const isConnected =
                  activeId &&
                  (edge.source === activeId || edge.target === activeId);
                const isFaded = activeId && !isConnected;
                const isCritical = edge.status === 'critical';
                const isDegraded = edge.status === 'degraded';

                let marker = 'url(#arrowhead)';
                if (isConnected) marker = 'url(#arrowhead-highlight)';
                else if (isCritical) marker = 'url(#arrowhead-critical)';
                else if (isDegraded) marker = 'url(#arrowhead-degraded)';

                return (
                  <line
                    key={`${edge.source}-${edge.target}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={
                      isConnected
                        ? '#818cf8'
                        : edgeColor(edge.status)
                    }
                    strokeWidth={isConnected ? 2.5 : isCritical ? 2 : 1.5}
                    strokeOpacity={isFaded ? 0.15 : isCritical ? 0.9 : 0.6}
                    strokeDasharray={isCritical ? '6 4' : 'none'}
                    markerEnd={marker}
                    style={
                      isCritical
                        ? {
                            animation: 'dash 1s linear infinite',
                          }
                        : undefined
                    }
                  />
                );
              })}

              {/* Nodes */}
              {dependencyNodes.map((node) => {
                const nx = node.x * SCALE;
                const ny = node.y * SCALE;
                const cfg = typeConfig[node.type];
                const Icon = cfg.icon;
                const isActive = activeId === node.id;
                const isConnected = activeId
                  ? connectedNodeIds.has(node.id)
                  : false;
                const isFaded =
                  activeId && !isActive && !isConnected;
                const isSelected = selectedNode === node.id;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${nx}, ${ny})`}
                    onClick={() =>
                      setSelectedNode(
                        selectedNode === node.id ? null : node.id
                      )
                    }
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{ cursor: 'pointer' }}
                    opacity={isFaded ? 0.25 : 1}
                  >
                    {/* Shadow / glow for active */}
                    {isActive && (
                      <rect
                        x={-3}
                        y={-3}
                        width={NODE_WIDTH + 6}
                        height={NODE_HEIGHT + 6}
                        rx={14}
                        fill="none"
                        stroke={cfg.color}
                        strokeWidth={2}
                        strokeOpacity={0.5}
                      />
                    )}
                    {isSelected && (
                      <rect
                        x={-3}
                        y={-3}
                        width={NODE_WIDTH + 6}
                        height={NODE_HEIGHT + 6}
                        rx={14}
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth={2}
                        strokeOpacity={0.7}
                      />
                    )}

                    {/* Background rect */}
                    <rect
                      width={NODE_WIDTH}
                      height={NODE_HEIGHT}
                      rx={12}
                      fill={isActive ? cfg.bg : '#0f172a'}
                      stroke={isActive ? cfg.color : '#1e293b'}
                      strokeWidth={1}
                    />

                    {/* Type icon */}
                    <foreignObject x={10} y={10} width={20} height={20}>
                      <div
                        style={{ color: cfg.color }}
                        className="flex items-center justify-center"
                      >
                        <Icon size={14} />
                      </div>
                    </foreignObject>

                    {/* Status dot */}
                    <circle
                      cx={NODE_WIDTH - 14}
                      cy={14}
                      r={4}
                      fill={statusColor[node.status]}
                    >
                      {node.status === 'critical' && (
                        <animate
                          attributeName="opacity"
                          values="1;0.3;1"
                          dur="1.5s"
                          repeatCount="indefinite"
                        />
                      )}
                    </circle>

                    {/* Name */}
                    <text
                      x={NODE_WIDTH / 2}
                      y={33}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize={11}
                      fontWeight={500}
                      fontFamily="system-ui, sans-serif"
                    >
                      {node.name}
                    </text>

                    {/* Type label */}
                    <text
                      x={NODE_WIDTH / 2}
                      y={45}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize={9}
                      fontFamily="system-ui, sans-serif"
                    >
                      {node.type}
                    </text>
                  </g>
                );
              })}

              {/* Dash animation for critical edges */}
              <style>
                {`
                  @keyframes dash {
                    to { stroke-dashoffset: -20; }
                  }
                `}
              </style>
            </svg>
            </div>
            </div>
          </div>

          {/* Side panel */}
          {selectedNodeData && (
            <div className="w-full lg:w-[300px] shrink-0 rounded-xl border border-border-subtle bg-card p-5 space-y-5 self-start">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Node Details
                </h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-md hover:bg-card-hover text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Node info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = typeConfig[selectedNodeData.type].icon;
                    return (
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor:
                            typeConfig[selectedNodeData.type].bg,
                          color: typeConfig[selectedNodeData.type].color,
                        }}
                      >
                        <Icon size={16} />
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {selectedNodeData.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {selectedNodeData.type}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-card-hover p-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Status
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={selectedNodeData.status} />
                    </div>
                  </div>
                  <div className="rounded-lg bg-card-hover p-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Tier
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {selectedNodeData.tier}
                    </p>
                  </div>
                </div>
              </div>

              {/* Connected edges */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Connections ({selectedEdges.length})
                </h4>
                <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                  {selectedEdges.map((edge) => {
                    const isSource = edge.source === selectedNode;
                    const otherId = isSource ? edge.target : edge.source;
                    const other = nodeMap.get(otherId);
                    if (!other) return null;

                    return (
                      <div
                        key={`${edge.source}-${edge.target}`}
                        className="flex items-center justify-between rounded-lg bg-card-hover p-2 text-xs"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <ArrowRight
                            className={clsx(
                              'h-3 w-3 shrink-0',
                              isSource
                                ? 'text-muted-foreground'
                                : 'text-muted-foreground rotate-180'
                            )}
                          />
                          <StatusDot status={edge.status} size="sm" />
                          <span className="text-foreground truncate">
                            {other.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-muted-foreground">
                          <span>{edge.latency}ms</span>
                          <span
                            className={clsx(
                              edge.errorRate > 1
                                ? 'text-danger'
                                : edge.errorRate > 0.1
                                ? 'text-warning'
                                : ''
                            )}
                          >
                            {edge.errorRate}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Link to service detail */}
              {matchingService && (
                <Link
                  href={`/services/${matchingService.id}`}
                  className="flex items-center justify-center gap-2 rounded-lg border border-border-subtle bg-card-hover px-3 py-2 text-xs font-medium text-foreground hover:bg-accent/10 hover:text-accent-light transition-colors"
                >
                  <Server className="h-3.5 w-3.5" />
                  View Service Details
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 rounded-xl border border-border-subtle bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Node Types
          </span>
          {(
            Object.entries(typeConfig) as [
              DependencyNode['type'],
              (typeof typeConfig)[DependencyNode['type']],
            ][]
          ).map(([type, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={type} className="flex items-center gap-1.5">
                <div
                  className="flex h-5 w-5 items-center justify-center rounded"
                  style={{ backgroundColor: cfg.bg, color: cfg.color }}
                >
                  <Icon size={11} />
                </div>
                <span className="text-xs text-muted-foreground capitalize">
                  {type}
                </span>
              </div>
            );
          })}

          <div className="mx-2 h-4 w-px bg-border-subtle" />

          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Status
          </span>
          {(['healthy', 'degraded', 'critical'] as const).map((status) => (
            <div key={status} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: statusColor[status] }}
              />
              <span className="text-xs text-muted-foreground capitalize">
                {status}
              </span>
            </div>
          ))}

          <div className="mx-2 h-4 w-px bg-border-subtle" />

          <div className="flex items-center gap-1.5">
            <svg width="24" height="8">
              <line
                x1="0"
                y1="4"
                x2="24"
                y2="4"
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            </svg>
            <span className="text-xs text-muted-foreground">
              Critical path
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
