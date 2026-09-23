import React, { useState } from 'react';
import { useBilling } from '../../context/BillingContext';
import { useToast } from '../../context/ToastContext';
import PrintableBill from '../PrintableBill';
import GaneshLogo from '../GaneshLogo';
import DigitalSignatureBadge from '../DigitalSignatureBadge';
import { 
  Building2, 
  Settings, 
  Upload, 
  Trash2, 
  Plus, 
  CheckCircle, 
  CheckCircle2,
  RotateCcw, 
  Save, 
  Eye, 
  Image as ImageIcon,
  ShieldCheck,
  Phone,
  MapPin,
  FileSignature,
  Sliders,
  Mail,
  Palette,
  Sparkles
} from 'lucide-react';

const THEME_OPTIONS = [
  {
    id: 'classic',
    name: '1. क्लासिक जीएसटी',
    badge: 'Classic Slate',
    tag: 'पारंपरिक एवं स्टैंडर्ड व्यापारिक बिल',
    border: 'border-slate-800',
    accent: 'bg-slate-800 text-white'
  },
  {
    id: 'modern',
    name: '2. मॉडर्न इंडिगो',
    badge: 'Modern Indigo',
    tag: 'आधुनिक एवं आकर्षक कॉर्पोरेट लेआउट',
    border: 'border-indigo-600',
    accent: 'bg-indigo-600 text-white'
  },
  {
    id: 'compact',
    name: '3. कॉम्पैक्ट रसीद',
    badge: 'Compact POS',
    tag: 'फास्ट 1-पेज रसीद, कम मार्जिन व स्याही बचत',
    border: 'border-zinc-700',
    accent: 'bg-zinc-700 text-white'
  },
  {
    id: 'minimalist',
    name: '4. मिनिमलिस्ट ब्लैक',
    badge: 'Minimal High-Contrast',
    tag: 'स्पष्ट डार्क बॉर्डर, शार्प मोनोक्रोम प्रिंट',
    border: 'border-black',
    accent: 'bg-black text-white'
  },
  {
    id: 'royal',
    name: '5. रॉयल पर्पल',
    badge: 'Royal Showroom',
    tag: 'शानदार शोरूम, ज्वैलरी व प्रीमियम स्टोर',
    border: 'border-purple-800',
    accent: 'bg-purple-900 text-white'
  },
  {
    id: 'emerald',
    name: '6. एमराल्ड ग्रीन',
    badge: 'Emerald Green',
    tag: 'स्वच्छ हरा रंग, किराना, कृषि व नेचुरल',
    border: 'border-emerald-700',
    accent: 'bg-emerald-700 text-white'
  },
  {
    id: 'crimson',
    name: '7. क्रिम्सन रूबी',
    badge: 'Crimson Ruby',
    tag: 'बोल्ड रेड, गारमेंट्स व ऑटोमोबाइल्स',
    border: 'border-rose-700',
    accent: 'bg-rose-700 text-white'
  },
  {
    id: 'ocean',
    name: '8. ओशन स्यान',
    badge: 'Ocean Cyan',
    tag: 'शांत ब्लू टोन, इलेक्ट्रॉनिक्स व हार्डवेयर',
    border: 'border-cyan-700',
    accent: 'bg-cyan-800 text-white'
  },
  {
    id: 'amber',
    name: '9. एम्बर गोल्ड',
    badge: 'Amber Gold',
    tag: 'गोल्डन एम्बर, मिठाई, गिफ्ट व वेडिंग',
    border: 'border-amber-700',
    accent: 'bg-amber-700 text-white'
  },
  {
    id: 'slate',
    name: '10. ग्रेफाइट स्लेट',
    badge: 'Graphite Slate',
    tag: 'आधुनिक इंजीनियरिंग, मशीनरी व हैवी गुड्स',
    border: 'border-slate-700',
    accent: 'bg-slate-700 text-white'
  }
];

