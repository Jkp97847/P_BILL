import React, { useState } from 'react';
import { RechargeProvider, useRecharge } from './context/RechargeContext';
import RechargeNavbar from './components/RechargeNavbar';
import RechargeGenerateTab from './components/tabs/RechargeGenerateTab';
import RechargeReportTab from './components/tabs/RechargeReportTab';
import RechargeSettingsTab from './components/tabs/RechargeSettingsTab';
import RechargeReceiptSlip from './components/RechargeReceiptSlip';

function RechargeAppContent({ onBackToHub }) {
  const [activeTab, setActiveTab] = useState('generate');
  const { activePrintSlip, settings } = useRecharge();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Screen Wrapper (hidden when printing) */}
      <div id="screen-wrapper" className="flex-1 flex flex-col no-print">
        <RechargeNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onBackToHub={onBackToHub}
        />

        <main className="flex-1">
          {activeTab === 'generate' && <RechargeGenerateTab />}
          {activeTab === 'report' && <RechargeReportTab />}
          {activeTab === 'settings' && <RechargeSettingsTab />}
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

export default function RechargeApp({ onBackToHub }) {
  return (
    <RechargeProvider>
      <RechargeAppContent onBackToHub={onBackToHub} />
    </RechargeProvider>
  );
}
