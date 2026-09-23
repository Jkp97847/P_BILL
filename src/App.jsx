import React, { useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BillingProvider, useBilling } from './context/BillingContext';
import Navbar from './components/Navbar';
import AuthPage from './components/auth/AuthPage';
import BillGenerateTab from './components/tabs/BillGenerateTab';
import ReportTab from './components/tabs/ReportTab';
import FormatEditTab from './components/tabs/FormatEditTab';
import PrintableBill from './components/PrintableBill';

function MainApp() {
  const { currentUser } = useAuth();
  const { activeTab, activePrintBill, settings, updateSettings } = useBilling();

  // If user has specific shop profile, sync when logging in
  useEffect(() => {
    if (currentUser?.profile?.shopName && settings && updateSettings) {
      // If current settings still default and user profile has different shop
      if (settings.firmName === 'श्री गणेश ट्रेडर्स' && currentUser.profile.shopName !== 'श्री गणेश ट्रेडर्स') {
        updateSettings({
          ...settings,
          firmName: currentUser.profile.shopName,
          ownerName: currentUser.profile.name || settings.ownerName,
          mobile: currentUser.profile.mobile || settings.mobile,
          address: currentUser.profile.address || settings.address
        });
      }
    }
  }, [currentUser]);

  // Project is locked behind authentication
  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <>
      {/* 1. SCREEN WRAPPER: Visible in browser, hidden when printing */}
      <div id="screen-wrapper" className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'generate' && <BillGenerateTab />}
          {activeTab === 'report' && <ReportTab />}
          {activeTab === 'format' && <FormatEditTab />}
        </main>

        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 app-footer">
          <p className="font-medium">
            स्मार्ट बिलिंग सॉफ्टवेयर • डेटा आपके कंप्यूटर ब्राउज़र में 100% सुरक्षित रहता है
          </p>
        </footer>
      </div>

      {/* 2. DEDICATED PRINT CONTAINER: Hidden on screen, visible only when printing / print preview */}
      <div id="print-container">
        {activePrintBill && (
          <PrintableBill bill={activePrintBill} settings={settings} />
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BillingProvider>
          <MainApp />
        </BillingProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
