import React, { useState } from 'react';
import { useRecharge } from '../../context/RechargeContext';
import { 
  Settings, 
  Store, 
  Building2, 
  CreditCard, 
  CheckCircle2, 
  Save, 
  Printer 
} from 'lucide-react';
import { 
  formatMobileInput, 
  formatIfscInput 
} from '../../../utils/validation';

export default function RechargeSettingsTab() {
  const { settings, updateSettings } = useRecharge();

  const [formData, setFormData] = useState({
    shopName: settings.shopName || '',
    shopPhone: settings.shopPhone || '',
    ownerName: settings.ownerName || '',
    address: settings.address || '',
    bankName: settings.bankName || '',
    accountNumber: settings.accountNumber || '',
    ifscCode: settings.ifscCode || '',
    upiId: settings.upiId || '',
    feeRuleType: settings.feeRuleType || 'slab',
    feeSlabUnit: settings.feeSlabUnit || 1000,
    feePerSlab: settings.feePerSlab || 5,
    flatFeeAmount: settings.flatFeeAmount || 10,
    percentFeeRate: settings.percentFeeRate || 1,
    paperSize: settings.paperSize || 'thermal80',
    showBankOnSlip: settings.showBankOnSlip !== false,
    showQrCodeOnSlip: settings.showQrCodeOnSlip !== false,
    showStampOnSlip: settings.showStampOnSlip !== false
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="py-6 px-4 max-w-4xl mx-auto">
      {savedSuccess && (
        <div className="mb-5 p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>✅ सेटिंग्स सफलतापूर्वक सुरक्षित हो गईं!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Shop & Agent Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
            <Store className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-black text-slate-900">
              1. दुकान व एजेंट विवरण (Shop & Agent Profile)
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  दुकान / केंद्र का नाम (Shop Name) <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={(e) => handleChange('shopName', e.target.value)}
                  placeholder="उदा. श्री श्याम ई-मित्र & रिचार्ज केंद्र"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  मोबाइल नंबर (Shop Mobile) <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={formData.shopPhone}
                  onChange={(e) => handleChange('shopPhone', formatMobileInput(e.target.value))}
                  placeholder="उदा. 9784730824"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  एजेंट / संचालक का नाम (Owner Name)
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleChange('ownerName', e.target.value)}
                  placeholder="उदा. जगदीश प्रजापत"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  पता / लोकेशन (Shop Address - Top of Receipt)
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="उदा. मुख्य बाजार, निकट बस स्टैंड, सीकर (राज.)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Convenience Fee (सुविधा शुल्क) Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-black text-slate-900">
              2. सुविधा शुल्क विन्यास (Convenience Fee Calculation Rule)
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                गणना का नियम चुनें (Calculation Method)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition-all ${
                  formData.feeRuleType === 'slab' ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-black' : 'border-slate-200 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="feeRuleType"
                    checked={formData.feeRuleType === 'slab'}
                    onChange={() => handleChange('feeRuleType', 'slab')}
                    className="accent-emerald-600"
                  />
                  <div>
                    <div className="text-xs">स्लैब अनुसार (Tiered)</div>
                    <div className="text-[10px] text-slate-500">₹5 प्रति ₹1000 (Recommended)</div>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition-all ${
                  formData.feeRuleType === 'flat' ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-black' : 'border-slate-200 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="feeRuleType"
                    checked={formData.feeRuleType === 'flat'}
                    onChange={() => handleChange('feeRuleType', 'flat')}
                    className="accent-emerald-600"
                  />
                  <div>
                    <div className="text-xs">निश्चित शुल्क (Flat Fee)</div>
                    <div className="text-[10px] text-slate-500">प्रत्येक बिल पर फिक्स ₹10</div>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition-all ${
                  formData.feeRuleType === 'percent' ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-black' : 'border-slate-200 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="feeRuleType"
                    checked={formData.feeRuleType === 'percent'}
                    onChange={() => handleChange('feeRuleType', 'percent')}
                    className="accent-emerald-600"
                  />
                  <div>
                    <div className="text-xs">प्रतिशत आधार (Percentage)</div>
                    <div className="text-[10px] text-slate-500">बिल राशि का 1%</div>
                  </div>
                </label>
              </div>
            </div>

            {formData.feeRuleType === 'slab' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    स्लैब शुल्क दर (₹ प्रति स्लैब)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.feePerSlab}
                    onChange={(e) => handleChange('feePerSlab', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    स्लैब यूनिट (₹ प्रति कितने रुपये पर)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={formData.feeSlabUnit}
                    onChange={(e) => handleChange('feeSlabUnit', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-black"
                  />
                </div>
              </div>
            )}

            {formData.feeRuleType === 'flat' && (
              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 max-w-xs">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  फिक्स शुल्क राशि (₹ प्रति बिल)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.flatFeeAmount}
                  onChange={(e) => handleChange('flatFeeAmount', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-black"
                />
              </div>
            )}

            {formData.feeRuleType === 'percent' && (
              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 max-w-xs">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  शुल्क प्रतिशत दर (%)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.percentFeeRate}
                  onChange={(e) => handleChange('percentFeeRate', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-black"
                />
              </div>
            )}
          </div>
        </div>

        {/* 3. Bank Account Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-black text-slate-900">
              3. बैंक खाता विवरण (Bank Details - Print on Slip)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">बैंक का नाम</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="उदा. State Bank of India"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">खाता संख्या (A/C No)</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
                placeholder="उदा. 61098663856"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">IFSC कोड</label>
              <input
                type="text"
                maxLength={11}
                value={formData.ifscCode}
                onChange={(e) => handleChange('ifscCode', formatIfscInput(e.target.value))}
                placeholder="उदा. SBIN0031338"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">UPI ID (Optional)</label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => handleChange('upiId', e.target.value)}
                placeholder="उदा. mobile@sbi"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* 4. Print & Receipt Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
            <Printer className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-black text-slate-900">
              4. रसीद प्रिंट प्राथमिकताएं (Receipt Print Preferences)
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                डिफ़ॉल्ट प्रिंटर पेपर साइज (Paper Size)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer ${
                  formData.paperSize === 'thermal80' ? 'border-purple-600 bg-purple-50/70 font-black' : 'border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="paperSize"
                    checked={formData.paperSize === 'thermal80'}
                    onChange={() => handleChange('paperSize', 'thermal80')}
                    className="accent-purple-600"
                  />
                  <span className="text-xs">80mm थर्मल रोल (POS)</span>
                </label>

                <label className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer ${
                  formData.paperSize === 'thermal58' ? 'border-purple-600 bg-purple-50/70 font-black' : 'border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="paperSize"
                    checked={formData.paperSize === 'thermal58'}
                    onChange={() => handleChange('paperSize', 'thermal58')}
                    className="accent-purple-600"
                  />
                  <span className="text-xs">58mm मिनी थर्मल रोल</span>
                </label>

                <label className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer ${
                  formData.paperSize === 'a4' ? 'border-purple-600 bg-purple-50/70 font-black' : 'border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="paperSize"
                    checked={formData.paperSize === 'a4'}
                    onChange={() => handleChange('paperSize', 'a4')}
                    className="accent-purple-600"
                  />
                  <span className="text-xs">A4 / A5 स्टैंडर्ड वाउचर</span>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.showBankOnSlip}
                  onChange={(e) => handleChange('showBankOnSlip', e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                />
                <span>🏦 रसीद पर बैंक विवरण दिखाएं (Show Bank Details)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.showQrCodeOnSlip}
                  onChange={(e) => handleChange('showQrCodeOnSlip', e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 accent-purple-600"
                />
                <span>📱 रसीद पर UPI QR कोड दिखाएं (Show UPI QR Code)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.showStampOnSlip}
                  onChange={(e) => handleChange('showStampOnSlip', e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                />
                <span>डिजिटल ग्रीन मुहर दिखाएं (Show Verified Stamp)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>सेटिंग्स सुरक्षित करें (Save Settings)</span>
          </button>
        </div>
      </form>
    </div>
  );
}
