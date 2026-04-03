'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Server,
  GitBranch,
  Briefcase,
  AlertTriangle,
  Activity,
  Radio,
  X,
  Puzzle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSidebar } from './SidebarContext';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Services', href: '/services', icon: Server },
  { name: 'Dependencies', href: '/dependencies', icon: GitBranch },
  { name: 'Business', href: '/business', icon: Briefcase },
  { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
  { name: 'Plugins', href: '/settings/plugins', icon: Puzzle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border-subtle flex flex-col z-50 transition-transform duration-200 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-accent-light" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-foreground">Obbu</h1>
              <p className="text-[10px] text-muted uppercase tracking-widest">Observability</p>
            </div>
          </div>
          <button
            onClick={close}
            className="p-1.5 rounded-lg hover:bg-card-hover text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={close}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                  isActive
                    ? 'bg-accent/10 text-accent-light font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card-hover'
                )}
              >
                <item.icon className={clsx('w-4 h-4', isActive ? 'text-accent-light' : 'text-muted')} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Telemetry status */}
        <div className="px-4 py-4 border-t border-border-subtle">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-3.5 h-3.5 text-success animate-pulse-dot" />
            <span className="text-xs text-muted-foreground">Telemetry Active</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-background rounded-md px-2.5 py-2">
              <div className="text-[10px] text-muted uppercase tracking-wider">Events/s</div>
              <div className="text-sm font-mono font-medium text-foreground">71.8K</div>
            </div>
            <div className="bg-background rounded-md px-2.5 py-2">
              <div className="text-[10px] text-muted uppercase tracking-wider">Sources</div>
              <div className="text-sm font-mono font-medium text-foreground">4</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
