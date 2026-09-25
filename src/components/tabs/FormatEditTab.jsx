import React, { useState, useEffect } from 'react';
import { useBilling } from '../../context/BillingContext';
import { useAuth } from '../../context/AuthContext';
import PrintableBill from '../PrintableBill';
import { 
  Building2, 
  Palette, 
  CheckSquare, 
  Square, 
  Save, 
  RotateCcw, 
  Eye, 
  Phone, 
  MapPin, 
  CreditCard, 
  FileText, 
  Sparkles, 
  CheckCircle,
  Upload,
  Trash2,
  Plus,
  Percent,
  Lock,
  AlertTriangle,
  X
} from 'lucide-react';
import {
  formatPanInput,
  validatePan,
  formatGstinInput,
  validateGstin,
  formatMobileInput,
  validateMobile,
  formatEmailInput,
  validateEmail,
  formatIfscInput,
  validateIfsc,
  formatUpiInput,
  validateUpi,
  formatAccountNoInput,
  validateAccountNo
} from '../../utils/validation';

const GST_THEMES = [
  {
    id: 'classic',
    name: 'Theme 1: Classic Tax Invoice',
    desc: 'मानक सरकारी प्रारूप, द्वि-स्तरीय बॉर्डर, विस्तृत टैक्स ब्रेकअप व बैंक बॉक्स',
    badge: 'मानक / Popular',
    color: 'from-slate-800 to-slate-900',
    border: 'border-slate-800'
  },
  {
    id: 'modern',
    name: 'Theme 2: Modern Corporate',
    desc: 'टेक-ब्लू ग्रेडिएंट हेडर, स्लीक कार्ड्स व आधुनिक मोबाइल शॉप टाइपोग्राफी',
    badge: 'टेक-ब्लू / Modern',
    color: 'from-indigo-800 to-blue-900',
    border: 'border-indigo-600'
  },
  {
    id: 'compact',
    name: 'Theme 3: Compact Retail',
    desc: 'सघन फॉन्ट व कॉम्पैक्ट पैडिंग, सिंगल A4 पेज पर 10 पंक्तियों का सटीक फिट',
    badge: 'स्पेस सेवर / 1-Page',
    color: 'from-slate-600 to-slate-700',
    border: 'border-slate-600'
  },
  {
    id: 'royal',
    name: 'Theme 4: Royal Showroom',
    desc: 'लक्जरी पर्पल-गोल्ड एक्सेंट, प्रीमियम इलेक्ट्रॉनिक्स व मोबाइल शोरूम लेआउट',
    badge: 'प्रीमियम / Luxury',
    color: 'from-purple-900 to-indigo-950',
    border: 'border-purple-800'
  },
  {
    id: 'emerald',
    name: 'Theme 5: Emerald Business',
    desc: 'प्रीमियम एमराल्ड ग्रीन, सत्यापित जीएसटी अनुपालन स्टैम्प व क्लीन टेबल',
    badge: 'फॉर्मल / Business',
    color: 'from-emerald-800 to-teal-950',
    border: 'border-emerald-700'
  },
  {
    id: 'minimal',
    name: 'Theme 6: Minimalist Monochrome',
    desc: 'अल्ट्रा-क्लीन ब्लैक एंड व्हाइट मोनोक्रोम, इंक व टोनर की बचत हेतु सटीक लेआउट',
    badge: 'इंक सेवर / B&W',
    color: 'from-zinc-800 to-black',
    border: 'border-black'
  },
  {
    id: 'crimson',
    name: 'Theme 7: Ruby Crimson Elite',
    desc: 'शाही रूबी लाल बॉर्डर, प्रीमियम डिजिटल गैजेट्स व लक्जरी फोन शोरूम इनवॉइस',
    badge: 'रूबी लक्जरी / Crimson',
    color: 'from-rose-800 to-red-950',
    border: 'border-rose-800'
  },
  {
    id: 'ocean',
    name: 'Theme 8: Ocean Tech Navy',
    desc: 'गहरा नेवी ब्लू व टेक-सियान एक्सेंट, मॉडर्न गैजेट्स, कंप्यूटर्स व आईटी बिलिंग',
    badge: 'टेक नेवी / Ocean',
    color: 'from-sky-900 to-blue-950',
    border: 'border-sky-800'
  },
  {
    id: 'amber',
    name: 'Theme 9: Golden Amber Luxury',
    desc: 'वार्म एम्बर व ब्रॉन्ज गोल्ड एक्सेंट, प्रीमियम शोरूम व एक्सेसरीज बुटीक थीम',
    badge: 'गोल्डन एम्बर / Gold',
    color: 'from-amber-800 to-yellow-950',
    border: 'border-amber-700'
  },
  {
    id: 'slate',
    name: 'Theme 10: Titanium Slate Precision',
    desc: 'टाइटैनियम ग्रेफाइट व चारकोल स्लेट, इंडस्ट्रियल ग्रेड प्रेसिजन हार्डवेयर बिलिंग',
    badge: 'टाइटैनियम / Slate',
    color: 'from-slate-700 to-zinc-900',
    border: 'border-slate-800'
  }
];

