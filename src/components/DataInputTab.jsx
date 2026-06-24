import React from 'react';
import { FREIGHT_CATEGORIES, calculateRowTotal, calculateSheetTotals, formatCurrency } from '../utils/calculations';
import { Briefcase, MapPin, ArrowUpRight, ArrowDownLeft, ShieldCheck, CheckCircle, UserCheck } from 'lucide-react';

export default function DataInputTab({
  quotationInfo,
  setQuotationInfo,
  shipmentInfo,
  setShipmentInfo,
  agentData,
  setAgentData,
  customerData,
  setCustomerData
}) {
  // Input handlers
  const handleQuotationChange = (field, val) => {
    setQuotationInfo((prev) => {
      const updated = { ...prev, [field]: val };
      if (field === 'date') {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          d.setDate(d.getDate() + 30);
          updated.validUntil = d.toISOString().split('T')[0];
        }
      }
      return updated;
    });
  };

  const handleShipmentChange = (field, val) => {
    setShipmentInfo((prev) => ({ ...prev, [field]: val }));
  };

  const handleCellChange = (sheet, catId, field, value) => {
    const numericVal = value === '' ? '' : Math.max(0, Number(value));
    const setter = sheet === 'agent' ? setAgentData : setCustomerData;
    setter((prev) => ({
      ...prev,
      [catId]: {
        ...(prev[catId] || { exw: 0, freight: 0, fob: 0, other: 0 }),
        [field]: numericVal
      }
    }));
  };

  const agentTotals = calculateSheetTotals(agentData);
  const customerTotals = calculateSheetTotals(customerData);

  return (
    <div className="space-y-8 animate-fade-slide-up p-1 text-zinc-900 dark:text-zinc-100">
      
      {/* -------------------- SECTION A & B: FORM BOARD LAYOUT -------------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left: Section A - Quotation Profile Form Card */}
        <div className="xl:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="p-2 bg-brand-accent/10 text-brand-accent rounded-xl">
                <Briefcase size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase block">Form Profile</span>
                <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Quotation Context</h2>
              </div>
            </div>

            <div className="space-y-4">
              {/* Form Group: Ref Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">Quotation Ref No</label>
                <input
                  type="text"
                  className="w-full text-xs font-mono font-bold px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-500 cursor-not-allowed select-none focus:outline-none"
                  value={quotationInfo.refNo}
                  disabled
                />
              </div>

              {/* Form Group: Sales Architect */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">Sales Architect</label>
                <input
                  type="text"
                  className="w-full text-xs font-semibold px-3 py-2.5 border border-zinc-200 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/5 transition-all shadow-sm"
                  value={quotationInfo.salesPerson}
                  onChange={(e) => handleQuotationChange('salesPerson', e.target.value)}
                  placeholder="Owner's Name"
                />
              </div>

              {/* Form Row: Date Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Creation</label>
                  <input
                    type="date"
                    className="w-full text-[11px] font-medium px-2.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-accent transition-all shadow-sm"
                    value={quotationInfo.date}
                    onChange={(e) => handleQuotationChange('date', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Quoted</label>
                  <input
                    type="date"
                    className="w-full text-[11px] font-medium px-2.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-accent transition-all shadow-sm"
                    value={quotationInfo.dateQuoted}
                    onChange={(e) => handleQuotationChange('dateQuoted', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Expiry</label>
                  <input
                    type="date"
                    className="w-full text-[11px] font-medium px-2.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-accent transition-all shadow-sm"
                    value={quotationInfo.validUntil}
                    onChange={(e) => handleQuotationChange('validUntil', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Group: Operational Currency */}
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Operational Currency</label>
            <select
              className="w-full text-xs font-bold px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/5 transition-all shadow-sm"
              value={quotationInfo.currency}
              onChange={(e) => handleQuotationChange('currency', e.target.value)}
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="BHD">BHD (./د) - Bahraini Dinar</option>
              <option value="AED">AED (د.إ) - UAE Dirham</option>
              <option value="SAR">SAR (ر.س) - Saudi Riyal</option>
              <option value="QAR">QAR (ر.ق) - Qatari Riyal</option>
              <option value="OMR">OMR (ر.ع.) - Omani Rial</option>
              <option value="KWD">KWD (د.ك) - Kuwaiti Dinar</option>
              <option value="INR">INR (₹) - Indian Rupee</option>
            </select>
          </div>
        </div>

        {/* Right: Section B - Elegant Operations & Shipment Form */}
        <div className="xl:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <MapPin size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase block">Logistics & Client Intake</span>
              <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Shipment Intelligence</h2>
            </div>
          </div>

          {/* Form Row: Customer & Incoterm */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Customer Name</label>
              <input
                type="text"
                className="w-full text-xs font-semibold px-4 py-2.5 border border-zinc-200 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-brand-accent transition-all shadow-sm"
                value={shipmentInfo.customerName}
                onChange={(e) => handleShipmentChange('customerName', e.target.value)}
                placeholder="Enterprise Client Hub"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Incoterm Rule</label>
              <select
                className="w-full text-xs font-bold px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-accent transition-all shadow-sm"
                value={shipmentInfo.incoterm}
                onChange={(e) => handleShipmentChange('incoterm', e.target.value)}
              >
                {['EXW', 'FOB', 'CIF', 'DDP', 'DAP', 'CFR'].map(term => <option key={term} value={term}>{term}</option>)}
              </select>
            </div>
          </div>

          {/* Form Row: Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Primary Contact</label>
              <input
                type="text"
                className="w-full text-xs px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-brand-accent transition-all shadow-sm"
                value={shipmentInfo.customerContact}
                onChange={(e) => handleShipmentChange('customerContact', e.target.value)}
                placeholder="Representative Name / ID"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Secure Notification Email</label>
              <input
                type="email"
                className="w-full text-xs px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-brand-accent transition-all shadow-sm"
                value={shipmentInfo.customerEmail}
                onChange={(e) => handleShipmentChange('customerEmail', e.target.value)}
                placeholder="operations@client.com"
              />
            </div>
          </div>

          {/* Form Matrix Sub-section: Routing Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-inner">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/> Point of Origin
              </label>
              <input
                type="text"
                className="w-full text-xs px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-brand-accent transition-all shadow-sm"
                value={shipmentInfo.origin}
                onChange={(e) => handleShipmentChange('origin', e.target.value)}
                placeholder="Hub or City, Country"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Final Destination
              </label>
              <input
                type="text"
                className="w-full text-xs px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-brand-accent transition-all shadow-sm"
                value={shipmentInfo.destination}
                onChange={(e) => handleShipmentChange('destination', e.target.value)}
                placeholder="Discharge Facility / Gate"
              />
            </div>
          </div>

          {/* Form Row: Shipment Dimensions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Mass (KG)</label>
              <input
                type="number"
                min="0"
                className="w-full text-xs font-semibold px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-accent transition-all shadow-sm"
                value={shipmentInfo.weight}
                onChange={(e) => handleShipmentChange('weight', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Volume (CBM)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full text-xs font-semibold px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-accent transition-all shadow-sm"
                value={shipmentInfo.volume}
                onChange={(e) => handleShipmentChange('volume', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Freight Setup</label>
              <select
                className="w-full text-xs font-medium px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-accent transition-all shadow-sm"
                value={shipmentInfo.shipmentType}
                onChange={(e) => handleShipmentChange('shipmentType', e.target.value)}
              >
                {['LCL', 'FCL', 'Courier', 'Consolidated'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Transit Route</label>
              <select
                className="w-full text-xs font-medium px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-accent transition-all shadow-sm"
                value={shipmentInfo.modeOfTransport}
                onChange={(e) => handleShipmentChange('modeOfTransport', e.target.value)}
              >
                <option value="Sea">Sea Freight</option>
                <option value="Air">Air Freight</option>
                <option value="Road">Road Freight</option>
                <option value="Multimodal">Multimodal</option>
              </select>
            </div>
          </div>

          {/* Form Group: Cargo Manifest Details */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Manifest & Description of Goods</label>
            <input
              type="text"
              className="w-full text-xs px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-brand-accent transition-all shadow-sm"
              value={shipmentInfo.goodsDescription}
              onChange={(e) => handleShipmentChange('goodsDescription', e.target.value)}
              placeholder="Hazmat specifications, commercial grades, piece details..."
            />
          </div>
        </div>
      </div>

      {/* -------------------- SECTION C & D: MATRIX FINANCIAL SHEETS -------------------- */}
      
      {/* Agent Cost Sheet */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <ArrowDownLeft size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase block">Outbound Costs</span>
              <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Section C – Agent Ledger Sheet</h2>
            </div>
          </div>
          <div className="px-4 py-2 bg-amber-500/5 border border-amber-500/20 rounded-xl text-right">
            <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">Total Evaluated Cost</span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400">{formatCurrency(agentTotals.grandTotal, quotationInfo.currency)}</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Expense Classification</th>
                {['EXW', 'Freight', 'FOB', 'Other Charges'].map(h => (
                  <th key={h} className="px-4 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">{h}</th>
                ))}
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right bg-zinc-50/40 dark:bg-zinc-950/40 w-44">Aggregate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {FREIGHT_CATEGORIES.map((cat) => {
                const row = agentData[cat.id] || { exw: '', freight: '', fob: '', other: '' };
                const rowTotal = calculateRowTotal(row);
                return (
                  <tr key={cat.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-950/20 transition-colors">
                    <td className="px-6 py-3.5 text-zinc-700 dark:text-zinc-300 font-semibold">{cat.label}</td>
                    {['exw', 'freight', 'fob', 'other'].map((field) => (
                      <td key={field} className="px-3 py-2">
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            placeholder="0.00"
                            className="w-full text-right text-xs font-semibold pl-2 pr-3 py-2 border border-zinc-200 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all placeholder-zinc-300"
                            value={row[field]}
                            onChange={(e) => handleCellChange('agent', cat.id, field, e.target.value)}
                          />
                        </div>
                      </td>
                    ))}
                    <td className="px-6 py-3.5 text-right font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-50/20 dark:bg-zinc-950/10">
                      {formatCurrency(rowTotal, quotationInfo.currency)}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-zinc-50/80 dark:bg-zinc-950/50 font-bold border-t border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                <td className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Sum Total</td>
                <td className="px-3 py-4 text-right font-semibold">{formatCurrency(agentTotals.totalEXW, quotationInfo.currency)}</td>
                <td className="px-3 py-4 text-right font-semibold">{formatCurrency(agentTotals.totalFreight, quotationInfo.currency)}</td>
                <td className="px-3 py-4 text-right font-semibold">{formatCurrency(agentTotals.totalFOB, quotationInfo.currency)}</td>
                <td className="px-3 py-4 text-right font-semibold">{formatCurrency(agentTotals.totalOther, quotationInfo.currency)}</td>
                <td className="px-6 py-4 text-right text-amber-600 dark:text-amber-400 font-black text-sm bg-amber-500/5">{formatCurrency(agentTotals.grandTotal, quotationInfo.currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Quotation Sheet */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ArrowUpRight size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase block">Inbound Revenue</span>
              <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Section D – Customer Commercial Sheet</h2>
            </div>
          </div>
          <div className="px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-right">
            <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">Gross Offered Revenue</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(customerTotals.grandTotal, quotationInfo.currency)}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Profit Center Category</th>
                {['EXW', 'Freight', 'FOB', 'Other Charges'].map(h => (
                  <th key={h} className="px-4 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">{h}</th>
                ))}
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right bg-zinc-50/40 dark:bg-zinc-950/40 w-44">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {FREIGHT_CATEGORIES.map((cat) => {
                const row = customerData[cat.id] || { exw: '', freight: '', fob: '', other: '' };
                const rowTotal = calculateRowTotal(row);
                return (
                  <tr key={cat.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-950/20 transition-colors">
                    <td className="px-6 py-3.5 text-zinc-700 dark:text-zinc-300 font-semibold">{cat.label}</td>
                    {['exw', 'freight', 'fob', 'other'].map((field) => (
                      <td key={field} className="px-3 py-2">
                        <input
                          type="number"
                          placeholder="0.00"
                          className="w-full text-right text-xs font-semibold pl-2 pr-3 py-2 border border-zinc-200 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder-zinc-300"
                          value={row[field]}
                          onChange={(e) => handleCellChange('customer', cat.id, field, e.target.value)}
                        />
                      </td>
                    ))}
                    <td className="px-6 py-3.5 text-right font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-50/20 dark:bg-zinc-950/10">
                      {formatCurrency(rowTotal, quotationInfo.currency)}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-zinc-50/80 dark:bg-zinc-950/50 font-bold border-t border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                <td className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Gross Offer</td>
                <td className="px-3 py-4 text-right font-semibold">{formatCurrency(customerTotals.totalEXW, quotationInfo.currency)}</td>
                <td className="px-3 py-4 text-right font-semibold">{formatCurrency(customerTotals.totalFreight, quotationInfo.currency)}</td>
                <td className="px-3 py-4 text-right font-semibold">{formatCurrency(customerTotals.totalFOB, quotationInfo.currency)}</td>
                <td className="px-3 py-4 text-right font-semibold">{formatCurrency(customerTotals.totalOther, quotationInfo.currency)}</td>
                <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400 font-black text-sm bg-emerald-500/5">{formatCurrency(customerTotals.grandTotal, quotationInfo.currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* -------------------- SECTION E: COMPACT APPROVAL DECK -------------------- */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
            <ShieldCheck size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase block">Governance Matrix</span>
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Section E – Approvals & Signatures</h2>
          </div>
        </div>
        
        {/* Signee Assignment Matrix inputs rewritten as high-fidelity Form Group elements */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { id: 'preparedBy', label: 'Assign Preparer', placeholder: 'Sales Engineer Name' },
            { id: 'reviewedBy', label: 'Assign Auditor/Reviewer', placeholder: 'Operations Expert' },
            { id: 'approvedBy', label: 'Assign Executive Approver', placeholder: 'Managing Director' }
          ].map(input => (
            <div key={input.id} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">{input.label}</label>
              <input
                type="text"
                className="w-full text-xs font-semibold px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-brand-accent transition-all shadow-sm"
                value={quotationInfo[input.id] || ''}
                onChange={(e) => handleQuotationChange(input.id, e.target.value)}
                placeholder={input.placeholder}
              />
            </div>
          ))}
        </div>

        {/* Corporate Grid Passblocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          {[
            { role: 'Customer Acceptance', name: shipmentInfo.customerName || 'Client Hub Signature Required', signLabel: 'Corporate Validation & Stamp', icon: <CheckCircle size={14} className="text-zinc-400" /> },
            { role: 'Prepared By', name: quotationInfo.preparedBy || 'Pending Assignment', signLabel: 'Preparer Electronic Signature', icon: <UserCheck size={14} className="text-zinc-400" /> },
            { role: 'Reviewed By', name: quotationInfo.reviewedBy || 'Pending Assignment', signLabel: 'Operational Review Clearance', icon: <UserCheck size={14} className="text-zinc-400" /> },
            { role: 'Approved By', name: quotationInfo.approvedBy || 'Pending Executive Clearance', signLabel: 'Executive Directorate Seal', icon: <ShieldCheck size={14} className="text-zinc-400" /> }
          ].map((box, idx) => (
            <div 
              key={idx} 
              className="bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between min-h-[150px] transition-all hover:bg-zinc-50 dark:hover:bg-zinc-950/40 hover:shadow-sm"
            >
              <div className="flex justify-between items-start gap-2 border-b border-zinc-100 dark:border-zinc-800/60 pb-2 mb-2">
                <span className="text-[9px] font-black tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">{box.role}</span>
                {box.icon}
              </div>
              <div className="my-auto py-1">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block truncate leading-tight">{box.name}</span>
              </div>
              <div className="w-full pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium italic">{box.signLabel}</div>
                <div className="text-[9px] text-zinc-400 font-mono tracking-wider">Date: __/__/____</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}