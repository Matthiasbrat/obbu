'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Eye,
  EyeOff,
  Download,
  Calendar,
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
} from 'lucide-react';
import { usePlugins } from '@/lib/plugins/context';
import type { ConfigField, PluginWebhook, PluginWidget } from '@/lib/plugins/types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GitBranch,
  Github: GitFork,
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

/* ------------------------------------------------------------------ */
/*  Toggle Switch                                                      */
/* ------------------------------------------------------------------ */
function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
        checked ? 'bg-success' : 'bg-border'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 translate-y-0.5 ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Category badge color                                               */
/* ------------------------------------------------------------------ */
function categoryColor(cat: string) {
  switch (cat) {
    case 'integration':
      return 'bg-info-muted text-info';
    case 'widget':
      return 'bg-accent/15 text-accent-light';
    case 'automation':
      return 'bg-warning-muted text-warning';
    case 'data-source':
      return 'bg-success-muted text-success';
    default:
      return 'bg-card-hover text-muted-foreground';
  }
}

/* ------------------------------------------------------------------ */
/*  Collapsible Group                                                  */
/* ------------------------------------------------------------------ */
function CollapsibleGroup({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-4 py-3 bg-card-hover/50 hover:bg-card-hover transition-colors text-left"
      >
        <span className="text-sm font-medium text-foreground">{title}</span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="px-4 py-4 space-y-4">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function PluginDetail() {
  const params = useParams<{ id: string }>();
  const { plugins, enablePlugin, disablePlugin, updateConfig, addWidget } =
    usePlugins();

  const plugin = plugins.find((p) => p.id === params.id);

  /* form state */
  const [formValues, setFormValues] = useState<
    Record<string, string | number | boolean | string[]>
  >({});
  const [dirty, setDirty] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState<Record<string, boolean>>({});
  const [copiedWebhook, setCopiedWebhook] = useState<string | null>(null);
  const [addedWidgets, setAddedWidgets] = useState<Set<string>>(new Set());

  /* Initialize form from plugin config + defaults */
  const initialValues = useMemo(() => {
    if (!plugin) return {};
    const vals: Record<string, string | number | boolean | string[]> = {};
    for (const field of plugin.configFields) {
      if (plugin.config[field.key] !== undefined) {
        vals[field.key] = plugin.config[field.key];
      } else if (field.defaultValue !== undefined) {
        vals[field.key] = field.defaultValue;
      } else {
        vals[field.key] = field.type === 'boolean' ? false : field.type === 'number' ? 0 : field.type === 'multiselect' ? [] : '';
      }
    }
    return vals;
  }, [plugin]);

  /* Sync initial values into form state when plugin changes */
  const [lastPluginId, setLastPluginId] = useState<string | null>(null);
  if (plugin && plugin.id !== lastPluginId) {
    setLastPluginId(plugin.id);
    setFormValues(initialValues);
    setDirty(false);
  }

  if (!plugin) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Link
          href="/settings/plugins"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plugins
        </Link>
        <div className="text-center py-20">
          <Puzzle className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted-foreground">Plugin not found</p>
        </div>
      </div>
    );
  }

  const pluginId = plugin.id;
  const isEnabled = plugin.status === 'enabled';
  const Icon = getIcon(plugin.icon);

  /* Helpers */
  function setField(key: string, value: string | number | boolean | string[]) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function handleSave() {
    if (!plugin) return;
    updateConfig(plugin.id, formValues);
    setDirty(false);
  }

  function handleToggleStatus() {
    if (!plugin) return;
    if (isEnabled) {
      disablePlugin(plugin.id);
    } else {
      enablePlugin(plugin.id);
    }
  }

  function handleCopyWebhookUrl(webhookId: string) {
    const url = `https://obbu.example.com/api/webhooks/${pluginId}/${webhookId}`;
    navigator.clipboard.writeText(url);
    setCopiedWebhook(webhookId);
    setTimeout(() => setCopiedWebhook(null), 2000);
  }

  function handleAddWidget(widgetId: string) {
    addWidget(pluginId, widgetId);
    setAddedWidgets((prev) => new Set(prev).add(widgetId));
    setTimeout(() => {
      setAddedWidgets((prev) => {
        const next = new Set(prev);
        next.delete(widgetId);
        return next;
      });
    }, 2000);
  }

  /* Group config fields */
  const grouped = plugin.configFields.reduce<Record<string, ConfigField[]>>(
    (acc, field) => {
      const group = field.group || 'General';
      if (!acc[group]) acc[group] = [];
      acc[group].push(field);
      return acc;
    },
    {},
  );

  /* Render a single config field */
  function renderField(field: ConfigField) {
    const value = formValues[field.key] ?? '';

    const labelEl = (
      <label className="block text-sm font-medium text-foreground mb-1">
        {field.label}
        {field.required && <span className="text-danger ml-1">*</span>}
      </label>
    );

    const helperEl = field.description ? (
      <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
    ) : null;

    const inputClasses =
      'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors';

    switch (field.type) {
      case 'text':
      case 'url':
        return (
          <div key={field.key}>
            {labelEl}
            <input
              type={field.type === 'url' ? 'url' : 'text'}
              className={inputClasses}
              placeholder={field.placeholder}
              value={value as string}
              onChange={(e) => setField(field.key, e.target.value)}
            />
            {helperEl}
          </div>
        );
      case 'password': {
        const visible = passwordVisible[field.key] ?? false;
        return (
          <div key={field.key}>
            {labelEl}
            <div className="relative">
              <input
                type={visible ? 'text' : 'password'}
                className={`${inputClasses} pr-10`}
                placeholder={field.placeholder}
                value={value as string}
                onChange={(e) => setField(field.key, e.target.value)}
              />
              <button
                type="button"
                onClick={() =>
                  setPasswordVisible((prev) => ({
                    ...prev,
                    [field.key]: !visible,
                  }))
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {visible ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {helperEl}
          </div>
        );
      }
      case 'number':
        return (
          <div key={field.key}>
            {labelEl}
            <input
              type="number"
              className={inputClasses}
              placeholder={field.placeholder}
              value={value as number}
              onChange={(e) => setField(field.key, Number(e.target.value))}
            />
            {helperEl}
          </div>
        );
      case 'boolean':
        return (
          <div key={field.key} className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-foreground">
                {field.label}
              </span>
              {helperEl}
            </div>
            <ToggleSwitch
              checked={value as boolean}
              onChange={(v) => setField(field.key, v)}
            />
          </div>
        );
      case 'select':
        return (
          <div key={field.key}>
            {labelEl}
            <select
              className={`${inputClasses} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%2371717a%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8`}
              value={value as string}
              onChange={(e) => setField(field.key, e.target.value)}
            >
              <option value="" disabled>
                Select...
              </option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {helperEl}
          </div>
        );
      case 'multiselect':
        return (
          <div key={field.key}>
            {labelEl}
            <div className="space-y-2 mt-1">
              {field.options?.map((opt) => {
                const selected = Array.isArray(value) && value.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        selected
                          ? 'bg-accent border-accent'
                          : 'border-border bg-background'
                      }`}
                      onClick={() => {
                        const arr = Array.isArray(value) ? [...value] : [];
                        if (selected) {
                          setField(
                            field.key,
                            arr.filter((v) => v !== opt.value),
                          );
                        } else {
                          setField(field.key, [...arr, opt.value]);
                        }
                      }}
                    >
                      {selected && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm text-foreground">{opt.label}</span>
                  </label>
                );
              })}
            </div>
            {helperEl}
          </div>
        );
      case 'textarea':
        return (
          <div key={field.key}>
            {labelEl}
            <textarea
              className={`${inputClasses} min-h-[80px] resize-y`}
              placeholder={field.placeholder}
              value={value as string}
              onChange={(e) => setField(field.key, e.target.value)}
            />
            {helperEl}
          </div>
        );
      default:
        return null;
    }
  }

  /* Format long description with simple paragraph splitting */
  function renderLongDescription(text: string) {
    const paragraphs = text.split('\n\n');
    return paragraphs.map((p, i) => {
      /* Bold text */
      const parts = p.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className="text-sm text-muted-foreground leading-relaxed">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={j} className="text-foreground font-medium">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            /* Handle lines starting with - as list items */
            const lines = part.split('\n');
            if (lines.some((l) => l.trimStart().startsWith('- '))) {
              return (
                <span key={j}>
                  {lines.map((line, k) => {
                    const trimmed = line.trimStart();
                    if (trimmed.startsWith('- ')) {
                      return (
                        <span key={k} className="block pl-4">
                          {'  \u2022 '}
                          {trimmed.slice(2)}
                        </span>
                      );
                    }
                    return <span key={k}>{line}</span>;
                  })}
                </span>
              );
            }
            return <span key={j}>{part}</span>;
          })}
        </p>
      );
    });
  }

  const sizeLabels: Record<string, string> = {
    sm: 'Small',
    md: 'Medium',
    lg: 'Large',
    full: 'Full Width',
  };

  return (
    <div className="min-h-screen">
      {/* Header bar */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border-subtle">
        <div className="flex items-center gap-3 h-14 sm:h-16 px-4 sm:px-8">
          <Link
            href="/settings/plugins"
            className="p-2 -ml-2 rounded-lg hover:bg-card-hover transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
              {plugin.name}
            </h1>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in max-w-5xl">
        {/* ─── Hero Section ─────────────────────────────────────── */}
        <section className="bg-card rounded-xl border border-border-subtle p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center">
              <Icon className="w-8 h-8 text-accent-light" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">
                  {plugin.name}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">
                    v{plugin.version}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    by {plugin.author}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor(plugin.category)}`}
                  >
                    {plugin.category}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {plugin.description}
              </p>

              {/* Status toggle */}
              <div className="pt-1">
                <button
                  onClick={handleToggleStatus}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isEnabled
                      ? 'bg-danger-muted text-danger hover:bg-danger/20'
                      : 'bg-success-muted text-success hover:bg-success/20'
                  }`}
                >
                  {isEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </div>

          {/* Long description */}
          {plugin.longDescription && (
            <div className="space-y-2 border-t border-border-subtle pt-4">
              {renderLongDescription(plugin.longDescription)}
            </div>
          )}

          {/* Tags */}
          {plugin.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {plugin.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-card-hover text-muted-foreground border border-border-subtle"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground border-t border-border-subtle pt-4">
            <span className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              {plugin.installCount.toLocaleString()} installs
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Updated {plugin.lastUpdated}
            </span>
          </div>
        </section>

        {/* ─── Configuration Panel ──────────────────────────────── */}
        {isEnabled && plugin.configFields.length > 0 && (
          <section className="bg-card rounded-xl border border-border-subtle p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-semibold text-foreground">
              Configuration
            </h3>

            <div className="space-y-3">
              {Object.entries(grouped).map(([group, fields]) => (
                <CollapsibleGroup key={group} title={group}>
                  {fields.map(renderField)}
                </CollapsibleGroup>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={!dirty}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dirty
                    ? 'bg-accent text-white hover:bg-accent-light'
                    : 'bg-card-hover text-muted cursor-not-allowed'
                }`}
              >
                Save Configuration
              </button>
            </div>
          </section>
        )}

        {/* ─── Webhooks Section ─────────────────────────────────── */}
        {plugin.webhooks && plugin.webhooks.length > 0 && (
          <section className="bg-card rounded-xl border border-border-subtle p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-semibold text-foreground">
              Webhooks
            </h3>

            <div className="space-y-3">
              {plugin.webhooks.map((wh: PluginWebhook) => (
                <div
                  key={wh.id}
                  className="border border-border-subtle rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Webhook className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {wh.name}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          wh.direction === 'inbound'
                            ? 'bg-info-muted text-info'
                            : 'bg-warning-muted text-warning'
                        }`}
                      >
                        {wh.direction}
                      </span>
                    </div>
                    <ToggleSwitch checked={wh.active} onChange={() => {}} />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {wh.events.map((evt) => (
                      <span
                        key={evt}
                        className="text-xs px-2 py-0.5 rounded bg-card-hover text-muted-foreground font-mono"
                      >
                        {evt}
                      </span>
                    ))}
                  </div>

                  {wh.direction === 'inbound' && (
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-background border border-border-subtle rounded px-3 py-1.5 text-muted-foreground truncate font-mono">
                        https://obbu.example.com/api/webhooks/{pluginId}/{wh.id}
                      </code>
                      <button
                        onClick={() => handleCopyWebhookUrl(wh.id)}
                        className="p-1.5 rounded-lg hover:bg-card-hover transition-colors text-muted-foreground hover:text-foreground shrink-0"
                      >
                        {copiedWebhook === wh.id ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Available Widgets Section ────────────────────────── */}
        {plugin.widgets && plugin.widgets.length > 0 && (
          <section className="bg-card rounded-xl border border-border-subtle p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-semibold text-foreground">
              Available Widgets
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {plugin.widgets.map((w: PluginWidget) => (
                <div
                  key={w.id}
                  className="border border-border-subtle rounded-lg p-4 space-y-3 hover:border-border transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-medium text-foreground">
                      {w.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {w.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted px-2 py-0.5 rounded bg-card-hover">
                      {sizeLabels[w.defaultSize] ?? w.defaultSize}
                    </span>
                    <button
                      onClick={() => handleAddWidget(w.id)}
                      className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                        addedWidgets.has(w.id)
                          ? 'bg-success-muted text-success'
                          : 'bg-accent/15 text-accent-light hover:bg-accent/25'
                      }`}
                    >
                      {addedWidgets.has(w.id) ? 'Added!' : 'Add to Dashboard'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
