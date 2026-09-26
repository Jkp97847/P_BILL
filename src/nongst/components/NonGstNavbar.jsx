import React, { useState } from 'react';
import { useBilling } from '../context/NonGstBillingContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../context/NonGstToastContext';
import { useNavigationHistory } from '../../context/NavigationHistoryContext';
import { 
  FilePlus2, 
  FileSpreadsheet, 
  Palette, 
  ReceiptText, 
  KeyRound, 
  LogOut, 
  ShieldCheck, 
  User,
  LayoutGrid,
  ArrowRightLeft
} from 'lucide-react';

export default function NonGstNavbar() {
  const { activeTab, setActiveTab, settings, bills } = useBilling();
  const { currentUser, logout, setSelectedModule, impersonatedSeller, stopImpersonation } = useAuth();
  const { navigate } = useNavigationHistory();
  const { showToast } = useToast();

  const [changePassOpen, setChangePassOpen] = useState(false);
  const [adminPortalOpen, setAdminPortalOpen] = useState(false);

  const tabs = [
    {
      id: 'generate',
      label: 'बिल बनाएं (Bill Generate)',
      icon: FilePlus2,
      badge: null,
      desc: 'नया बिल बनाएं व प्रिंट करें'
    },
    {
      id: 'report',
      label: 'रिपोर्ट / एडिट व दोबारा प्रिंट (Report / Edit / Print)',
      icon: FileSpreadsheet,
      badge: bills.length > 0 ? bills.length : null,
      desc: 'पुराने बिल देखें, एडिट करें व री-प्रिंट करें'
    },
    {
      id: 'format',
      label: 'बिल फॉर्मेट एडिट (Bill Format Edit)',
      icon: Palette,
      badge: null,
      desc: 'फर्म नाम, लोगो, नियम व हेडर बदलें'
    }
  ];

  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Brand & Top Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between py-3 border-b border-slate-100 gap-3">
            {/* Left: Brand info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
                <ReceiptText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {settings.firmName || 'बिलिंग सॉफ्टवेयर'}
                  </h1>
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">
                    ॥ श्री गणेशाय नमः ॥
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {settings.tagline || 'आसान इनवॉइस और बिलिंग सिस्टम'}
                </p>
              </div>
            </div>

            {/* Right: User status, Admin controls, Password Change, Logout */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* User Profile Badge */}
              <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-800 font-medium">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-bold">{currentUser?.profile?.name || currentUser?.username}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  isAdmin ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {isAdmin ? 'व्यवस्थापक' : 'यूजर'}
                </span>
              </div>

              {/* Module Indicator Badge */}
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg font-black text-[11px]">
                <span>2. Non-GST Retail</span>
              </span>

              {/* Hub / Choice Selector Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedModule('hub');
                  navigate({ module: 'hub' });
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors cursor-pointer"
                title="स्मार्ट बिलिंग मुख्य हब (Choice Portal) पर वापस जाएं"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>🏠 चेंज बिलिंग मोड (Hub)</span>
              </button>

              {/* Direct Switch to GST Billing */}
              <button
                type="button"
                onClick={() => {
                  setSelectedModule('gst_billing');
                  navigate({ module: 'gst_billing', tab: 'generate' });
                }}
                className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                title="Smart GST Billing सॉफ्टवेयर पर जाएं"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-700" />
                <span>GST बिलिंग</span>
              </button>

              {/* Admin Return Button (Only when Super Admin is viewing seller panel) */}
              {currentUser?.role === 'superadmin' && impersonatedSeller && (
                <button
                  type="button"
                  onClick={() => {
                    stopImpersonation();
                    navigate({ module: 'superadmin', tab: 'sellers' });
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold transition-colors cursor-pointer text-xs"
                  title="वापस सुपर एडमिन कंट्रोल पैनल में लौटें"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>वापस एडमिन</span>
                </button>
              )}

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('क्या आप लॉगआउट करना चाहते हैं?')) {
                    logout();
                    navigate({ module: 'auth', authTab: 'login' });
                    showToast('info', 'आप सुरक्षित रूप से लॉगआउट हो गए हैं।', 'लॉगआउट');
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold transition-colors cursor-pointer"
                title="सॉफ्टवेयर से लॉगआउट करें"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>लॉगआउट</span>
              </button>
            </div>
          </div>

          {/* 3 Main Tabs Navigation */}
          <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto tabs-nav">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    navigate({ module: 'nongst_billing', tab: tab.id });
                  }}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== null && (
                    <span
                      className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-white text-indigo-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}
