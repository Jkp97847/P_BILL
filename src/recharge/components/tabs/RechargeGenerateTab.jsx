import React, { useState, useMemo } from 'react';
import { useRecharge, calculateConvenienceFee } from '../../context/RechargeContext';
import RechargeReceiptSlip from '../RechargeReceiptSlip';
import { 
  Zap, 
  Smartphone, 
  PhoneCall, 
  Shield, 
  Printer, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { formatMobileInput } from '../../../utils/validation';

const SERVICES = [
  { id: 'electricity', name: 'बिजली बिल (Electricity)', icon: Zap, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
  { id: 'mobile', name: 'मोबाइल रिचार्ज (Mobile)', icon: Smartphone, color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' },
  { id: 'landline', name: 'लैंडलाइन व ब्रॉडबैंड', icon: PhoneCall, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'insurance', name: 'बीमा प्रीमियम (Insurance)', icon: Shield, color: 'text-purple-500 bg-purple-500/10 border-purple-500/30' }
];

const OPERATORS_BY_SERVICE = {
  electricity: [
    { id: 'jaipur', name: 'जयपुर डिस्कॉम (JVVNL)', logo: '/recharge_assets/jaipur_discom.svg', defaultSub: 'सीकर / जयपुर वृत्त' },
    { id: 'ajmer', name: 'अजमेर डिस्कॉम (AVVNL)', logo: '/recharge_assets/ajmer_discom.svg', defaultSub: 'अजमेर वृत्त' },
    { id: 'jodhpur', name: 'जोधपुर डिस्कॉम (JdVVNL)', logo: '/recharge_assets/jodhpur_discom.svg', defaultSub: 'जोधपुर वृत्त' }
  ],
  mobile: [
    { id: 'jio', name: 'Reliance Jio (जियो)', logo: '/recharge_assets/jio.svg', defaultSub: 'राजस्थान सर्कल (4G/5G)' },
    { id: 'airtel', name: 'Bharti Airtel (एयरटेल)', logo: '/recharge_assets/airtel.svg', defaultSub: 'राजस्थान सर्कल (4G/5G)' },
    { id: 'vi', name: 'Vodafone Idea (Vi)', logo: '/recharge_assets/vi.svg', defaultSub: 'राजस्थान सर्कल' },
    { id: 'bsnl', name: 'BSNL Mobile (बीएसएनएल)', logo: '/recharge_assets/bsnl.svg', defaultSub: 'राजस्थान सर्कल' }
  ],
  landline: [
    { id: 'bsnl_ll', name: 'BSNL Landline & Fiber', logo: '/recharge_assets/bsnl.svg', defaultSub: 'ब्रॉडबैंड व फाइबर' },
    { id: 'airtel_bb', name: 'Airtel Xstream Fiber', logo: '/recharge_assets/airtel.svg', defaultSub: 'हाई स्पीड ब्रॉडबैंड' },
    { id: 'jio_fiber', name: 'JioFiber & AirFiber', logo: '/recharge_assets/jio.svg', defaultSub: 'फाइबर ब्रॉडबैंड' }
  ],
  insurance: [
    { id: 'lic', name: 'Life Insurance Corp. (LIC)', logo: '/recharge_assets/lic.svg', defaultSub: 'भारतीय जीवन बीमा निगम' },
    { id: 'sbi_life', name: 'SBI Life Insurance', logo: '/recharge_assets/sbi_life.svg', defaultSub: 'एसबीआई लाइफ इंश्योरेंस' },
    { id: 'general_ins', name: 'General & Health Insurance', logo: '/recharge_assets/insurance.svg', defaultSub: 'स्वास्थ्य व वाहन बीमा' }
  ]
};

export default function RechargeGenerateTab() {
  const { settings, addTransaction, printSlip } = useRecharge();

  const [serviceType, setServiceType] = useState('electricity');
  const [operatorId, setOperatorId] = useState('jaipur');

  const operators = OPERATORS_BY_SERVICE[serviceType] || [];
  const selectedOperator = operators.find(o => o.id === operatorId) || operators[0] || {};

  const [formData, setFormData] = useState({
    consumerNo: '',
    customerName: '',
    billDate: new Date().toISOString().split('T')[0],
    billAmount: '',
    subDivision: selectedOperator.defaultSub || '',
    notes: ''
  });

  const [notification, setNotification] = useState(null);

  // When service type changes, update operator
  const handleServiceChange = (st) => {
    setServiceType(st);
    const newOps = OPERATORS_BY_SERVICE[st] || [];
    const firstOp = newOps[0] || {};
    setOperatorId(firstOp.id || '');
    setFormData(prev => ({
      ...prev,
      subDivision: firstOp.defaultSub || '',
      consumerNo: '',
      customerName: ''
    }));
  };

  const handleOperatorChange = (opId) => {
    setOperatorId(opId);
    const op = operators.find(o => o.id === opId);
    if (op) {
      setFormData(prev => ({
        ...prev,
        subDivision: op.defaultSub || prev.subDivision
      }));
    }
  };

  // Real-time calculation
  const billAmountNum = parseFloat(formData.billAmount) || 0;
  const conveFeeNum = calculateConvenienceFee(billAmountNum, settings);
  const totalAmountNum = billAmountNum + conveFeeNum;

  // Live bill object for preview & slip
  const previewBill = useMemo(() => {
    return {
      id: 'PREVIEW-' + (serviceType.toUpperCase().slice(0, 3)),
      serviceType,
      operatorName: selectedOperator.name || 'विद्युत डिस्कॉम',
      operatorLogo: selectedOperator.logo,
      consumerNo: formData.consumerNo || (serviceType === 'electricity' ? '1102XXXXXXXX' : serviceType === 'mobile' ? '98290XXXXX' : 'POL-XXXXXXX'),
      customerName: formData.customerName || 'उपभोक्ता / ग्राहक',
      billDate: formData.billDate || new Date().toISOString().split('T')[0],
      billAmount: billAmountNum,
      conveFee: conveFeeNum,
      totalAmount: totalAmountNum,
      subDivision: formData.subDivision,
      notes: formData.notes,
      sellerShop: settings.shopName
    };
  }, [serviceType, selectedOperator, formData, billAmountNum, conveFeeNum, totalAmountNum, settings.shopName]);

  const handleReset = () => {
    setFormData({
      consumerNo: '',
      customerName: '',
      billDate: new Date().toISOString().split('T')[0],
      billAmount: '',
      subDivision: selectedOperator.defaultSub || '',
      notes: ''
    });
    setNotification(null);
  };

  const validateForm = () => {
    if (!formData.consumerNo.trim()) {
      const label = serviceType === 'electricity' ? 'K-नंबर' : serviceType === 'mobile' ? 'मोबाइल नंबर' : serviceType === 'insurance' ? 'पॉलिसी नंबर' : 'खाता संख्या';
      setNotification({ type: 'error', message: `⚠️ कृपया ${label} दर्ज करें!` });
      return false;
    }
    if (billAmountNum <= 0) {
      setNotification({ type: 'error', message: '⚠️ कृपया वैध बिल राशि (₹) दर्ज करें!' });
      return false;
    }
    return true;
  };

  const handleSaveBill = () => {
    if (!validateForm()) return;

    const saved = addTransaction({
      serviceType,
      operatorName: selectedOperator.name,
      operatorLogo: selectedOperator.logo,
      consumerNo: formData.consumerNo.trim(),
      customerName: formData.customerName.trim() || formData.consumerNo.trim(),
      billDate: formData.billDate,
      billAmount: billAmountNum,
      conveFee: conveFeeNum,
      totalAmount: totalAmountNum,
      subDivision: formData.subDivision.trim(),
      notes: formData.notes.trim()
    });

    setNotification({
      type: 'success',
      message: `✅ रसीद #${saved.id} सफलतापूर्वक सुरक्षित हो गई!`
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handlePrintSlip = () => {
    if (!validateForm()) return;

    const saved = addTransaction({
      serviceType,
      operatorName: selectedOperator.name,
      operatorLogo: selectedOperator.logo,
      consumerNo: formData.consumerNo.trim(),
      customerName: formData.customerName.trim() || formData.consumerNo.trim(),
      billDate: formData.billDate,
      billAmount: billAmountNum,
      conveFee: conveFeeNum,
      totalAmount: totalAmountNum,
      subDivision: formData.subDivision.trim(),
      notes: formData.notes.trim()
    });

    printSlip(saved);
  };

  // Consumer field labels based on service
  const getConsumerFieldMeta = () => {
    switch (serviceType) {
      case 'electricity':
        return { label: 'K-नंबर (उपभोक्ता संख्या)', placeholder: 'उदा. 110298471234 (12 अंकों का K-No)', maxLength: 16 };
      case 'mobile':
        return { label: 'मोबाइल नंबर', placeholder: 'उदा. 9829012345 (10 अंकों का मोबाइल)', maxLength: 10 };
      case 'landline':
        return { label: 'लैंडलाइन / टेलीफोन नंबर', placeholder: 'उदा. 01572-245678 (STD कोड सहित)', maxLength: 15 };
      case 'insurance':
        return { label: 'पॉलिसी नंबर (Policy Number)', placeholder: 'उदा. 123456789 (पॉलिसी संख्या)', maxLength: 18 };
      default:
        return { label: 'उपभोक्ता नंबर', placeholder: 'खाता संख्या / नंबर', maxLength: 16 };
    }
  };

  const consumerMeta = getConsumerFieldMeta();

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`mb-5 p-3 rounded-xl flex items-center gap-2 text-sm font-bold shadow-md transition-all ${
            notification.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-300'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="border-b border-slate-200 pb-4 mb-5">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="text-amber-500">⚡</span>
              <span>नया बिल / रिचार्ज भुगतान (Generate Bill)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              सेवा चुनें, ऑपरेटर व उपभोक्ता विवरण भरें। सुविधा शुल्क स्वतः गणना होगा।
            </p>
          </div>

          {/* 1. Service Selector Cards */}
          <div className="mb-5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              1. सेवा का प्रकार चुनें (Select Service)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SERVICES.map((srv) => {
                const Icon = srv.icon;
                const isSelected = serviceType === srv.id;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => handleServiceChange(srv.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-black shadow-sm ring-1 ring-blue-500'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700 font-bold'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-700' : 'text-slate-500'}`} />
                    <span className="text-xs leading-tight">{srv.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {srv.id === 'electricity' ? 'JVVNL/AVVNL' : srv.id === 'mobile' ? 'Jio/Airtel' : srv.id === 'landline' ? 'Fiber/Broadband' : 'LIC/SBI'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Operator Selection with Logos */}
          <div className="mb-5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              2. कंपनी / ऑपरेटर चुनें (Select Operator)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {operators.map((op) => {
                const isSelected = operatorId === op.id;
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => handleOperatorChange(op.id)}
                    className={`p-2.5 rounded-xl border-2 transition-all flex items-center gap-2.5 text-left cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-sm ring-1 ring-blue-500 font-black'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold'
                    }`}
                  >
                    <img 
                      src={op.logo} 
                      alt="" 
                      className="w-8 h-8 object-contain shrink-0 rounded bg-white p-0.5 border border-slate-200" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="leading-tight truncate">
                      <div className="text-xs font-bold truncate">{op.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{op.defaultSub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Form Inputs */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Consumer / K-No / Phone / Policy */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {consumerMeta.label} <span className="text-rose-500 font-black">*</span>
                </label>
                <input
                  type="text"
                  maxLength={consumerMeta.maxLength}
                  value={formData.consumerNo}
                  onChange={(e) => {
                    const val = serviceType === 'mobile' ? formatMobileInput(e.target.value) : e.target.value.toUpperCase();
                    setFormData(prev => ({ 
                      ...prev, 
                      consumerNo: val,
                      customerName: (!prev.customerName || prev.customerName === prev.consumerNo) ? val : prev.customerName
                    }));
                  }}
                  placeholder={consumerMeta.placeholder}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  उपभोक्ता का नाम (Customer Name)
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="उपभोक्ता का नाम दर्ज करें"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bill Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  बिल / भुगतान दिनांक
                </label>
                <input
                  type="date"
                  value={formData.billDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, billDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Bill Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  मूल बिल / रिचार्ज राशि (₹) <span className="text-rose-500 font-black">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={formData.billAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, billAmount: e.target.value }))}
                  placeholder="उदा. 1450"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-black text-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Sub-division / Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  उप-खंड / सर्कल विवरण (Optional)
                </label>
                <input
                  type="text"
                  value={formData.subDivision}
                  onChange={(e) => setFormData(prev => ({ ...prev, subDivision: e.target.value }))}
                  placeholder="उदा. सीकर ग्रामीण वृत्त"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  टिप्पणी / रिमार्क (Notes)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="उदा. ऑनलाइन भुगतान सफल"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Live Fee Calculation Box */}
          <div className="mt-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4">
            <div className="flex justify-between items-center text-xs text-slate-600 mb-1.5">
              <span>मूल बिल / रिचार्ज राशि (Bill Amount):</span>
              <span className="font-mono font-bold text-slate-900">₹{billAmountNum.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-600 mb-2">
              <span className="flex items-center gap-1.5">
                <span>कन्वीनियंस सुविधा शुल्क (Fee):</span>
                <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                  {settings.feeRuleType === 'flat' 
                    ? `फ्लैट: ₹${settings.flatFeeAmount}` 
                    : settings.feeRuleType === 'percent' 
                      ? `${settings.percentFeeRate}%` 
                      : `नियम: ₹${settings.feePerSlab} प्रति ₹${settings.feeSlabUnit}`}
                </span>
              </span>
              <span className="font-mono font-black text-emerald-700">+ ₹{conveFeeNum.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-center">
              <span className="text-sm font-black text-slate-900 uppercase">
                कुल देय राशि (Total Payable):
              </span>
              <span className="font-mono text-xl font-black text-blue-900">
                ₹{totalAmountNum.toFixed(2)}
              </span>
            </div>
          </div>

          {/* 5. Form Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePrintSlip}
              className="flex-1 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>तुरंत रसीद प्रिंट करें (Print Slip)</span>
            </button>

            <button
              type="button"
              onClick={handleSaveBill}
              className="py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>सुरक्षित करें (Save Only)</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="फॉर्म रीसेट करें"
            >
              <RotateCcw className="w-4 h-4" />
              <span>रीसेट</span>
            </button>
          </div>
        </div>

        {/* Right Preview (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-100 rounded-2xl border border-slate-300 p-5 sticky top-24">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>👁️</span>
              <span>लाइव रसीद प्रिव्यू (Live Preview)</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              {settings.paperSize === 'thermal58' ? '58mm Roll' : settings.paperSize === 'thermal80' ? '80mm Roll' : 'Standard A4'}
            </span>
          </div>

          <div className="bg-slate-200/70 p-3 rounded-xl border border-slate-300/80 shadow-inner flex items-center justify-center">
            <RechargeReceiptSlip bill={previewBill} settings={settings} />
          </div>
        </div>
      </div>
    </div>
  );
}
