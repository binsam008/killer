import * as XLSX from 'xlsx';
import { FREIGHT_CATEGORIES } from './calculations';

/**
 * Helper to get a cell coordinate label (e.g. A1, B5)
 */
const getCellRef = (c, r) => XLSX.utils.encode_cell({ c, r });

/**
 * Export data to an Excel Workbook (.xlsx) with three sheets
 */
export const exportToExcel = (quotationInfo, shipmentInfo, agentData, customerData, kpis, targetMargins, recommendation) => {
  const wb = XLSX.utils.book_new();

  // ==========================================
  // SHEET 1: DATA INPUT
  // ==========================================
  const ws1Data = [];
  
  // Section A - Quotation Information
  ws1Data.push(['WELL REACH LOGISTICS - QUOTATION SYSTEM']);
  ws1Data.push(['Section A - Quotation Information']);
  ws1Data.push(['Quotation Ref No', quotationInfo.refNo]);
  ws1Data.push(['Date', quotationInfo.date]);
  ws1Data.push(['Valid Until', quotationInfo.validUntil]);
  ws1Data.push(['Date Quoted', quotationInfo.dateQuoted]);
  ws1Data.push(['Sales Person', quotationInfo.salesPerson]);
  ws1Data.push(['Currency', quotationInfo.currency]);
  ws1Data.push([]);

  // Section B - Customer & Shipment Information
  ws1Data.push(['Section B - Customer & Shipment Information']);
  ws1Data.push(['Customer Name', shipmentInfo.customerName]);
  ws1Data.push(['Customer Contact', shipmentInfo.customerContact]);
  ws1Data.push(['Customer Email', shipmentInfo.customerEmail]);
  ws1Data.push(['Origin', shipmentInfo.origin]);
  ws1Data.push(['Destination', shipmentInfo.destination]);
  ws1Data.push(['Incoterm', shipmentInfo.incoterm]);
  ws1Data.push(['Goods Description', shipmentInfo.goodsDescription]);
  ws1Data.push(['Weight (KG)', shipmentInfo.weight]);
  ws1Data.push(['Volume (CBM)', shipmentInfo.volume]);
  ws1Data.push(['Shipment Type', shipmentInfo.shipmentType]);
  ws1Data.push(['Mode of Transport', shipmentInfo.modeOfTransport]);
  ws1Data.push([]);

  // Section C - Agent Cost Sheet
  ws1Data.push(['Section C - Agent Cost Sheet']);
  ws1Data.push(['Freight Category', 'EXW', 'Freight', 'FOB', 'Other Charges', 'Total Cost']);
  
  const costStartRow = ws1Data.length;
  FREIGHT_CATEGORIES.forEach((cat) => {
    const row = agentData[cat.id] || {};
    ws1Data.push([
      cat.label,
      Number(row.exw || 0),
      Number(row.freight || 0),
      Number(row.fob || 0),
      Number(row.other || 0),
      null // Will calculate formula
    ]);
  });
  ws1Data.push(['Total Cost', null, null, null, null, null]);
  ws1Data.push([]);

  // Section D - Customer Quotation Sheet
  ws1Data.push(['Section D - Customer Quotation Sheet']);
  ws1Data.push(['Freight Category', 'EXW', 'Freight', 'FOB', 'Other Charges', 'Total Revenue']);

  const revenueStartRow = ws1Data.length;
  FREIGHT_CATEGORIES.forEach((cat) => {
    const row = customerData[cat.id] || {};
    ws1Data.push([
      cat.label,
      Number(row.exw || 0),
      Number(row.freight || 0),
      Number(row.fob || 0),
      Number(row.other || 0),
      null // Will calculate formula
    ]);
  });
  ws1Data.push(['Total Revenue', null, null, null, null, null]);
  ws1Data.push([]);

  // Section E - Approval Section
  ws1Data.push(['Section E - Approval Section']);
  ws1Data.push(['Customer Signature Space:', '', '', 'Prepared By', quotationInfo.preparedBy || '']);
  ws1Data.push(['Date:', '', '', 'Reviewed By', quotationInfo.reviewedBy || '']);
  ws1Data.push(['Company Stamp:', '', '', 'Approved By', quotationInfo.approvedBy || '']);

  // Convert WS1 raw matrix to sheet object
  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);

  // Set Sheet 1 Formulas
  // Total cost row-wise formulas
  for (let i = 0; i < FREIGHT_CATEGORIES.length; i++) {
    const rIdx = costStartRow + i + 1; // 1-indexed row in excel
    ws1[`F${rIdx}`] = { f: `SUM(B${rIdx}:E${rIdx})`, t: 'n' };
  }
  
  // Total cost column-wise sum
  const costTotalRowIdx = costStartRow + FREIGHT_CATEGORIES.length + 1;
  ws1[`B${costTotalRowIdx}`] = { f: `SUM(B${costStartRow + 1}:B${costTotalRowIdx - 1})`, t: 'n' };
  ws1[`C${costTotalRowIdx}`] = { f: `SUM(C${costStartRow + 1}:C${costTotalRowIdx - 1})`, t: 'n' };
  ws1[`D${costTotalRowIdx}`] = { f: `SUM(D${costStartRow + 1}:D${costTotalRowIdx - 1})`, t: 'n' };
  ws1[`E${costTotalRowIdx}`] = { f: `SUM(E${costStartRow + 1}:E${costTotalRowIdx - 1})`, t: 'n' };
  ws1[`F${costTotalRowIdx}`] = { f: `SUM(F${costStartRow + 1}:F${costTotalRowIdx - 1})`, t: 'n' };

  // Total revenue row-wise formulas
  for (let i = 0; i < FREIGHT_CATEGORIES.length; i++) {
    const rIdx = revenueStartRow + i + 1;
    ws1[`F${rIdx}`] = { f: `SUM(B${rIdx}:E${rIdx})`, t: 'n' };
  }

  // Total revenue column-wise sum
  const revTotalRowIdx = revenueStartRow + FREIGHT_CATEGORIES.length + 1;
  ws1[`B${revTotalRowIdx}`] = { f: `SUM(B${revenueStartRow + 1}:B${revTotalRowIdx - 1})`, t: 'n' };
  ws1[`C${revTotalRowIdx}`] = { f: `SUM(C${revenueStartRow + 1}:C${revTotalRowIdx - 1})`, t: 'n' };
  ws1[`D${revTotalRowIdx}`] = { f: `SUM(D${revenueStartRow + 1}:D${revTotalRowIdx - 1})`, t: 'n' };
  ws1[`E${revTotalRowIdx}`] = { f: `SUM(E${revenueStartRow + 1}:E${revTotalRowIdx - 1})`, t: 'n' };
  ws1[`F${revTotalRowIdx}`] = { f: `SUM(F${revenueStartRow + 1}:F${revTotalRowIdx - 1})`, t: 'n' };


  // ==========================================
  // SHEET 2: MANAGEMENT DASHBOARD
  // ==========================================
  const ws2Data = [
    ['WELL REACH LOGISTICS'],
    ['Quotation Profitability Dashboard'],
    [],
    ['KPI CARDS'],
    ['KPI', 'Value'],
    ['Revenue', null], // Formula to 'DATA INPUT' Total Revenue (F[revTotalRowIdx])
    ['Cost', null],    // Formula to 'DATA INPUT' Total Cost (F[costTotalRowIdx])
    ['Profit', null],  // Revenue - Cost
    ['Margin %', null], // Profit / Revenue
    [],
    ['Freight-wise Profitability Table'],
    ['Freight Type', 'Cost', 'Revenue', 'Profit', 'Margin %']
  ];

  const freightStartRow = ws2Data.length;
  FREIGHT_CATEGORIES.forEach((cat, idx) => {
    // Map categories to rows in DATA INPUT
    // Cost row is: costStartRow + idx + 1
    // Revenue row is: revenueStartRow + idx + 1
    const costCell = `'DATA INPUT'!F${costStartRow + idx + 1}`;
    const revCell = `'DATA INPUT'!F${revenueStartRow + idx + 1}`;
    ws2Data.push([
      cat.label,
      null, // cost formula
      null, // revenue formula
      null, // profit formula
      null  // margin formula
    ]);
  });
  
  ws2Data.push([]);
  ws2Data.push(['Target Margin Analysis']);
  ws2Data.push(['Target', 'Revenue Required', 'Profit Required']);
  ws2Data.push(['5%', null, null]);
  ws2Data.push(['10%', null, null]);
  ws2Data.push(['15%', null, null]);

  ws2Data.push([]);
  ws2Data.push(['Management Summary']);
  ws2Data.push(['KPI', 'Result']);
  ws2Data.push(['Total Cost', null]);
  ws2Data.push(['Total Revenue', null]);
  ws2Data.push(['Gross Profit', null]);
  ws2Data.push(['Margin %', null]);
  ws2Data.push(['Recommended Selling Price', null]);
  ws2Data.push(['Target Achievement', null]);

  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);

  // Sheet 2 KPI Formulas
  // Revenue = 'DATA INPUT'!Total Revenue
  ws2['B6'] = { f: `'DATA INPUT'!F${revTotalRowIdx}`, t: 'n' };
  // Cost = 'DATA INPUT'!Total Cost
  ws2['B7'] = { f: `'DATA INPUT'!F${costTotalRowIdx}`, t: 'n' };
  // Profit = Revenue - Cost
  ws2['B8'] = { f: 'B6-B7', t: 'n' };
  // Margin = Profit / Revenue
  ws2['B9'] = { f: 'IF(B6>0,B8/B6,0)', t: 'n' };

  // Sheet 2 Freight-wise Profitability formulas
  for (let i = 0; i < FREIGHT_CATEGORIES.length; i++) {
    const rIdx = freightStartRow + i + 1;
    const inputCostRow = costStartRow + i + 1;
    const inputRevRow = revenueStartRow + i + 1;

    ws2[`B${rIdx}`] = { f: `'DATA INPUT'!F${inputCostRow}`, t: 'n' };
    ws2[`C${rIdx}`] = { f: `'DATA INPUT'!F${inputRevRow}`, t: 'n' };
    ws2[`D${rIdx}`] = { f: `C${rIdx}-B${rIdx}`, t: 'n' };
    ws2[`E${rIdx}`] = { f: `IF(C${rIdx}>0,D${rIdx}/C${rIdx},0)`, t: 'n' };
  }

  // Sheet 2 Target Margin Analysis formulas
  // Row indices: target margins are at lines (freightStartRow + categories + 4, 5, 6)
  const targetStartRowIdx = freightStartRow + FREIGHT_CATEGORIES.length + 4;
  // Cost cell is B7
  ws2[`B${targetStartRowIdx}`] = { f: 'B7/(1-0.05)', t: 'n' };
  ws2[`C${targetStartRowIdx}`] = { f: `B${targetStartRowIdx}-B7`, t: 'n' };

  ws2[`B${targetStartRowIdx + 1}`] = { f: 'B7/(1-0.10)', t: 'n' };
  ws2[`C${targetStartRowIdx + 1}`] = { f: `B${targetStartRowIdx + 1}-B7`, t: 'n' };

  ws2[`B${targetStartRowIdx + 2}`] = { f: 'B7/(1-0.15)', t: 'n' };
  ws2[`C${targetStartRowIdx + 2}`] = { f: `B${targetStartRowIdx + 2}-B7`, t: 'n' };

  // Management Summary formulas
  const mSummaryStartRowIdx = targetStartRowIdx + 6;
  ws2[`B${mSummaryStartRowIdx}`] = { f: 'B7', t: 'n' }; // Total Cost
  ws2[`B${mSummaryStartRowIdx + 1}`] = { f: 'B6', t: 'n' }; // Total Revenue
  ws2[`B${mSummaryStartRowIdx + 2}`] = { f: 'B8', t: 'n' }; // Gross Profit
  ws2[`B${mSummaryStartRowIdx + 3}`] = { f: 'B9', t: 'n' }; // Margin %
  // Recommended Selling Price (Cost / (1 - 0.15))
  ws2[`B${mSummaryStartRowIdx + 4}`] = { f: 'B7/(1-0.15)', t: 'n' };
  // Target Achievement Status
  ws2[`B${mSummaryStartRowIdx + 5}`] = { f: 'IF(B9>=0.15,"Excellent Margin",IF(B9>=0.05,"Acceptable","Low Margin"))', t: 's' };


  // ==========================================
  // SHEET 3: COMPARISON
  // ==========================================
  const ws3Data = [
    ['Agent vs Customer Rate Analysis'],
    ['Category', 'Agent EXW', 'Agent Freight', 'Agent FOB', 'Customer EXW', 'Customer Freight', 'Customer FOB', 'Profit', 'Margin %']
  ];

  FREIGHT_CATEGORIES.forEach((cat, idx) => {
    // Map columns from DATA INPUT
    // Agent row is costStartRow + idx + 1
    // Customer row is revenueStartRow + idx + 1
    ws3Data.push([
      cat.label,
      null, // Agent EXW
      null, // Agent Freight
      null, // Agent FOB
      null, // Customer EXW
      null, // Customer Freight
      null, // Customer FOB
      null, // Profit
      null  // Margin %
    ]);
  });

  ws3Data.push([]);
  ws3Data.push(['Gap Analysis']);
  ws3Data.push(['Margin Target', 'Required Revenue', 'Current Revenue', 'Difference']);
  ws3Data.push(['5%', null, null, null]);
  ws3Data.push(['10%', null, null, null]);
  ws3Data.push(['15%', null, null, null]);

  ws3Data.push([]);
  ws3Data.push(['Pricing Recommendation']);
  ws3Data.push(['Current Margin %', null]);
  ws3Data.push(['Status', recommendation.status]);

  const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);

  // Sheet 3 Rate Analysis Formulas
  for (let i = 0; i < FREIGHT_CATEGORIES.length; i++) {
    const rIdx = i + 3; // rows start from 3 in excel
    const inputCostRow = costStartRow + i + 1;
    const inputRevRow = revenueStartRow + i + 1;

    ws3[`B${rIdx}`] = { f: `'DATA INPUT'!B${inputCostRow}`, t: 'n' };
    ws3[`C${rIdx}`] = { f: `'DATA INPUT'!C${inputCostRow}`, t: 'n' };
    ws3[`D${rIdx}`] = { f: `'DATA INPUT'!D${inputCostRow}`, t: 'n' };
    
    ws3[`E${rIdx}`] = { f: `'DATA INPUT'!B${inputRevRow}`, t: 'n' };
    ws3[`F${rIdx}`] = { f: `'DATA INPUT'!C${inputRevRow}`, t: 'n' };
    ws3[`G${rIdx}`] = { f: `'DATA INPUT'!D${inputRevRow}`, t: 'n' };

    // Profit = Total Revenue Row - Total Cost Row
    ws3[`H${rIdx}`] = { f: `'DATA INPUT'!F${inputRevRow}-'DATA INPUT'!F${inputCostRow}`, t: 'n' };
    // Margin % = Profit / Revenue
    ws3[`I${rIdx}`] = { f: `IF('DATA INPUT'!F${inputRevRow}>0,H${rIdx}/'DATA INPUT'!F${inputRevRow},0)`, t: 'n' };
  }

  // Sheet 3 Gap Analysis Formulas
  const ws3GapStartRow = FREIGHT_CATEGORIES.length + 5;
  // Current Revenue is on Sheet 2 B6
  // Margin targets Required Revenue formulas map to target margins
  ws3[`B${ws3GapStartRow}`] = { f: `'MANAGEMENT DASHBOARD'!B${targetStartRowIdx}`, t: 'n' };
  ws3[`C${ws3GapStartRow}`] = { f: `'MANAGEMENT DASHBOARD'!B6`, t: 'n' };
  ws3[`D${ws3GapStartRow}`] = { f: `C${ws3GapStartRow}-B${ws3GapStartRow}`, t: 'n' };

  ws3[`B${ws3GapStartRow + 1}`] = { f: `'MANAGEMENT DASHBOARD'!B${targetStartRowIdx + 1}`, t: 'n' };
  ws3[`C${ws3GapStartRow + 1}`] = { f: `'MANAGEMENT DASHBOARD'!B6`, t: 'n' };
  ws3[`D${ws3GapStartRow + 1}`] = { f: `C${ws3GapStartRow + 1}-B${ws3GapStartRow + 1}`, t: 'n' };

  ws3[`B${ws3GapStartRow + 2}`] = { f: `'MANAGEMENT DASHBOARD'!B${targetStartRowIdx + 2}`, t: 'n' };
  ws3[`C${ws3GapStartRow + 2}`] = { f: `'MANAGEMENT DASHBOARD'!B6`, t: 'n' };
  ws3[`D${ws3GapStartRow + 2}`] = { f: `C${ws3GapStartRow + 2}-B${ws3GapStartRow + 2}`, t: 'n' };

  // Sheet 3 Pricing Recommendation Formulas
  const ws3RecStartRow = ws3GapStartRow + 6;
  ws3[`B${ws3RecStartRow}`] = { f: `'MANAGEMENT DASHBOARD'!B9`, t: 'n' };


  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(wb, ws1, 'DATA INPUT');
  XLSX.utils.book_append_sheet(wb, ws2, 'MANAGEMENT DASHBOARD');
  XLSX.utils.book_append_sheet(wb, ws3, 'COMPARISON');

  // Generate Excel File and Trigger Download
  const filename = `WRL_Quotation_${quotationInfo.refNo}.xlsx`;
  XLSX.writeFile(wb, filename);
};
