'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Plugin, WidgetInstance, PluginState } from './types';
import { defaultPlugins } from './registry';

const PluginContext = createContext<PluginState | null>(null);

export function PluginProvider({ children }: { children: ReactNode }) {
  const [plugins, setPlugins] = useState<Plugin[]>(defaultPlugins);
  const [widgetInstances, setWidgetInstances] = useState<WidgetInstance[]>([
    { id: 'wi-1', pluginId: 'github', widgetId: 'gh-actions', size: 'md', position: 0 },
    { id: 'wi-2', pluginId: 'prometheus', widgetId: 'prom-targets', size: 'sm', position: 1 },
  ]);

  const enablePlugin = useCallback((id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'enabled' as const } : p))
    );
  }, []);

  const disablePlugin = useCallback((id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'disabled' as const } : p))
    );
    setWidgetInstances((prev) => prev.filter((w) => w.pluginId !== id));
  }, []);

  const updateConfig = useCallback(
    (id: string, config: Record<string, string | number | boolean | string[]>) => {
      setPlugins((prev) =>
        prev.map((p) => (p.id === id ? { ...p, config: { ...p.config, ...config } } : p))
      );
    },
    []
  );

  const addWidget = useCallback((pluginId: string, widgetId: string) => {
    setWidgetInstances((prev) => [
      ...prev,
      {
        id: `wi-${Date.now()}`,
        pluginId,
        widgetId,
        size: 'md',
        position: prev.length,
      },
    ]);
  }, []);

  const removeWidget = useCallback((instanceId: string) => {
    setWidgetInstances((prev) => prev.filter((w) => w.id !== instanceId));
  }, []);

  const reorderWidgets = useCallback((instances: WidgetInstance[]) => {
    setWidgetInstances(instances);
  }, []);

  return (
    <PluginContext.Provider
      value={{ plugins, widgetInstances, enablePlugin, disablePlugin, updateConfig, addWidget, removeWidget, reorderWidgets }}
    >
      {children}
    </PluginContext.Provider>
  );
}

export function usePlugins() {
  const ctx = useContext(PluginContext);
  if (!ctx) throw new Error('usePlugins must be used within a PluginProvider');
  return ctx;
}
