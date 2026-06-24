import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import {
  FREIGHT_CATEGORIES,
  calculateKPIs,
  calculateSheetTotals,
  calculateTargetMarginAnalysis,
  formatCurrency,
  formatNum
} from '../utils/calculations';
import { Compass, TrendingUp, DollarSign, Percent, BarChart3, PieChart as PieIcon, Layers, FileText } from 'lucide-react';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardTab({ agentData, customerData, currency }) {
  const kpis = calculateKPIs(agentData, customerData);
  const agentTotals = calculateSheetTotals(agentData);
  const customerTotals = calculateSheetTotals(customerData);
  const targetAnalysis = calculateTargetMarginAnalysis(kpis.cost);

  // Extract raw hex tokens computed dynamically by the Tailwind design configuration layer
  const rootStyles = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null;
  const chartTextToken = rootStyles?.getPropertyValue('--color-brand-text-muted').trim() || '#94A3B8';
  const chartGridToken = rootStyles?.getPropertyValue('--color-brand-border').trim() || 'rgba(255, 255, 255, 0.08)';
  const chartCardToken = rootStyles?.getPropertyValue('--color-brand-card').trim() || '#121214';

  // Generate data for tables
  const profitabilityRows = FREIGHT_CATEGORIES.map((cat) => {
    const cost = agentTotals.categoryTotals[cat.id] || 0;
    const revenue = customerTotals.categoryTotals[cat.id] || 0;
    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    return {
      label: cat.label,
      cost,
      revenue,
      profit,
      margin
    };
  });

  const recSellingPrice = kpis.cost / (1 - 0.15);
  
  const isGreen = kpis.marginPercent > 15;
  const isAmber = kpis.marginPercent >= 5 && kpis.marginPercent <= 15;
  const marginTextClass = isGreen ? 'text-brand-green' : isAmber ? 'text-brand-amber' : 'text-brand-red';
  const marginBgClass = isGreen ? 'bg-brand-green/5 border-brand-green/20' : isAmber ? 'bg-brand-amber/5 border-brand-amber/20' : 'bg-brand-red/5 border-brand-red/20';
  const marginIconClass = isGreen ? 'text-brand-green bg-brand-green/10' : isAmber ? 'text-brand-amber bg-brand-amber/10' : 'text-brand-red bg-brand-red/10';

  // ==========================================
  // CHART CONFIGURATIONS (Wired to Theme Variables)
  // ==========================================
  
  const barChart1Data = {
    labels: profitabilityRows.map((r) => r.label),
    datasets: [
      {
        label: 'Cost Baseline',
        data: profitabilityRows.map((r) => r.cost),
        backgroundColor: 'rgba(59, 130, 246, 0.75)',
        borderRadius: 6
      },
      {
        label: 'Gross Revenue',
        data: profitabilityRows.map((r) => r.revenue),
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderRadius: 6
      },
      {
        label: 'Net Yield Pool',
        data: profitabilityRows.map((r) => r.profit),
        backgroundColor: 'rgba(245, 158, 11, 0.75)',
        borderRadius: 6
      }
    ]
  };

  const barChart1Options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: chartTextToken,
          font: { family: 'Plus Jakarta Sans', weight: '600', size: 11 }
        }
      },
      tooltip: {
        backgroundColor: chartCardToken,
        titleColor: chartTextToken,
        bodyColor: chartTextToken,
        titleFont: { family: 'Plus Jakarta Sans', weight: '700' },
        bodyFont: { family: 'Plus Jakarta Sans' },
        borderColor: chartGridToken,
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y, currency);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        grid: { color: chartGridToken },
        ticks: {
          color: chartTextToken,
          font: { family: 'Plus Jakarta Sans', size: 10 },
          callback: (value) => formatCurrency(value, currency)
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          color: chartTextToken,
          font: { family: 'Plus Jakarta Sans', size: 10 }
        }
      }
    }
  };

  const pieChartData = {
    labels: profitabilityRows.map((r) => r.label),
    datasets: [
      {
        data: profitabilityRows.map((r) => r.revenue),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(6, 182, 212, 0.7)'
        ],
        borderWidth: 1,
        borderColor: chartGridToken
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: chartTextToken,
          font: { family: 'Plus Jakarta Sans', weight: '600', size: 11 }
        }
      },
      tooltip: {
        backgroundColor: chartCardToken,
        titleColor: chartTextToken,
        bodyColor: chartTextToken,
        borderColor: chartGridToken,
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
            const percentage = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${formatCurrency(val, currency)} (${percentage}%)`;
          }
        }
      }
    }
  };

  const barChart3Data = {
    labels: profitabilityRows.map((r) => r.label),
    datasets: [
      {
        data: profitabilityRows.map((r) => r.margin),
        backgroundColor: profitabilityRows.map((r) => 
          r.margin > 15 ? 'rgba(16, 185, 129, 0.75)' : r.margin >= 5 ? 'rgba(245, 158, 11, 0.75)' : 'rgba(239, 68, 68, 0.75)'
        ),
        borderRadius: 4
      }
    ]
  };

  const barChart3Options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: chartCardToken,
        titleColor: chartTextToken,
        bodyColor: chartTextToken,
        borderColor: chartGridToken,
        borderWidth: 1,
        callbacks: {
          label: (context) => ` Operational Margin: ${context.parsed.x.toFixed(2)}%`
        }
      }
    },
    scales: {
      x: {
        grid: { color: chartGridToken },
        ticks: {
          color: chartTextToken,
          font: { family: 'Plus Jakarta Sans', size: 10 },
          callback: (value) => `${value}%`
        }
      },
      y: {
        grid: { display: false },
        ticks: {
          color: chartTextToken,
          font: { family: 'Plus Jakarta Sans', size: 10 }
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-slide-up text-brand-text max-w-[1650px] mx-auto p-1">
      
      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5 flex items-center justify-between transition-all glass-panel group hover:border-brand-border-active">
          <div className="flex flex-col space-y-0.5">
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Gross Pipeline Revenue</span>
            <span className="text-2xl font-bold tracking-tight font-heading font-mono">{formatCurrency(kpis.revenue, currency)}</span>
          </div>
          <div className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary">
            <Compass size={18} />
          </div>
        </div>
        
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5 flex items-center justify-between transition-all glass-panel group hover:border-brand-border-active">
          <div className="flex flex-col space-y-0.5">
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Aggregated Base Cost</span>
            <span className="text-2xl font-bold tracking-tight font-heading font-mono">{formatCurrency(kpis.cost, currency)}</span>
          </div>
          <div className="p-3 rounded-xl bg-brand-app border border-brand-border/40 text-brand-text-secondary">
            <DollarSign size={18} />
          </div>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-2xl p-5 flex items-center justify-between transition-all glass-panel group hover:border-brand-border-active">
          <div className="flex flex-col space-y-0.5">
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Net Realized Profit</span>
            <span className="text-2xl font-bold tracking-tight font-heading font-mono">{formatCurrency(kpis.profit, currency)}</span>
          </div>
          <div className="p-3 rounded-xl bg-brand-app border border-brand-border/40 text-brand-text-secondary">
            <DollarSign size={18} />
          </div>
        </div>

        <div className={`bg-brand-card border rounded-2xl p-5 flex items-center justify-between transition-all glass-panel ${marginBgClass}`}>
          <div className="flex flex-col space-y-0.5">
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Global Margin Pool</span>
            <span className={`text-2xl font-bold tracking-tight font-heading font-mono ${marginTextClass}`}>{formatNum(kpis.marginPercent)}%</span>
          </div>
          <div className={`p-3 rounded-xl ${marginIconClass}`}>
            <Percent size={18} />
          </div>
        </div>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Freight-wise Profitability Table */}
        <div className="lg:col-span-7 bg-brand-card border border-brand-border rounded-2xl p-6 glass-panel">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-brand-border pb-3 mb-5 flex items-center gap-2">
            <Layers className="text-brand-accent" size={14} />
            <span>Freight Profitability Array</span>
          </h2>
          <div className="overflow-x-auto border border-brand-border rounded-xl bg-brand-app/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr>
                  <th className="bg-brand-app border-b border-brand-border px-4 py-3 text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Freight Module</th>
                  <th className="bg-brand-app border-b border-brand-border px-4 py-3 text-[10px] font-bold text-brand-text-muted uppercase tracking-wider text-right">Cost</th>
                  <th className="bg-brand-app border-b border-brand-border px-4 py-3 text-[10px] font-bold text-brand-text-muted uppercase tracking-wider text-right">Revenue</th>
                  <th className="bg-brand-app border-b border-brand-border px-4 py-3 text-[10px] font-bold text-brand-text-muted uppercase tracking-wider text-right">Profit</th>
                  <th className="bg-brand-app border-b border-brand-border px-4 py-3 text-[10px] font-bold text-brand-text-muted uppercase tracking-wider text-right w-28">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 font-mono">
                {profitabilityRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-brand-app/20 transition-colors">
                    <td className="px-4 py-3 text-brand-text font-heading font-medium">{row.label}</td>
                    <td className="px-4 py-3 text-right text-brand-text-secondary">{formatCurrency(row.cost, currency)}</td>
                    <td className="px-4 py-3 text-right text-brand-text-secondary">{formatCurrency(row.revenue, currency)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${row.profit >= 0 ? 'text-brand-text-secondary' : 'text-brand-red font-semibold'}`}>
                      {formatCurrency(row.profit, currency)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase border ${
                        row.margin > 15 
                          ? 'bg-brand-green/10 text-brand-green border-brand-green/20' 
                          : row.margin >= 5 
                            ? 'bg-brand-amber/10 text-brand-amber border-brand-amber/20' 
                            : 'bg-brand-red/10 text-brand-red border-brand-red/20'
                      }`}>
                        {formatNum(row.margin)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Target Breakdown & Management Metrics */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6 glass-panel">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-brand-border pb-3 mb-5 flex items-center gap-2">
              <TrendingUp className="text-brand-accent" size={14} />
              <span>Target Quota Realignment</span>
            </h2>
            <div className="overflow-x-auto border border-brand-border rounded-xl bg-brand-app/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="bg-brand-app border-b border-brand-border px-4 py-3 text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Target</th>
                    <th className="bg-brand-app border-b border-brand-border px-4 py-3 text-[10px] font-bold text-brand-text-muted uppercase tracking-wider text-right">Revenue Yield</th>
                    <th className="bg-brand-app border-b border-brand-border px-4 py-3 text-[10px] font-bold text-brand-text-muted uppercase tracking-wider text-right">Profit Yield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40 font-mono">
                  {targetAnalysis.map((target, idx) => (
                    <tr key={idx} className="hover:bg-brand-app/20 transition-colors">
                      <td className="px-4 py-3 font-bold font-heading text-brand-primary">{target.percentage}%</td>
                      <td className="px-4 py-3 text-right text-brand-text font-medium">{formatCurrency(target.revenueRequired, currency)}</td>
                      <td className="px-4 py-3 text-right text-brand-text-secondary">{formatCurrency(target.profitRequired, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-2xl p-6 glass-panel">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-brand-border pb-3 mb-5 flex items-center gap-2">
              <FileText className="text-brand-accent" size={14} />
              <span>Administrative Summary</span>
            </h2>
            <div className="overflow-x-auto border border-brand-border rounded-xl bg-brand-app/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="bg-brand-app border-b border-brand-border px-4 py-3 text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Metrics Parameter</th>
                    <th className="bg-brand-app border-b border-brand-border px-4 py-3 text-[10px] font-bold text-brand-text-muted uppercase tracking-wider text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40">
                  <tr className="font-mono">
                    <td className="px-4 py-3 text-brand-text-secondary font-sans">Total Baseline Expenditures</td>
                    <td className="px-4 py-3 text-right text-brand-text font-semibold">{formatCurrency(kpis.cost, currency)}</td>
                  </tr>
                  <tr className="font-mono">
                    <td className="px-4 py-3 text-brand-text-secondary font-sans">Aggregated Inbound Value</td>
                    <td className="px-4 py-3 text-right text-brand-text font-semibold">{formatCurrency(kpis.revenue, currency)}</td>
                  </tr>
                  <tr className="font-mono">
                    <td className="px-4 py-3 text-brand-text-secondary font-sans">Gross Retained Margin</td>
                    <td className={`px-4 py-3 text-right font-bold ${kpis.profit >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                      {formatCurrency(kpis.profit, currency)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-brand-text-secondary">Summary Margin Class</td>
                    <td className="px-4 py-2 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase border ${
                        kpis.marginPercent > 15 
                          ? 'bg-brand-green/10 text-brand-green border-brand-green/20' 
                          : kpis.marginPercent >= 5 
                            ? 'bg-brand-amber/10 text-brand-amber border-brand-amber/20' 
                            : 'bg-brand-red/10 text-brand-red border-brand-red/20'
                      }`}>
                        {formatNum(kpis.marginPercent)}%
                      </span>
                    </td>
                  </tr>
                  <tr className="font-mono">
                    <td className="px-4 py-3 text-brand-text font-medium font-sans">Recommended Execution Price (15% Target)</td>
                    <td className="px-4 py-3 text-right text-brand-accent font-bold">
                      {formatCurrency(recSellingPrice, currency)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-brand-text-secondary">System Quota Status</td>
                    <td className="px-4 py-3 text-right text-xs font-semibold">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] tracking-wide font-heading font-bold uppercase ${
                        kpis.marginPercent > 15 
                          ? 'bg-brand-green/10 text-brand-green' 
                          : kpis.marginPercent >= 5 
                            ? 'bg-brand-amber/10 text-brand-amber' 
                            : 'bg-brand-red/10 text-brand-red'
                      }`}>
                        {kpis.marginPercent > 15 ? 'Quota Secured' : kpis.marginPercent >= 5 ? 'Acceptable' : 'Deficit Alert'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid Layout Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-brand-card border border-brand-border rounded-2xl p-6 glass-panel">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-brand-border pb-3 mb-5 flex items-center gap-2">
            <BarChart3 className="text-brand-accent" size={14} />
            <span>Yield Accumulation Matrix</span>
          </h2>
          <div className="relative h-64 w-full pt-2">
            <Bar data={barChart1Data} options={barChart1Options} />
          </div>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-2xl p-6 glass-panel">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-brand-border pb-3 mb-5 flex items-center gap-2">
            <PieIcon className="text-brand-accent" size={14} />
            <span>Inbound Share Dispersion</span>
          </h2>
          <div className="relative h-64 w-full pt-2">
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-2xl p-6 glass-panel">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-brand-border pb-3 mb-5 flex items-center gap-2">
            <BarChart3 className="text-brand-accent" size={14} />
            <span>Incremental Margin Spread</span>
          </h2>
          <div className="relative h-64 w-full pt-2">
            <Bar data={barChart3Data} options={barChart3Options} />
          </div>
        </div>
      </div>
    </div>
  );
}