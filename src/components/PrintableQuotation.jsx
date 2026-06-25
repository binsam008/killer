import React from 'react';
import {
  FREIGHT_CATEGORIES,
  calculateRowTotal,
  calculateSheetTotals,
  formatCurrency
} from '../utils/calculations';

export default function PrintableQuotation({
  quotationInfo = {},
  shipmentInfo = {},
  customerData = {}
}) {
  const totals = calculateSheetTotals(customerData);
  const currency = quotationInfo.currency || 'USD';

  const lineItems = FREIGHT_CATEGORIES.map((cat) => {
    const row = customerData[cat.id] || { exw: 0, freight: 0, fob: 0, other: 0 };
    const total = calculateRowTotal(row);
    return { ...cat, row, total };
  }).filter((item) => item.total > 0);

  const formatCell = (value) => {
    const num = Number(value) || 0;
    return num > 0 ? formatCurrency(num, currency) : '—';
  };

  return (
    <div className="print-only hidden w-full max-w-[210mm] mx-auto bg-white text-zinc-900 font-sans text-[11px] leading-relaxed antialiased">
      {/* Letterhead */}
      <header className="flex justify-between items-start border-b-2 border-zinc-900 pb-4 mb-5">
        <div className="flex items-start gap-4">
          {quotationInfo.logo && (
            <img
              src={quotationInfo.logo}
              alt="Company Logo"
              className="max-h-16 max-w-[120px] object-contain rounded bg-white p-1 border border-zinc-200"
            />
          )}
          <div>
            <p className="text-[9px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-1">Freight Quotation</p>
            <h1 className="text-2xl font-black tracking-tight uppercase text-zinc-900">
              Well Reach Logistics
            </h1>
            <p className="text-[10px] text-zinc-500 mt-1">
              GCC Freight Forwarding · Customs Clearance · Warehousing · Intermodal Logistics
            </p>
          </div>
        </div>
        <div className="text-right">
          <table className="text-[10px] border-collapse ml-auto">
            <tbody>
              <tr>
                <td className="pr-3 py-0.5 text-zinc-500 font-semibold uppercase tracking-wide">Quotation No.</td>
                <td className="font-mono font-bold text-zinc-900">{quotationInfo.refNo || '—'}</td>
              </tr>
              <tr>
                <td className="pr-3 py-0.5 text-zinc-500 font-semibold uppercase tracking-wide">Date</td>
                <td className="font-mono text-zinc-800">{quotationInfo.date || '—'}</td>
              </tr>
              <tr>
                <td className="pr-3 py-0.5 text-zinc-500 font-semibold uppercase tracking-wide">Valid Until</td>
                <td className="font-mono text-zinc-800">{quotationInfo.validUntil || '—'}</td>
              </tr>
              <tr>
                <td className="pr-3 py-0.5 text-zinc-500 font-semibold uppercase tracking-wide">Currency</td>
                <td className="font-bold text-zinc-900">{currency}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </header>

      {/* Client & shipment */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <section className="border border-zinc-300 rounded-lg p-3.5">
          <h2 className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase mb-2 border-b border-zinc-200 pb-1">
            Bill To
          </h2>
          <p className="text-xs font-bold text-zinc-900">{shipmentInfo.customerName || '—'}</p>
          {shipmentInfo.customerContact && (
            <p className="text-[10px] text-zinc-600 mt-1">{shipmentInfo.customerContact}</p>
          )}
          {shipmentInfo.customerEmail && (
            <p className="text-[10px] text-zinc-500">{shipmentInfo.customerEmail}</p>
          )}
          {quotationInfo.salesPerson && (
            <p className="text-[10px] text-zinc-600 mt-2">
              <span className="text-zinc-400 uppercase font-semibold text-[9px] tracking-wide">Sales Contact: </span>
              {quotationInfo.salesPerson}
            </p>
          )}
        </section>

        <section className="border border-zinc-300 rounded-lg p-3.5">
          <h2 className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase mb-2 border-b border-zinc-200 pb-1">
            Shipment Details
          </h2>
          <table className="w-full text-[10px]">
            <tbody>
              <tr>
                <td className="text-zinc-500 py-0.5 w-24">Origin</td>
                <td className="font-medium text-zinc-800">{shipmentInfo.origin || '—'}</td>
              </tr>
              <tr>
                <td className="text-zinc-500 py-0.5">Destination</td>
                <td className="font-medium text-zinc-800">{shipmentInfo.destination || '—'}</td>
              </tr>
              <tr>
                <td className="text-zinc-500 py-0.5">Incoterm</td>
                <td className="font-medium text-zinc-800">{shipmentInfo.incoterm || '—'}</td>
              </tr>
              <tr>
                <td className="text-zinc-500 py-0.5">Mode / Type</td>
                <td className="font-medium text-zinc-800">
                  {[shipmentInfo.modeOfTransport, shipmentInfo.shipmentType].filter(Boolean).join(' · ') || '—'}
                </td>
              </tr>
              {(shipmentInfo.weight || shipmentInfo.volume) && (
                <tr>
                  <td className="text-zinc-500 py-0.5">Weight / Volume</td>
                  <td className="font-medium text-zinc-800">
                    {[shipmentInfo.weight && `${shipmentInfo.weight} kg`, shipmentInfo.volume && `${shipmentInfo.volume} CBM`]
                      .filter(Boolean)
                      .join(' · ')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      {shipmentInfo.goodsDescription && (
        <section className="mb-5 border border-zinc-200 rounded-lg p-3 bg-zinc-50/60">
          <h2 className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase mb-1">Description of Goods</h2>
          <p className="text-[10px] text-zinc-800">{shipmentInfo.goodsDescription}</p>
        </section>
      )}

      {/* Rate breakdown */}
      <section className="mb-5">
        <h2 className="text-[10px] font-bold tracking-widest text-zinc-700 uppercase mb-2">
          Quoted Charges
        </h2>
        {quotationInfo.printSummaryOnly ? (
          <table className="w-full border-collapse border border-zinc-300 text-[10px]">
            <thead>
              <tr className="bg-zinc-100 text-zinc-700">
                <th className="border border-zinc-300 p-2 text-left font-bold">Services & Scope Offered</th>
                <th className="border border-zinc-300 p-2 text-right font-bold w-32">Status</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.length > 0 ? (
                lineItems.map(({ id, label }) => (
                  <tr key={id}>
                    <td className="border border-zinc-300 p-2 font-semibold text-zinc-800 text-[11px]">{label}</td>
                    <td className="border border-zinc-300 p-2 text-right text-emerald-600 font-bold uppercase tracking-wider text-[9px]">Included</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="border border-zinc-300 p-4 text-center text-zinc-400 italic">
                    No charges entered
                  </td>
                </tr>
              )}
              <tr className="bg-zinc-900 text-white font-bold">
                <td className="border border-zinc-900 p-2.5 text-right uppercase tracking-wide text-[10px]">
                  Total Quotation Amount
                </td>
                <td className="border border-zinc-900 p-2.5 text-right font-mono text-xs">
                  {formatCurrency(totals.grandTotal, currency)}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table className="w-full border-collapse border border-zinc-300 text-[10px]">
            <thead>
              <tr className="bg-zinc-100 text-zinc-700">
                <th className="border border-zinc-300 p-2 text-left font-bold">Service</th>
                <th className="border border-zinc-300 p-2 text-right font-bold w-20">EXW</th>
                <th className="border border-zinc-300 p-2 text-right font-bold w-20">Freight</th>
                <th className="border border-zinc-300 p-2 text-right font-bold w-20">FOB</th>
                <th className="border border-zinc-300 p-2 text-right font-bold w-24">Other</th>
                <th className="border border-zinc-300 p-2 text-right font-bold w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.length > 0 ? (
                lineItems.map(({ id, label, row, total }) => (
                  <tr key={id}>
                    <td className="border border-zinc-300 p-2 font-semibold text-zinc-800">{label}</td>
                    <td className="border border-zinc-300 p-2 text-right font-mono">{formatCell(row.exw)}</td>
                    <td className="border border-zinc-300 p-2 text-right font-mono">{formatCell(row.freight)}</td>
                    <td className="border border-zinc-300 p-2 text-right font-mono">{formatCell(row.fob)}</td>
                    <td className="border border-zinc-300 p-2 text-right font-mono">{formatCell(row.other)}</td>
                    <td className="border border-zinc-300 p-2 text-right font-mono font-bold">{formatCurrency(total, currency)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="border border-zinc-300 p-4 text-center text-zinc-400 italic">
                    No charges entered
                  </td>
                </tr>
              )}
              <tr className="bg-zinc-900 text-white font-bold">
                <td colSpan={5} className="border border-zinc-900 p-2.5 text-right uppercase tracking-wide text-[10px]">
                  Grand Total
                </td>
                <td className="border border-zinc-900 p-2.5 text-right font-mono text-xs">
                  {formatCurrency(totals.grandTotal, currency)}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </section>

      {/* Terms */}
      <section className="mb-6 p-3 border border-zinc-200 rounded-lg bg-zinc-50/40 text-[9px] text-zinc-600 leading-relaxed">
        <h2 className="font-bold text-zinc-500 uppercase tracking-widest mb-1">Terms &amp; Conditions</h2>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>This quotation is valid until the date stated above unless otherwise agreed in writing.</li>
          <li>All rates are quoted in {currency} and are subject to carrier, port, and regulatory surcharges where applicable.</li>
          <li>Shipment is based on the incoterm, routing, and cargo details provided. Changes may affect the quoted rates.</li>
          <li>Payment terms and booking confirmation are subject to Well Reach Logistics standard commercial policies.</li>
        </ul>
      </section>

      {/* Signatures */}
      <section className="grid grid-cols-4 gap-4 mb-4 page-break-inside-avoid">
        {[
          { label: 'Prepared By', name: quotationInfo.preparedBy },
          { label: 'Reviewed By', name: quotationInfo.reviewedBy },
          { label: 'Approved By', name: quotationInfo.approvedBy },
          { label: 'Customer Acceptance', name: shipmentInfo.customerName }
        ].map(({ label, name }) => (
          <div key={label} className="text-center">
            <div className="h-14 border-b border-zinc-400 mb-1" />
            <p className="text-[10px] font-bold text-zinc-800 truncate">{name || ' '}</p>
            <p className="text-[8px] text-zinc-400 uppercase tracking-wider font-semibold mt-0.5">{label}</p>
            <p className="text-[8px] text-zinc-400 mt-1">Date: _______________</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-zinc-200 pt-3 text-center text-[8px] text-zinc-400">
        Well Reach Logistics · Quotation Ref {quotationInfo.refNo || '—'} · Confidential commercial document
      </footer>
    </div>
  );
}