export default function FormatEditTab() {
  const { settings, updateSettings, setTheme, resetSettings } = useBilling();
  const { showToast } = useToast();

  // Local form state cloned from settings
  const [formData, setFormData] = useState({
    ...settings,
    selectedTheme: settings.selectedTheme || 'classic',
    ownerName: settings.ownerName || 'राजेश कुमार (प्रोपराइटर)',
    signatoryText: settings.signatoryText || 'अधिकृत हस्ताक्षरकर्ता / Authorized Signatory',
    displayOptions: {
      showFirmName: true,
      showTagline: true,
      showLogo: true,
      showAddress: true,
      showMobile: true,
      showAlternateMobile: true,
      showEmail: true,
      showGstin: true,
      showGaneshLogo: true,
      showTerms: true,
      showSignatory: true,
      showWords: true,
      ...(settings.displayOptions || {})
    }
  });

  const [notification, setNotification] = useState(null);

  // Field change for top-level settings
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Toggle display visibility flags
  const handleDisplayToggle = (optionKey) => {
    setFormData(prev => ({
      ...prev,
      displayOptions: {
        ...prev.displayOptions,
        [optionKey]: !prev.displayOptions[optionKey]
      }
    }));
  };

  // Terms & Conditions editing
  const handleTermChange = (index, value) => {
    const updatedTerms = [...formData.terms];
    updatedTerms[index] = value;
    setFormData(prev => ({ ...prev, terms: updatedTerms }));
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

  // Logo upload to Base64
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('कृपया 1MB से छोटी छवि चुनें।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target.result;
      setFormData(prev => ({ ...prev, logo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: '' }));
  };

  // Select Active Theme among 10 options
  const handleSelectTheme = (themeId, themeName) => {
    setFormData(prev => ({ ...prev, selectedTheme: themeId }));
    setTheme(themeId);
    showToast('success', `${themeName} फॉर्मेट सक्रिय किया गया! अब सभी बिल इसी डिजाइन में बनेंगे।`, 'थीम सफलतापूर्वक लागू की गई');
  };

  // Save Settings
  const handleSave = (e) => {
    e?.preventDefault();
    updateSettings(formData);
    showToast('success', 'बिल फॉर्मेट और फर्म सेटिंग्स सफलतापूर्वक सेव कर ली गईं!', 'सेटिंग्स सुरक्षित');
    setNotification('बिल फॉर्मेट और फर्म सेटिंग्स सफलतापूर्वक सेव कर ली गईं!');
    setTimeout(() => setNotification(null), 3500);
  };

  // Reset to Defaults
  const handleReset = () => {
    if (window.confirm('क्या आप सभी सेटिंग्स को डिफ़ॉल्ट रूप में रीसेट करना चाहते हैं?')) {
      resetSettings();
      showToast('info', 'सेटिंग्स डिफ़ॉल्ट पर रीसेट कर दी गईं!', 'डिफ़ॉल्ट रीसेट');
      setNotification('सेटिंग्स डिफ़ॉल्ट पर रीसेट कर दी गईं!');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Sample bill data for live preview
  const sampleBillForPreview = {
    id: 'sample-format-bill',
    billNo: `${formData.billPrefix || 'INV-'}${formData.nextBillSeq || 1001}`,
    date: new Date().toISOString().split('T')[0],
    customerName: 'श्री राजेश कुमार (नमूना ग्राहक)',
    customerMobile: '9876500000',
    items: [
      { id: '1', name: 'सैंपल आइटम 1 (उच्च गुणवत्ता)', qty: 2, price: 450, total: 900 },
      { id: '2', name: 'सैंपल आइटम 2 (स्टैंडर्ड पैक)', qty: 1, price: 250, total: 250 }
    ],
    grandTotal: 1150
  };

  const disp = formData.displayOptions;

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-lg flex items-center justify-between font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs cursor-pointer">✕</button>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            <span>बिल फॉर्मेट और फर्म विवरण एडिट करें (Bill Format Edit)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            विक्रेता की कौन सी जानकारी बिल में दिखेगी और कौन सी नहीं, इसका पूरा नियंत्रण आपके हाथ में है।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>डिफ़ॉल्ट सेटिंग्स</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>सेटिंग्स सेव करें (Save Format)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION: 10 BILL DESIGN THEMES */}
        <div className="bg-white rounded-xl shadow-xs border-2 border-indigo-200 p-5">
          <div className="border-b border-indigo-100 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-600" />
                <span>10 बिल डिजाइन थीम्स (Choose from 10 Professional Bill Formats)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                अपनी पसंद का कोई भी 1 फॉर्मेट चुनें। चुने जाने के बाद बिल जनरेशन, प्रीव्यू, प्रिंट व रिपोर्ट्स में वही फॉर्मेट काम करेगा।
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              <span>सक्रिय: {THEME_OPTIONS.find(t => t.id === (formData.selectedTheme || 'classic'))?.name || '1. क्लासिक जीएसटी'}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {THEME_OPTIONS.map((th) => {
              const isSelected = (formData.selectedTheme || 'classic') === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => handleSelectTheme(th.id, th.name)}
                  className={`text-left p-3.5 rounded-xl border-2 transition-all relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? `${th.border} bg-indigo-50/50 shadow-md ring-2 ring-indigo-500 ring-offset-1`
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${th.accent}`}>
                        {th.badge}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300"></span>
                      )}
                    </div>

                    <div className="font-black text-xs text-slate-900 leading-snug">
                      {th.name}
                    </div>

                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-tight">
                      {th.tag}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className={`font-semibold ${isSelected ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                      {isSelected ? '✓ एक्टिव फॉर्मेट' : 'क्लिक कर सेट करें'}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">10 Rows</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION: Seller & Bill Details Display Visibility Control */}
        <div className="bg-white rounded-xl shadow-xs border-2 border-indigo-100 p-5">
          <div className="border-b border-indigo-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <span>विक्रेता / बिल जानकारी प्रदर्शन नियंत्रण (Show / Hide Details)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              अपनी पसंद के अनुसार चुनें कि बिल में विक्रेता (Saler) की कौन सी जानकारी दिखाई देनी चाहिए और कौन सी नहीं:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Show Firm Name */}
            <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-lg border border-slate-200 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={disp.showFirmName}
                onChange={() => handleDisplayToggle('showFirmName')}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">
                🏢 फर्म का नाम (Firm Name)
              </span>
            </label>

            {/* Show Tagline */}
            <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-lg border border-slate-200 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={disp.showTagline}
                onChange={() => handleDisplayToggle('showTagline')}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">
                🏷️ टैगलाइन / व्यवसाय प्रकार
              </span>
            </label>

            {/* Show Logo */}
            <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-lg border border-slate-200 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={disp.showLogo}
                onChange={() => handleDisplayToggle('showLogo')}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">
                🖼️ फर्म का लोगो (Logo)
              </span>
            </label>

            {/* Show Address */}
            <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-lg border border-slate-200 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={disp.showAddress}
                onChange={() => handleDisplayToggle('showAddress')}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">
                📍 दुकान का पता (Address)
              </span>
            </label>

            {/* Show Mobile in Upper Right */}
            <label className="flex items-center gap-3 p-3 bg-amber-50/70 hover:bg-amber-100/60 rounded-lg border border-amber-300 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={disp.showMobile}
                onChange={() => handleDisplayToggle('showMobile')}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-900">
                📞 मुख्य मोबाइल (Top Right)
              </span>
            </label>

            {/* Show Alternate Mobile in Upper Right */}
            <label className="flex items-center gap-3 p-3 bg-amber-50/70 hover:bg-amber-100/60 rounded-lg border border-amber-300 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={disp.showAlternateMobile}
                onChange={() => handleDisplayToggle('showAlternateMobile')}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-900">
                📞 दूसरा मोबाइल (Top Right)
              </span>
            </label>

            {/* Show Email in Upper Right */}
            <label className="flex items-center gap-3 p-3 bg-amber-50/70 hover:bg-amber-100/60 rounded-lg border border-amber-300 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={disp.showEmail}
                onChange={() => handleDisplayToggle('showEmail')}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-900">
                ✉️ ईमेल आईडी (Top Right)
              </span>
            </label>

            {/* Show GSTIN */}
            <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-lg border border-slate-200 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={disp.showGstin}
                onChange={() => handleDisplayToggle('showGstin')}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">
                📑 GSTIN / पैन नंबर
              </span>
            </label>

            {/* Show Shree Ganesh */}
            <label className="flex items-center gap-3 p-3 bg-red-50 hover:bg-red-100/60 rounded-lg border border-red-200 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={disp.showGaneshLogo}
                onChange={() => handleDisplayToggle('showGaneshLogo')}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-red-900">
                卐 श्री गणेशाय नमः हेडर
              </span>
            </label>

            {/* Show Terms */}
            <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-lg border border-slate-200 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={disp.showTerms}
                onChange={() => handleDisplayToggle('showTerms')}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">
                📌 3 मुख्य नियम व शर्तें
              </span>
            </label>

            {/* Show Green Digital Verified Signature on Right Side */}
            <label className="flex items-center gap-3 p-3 bg-emerald-50/80 hover:bg-emerald-100/70 rounded-lg border border-emerald-300 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={disp.showSignatory}
                onChange={() => handleDisplayToggle('showSignatory')}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-emerald-950">
                ✅ हरा डिजिटल सिग्नेचर (Digital Verified Badge - Right)
              </span>
            </label>

            {/* Show Words */}
            <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-lg border border-slate-200 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={disp.showWords}
                onChange={() => handleDisplayToggle('showWords')}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">
                🔤 शब्दों में कुल राशि (Words)
              </span>
            </label>
          </div>
        </div>

        {/* SECTION 1: Shree Ganesh Header Settings */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
              <span className="text-red-600 text-lg">卐</span>
              <span>श्री गणेशाय नमः हेडर सेटिंग्स (Shree Ganesh Header)</span>
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showGaneshLogo}
                onChange={(e) => handleChange('showGaneshLogo', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              <span className="ml-2 text-xs font-semibold text-slate-700">
                {formData.showGaneshLogo ? 'सक्रिय (On)' : 'निष्क्रिय (Off)'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                हेडर श्लोक / टेक्स्ट (Mantra Text):
              </label>
              <input
                type="text"
                value={formData.ganeshText}
                onChange={(e) => handleChange('ganeshText', e.target.value)}
                placeholder="॥ श्री गणेशाय नमः ॥"
                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 font-serif text-red-900 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                यह टेक्स्ट और पावन गणेश चिन्ह प्रत्येक बिल के सबसे ऊपर केंद्र में प्रदर्शित होगा।
              </p>
            </div>

            <div className="bg-red-50/70 border border-red-200 rounded-lg p-3 text-center">
              <GaneshLogo
                showLogo={formData.showGaneshLogo && disp.showGaneshLogo}
                text={formData.ganeshText}
                size="md"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Firm Details & Logo Upload */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
          <h3 className="font-bold text-slate-900 text-sm md:text-base mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span>फर्म विवरण और लोगो (Firm Profile & Logo)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Firm Name & Tagline */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  फर्म / दूकान का नाम (Firm Name) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firmName}
                  onChange={(e) => handleChange('firmName', e.target.value)}
                  placeholder="उदा. श्री गणेश ट्रेडर्स"
                  className="w-full text-base font-bold bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  टैगलाइन / व्यवसाय का प्रकार (Tagline / Slogan)
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  placeholder="उदा. होलसेल एवं रिटेल विक्रेता"
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  <span>दुकान / फर्म का पूरा पता (Address - नाम के नीचे दिखेगा) *</span>
                </label>
                <textarea
                  rows="2"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="उदा. दुकान नं. 12, मेन मार्केट, स्टेशन रोड, सुजानगढ़"
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Owner Mobile & Email info alert */}
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-900 font-medium">
                👉 <strong>ध्यान दें:</strong> नीचे दर्ज किए गए <strong>मोबाइल नंबर</strong> और <strong>ईमेल आईडी</strong> पते के नीचे नहीं, बल्कि बिल के <strong>ऊपरी दाहिने कोने (Upper Right)</strong> में प्रदर्शित होंगे।
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-indigo-500" />
                    <span>मुख्य मोबाइल नंबर (Primary Mobile - Top Right)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    placeholder="उदा. 9876543210"
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    अतिरिक्त मोबाइल / फोन नं. (Alt Mobile - Top Right)
                  </label>
                  <input
                    type="text"
                    value={formData.alternateMobile}
                    onChange={(e) => handleChange('alternateMobile', e.target.value)}
                    placeholder="उदा. 9123456789"
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    <span>ईमेल आईडी (Email ID - Top Right)</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="shreeganesh@example.com"
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    GSTIN / पैन नं. (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => handleChange('gstin', e.target.value)}
                    placeholder="08AAAAA0000A1Z5"
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Logo Upload Box */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-slate-50">
              <span className="text-xs font-bold text-slate-700 mb-1">
                फर्म का लोगो (Top-Left Corner)
              </span>
              <span className="text-[10px] text-slate-400 mb-2">
                (बिल के सबसे ऊपर बाएं कोने में दिखेगा)
              </span>

              {formData.logo ? (
                <div className="space-y-3">
                  <div className="w-32 h-32 mx-auto border border-slate-200 bg-white rounded-lg p-2 shadow-xs flex items-center justify-center">
                    <img
                      src={formData.logo}
                      alt="Logo Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold flex items-center gap-1 mx-auto transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>लोगो हटाएं</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 py-4">
                  <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>लोगो चुनें (JPG/PNG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    अधिकतम साइज़: 1 MB (PNG या JPG)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Information & Terms and Conditions */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>बिल की सूचना एवं नियम (Information / Terms & Conditions)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                नीचे दी गई तीनों मुख्य शर्तें डिफ़ॉल्ट रूप से शामिल हैं। आप इन्हें संपादित कर सकते हैं।
              </p>
            </div>

            <button
              type="button"
              onClick={addTerm}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>नया नियम जोड़ें</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.terms.map((term, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="font-bold text-slate-500 text-sm w-6 text-center">
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => handleTermChange(index, e.target.value)}
                  placeholder={`शर्त सं. ${index + 1}`}
                  className="flex-1 text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeTerm(index)}
                  disabled={formData.terms.length <= 1}
                  className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
                  title="इस शर्त को हटाएं"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 bg-amber-50 rounded-lg p-2.5 text-xs text-amber-800 border border-amber-200">
            💡 <strong>नोट:</strong> आपकी मांग के अनुसार मुख्य तीन सूचनाएं शामिल हैं:
            <span className="italic ml-1">"1. बिका हुआ माल चेक करके लें", "2. गारंटी / वारंटी के लिए कंपनी से संपर्क करें", "3. भूल चूक लेनी देनी होगी।"</span>
          </div>
        </div>

        {/* SECTION 4: Green Digital Signature & Numbering Settings */}
        <div className="bg-white rounded-xl shadow-xs border-2 border-emerald-200 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-100 pb-3 mb-4 gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-xs">✓</span>
                <span>हरा डिजिटल सिग्नेचर सत्यापन (Green Digital Signature & Verified Badge)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                भौतिक हस्ताक्षर व रबर मोहर की आवश्यकता को समाप्त करने के लिए बिल में अधिकृत हरा डिजिटल सत्यापन बैज दिखाया जाता है।
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>100% साइन व मोहर मुक्त</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left side input fields */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <span className="text-emerald-600 font-bold">👤</span>
                  <span>दुकान मालिक / प्रोपराइटर का नाम (Shop Owner / Proprietor Name): *</span>
                </label>
                <input
                  type="text"
                  value={formData.ownerName || ''}
                  onChange={(e) => handleChange('ownerName', e.target.value)}
                  placeholder="उदा. राजेश कुमार (प्रोपराइटर)"
                  className="w-full text-sm font-bold bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  यह नाम हरे डिजिटल सिग्नेचर बैज में <strong>"Verified By (सत्यापित कर्ता)"</strong> के रूप में दिखेगा।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  सत्यापनकर्ता पदनाम (Designation / Title):
                </label>
                <input
                  type="text"
                  value={formData.signatoryText || ''}
                  onChange={(e) => handleChange('signatoryText', e.target.value)}
                  placeholder="उदा. अधिकृत हस्ताक्षरकर्ता / Authorized Signatory"
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    बिल नंबर प्रीफिक्स (Bill Prefix):
                  </label>
                  <input
                    type="text"
                    value={formData.billPrefix}
                    onChange={(e) => handleChange('billPrefix', e.target.value)}
                    placeholder="INV- या BILL-"
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    अगला क्रम संख्या (Next Bill Sequence):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.nextBillSeq}
                    onChange={(e) => handleChange('nextBillSeq', parseInt(e.target.value) || 1)}
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Right side live badge preview */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wide">
                डिजिटल सत्यापन का लाइव नमूना (Badge Preview)
              </span>
              <DigitalSignatureBadge
                ownerName={formData.ownerName}
                firmName={formData.firmName}
                signatoryText={formData.signatoryText}
                date={sampleBillForPreview.date}
              />
              <span className="text-[10px] text-emerald-700 font-medium mt-2.5">
                ✓ बिल प्रिंट करते समय यही हरा बैज नीचे दाहिनी तरफ दिखेगा
              </span>
            </div>
          </div>
        </div>

        {/* Form Bottom Actions */}
        <div className="flex items-center justify-end gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
          >
            डिफ़ॉल्ट सेटिंग्स रीसेट करें
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>फॉर्मेट सेटिंग्स सुरक्षित करें (Save Changes)</span>
          </button>
        </div>
      </form>

      {/* Live Bill Template Preview */}
      <div className="bg-slate-200/90 p-5 rounded-2xl border border-slate-300 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-600" />
            <span>वर्तमान सेटिंग्स के अनुसार लाइव बिल फॉर्मेट का नमूना (Live Format Preview)</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            (ऊपर सेटिंग्स बदलते ही तुरंत यहां लाइव बदलाव देखें)
          </span>
        </div>

        <div className="bg-white p-2 rounded-xl shadow-md overflow-x-auto">
          <PrintableBill bill={sampleBillForPreview} settings={formData} />
        </div>
      </div>
    </div>
  );
}
