import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BillingProvider, useBilling } from './context/BillingContext';
import AuthPage from './components/auth/AuthPage';
import SuperAdminPortal from './components/admin/SuperAdminPortal';
import Navbar from './components/Navbar';
import BillGenerateTab from './components/tabs/BillGenerateTab';
import PurchaseEntryTab from './components/tabs/PurchaseEntryTab';
import StockInventoryTab from './components/tabs/StockInventoryTab';
import ReportTab from './components/tabs/ReportTab';
import FormatEditTab from './components/tabs/FormatEditTab';
import PrintableBill from './components/PrintableBill';
import PrintableReport from './components/printable/PrintableReport';
import PrintableStockRegister from './components/printable/PrintableStockRegister';
import PrintablePurchaseInvoice from './components/printable/PrintablePurchaseInvoice';
import ChoicePortalHub from './components/portal/ChoicePortalHub';
import NonGstApp from './nongst/NonGstApp';
import RechargeApp from './recharge/RechargeApp';
import FirstTimeGstSetupModal from './components/modals/FirstTimeGstSetupModal';
import LogoutConfirmModal from './components/modals/LogoutConfirmModal';
import { NavigationHistoryProvider, useNavigationHistory } from './context/NavigationHistoryContext';
import { ShieldCheck } from 'lucide-react';

function MainApp() {
  const { activeTab, setActiveTab, activePrintBill, printDocument, settings, updateSettings } = useBilling();
  const { currentUser, impersonatedSeller, setSelectedModule, saveUserGstin, setActiveAdminView } = useAuth();
  const { currentRoute, navigate } = useNavigationHistory();
  const activeSeller = impersonatedSeller || currentUser;

  // Sync route tab -> activeTab when browser Back/Forward is clicked
  React.useEffect(() => {
    if (currentRoute.module === 'gst_billing' && currentRoute.tab && currentRoute.tab !== activeTab) {
      setActiveTab(currentRoute.tab);
    }
  }, [currentRoute.module, currentRoute.tab]);

  const handleSaveFirstTimeGst = (newSettings) => {
    updateSettings({
      ...newSettings,
      isConfigured: true
    });
    if (newSettings.gstin) {
      saveUserGstin(activeSeller?.id || activeSeller?.username, newSettings.gstin);
    }
  };

  const isConfigured = Boolean(settings?.isConfigured);

  return (
    <>
      {/* Mandatory Onboarding Modal if Tab 1 Firm Details not yet filled */}
      {!isConfigured && (
        <FirstTimeGstSetupModal
          initialSettings={settings}
          onSave={handleSaveFirstTimeGst}
          onExit={() => {
            setSelectedModule('hub');
            navigate({ module: 'hub' });
          }}
        />
      )}

      {/* 1. SCREEN WRAPPER: Visible in browser, hidden when printing */}
      <div id="screen-wrapper" className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'generate' && <BillGenerateTab />}
          {activeTab === 'purchase' && <PurchaseEntryTab />}
          {activeTab === 'stock' && <StockInventoryTab />}
          {activeTab === 'report' && <ReportTab />}
          {activeTab === 'format' && <FormatEditTab />}
        </main>

        {/* WEBSITE FOOTER */}
        <footer className="bg-white border-t border-slate-200 py-3.5 px-4 text-xs text-slate-500 app-footer no-print">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p className="font-medium text-slate-600">
              मोबाइल एवं इलेक्ट्रॉनिक्स शॉप बिलिंग सॉफ्टवेयर • 100% जीएसटी अनुपालन • डेटा सुरक्षित स्थानीय संग्रहण
            </p>
            <div className="flex items-center justify-center sm:justify-end gap-2 text-slate-400 text-[11px]">
              <span>संस्करण 2.4</span>
            </div>
          </div>
        </footer>
      </div>

      {/* 2. DEDICATED PRINT CONTAINER: Hidden on screen, visible only when printing */}
      <div id="print-container">
        {printDocument?.type === 'bill' && (
          <PrintableBill bill={printDocument.data || activePrintBill} settings={settings} />
        )}
        {printDocument?.type === 'report' && (
          <PrintableReport
            reportType={printDocument.reportType}
            items={printDocument.items}
            filterDate={printDocument.filterDate}
            searchTerm={printDocument.searchTerm}
            stats={printDocument.stats}
            settings={settings}
          />
        )}
        {printDocument?.type === 'stock' && (
          <PrintableStockRegister
            items={printDocument.items}
            stats={printDocument.stats}
            selectedCategory={printDocument.selectedCategory}
            stockFilter={printDocument.stockFilter}
            searchTerm={printDocument.searchTerm}
            settings={settings}
          />
        )}
        {printDocument?.type === 'purchase_invoice' && (
          <PrintablePurchaseInvoice
            purchase={printDocument.data}
            settings={settings}
          />
        )}
        {!printDocument && activePrintBill && (
          <PrintableBill bill={activePrintBill} settings={settings} />
        )}
      </div>
    </>
  );
}

