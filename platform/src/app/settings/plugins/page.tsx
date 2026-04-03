'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { usePlugins } from '@/lib/plugins/context';
import type { Plugin, PluginCategory } from '@/lib/plugins/types';
import {
  GitBranch,
  GitFork,
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
  Download,
  Settings2,
  Blocks,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Icon mapping
// ---------------------------------------------------------------------------
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GitBranch,
  GitFork,
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

// ---------------------------------------------------------------------------
// Category helpers
// ---------------------------------------------------------------------------
type CategoryFilter = 'all' | PluginCategory;

const categoryLabels: Record<CategoryFilter, string> = {
  all: 'All',
  integration: 'Integrations',
  'data-source': 'Data Sources',
  widget: 'Widgets',
  automation: 'Automations',
};

const categoryBadgeClasses: Record<PluginCategory, string> = {
  integration: 'bg-info-muted text-info',
  'data-source': 'bg-success-muted text-success',
  widget: 'bg-accent/15 text-accent-light',
  automation: 'bg-warning-muted text-warning',
};

function formatInstalls(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card border border-border-subtle rounded-xl px-4 py-3 flex flex-col gap-0.5">
      <span className="text-2xl font-semibold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function CategoryTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        active
          ? 'bg-accent text-white'
          : 'text-muted-foreground hover:text-foreground hover:bg-card-hover'
      }`}
    >
      {label}
      <span
        className={`ml-1.5 text-xs ${active ? 'text-white/70' : 'text-muted-foreground'}`}
      >
        {count}
      </span>
    </button>
  );
}

function FeaturedCard({
  plugin,
  onToggle,
}: {
  plugin: Plugin;
  onToggle: (id: string) => void;
}) {
  const Icon = getIcon(plugin.icon);
  const enabled = plugin.status === 'enabled';

  return (
    <div className="min-w-[320px] max-w-[400px] flex-shrink-0 bg-card border border-border-subtle rounded-xl p-5 hover:border-accent/40 transition-colors group">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2.5 rounded-lg bg-accent/10 text-accent-light flex-shrink-0">
          <Icon className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{plugin.name}</h3>
            {enabled && <span className="w-2 h-2 rounded-full bg-success flex-shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground">
            v{plugin.version} by {plugin.author}
          </p>
        </div>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
            categoryBadgeClasses[plugin.category]
          }`}
        >
          {categoryLabels[plugin.category]}
        </span>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
        {plugin.longDescription
          ? plugin.longDescription.split('\n')[0]
          : plugin.description}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Download className="w-3 h-3" />
          {formatInstalls(plugin.installCount)}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/settings/plugins/${plugin.id}`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Configure
          </Link>
          <button
            onClick={() => onToggle(plugin.id)}
            className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
              enabled
                ? 'bg-success-muted text-success hover:bg-success-muted/80'
                : 'bg-accent/15 text-accent-light hover:bg-accent/25'
            }`}
          >
            {enabled ? 'Enabled' : 'Enable'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PluginCard({
  plugin,
  onToggle,
}: {
  plugin: Plugin;
  onToggle: (id: string) => void;
}) {
  const Icon = getIcon(plugin.icon);
  const enabled = plugin.status === 'enabled';

  return (
    <div className="bg-card border border-border-subtle rounded-xl p-4 hover:border-accent/40 transition-colors group flex flex-col">
      {/* Header row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-lg bg-accent/10 text-accent-light flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {plugin.name}
            </h3>
            {enabled && (
              <span className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            v{plugin.version} &middot; {plugin.author}
          </p>
        </div>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
            categoryBadgeClasses[plugin.category]
          }`}
        >
          {categoryLabels[plugin.category]}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
        {plugin.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {plugin.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full bg-background text-muted-foreground border border-border-subtle"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Download className="w-3 h-3" />
          {formatInstalls(plugin.installCount)}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/settings/plugins/${plugin.id}`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Settings2 className="w-3 h-3" />
            Configure
          </Link>
          <button
            onClick={() => onToggle(plugin.id)}
            className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
              enabled
                ? 'bg-success-muted text-success hover:bg-success-muted/80'
                : 'bg-accent/15 text-accent-light hover:bg-accent/25'
            }`}
          >
            {enabled ? 'Enabled' : 'Enable'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PluginsPage() {
  const { plugins, enablePlugin, disablePlugin } = usePlugins();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');

  // Derived data
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      all: plugins.length,
      integration: 0,
      'data-source': 0,
      widget: 0,
      automation: 0,
    };
    for (const p of plugins) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [plugins]);

  const filtered = useMemo(() => {
    let list = plugins;
    if (category !== 'all') {
      list = list.filter((p) => p.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [plugins, category, search]);

  const featured = useMemo(
    () => plugins.filter((p) => p.featured),
    [plugins]
  );

  const enabledCount = plugins.filter((p) => p.status === 'enabled').length;
  const totalWidgets = plugins.reduce(
    (sum, p) => sum + (p.widgets?.length ?? 0),
    0
  );
  const totalInstalls = plugins.reduce((sum, p) => sum + p.installCount, 0);

  function handleToggle(id: string) {
    const plugin = plugins.find((p) => p.id === id);
    if (!plugin) return;
    if (plugin.status === 'enabled') {
      disablePlugin(id);
    } else {
      enablePlugin(id);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Plugins"
        description="Extend Obbu with integrations, widgets, and automations"
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Plugins" value={plugins.length} />
          <StatCard label="Enabled" value={enabledCount} />
          <StatCard label="Available Widgets" value={totalWidgets} />
          <StatCard
            label="Total Installs"
            value={formatInstalls(totalInstalls)}
          />
        </div>

        {/* Search + Category filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plugins by name, description, or tag..."
              className="w-full bg-card border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {(Object.keys(categoryLabels) as CategoryFilter[]).map((key) => (
              <CategoryTab
                key={key}
                label={categoryLabels[key]}
                count={categoryCounts[key]}
                active={category === key}
                onClick={() => setCategory(key)}
              />
            ))}
          </div>
        </div>

        {/* Featured section — only when "All" and no search */}
        {category === 'all' && !search.trim() && featured.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Blocks className="w-4 h-4 text-accent-light" />
              Featured
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
              {featured.map((p) => (
                <FeaturedCard key={p.id} plugin={p} onToggle={handleToggle} />
              ))}
            </div>
          </section>
        )}

        {/* Plugin grid */}
        <section>
          {category === 'all' && !search.trim() && (
            <h2 className="text-sm font-semibold text-foreground mb-3">
              All Plugins
            </h2>
          )}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Puzzle className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No plugins found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <PluginCard key={p.id} plugin={p} onToggle={handleToggle} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
