import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Receipt, 
  ShoppingCart, 
  CreditCard, 
  ScanBarcode, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  LogOut, 
  User, 
  Building2, 
  Phone, 
  Sparkles, 
  ArrowRight,
  AlertTriangle,
  Info,
  X,
  FileCheck2,
  Check,
  MapPin
} from 'lucide-react';
import {
  formatGstinInput,
  validateGstin
} from '../../utils/validation';

const GST_STATE_MAP = {
  '01': 'Jammu & Kashmir (जम्मू और कश्मीर)',
  '02': 'Himachal Pradesh (हिमाचल प्रदेश)',
  '03': 'Punjab (पंजाब)',
  '04': 'Chandigarh (चंडीगढ़)',
  '05': 'Uttarakhand (उत्तराखंड)',
  '06': 'Haryana (हरियाणा)',
  '07': 'Delhi (दिल्ली)',
  '08': 'Rajasthan (राजस्थान)',
  '09': 'Uttar Pradesh (उत्तर प्रदेश)',
  '10': 'Bihar (बिहार)',
  '11': 'Sikkim (सिक्किम)',
  '12': 'Arunachal Pradesh (अरुणाचल प्रदेश)',
  '13': 'Nagaland (नागालैंड)',
  '14': 'Manipur (मणिपुर)',
  '15': 'Mizoram (मिजोरम)',
  '16': 'Tripura (त्रिपुरा)',
  '17': 'Meghalaya (मेघालय)',
  '18': 'Assam (असम)',
  '19': 'West Bengal (पश्चिम बंगाल)',
  '20': 'Jharkhand (झारखंड)',
  '21': 'Odisha (ओडिशा)',
  '22': 'Chhattisgarh (छत्तीसगढ़)',
  '23': 'Madhya Pradesh (मध्य प्रदेश)',
  '24': 'Gujarat (गुजरात)',
  '27': 'Maharashtra (महाराष्ट्र)',
  '29': 'Karnataka (कर्नाटक)',
  '30': 'Goa (गोवा)',
  '32': 'Kerala (केरल)',
  '33': 'Tamil Nadu (तमिलनाडु)',
  '36': 'Telangana (तेलंगाना)',
  '37': 'Andhra Pradesh (आंध्र प्रदेश)'
};