function AppContent() {
  const { 
    currentUser, 
    impersonatedSeller,
    selectedModule,
    setSelectedModule,
    checkUserHasGstin,
    stopImpersonation,
    logout
  } = useAuth();
  const { currentRoute, navigate, replace } = useNavigationHistory();

  // If Super Admin backed out of an impersonated seller
  React.useEffect(() => {
    if (currentUser?.role === 'superadmin' && currentRoute.module === 'superadmin' && impersonatedSeller) {
      stopImpersonation();
    }
  }, [currentRoute.module, currentUser, impersonatedSeller, stopImpersonation]);

  // 1. Not logged in -> Show Login / Register AuthPage
  if (!currentUser) {
    return <AuthPage />;
  }

  // 2. Super Admin Access Rule:
  // - Super admin has NO direct billing facility! Super admin ALWAYS stays in SuperAdminPortal UNLESS explicitly viewing a seller's panel!
  if (currentUser.role === 'superadmin' && (!impersonatedSeller || currentRoute.module === 'superadmin')) {
    return (
      <>
        {currentRoute.module === 'auth' && (
          <LogoutConfirmModal
            user={currentUser}
            onConfirm={() => logout()}
            onCancel={() => navigate({ module: 'superadmin' })}
          />
        )}
        <SuperAdminPortal />
      </>
    );
  }

  // Active seller context: either the impersonated seller if admin, or the logged-in seller
  const activeSeller = impersonatedSeller || currentUser;
  const effectiveModule = currentRoute.module || 'hub';

  // Render billing module
  const renderModule = () => {
    // 1. Option 1: Smart GST Billing
    if (effectiveModule === 'gst_billing') {
      return (
        <BillingProvider>
          <MainApp />
        </BillingProvider>
      );
    }

    // 2. Option 2: Non GST All Only Billing
    if (effectiveModule === 'nongst_billing') {
      return <NonGstApp />;
    }

    // 3. Option 3: Recharge & Utility Bill Payment
    if (effectiveModule === 'receipt_billing') {
      return <RechargeApp onBackToHub={() => { setSelectedModule('hub'); navigate({ module: 'hub' }); }} />;
    }

    // Default to Choice Portal Hub ('hub' or fallback)
    return <ChoicePortalHub />;
  };

  return (
    <>
      {/* Logout Confirmation Modal when logged in user backs into 'auth' route from hub */}
      {currentRoute.module === 'auth' && (
        <LogoutConfirmModal
          user={activeSeller}
          onConfirm={() => {
            logout();
          }}
          onCancel={() => {
            navigate({ module: 'hub' });
          }}
        />
      )}
      {/* If Super Admin is viewing a seller's panel, show persistent top bar with Exit button */}
      {currentUser.role === 'superadmin' && impersonatedSeller && (
        <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-purple-950 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xl sticky top-0 z-50 text-xs font-bold border-b-2 border-amber-400 no-print">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              🛡️ सुपर एडमिन मोड
            </span>
            <span>
              आप वर्तमान में सेलर <strong className="text-amber-300">"{impersonatedSeller.profile?.shopName || impersonatedSeller.username}"</strong> ({impersonatedSeller.profile?.mobile || impersonatedSeller.username}) के पोर्टल में हैं।
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              stopImpersonation();
              navigate({ module: 'superadmin', tab: 'sellers' });
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
            title="सेलर पोर्टल से बाहर निकलकर वापस सुपर एडमिन कंट्रोल में जाएं"
          >
            <span>← वापस सुपर एडमिन कंट्रोल रूम (Exit to Admin)</span>
          </button>
        </div>
      )}

      {renderModule()}
    </>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-lg w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
              ⚠️
            </div>
            <h2 className="text-xl font-black text-rose-400">एप्लिकेशन लोड करने में समस्या आई</h2>
            <p className="text-xs text-slate-300">
              {this.state.error?.message || 'अज्ञात त्रुटि'}
            </p>
            <div className="pt-2 flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                पेज पुनः लोड करें (Reload)
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                सत्र रीसेट करें (Clear Session)
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <NavigationHistoryProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NavigationHistoryProvider>
    </ErrorBoundary>
  );
}
