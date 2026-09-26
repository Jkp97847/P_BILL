import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigationHistory } from '../../context/NavigationHistoryContext';
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Clock, 
  UserX, 
  Search, 
  KeyRound, 
  Edit3, 
  Power, 
  Trash2, 
  Eye, 
  LogOut, 
  Building2, 
  Phone, 
  Mail, 
  CreditCard, 
  MapPin, 
  Check, 
  X, 
  AlertCircle,
  Download,
  Settings2,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';

export default function SuperAdminPortal() {
  const { 
    users, 
    currentUser, 
    logout, 
    approveSeller, 
    rejectSeller, 
    toggleUserStatus, 
    resetUserPassword, 
    updateSellerProfile, 
    startImpersonation,
    platformConfig,
    updatePlatformConfig,
    updateUserModules,
    setSelectedModule,
    setActiveAdminView
  } = useAuth();
  const { navigate } = useNavigationHistory();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'pending' | 'disabled'
  const [activeTab, setActiveTab] = useState('sellers'); // 'sellers' | 'pending' | 'settings'

  // Modals state
  const [editingSeller, setEditingSeller] = useState(null);
  const [passwordModalSeller, setPasswordModalSeller] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Only consider seller accounts (exclude superadmin itself from standard seller list)
  const sellers = users.filter(u => u.role === 'seller');

  const pendingSellers = sellers.filter(u => u.status === 'pending');
  const approvedSellers = sellers.filter(u => u.status === 'approved');
  const disabledSellers = sellers.filter(u => u.status === 'disabled');

  // Filtered sellers
  const filteredSellers = sellers.filter(seller => {
    const matchesStatus = statusFilter === 'all' || seller.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
      seller.username.toLowerCase().includes(term) ||
      seller.profile?.shopName?.toLowerCase().includes(term) ||
      seller.profile?.ownerName?.toLowerCase().includes(term) ||
      seller.profile?.mobile?.includes(term) ||
      seller.profile?.gstin?.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  // Handle Edit Save
  const handleSaveProfileEdit = (e) => {
    e.preventDefault();
    if (!editingSeller) return;
    updateSellerProfile(editingSeller.id, editingSeller.profile);
    setEditingSeller(null);
    showNotification('success', `सेलर "${editingSeller.profile.shopName}" का विवरण सफलतापूर्वक अपडेट हुआ!`);
  };

  // Handle Password Reset
  const handleSavePasswordReset = (e) => {
    e.preventDefault();
    if (!passwordModalSeller) return;
    if (!newPassword || newPassword.length < 6) {
      showNotification('error', 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए!');
      return;
    }
    resetUserPassword(passwordModalSeller.id, newPassword);
    setPasswordModalSeller(null);
    setNewPassword('');
    showNotification('success', `सेलर "${passwordModalSeller.username}" का नया पासवर्ड सेट कर दिया गया!`);
  };

  // Handle Export Platform Backup
  const handleExportAll = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      exportedBy: currentUser?.username || 'superadmin',
      platformConfig,
      users: users.map(u => ({
        ...u,
        dataBackup: {
          settings: localStorage.getItem(`mobile_billing_settings_${u.id}`),
          inventory: localStorage.getItem(`mobile_billing_inventory_${u.id}`),
          purchases: localStorage.getItem(`mobile_billing_purchases_${u.id}`),
          gstBills: localStorage.getItem(`mobile_billing_gst_bills_${u.id}`)
        }
      }))
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `platform_superadmin_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('success', 'सभी सेलर व प्लेटफ़ॉर्म का फुल बैकअप डाउनलोड हो गया!');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* 1. TOP HEADER */}
      <header className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/30 border border-purple-400 flex items-center justify-center text-purple-200">
              <ShieldCheck className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight uppercase">
                  सुपर एडमिन कंट्रोल पोर्टल (Super Admin Portal)
                </h1>
                <span className="text-[10px] bg-purple-500 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  MASTER ADMIN
                </span>
              </div>
              <p className="text-xs text-purple-200">
                समस्त पंजीकृत सेलर, यूजर अप्रूवल, पासवर्ड प्रबंधन व सुरक्षा नियंत्रण
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-800/80 hover:bg-purple-700 text-white text-xs font-bold rounded-lg border border-purple-500 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>फुल डेटा बैकअप</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. NOTIFICATION BANNER */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div
            className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-bold shadow-sm ${
              notification.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 3. OVERVIEW METRICS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 block">कुल पंजीकृत सेलर</span>
              <span className="text-xl font-black text-slate-900">{sellers.length}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 block">सक्रिय (Approved) सेलर</span>
              <span className="text-xl font-black text-emerald-700">{approvedSellers.length}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 block">पेंडिंग अनुमोदन</span>
              <span className="text-xl font-black text-amber-700">{pendingSellers.length}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 block">निष्क्रिय (Disabled)</span>
              <span className="text-xl font-black text-rose-700">{disabledSellers.length}</span>
            </div>
          </div>
        </div>

        {/* 4. SUB-TAB BUTTONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('sellers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sellers'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              1. सभी सेलर प्रबंधन ({sellers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                activeTab === 'pending'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              2. पेंडिंग अप्रूवल
              {pendingSellers.length > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {pendingSellers.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              3. प्लेटफ़ॉर्म सेटिंग्स
            </button>
          </div>

          {/* Search bar when viewing sellers */}
          {activeTab === 'sellers' && (
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="दुकान, यूजर, फोन, GST..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 1: ALL SELLERS DIRECTORY */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'sellers' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Status Filter Chips */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">स्थिति फ़िल्टर:</span>
                {['all', 'approved', 'pending', 'disabled'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all' && `सभी (${sellers.length})`}
                    {st === 'approved' && `सक्रिय (${approvedSellers.length})`}
                    {st === 'pending' && `पेंडिंग (${pendingSellers.length})`}
                    {st === 'disabled' && `निष्क्रिय (${disabledSellers.length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Sellers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-3 w-10">#</th>
                    <th className="py-3 px-3">दुकान / फर्म का नाम व मालिक</th>
                    <th className="py-3 px-3">यूजरनेम</th>
                    <th className="py-3 px-3">संपर्क (Mobile / Email)</th>
                    <th className="py-3 px-3">GSTIN व बैंक विवरण</th>
                    <th className="py-3 px-3 text-center">स्थिति</th>
                    <th className="py-3 px-3 text-center">सक्रिय मॉड्यूल्स (4 Tabs)</th>
                    <th className="py-3 px-3 text-center w-52">सुपर एडमिन एक्शन</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSellers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        कोई सेलर खाता नहीं मिला।
                      </td>
                    </tr>
                  ) : (
                    filteredSellers.map((seller, idx) => {
                      const isApproved = seller.status === 'approved';
                      const isPending = seller.status === 'pending';
                      const isDisabled = seller.status === 'disabled';

                      return (
                        <tr key={seller.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>

                          {/* Shop & Owner */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{seller.profile?.shopName || 'अज्ञात फर्म'}</div>
                            <div className="text-[11px] text-slate-500 font-medium">मालिक: {seller.profile?.ownerName || '---'}</div>
                            {seller.profile?.address && (
                              <div className="text-[10px] text-slate-400 truncate max-w-xs">📍 {seller.profile.address}</div>
                            )}
                          </td>

                          {/* Username */}
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              {seller.username}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-1 font-mono">
                              पासवर्ड: {seller.password}
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="py-3 px-3 font-mono">
                            <div className="font-bold text-slate-800">📞 {seller.profile?.mobile}</div>
                            {seller.profile?.email && (
                              <div className="text-[10px] text-slate-500 truncate max-w-[160px] font-sans">
                                ✉️ {seller.profile.email}
                              </div>
                            )}
                          </td>

                          {/* GSTIN & Bank */}
                          <td className="py-3 px-3 text-[11px]">
                            {seller.profile?.gstin ? (
                              <div className="font-mono font-bold text-purple-900">GST: {seller.profile.gstin}</div>
                            ) : (
                              <div className="text-slate-400">गैर-GST</div>
                            )}
                            <div className="text-[10px] text-slate-500 font-mono">
                              {seller.profile?.bankName ? `${seller.profile.bankName} | A/C: ${seller.profile.accountNo}` : 'बैंक उपलब्ध नहीं'}
                            </div>
                            {seller.profile?.upiId && (
                              <div className="text-[10px] text-emerald-700 font-mono">UPI: {seller.profile.upiId}</div>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-3 text-center">
                            {isApproved && (
                              <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-300">
                                सक्रिय (Active)
                              </span>
                            )}
                            {isPending && (
                              <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                                पेंडिंग (Pending)
                              </span>
                            )}
                            {isDisabled && (
                              <span className="bg-rose-100 text-rose-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-rose-300">
                                ब्लॉक (Disabled)
                              </span>
                            )}
                          </td>

                          {/* Module Permissions (4 Tabs Control) */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-1 min-w-[155px]">
                              {/* 1. GST */}
                              <div className="flex items-center justify-between bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                <span className="text-[10px] font-bold text-slate-700">1. GST Billing</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cur = seller.allowedModules?.gst_billing !== false;
                                    updateUserModules(seller.id, 'gst_billing', !cur);
                                    showNotification('info', `GST बिलिंग: ${!cur ? 'चालू (Enabled)' : 'बंद (Disabled)'}`);
                                  }}
                                  className={`text-[9px] font-black px-1.5 py-0.2 rounded cursor-pointer transition-colors ${
                                    seller.allowedModules?.gst_billing !== false
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-rose-100 text-rose-700 border border-rose-300'
                                  }`}
                                  title="इस यूजर के लिए Smart GST Billing चालू/बंद करें"
                                >
                                  {seller.allowedModules?.gst_billing !== false ? 'चालू ✔' : 'बंद ✖'}
                                </button>
                              </div>

                              {/* 2. Non-GST */}
                              <div className="flex items-center justify-between bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                <span className="text-[10px] font-bold text-slate-700">2. Non-GST Retail</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cur = seller.allowedModules?.nongst_billing !== false;
                                    updateUserModules(seller.id, 'nongst_billing', !cur);
                                    showNotification('info', `Non-GST बिलिंग: ${!cur ? 'चालू (Enabled)' : 'बंद (Disabled)'}`);
                                  }}
                                  className={`text-[9px] font-black px-1.5 py-0.2 rounded cursor-pointer transition-colors ${
                                    seller.allowedModules?.nongst_billing !== false
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-rose-100 text-rose-700 border border-rose-300'
                                  }`}
                                  title="इस यूजर के लिए Non-GST Retail Billing चालू/बंद करें"
                                >
                                  {seller.allowedModules?.nongst_billing !== false ? 'चालू ✔' : 'बंद ✖'}
                                </button>
                              </div>

                              {/* 3. Receipt */}
                              <div className="flex items-center justify-between bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                <span className="text-[10px] font-bold text-slate-700">3. Receipt Billing</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cur = seller.allowedModules?.receipt_billing !== false;
                                    updateUserModules(seller.id, 'receipt_billing', !cur);
                                    showNotification('info', `रसीद बिलिंग: ${!cur ? 'चालू (Enabled)' : 'बंद (Disabled)'}`);
                                  }}
                                  className={`text-[9px] font-black px-1.5 py-0.2 rounded cursor-pointer transition-colors ${
                                    seller.allowedModules?.receipt_billing !== false
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-rose-100 text-rose-700 border border-rose-300'
                                  }`}
                                  title="इस यूजर के लिए Receipt Billing चालू/बंद करें"
                                >
                                  {seller.allowedModules?.receipt_billing !== false ? 'चालू ✔' : 'बंद ✖'}
                                </button>
                              </div>

                              {/* 4. POS */}
                              <div className="flex items-center justify-between bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                <span className="text-[10px] font-bold text-slate-700">4. POS Billing</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cur = seller.allowedModules?.pos_billing !== false;
                                    updateUserModules(seller.id, 'pos_billing', !cur);
                                    showNotification('info', `POS बिलिंग: ${!cur ? 'चालू (Enabled)' : 'बंद (Disabled)'}`);
                                  }}
                                  className={`text-[9px] font-black px-1.5 py-0.2 rounded cursor-pointer transition-colors ${
                                    seller.allowedModules?.pos_billing !== false
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-rose-100 text-rose-700 border border-rose-300'
                                  }`}
                                  title="इस यूजर के लिए POS Billing चालू/बंद करें"
                                >
                                  {seller.allowedModules?.pos_billing !== false ? 'चालू ✔' : 'बंद ✖'}
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Actions Buttons */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {/* Assist / Impersonate as Seller */}
                              <button
                                type="button"
                                onClick={() => {
                                  navigate({ module: 'hub' });
                                  startImpersonation(seller.id);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all cursor-pointer whitespace-nowrap"
                                title={`सेलर "${seller.profile?.shopName || seller.username}" के पोर्टल / बिलिंग में जाएं`}
                              >
                                <span>🚀 सेलर पैनल में जाएं</span>
                              </button>

                              {/* Edit Profile */}
                              <button
                                type="button"
                                onClick={() => setEditingSeller(JSON.parse(JSON.stringify(seller)))}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="फर्म विवरण एडिट करें"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Reset Password */}
                              <button
                                type="button"
                                onClick={() => { setPasswordModalSeller(seller); setNewPassword(''); }}
                                className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="पासवर्ड बदलें / रीसेट करें"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              {/* Disable / Enable Toggle */}
                              <button
                                type="button"
                                onClick={() => {
                                  const res = toggleUserStatus(seller.id);
                                  showNotification('info', `सेलर की स्थिति: ${res.newStatus === 'approved' ? 'सक्रिय' : 'ब्लॉक'}`);
                                }}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isDisabled
                                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                                }`}
                                title={isDisabled ? 'खाता पुनः सक्रिय करें' : 'खाता निष्क्रिय / ब्लॉक करें'}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Seller */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`क्या आप सेलर "${seller.profile?.shopName || seller.username}" को हमेशा के लिए हटाना चाहते हैं?`)) {
                                    rejectSeller(seller.id);
                                    showNotification('info', 'सेलर खाता हटाया गया।');
                                  }
                                }}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="सेलर हटाएं"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 2: PENDING APPROVALS QUEUE */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>अनुमोदन हेतु लंबित नए सेलर ({pendingSellers.length})</span>
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  ये दुकानदार नए साइन-अप कर चुके हैं। आपके अनुमोदन के बाद ही वे सॉफ्टवेयर में लॉगिन कर सकेंगे।
                </p>
              </div>
            </div>

            {pendingSellers.length === 0 ? (
              <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200">
                <UserCheck className="w-12 h-12 mx-auto text-emerald-500 mb-2 opacity-50" />
                <p className="text-sm font-bold text-slate-700">कोई सेलर अनुमोदन हेतु लंबित नहीं है।</p>
                <p className="text-xs text-slate-400 mt-1">सभी सेलर खाते सक्रिय एवं चालू हैं।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSellers.map((seller) => (
                  <div
                    key={seller.id}
                    className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase">
                          नई रजिस्ट्रेशन अर्जी
                        </span>
                        <h4 className="text-base font-black text-slate-900 mt-1">
                          {seller.profile?.shopName || 'अनाम फर्म'}
                        </h4>
                        <div className="text-xs text-slate-600 font-medium">
                          मालिक: {seller.profile?.ownerName} • यूजरनेम: <strong className="font-mono text-indigo-900">{seller.username}</strong>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(seller.createdAt).toLocaleDateString('hi-IN')}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-700">
                      <div>📞 मोबाइल: <strong className="font-mono">{seller.profile?.mobile}</strong></div>
                      <div>✉️ ईमेल: <span className="font-mono">{seller.profile?.email}</span></div>
                      <div>📍 पता: {seller.profile?.address}</div>
                      <div>🏦 बैंक: {seller.profile?.bankName} (A/C: {seller.profile?.accountNo})</div>
                      <div>📱 UPI: <strong className="font-mono text-emerald-800">{seller.profile?.upiId}</strong></div>
                      {seller.profile?.gstin && (
                        <div>GSTIN: <strong className="font-mono text-purple-900">{seller.profile?.gstin}</strong></div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          approveSeller(seller.id);
                          showNotification('success', `सेलर "${seller.profile?.shopName}" को अप्रूव कर दिया गया!`);
                        }}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>स्वीकार करें (Approve)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('क्या आप इस रजिस्ट्रेशन को अस्वीकार करना चाहते हैं?')) {
                            rejectSeller(seller.id);
                            showNotification('info', 'आवेदन निरस्त किया गया।');
                          }
                        }}
                        className="py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        <span>अस्वीकार</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 3: PLATFORM SETTINGS */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 max-w-2xl">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-purple-700" />
                <span>सुपर एडमिन प्लेटफ़ॉर्म नीतियां (System Policies)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                यहाँ से तय करें कि नए सेलर का खाता तुरंत चालू होगा या पहले आपकी स्वीकृति लगेगी।
              </p>
            </div>

            {/* Auto-Approve Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <span className="font-bold text-slate-900 text-xs block">
                  नए सेलर का स्वतः सक्रियण (Auto-Approve Sellers):
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  यदि ऑन है, तो साइन-अप करते ही सेलर बिना किसी रुकावट के तुरंत लॉगिन कर सकेगा।  
                  यदि ऑफ है, तो आपके अप्रूवल के बाद ही लॉगिन चालू होगा।
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const updated = !platformConfig.autoApproveSellers;
                  updatePlatformConfig({ autoApproveSellers: updated });
                  showNotification('success', `ऑटो-अप्रूवल नीति: ${updated ? 'चालू (ON)' : 'बंद (OFF)'}`);
                }}
                className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                  platformConfig.autoApproveSellers ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    platformConfig.autoApproveSellers ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Auto-Grant All 4 Modules Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <span className="font-bold text-slate-900 text-xs block">
                  नए यूजर हेतु सभी 4 मॉड्यूल का स्वतः आवंटन (Auto-Grant All 4 Tabs):
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  यदि ऑन है, तो पहले लॉगिन या नए साइन-अप पर यूजर के लिए चारों मॉड्यूल (Smart GST, Non-GST, Premium Receipt, POS Billing) स्वतः चालू रहेंगे।
                  एडमिन बाद में जब चाहे किसी भी यूजर के लिए किसी भी मॉड्यूल को बंद या चालू कर सकता है।
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const updated = platformConfig.autoGrantAllModules === false ? true : false;
                  updatePlatformConfig({ autoGrantAllModules: updated });
                  showNotification('success', `ऑटो-ग्रांट 4-मॉड्यूल नीति: ${updated ? 'चालू (ON)' : 'बंद (OFF)'}`);
                }}
                className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer shrink-0 ml-4 ${
                  platformConfig.autoGrantAllModules !== false ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
                title="सभी नए यूजर के लिए चारों मॉड्यूल स्वतः चालू/बंद करने की नीति"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    platformConfig.autoGrantAllModules !== false ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Platform Master Credentials Info */}
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl text-xs space-y-2 text-purple-950">
              <span className="font-bold block text-purple-900">👑 सुपर एडमिन क्रेडेंशियल्स:</span>
              <div className="font-mono">यूजरनेम: <strong className="text-slate-900">superadmin</strong></div>
              <div className="font-mono">डिफ़ॉल्ट पासवर्ड: <strong className="text-slate-900">Admin@123456</strong></div>
              <p className="text-[10px] text-slate-500 pt-1 border-t border-purple-200 mt-1">
                सुरक्षा हेतु यह पासवर्ड कभी किसी सामान्य सेलर से साझा न करें।
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 1: EDIT SELLER PROFILE */}
      {/* ------------------------------------------------------------------ */}
      {editingSeller && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <span>सेलर विवरण संपादित करें (Edit Seller Profile)</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingSeller(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-0.5">दुकान / फर्म का नाम</label>
                <input
                  type="text"
                  value={editingSeller.profile.shopName}
                  onChange={(e) =>
                    setEditingSeller({
                      ...editingSeller,
                      profile: { ...editingSeller.profile, shopName: e.target.value }
                    })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">मालिक का नाम</label>
                  <input
                    type="text"
                    value={editingSeller.profile.ownerName}
                    onChange={(e) =>
                      setEditingSeller({
                        ...editingSeller,
                        profile: { ...editingSeller.profile, ownerName: e.target.value }
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">मोबाइल नंबर</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={editingSeller.profile.mobile}
                    onChange={(e) =>
                      setEditingSeller({
                        ...editingSeller,
                        profile: { ...editingSeller.profile, mobile: e.target.value.replace(/\D/g, '') }
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-0.5">ईमेल</label>
                <input
                  type="email"
                  value={editingSeller.profile.email}
                  onChange={(e) =>
                    setEditingSeller({
                      ...editingSeller,
                      profile: { ...editingSeller.profile, email: e.target.value }
                    })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-0.5">दुकान का पूरा पता</label>
                <input
                  type="text"
                  value={editingSeller.profile.address}
                  onChange={(e) =>
                    setEditingSeller({
                      ...editingSeller,
                      profile: { ...editingSeller.profile, address: e.target.value }
                    })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">GSTIN</label>
                  <input
                    type="text"
                    value={editingSeller.profile.gstin}
                    onChange={(e) =>
                      setEditingSeller({
                        ...editingSeller,
                        profile: { ...editingSeller.profile, gstin: e.target.value.toUpperCase() }
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">UPI ID (QR हेतु)</label>
                  <input
                    type="text"
                    value={editingSeller.profile.upiId}
                    onChange={(e) =>
                      setEditingSeller({
                        ...editingSeller,
                        profile: { ...editingSeller.profile, upiId: e.target.value }
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-emerald-800"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingSeller(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  बदलाव सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 2: RESET SELLER PASSWORD */}
      {/* ------------------------------------------------------------------ */}
      {passwordModalSeller && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-purple-600" />
                <span>सेलर पासवर्ड रीसेट करें</span>
              </h3>
              <button
                type="button"
                onClick={() => setPasswordModalSeller(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePasswordReset} className="space-y-4 text-xs">
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-purple-900">
                <div>सेलर: <strong className="text-slate-900 font-sans">{passwordModalSeller.profile?.shopName}</strong></div>
                <div>यूजरनेम: <strong className="font-mono text-purple-950">{passwordModalSeller.username}</strong></div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  नया पासवर्ड दर्ज करें *
                </label>
                <input
                  type="text"
                  name="password"
                  id="superadmin-new-password"
                  data-no-uppercase="true"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="उदा. NewPass@2026"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-indigo-900 outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  कम से कम 6 अक्षर होने चाहिए।
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPasswordModalSeller(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  पासवर्ड बदलें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