export default function ChoicePortalHub({ initialGstinModalOpen = false }) {
  const { 
    currentUser, 
    logout, 
    setSelectedModule, 
    setActiveAdminView,
    checkUserHasGstin,
    saveUserGstin,
    impersonatedSeller,
    stopImpersonation
  } = useAuth();

  const [deniedModal, setDeniedModal] = useState({ isOpen: false, moduleName: '' });
  const [comingSoonModal, setComingSoonModal] = useState({ isOpen: false, moduleName: '' });

  // GSTIN Mandatory Requirement Modal State for Tab 1
  const [gstinModalOpen, setGstinModalOpen] = useState(Boolean(initialGstinModalOpen));
  const [gstinInput, setGstinInput] = useState('');
  const [gstinError, setGstinError] = useState('');
  const [gstinSuccess, setGstinSuccess] = useState('');
  const [isSavingGstin, setIsSavingGstin] = useState(false);

  useEffect(() => {
    if (initialGstinModalOpen) {
      setGstinModalOpen(true);
    }
  }, [initialGstinModalOpen]);

  const shopName = currentUser?.profile?.shopName || 'स्मार्ट बिलिंग सॉफ्टवेयर';
  const ownerName = currentUser?.profile?.ownerName || currentUser?.profile?.name || currentUser?.username;
  const mobile = currentUser?.profile?.mobile;
  const isAdmin = currentUser?.role === 'superadmin';

  // Allowed module checks
  const modules = currentUser?.allowedModules || {
    gst_billing: true,
    nongst_billing: true,
    receipt_billing: true,
    pos_billing: true
  };

  // Check if current user has GST number
  const userHasGst = checkUserHasGstin ? checkUserHasGstin(currentUser) : false;

  const handleSelectModule = (key, route) => {
    // If Admin disabled this module for user
    if (modules[key] === false && !isAdmin) {
      setDeniedModal({
        isOpen: true,
        moduleName: getModuleName(key)
      });
      return;
    }

    // If coming soon modules (Option 4 POS Billing)
    if (key === 'pos_billing') {
      setComingSoonModal({
        isOpen: true,
        moduleName: getModuleName(key)
      });
      return;
    }

    // Launch module directly (each tab handles its own first-time onboarding modal)
    setSelectedModule(route);
  };

  const handleSaveGstinAndLaunch = (e) => {
    if (e) e.preventDefault();
    setGstinError('');
    setGstinSuccess('');

    const clean = formatGstinInput(gstinInput);

    const gstRes = validateGstin(clean, true);
    if (!gstRes.isValid) {
      setGstinError(gstRes.error);
      return;
    }

    setIsSavingGstin(true);
    try {
      const res = saveUserGstin(currentUser.id || currentUser.username, clean);
      if (res && res.success) {
        setGstinSuccess('✅ GSTIN नंबर सफलतापूर्वक सुरक्षित हो गया! Smart GST Billing में प्रवेश किया जा रहा है...');
        setTimeout(() => {
          setIsSavingGstin(false);
          setGstinModalOpen(false);
          setSelectedModule('gst_billing');
        }, 500);
      } else {
        setIsSavingGstin(false);
        setGstinError(res?.error || 'GSTIN सुरक्षित करने में त्रुटि आई। कृपया पुनः प्रयास करें।');
      }
    } catch (err) {
      setIsSavingGstin(false);
      setGstinError('GSTIN सुरक्षित करने में तकनीकी समस्या आई।');
    }
  };

  const handleCancelGstinModal = () => {
    setGstinModalOpen(false);
    setGstinError('');
    setGstinSuccess('');
    setSelectedModule('hub');
  };

  const getModuleName = (key) => {
    switch (key) {
      case 'gst_billing': return '1. Smart GST Billing (स्मार्ट GST बिलिंग)';
      case 'nongst_billing': return '2. Non GST All Only Billing (नॉन-GST रिटेल बिलिंग)';
      case 'receipt_billing': return '3. Premium Receipt Billing (प्रीमियम रसीद बिलिंग)';
      case 'pos_billing': return '4. POS & Quick Counter Billing (पीओएस व क्विक काउंटर)';
      default: return 'मॉड्यूल';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col font-sans select-none">
      {/* 1. TOP BAR */}
      <header className="border-b border-indigo-800/40 bg-slate-950/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Smart Billing Multi-App Hub</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                  v2.5
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                ऑल-इन-वन सेंट्रलाइज्ड बिलिंग एवं इनवॉइसिंग प्लेटफॉर्म
              </p>
            </div>
          </div>

          {/* User info & Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* User Profile Pill */}
            <div className="bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl flex items-center gap-2 text-slate-200">
              <div className="w-6 h-6 rounded-full bg-indigo-600/50 flex items-center justify-center font-bold text-indigo-200">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight text-left">
                <div className="font-bold text-white text-[12px] flex items-center gap-1.5">
                  <span>{ownerName}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                    isAdmin ? 'bg-amber-400 text-amber-950' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {isAdmin ? 'Super Admin' : 'Merchant'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                  {shopName}
                </div>
              </div>
            </div>

            {/* Super Admin Return Button: Only visible if Super Admin is currently viewing a seller's panel */}
            {isAdmin && impersonatedSeller && (
              <button
                type="button"
                onClick={stopImpersonation}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold transition-all shadow-sm cursor-pointer"
                title="वापस सुपर एडमिन कंट्रोल पैनल में लौटें"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">वापस एडमिन पोर्टल</span>
              </button>
            )}

            {/* Logout Button */}
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl font-bold transition-all shadow-sm cursor-pointer"
              title="सॉफ्टवेयर से लॉगआउट करें"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO HEADING SECTION */}
      <section className="text-center pt-8 pb-6 px-4">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{shopName} • {mobile ? `+91-${mobile}` : 'स्मार्ट बिलिंग खाता'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 tracking-tight">
            Welcome to Smart Billing - Please select your choice
          </h2>
          <p className="text-sm sm:text-base text-indigo-200/80 font-medium max-w-2xl mx-auto leading-relaxed">
            कृपया अपने कार्य अनुसार पसंदीदा बिलिंग सॉफ्टवेयर चुनें। सभी विकल्पों के लिए सिंगल साइन-ऑन (SSO) सक्रिय है, जबकि सभी मॉड्यूल्स का डेटा 100% अलग व सुरक्षित रहता है।
          </p>
        </div>
      </section>

      {/* 3. 4-OPTIONS GRID */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* OPTION 1: SMART GST BILLING */}
          <div className="relative group bg-slate-900/90 border-2 border-indigo-500/40 hover:border-indigo-400 rounded-3xl p-6 shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
            
            <div>
              {/* Card Header & Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 group-hover:scale-105 transition-transform">
                  <Receipt className="w-7 h-7 text-indigo-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  {userHasGst ? (
                    <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>सक्रिय (Active)</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>GSTIN आवश्यक</span>
                    </span>
                  )}
                  {modules.gst_billing === false && !isAdmin && (
                    <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                      🔒 लॉक
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl font-black text-white group-hover:text-indigo-200 transition-colors">
                1. Smart GST Billing
              </h3>
              <p className="text-xs text-indigo-300 font-bold mb-3">
                स्मार्ट GST बिलिंग • पूर्ण टैक्स चालान व इन्वेंटरी ERP
              </p>

              {/* Feature Points */}
              <ul className="space-y-2 text-xs text-slate-300 mb-6 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>GST बिक्री (Sale) व टैक्स चालान:</strong> HSN कोड, CGST, SGST, IGST व छूट प्रविष्टि।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>खरीद (Purchase) व स्टॉक:</strong> सप्लायर इनवर्ड, ITC इनपुट क्रेडिट व 1-क्लिक खरीद वाउचर प्रिंट।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>IMEI व सीरियल ट्रैकिंग:</strong> मोबाइल, इलेक्ट्रॉनिक्स व हार्डवेयर हेतु सीरियल मैनेजमेंट।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>10 GST प्रिंट थीम्स व QR कोड:</strong> पेशेवर A4 व A5 इनवॉइस कस्टमाइजेशन।</span>
                </li>
              </ul>
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={() => handleSelectModule('gst_billing', 'gst_billing')}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                modules.gst_billing === false && !isAdmin
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                  : userHasGst
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-indigo-600/30'
                    : 'bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white shadow-amber-600/30 ring-2 ring-amber-400/30'
              }`}
            >
              {modules.gst_billing === false && !isAdmin ? (
                <>
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span>मॉड्यूल लॉक है (अनुमति आवश्यक)</span>
                </>
              ) : !userHasGst ? (
                <>
                  <Receipt className="w-4 h-4 text-amber-300" />
                  <span>GSTIN भरें और Smart GST Billing खोलें</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                <>
                  <span>Smart GST Billing में प्रवेश करें</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* OPTION 2: NON GST ALL ONLY BILLING */}
          <div className="relative group bg-slate-900/90 border-2 border-emerald-500/40 hover:border-emerald-400 rounded-3xl p-6 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
            
            <div>
              {/* Card Header & Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300 group-hover:scale-105 transition-transform">
                  <ShoppingCart className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>सक्रिय (Active)</span>
                  </span>
                  {modules.nongst_billing === false && !isAdmin && (
                    <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                      🔒 लॉक
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl font-black text-white group-hover:text-emerald-200 transition-colors">
                2. Non GST All Only Billing
              </h3>
              <p className="text-xs text-emerald-300 font-bold mb-3">
                नॉन-GST रिटेल बिलिंग • किराना, जनरल स्टोर व दैनिक खुदरा व्यापार
              </p>

              {/* Feature Points */}
              <ul className="space-y-2 text-xs text-slate-300 mb-6 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>सुपरफास्ट 1-क्लिक बिल निर्माण:</strong> बिना टैक्स झंझट के सीधे मात्रा व दर से तुरंत बिल।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>किराना व रिटेल मर्चेंट फ्रेंडली:</strong> दैनिक नकद ग्राहकों हेतु अति-सरल लेआउट।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>बिल रिपोर्ट व री-प्रिंट:</strong> पुराने सभी बिलों की तारीख वार रिपोर्ट और संशोधन।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>10 कस्टमाइजेबल थीम्स व ई-हस्ताक्षर:</strong> फर्म नाम, लोगो, नियम व डिजिटल सत्यापन बैज।</span>
                </li>
              </ul>
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={() => handleSelectModule('nongst_billing', 'nongst_billing')}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                modules.nongst_billing === false && !isAdmin
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-emerald-600/30'
              }`}
            >
              {modules.nongst_billing === false && !isAdmin ? (
                <>
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span>मॉड्यूल लॉक है (अनुमति आवश्यक)</span>
                </>
              ) : (
                <>
                  <span>Non GST Billing में प्रवेश करें</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* OPTION 3: RECHARGE & UTILITY BILL PAYMENT (FULLY INTEGRATED) */}
          <div className="relative group bg-slate-900/90 border-2 border-amber-500/40 hover:border-amber-400 rounded-3xl p-6 shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

            <div>
              {/* Card Header & Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform">
                  <CreditCard className="w-7 h-7 text-amber-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>सक्रिय (Active)</span>
                  </span>
                  {modules.receipt_billing === false && !isAdmin && (
                    <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                      अनुमति आवश्यक
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl font-black text-white group-hover:text-amber-200 transition-colors">
                3. Recharge & Utility Bill Payment
              </h3>
              <p className="text-xs text-amber-300 font-bold mb-3">
                रिचार्ज एवं बिजली बिल • डिस्कॉम, मोबाइल, लैंडलाइन व बीमा रसीद
              </p>

              {/* Feature Points */}
              <ul className="space-y-2 text-xs text-slate-300 mb-6 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>विद्युत डिस्कॉम बिल (JVVNL, AVVNL, JdVVNL):</strong> K-नंबर आधारित त्वरित बिजली बिल भुगतान।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>मोबाइल व फाइबर रिचार्ज:</strong> Jio, Airtel, Vi, BSNL एवं ब्रॉडबैंड रसीद।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>बीमा प्रीमियम भुगतान:</strong> LIC, SBI Life एवं इंश्योरेंस किश्त वाउचर।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>सुविधा शुल्क (CVF) व मुहर:</strong> ₹5 प्रति ₹1000 ऑटो कमीशन व डिजिटल सत्यापित स्टैम्प।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>थर्मल POS व A4 प्रिंट:</strong> 58mm/80mm POS रसीद व A4 स्टैंडर्ड वाउचर।</span>
                </li>
              </ul>
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={() => handleSelectModule('receipt_billing', 'receipt_billing')}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                modules.receipt_billing === false && !isAdmin
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                  : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-amber-600/30'
              }`}
            >
              {modules.receipt_billing === false && !isAdmin ? (
                <>
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span>मॉड्यूल लॉक है (अनुमति आवश्यक)</span>
                </>
              ) : (
                <>
                  <span>Recharge & Utility Portal में प्रवेश करें</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* OPTION 4: POS & QUICK COUNTER BILLING (COMING SOON) */}
          <div className="relative group bg-slate-900/60 border-2 border-slate-700/60 hover:border-purple-500/50 rounded-3xl p-6 shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div>
              {/* Card Header & Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <ScanBarcode className="w-7 h-7 text-purple-400" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full">
                  आगामी सुविधा (Coming Soon)
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl font-black text-white group-hover:text-purple-200 transition-colors">
                4. POS & Quick Counter Billing
              </h3>
              <p className="text-xs text-purple-300 font-bold mb-3">
                पीओएस व क्विक काउंटर बिलिंग • बारकोड स्कैनर व एक्सप्रेस चेकआउट
              </p>

              {/* Feature Points */}
              <ul className="space-y-2 text-xs text-slate-400 mb-6 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>बारकोड गन ऑटो-डिटेक्ट:</strong> किसी भी USB/ब्लूटूथ स्कैनर से सीधे स्कैन व बिल।</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>टच-स्क्रीन काउंटर इंटरफेस:</strong> सुपरमार्केट व रिटेल मार्ट्स हेतु ग्रिड टच पीओएस।</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>दैनिक नकद ड्राअर व शिफ्ट रिपोर्ट:</strong> ऑपरेटर कैश इन/आउट क्लोजिंग समरी।</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>3-सेकंड एक्सप्रेस सेल:</strong> सबसे तेज चेकआउट और तुरंत पर्ची प्रिंट।</span>
                </li>
              </ul>
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={() => handleSelectModule('pos_billing', null)}
              className="w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-purple-300 border border-purple-500/30 shadow-md transition-all cursor-pointer"
            >
              <span>लिंक जल्द जुड़ेगा (Coming Soon)</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </button>
          </div>
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-400">
          Smart Billing Suite • 100% डेटा सुरक्षा • प्रत्येक मॉड्यूल का स्थानीय स्टोरेज पृथक व सुरक्षित
        </p>
      </footer>

      {/* ACCESS DENIED WARNING MODAL */}
      {deniedModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">⚠️ इस मॉड्यूल की अनुमति नहीं है</h3>
                <p className="text-[11px] text-rose-300 font-bold">{deniedModal.moduleName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700">
              सुपर एडमिन द्वारा आपके खाते के लिए यह मॉड्यूल बंद (Disabled) कर दिया गया है। यदि आपको इस मॉड्यूल की आवश्यकता है, तो कृपया मुख्य एडमिनिस्ट्रेटर से संपर्क करें ताकि वे आपके खाते में इस मॉड्यूल को चालू (Enable) कर सकें।
            </p>

            <button
              type="button"
              onClick={() => setDeniedModal({ isOpen: false, moduleName: '' })}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
            >
              समझ गया (Close)
            </button>
          </div>
        </div>
      )}

      {/* COMING SOON MODAL */}
      {comingSoonModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-500 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-indigo-400">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">🚀 मॉड्यूल आगामी अपडेट में</h3>
                  <p className="text-[11px] text-indigo-300 font-bold">{comingSoonModal.moduleName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setComingSoonModal({ isOpen: false, moduleName: '' })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700">
              यह मॉड्यूल विकास प्रक्रिया में है और आपके निर्देशानुसार आगामी अपडेट में इसका सीधा लिंक जोड़ दिया जाएगा। 
              <br /><br />
              वर्तमान में आप <strong>"1. Smart GST Billing"</strong> और <strong>"2. Non GST All Only Billing"</strong> का पूर्ण उपयोग कर सकते हैं।
            </p>

            <button
              type="button"
              onClick={() => setComingSoonModal({ isOpen: false, moduleName: '' })}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
            >
              ठीक है (OK)
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1 GSTIN MANDATORY REQUIREMENT MODAL (जब GST नंबर नहीं भरा हो) */}
      {/* ========================================================================= */}
      {gstinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-indigo-500 rounded-3xl max-w-lg w-full p-6 sm:p-7 text-slate-100 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-indigo-500/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0">
                  <Receipt className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      अनिवार्य विवरण
                    </span>
                    <span className="text-xs text-indigo-300 font-bold">1. Smart GST Billing</span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    GSTIN नंबर दर्ज करें (GSTIN Required)
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelGstinModal}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="रद्द करें (हब पर वापस रहें)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Firm and User Info */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-bold text-white truncate max-w-[200px]">{shopName}</span>
              </div>
              <div className="text-slate-400 font-medium">
                संचालक: <span className="text-indigo-200 font-bold">{ownerName}</span>
              </div>
            </div>

            {/* Notice / Explanation */}
            <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-2xl p-3.5 text-xs text-indigo-200/90 space-y-1.5 leading-relaxed">
              <p className="font-bold text-indigo-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Smart GST Billing का उपयोग करने हेतु GSTIN अनिवार्य है:</span>
              </p>
              <p className="text-[11px] text-slate-300">
                आपने रजिस्ट्रेशन के समय GST नंबर खाली छोड़ दिया था। 1st Tab में मान्य टैक्स इनवॉइस (HSN कोड, CGST, SGST, IGST एवं ITC खरीद क्रेडिट) जारी करने के लिए GSTIN आवश्यक है।
              </p>
              <p className="text-[11px] text-emerald-300 font-semibold">
                👉 कृपया नीचे 15-अंकों का GSTIN दर्ज करके सेव करें। सेव करते ही Smart GST Billing तुरंत खुल जाएगा।
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveGstinAndLaunch} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <label htmlFor="modal_gstin_input" className="font-bold text-slate-200 flex items-center gap-1">
                    <span>15-अंकों का GSTIN नंबर:</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <span className={`text-[11px] font-mono font-bold ${
                    gstinInput.length === 15 ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {gstinInput.length} / 15 अक्षर {gstinInput.length === 15 && '✓'}
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="modal_gstin_input"
                    name="modal_gstin_input"
                    type="text"
                    maxLength={15}
                    placeholder="उदा: 08ABCDE1234F1Z5"
                    value={gstinInput}
                    onChange={(e) => {
                      const val = formatGstinInput(e.target.value);
                      setGstinInput(val);
                      if (gstinError) setGstinError('');
                    }}
                    className="w-full bg-slate-950 border-2 border-indigo-500/60 hover:border-indigo-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40 rounded-xl px-4 py-3.5 text-white font-mono text-base font-black tracking-widest outline-none transition-all placeholder:text-slate-600 placeholder:font-normal placeholder:tracking-normal"
                    autoFocus
                  />
                  {gstinInput.length === 15 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* State & PAN detection helpers */}
                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  {gstinInput.length >= 2 && (
                    <span className="inline-flex items-center gap-1 bg-slate-800 text-indigo-300 px-2.5 py-1 rounded-md border border-slate-700 font-semibold">
                      <MapPin className="w-3 h-3 text-indigo-400" />
                      <span>राज्य: {GST_STATE_MAP[gstinInput.slice(0, 2)] || `राज्य कोड: ${gstinInput.slice(0, 2)}`}</span>
                    </span>
                  )}
                  {gstinInput.length >= 12 && (
                    <span className="inline-flex items-center gap-1 bg-slate-800 text-emerald-300 px-2.5 py-1 rounded-md border border-slate-700 font-mono">
                      <span>PAN: {gstinInput.slice(2, 12)}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {gstinError && (
                <div className="bg-rose-500/10 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-300 flex items-start gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{gstinError}</span>
                </div>
              )}

              {/* Success Message */}
              {gstinSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-3 text-xs text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{gstinSuccess}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelGstinModal}
                  disabled={isSavingGstin}
                  className="w-1/3 py-3 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer text-center"
                >
                  ✕ रद्द करें (हब पर रहें)
                </button>

                <button
                  type="submit"
                  disabled={isSavingGstin}
                  className="w-2/3 py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingGstin ? (
                    <span>सहेज रहे हैं...</span>
                  ) : (
                    <>
                      <FileCheck2 className="w-4 h-4" />
                      <span>सहेजें और Smart GST Billing खोलें</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="text-center pt-1 border-t border-slate-800/80">
              <p className="text-[11px] text-slate-400">
                नोट: यदि आपके पास GST नहीं है तो आप <strong>"2. Non GST All Only Billing"</strong> का उपयोग कर सकते हैं।
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
