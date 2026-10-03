import React, { useEffect } from 'react';
import { useBilling } from '../context/BillingContext';
import { useAuth } from '../context/AuthContext';
import { useNavigationHistory } from '../context/NavigationHistoryContext';
import { 
  FilePlus2, 
  Truck, 
  Boxes, 
  FileSpreadsheet, 
  Settings as SettingsIcon, 
  ReceiptText,
  LogOut,
  ShieldCheck,
  User,
  ArrowLeft,
  LayoutGrid,
  ArrowRightLeft
} from 'lucide-react';

export default function Navbar() {
  const { activeTab, setActiveTab, settings, gstBills, purchases, inventory } = useBilling();
  const { 
    currentUser, 
    activeSeller, 
    impersonatedSeller, 
    stopImpersonation, 
    logout, 
    setActiveAdminView,
    setSelectedModule
  } = useAuth();
  const { navigate } = useNavigationHistory();

  // 5 Tabs in User-Specified Order:
  // 1st SALE, 2nd PURCHAGE, 3rd REPORT, 4th STOCK, 5th SETTING
  const tabs = [
    {
      id: 'generate',
      label: 'SALE',
      hotkey: 'F1',
      icon: FilePlus2,
      badge: null
    },
    {
      id: 'purchase',
      label: 'PURCHAGE',
      hotkey: 'F2',
      icon: Truck,
      badge: null
    },
    {
      id: 'report',
      label: 'REPORT',
      hotkey: 'F3',
      icon: FileSpreadsheet,
      badge: null
    },
    {
      id: 'stock',
      label: 'STOCK',
      hotkey: 'F4',
      icon: Boxes,
      badge: null
    },
    {
      id: 'format',
      label: 'SETTING',
      hotkey: 'F5',
      icon: SettingsIcon,
      badge: '10 Themes'
    }
  ];

  // Global Keyboard Shortcuts (F1 to F5)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('generate');
        navigate({ module: 'gst_billing', tab: 'generate' });
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('purchase');
        navigate({ module: 'gst_billing', tab: 'purchase' });
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('report');
        navigate({ module: 'gst_billing', tab: 'report' });
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('stock');
        navigate({ module: 'gst_billing', tab: 'stock' });
      } else if (e.key === 'F5') {
        e.preventDefault();
        setActiveTab('format');
        navigate({ module: 'gst_billing', tab: 'format' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab, navigate]);

  const activeFirmTitle = settings.firmName || activeSeller?.profile?.shopName || 'मोबाइल शॉप बिलिंग सॉफ्टवेयर';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print app-header">
      {/* Super Admin Impersonation Notice Bar */}
      {impersonatedSeller && (
        <div className="bg-purple-900 text-white text-xs px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 font-bold shadow-inner">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-300 shrink-0" />
            <span>
              👑 सुपर एडमिन सहायता मोड: आप वर्तमान में सेलर <u>{impersonatedSeller.profile?.shopName}</u> ({impersonatedSeller.username}) का डेटा देख रहे हैं।
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              stopImpersonation();
              navigate({ module: 'superadmin', tab: 'sellers' });
            }}
            className="flex items-center gap-1 bg-purple-700 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>एडमिन पोर्टल पर लौटें</span>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand & Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-100 gap-2">
          {/* Left: Brand & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
              <ReceiptText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">
                  {activeFirmTitle}
                </h1>
                {settings.showGaneshLogo && (
                  <span className="text-[10px] bg-red-50 text-red-700 font-bold px-1.5 py-0.5 rounded border border-red-100">
                    ॥ श्री गणेशाय नमः ॥
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {settings.tagline || 'मोबाइल, बैटरी, ईयरफोन व एसेसरीज बिलिंग एवं स्टॉक मैनेजमेंट'}
              </p>
            </div>
          </div>

          {/* Right: Phone, GSTIN, Safe Badge, User & Logout */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {(settings.mobile || activeSeller?.profile?.mobile1) && (
              <span className="hidden md:inline bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 font-medium">
                📞 {settings.mobile || activeSeller?.profile?.mobile1}
              </span>
            )}
            {(settings.gstin || activeSeller?.profile?.gstin) && (
              <span className="hidden lg:inline bg-indigo-50 text-indigo-900 px-2.5 py-1 rounded-md border border-indigo-200 font-mono font-bold">
                GSTIN: {settings.gstin || activeSeller?.profile?.gstin}
              </span>
            )}
            <span className="hidden sm:inline bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-md border border-emerald-200">
              ● 100% ऑफ़लाइन सुरक्षित
            </span>

            {/* Module Indicator Badge */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-900 border border-indigo-300 rounded-lg font-black text-[11px]">
              <span>1. Smart GST Billing</span>
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

            {/* Direct Switch to Non-GST Billing */}
            <button
              type="button"
              onClick={() => {
                setSelectedModule('nongst_billing');
                navigate({ module: 'nongst_billing', tab: 'generate' });
              }}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-xs transition-colors cursor-pointer"
              title="Non GST Retail Billing सॉफ्टवेयर पर जाएं"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-700" />
              <span>Non-GST बिलिंग</span>
            </button>

            {currentUser?.role === 'superadmin' && impersonatedSeller && (
              <button
                type="button"
                onClick={() => {
                  stopImpersonation();
                  navigate({ module: 'superadmin', tab: 'sellers' });
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded-lg border border-amber-300 transition-colors cursor-pointer text-xs"
                title="वापस सुपर एडमिन कंट्रोल रूम में लौटें"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>वापस एडमिन</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-semibold">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span className="truncate max-w-[140px]" title={activeSeller?.profile?.ownerName || currentUser?.username}>
                {activeSeller?.profile?.ownerName || currentUser?.username}
              </span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.2 rounded border border-indigo-200">
                {currentUser?.role === 'superadmin' ? 'Master Admin' : 'सेलर'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('क्या आप लॉगआउट करना चाहते हैं?')) {
                  logout();
                  navigate({ module: 'auth', authTab: 'login' });
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition-colors cursor-pointer"
              title="लॉगआउट करें"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>

        {/* 5 Tabs Navigation (SALE, SALE REPORT, PURCHAGE, STOCK REPORT, SETTING) */}
        <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto tabs-nav">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  navigate({ module: 'gst_billing', tab: tab.id });
                }}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
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
  );
}
