export type PluginCategory = 'integration' | 'widget' | 'automation' | 'data-source';
export type PluginStatus = 'enabled' | 'disabled' | 'error' | 'configuring';
export type ConfigFieldType = 'text' | 'password' | 'url' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea';

export interface ConfigField {
  key: string;
  label: string;
  type: ConfigFieldType;
  description?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number | boolean | string[];
  options?: { label: string; value: string }[];
  group?: string;
}

export interface PluginEndpoint {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
}

export interface PluginWebhook {
  id: string;
  name: string;
  direction: 'inbound' | 'outbound';
  url?: string;
  events: string[];
  active: boolean;
}

export interface PluginWidget {
  id: string;
  name: string;
  description: string;
  defaultSize: 'sm' | 'md' | 'lg' | 'full';
  minSize?: 'sm' | 'md';
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: PluginCategory;
  icon: string; // lucide icon name
  version: string;
  author: string;
  status: PluginStatus;
  tags: string[];
  configFields: ConfigField[];
  config: Record<string, string | number | boolean | string[]>;
  endpoints?: PluginEndpoint[];
  webhooks?: PluginWebhook[];
  widgets?: PluginWidget[];
  documentation?: string;
  repository?: string;
  lastUpdated: string;
  installCount: number;
  featured?: boolean;
}

export interface WidgetInstance {
  id: string;
  pluginId: string;
  widgetId: string;
  size: 'sm' | 'md' | 'lg' | 'full';
  position: number;
  config?: Record<string, string | number | boolean>;
}

export interface PluginState {
  plugins: Plugin[];
  widgetInstances: WidgetInstance[];
  enablePlugin: (id: string) => void;
  disablePlugin: (id: string) => void;
  updateConfig: (id: string, config: Record<string, string | number | boolean | string[]>) => void;
  addWidget: (pluginId: string, widgetId: string) => void;
  removeWidget: (instanceId: string) => void;
  reorderWidgets: (instances: WidgetInstance[]) => void;
}
