import React from 'react';
import { NonGstToastProvider } from './context/NonGstToastContext';
import { NonGstBillingProvider, useBilling } from './context/NonGstBillingContext';
import { useAuth } from '../context/AuthContext';
import NonGstNavbar from './components/NonGstNavbar';
import NonGstBillGenerateTab from './components/tabs/NonGstBillGenerateTab';
import NonGstReportTab from './components/tabs/NonGstReportTab';
import NonGstFormatEditTab from './components/tabs/NonGstFormatEditTab';
import NonGstPrintableBill from './components/NonGstPrintableBill';
import PrintableReport from '../components/printable/PrintableReport';
import FirstTimeNonGstSetupModal from './components/FirstTimeNonGstSetupModal';

import { useNavigationHistory } from '../context/NavigationHistoryContext';

function NonGstMain() {
  const { setSelectedModule } = useAuth();
  const { activeTab, setActiveTab, activePrintBill, printDocument, settings, updateSettings } = useBilling();
  const { currentRoute, navigate } = useNavigationHistory();

  // Sync route tab -> activeTab when browser Back/Forward is clicked
  React.useEffect(() => {
    if (currentRoute.module === 'nongst_billing' && currentRoute.tab && currentRoute.tab !== activeTab) {
      setActiveTab(currentRoute.tab);
    }
  }, [currentRoute.module, currentRoute.tab, activeTab, setActiveTab]);

  const isConfigured = Boolean(settings?.isConfigured);

  return (
    <>
      {/* Mandatory Onboarding Modal if Tab 2 Firm Details not yet filled */}
      {!isConfigured && (
        <FirstTimeNonGstSetupModal
          initialSettings={settings}
          onSave={(newSettings) => updateSettings({ ...newSettings, isConfigured: true })}
          onExit={() => {
            setSelectedModule('hub');
            navigate({ module: 'hub' });
          }}
        />
      )}

      {/* 1. SCREEN WRAPPER: Visible in browser, hidden when printing */}
      <div id="screen-wrapper" className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
        <NonGstNavbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'generate' && <NonGstBillGenerateTab />}
          {activeTab === 'report' && <NonGstReportTab />}
          {activeTab === 'format' && <NonGstFormatEditTab />}
        </main>

        <footer className="bg-white border-t border-slate-200 py-3.5 px-4 text-center text-xs text-slate-500 app-footer no-print">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p className="font-medium text-slate-600">
              स्मार्ट नॉन-जीएसटी रिटेल व जनरल बिलिंग • डेटा आपके कंप्यूटर ब्राउज़र में 100% सुरक्षित रहता है
            </p>
            <span className="text-[11px] text-slate-400">मॉड्यूल 2: Non GST All Only Billing</span>
          </div>
        </footer>
      </div>

      {/* 2. DEDICATED PRINT CONTAINER: Hidden on screen, visible only when printing */}
      <div id="print-container">
        {printDocument?.type === 'bill' && (
          <NonGstPrintableBill bill={printDocument.bill || activePrintBill} settings={settings} />
        )}
        {printDocument?.type === 'report' && (
          <PrintableReport
            reportType="nongst_sales"
            items={printDocument.items}
            filterDate={printDocument.filterDate}
            searchTerm={printDocument.searchTerm}
            stats={printDocument.stats}
            isYearly={printDocument.isYearly}
            settings={{
              shopName: settings.firmName,
              tagline: settings.tagline,
              address: settings.address,
              city: settings.city,
              state: settings.state,
              phone: settings.mobile,
              email: settings.email,
              gstin: settings.gstin
            }}
          />
        )}
        {!printDocument && activePrintBill && (
          <NonGstPrintableBill bill={activePrintBill} settings={settings} />
        )}
      </div>
    </>
  );
}

export default function NonGstApp() {
  return (
    <NonGstToastProvider>
      <NonGstBillingProvider>
        <NonGstMain />
      </NonGstBillingProvider>
    </NonGstToastProvider>
  );
}
