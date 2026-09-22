import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import MathCaptcha from './MathCaptcha';
import { KeyRound, X, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { currentUser, changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Captcha
  const [captchaInput, setCaptchaInput] = useState('');
  const [expectedCaptcha, setExpectedCaptcha] = useState(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [captchaKey, setCaptchaKey] = useState(1);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Verify Captcha
    if (parseInt(captchaInput) !== expectedCaptcha) {
      setErrorMsg('गणितीय कैप्चा का उत्तर गलत है! कृपया सही उत्तर लिखें।');
      setCaptchaKey(k => k + 1);
      setCaptchaInput('');
      return;
    }

    // Verify new passwords match
    if (newPassword !== confirmPassword) {
      setErrorMsg('नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते!');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।');
      return;
    }

    const res = changePassword(currentUser.id, currentPassword, newPassword);
    if (res.success) {
      setSuccessMsg(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setCaptchaInput('');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 2000);
    } else {
      setErrorMsg(res.message);
      setCaptchaKey(k => k + 1);
      setCaptchaInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-700 to-indigo-900 text-white">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-200" />
            <h3 className="font-bold text-sm sm:text-base">
              पासवर्ड बदलें (Change Password)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-2.5 text-xs text-indigo-900">
            यूजर: <strong>{currentUser.profile?.name || currentUser.username}</strong> ({currentUser.username})
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 px-3 py-2 rounded-lg text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-2 rounded-lg text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              वर्तमान पासवर्ड (Current Password): *
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="वर्तमान पासवर्ड दर्ज करें"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none normal-case pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              नया पासवर्ड (New Password): *
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              minLength={4}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="नया पासवर्ड दर्ज करें (कम से कम 4 अक्षर)"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none normal-case"
            />
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              नए पासवर्ड की पुष्टि करें (Confirm New Password): *
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              minLength={4}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="नए पासवर्ड को दोबारा लिखें"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none normal-case"
            />
          </div>

          {/* Math Captcha */}
          <MathCaptcha
            key={captchaKey}
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            onRefresh={(ans) => setExpectedCaptcha(ans)}
            label="सुरक्षा कैप्चा सवाल हल करें: *"
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>पासवर्ड अपडेट करें</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
