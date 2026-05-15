'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Server, Clock, Database, CheckCircle2, AlertCircle, Cloud } from 'lucide-react';
import { fetchHealth, type HealthResponse } from '@/lib/api';
import { clsx } from 'clsx';

export function OperationalStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [latency, setLatency] = useState<number>(0);
  const [status, setStatus] = useState<'healthy' | 'degraded' | 'offline'>('offline');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      const start = performance.now();
      try {
        const data = await fetchHealth();
        const end = performance.now();
        setHealth(data);
        setLatency(Math.round(end - start));
        setStatus(data.status === 'operational' ? 'healthy' : 'degraded');
      } catch (err) {
        setStatus('offline');
      }
      setLastCheck(new Date());
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-surface-3 bg-surface-1 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2">
          <Server className="h-5 w-5 text-text-secondary" />
          <div
            className={clsx(
              'absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-surface-1',
              status === 'healthy' ? 'bg-accent-green' : status === 'degraded' ? 'bg-accent-yellow' : 'bg-accent-red'
            )}
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">System Status</h3>
          <p className="text-xs text-text-muted">
            {status === 'healthy' ? 'All systems operational' : status === 'degraded' ? 'Degraded performance' : 'Backend offline'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-text-muted flex items-center gap-1">
            <Activity className="h-3 w-3" /> API Latency
          </span>
          <span className="font-mono text-sm font-medium text-text-primary">
            {status === 'offline' ? '--' : `${latency}ms`}
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-text-muted flex items-center gap-1">
            <Database className="h-3 w-3" /> Ingestion
          </span>
          <span className="flex items-center gap-1 font-mono text-sm font-medium text-text-primary">
            {status === 'offline' ? (
               <AlertCircle className="h-3.5 w-3.5 text-accent-red" />
            ) : (
               <CheckCircle2 className="h-3.5 w-3.5 text-accent-green" />
            )}
            {status === 'offline' ? 'Failing' : 'Active'}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-text-muted flex items-center gap-1">
            <Clock className="h-3 w-3" /> Last Sync
          </span>
          <span className="font-mono text-sm font-medium text-text-primary">
            {lastCheck ? lastCheck.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-text-muted flex items-center gap-1">
            <Cloud className="h-3 w-3" /> Deployment
          </span>
          <span className="flex items-center gap-1.5 font-mono text-sm font-medium text-accent-cyan">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan"></span>
             </span>
             Live
          </span>
        </div>
      </div>
    </div>
  );
}
