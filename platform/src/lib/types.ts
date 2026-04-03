export type ServiceStatus = 'healthy' | 'degraded' | 'critical' | 'unknown';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type CorrelationLayer = 'direct' | 'deterministic' | 'statistical';
export type IncidentStatus = 'active' | 'investigating' | 'resolved' | 'suppressed';

export interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  description: string;
  team: string;
  tier: 'T1' | 'T2' | 'T3';
  businessOwner: string;
  slaTarget: number;
  slaCurrent: number;
  errorRate: number;
  latencyP50: number;
  latencyP99: number;
  throughput: number;
  dependencies: string[];
  clients: string[];
  revenueImpact: number;
  activeIncidents: number;
  sparklineData: number[];
}

export interface Incident {
  id: string;
  title: string;
  status: IncidentStatus;
  severity: Severity;
  startedAt: string;
  resolvedAt?: string;
  affectedServices: string[];
  businessImpact: string;
  revenueAtRisk: number;
  clientsAffected: number;
  correlationLayer: CorrelationLayer;
  confidenceScore: number;
  rootCause?: string;
  timeline: IncidentEvent[];
  rcaHypotheses: RCAHypothesis[];
}

export interface IncidentEvent {
  timestamp: string;
  type: 'alert' | 'correlation' | 'hypothesis' | 'action' | 'resolved';
  description: string;
  source: string;
  layer?: CorrelationLayer;
}

export interface RCAHypothesis {
  id: string;
  description: string;
  confidence: number;
  layer: CorrelationLayer;
  evidence: string[];
  status: 'confirmed' | 'investigating' | 'rejected';
}

export interface BusinessCapability {
  id: string;
  name: string;
  description: string;
  owner: string;
  services: string[];
  kpis: KPI[];
  clientRequirements: ClientRequirement[];
  status: ServiceStatus;
  revenueContribution: number;
}

export interface KPI {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  sparkline: number[];
}

export interface ClientRequirement {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  slaTarget: number;
  slaCurrent: number;
  status: 'met' | 'at-risk' | 'breached';
  linkedServices: string[];
}

export interface DependencyNode {
  id: string;
  name: string;
  type: 'service' | 'database' | 'queue' | 'external' | 'gateway';
  status: ServiceStatus;
  x: number;
  y: number;
  tier: 'T1' | 'T2' | 'T3';
}

export interface DependencyEdge {
  source: string;
  target: string;
  latency: number;
  errorRate: number;
  throughput: number;
  status: ServiceStatus;
}

export interface TelemetrySource {
  name: string;
  type: 'monitoring' | 'grafana' | 'appliance' | 'ems';
  hostnameField: string;
  serviceField: string;
  environmentField: string;
  status: 'connected' | 'degraded' | 'disconnected';
  eventsPerSecond: number;
}
