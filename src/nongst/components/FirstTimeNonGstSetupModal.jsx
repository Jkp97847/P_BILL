import React, { useState } from 'react';
import { 
  Building2, 
  CreditCard, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Sparkles,
  Receipt
} from 'lucide-react';
import {
  formatMobileInput,
  validateMobile,
  formatIfscInput,
  validateIfsc,
  formatUpiInput,
  validateUpi,
  formatAccountNoInput,
  validateAccountNo
} from '../../utils/validation';

export default function FirstTimeNonGstSetupModal({ initialSettings = {}, onSave, onExit }) {
  const [formData, setFormData] = useState({
    firmName: initialSettings.firmName || '',
    tagline: initialSettings.tagline || 'होलसेल एवं रिटेल जनरल मर्चेंट',
    ownerName: initialSettings.ownerName || '',
    mobile: initialSettings.mobile || '',
    alternateMobile: initialSettings.alternateMobile || '',
    email: initialSettings.email || '',
    address: initialSettings.address || '',
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

    // 5. Bank Details
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
    setSuccessMsg('✅ नॉन-जीएसटी फर्म व बैंक विवरण सुरक्षित हो रहा है...');

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
      <div className="bg-white text-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border-2 border-emerald-400 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-5 sm:p-6 relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-emerald-300 shadow-inner">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    टैब 2 • प्रथम बार सेटअप (Mandatory)
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-1 tracking-tight">
                  Non GST All Only Billing: फर्म व बैंक विवरण भरें
                </h2>
                <p className="text-xs text-emerald-200 mt-0.5">
                  नॉन-जीएसटी बिलिंग शुरू करने हेतु अपनी फर्म व बैंक जानकारी भरें। यह विवरण केवल टैब 2 के लिए स्वतंत्र रहेगा।
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

          {/* SECTION 1: NON-GST FIRM PROFILE */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>1. दुकान / फर्म का विवरण (Shop Profile)</span>
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
                  placeholder="उदा. श्री गणेश जनरल स्टोर"
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  टैगलाइन / उप-शीर्षक (Tagline)
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="उदा. होलसेल एवं रिटेल किराना मर्चेंट"
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  मालिक / प्रोपराइटर का नाम *
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="उदा. राजेश कुमार"
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

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
                  placeholder="9876543210"
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  दुकान का पूरा पता *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="दुकान नं. 12, मेन मार्केट, भारत"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ईमेल पता (Email - ऐच्छिक)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="store@example.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: BANK & UPI QR CODE */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>2. बैंक खाता व UPI QR कोड (Bank & UPI Details)</span>
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
                  placeholder="SBI / BOB / PNB"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500"
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
                  placeholder="12345678901"
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full px-3 py-2 text-xs font-mono uppercase font-bold border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500"
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
                  placeholder="ganesh@okhdfcbank"
                  className="w-full px-3 py-2 text-xs font-mono font-bold text-emerald-800 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="sm:w-2/3 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'सुरक्षित हो रहा है...' : 'सुरक्षित करें व Non-GST बिलिंग शुरू करें ➔'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
