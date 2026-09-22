import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import MathCaptcha from '../auth/MathCaptcha';
import { 
  ShieldAlert, 
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
  UserPlus,
  Save
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

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'admin_pass'
  const [searchTerm, setSearchTerm] = useState('');

  // Password reset target state
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [adminNewUserPass, setAdminNewUserPass] = useState('');

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
      setFeedback({ type: 'error', message: 'नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' });
      return;
    }

    const res = adminResetPassword(resetTargetUser.id, adminNewUserPass);
    if (res.success) {
      setFeedback({ type: 'success', message: `यूजर "${resetTargetUser.username}" का पासवर्ड बदलकर "${adminNewUserPass}" कर दिया गया!` });
      setResetTargetUser(null);
      setAdminNewUserPass('');
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleAdminOwnPasswordChange = (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (parseInt(adminCaptchaInput) !== adminExpectedCaptcha) {
      setFeedback({ type: 'error', message: 'गणितीय कैप्चा गलत है! कृपया सही उत्तर लिखें।' });
      setAdminCaptchaKey(k => k + 1);
      setAdminCaptchaInput('');
      return;
    }

    if (adminNewPass !== adminConfirmPass) {
      setFeedback({ type: 'error', message: 'नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते!' });
      return;
    }

    const res = changePassword(currentUser.id, adminOldPass, adminNewPass);
    if (res.success) {
      setFeedback({ type: 'success', message: 'एडमिन पासवर्ड सफलतापूर्वक अपडेट हो गया है!' });
      setAdminOldPass('');
      setAdminNewPass('');
      setAdminConfirmPass('');
      setAdminCaptchaInput('');
      setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
    } else {
      setFeedback({ type: 'error', message: res.message });
      setAdminCaptchaKey(k => k + 1);
      setAdminCaptchaInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
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
                उपयोगकर्ता प्रबंधन और पासवर्ड नियंत्रण केंद्र
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
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>रजिस्टर्ड यूजर्स सूची ({users.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin_pass')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'admin_pass'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>एडमिन पासवर्ड बदलें</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
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

              {/* Password Reset Popup Form (When a user is selected) */}
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
                      className="text-xs text-slate-500 hover:text-slate-700 font-bold"
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
                      placeholder="नया पासवर्ड लिखें (उदा. User@999)"
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
                      <th className="p-3">भूमिका (Role)</th>
                      <th className="p-3">स्थिति</th>
                      <th className="p-3 text-right">कार्रवाई (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => {
                      const isAdmin = user.role === 'admin';
                      const isActive = user.status !== 'inactive';

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
                              {/* Reset Password Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setResetTargetUser(user);
                                  setAdminNewUserPass('');
                                }}
                                className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1"
                                title="पासवर्ड रीसेट करें"
                              >
                                <KeyRound className="w-3 h-3" />
                                <span>पासवर्ड रीसेट</span>
                              </button>

                              {/* Toggle Status (Non-admin only) */}
                              {!isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => toggleUserStatus(user.id)}
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
                                  onClick={() => deleteUser(user.id)}
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

          {activeTab === 'admin_pass' && (
            <div className="max-w-md mx-auto py-3 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700">
                वर्तमान एडमिन यूजर: <strong>{currentUser.username}</strong>
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
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
}
