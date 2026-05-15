'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-3 ${className}`}
    />
  );
}

export function ChartSkeleton() {
  return (
    <div className="flex h-64 w-full animate-pulse flex-col gap-3 p-4">
      <div className="flex items-end gap-1 h-full">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-surface-3"
            style={{ height: `${20 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 p-5 animate-pulse">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-surface-3" />
          <div>
            <div className="h-3.5 w-24 rounded-md bg-surface-3" />
            <div className="mt-1.5 h-3 w-16 rounded-md bg-surface-3" />
          </div>
        </div>
        <div className="h-5 w-12 rounded-full bg-surface-3" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="h-2.5 w-16 rounded bg-surface-3" />
            <div className="h-6 w-24 rounded bg-surface-3" />
          </div>
        ))}
      </div>
      <ChartSkeleton />
    </div>
  );
}
