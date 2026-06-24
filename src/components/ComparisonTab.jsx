import React, { useMemo } from 'react';
import {
  FREIGHT_CATEGORIES,
  calculateRowTotal,
  calculateKPIs,
  calculateTargetMarginAnalysis,
  getPricingRecommendation,
  formatCurrency,
  formatNum
} from '../utils/calculations';
import { Compass, ShieldAlert, Sparkles, CornerDownRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ComparisonTab({ agentData, customerData, currency }) {
  // Memoize KPIs and recommendations to prevent redundant calculations on re-renders
  const kpis = useMemo(() => calculateKPIs(agentData, customerData), [agentData, customerData]);
  const targetAnalysis = useMemo(() => calculateTargetMarginAnalysis(kpis.cost), [kpis.cost]);
  const recommendation = useMemo(() => getPricingRecommendation(kpis.marginPercent), [kpis.marginPercent]);

  const isLow = recommendation.status.includes('Low');
  const isAcceptable = recommendation.status.includes('Acceptable');

  // Unified contextual color system mapped directly to semantic custom property tokens
  const statusConfig = {
    bg: isLow 
      ? 'bg-brand-red/5 border-brand-red/20' 
      : isAcceptable 
        ? 'bg-brand-amber/5 border-brand-amber/20' 
        : 'bg-brand-green/5 border-brand-green/20',
    text: isLow 
      ? 'text-brand-red' 
      : isAcceptable 
        ? 'text-brand-amber' 
        : 'text-brand-green',
    pill: isLow 
      ? 'bg-brand-red/10 text-brand-red' 
      : isAcceptable 
        ? 'bg-brand-amber/10 text-brand-amber' 
        : 'bg-brand-green/10 text-brand-green'
  };

  // Memoize data matrix formatting
  const comparisonRows = useMemo(() => {
    return FREIGHT_CATEGORIES.map((cat) => {
      const agentRow = agentData[cat.id] || { exw: 0, freight: 0, fob: 0 };
      const custRow = customerData[cat.id] || { exw: 0, freight: 0, fob: 0 };

      const agentTotal = calculateRowTotal(agentRow);
      const custTotal = calculateRowTotal(custRow);
      const profit = custTotal - agentTotal;
      const margin = custTotal > 0 ? (profit / custTotal) * 100 : 0;

      return {
        label: cat.label,
        agentTotal,
        custTotal,
        profit,
        margin,
        breakdown: { agentRow, custRow }
      };
    });
  }, [agentData, customerData]);

  return (
    <div className="space-y-6 max-w-[1650px] mx-auto p-1 text-brand-text animate-fade-slide-up">

      {/* 1. HERO PRICING INSIGHT BANNER */}
      <div className={`p-6 border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel ${statusConfig.bg}`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl font-heading font-bold text-base tracking-tight shadow-sm ${statusConfig.pill}`}>
            {recommendation.status.split(' ')[0]}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className={statusConfig.text} size={14} />
              <span className={`text-[10px] font-bold uppercase tracking-widest font-heading ${statusConfig.text}`}>
                Strategy Direction — {recommendation.status.replace(/^[^\s]+\s/, '')}
              </span>
            </div>
            <p className="text-sm font-medium text-brand-text-secondary leading-relaxed max-w-4xl">
              {recommendation.description}
            </p>
          </div>
        </div>
      </div>

      {/* 2. ASYMMETRICAL COMPARISON MATRIX SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Comprehensive Marginal Analysis */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div className="flex items-center gap-2">
              <Compass className="text-brand-text-muted" size={16} />
              <h3 className="font-heading font-semibold text-sm">Marginal Pipeline Grid</h3>
            </div>
            <span className="text-[11px] text-brand-text-muted font-medium">Stream Realignment Metrics</span>
          </div>

          <div className="space-y-4">
            {comparisonRows.map((row, idx) => {
              const isProfitPositive = row.profit >= 0;
              return (
                <div
                  key={idx}
                  className="bg-brand-card border border-brand-border rounded-2xl p-5 shadow-sm hover:border-brand-border-active transition-all glass-panel group space-y-4"
                >
                  {/* Category Title & Summary KPIs */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border pb-3">
                    <span className="font-heading font-bold text-sm tracking-tight">{row.label}</span>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <span className="block text-[9px] text-brand-text-muted uppercase font-bold tracking-wider">Net Yield</span>
                        <span className={`font-heading font-bold text-sm ${isProfitPositive ? 'text-brand-green' : 'text-brand-red'}`}>
                          {formatCurrency(row.profit, currency)}
                        </span>
                      </div>
                      <div className="h-6 w-px bg-brand-border" />
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-heading tracking-wide ${
                        row.margin > 15
                          ? 'bg-brand-green/10 text-brand-green'
                          : row.margin >= 5
                            ? 'bg-brand-amber/10 text-brand-amber'
                            : 'bg-brand-red/10 text-brand-red'
                      }`}>
                        {formatNum(row.margin)}% Margin
                      </span>
                    </div>
                  </div>

                  {/* Operational Metrics Sub-grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    {/* Agent Costing Section */}
                    <div className="bg-brand-app/40 border border-brand-border/40 rounded-xl p-4 space-y-2">
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-brand-text-muted">Agent Baseline Cost</span>
                      <div className="space-y-1.5 text-brand-text-secondary font-medium font-mono">
                        <div className="flex justify-between"><span>EXW:</span> <span className="text-brand-text">{formatCurrency(row.breakdown.agentRow.exw, currency)}</span></div>
                        <div className="flex justify-between"><span>Freight:</span> <span className="text-brand-text">{formatCurrency(row.breakdown.agentRow.freight, currency)}</span></div>
                        <div className="flex justify-between border-t border-brand-border pt-1.5 mt-1.5 font-bold font-heading text-brand-text">
                          <span>Total Accumulation:</span> <span>{formatCurrency(row.agentTotal, currency)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Pricing Section */}
                    <div className="bg-brand-app/40 border border-brand-border/40 rounded-xl p-4 space-y-2">
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-brand-text-muted">Customer Outbound Charge</span>
                      <div className="space-y-1.5 text-brand-text-secondary font-medium font-mono">
                        <div className="flex justify-between"><span>EXW:</span> <span className="text-brand-text">{formatCurrency(row.breakdown.custRow.exw, currency)}</span></div>
                        <div className="flex justify-between"><span>Freight:</span> <span className="text-brand-text">{formatCurrency(row.breakdown.custRow.freight, currency)}</span></div>
                        <div className="flex justify-between border-t border-brand-border pt-1.5 mt-1.5 font-bold font-heading text-brand-text">
                          <span>Total Inbound Billing:</span> <span>{formatCurrency(row.custTotal, currency)}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Milestone Analytics Rails */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <ShieldAlert className="text-brand-text-muted" size={16} />
            <h3 className="font-heading font-semibold text-sm">Milestone Analytics</h3>
          </div>

          <div className="space-y-4">
            {targetAnalysis.map((target, idx) => {
              const diff = kpis.revenue - target.revenueRequired;
              const isMet = diff >= 0;
              
              // Zero-division fix: check that revenueRequired exists and is greater than 0
              const totalRequired = target.revenueRequired || 0;
              const achievementPercent = totalRequired > 0 
                ? Math.min(Math.max((kpis.revenue / totalRequired) * 100, 0), 100)
                : 0;

              return (
                <div
                  key={idx}
                  className="bg-brand-card border border-brand-border rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 glass-panel"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold font-heading text-brand-text">{target.percentage}% Strategy Quota</h4>
                      <p className="text-[11px] font-mono text-brand-text-muted">Target: {formatCurrency(target.revenueRequired, currency)}</p>
                    </div>
                    {isMet ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold font-heading tracking-wide text-brand-green bg-brand-green/10 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 size={11} /> Secured
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold font-heading tracking-wide text-brand-red bg-brand-red/10 px-2.5 py-0.5 rounded-full">
                        <AlertCircle size={11} /> Gap Deficit
                      </span>
                    )}
                  </div>

                  {/* Inline visual tracking indicator */}
                  <div className="w-full space-y-1.5">
                    <div className="w-full bg-brand-app h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isMet ? 'bg-brand-primary' : 'bg-brand-accent'}`}
                        style={{ width: `${achievementPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-medium font-mono text-brand-text-muted">
                      <span>Current Pool: {formatCurrency(kpis.revenue, currency)}</span>
                      <span className={`font-bold ${isMet ? 'text-brand-green' : 'text-brand-red'}`}>
                        {isMet ? '+' : ''}{formatCurrency(diff, currency)}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl border border-brand-border/60 bg-brand-app/30 flex items-start gap-2.5">
            <CornerDownRight size={14} className="text-brand-text-muted mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed text-brand-text-muted">
              Adjust markup layers directly on structural execution entries or initiate downstream negotiations with third-party networks to realign unmet milestone quotas.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}