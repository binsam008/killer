import React, { Suspense, lazy, useEffect, useState } from 'react';
import Header from './components/Header';
import DataInputTab from './components/DataInputTab';
import PrintableQuotation from './components/PrintableQuotation';

const DashboardTab = lazy(() => import('./components/DashboardTab'));
const ComparisonTab = lazy(() => import('./components/ComparisonTab'));

import { calculateKPIs, getPricingRecommendation } from './utils/calculations';

import { exportToExcel } from './utils/excelExport';
import { CheckSquare, Presentation, ClipboardList } from 'lucide-react';

// Centralized dynamic data helper to keep initial load and resets consistent
const generateQuotationMeta = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
  
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);
  const validUntilDate = expiry.toISOString().split('T')[0];

  return {
    refNo: `WRL-${year}${month}${day}-${randomSuffix}`,
    date: `${year}-${month}-${day}`,
    dateQuoted: `${year}-${month}-${day}`,
    validUntil: validUntilDate,
  };
};

const initialSampleData = {
  shipment: {
    customerName: 'Apex Logistics GCC',
    customerContact: 'John Smith (+971 50 123 4567)',
    customerEmail: 'operations@apexlogistics.ae',
    origin: 'Shanghai Port, China (CNSHA)',
    destination: 'Jebel Ali Port, Dubai, UAE (AEJEA)',
    incoterm: 'FOB',
    goodsDescription: 'Industrial Machinery Components',
    weight: 12500,
    volume: 28.5,
    shipmentType: 'FCL',
    modeOfTransport: 'Sea'
  },
  agent: {
    sea_freight: { exw: '', freight: 2800, fob: 200, other: 150 },
    air_freight: { exw: '', freight: '', fob: '', other: '' },
    road_freight: { exw: '', freight: '', fob: '', other: '' },
    customs_clearance: { exw: '', freight: '', fob: '', other: 250 },
    insurance: { exw: '', freight: '', fob: '', other: 120 },
    warehousing: { exw: '', freight: '', fob: '', other: 300 },
    other_charges: { exw: '', freight: '', fob: '', other: 100 }
  },
  customer: {
    sea_freight: { exw: '', freight: 3500, fob: 250, other: 200 },
    air_freight: { exw: '', freight: '', fob: '', other: '' },
    road_freight: { exw: '', freight: '', fob: '', other: '' },
    customs_clearance: { exw: '', freight: '', fob: '', other: 350 },
    insurance: { exw: '', freight: '', fob: '', other: 180 },
    warehousing: { exw: '', freight: '', fob: '', other: 450 },
    other_charges: { exw: '', freight: '', fob: '', other: 150 }
  }
};

