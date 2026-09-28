import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRecharge } from '../context/RechargeContext';
import { useNavigationHistory } from '../../context/NavigationHistoryContext';
import { 
  Zap, 
  FileText, 
  Settings, 
  ArrowLeft, 
  LogOut, 
  Store, 
  ShieldCheck, 
  Lock 
} from 'lucide-react';

export default function RechargeNavbar({ activeTab, setActiveTab, onBackToHub }) {
  const { currentUser, logout, setSelectedModule, impersonatedSeller, stopImpersonation } = useAuth();
  const { settings, effectiveSeller, isSuperAdmin } = useRecharge();
  const { navigate } = useNavigationHistory();

  const handleReturnToHub = () => {
    if (onBackToHub) {
      onBackToHub();
    }
    setSelectedModule('hub');
    navigate({ module: 'hub' });
  };

  const shopTitle = settings?.shopName || effectiveSeller?.profile?.shopName || 'स्मार्ट रिचार्ज केंद्र';
  const roleName = isSuperAdmin ? 'सुपर एडमिन (Master Admin)' : 'अधिकृत विक्रेता (Seller)';

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back to Hub + Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReturnToHub}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition-all shadow-sm"
            title="सभी 4 मॉड्यूल्स के मुख्य हब पर लौटें"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>मुख्य पोर्टल (Hub)</span>
          </button>

          <div className="h-6 w-px bg-slate-700 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
                ⚡
              </span>
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                3. Recharge & Utility Bill Payment
              </h1>
              <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full hidden md:inline-block">
                Option 3
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              विद्युत डिस्कॉम बिल, मोबाइल रिचार्ज, लैंडलाइन व बीमा प्रीमियम भुगतान पोर्टल
            </p>
          </div>
        </div>

        {/* Right: Seller Badge & Logout */}
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-inner">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
              <Store className="w-4 h-4" />
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="font-black text-slate-100 truncate max-w-[150px] sm:max-w-[200px]">
                {shopTitle}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className={`font-semibold ${isSuperAdmin ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {roleName}
                </span>
              </div>
            </div>
          </div>

          {currentUser?.role === 'superadmin' && impersonatedSeller && (
            <button
              type="button"
              onClick={() => {
                stopImpersonation();
                navigate({ module: 'superadmin', tab: 'sellers' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              title="वापस सुपर एडमिन कंट्रोल रूम में लौटें"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
              <span>वापस एडमिन</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (window.confirm('क्या आप लॉगआउट करना चाहते हैं?')) {
                logout();
                navigate({ module: 'auth', authTab: 'login' });
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
            title="सिस्टम से सुरक्षित लॉगआउट करें"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">लॉगआउट</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('generate');
              navigate({ module: 'receipt_billing', tab: 'generate' });
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'generate'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1. नया बिल / रिचार्ज (Bill Generator)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('report');
              navigate({ module: 'receipt_billing', tab: 'report' });
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'report'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>2. रिपोर्ट व लेजर (Transactions & Report)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('settings');
              navigate({ module: 'receipt_billing', tab: 'settings' });
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>3. सेटिंग्स व सुविधा शुल्क (Settings & Fees)</span>
          </button>
        </div>
      </div>
    </header>
  );
}
