'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePlugins } from '@/lib/plugins/context';
import type { WidgetInstance, Plugin, PluginWidget } from '@/lib/plugins/types';
import {
  GitBranch,
  Github,
  MessageSquare,
  Siren,
  Ticket,
  SquareKanban,
  BarChart3,
  LayoutDashboard,
  Search,
  Radio,
  HeartPulse,
  Workflow,
  Container,
  Webhook,
  Target,
  Wand2,
  Route,
  FileBarChart,
  Puzzle,
  X,
  Settings,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GitBranch,
  Github,
  MessageSquare,
  Siren,
  Ticket,
  SquareKanban,
  BarChart3,
  LayoutDashboard,
  Search,
  Radio,
  HeartPulse,
  Workflow,
  Container,
  Webhook,
  Target,
  Wand2,
  Route,
  FileBarChart,
  Puzzle,
};

function getIcon(name: string) {
  return iconMap[name] || Puzzle;
}

const sizeClasses: Record<string, string> = {
  sm: 'col-span-12 sm:col-span-6',
  md: 'col-span-12 sm:col-span-6',
  lg: 'col-span-12 sm:col-span-6 lg:col-span-8',
  full: 'col-span-12',
};

const mockWorkflows = [
  { name: 'CI Pipeline', status: 'green', time: '2m ago', branch: 'main' },
  { name: 'Deploy Staging', status: 'green', time: '5m ago', branch: 'develop' },
  { name: 'Lint & Test', status: 'red', time: '8m ago', branch: 'feature/auth' },
  { name: 'Release Build', status: 'yellow', time: '12m ago', branch: 'release/v2.1' },
];

const mockTargets = [
  { status: 'up', endpoint: 'http://api-gateway:9090/metrics', scrape: '15s' },
  { status: 'up', endpoint: 'http://auth-service:9090/metrics', scrape: '30s' },
  { status: 'down', endpoint: 'http://payment-svc:9090/metrics', scrape: '15s' },
  { status: 'up', endpoint: 'http://user-service:9090/metrics', scrape: '30s' },
  { status: 'up', endpoint: 'http://notification-svc:9090/metrics', scrape: '60s' },
];

const statusDotColor: Record<string, string> = {
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  up: 'bg-emerald-500',
  down: 'bg-red-500',
};

function GhActionsContent() {
  return (
    <div className="space-y-2">
      {mockWorkflows.map((wf) => (
        <div
          key={wf.name}
          className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/50 border border-border-subtle/50"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${statusDotColor[wf.status]}`}
            />
            <span className="text-sm text-foreground truncate">{wf.name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
            <span className="hidden sm:inline font-mono">{wf.branch}</span>
            <span>{wf.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PromTargetsContent() {
  return (
    <div className="space-y-2">
      {mockTargets.map((t) => (
        <div
          key={t.endpoint}
          className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/50 border border-border-subtle/50"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${statusDotColor[t.status]}`}
            />
            <span className="text-sm text-foreground font-mono truncate">
              {t.endpoint}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                t.status === 'up'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {t.status}
            </span>
            <span>{t.scrape}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DefaultWidgetContent({ widget }: { widget: PluginWidget }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-sm text-muted-foreground mb-3">{widget.description}</p>
      <Link
        href="/settings/plugins"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Settings className="h-3 w-3" />
        Configure in plugin settings
      </Link>
    </div>
  );
}

function WidgetBody({ widgetId, widget }: { widgetId: string; widget: PluginWidget }) {
  if (widgetId === 'gh-actions') return <GhActionsContent />;
  if (widgetId === 'prom-targets') return <PromTargetsContent />;
  return <DefaultWidgetContent widget={widget} />;
}

function WidgetCard({
  instance,
  plugin,
  widget,
  onRemove,
}: {
  instance: WidgetInstance;
  plugin: Plugin;
  widget: PluginWidget;
  onRemove: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = getIcon(plugin.icon);

  return (
    <div
      className={`${sizeClasses[instance.size]} transition-all`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="bg-card border border-border-subtle rounded-xl overflow-hidden h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <div className="flex items-center gap-2.5 min-w-0">
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <span className="text-sm font-medium text-foreground truncate block">
                {widget.name}
              </span>
              <span className="text-[11px] text-muted-foreground">{plugin.name}</span>
            </div>
          </div>
          <button
            onClick={() => onRemove(instance.id)}
            className={`p-1 rounded-md hover:bg-background/80 text-muted-foreground hover:text-foreground transition-all ${
              hovered ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label="Remove widget"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <WidgetBody widgetId={instance.widgetId} widget={widget} />
        </div>
      </div>
    </div>
  );
}

export function WidgetGrid() {
  const { plugins, widgetInstances, removeWidget } = usePlugins();

  const sortedInstances = [...widgetInstances].sort((a, b) => a.position - b.position);

  const resolvedWidgets = sortedInstances
    .map((instance) => {
      const plugin = plugins.find((p) => p.id === instance.pluginId);
      const widget = plugin?.widgets?.find((w) => w.id === instance.widgetId);
      if (!plugin || !widget) return null;
      return { instance, plugin, widget };
    })
    .filter(Boolean) as { instance: WidgetInstance; plugin: Plugin; widget: PluginWidget }[];

  if (resolvedWidgets.length === 0) {
    return (
      <div className="bg-card border border-border-subtle rounded-xl p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No widgets added.{' '}
          <Link
            href="/settings/plugins"
            className="text-foreground hover:underline transition-colors"
          >
            Visit Plugins
          </Link>{' '}
          to add dashboard widgets.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-foreground">Dashboard Widgets</h2>
          <span className="text-xs text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded-md border border-border-subtle">
            {resolvedWidgets.length}
          </span>
        </div>
        <Link
          href="/settings/plugins"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Manage Plugins
        </Link>
      </div>

      {/* Widget grid */}
      <div className="grid grid-cols-12 gap-4">
        {resolvedWidgets.map(({ instance, plugin, widget }) => (
          <WidgetCard
            key={instance.id}
            instance={instance}
            plugin={plugin}
            widget={widget}
            onRemove={removeWidget}
          />
        ))}
      </div>
    </div>
  );
}
