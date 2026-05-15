'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Failed to load data', onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border border-accent-red/20 bg-accent-red/5 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-red/10">
        <AlertCircle className="h-6 w-6 text-accent-red" />
      </div>
      <div>
        <p className="text-sm font-semibold text-text-primary">Data Unavailable</p>
        <p className="mt-1 text-xs text-text-secondary">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-lg border border-surface-3 bg-surface-2 px-4 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-accent-blue/30 hover:text-text-primary"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
