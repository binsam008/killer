import React from 'react';
import { Ship, FileSpreadsheet, RotateCcw, Printer } from 'lucide-react';

export default function Header({ quotationRef, onExport, onReset, onPrint }) {
  return (
    <header className="glass-panel bg-brand-card border border-brand-border rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-brand-primary text-white shrink-0 shadow-sm">
            <Ship size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black font-heading tracking-tight text-brand-text uppercase">
              Well Reach Logistics
            </h1>
            <p className="text-[11px] sm:text-xs text-brand-text-muted font-medium mt-0.5">
              Quotation &amp; Profitability Dashboard
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {quotationRef && (
            <div className="text-[10px] font-bold tracking-wider text-brand-text-muted uppercase">
              Ref
              <span className="ml-2 font-mono text-xs text-brand-text bg-brand-input border border-brand-border px-2.5 py-1 rounded-lg">
                {quotationRef}
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-brand-accent text-white hover:bg-brand-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
            >
              <FileSpreadsheet size={14} />
              Export Excel
            </button>
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border border-brand-border bg-brand-card hover:bg-brand-card-hover text-brand-text transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            >
              <Printer size={14} />
              Print
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border border-brand-red/20 bg-brand-red/5 hover:bg-brand-red/10 text-brand-red transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red/20"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
