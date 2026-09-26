import React, { useState } from 'react';
import { RechargeProvider, useRecharge } from './context/RechargeContext';
import RechargeNavbar from './components/RechargeNavbar';
import RechargeGenerateTab from './components/tabs/RechargeGenerateTab';
import RechargeReportTab from './components/tabs/RechargeReportTab';
import RechargeSettingsTab from './components/tabs/RechargeSettingsTab';
import RechargeReceiptSlip from './components/RechargeReceiptSlip';
import FirstTimeRechargeSetupModal from './components/FirstTimeRechargeSetupModal';

function RechargeAppContent({ onBackToHub }) {
  const [activeTab, setActiveTab] = useState('generate');
  const { activePrintSlip, settings, updateSettings } = useRecharge();

  const isConfigured = Boolean(settings?.isConfigured);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Mandatory Onboarding Modal if Tab 3 Details not yet filled */}
      {!isConfigured && (
        <FirstTimeRechargeSetupModal
          initialSettings={settings}
          onSave={(newSettings) => updateSettings({ ...newSettings, isConfigured: true })}
          onExit={onBackToHub}
        />
      )}
      {/* Screen Wrapper (hidden when printing) */}
      <div id="screen-wrapper" className="flex-1 flex flex-col no-print">
        <RechargeNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onBackToHub={onBackToHub}
        />

        <main className="flex-1">
          <RechargeTabErrorBoundary>
            {activeTab === 'generate' && <RechargeGenerateTab />}
            {activeTab === 'report' && <RechargeReportTab />}
            {activeTab === 'settings' && <RechargeSettingsTab />}
          </RechargeTabErrorBoundary>
        </main>
      </div>

      {/* Dedicated Print Container (rendered exclusively during window.print()) */}
      <div id="recharge-print-container" style={{ display: 'none' }}>
        {activePrintSlip && (
          <div className="p-4 flex items-center justify-center">
            <RechargeReceiptSlip
              bill={activePrintSlip}
              settings={settings}
              isPrintMode={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}

class RechargeTabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Recharge tab error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center max-w-lg mx-auto my-12 bg-white rounded-2xl border border-rose-200 shadow-md">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
            ⚠️
          </div>
          <h3 className="font-bold text-slate-900 mb-1">टैब लोड करने में समस्या आई</h3>
          <p className="text-xs text-slate-500 mb-4">{this.state.error?.message || 'अज्ञात त्रुटि'}</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            पुनः प्रयास करें (Retry)
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function RechargeApp({ onBackToHub }) {
  return (
    <RechargeProvider>
      <RechargeAppContent onBackToHub={onBackToHub} />
    </RechargeProvider>
  );
}
