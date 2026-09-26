import React, { useState } from 'react';
import { 
  Smartphone, 
  CreditCard, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Sparkles,
  Zap,
  Percent
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

export default function FirstTimeRechargeSetupModal({ initialSettings = {}, onSave, onExit }) {
  const [formData, setFormData] = useState({
    shopName: initialSettings.shopName || '',
    ownerName: initialSettings.ownerName || '',
    shopPhone: initialSettings.shopPhone || '',
    address: initialSettings.address || '',
    bankName: initialSettings.bankName || '',
    accountNumber: initialSettings.accountNumber || '',
    ifscCode: initialSettings.ifscCode || '',
    upiId: initialSettings.upiId || '',
    feeRuleType: initialSettings.feeRuleType || 'slab', // 'slab' | 'flat' | 'percent'
    feePerSlab: initialSettings.feePerSlab || 5,         // ₹5 per ₹1000
    feeSlabUnit: initialSettings.feeSlabUnit || 1000
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Kiosk / Shop Name
    if (!formData.shopName.trim()) {
      setErrorMsg('कियोस्क / दुकान का नाम (Kiosk Name) दर्ज करना अनिवार्य है!');
      return;
    }

    // 2. Agent Name
    if (!formData.ownerName.trim()) {
      setErrorMsg('अधिकृत एजेंट / संचालक का नाम दर्ज करना अनिवार्य है!');
      return;
    }

    // 3. Mobile Number
    const mobRes = validateMobile(formData.shopPhone, true, 'मोबाइल नंबर');
    if (!mobRes.isValid) {
      setErrorMsg(mobRes.error);
      return;
    }

    // 4. Address
    if (!formData.address.trim()) {
      setErrorMsg('कियोस्क / दुकान का पता दर्ज करना अनिवार्य है!');
      return;
    }

    // 5. Bank Details
    if (!formData.bankName.trim()) {
      setErrorMsg('बैंक का नाम दर्ज करना अनिवार्य है!');
      return;
    }

    const accRes = validateAccountNo(formData.accountNumber, true);
    if (!accRes.isValid) {
      setErrorMsg(accRes.error);
      return;
    }

    const ifscRes = validateIfsc(formData.ifscCode, true);
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
    setSuccessMsg('✅ कियोस्क व बैंक विवरण सुरक्षित हो रहा है...');

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
      <div className="bg-white text-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border-2 border-blue-400 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white p-5 sm:p-6 relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-blue-300 shadow-inner">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    टैब 3 • प्रथम बार सेटअप (Mandatory)
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-1 tracking-tight">
                  Recharge & Utilities: कियोस्क व बैंक विवरण भरें
                </h2>
                <p className="text-xs text-blue-200 mt-0.5">
                  रिचार्ज व बिल भुगतान रसीद जारी करने हेतु अपनी दुकान व बैंक जानकारी भरें। यह विवरण केवल टैब 3 के लिए रहेगा।
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

          {/* SECTION 1: KIOSK PROFILE */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>1. कियोस्क / केंद्र का विवरण (Kiosk Profile)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  दुकान / कियोस्क का नाम *
                </label>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  placeholder="उदा. डिजिटल ई-मित्र व रिचार्ज केंद्र"
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  अधिकृत एजेंट / संचालक का नाम *
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="उदा. सुनील कुमार"
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  कियोस्क मोबाइल नंबर (रसीद पर प्रिंट) *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.shopPhone}
                  onKeyDown={(e) => {
                    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => setFormData({ ...formData, shopPhone: formatMobileInput(e.target.value) })}
                  placeholder="9784730824"
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  कियोस्क का पता *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="मुख्य बाजार, सीकर (राज.)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: BANK & UPI QR CODE */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>2. बैंक खाता व UPI QR कोड (Bank & Payment Slip Info)</span>
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
                  placeholder="State Bank of India"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
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
                  value={formData.accountNumber}
                  onKeyDown={(e) => {
                    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => setFormData({ ...formData, accountNumber: formatAccountNoInput(e.target.value) })}
                  placeholder="61098663856"
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
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
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: formatIfscInput(e.target.value) })}
                  placeholder="SBIN0031338"
                  className="w-full px-3 py-2 text-xs font-mono uppercase font-bold border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
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
                  placeholder="kiosk@upi"
                  className="w-full px-3 py-2 text-xs font-mono font-bold text-emerald-800 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: CONVENIENCE FEE RULE */}
          <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 space-y-2">
            <span className="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-blue-600" />
              <span>3. सुविधा शुल्क नियम (Convenience Fee Calculation Rule)</span>
            </span>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">स्लैब दर:</span>
                <span className="font-bold text-slate-900 bg-white border border-blue-200 px-3 py-1 rounded-lg">
                  ₹{formData.feePerSlab} प्रति ₹{formData.feeSlabUnit} बिल राशि
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                (उदा. ₹1 से ₹1000 तक शुल्क ₹5, ₹1001 से ₹2000 तक शुल्क ₹10)
              </span>
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
              className="sm:w-2/3 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'सुरक्षित हो रहा है...' : 'सुरक्षित करें व सेवा शुरू करें ➔'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
