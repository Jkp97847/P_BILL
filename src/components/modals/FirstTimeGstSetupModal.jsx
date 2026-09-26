import React, { useState } from 'react';
import { 
  Building2, 
  CreditCard, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Lock,
  Sparkles
} from 'lucide-react';
import {
  formatPanInput,
  validatePan,
  formatGstinInput,
  validateGstin,
  formatMobileInput,
  validateMobile,
  formatIfscInput,
  validateIfsc,
  formatUpiInput,
  validateUpi,
  formatAccountNoInput,
  validateAccountNo
} from '../../utils/validation';

export default function FirstTimeGstSetupModal({ initialSettings = {}, onSave, onExit }) {
  const [formData, setFormData] = useState({
    firmName: initialSettings.firmName || '',
    tagline: initialSettings.tagline || 'मोबाइल, लैपटॉप एवं इलेक्ट्रॉनिक्स सेल्स व सर्विस',
    ownerName: initialSettings.ownerName || '',
    mobile: initialSettings.mobile || '',
    alternateMobile: initialSettings.alternateMobile || '',
    email: initialSettings.email || '',
    address: initialSettings.address || '',
    state: initialSettings.state || 'Rajasthan',
    stateCode: initialSettings.stateCode || '08',
    pincode: initialSettings.pincode || '',
    gstin: initialSettings.gstin || '',
    pan: initialSettings.pan || '',
    bankName: initialSettings.bankName || '',
    accountNo: initialSettings.accountNo || '',
    ifsc: initialSettings.ifsc || '',
    upiId: initialSettings.upiId || ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Firm Name
    if (!formData.firmName.trim()) {
      setErrorMsg('दुकान / फर्म का नाम (Firm Name) दर्ज करना अनिवार्य है!');
      return;
    }

    // 2. Owner Name
    if (!formData.ownerName.trim()) {
      setErrorMsg('प्रोपराइटर / मालिक का नाम दर्ज करना अनिवार्य है!');
      return;
    }

    // 3. Mobile Number
    const mobRes = validateMobile(formData.mobile, true, 'मोबाइल नंबर');
    if (!mobRes.isValid) {
      setErrorMsg(mobRes.error);
      return;
    }

    // 4. Address
    if (!formData.address.trim()) {
      setErrorMsg('दुकान का पूरा पता दर्ज करना अनिवार्य है!');
      return;
    }

    // 5. State
    if (!formData.state.trim()) {
      setErrorMsg('राज्य (State) दर्ज करना अनिवार्य है!');
      return;
    }

    // 6. GSTIN (Compulsory in Tab 1)
    const gstRes = validateGstin(formData.gstin, true);
    if (!gstRes.isValid) {
      setErrorMsg(`GSTIN त्रुटि: ${gstRes.error}`);
      return;
    }

    // 7. PAN Number
    const panRes = validatePan(formData.pan, true);
    if (!panRes.isValid) {
      setErrorMsg(`PAN त्रुटि: ${panRes.error}`);
      return;
    }

    // 8. Bank Details
    if (!formData.bankName.trim()) {
      setErrorMsg('बैंक का नाम दर्ज करना अनिवार्य है!');
      return;
    }

    const accRes = validateAccountNo(formData.accountNo, true);
    if (!accRes.isValid) {
      setErrorMsg(accRes.error);
      return;
    }

    const ifscRes = validateIfsc(formData.ifsc, true);
    if (!ifscRes.isValid) {
      setErrorMsg(ifscRes.error);
      return;
    }

    const upiRes = validateUpi(formData.upiId, true);
    if (!upiRes.isValid) {
      setErrorMsg(upiRes.error);
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg('✅ GST फर्म व बैंक विवरण सुरक्षित हो रहा है...');

    setTimeout(() => {
      onSave({
        ...initialSettings,
        ...formData,
        isConfigured: true
      });
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border-2 border-indigo-400 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-5 sm:p-6 relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-indigo-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    टैब 1 • प्रथम बार सेटअप (Mandatory)
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-1 tracking-tight">
                  Smart GST Billing: फर्म व बैंक विवरण भरें
                </h2>
                <p className="text-xs text-indigo-200 mt-0.5">
                  GST बिल बनाने से पूर्व अपनी फर्म व बैंक जानकारी भरें। यह केवल टैब 1 के लिए सुरक्षित होगी।
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onExit}
              className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
              title="मुख्य हब पर वापस जाएं"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">मुख्य हब</span>
            </button>
          </div>
        </div>

        {/* MODAL FORM BODY */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SECTION 1: FIRM & PROPRIETOR */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>1. फर्म / दुकान का विवरण (Shop Profile)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  दुकान / फर्म का नाम (Shop Name) *
                </label>
                <input
                  type="text"
                  value={formData.firmName}
                  onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                  placeholder="उदा. श्री श्याम मोबाइल & इलेक्ट्रॉनिक्स"
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  प्रोपराइटर / मालिक का नाम *
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="उदा. रमेश कुमार शर्मा"
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  मोबाइल नंबर (बिल पर प्रिंट) *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.mobile}
                  onKeyDown={(e) => {
                    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => setFormData({ ...formData, mobile: formatMobileInput(e.target.value) })}
                  placeholder="9829012345"
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  वैकल्पिक मोबाइल नं. 2 (ऐच्छिक)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.alternateMobile}
                  onKeyDown={(e) => {
                    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => setFormData({ ...formData, alternateMobile: formatMobileInput(e.target.value) })}
                  placeholder="वैकल्पिक मोबाइल"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ईमेल पता (Email)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="shop@example.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  दुकान का पूरा पता *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="दुकान नं. 5, मुख्य बाजार, स्टेशन रोड"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  राज्य (State) *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Rajasthan"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  राज्य कोड (State Code) *
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.stateCode}
                  onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
                  placeholder="08"
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: GST & TAXATION (MANDATORY IN TAB 1) */}
          <div className="bg-indigo-50/50 p-4 rounded-2xl border-2 border-indigo-200 space-y-3">
            <span className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-700" />
                <span>2. जीएसटी व पैन विवरण (GST & Taxation - अनिवार्य)</span>
              </span>
              <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                GSTIN अनिवार्य
              </span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>GSTIN नंबर (15 अक्षर) *</span>
                  <span className="text-[10px] text-indigo-700 font-semibold">अनिवार्य</span>
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={formData.gstin}
                  onChange={(e) => {
                    const val = formatGstinInput(e.target.value);
                    let nextPan = formData.pan;
                    if (val.length >= 12 && (!formData.pan || (formData.gstin.length >= 12 && formData.pan === formData.gstin.slice(2, 12)))) {
                      nextPan = val.slice(2, 12);
                    }
                    setFormData({ ...formData, gstin: val, pan: nextPan });
                  }}
                  placeholder="08AAAAA0000A1Z5"
                  className="w-full px-3 py-2 text-xs font-mono uppercase font-bold text-indigo-900 border-2 border-indigo-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  PAN नंबर (10 अक्षर) *
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: formatPanInput(e.target.value) })}
                  placeholder="AAAAA0000A"
                  className="w-full px-3 py-2 text-xs font-mono uppercase font-bold border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: BANK & UPI QR DETAILS */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>3. बैंक खाता व UPI QR कोड (Bank & UPI Details)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  बैंक का नाम *
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="SBI / HDFC / PNB"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  खाता संख्या (A/C No) *
                </label>
                <input
                  type="text"
                  maxLength={18}
                  value={formData.accountNo}
                  onKeyDown={(e) => {
                    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => setFormData({ ...formData, accountNo: formatAccountNoInput(e.target.value) })}
                  placeholder="123456789012"
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  IFSC कोड *
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={formData.ifsc}
                  onChange={(e) => setFormData({ ...formData, ifsc: formatIfscInput(e.target.value) })}
                  placeholder="SBIN0031245"
                  className="w-full px-3 py-2 text-xs font-mono uppercase font-bold border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  UPI ID (QR हेतु) *
                </label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: formatUpiInput(e.target.value) })}
                  placeholder="shop@okhdfcbank"
                  className="w-full px-3 py-2 text-xs font-mono font-bold text-emerald-800 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onExit}
              className="sm:w-1/3 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>मुख्य हब पर वापस जाएं</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="sm:w-2/3 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'सुरक्षित हो रहा है...' : 'सुरक्षित करें व Smart GST Billing शुरू करें ➔'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
