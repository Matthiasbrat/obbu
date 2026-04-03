import { Header } from '@/components/layout/Header';
import { OverviewStats } from '@/components/dashboard/OverviewStats';
import { ServiceHealthGrid } from '@/components/dashboard/ServiceHealthGrid';
import { ActiveIncidentBanner } from '@/components/dashboard/ActiveIncidentBanner';
import { CorrelationLayersViz } from '@/components/dashboard/CorrelationLayersViz';
import { BusinessImpactSummary } from '@/components/dashboard/BusinessImpactSummary';
import { TelemetrySourcesPanel } from '@/components/dashboard/TelemetrySourcesPanel';
import { RecentIncidentsFeed } from '@/components/dashboard/RecentIncidentsFeed';

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Header
        title="Overview"
        description="Business-to-technical observability at a glance"
      />
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 animate-fade-in">
        {/* Active incident banner */}
        <ActiveIncidentBanner />

        {/* Key metrics */}
        <OverviewStats />

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Service health - 8 cols */}
          <div className="col-span-1 lg:col-span-8">
            <ServiceHealthGrid />
          </div>

          {/* Right sidebar - 4 cols */}
          <div className="col-span-1 lg:col-span-4 space-y-6">
            <CorrelationLayersViz />
            <TelemetrySourcesPanel />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="col-span-1 lg:col-span-8">
            <BusinessImpactSummary />
          </div>
          <div className="col-span-1 lg:col-span-4">
            <RecentIncidentsFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
