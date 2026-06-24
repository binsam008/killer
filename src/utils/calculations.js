/**
 * Calculations for Well Reach Logistics Profitability Dashboard
 */

export const FREIGHT_CATEGORIES = [
  { id: 'sea_freight', label: 'Sea Freight' },
  { id: 'air_freight', label: 'Air Freight' },
  { id: 'road_freight', label: 'Road Freight' },
  { id: 'customs_clearance', label: 'Customs Clearance' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'warehousing', label: 'Warehousing' },
  { id: 'other_charges', label: 'Other Charges' }
];

export const CURRENCY_SYMBOLS = {
  USD: '$',
  BHD: 'BD ',
  AED: 'Dhs ',
  SAR: 'SR ',
  QAR: 'QR ',
  OMR: 'RO ',
  KWD: 'KD ',
  INR: '₹'
};

/**
 * Sum fields of a row
 */
export const calculateRowTotal = (row) => {
  if (!row) return 0;
  return (
    Number(row.exw || 0) +
    Number(row.freight || 0) +
    Number(row.fob || 0) +
    Number(row.other || 0)
  );
};

/**
 * Calculate totals for a full sheet (Agent or Customer)
 */
export const calculateSheetTotals = (sheetData) => {
  const categoryTotals = {};
  let totalEXW = 0;
  let totalFreight = 0;
  let totalFOB = 0;
  let totalOther = 0;
  let grandTotal = 0;

  FREIGHT_CATEGORIES.forEach((cat) => {
    const row = sheetData[cat.id] || { exw: 0, freight: 0, fob: 0, other: 0 };
    const rowTotal = calculateRowTotal(row);
    categoryTotals[cat.id] = rowTotal;
    
    totalEXW += Number(row.exw || 0);
    totalFreight += Number(row.freight || 0);
    totalFOB += Number(row.fob || 0);
    totalOther += Number(row.other || 0);
    grandTotal += rowTotal;
  });

  return {
    categoryTotals,
    totalEXW,
    totalFreight,
    totalFOB,
    totalOther,
    grandTotal
  };
};

/**
 * Calculate Dashboard KPIs
 */
export const calculateKPIs = (agentData, customerData) => {
  const agentTotals = calculateSheetTotals(agentData);
  const customerTotals = calculateSheetTotals(customerData);

  const cost = agentTotals.grandTotal;
  const revenue = customerTotals.grandTotal;
  const profit = revenue - cost;
  const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;

  return {
    cost,
    revenue,
    profit,
    marginPercent
  };
};

/**
 * Margin Formatting & Colors
 * Green: Margin > 15%
 * Amber: Margin between 5% and 15%
 * Red: Margin < 5%
 */
export const getMarginColorClass = (marginPercent) => {
  if (marginPercent > 15) return 'margin-green';
  if (marginPercent >= 5) return 'margin-amber';
  return 'margin-red';
};

/**
 * Target Margin Analysis
 * Revenue Required = Cost / (1 - Target%)
 */
export const calculateTargetMarginAnalysis = (totalCost) => {
  const targets = [0.05, 0.10, 0.15];
  return targets.map((target) => {
    const revRequired = totalCost / (1 - target);
    const profitRequired = revRequired - totalCost;
    return {
      percentage: target * 100,
      revenueRequired: totalCost > 0 ? revRequired : 0,
      profitRequired: totalCost > 0 ? profitRequired : 0
    };
  });
};

/**
 * Pricing recommendation text and class based on Margin %
 */
export const getPricingRecommendation = (marginPercent) => {
  if (marginPercent < 5) {
    return {
      status: '❌ Low Margin',
      description: 'The current margin is below the 5% minimum threshold. Pricing needs immediate adjustment.',
      colorClass: 'pricing-danger'
    };
  } else if (marginPercent <= 15) {
    return {
      status: '⚠️ Acceptable',
      description: 'The current margin is in the acceptable 5% to 15% range. Monitor cost fluctuations closely.',
      colorClass: 'pricing-warning'
    };
  } else {
    return {
      status: '✅ Excellent Margin',
      description: 'The current margin exceeds 15%. This quotation has high profitability and is recommended for approval.',
      colorClass: 'pricing-success'
    };
  }
};

/**
 * Format helper for numbers
 */
export const formatNum = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0);
};

/**
 * Format currency string
 */
export const formatCurrency = (val, currencyCode = 'USD') => {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || '$';
  return `${symbol}${formatNum(val)}`;
};
