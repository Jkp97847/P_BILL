import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import MathCaptcha from './MathCaptcha';
import { 
  Lock, 
  User, 
  Phone, 
  Mail, 
  Building2, 
  MapPin, 
  KeyRound, 
  ReceiptText, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Shield,
  HelpCircle,
  X,
  Sparkles
} from 'lucide-react';

export default function AuthPage() {
  const { login, signup, forgotPasswordReset } = useAuth();

  // Mode: 'login' | 'signup' | 'admin_login'
  const [authMode, setAuthMode] = useState('login');
  const [showPass, setShowPass] = useState(false);

  // Common notification
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. User Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginCaptchaInput, setLoginCaptchaInput] = useState('');
  const [loginExpectedCaptcha, setLoginExpectedCaptcha] = useState(null);
  const [loginCaptchaKey, setLoginCaptchaKey] = useState(1);

  // 2. Sign Up State
  const [signupData, setSignupData] = useState({
    ownerName: '',
    shopName: '',
    mobile: '',
    email: '',
    address: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [signupCaptchaInput, setSignupCaptchaInput] = useState('');
  const [signupExpectedCaptcha, setSignupExpectedCaptcha] = useState(null);
  const [signupCaptchaKey, setSignupCaptchaKey] = useState(1);

  // 3. Admin Login State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminCaptchaInput, setAdminCaptchaInput] = useState('');
  const [adminExpectedCaptcha, setAdminExpectedCaptcha] = useState(null);
  const [adminCaptchaKey, setAdminCaptchaKey] = useState(1);

  // 4. Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotCaptchaInput, setForgotCaptchaInput] = useState('');
  const [forgotExpectedCaptcha, setForgotExpectedCaptcha] = useState(null);
  const [forgotCaptchaKey, setForgotCaptchaKey] = useState(1);
  const [forgotFeedback, setForgotFeedback] = useState({ type: '', message: '' });

  // Handle User Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (parseInt(loginCaptchaInput) !== loginExpectedCaptcha) {
      setErrorMsg('गणितीय कैप्चा का उत्तर गलत है! कृपया सही उत्तर लिखें।');
      setLoginCaptchaKey(k => k + 1);
      setLoginCaptchaInput('');
      return;
    }

    setLoading(true);
    const res = login(loginUsername, loginPassword);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
      setLoginCaptchaKey(k => k + 1);
      setLoginCaptchaInput('');
    }
  };

  // Handle Sign Up
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (parseInt(signupCaptchaInput) !== signupExpectedCaptcha) {
      setErrorMsg('गणितीय कैप्चा का उत्तर गलत है! कृपया सही उत्तर लिखें।');
      setSignupCaptchaKey(k => k + 1);
      setSignupCaptchaInput('');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setErrorMsg('पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खाते!');
      return;
    }

    if (signupData.password.length < 4) {
      setErrorMsg('पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।');
      return;
    }

    if (signupData.mobile.length < 10) {
      setErrorMsg('कृपया वैध 10-अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }

    setLoading(true);
    const res = signup(signupData);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
      setSignupCaptchaKey(k => k + 1);
      setSignupCaptchaInput('');
    } else {
      setSuccessMsg('खाता सफलतापूर्वक बन गया! सॉफ्टवेयर शुरू हो रहा है...');
    }
  };

  // Handle Admin Login
  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (parseInt(adminCaptchaInput) !== adminExpectedCaptcha) {
      setErrorMsg('एडमिन गणितीय कैप्चा का उत्तर गलत है! कृपया सही उत्तर लिखें।');
      setAdminCaptchaKey(k => k + 1);
      setAdminCaptchaInput('');
      return;
    }

    setLoading(true);
    const res = login(adminUsername, adminPassword, 'admin');
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
      setAdminCaptchaKey(k => k + 1);
      setAdminCaptchaInput('');
    }
  };

  // Handle Forgot Password
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotFeedback({ type: '', message: '' });

    if (parseInt(forgotCaptchaInput) !== forgotExpectedCaptcha) {
      setForgotFeedback({ type: 'error', message: 'गणितीय कैप्चा गलत है! कृपया सही उत्तर लिखें।' });
      setForgotCaptchaKey(k => k + 1);
      setForgotCaptchaInput('');
      return;
    }

    const res = forgotPasswordReset(forgotUsername, forgotMobile, forgotNewPass);
    if (res.success) {
      setForgotFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setForgotModalOpen(false);
        setForgotFeedback({ type: '', message: '' });
      }, 3000);
    } else {
      setForgotFeedback({ type: 'error', message: res.message });
      setForgotCaptchaKey(k => k + 1);
      setForgotCaptchaInput('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-200 text-slate-900 px-4 py-6 sm:px-6">
      {/* Top Banner */}
      <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between py-2 border-b border-slate-200/80 gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <ReceiptText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              स्मार्ट बिलिंग सॉफ्टवेयर (Smart Billing Portal)
            </h1>
          </div>
        </div>
        <div className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
          ॥ श्री गणेशाय नमः ॥
        </div>
      </div>

      {/* Main Auth Container */}
      <div className="w-full max-w-lg mx-auto my-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
          {/* Header Switcher (Visible when not in admin mode) */}
          {authMode !== 'admin_login' ? (
            <div className="flex border-b border-slate-200 bg-slate-50/80">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-3.5 text-center text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                लॉगिन (Sign In)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-3.5 text-center text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                नया खाता बनाएं (Sign Up)
              </button>
            </div>
          ) : (
            /* Admin Mode Header */
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="font-extrabold text-sm sm:text-base">
                  एडमिन सुरक्षा लॉगिन (Admin Login)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                ← सामान्य यूजर लॉगिन
              </button>
            </div>
          )}

          {/* Feedback messages */}
          <div className="p-6 pb-0">
            {errorMsg && (
              <div className="mb-4 bg-rose-50 border border-rose-300 text-rose-800 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 font-medium animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 font-medium animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          {/* 1. USER LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="p-6 pt-2 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  यूजरनेम या मोबाइल नंबर (Username / Mobile): *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="उदा. user1 या 9876543210"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none normal-case"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    पासवर्ड (Password): *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModalOpen(true);
                      setForgotFeedback({ type: '', message: '' });
                    }}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    पासवर्ड भूल गए?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="पासवर्ड दर्ज करें"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-10 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none normal-case"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Math Captcha */}
              <MathCaptcha
                key={loginCaptchaKey}
                value={loginCaptchaInput}
                onChange={(e) => setLoginCaptchaInput(e.target.value)}
                onRefresh={(ans) => setLoginExpectedCaptcha(ans)}
                label="गणितीय सुरक्षा कैप्चा: *"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>लॉगिन करें (Sign In)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Credentials */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>डेमो खाता: <strong>user1</strong> (पासवर्ड: <strong>User@123</strong>)</span>
                <button
                  type="button"
                  onClick={() => {
                    setLoginUsername('user1');
                    setLoginPassword('User@123');
                  }}
                  className="text-indigo-600 hover:underline font-semibold cursor-pointer"
                >
                  ऑटो भरें
                </button>
              </div>
            </form>
          )}

          {/* 2. SIGN UP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="p-6 pt-2 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Owner Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    दुकानदार / ओनर का नाम: *
                  </label>
                  <input
                    type="text"
                    required
                    value={signupData.ownerName}
                    onChange={(e) => setSignupData({ ...signupData, ownerName: e.target.value })}
                    placeholder="उदा. रमेश कुमार (प्रो.)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Shop Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    दुकान / फर्म का नाम: *
                  </label>
                  <input
                    type="text"
                    required
                    value={signupData.shopName}
                    onChange={(e) => setSignupData({ ...signupData, shopName: e.target.value })}
                    placeholder="उदा. श्री गणेश ट्रेडर्स"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Mobile */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    मोबाइल नंबर (10-अंक): *
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={signupData.mobile}
                    onChange={(e) => setSignupData({ ...signupData, mobile: e.target.value.replace(/\D/g, '') })}
                    placeholder="98XXXXXXXX"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ईमेल आईडी (वैकल्पिक):
                  </label>
                  <input
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="shop@example.com"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none normal-case"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  दुकान / प्रतिष्ठान का पता: *
                </label>
                <input
                  type="text"
                  required
                  value={signupData.address}
                  onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                  placeholder="उदा. मेन मार्केट, रेलवे स्टेशन रोड, भारत"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  लॉगिन यूजरनेम (Username): *
                </label>
                <input
                  type="text"
                  required
                  value={signupData.username}
                  onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                  placeholder="उदा. ramesh_traders"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none normal-case"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    पासवर्ड सेट करें: *
                  </label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="पासवर्ड लिखें"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none normal-case"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    पासवर्ड की पुष्टि करें: *
                  </label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    placeholder="पासवर्ड दोबारा लिखें"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none normal-case"
                  />
                </div>
              </div>

              {/* Math Captcha */}
              <MathCaptcha
                key={signupCaptchaKey}
                value={signupCaptchaInput}
                onChange={(e) => setSignupCaptchaInput(e.target.value)}
                onRefresh={(ans) => setSignupExpectedCaptcha(ans)}
                label="गणितीय सुरक्षा कैप्चा: *"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-200 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>खाता बनाएं व तुरंत शुरू करें (Register & Launch)</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 3. ADMIN LOGIN FORM */}
          {authMode === 'admin_login' && (
            <form onSubmit={handleAdminLoginSubmit} className="p-6 pt-2 space-y-4">
              <div className="bg-slate-900 text-slate-200 p-3 rounded-xl text-xs space-y-1">
                <p className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>सिस्टम व्यवस्थापक प्रमाणीकरण</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  यह केवल मुख्य एडमिनिस्ट्रेटर के लिए है। सभी सेलर और पासवर्ड नियंत्रण यहां से होते हैं।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  एडमिन यूजरनेम: *
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-slate-800 focus:outline-none normal-case"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  एडमिन मास्टर पासवर्ड: *
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="एडमिन पासवर्ड"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-slate-800 focus:outline-none normal-case"
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
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>एडमिन कंट्रोल पैनल में प्रवेश करें</span>
              </button>

              <div className="text-center pt-2">
                <span className="text-[11px] text-slate-400">
                  डिफ़ॉल्ट एडमिन क्रेडेंशियल्स: <strong>admin</strong> / <strong>Admin@123</strong>
                </span>
              </div>
            </form>
          )}
        </div>

        {/* BOTTOM DISCRETE ADMIN ICON (निचला छोटा एडमिन बटन) */}
        {authMode !== 'admin_login' && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setAuthMode('admin_login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-white/80 hover:bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              title="सिस्टम एडमिनिस्ट्रेटर लॉगिन"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>एडमिन पोर्टल (Admin Login)</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <footer className="w-full text-center text-xs text-slate-400 py-2">
        स्मार्ट बिलिंग सॉफ्टवेयर • 100% सुरक्षित और ऑफलाइन समर्थित
      </footer>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  पासवर्ड रीसेट करें (Forgot Password)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleForgotSubmit} className="p-5 space-y-3.5">
              {forgotFeedback.message && (
                <div className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  forgotFeedback.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {forgotFeedback.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
                  <span>{forgotFeedback.message}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  पंजीकृत यूजरनेम (Username): *
                </label>
                <input
                  type="text"
                  required
                  value={forgotUsername}
                  onChange={(e) => setForgotUsername(e.target.value)}
                  placeholder="उदा. user1"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none normal-case"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  पंजीकृत 10-अंकों का मोबाइल नंबर: *
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={forgotMobile}
                  onChange={(e) => setForgotMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="98XXXXXXXX"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  नया पासवर्ड सेट करें: *
                </label>
                <input
                  type="text"
                  required
                  minLength={4}
                  value={forgotNewPass}
                  onChange={(e) => setForgotNewPass(e.target.value)}
                  placeholder="नया पासवर्ड लिखें"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none normal-case"
                />
              </div>

              {/* Math Captcha */}
              <MathCaptcha
                key={forgotCaptchaKey}
                value={forgotCaptchaInput}
                onChange={(e) => setForgotCaptchaInput(e.target.value)}
                onRefresh={(ans) => setForgotExpectedCaptcha(ans)}
                label="सुरक्षा सत्यापन गणितीय कैप्चा: *"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  पासवर्ड रीसेट करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
