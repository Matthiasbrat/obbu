'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { useSidebar } from './SidebarContext';

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggle}
            className="p-2 -ml-2 rounded-lg hover:bg-card-hover transition-colors text-muted-foreground hover:text-foreground lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">{title}</h1>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2">
            {children}
          </div>
          <button className="p-2 rounded-lg hover:bg-card-hover transition-colors text-muted-foreground hover:text-foreground">
            <Search className="w-4 h-4" />
          </button>
          <button className="relative p-2 rounded-lg hover:bg-card-hover transition-colors text-muted-foreground hover:text-foreground">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
