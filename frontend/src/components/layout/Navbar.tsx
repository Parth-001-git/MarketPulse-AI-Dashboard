'use client';

import React from 'react';
import { Activity, LayoutDashboard, Github } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-surface-3 bg-surface-0/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-blue to-accent-cyan">
            <Activity className="h-4 w-4 text-white" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent-green">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-green opacity-75" />
            </span>
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-text-primary">
              Market Intelligence
            </span>
            <span className="ml-1.5 rounded-sm bg-accent-blue/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent-blue">
              PHASE 1
            </span>
          </div>
        </div>

        {/* Center nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {[
            { label: 'Dashboard', icon: LayoutDashboard },
          ].map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-accent-green/20 bg-accent-green/5 px-2.5 py-1 text-xs text-accent-green">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-green animate-pulse" />
            Markets Open
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-3 bg-surface-2 text-text-muted transition-colors hover:border-surface-4 hover:text-text-primary"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
