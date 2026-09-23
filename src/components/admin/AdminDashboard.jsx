import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBilling } from '../../context/BillingContext';
import { useToast } from '../../context/ToastContext';
import MathCaptcha from '../auth/MathCaptcha';
import ChangePasswordModal from '../auth/ChangePasswordModal';
import { 
  Users, 
  KeyRound, 
  X, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Power, 
  ShieldCheck, 
  Building2, 
  Phone, 
  Save, 
  Database, 
  Download, 
  Upload, 
  Eye, 
  FileText,
  Clock,
  Check,
  Ban,
  ReceiptText,
  LogOut,
  TrendingUp,
  UserCheck,
  UserX,
  Filter
} from 'lucide-react';

export default function AdminDashboard() {
  const { 
    users, 
    currentUser, 
    logout, 
    adminResetPassword, 
    changePassword, 
    approveUser, 
    denyUser, 
    deleteUser 
  } = useAuth();

  const {
    getUserBills,
    getUserStats,
    exportMasterDatabase,
    importMasterDatabase
  } = useBilling();

  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'database' | 'admin_pass'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'active' | 'inactive'

  // Password reset target state
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [adminNewUserPass, setAdminNewUserPass] = useState('');

  // View user bills modal state
  const [viewingUserBills, setViewingUserBills] = useState(null);

  // Change admin password modal
  const [adminPassModalOpen, setAdminPassModalOpen] = useState(false);

  // Admin own pass tab state
  const [adminOldPass, setAdminOldPass] = useState('');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [adminConfirmPass, setAdminConfirmPass] = useState('');
  const [adminCaptchaInput, setAdminCaptchaInput] = useState('');
  const [adminExpectedCaptcha, setAdminExpectedCaptcha] = useState(null);
  const [adminCaptchaKey, setAdminCaptchaKey] = useState(1);

  // System overall metrics
  const systemMetrics = useMemo(() => {
    let totalBills = 0;
    let totalSales = 0;
    let pendingUsersCount = 0;
    let activeUsersCount = 0;

    users.forEach(u => {
      if (u.status === 'pending') pendingUsersCount++;
      if (u.status === 'active' && u.role !== 'admin') activeUsersCount++;
      
      const stats = getUserStats(u.id);
      totalBills += stats.count;
      totalSales += stats.totalSales;
    });

    return {
      totalUsers: users.length,
      pendingCount: pendingUsersCount,
      activeCount: activeUsersCount,
      totalBills,
      totalSales
    };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch = !q || (
        u.username.toLowerCase().includes(q) ||
        (u.profile?.name && u.profile.name.toLowerCase().includes(q)) ||
        (u.profile?.shopName && u.profile.shopName.toLowerCase().includes(q)) ||
        (u.profile?.mobile && u.profile.mobile.includes(q))
      );

      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [users, searchTerm, statusFilter]);

  // Pending users list for banner
  const pendingUsers = useMemo(() => {
    return users.filter(u => u.status === 'pending');
  }, [users]);

  // Actions
  const handleApprove = (userId, username) => {
    const res = approveUser(userId);
    if (res.success) {
      showToast('success', `यूजर "${username}" को सफलतापूर्वक स्वीकृति (Access) दे दी गई है!`, 'एक्सेस स्वीकृत');
    }
  };

  const handleDeny = (userId, username) => {
    const res = denyUser(userId);
    if (res.success) {
      showToast('warning', `यूजर "${username}" का एक्सेस अस्वीकृत / निलंबित कर दिया गया।`, 'एक्सेस अस्वीकृत');
    }
  };

  const handleDelete = (userId, username) => {
    if (window.confirm(`क्या आप यूजर "${username}" को सिस्टम से स्थायी रूप से हटाना चाहते हैं?`)) {
      const res = deleteUser(userId);
      if (res.success) {
        showToast('warning', `यूजर "${username}" को सफलतापूर्वक हटा दिया गया।`, 'यूजर हटाया गया');
      }
    }
  };

  const handleUserPasswordReset = (e) => {
    e.preventDefault();
    if (!resetTargetUser || !adminNewUserPass) return;

    if (adminNewUserPass.length < 4) {
      showToast('error', 'नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।', 'त्रुटि');
      return;
    }

    const res = adminResetPassword(resetTargetUser.id, adminNewUserPass);
    if (res.success) {
      showToast('success', `यूजर "${resetTargetUser.username}" का पासवर्ड बदलकर "${adminNewUserPass}" कर दिया गया!`, 'पासवर्ड रीसेट सफल');
      setResetTargetUser(null);
      setAdminNewUserPass('');
    } else {
      showToast('error', res.message, 'पासवर्ड रीसेट विफल');
    }
  };

  const handleViewBills = (user) => {
    const userBills = getUserBills(user.id);
    const stats = getUserStats(user.id);
    setViewingUserBills({ user, bills: userBills, stats });
  };

  const handleMasterExport = () => {
    try {
      exportMasterDatabase();
      showToast('success', 'संपूर्ण प्रोजेक्ट का मास्टर बैकअप सफलतापूर्वक डाउनलोड हो गया!', 'मास्टर बैकअप सफल');
    } catch (err) {
      showToast('error', 'मास्टर बैकअप डाउनलोड में त्रुटि: ' + err.message, 'त्रुटि');
    }
  };

  const handleMasterImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('चेतावनी: मास्टर डेटाबेस इम्पोर्ट करने से सभी यूज़र्स, सेटिंग्स और बिल इस फाइल से ओवरराइट हो जाएंगे। क्या आप जारी रखना चाहते हैं?')) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      try {
        const jsonContent = uploadEvent.target.result;
        const res = importMasterDatabase(jsonContent);
        if (res.success) {
          showToast('success', res.message, 'मास्टर डेटाबेस रीस्टोर सफल');
        } else {
          showToast('error', res.message, 'मास्टर डेटाबेस रीस्टोर विफल');
        }
      } catch (err) {
        showToast('error', 'फाइल पढ़ने में त्रुटि: ' + err.message, 'रीस्टोर त्रुटि');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleAdminOwnPasswordChange = (e) => {
    e.preventDefault();

    if (parseInt(adminCaptchaInput) !== adminExpectedCaptcha) {
      showToast('error', 'गणितीय कैप्चा गलत है! कृपया सही उत्तर लिखें।', 'कैप्चा त्रुटि');
      setAdminCaptchaKey(k => k + 1);
      setAdminCaptchaInput('');
      return;
    }

    if (adminNewPass !== adminConfirmPass) {
      showToast('error', 'नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते!', 'त्रुटि');
      return;
    }

    const res = changePassword(currentUser.id, adminOldPass, adminNewPass);
    if (res.success) {
      showToast('success', 'सुपर एडमिन का पासवर्ड सफलतापूर्वक अपडेट हो गया!', 'पासवर्ड अपडेट सफल');
      setAdminOldPass('');
      setAdminNewPass('');
      setAdminConfirmPass('');
      setAdminCaptchaInput('');
      setAdminCaptchaKey(k => k + 1);
    } else {
      showToast('error', res.message || 'एडमिन पासवर्ड बदलने में विफल!', 'त्रुटि');
      setAdminCaptchaKey(k => k + 1);
      setAdminCaptchaInput('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      {/* 1. SUPER ADMIN HEADER */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight">
                  सुपर व्यवस्थापक नियंत्रण केंद्र (Super Admin Dashboard)
                </h1>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                  MASTER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                यूजर प्रबंधन, एक्सेस अनुमति (Approve/Deny) व मास्टर डेटाबेस नियंत्रण
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-red-400 bg-red-950/60 border border-red-800/80 px-2.5 py-1 rounded-full hidden sm:inline-block">
              ॥ श्री गणेशाय नमः ॥
            </span>

            <button
              type="button"
              onClick={() => setAdminPassModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>पासवर्ड बदलें</span>
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                showToast('info', 'आप सुरक्षित रूप से लॉगआउट हो गए हैं।', 'लॉगआउट');
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">कुल पंजीकृत यूज़र्स</p>
              <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{systemMetrics.totalUsers}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className={`p-4 rounded-2xl border shadow-xs flex items-center justify-between transition-colors ${
            systemMetrics.pendingCount > 0 ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400' : 'bg-white border-slate-200'
          }`}>
            <div>
              <p className={`text-xs font-semibold uppercase ${systemMetrics.pendingCount > 0 ? 'text-amber-800 font-bold' : 'text-slate-500'}`}>
                स्वीकृति हेतु लंबित (Pending)
              </p>
              <p className={`text-2xl font-black mt-1 font-mono ${systemMetrics.pendingCount > 0 ? 'text-amber-900' : 'text-slate-900'}`}>
                {systemMetrics.pendingCount}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
              systemMetrics.pendingCount > 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">सक्रिय सेलर (Active)</p>
              <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">{systemMetrics.activeCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">सिस्टम कुल बिल व बिक्री</p>
              <p className="text-lg font-black text-slate-900 mt-1 font-mono">
                {systemMetrics.totalBills} बिल • ₹{systemMetrics.totalSales.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 3. PENDING USERS ACTION BANNER (Shown prominently when new users sign up) */}
        {pendingUsers.length > 0 && (
          <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-amber-950 text-sm sm:text-base">
                    नए यूज़र्स स्वीकृति हेतु प्रतीक्षारत ({pendingUsers.length} Pending Approval)
                  </h3>
                  <p className="text-xs text-amber-800">
                    नीचे दिए गए नए दुकानदारों ने पंजीकरण किया है। जब तक आप <strong>"Access दें"</strong> नहीं करेंगे, वे लॉगिन नहीं कर सकेंगे।
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {pendingUsers.map(u => (
                <div key={u.id} className="bg-white border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{u.profile?.shopName || 'दुकान'}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold">
                        @{u.username}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      ओनर: <strong>{u.profile?.name || '—'}</strong> | 📞 {u.profile?.mobile}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      पंजीकरण: {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApprove(u.id, u.username)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Access दें</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeny(u.id, u.username)}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Deny</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. DASHBOARD TABS */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'users'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>यूज़र व डेटा प्रबंधन ({users.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('database')}
              className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'database'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span>मास्टर डेटाबेस बैकअप एवं रीस्टोर (Full Project Backup)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('admin_pass')}
              className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'admin_pass'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>सुपर एडमिन पासवर्ड</span>
            </button>
          </div>

          <div className="p-5 sm:p-6">
            {/* TAB 1: USERS MANAGEMENT */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="यूजरनेम, दुकान, ओनर या मोबाइल खोजें..."
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600">स्थिति:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">सभी ({users.length})</option>
                      <option value="pending">लंबित (Pending Approval)</option>
                      <option value="active">सक्रिय (Active)</option>
                      <option value="inactive">अस्वीकृत / निष्क्रिय (Inactive)</option>
                    </select>
                  </div>
                </div>

                {/* Password Reset Popup Bar */}
                {resetTargetUser && (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-amber-600" />
                        <span>यूज़र <strong>"{resetTargetUser.username}"</strong> का नया पासवर्ड सेट करें:</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setResetTargetUser(null)}
                        className="text-xs text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
                      >
                        ✕ बंद करें
                      </button>
                    </div>
                    <form onSubmit={handleUserPasswordReset} className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        required
                        value={adminNewUserPass}
                        onChange={(e) => setAdminNewUserPass(e.target.value)}
                        placeholder="नया पासवर्ड दर्ज करें (उदा. User@123)"
                        className="flex-1 bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold normal-case focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                      >
                        पासवर्ड सेव करें
                      </button>
                    </form>
                  </div>
                )}

                {/* Users Table */}
                <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">यूज़रनेम</th>
                        <th className="p-3">दुकान व प्रोपराइटर</th>
                        <th className="p-3">मोबाइल</th>
                        <th className="p-3 text-center">कुल बिल व बिक्री</th>
                        <th className="p-3">स्थिति (Access Status)</th>
                        <th className="p-3 text-right">कार्रवाई (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => {
                        const isAdmin = u.role === 'admin';
                        const isPending = u.status === 'pending';
                        const isActive = u.status === 'active';
                        const isInactive = u.status === 'inactive';
                        const stats = getUserStats(u.id);

                        return (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-mono font-bold text-slate-900">
                              {u.username}
                              {isAdmin && (
                                <span className="ml-1.5 text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded">
                                  SUPER ADMIN
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{u.profile?.shopName || '—'}</div>
                              <div className="text-[11px] text-slate-500">{u.profile?.name || '—'}</div>
                            </td>
                            <td className="p-3 font-mono text-slate-700">
                              {u.profile?.mobile || '—'}
                            </td>
                            <td className="p-3 text-center font-mono">
                              <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold text-slate-800">
                                {stats.count} बिल | ₹{stats.totalSales.toLocaleString('en-IN')}
                              </span>
                            </td>
                            <td className="p-3">
                              {isPending && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                  <Clock className="w-3 h-3" />
                                  <span>लंबित (Pending)</span>
                                </span>
                              )}
                              {isActive && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <Check className="w-3 h-3" />
                                  <span>सक्रिय (Approved)</span>
                                </span>
                              )}
                              {isInactive && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                                  <Ban className="w-3 h-3" />
                                  <span>अस्वीकृत (Denied)</span>
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Approve / Deny Buttons for Non-Admin */}
                                {!isAdmin && isPending && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleApprove(u.id, u.username)}
                                      className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                                      title="एक्सेस स्वीकृत करें"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Access दें</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeny(u.id, u.username)}
                                      className="px-2 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer"
                                      title="अस्वीकृत करें"
                                    >
                                      <span>Deny</span>
                                    </button>
                                  </>
                                )}

                                {!isAdmin && !isPending && (
                                  <button
                                    type="button"
                                    onClick={() => isActive ? handleDeny(u.id, u.username) : handleApprove(u.id, u.username)}
                                    className={`px-2 py-1 text-[11px] font-bold rounded-md border transition-colors cursor-pointer flex items-center gap-1 ${
                                      isActive
                                        ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-300'
                                        : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-300'
                                    }`}
                                    title={isActive ? 'एक्सेस रोकें (Deny)' : 'एक्सेस दें (Approve)'}
                                  >
                                    <Power className="w-3 h-3" />
                                    <span>{isActive ? 'Deny / रोकें' : 'Access दें'}</span>
                                  </button>
                                )}

                                {/* View Bills Button */}
                                <button
                                  type="button"
                                  onClick={() => handleViewBills(u)}
                                  className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1"
                                  title="इस यूजर के बिल देखें"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>बिल देखें</span>
                                </button>

                                {/* Reset Password */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setResetTargetUser(u);
                                    setAdminNewUserPass('');
                                  }}
                                  className="px-2 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                                  title="पासवर्ड रीसेट करें"
                                >
                                  <KeyRound className="w-3 h-3" />
                                  <span>पासवर्ड</span>
                                </button>

                                {/* Delete User (Non-admin only) */}
                                {!isAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(u.id, u.username)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                    title="यूजर हटाएं"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: MASTER DATABASE BACKUP & RESTORE */}
            {activeTab === 'database' && (
              <div className="max-w-3xl mx-auto py-2 space-y-5">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                  <Database className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950 leading-relaxed">
                    <strong className="text-sm block font-extrabold mb-1">
                      👑 संपूर्ण प्रोजेक्ट का मास्टर डेटाबेस बैकअप व रीस्टोर (Super Master Backup)
                    </strong>
                    <p>
                      यह सुविधा केवल आपके (सुपर एडमिन) पास है। यहाँ से आप एक क्लिक में पूरे प्रोजेक्ट के सभी {users.length} उपयोगकर्ताओं, उनके खातों, पासवर्ड, व्यक्तिगत सेटिंग्स और उनके सभी बिलों का संपूर्ण JSON बैकअप ले सकते हैं अथवा पुराना बैकअप वापस रीस्टोर कर सकते हैं।
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Export Card */}
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                        <Download className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">
                        संपूर्ण प्रोजेक्ट बैकअप डाउनलोड करें
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        सभी उपयोगकर्ताओं, उनके बिलों और फर्म सेटिंग्स को एक सुरक्षित JSON फाइल में अपने कंप्यूटर पर डाउनलोड करें।
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleMasterExport}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>मास्टर बैकअप एक्सपोर्ट करें (Export All)</span>
                    </button>
                  </div>

                  {/* Import Card */}
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                        <Upload className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">
                        मास्टर बैकअप से पूरा प्रोजेक्ट रीस्टोर करें
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        यदि आपने पूर्व में मास्टर बैकअप फाइल (.json) डाउनलोड की थी, तो उसे चुनकर पूरे प्रोजेक्ट का डेटा एक क्लिक में वापस ला सकते हैं।
                      </p>
                    </div>

                    <label className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer text-center">
                      <Upload className="w-4 h-4" />
                      <span>मास्टर बैकअप फाइल चुनें (.json)</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleMasterImportFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ADMIN PASSWORD */}
            {activeTab === 'admin_pass' && (
              <div className="max-w-md mx-auto py-2 space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700">
                  वर्तमान सुपर एडमिन यूजर: <strong>{currentUser.username}</strong>
                </div>

                <form onSubmit={handleAdminOwnPasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      वर्तमान एडमिन पासवर्ड: *
                    </label>
                    <input
                      type="password"
                      required
                      value={adminOldPass}
                      onChange={(e) => setAdminOldPass(e.target.value)}
                      placeholder="वर्तमान एडमिन पासवर्ड दर्ज करें"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none normal-case"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      नया एडमिन पासवर्ड: *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={adminNewPass}
                      onChange={(e) => setAdminNewPass(e.target.value)}
                      placeholder="नया पासवर्ड (कम से कम 4 अक्षर)"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none normal-case"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      नए एडमिन पासवर्ड की पुष्टि: *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={adminConfirmPass}
                      onChange={(e) => setAdminConfirmPass(e.target.value)}
                      placeholder="नया पासवर्ड दोबारा लिखें"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none normal-case"
                    />
                  </div>

                  {/* Math Captcha */}
                  <MathCaptcha
                    key={adminCaptchaKey}
                    value={adminCaptchaInput}
                    onChange={(e) => setAdminCaptchaInput(e.target.value)}
                    onRefresh={(ans) => setAdminExpectedCaptcha(ans)}
                    label="एडमिन सुरक्षा गणितीय कैप्चा: *"
                  />

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>एडमिन पासवर्ड सुरक्षित करें</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 5. VIEW USER BILLS MODAL */}
      {viewingUserBills && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-300 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-sm">
                    उपयोगकर्ता: {viewingUserBills.user.username} ({viewingUserBills.user.profile?.shopName || 'दुकान'})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    कुल बिल: {viewingUserBills.bills.length} | कुल बिक्री: ₹{viewingUserBills.stats.totalSales.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingUserBills(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {viewingUserBills.bills.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  इस उपयोगकर्ता ने अभी तक कोई बिल नहीं बनाया है।
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2 border-r border-slate-200">बिल नं.</th>
                      <th className="p-2 border-r border-slate-200">दिनांक</th>
                      <th className="p-2 border-r border-slate-200">ग्राहक का नाम</th>
                      <th className="p-2 border-r border-slate-200">मोबाइल</th>
                      <th className="p-2 border-r border-slate-200 text-right">आइटम</th>
                      <th className="p-2 text-right">कुल रकम</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingUserBills.bills.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-bold text-indigo-700 border-r border-slate-200">{b.billNo}</td>
                        <td className="p-2 font-mono text-slate-600 border-r border-slate-200">{b.date}</td>
                        <td className="p-2 font-medium text-slate-900 border-r border-slate-200">{b.customerName || 'नकद ग्राहक'}</td>
                        <td className="p-2 font-mono text-slate-600 border-r border-slate-200">{b.customerMobile || '—'}</td>
                        <td className="p-2 text-right font-mono border-r border-slate-200">{b.items?.length || 0}</td>
                        <td className="p-2 text-right font-mono font-bold text-emerald-800">
                          ₹{Number(b.grandTotal || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="px-4 py-2.5 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingUserBills(null)}
                className="px-4 py-1.5 text-xs font-bold bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={adminPassModalOpen}
        onClose={() => setAdminPassModalOpen(false)}
      />
    </div>
  );
}