export default function App() {
  const [quotationInfo, setQuotationInfo] = useState({
    refNo: '',
    date: '',
    validUntil: '',
    dateQuoted: '',
    salesPerson: 'Sarah Jenkins',
    currency: 'USD',
    preparedBy: 'Sarah Jenkins',
    reviewedBy: 'David Miller',
    approvedBy: 'Hassan Al-Sayegh',
    logo: '',
    printSummaryOnly: false
  });

  const [shipmentInfo, setShipmentInfo] = useState(initialSampleData.shipment);
  
  const [agents, setAgents] = useState([
    { id: 'agent_1', name: 'Primary Agent', data: initialSampleData.agent }
  ]);
  const [selectedAgentId, setSelectedAgentId] = useState('agent_1');
  const [customerData, setCustomerData] = useState(initialSampleData.customer);
  const [activeTab, setActiveTab] = useState('input');

  const activeAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
  const agentData = activeAgent.data;

  const setAgentData = (newDataOrFunc) => {
    setAgents((prevAgents) => {
      return prevAgents.map((agent) => {
        if (agent.id === selectedAgentId) {
          const updatedData = typeof newDataOrFunc === 'function' ? newDataOrFunc(agent.data) : newDataOrFunc;
          return { ...agent, data: updatedData };
        }
        return agent;
      });
    });
  };

  useEffect(() => {
    setQuotationInfo((prev) => ({
      ...prev,
      ...generateQuotationMeta()
    }));
  }, []);

  const handleExport = () => {
    const kpis = calculateKPIs(agentData, customerData);
    const recommendation = getPricingRecommendation(kpis.marginPercent);
    exportToExcel(quotationInfo, shipmentInfo, agentData, customerData, kpis, null, recommendation);
  };

  const handleReset = () => {
    const freshMeta = generateQuotationMeta();
    
    setQuotationInfo({
      ...freshMeta,
      salesPerson: '',
      currency: 'USD',
      preparedBy: '',
      reviewedBy: '',
      approvedBy: '',
      logo: '',
      printSummaryOnly: false
    });

    setShipmentInfo({
      customerName: '',
      customerContact: '',
      customerEmail: '',
      origin: '',
      destination: '',
      incoterm: 'EXW',
      goodsDescription: '',
      weight: '',
      volume: '',
      shipmentType: 'LCL',
      modeOfTransport: 'Sea'
    });

    const blankChargesTemplate = {
      sea_freight: { exw: '', freight: '', fob: '', other: '' },
      air_freight: { exw: '', freight: '', fob: '', other: '' },
      road_freight: { exw: '', freight: '', fob: '', other: '' },
      customs_clearance: { exw: '', freight: '', fob: '', other: '' },
      insurance: { exw: '', freight: '', fob: '', other: '' },
      warehousing: { exw: '', freight: '', fob: '', other: '' },
      other_charges: { exw: '', freight: '', fob: '', other: '' }
    };

    setAgents([
      { id: 'agent_1', name: 'Primary Agent', data: blankChargesTemplate }
    ]);
    setSelectedAgentId('agent_1');
    setCustomerData(blankChargesTemplate);
    setActiveTab('input');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* 1. Screen Interactive Dashboard Layout */}
      <div className="min-h-screen bg-brand-app text-brand-text max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 no-print">
        <Header
          quotationRef={quotationInfo.refNo}
          onExport={handleExport}
          onReset={handleReset}
          onPrint={handlePrint}
        />

        <nav className="flex p-1 bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl max-w-3xl self-center sm:self-start w-full sm:w-auto">
          {[
            { id: 'input', label: 'DATA INPUT', icon: <ClipboardList size={15} /> },
            { id: 'dashboard', label: 'MANAGEMENT DASHBOARD', icon: <Presentation size={15} /> },
            { id: 'comparison', label: 'COMPARISON ANALYSIS', icon: <CheckSquare size={15} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-zinc-900 text-brand-accent shadow-sm border border-zinc-200/50 dark:border-zinc-800'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <main className="flex flex-col gap-6">
          {activeTab === 'input' && (
            <DataInputTab
              quotationInfo={quotationInfo}
              setQuotationInfo={setQuotationInfo}
              shipmentInfo={shipmentInfo}
              setShipmentInfo={setShipmentInfo}
              agentData={agentData}
              setAgentData={setAgentData}
              customerData={customerData}
              setCustomerData={setCustomerData}
              agents={agents}
              setAgents={setAgents}
              selectedAgentId={selectedAgentId}
              setSelectedAgentId={setSelectedAgentId}
            />
          )}

          <Suspense fallback={<div className="py-12 text-center text-sm text-brand-text-muted">Loading...</div>}>
            {activeTab === 'dashboard' && (
              <DashboardTab
                agentData={agentData}
                customerData={customerData}
                currency={quotationInfo.currency}
              />
            )}

            {activeTab === 'comparison' && (
              <ComparisonTab
                agentData={agentData}
                customerData={customerData}
                currency={quotationInfo.currency}
              />
            )}
          </Suspense>
        </main>

        <footer className="mt-auto py-8 border-t border-brand-border text-center text-xs text-brand-text-muted flex flex-col gap-1.5">
          <p>
            &copy; {new Date().getFullYear()} <strong className="text-brand-text font-semibold">Well Reach Logistics</strong>. GCC Logistics Solutions | Freight Forwarding | Customs Clearance | Warehousing.
          </p>
          <p className="text-[10px] opacity-75">
            Developed as a Professional Quotation & Profitability Analysis tool.
          </p>
        </footer>
      </div>

      <PrintableQuotation
        quotationInfo={quotationInfo}
        shipmentInfo={shipmentInfo}
        customerData={customerData}
      />
    </>
  );
}