'use client';

import { Bell, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="flex items-center justify-between h-16 px-8">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {children}
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
