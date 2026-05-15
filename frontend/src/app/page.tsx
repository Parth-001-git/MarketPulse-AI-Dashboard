import { BitcoinSection } from '@/components/sections/BitcoinSection';
import { StockSection } from '@/components/sections/StockSection';
import { PriceChangeSummary } from '@/components/sections/PriceChangeSummary';
import { IndicatorPanel } from '@/components/sections/IndicatorPanel';
import { AIInsightsSection } from '@/components/sections/AIInsightsSection';
import { CyclicalSignalSection } from '@/components/sections/CyclicalSignalSection';
import { OperationalStatus } from '@/components/sections/OperationalStatus';
import { Activity, Zap, Globe, Sparkles, Moon, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* ── Hero Header ────────────────────────────────────────────── */}
      <section className="mb-10 animate-fade-in">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="section-label">Real-time Data Pipeline</span>
              <span className="rounded bg-accent-blue/10 px-1.5 py-0.5 text-[10px] font-bold text-accent-blue">
                yfinance → FastAPI → Next.js
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              Market Intelligence
              <span className="ml-2 bg-gradient-to-r from-accent-blue to-accent-cyan bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              30-day historical analysis · BTC &amp; Equities · Technical indicators · AI commentary
            </p>
          </div>

          {/* Pipeline badges */}
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-0">
            {[
              { icon: Globe, label: 'yfinance', color: 'text-accent-yellow' },
              { icon: Zap, label: 'FastAPI', color: 'text-accent-green' },
              { icon: Activity, label: 'Next.js 14', color: 'text-accent-blue' },
              { icon: Sparkles, label: 'AI Insights', color: 'text-accent-purple' },
              { icon: Moon, label: 'Cyclical Signals', color: 'text-accent-cyan' },
              { icon: ShieldCheck, label: 'Observability', color: 'text-accent-green' },
            ].map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 rounded-lg border border-surface-3 bg-surface-1 px-3 py-1.5 text-xs font-medium text-text-secondary"
              >
                <Icon className={`h-3.5 w-3.5 ${color}`} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard Grid ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6">
        
        {/* Operational Status Panel */}
        <section className="animate-fade-in">
          <OperationalStatus />
        </section>

        {/* Row 1: Top-level summaries */}
        <section>
          <h2 className="section-label mb-3">Market Overview</h2>
          <div className="dashboard-grid">
            <BitcoinSection />
            <StockSection />
          </div>
        </section>

        {/* Row 2: Summary + Indicators */}
        <section>
          <h2 className="section-label mb-3">Analytics</h2>
          <div className="dashboard-grid">
            <PriceChangeSummary />
            <IndicatorPanel />
          </div>
        </section>

        {/* Row 3: AI Insights */}
        <AIInsightsSection />

        {/* Row 4: Cyclical Signal Analysis (Phase 3) */}
        <section>
          <CyclicalSignalSection />
        </section>

      </div>

      {/* ── Data freshness note ─────────────────────────────────────── */}
      <div className="mt-8 rounded-lg border border-surface-3 bg-surface-1 p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">
            Data sourced from Yahoo Finance via yfinance. Market data may be delayed.
            This dashboard demonstrates real-time data pipeline architecture.
          </p>
          <p className="text-xs font-mono text-text-muted whitespace-nowrap">
            Phase 6 · v6.0.0
          </p>
        </div>
      </div>

    </div>
  );
}
