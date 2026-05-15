'use client';

import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'blue' | 'green' | 'red' | 'none';
  animate?: boolean;
}

export function Card({ children, className, glowColor = 'none', animate = true }: CardProps) {
  const glowMap = {
    blue: 'hover:shadow-glow-blue hover:border-accent-blue/20',
    green: 'hover:shadow-glow-green hover:border-accent-green/20',
    red: 'hover:shadow-glow-red hover:border-accent-red/20',
    none: '',
  };

  return (
    <div
      className={clsx(
        'rounded-xl border border-surface-3 bg-surface-1 p-5',
        'transition-all duration-300',
        glowMap[glowColor],
        animate && 'animate-slide-up',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
}

export function CardHeader({ title, subtitle, badge, icon }: CardHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between">
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
        </div>
      </div>
      {badge && <div>{badge}</div>}
    </div>
  );
}
