import React, { useState } from 'react';
import { useBilling } from '../context/BillingContext';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from './auth/ChangePasswordModal';
import AdminPortalModal from './admin/AdminPortalModal';
import { 
  FilePlus2, 
  FileSpreadsheet, 
  Palette, 
  ReceiptText, 
  KeyRound, 
  LogOut, 
  ShieldCheck, 
  User 
} from 'lucide-react';

export default function Navbar() {
  const { activeTab, setActiveTab, settings, bills } = useBilling();
  const { currentUser, logout } = useAuth();

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

              {/* Admin Portal Button (Admin only) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setAdminPortalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold transition-colors cursor-pointer"
                  title="एडमिन कंट्रोल पैनल खोलें"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>एडमिन पैनल</span>
                </button>
              )}

              {/* Change Password Button */}
              <button
                type="button"
                onClick={() => setChangePassOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold transition-colors cursor-pointer"
                title="अपना पासवर्ड बदलें"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span>पासवर्ड बदलें</span>
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
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
                  onClick={() => setActiveTab(tab.id)}
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

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePassOpen}
        onClose={() => setChangePassOpen(false)}
      />

      {/* Admin Portal Modal */}
      {isAdmin && (
        <AdminPortalModal
          isOpen={adminPortalOpen}
          onClose={() => setAdminPortalOpen(false)}
        />
      )}
    </>
  );
}
