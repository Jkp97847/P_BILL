import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBilling } from '../../context/BillingContext';
import { useToast } from '../../context/ToastContext';
import MathCaptcha from '../auth/MathCaptcha';
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
  FileText
} from 'lucide-react';

export default function AdminPortalModal({ isOpen, onClose }) {
  const { 
    users, 
    currentUser, 
    adminResetPassword, 
    changePassword, 
    toggleUserStatus, 
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

  // Password reset target state
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [adminNewUserPass, setAdminNewUserPass] = useState('');

  // View user bills modal state
  const [viewingUserBills, setViewingUserBills] = useState(null);

  // Admin own pass state
  const [adminOldPass, setAdminOldPass] = useState('');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [adminConfirmPass, setAdminConfirmPass] = useState('');
  const [adminCaptchaInput, setAdminCaptchaInput] = useState('');
  const [adminExpectedCaptcha, setAdminExpectedCaptcha] = useState(null);
  const [adminCaptchaKey, setAdminCaptchaKey] = useState(1);

  const [feedback, setFeedback] = useState({ type: '', message: '' });

  if (!isOpen || !currentUser || currentUser.role !== 'admin') return null;

  const filteredUsers = users.filter(u => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      u.username.toLowerCase().includes(q) ||
      (u.profile?.name && u.profile.name.toLowerCase().includes(q)) ||
      (u.profile?.shopName && u.profile.shopName.toLowerCase().includes(q)) ||
      (u.profile?.mobile && u.profile.mobile.includes(q))
    );
  });

  const handleUserPasswordReset = (e) => {
    e.preventDefault();
    if (!resetTargetUser || !adminNewUserPass) return;

    if (adminNewUserPass.length < 4) {
      showToast('error', 'नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।', 'त्रुटि');
      setFeedback({ type: 'error', message: 'नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' });
      return;
    }

    const res = adminResetPassword(resetTargetUser.id, adminNewUserPass);
    if (res.success) {
      const msg = `यूजर "${resetTargetUser.username}" का पासवर्ड बदलकर "${adminNewUserPass}" कर दिया गया!`;
      showToast('success', msg, 'पासवर्ड रीसेट सफल');
      setFeedback({ type: 'success', message: msg });
      setResetTargetUser(null);
      setAdminNewUserPass('');
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } else {
      showToast('error', res.message, 'पासवर्ड रीसेट विफल');
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleStatusToggle = (userId, currentStatus, username) => {
    const res = toggleUserStatus(userId);
    if (res.success) {
      const newStatusText = currentStatus === 'inactive' ? 'सक्रिय (Active)' : 'निष्क्रिय (Inactive)';
      showToast('info', `यूजर "${username}" की स्थिति बदलकर ${newStatusText} कर दी गई।`, 'स्थिति अपडेट');
    }
  };

  const handleDeleteUser = (userId, username) => {
    if (window.confirm(`क्या आप यूजर "${username}" को स्थायी रूप से हटाना चाहते हैं?`)) {
      const res = deleteUser(userId);
      if (res.success) {
        showToast('warning', `यूजर "${username}" को सफलतापूर्वक हटा दिया गया।`, 'यूजर हटाया गया');
      }
    }
  };

  const handleViewBills = (user) => {
    const userBills = getUserBills(user.id);
    const stats = getUserStats(user.id);
    setViewingUserBills({ user, bills: userBills, stats });
  };

  const handleAdminOwnPasswordChange = (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (parseInt(adminCaptchaInput) !== adminExpectedCaptcha) {
      showToast('error', 'गणितीय कैप्चा गलत है! कृपया सही उत्तर लिखें।', 'कैप्चा त्रुटि');
      setFeedback({ type: 'error', message: 'गणितीय कैप्चा गलत है! कृपया सही उत्तर लिखें।' });
      setAdminCaptchaKey(k => k + 1);
      setAdminCaptchaInput('');
      return;
    }

    if (adminNewPass !== adminConfirmPass) {
      showToast('error', 'नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते!', 'त्रुटि');
      setFeedback({ type: 'error', message: 'नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते!' });
      return;
    }

    const res = changePassword(currentUser.id, adminOldPass, adminNewPass);
    if (res.success) {
      showToast('success', 'सुपर एडमिन का पासवर्ड सफलतापूर्वक अपडेट हो गया!', 'पासवर्ड अपडेट सफल');
      setFeedback({ type: 'success', message: 'एडमिन पासवर्ड सफलतापूर्वक अपडेट हो गया है!' });
      setAdminOldPass('');
      setAdminNewPass('');
      setAdminConfirmPass('');
      setAdminCaptchaInput('');
      setAdminCaptchaKey(k => k + 1);
      setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
    } else {
      showToast('error', res.message || 'एडमिन पासवर्ड बदलने में विफल!', 'त्रुटि');
      setFeedback({ type: 'error', message: res.message });
      setAdminCaptchaKey(k => k + 1);
      setAdminCaptchaInput('');
    }
  };

  const handleMasterExport = () => {
    try {
      exportMasterDatabase();
      showToast('success', 'संपूर्ण प्रोजेक्ट का मास्टर बैकअप सफलतापूर्वक डाउनलोड हो गया!', 'मास्टर बैकअप सफल');
    } catch (err) {
      showToast('error', 'मास्टर बैकअप डाउनलोड करने में त्रुटि: ' + err.message, 'बैकअप त्रुटि');
    }
  };

  const handleMasterImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('सावधान: मास्टर डेटाबेस इम्पोर्ट करने से सभी उपयोगकर्ताओं, सेटिंग्स और बिलों का डेटा इस फाइल से अपडेट हो जाएगा। क्या आप आगे बढ़ना चाहते हैं?')) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <span>एडमिन कंट्रोल पोर्टल (Super Admin Portal)</span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                  MASTER ADMIN
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                उपयोगकर्ता प्रबंधन, अनुमतियाँ, पासवर्ड व संपूर्ण मास्टर डेटाबेस नियंत्रण
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback.message && (
          <div className={`px-5 py-2.5 text-xs font-semibold flex items-center gap-2 shrink-0 ${
            feedback.type === 'error' ? 'bg-rose-50 text-rose-800 border-b border-rose-200' : 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
          }`}>
            {feedback.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>रजिस्टर्ड यूजर्स एवं बिल नियंत्रण ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'database'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span>मास्टर डेटाबेस बैकअप व रीस्टोर (All Project Data)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin_pass')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'admin_pass'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>सुपर एडमिन पासवर्ड बदलें</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: USERS */}
          {activeTab === 'users' && (
            <>
              {/* Search Bar & Stats */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="यूजर, नाम या मोबाइल खोजें..."
                    className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  कुल उपयोगकर्ता: <strong className="text-slate-900 font-mono">{users.length}</strong> | 
                  सक्रिय: <strong className="text-emerald-700 font-mono">{users.filter(u => u.status !== 'inactive').length}</strong>
                </div>
              </div>

              {/* Password Reset Popup Form */}
              {resetTargetUser && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-amber-600" />
                      <span>यूजर <strong>"{resetTargetUser.username}"</strong> का नया पासवर्ड सेट करें:</span>
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
                      placeholder="नया पासवर्ड लिखें (उदा. User@123)"
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
                      <th className="p-3">यूजरनेम</th>
                      <th className="p-3">दुकान / ओनर का नाम</th>
                      <th className="p-3">मोबाइल नं.</th>
                      <th className="p-3 text-center">बिल व बिक्री</th>
                      <th className="p-3">भूमिका</th>
                      <th className="p-3">स्थिति</th>
                      <th className="p-3 text-right">कार्रवाई (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => {
                      const isAdmin = user.role === 'admin';
                      const isActive = user.status !== 'inactive';
                      const stats = getUserStats(user.id);

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-900">
                            {user.username}
                            {isAdmin && (
                              <span className="ml-1.5 text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded">
                                ADMIN
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{user.profile?.shopName || '—'}</div>
                            <div className="text-[11px] text-slate-500">{user.profile?.name || '—'}</div>
                          </td>
                          <td className="p-3 font-mono text-slate-700">
                            {user.profile?.mobile || '—'}
                          </td>
                          <td className="p-3 text-center font-mono">
                            <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold text-slate-800">
                              {stats.count} बिल | ₹{stats.totalSales.toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isAdmin ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {isAdmin ? 'व्यवस्थापक' : 'दुकानदार / सेलर'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {isActive ? '● सक्रिय' : '○ निष्क्रिय'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Bills Button */}
                              <button
                                type="button"
                                onClick={() => handleViewBills(user)}
                                className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                                title="इस यूजर के बिल देखें"
                              >
                                <Eye className="w-3 h-3" />
                                <span>बिल देखें</span>
                              </button>

                              {/* Reset Password Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setResetTargetUser(user);
                                  setAdminNewUserPass('');
                                }}
                                className="px-2 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1"
                                title="पासवर्ड रीसेट करें"
                              >
                                <KeyRound className="w-3 h-3" />
                                <span>पासवर्ड</span>
                              </button>

                              {/* Toggle Status (Non-admin only) */}
                              {!isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusToggle(user.id, user.status, user.username)}
                                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                                    isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                                  }`}
                                  title={isActive ? 'निष्क्रिय करें' : 'सक्रिय करें'}
                                >
                                  <Power className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete User (Non-admin only) */}
                              {!isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(user.id, user.username)}
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
            </>
          )}

          {/* TAB 2: MASTER DATABASE BACKUP & RESTORE */}
          {activeTab === 'database' && (
            <div className="space-y-4 max-w-3xl mx-auto py-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <Database className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 leading-relaxed">
                  <strong className="text-sm block font-extrabold mb-1">
                    👑 सुपर व्यवस्थापक मास्टर डेटाबेस बैकअप एवं रीस्टोर (Super User Master Control)
                  </strong>
                  <p>
                    यह विशेष अधिकार केवल <strong>सुपर एडमिन (Master Admin)</strong> के पास है। यहाँ से आप पूरे सॉफ्टवेयर के सभी यूज़र्स, उनकी व्यक्तिगत फर्म सेटिंग्स और सभी बिलों का एक सम्मिलित JSON बैकअप ले सकते हैं अथवा पुराना बैकअप वापस रीस्टोर कर सकते हैं।
                  </p>
                  <p className="mt-1 font-semibold text-emerald-800">
                    * सामान्य यूज़र्स केवल अपने खुद के डेटा का बैकअप ले सकते हैं।
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Master Export Card */}
                <div className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                      <Download className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      संपूर्ण प्रोजेक्ट का मास्टर बैकअप डाउनलोड करें
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      सभी {users.length} उपयोगकर्ताओं के खाते, पासवर्ड, फर्म प्रोफाइल और उनके द्वारा बनाए गए सभी बिलों को एक सुरक्षित JSON फाइल में सुरक्षित करें।
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleMasterExport}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>मास्टर बैकअप एक्सपोर्ट करें (Export All Data)</span>
                  </button>
                </div>

                {/* 2. Master Import Card */}
                <div className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      मास्टर बैकअप फाइल से पूरा प्रोजेक्ट रीस्टोर करें
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      यदि आपने पहले मास्टर बैकअप फाइल (.json) डाउनलोड की थी, तो उसे चुनकर पूरे प्रोजेक्ट का डेटा एक क्लिक में वापस ला सकते हैं।
                    </p>
                  </div>

                  <label className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer text-center">
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

          {/* TAB 3: ADMIN PASSWORD CHANGE */}
          {activeTab === 'admin_pass' && (
            <div className="max-w-md mx-auto py-3 space-y-4">
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
                    placeholder="वर्तमान एडमिन पासवर्ड"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none normal-case"
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
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none normal-case"
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
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none normal-case"
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
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>एडमिन पासवर्ड सुरक्षित करें</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>सुरक्षित व्यवस्थापक नियंत्रण प्रणाली</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-bold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            पोर्टल बंद करें
          </button>
        </div>
      </div>

      {/* VIEW USER BILLS SUB-MODAL */}
      {viewingUserBills && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs">
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
    </div>
  );
}