export default function FormatEditTab() {
  const { currentUser, saveUserGstin, checkUserHasGstin } = useAuth();
  const { 
    settings, 
    updateSettings, 
    resetSettings, 
    gstBills, 
    addGstSlab, 
    removeGstSlab,
    addItemGstRule,
    removeItemGstRule,
    resetItemGstRules
  } = useBilling();

  // Determine if user has already logged in with or established a GST number
  const hadExistingGstin = Boolean(
    (settings?.gstin && String(settings.gstin).trim().length >= 10) ||
    (currentUser?.profile?.gstin && String(currentUser.profile.gstin).trim().length >= 10) ||
    (checkUserHasGstin && checkUserHasGstin(currentUser))
  );

  // Active form state
  const [formData, setFormData] = useState({
    ...settings,
    gstSlabs: settings.gstSlabs || [0, 5, 12, 18, 28],
    defaultCustomerAddress: settings.defaultCustomerAddress || 'स्थानीय / सीकर (राजस्थान)',
    displayOptions: {
      ...settings.displayOptions
    }
  });

  const [activeSubTab, setActiveSubTab] = useState('themes'); // 'themes' | 'visibility' | 'profile' | 'gst'
  const [newSlabRate, setNewSlabRate] = useState('');
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleRate, setNewRuleRate] = useState('18');
  const [newRuleHsn, setNewRuleHsn] = useState('');
  const [ruleSearch, setRuleSearch] = useState('');
  const [notification, setNotification] = useState(null);

  // Sync when settings change
  useEffect(() => {
    setFormData({
      ...settings,
      gstSlabs: settings.gstSlabs || [0, 5, 12, 18, 28],
      defaultCustomerAddress: settings.defaultCustomerAddress || 'स्थानीय / सीकर (राजस्थान)',
      displayOptions: {
        ...settings.displayOptions
      }
    });
  }, [settings]);

  // Field change
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Instant Theme Selection with Auto-Save
  const handleSelectTheme = (themeId, themeName) => {
    handleChange('selectedTheme', themeId);
    updateSettings({ ...formData, selectedTheme: themeId });
    setNotification(`थीम "${themeName}" सक्रिय की गई! दाईं ओर लाइव बिल में इसका प्रभाव देखें।`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Toggle display visibility check/uncheck
  const handleToggleOption = (key) => {
    setFormData(prev => ({
      ...prev,
      displayOptions: {
        ...prev.displayOptions,
        [key]: !prev.displayOptions[key]
      }
    }));
  };

  // GST Slabs Add / Remove
  const handleAddSlab = (e) => {
    e.preventDefault();
    const rate = parseFloat(newSlabRate);
    if (isNaN(rate) || rate < 0) {
      alert('कृपया वैध GST दर (जैसे 3, 5, 12 आदि) दर्ज करें।');
      return;
    }
    const current = formData.gstSlabs || [0, 5, 12, 18, 28];
    if (current.includes(rate)) {
      alert(`यह GST दर (${rate}%) पहले से सूची में मौजूद है!`);
      return;
    }
    const updated = [...current, rate].sort((a, b) => a - b);
    setFormData(prev => ({ ...prev, gstSlabs: updated }));
    setNewSlabRate('');
    setNotification(`नई GST दर ${rate}% जोड़ दी गई! 'सेटिंग्स सुरक्षित करें' पर क्लिक करें।`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRemoveSlab = (rateToRemove) => {
    const current = formData.gstSlabs || [0, 5, 12, 18, 28];
    if (current.length <= 1) {
      alert('कम से कम एक GST स्लैब होना अनिवार्य है!');
      return;
    }
    const updated = current.filter(r => r !== rateToRemove);
    setFormData(prev => ({ ...prev, gstSlabs: updated }));
    setNotification(`GST दर ${rateToRemove}% हटा दी गई! 'सेटिंग्स सुरक्षित करें' पर क्लिक करें।`);
    setTimeout(() => setNotification(null), 3500);
  };

  // Item GST Rules Add / Remove / Reset
  const handleAddItemRule = (e) => {
    e.preventDefault();
    if (!newRuleName.trim()) {
      alert('कृपया आइटम का नाम दर्ज करें (उदा. Mobile, Charger, Battery आदि)');
      return;
    }
    const rate = parseFloat(newRuleRate);
    if (isNaN(rate) || rate < 0) {
      alert('कृपया वैध GST दर चुनें।');
      return;
    }
    addItemGstRule({
      itemName: newRuleName.trim(),
      gstRate: rate,
      hsn: newRuleHsn.trim()
    });
    setNewRuleName('');
    setNewRuleHsn('');
    setNotification(`आइटम "${newRuleName.trim()}" हेतु ${rate}% GST नियम सेव हो गया!`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRemoveItemRule = (ruleId, ruleName) => {
    removeItemGstRule(ruleId);
    setNotification(`आइटम "${ruleName}" का GST नियम हटा दिया गया।`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleResetItemRules = () => {
    if (window.confirm('क्या आप सभी आइटम GST नियमों को डिफ़ॉल्ट इलेक्ट्रॉनिक्स सूची पर रीसेट करना चाहते हैं?')) {
      resetItemGstRules();
      setNotification('सभी आइटम GST नियम डिफ़ॉल्ट पर रीसेट कर दिए गए हैं।');
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const activeRules = settings.itemGstRules || [];
  const filteredRules = activeRules.filter(r => 
    !ruleSearch || 
    r.itemName.toLowerCase().includes(ruleSearch.toLowerCase()) || 
    (r.hsn && r.hsn.includes(ruleSearch))
  );

  // Terms management
  const handleTermChange = (index, value) => {
    const updated = [...formData.terms];
    updated[index] = value;
    setFormData(prev => ({ ...prev, terms: updated }));
  };

  const addTerm = () => {
    setFormData(prev => ({
      ...prev,
      terms: [...prev.terms, '']
    }));
  };

  const removeTerm = (index) => {
    setFormData(prev => ({
      ...prev,
      terms: prev.terms.filter((_, i) => i !== index)
    }));
  };

  // Logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('कृपया 1MB से छोटी छवि चुनें।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormData(prev => ({ ...prev, logo: uploadEvent.target?.result || '' }));
    };
    reader.readAsDataURL(file);
  };

  // Save changes with validation
  const handleSave = () => {
    // 1. Mobile 1 validation (if provided)
    if (formData.mobile && formData.mobile.trim()) {
      const mobRes = validateMobile(formData.mobile, false, 'मोबाइल नंबर 1');
      if (!mobRes.isValid) {
        setNotification(`⚠️ ${mobRes.error}`);
        setTimeout(() => setNotification(null), 5000);
        return;
      }
    }

    // 2. Alternate Mobile 2 validation (if provided)
    if (formData.alternateMobile && formData.alternateMobile.trim()) {
      const altRes = validateMobile(formData.alternateMobile, false, 'अतिरिक्त मोबाइल 2');
      if (!altRes.isValid) {
        setNotification(`⚠️ ${altRes.error}`);
        setTimeout(() => setNotification(null), 5000);
        return;
      }
    }

    // 3. Email Address validation (if provided)
    if (formData.email && formData.email.trim()) {
      const emailRes = validateEmail(formData.email, false);
      if (!emailRes.isValid) {
        setNotification(`⚠️ ${emailRes.error}`);
        setTimeout(() => setNotification(null), 5000);
        return;
      }
    }

    // 4. GSTIN Non-Deletion & Format Validation:
    const cleanGst = String(formData.gstin || '').trim().toUpperCase();

    // TAB 1 GST BILLING RULE: GSTIN is strictly compulsory and can NEVER be blank/empty!
    // "TAB 1 ME JO GST BILLING H USKI SETTING ME GSTNO ABHI BHI HAT RAHE H AAP USKO BLANK KARKE SAVE RAKHNE KI PERMISSION MAT DO"
    if (!cleanGst) {
      setNotification('⚠️ सुरक्षा व GST नियम: GST बिलिंग पोर्टल में GSTIN खाली (Blank) करके सेव करने की अनुमति नहीं है! कृपया वैध 15-अक्षरीय GSTIN दर्ज करें। आप GST नंबर बदल सकते हैं, लेकिन हटा नहीं सकते।');
      setTimeout(() => setNotification(null), 6000);
      return;
    }

    const gstRes = validateGstin(cleanGst, true);
    if (!gstRes.isValid) {
      setNotification(`⚠️ ${gstRes.error}`);
      setTimeout(() => setNotification(null), 6000);
      return;
    }

    // Synchronize with Auth Profile
    if (currentUser && saveUserGstin) {
      saveUserGstin(currentUser.id || currentUser.username, cleanGst);
    }

    // 5. PAN Validation (if provided)
    if (formData.pan && formData.pan.trim()) {
      const panRes = validatePan(formData.pan, false);
      if (!panRes.isValid) {
        setNotification(`⚠️ ${panRes.error}`);
        setTimeout(() => setNotification(null), 5000);
        return;
      }
    }

    // 6. Bank Account No Validation (if provided)
    if (formData.accountNo && formData.accountNo.trim()) {
      const accRes = validateAccountNo(formData.accountNo, false);
      if (!accRes.isValid) {
        setNotification(`⚠️ ${accRes.error}`);
        setTimeout(() => setNotification(null), 5000);
        return;
      }
    }

    // 7. IFSC Code Validation (if provided)
    if (formData.ifsc && formData.ifsc.trim()) {
      const ifscRes = validateIfsc(formData.ifsc, false);
      if (!ifscRes.isValid) {
        setNotification(`⚠️ ${ifscRes.error}`);
        setTimeout(() => setNotification(null), 5000);
        return;
      }
    }

    // 8. UPI ID Validation (if provided)
    if (formData.upiId && formData.upiId.trim()) {
      const upiRes = validateUpi(formData.upiId, false);
      if (!upiRes.isValid) {
        setNotification(`⚠️ ${upiRes.error}`);
        setTimeout(() => setNotification(null), 5000);
        return;
      }
    }

    updateSettings({
      ...formData,
      gstin: cleanGst || formData.gstin
    });
    setNotification('दुकान प्रोफाइल, GST दरें, डिफ़ॉल्ट पता व थीम सेटिंग्स सफलतापूर्वक सुरक्षित कर दी गईं!');
    setTimeout(() => setNotification(null), 4000);
  };

  // Demo bill for live preview
  const previewBill = gstBills[0] || {
    billNo: 'GST-2026-101',
    date: new Date().toISOString().split('T')[0],
    customerName: 'रमेश कुमार शर्मा (डेमो ग्राहक)',
    customerMobile: '9829012345',
    customerGstin: '08AABCR1234F1Z1',
    customerAddress: formData.defaultCustomerAddress || 'मेन मार्केट, सीकर',
    theme: formData.selectedTheme || 'classic',
    paymentMode: 'Cash / UPI',
    items: [
      { id: '1', itemNo: 'MOB-001', name: 'Redmi Note 13 Pro 5G (8GB/256GB)', hsn: '8517', qty: 1, unit: 'PCS', rate: 15253.39, taxableAmount: 15253.39, gstRate: 18, cgstAmount: 1372.81, sgstAmount: 1372.81, total: 17999 },
      { id: '2', itemNo: 'BAT-101', name: 'Samsung Original 5000mAh Battery', hsn: '8506', qty: 2, unit: 'PCS', rate: 720.34, taxableAmount: 1440.68, gstRate: 18, cgstAmount: 129.66, sgstAmount: 129.66, total: 1700 },
      { id: '3', itemNo: 'EAR-201', name: 'boAt Rockerz 255 Pro+ Earphone', hsn: '8518', qty: 1, unit: 'PCS', rate: 1016.10, taxableAmount: 1016.10, gstRate: 18, cgstAmount: 91.45, sgstAmount: 91.45, total: 1199 }
    ],
    taxableTotal: 17710.17,
    cgstTotal: 1593.92,
    sgstTotal: 1593.92,
    igstTotal: 0,
    totalGst: 3187.84,
    subTotal: 20898,
    discount: 0,
    roundOff: 0.01,
    grandTotal: 20898
  };

  const previewBillWithTheme = {
    ...previewBill,
    customerAddress: formData.defaultCustomerAddress || previewBill.customerAddress,
    theme: formData.selectedTheme || 'classic'
  };

  return (
    <div className="space-y-6">
      {/* 1. Notification */}
      {notification && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl flex items-center gap-2 shadow-md">
          <CheckCircle className="w-5 h-5" />
          <span className="font-bold text-sm">{notification}</span>
        </div>
      )}

      {/* 2. Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-xs border border-slate-200 gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            थीम, बिल फॉर्मेट, GST दरें एवं दुकान प्रोफाइल (Settings & Live Preview)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            10 विशेष GST थीम्स चुनें, GST दरें व आइटम नियम प्रबंधित करें, ग्राहक का डिफ़ॉल्ट पता तय करें और लाइव देखें
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { resetSettings(); setFormData(settings); }}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>डिफ़ॉल्ट रीसेट</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>सेटिंग्स सुरक्षित करें (Save)</span>
          </button>
        </div>
      </div>

      {/* 3. Sub-Tab Switcher (4 Sub-Tabs) */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-200/70 p-1.5 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveSubTab('themes')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'themes'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>1. 10 जीएसटी थीम्स</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('visibility')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'visibility'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>2. चेक / अनचेक विवरण</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'profile'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>3. दुकान व डिफ़ॉल्ट पता</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('gst')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'gst'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>4. GST दरें व आइटम नियम</span>
        </button>
      </div>

      {/* 4. CONTENT SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4">
          {/* TAB 1: 10 GST THEMES */}
          {activeSubTab === 'themes' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>10 विशेष जीएसटी बिल थीम्स (Choose Bill Theme):</span>
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                बाईं ओर से कोई भी थीम चुनें, दाईं ओर तुरंत उसका लाइव प्रिंट प्रभाव देखें। सेल बिल स्वतः इसी थीम में प्रिंट होगा।
              </p>

              <div className="space-y-2.5 pt-2 max-h-[70vh] overflow-y-auto pr-1">
                {GST_THEMES.map((th) => {
                  const isSelected = (formData.selectedTheme || 'classic') === th.id;
                  return (
                    <div
                      key={th.id}
                      onClick={() => handleSelectTheme(th.id, th.name)}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? `${th.border} bg-indigo-50/60 shadow-sm ring-2 ring-indigo-500/20`
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${th.color}`}></span>
                          <span className="font-extrabold text-sm text-slate-900">{th.name}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                            {th.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-normal pl-5">
                          {th.desc}
                        </p>
                      </div>

                      <div className="shrink-0 pt-0.5">
                        <span
                          className={`inline-block px-2.5 py-1 text-[11px] font-black rounded-lg ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isSelected ? '✓ सक्रिय' : 'चुनें'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CHECK / UNCHECK VISIBILITY */}
          {activeSubTab === 'visibility' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  <span>बिल में कौन-कौन सी जानकारियां दिखें (चेक / अनचेक):</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  चेकबॉक्स पर क्लिक करते ही दाईं ओर लाइव बिल में वह भाग तुरंत दिखेगा या छिपेगा।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs font-semibold text-slate-800">
                {[
                  { key: 'showFirmName', label: 'दुकान का नाम (Firm Name)' },
                  { key: 'showTagline', label: 'टैगलाइन / स्लोगन (Tagline)' },
                  { key: 'showGaneshLogo', label: '॥ श्री गणेशाय नमः ॥ मंत्र' },
                  { key: 'showLogo', label: 'दुकान का लोगो (Logo)' },
                  { key: 'showAddress', label: 'दुकान का पता (Address)' },
                  { key: 'showMobile', label: 'मोबाइल नंबर 1' },
                  { key: 'showAlternateMobile', label: 'मोबाइल नंबर 2' },
                  { key: 'showEmail', label: 'ईमेल आईडी (Email ID)' },
                  { key: 'showGstin', label: 'GSTIN (जीएसटी नंबर)' },
                  { key: 'showPan', label: 'PAN नंबर' },
                  { key: 'showState', label: 'राज्य एवं कोड (State Code)' },
                  { key: 'showCustomerDetails', label: 'ग्राहक का विवरण (Customer Info)' },
                  { key: 'showHsn', label: 'HSN कोड कॉलम' },
                  { key: 'showTaxBreakup', label: 'टैक्स विभाजन (CGST + SGST)' },
                  { key: 'showBankDetails', label: 'बैंक खाता विवरण (Bank Info)' },
                  { key: 'showUpiQr', label: 'UPI QR कोड (Scan & Pay)' },
                  { key: 'showWords', label: 'शब्दों में कुल राशि (In Words)' },
                  { key: 'showTerms', label: 'नियम एवं शर्तें (Terms)' },
                  { key: 'showSignatory', label: 'हस्ताक्षरकर्ता बॉक्स (Signatory)' }
                ].map(({ key, label }) => {
                  const isChecked = Boolean(formData.displayOptions?.[key]);
                  return (
                    <label
                      key={key}
                      onClick={() => handleToggleOption(key)}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SELLER / SHOP PROFILE & DEFAULT CUSTOMER ADDRESS */}
          {activeSubTab === 'profile' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>दुकान विवरण एवं ग्राहक का डिफ़ॉल्ट पता:</span>
              </h3>

              <div className="space-y-3">
                {/* Firm Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">दुकान / फर्म का नाम</label>
                  <input
                    type="text"
                    value={formData.firmName}
                    onChange={(e) => handleChange('firmName', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900"
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">टैगलाइन / स्लोगन</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700"
                  />
                </div>

                {/* Shop Address */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">दुकान का पूरा पता</label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700"
                  />
                </div>

                {/* Default Customer Address: AS REQUESTED */}
                <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-200">
                  <label className="block font-bold text-indigo-950 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-700" />
                    <span>ग्राहक का डिफ़ॉल्ट पता (Default Customer Address)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.defaultCustomerAddress}
                    onChange={(e) => handleChange('defaultCustomerAddress', e.target.value)}
                    placeholder="उदा. स्थानीय / सीकर (राजस्थान)"
                    className="w-full px-3 py-2 border border-indigo-300 rounded-lg bg-white text-slate-900 font-medium"
                  />
                  <p className="text-[11px] text-indigo-700 mt-1">
                    यह पता नए बिल में ग्राहक के पते में स्वतः (Default) भरा हुआ आएगा।
                  </p>
                </div>

                {/* Phones */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">मोबाइल नंबर 1</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={formData.mobile}
                      onKeyDown={(e) => {
                        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => handleChange('mobile', formatMobileInput(e.target.value))}
                      placeholder="10 अंकों का मोबाइल"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">अतिरिक्त मोबाइल 2</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={formData.alternateMobile}
                      onKeyDown={(e) => {
                        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => handleChange('alternateMobile', formatMobileInput(e.target.value))}
                      placeholder="10 अंकों का वैकल्पिक मोबाइल"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>

                {/* Email & State */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ईमेल पता</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', formatEmailInput(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">राज्य (State)</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* GSTIN & PAN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>GSTIN नंबर <span className="text-red-500 font-black">*</span></span>
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-amber-700" />
                        <span>खाली छोड़ना प्रतिबंधित (बदलाव मान्य)</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={formData.gstin || ''}
                      onChange={(e) => {
                        const val = formatGstinInput(e.target.value);
                        let nextPan = formData.pan;
                        if (val.length >= 12 && (!formData.pan || (formData.gstin?.length >= 12 && formData.pan === formData.gstin.slice(2, 12)))) {
                          nextPan = val.slice(2, 12);
                        }
                        setFormData(prev => ({ ...prev, gstin: val, pan: nextPan }));
                      }}
                      placeholder="15 अक्षरों का GSTIN (उदा. 08ABCDE1234F1Z5)"
                      className={`w-full px-3 py-2 border rounded-lg font-mono uppercase font-bold text-indigo-900 transition-all ${
                        !formData.gstin ? 'border-red-500 bg-red-50 ring-2 ring-red-200' : 'border-slate-300'
                      }`}
                    />
                    {!formData.gstin ? (
                      <p className="text-[11px] text-red-600 font-bold mt-1">
                        ⚠️ GSTIN अनिवार्य है: इसे खाली नहीं छोड़ा जा सकता! नया GSTIN दर्ज करें।
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        * सुरक्षा नियम: GST बिलिंग में GSTIN अनिवार्य है। आवश्यकतानुसार नया GSTIN दर्ज कर बदल सकते हैं, खाली नहीं छोड़ सकते।
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">PAN नंबर</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={formData.pan}
                      onChange={(e) => handleChange('pan', formatPanInput(e.target.value))}
                      placeholder="10 अक्षरों का PAN (उदा. ABCDE1234F)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase font-bold"
                    />
                  </div>
                </div>

                {/* Bank Details */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="font-bold text-slate-800 mb-2">बैंक खाता विवरण:</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">बैंक का नाम</label>
                      <input
                        type="text"
                        value={formData.bankName}
                        onChange={(e) => handleChange('bankName', e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">खाता संख्या (A/C No)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={18}
                        value={formData.accountNo}
                        onKeyDown={(e) => {
                          if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => handleChange('accountNo', formatAccountNoInput(e.target.value))}
                        placeholder="केवल बैंक खाता अंक (9-18 अंक)"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">IFSC कोड</label>
                      <input
                        type="text"
                        maxLength={11}
                        value={formData.ifsc}
                        onChange={(e) => handleChange('ifsc', formatIfscInput(e.target.value))}
                        placeholder="उदा. SBIN0031245"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">UPI आईडी</label>
                      <input
                        type="text"
                        value={formData.upiId}
                        onChange={(e) => handleChange('upiId', formatUpiInput(e.target.value))}
                        placeholder="उदा. shyam@okhdfcbank"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-800">नियम व शर्तें (Terms):</span>
                    <button
                      type="button"
                      onClick={addTerm}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>शर्त जोड़ें</span>
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {formData.terms.map((term, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-mono w-4">{i + 1}.</span>
                        <input
                          type="text"
                          value={term}
                          onChange={(e) => handleTermChange(i, e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeTerm(i)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signatory Text */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block font-bold text-slate-700 mb-1">हस्ताक्षरकर्ता पदनाम</label>
                  <input
                    type="text"
                    value={formData.signatoryText}
                    onChange={(e) => handleChange('signatoryText', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GST SLABS & ITEM GST RULES MANAGEMENT: AS REQUESTED */}
          {activeSubTab === 'gst' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5 text-xs">
              {/* Part A: GST Slabs */}
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-indigo-600" />
                  <span>GST दरें (GST Slabs - 0%, 5%, 12%, 18%, 28% आदि):</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  यहाँ से आप बिलिंग और खरीद के लिए सक्रिय GST दरें जोड़ या हटा सकते हैं।
                </p>
              </div>

              {/* Current Active Slabs List */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">सक्रिय GST दरें (Active Slabs):</span>
                <div className="flex flex-wrap gap-2">
                  {(formData.gstSlabs || [0, 5, 12, 18, 28]).map((slab) => (
                    <div
                      key={slab}
                      className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-indigo-950 font-bold text-xs shadow-2xs"
                    >
                      <span className="font-mono text-sm">{slab}%</span>
                      {formData.gstSlabs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlab(slab)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                          title={`${slab}% दर हटाएं`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New GST Slab */}
              <div className="pt-3 border-t border-slate-200">
                <span className="font-bold text-slate-700 block mb-1.5">नई GST दर जोड़ें:</span>
                <form onSubmit={handleAddSlab} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max="100"
                      value={newSlabRate}
                      onChange={(e) => setNewSlabRate(e.target.value)}
                      placeholder="उदा. 3 या 10"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer text-xs shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>दर जोड़ें (+ Add)</span>
                  </button>
                </form>
                <p className="text-[11px] text-slate-500 mt-1">
                  जैसे: गोल्ड/ज्वेलरी के लिए 3%, या कोई विशेष छूट हेतु 0%।
                </p>
              </div>

              {/* Part B: Item Name to GST Rate Auto-fill Rules */}
              <div className="pt-4 border-t-2 border-indigo-100 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>आइटम नाम अनुसार GST दर ऑटो-फिल नियम (Auto-Fill Rules):</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      बिल बनाते समय आइटम नाम लिखते ही GST दर अपने आप भर जाएगी।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetItemRules}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer w-fit"
                    title="डिफ़ॉल्ट इलेक्ट्रॉनिक्स आइटम नियमों पर रीसेट करें"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>डिफ़ॉल्ट रीसेट</span>
                  </button>
                </div>

                {/* Add Item Rule Form */}
                <form onSubmit={handleAddItemRule} className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">नया आइटम GST नियम जोड़ें:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] text-slate-600 font-semibold mb-0.5">
                        आइटम का नाम / कीवर्ड *
                      </label>
                      <input
                        type="text"
                        value={newRuleName}
                        onChange={(e) => setNewRuleName(e.target.value)}
                        placeholder="उदा. Mobile, Charger, Battery..."
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] text-slate-600 font-semibold mb-0.5">
                        GST दर (%) *
                      </label>
                      <select
                        value={newRuleRate}
                        onChange={(e) => setNewRuleRate(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold font-mono bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        {(formData.gstSlabs || [0, 5, 12, 18, 28]).map((slab) => (
                          <option key={slab} value={slab}>
                            {slab}% GST
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] text-slate-600 font-semibold mb-0.5">
                        HSN कोड
                      </label>
                      <input
                        type="text"
                        value={newRuleHsn}
                        onChange={(e) => setNewRuleHsn(e.target.value)}
                        placeholder="उदा. 8517"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer text-xs shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>नियम जोड़ें (+ Save Rule)</span>
                    </button>
                  </div>
                </form>

                {/* Filter and Rules Count */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1">
                  <div className="font-bold text-slate-700 text-xs flex items-center gap-2">
                    <span>सक्रिय आइटम नियम ({activeRules.length}):</span>
                    {activeRules.length > 0 && (
                      <span className="text-[10px] font-normal text-slate-500">
                        (सेल में नाम लिखते ही दर अपने आप भरेगी)
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={ruleSearch}
                    onChange={(e) => setRuleSearch(e.target.value)}
                    placeholder="नियम खोजें (उदा. mobile, 18)..."
                    className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs w-full sm:w-48 outline-none"
                  />
                </div>

                {/* Rules List Grid */}
                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50/50 space-y-1.5 divide-y divide-slate-100">
                  {filteredRules.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      कोई आइटम नियम नहीं मिला। ऊपर दिए फॉर्म से नया नियम जोड़ें।
                    </div>
                  ) : (
                    filteredRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 shadow-2xs hover:border-indigo-200 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-slate-900 text-xs capitalize">
                            {rule.itemName}
                          </span>
                          <span className="bg-indigo-100 text-indigo-900 font-mono font-black text-[11px] px-2 py-0.5 rounded-full border border-indigo-200">
                            {rule.gstRate}% GST
                          </span>
                          {rule.hsn && (
                            <span className="bg-slate-100 text-slate-600 font-mono text-[10px] px-1.5 py-0.5 rounded">
                              HSN: {rule.hsn}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRule(rule.id, rule.itemName)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                          title="नियम हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Save Button */}
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>सेटिंग्स लागू करें व सेव करें (Apply & Save)</span>
          </button>
        </div>

        {/* RIGHT COLUMN: LIVE BILL PREVIEW */}
        <div className="lg:col-span-7 xl:col-span-7 sticky top-4 self-start bg-slate-100 p-4 sm:p-5 rounded-2xl border-2 border-dashed border-indigo-200 shadow-inner">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-slate-900 text-base">
                लाइव बिल फॉर्मेट प्रीव्यू (Live Bill Preview)
              </h3>
            </div>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>सक्रिय: {GST_THEMES.find(t => t.id === (formData.selectedTheme || 'classic'))?.name || 'Theme 1: Classic Tax Invoice'}</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-3">
            (बाईं ओर किसी भी थीम पर क्लिक करें, दाईं ओर तुरंत उसका वास्तविक स्वरूप देखें - 10 फिक्स्ड रो टेबल)
          </p>

          {/* Live Bill Component rendered with immediate changes */}
          <div className="bg-white rounded-xl shadow-lg p-2 overflow-x-auto">
            <PrintableBill bill={previewBillWithTheme} settings={formData} />
          </div>
        </div>
      </div>
    </div>
  );
}
