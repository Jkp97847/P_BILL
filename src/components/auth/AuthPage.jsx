import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Lock, 
  User, 
  Phone, 
  Mail, 
  Building2, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  RefreshCw, 
  KeyRound, 
  Check, 
  AlertCircle, 
  AlertTriangle,
  Copy,
  Eye, 
  EyeOff, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  X, 
  ReceiptText, 
  HelpCircle, 
  Clock, 
  ArrowRight
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

export default function AuthPage() {
  const { 
    login, 
    registerSeller, 
    sendWhatsAppOtp, 
    verifyOtp,
    requestForgotPasswordOtp,
    resetPasswordWithOtp
  } = useAuth();

  // Tab State: 'login' | 'register' | 'forgot'
  const [activeTab, setActiveTab] = useState('login');

  // Warning Message Box Modal State
  const [warningModal, setWarningModal] = useState({ isOpen: false, title: '', message: '', type: 'warning' });

  // Signup Success Credentials Remember Modal State
  const [signupSuccessModal, setSignupSuccessModal] = useState({ isOpen: false, creds: null });
  const [copiedCreds, setCopiedCreds] = useState(false);

  // WhatsApp OTP Direct Dispatch URLs
  const [whatsappDispatchUrl, setWhatsappDispatchUrl] = useState('');
  const [forgotWhatsappUrl, setForgotWhatsappUrl] = useState('');

  // Common UI states
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Seller Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 2. Registration Form State
  const [regData, setRegData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    ownerName: '',
    mobile: '',
    alternateMobile: '',
    email: '',
    address: '',
    state: 'Rajasthan',
    stateCode: '08',
    pincode: '',
    gstin: '',
    pan: '',
    bankName: '',
    accountNo: '',
    ifsc: '',
    upiId: ''
  });

  // 3. Captcha State for Seller
  const [captcha, setCaptcha] = useState({ num1: 12, num2: 8, answer: 20 });
  const [captchaInput, setCaptchaInput] = useState('');

  const generateNewCaptcha = () => {
    const n1 = Math.floor(Math.random() * 25) + 5;
    const n2 = Math.floor(Math.random() * 20) + 3;
    setCaptcha({ num1: n1, num2: n2, answer: n1 + n2 });
    setCaptchaInput('');
  };

  useEffect(() => {
    generateNewCaptcha();
  }, [activeTab]);

  // 4. Password Strength Calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'पासवर्ड दर्ज करें', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
      case 2:
        return { score, label: 'कमजोर (Weak)', color: 'bg-rose-500', textColor: 'text-rose-600' };
      case 3:
      case 4:
        return { score, label: 'मध्यम (Medium)', color: 'bg-amber-500', textColor: 'text-amber-600' };
      case 5:
        return { score, label: 'मजबूत (Strong ✔)', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
      default:
        return { score: 0, label: 'बहुत कमजोर', color: 'bg-slate-300', textColor: 'text-slate-500' };
    }
  };

  const passwordStrength = getPasswordStrength(regData.password);

  // 5. WhatsApp OTP Modal State (for Registration)
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [otpError, setOtpError] = useState('');

  // Countdown timer for OTP
  useEffect(() => {
    let interval = null;
    if (otpModalOpen && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpModalOpen, otpTimer]);

  // 6. Hidden Super Admin Modal State
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminCaptcha, setAdminCaptcha] = useState({ num1: 15, num2: 10, answer: 25 });
  const [adminCaptchaInput, setAdminCaptchaInput] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const generateAdminCaptcha = () => {
    const a1 = Math.floor(Math.random() * 30) + 10;
    const a2 = Math.floor(Math.random() * 20) + 5;
    setAdminCaptcha({ num1: a1, num2: a2, answer: a1 + a2 });
    setAdminCaptchaInput('');
  };

  // 7. Interactive WhatsApp Forgot Password Self-Service State
  const [forgotIdentifier, setForgotIdentifier] = useState(''); // username or 10-digit mobile
  const [forgotStep, setForgotStep] = useState(1); // 1: request OTP, 2: verify OTP, 3: set new password
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotMaskedMobile, setForgotMaskedMobile] = useState('');
  const [forgotTargetMobile, setForgotTargetMobile] = useState('');
  const [forgotVerifiedUsername, setForgotVerifiedUsername] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotShowPassword, setForgotShowPassword] = useState(false);
  const [forgotTimer, setForgotTimer] = useState(60);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Countdown timer for Forgot Password OTP
  useEffect(() => {
    let interval = null;
    if (forgotStep === 2 && forgotTimer > 0) {
      interval = setInterval(() => setForgotTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [forgotStep, forgotTimer]);

  const forgotPasswordStrength = getPasswordStrength(forgotNewPassword);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------

  // Handle User Login Submit
  const handleSellerLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginUsername.trim() || !loginPassword) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ आवश्यक विवरण अधूरा है',
        message: 'लॉगिन के लिए यूजरनेम (Username) और पासवर्ड (Password) दोनों भरना अनिवार्य (Compulsory) है! कृपया दोनों विवरण दर्ज करें।',
        type: 'warning'
      });
      setErrorMsg('कृपया यूजरनेम और पासवर्ड दोनों दर्ज करें।');
      return;
    }

    // Strict role check: Super admin cannot log in from the public User Login tab
    if (loginUsername.trim().toLowerCase() === 'jkp97847') {
      setWarningModal({
        isOpen: true,
        title: '🛡️ सुपर एडमिन खाता सूचना',
        message: 'यूजरनेम "jkp97847" सुपर एडमिन (Super Admin) का खाता है। 4-टैब मुख्य यूजर बिलिंग पोर्टल में जाने के लिए कृपया सेलर अकाउंट (उदा. seller1 / Seller@123456) से लॉगिन करें। यदि आपको एडमिन कंट्रोल रूम खोलना है तो नीचे दिए गए "🛡️ केवल सुपर एडमिन लॉगिन" बटन का प्रयोग करें।',
        type: 'warning'
      });
      setErrorMsg('4-टैब बिलिंग हेतु सेलर आईडी (seller1) से लॉगिन करें। सुपर एडमिन नीचे लॉगिन करें।');
      return;
    }

    if (parseInt(captchaInput, 10) !== captcha.answer) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ सुरक्षा कैप्चा गलत है',
        message: 'सुरक्षा कैप्चा (Captcha) का उत्तर गलत है! कृपया सही जोड़ दर्ज करें।',
        type: 'warning'
      });
      setErrorMsg('सुरक्षा कैप्चा (Captcha) गलत है! कृपया सही जोड़ दर्ज करें।');
      generateNewCaptcha();
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(loginUsername.trim(), loginPassword);
      setLoading(false);

      if (!res.success) {
        setWarningModal({
          isOpen: true,
          title: '⚠️ लॉगिन असफल (गलत क्रेडेंशियल)',
          message: res.error || 'दर्ज किया गया यूजरनेम या पासवर्ड गलत है! कृपया सही विवरण दर्ज करें।',
          type: 'error'
        });
        setErrorMsg(res.error);
        generateNewCaptcha();
      } else {
        setSuccessMsg(`सफलतापूर्वक लॉगिन हुआ! स्वागत है, ${res.user.profile?.ownerName || res.user.username}`);
      }
    }, 400);
  };

  // Handle Super Admin Secret Login
  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    setAdminError('');

    if (!adminUsername.trim() || !adminPassword) {
      setAdminError('कृपया सुपर एडमिन यूजरनेम और पासवर्ड दर्ज करें।');
      return;
    }

    if (parseInt(adminCaptchaInput, 10) !== adminCaptcha.answer) {
      setAdminError('सुरक्षा कैप्चा गलत है!');
      generateAdminCaptcha();
      return;
    }

    setAdminLoading(true);
    setTimeout(() => {
      const res = login(adminUsername.trim(), adminPassword);
      setAdminLoading(false);

      if (!res.success) {
        setAdminError(res.error);
        generateAdminCaptcha();
      } else {
        setAdminModalOpen(false);
      }
    }, 400);
  };

  // Step 1 of Registration: Validate fields & Open WhatsApp OTP
  const handleStartRegistration = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Username (Compulsory)
    if (!regData.username.trim()) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ यूजरनेम अनिवार्य है',
        message: 'यूजरनेम (Username) दर्ज करना अनिवार्य है!',
        type: 'warning'
      });
      setErrorMsg('यूजरनेम दर्ज करना अनिवार्य है!');
      return;
    }
    if (regData.username.trim().length < 3) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ यूजरनेम बहुत छोटा है',
        message: 'यूजरनेम कम से कम 3 अक्षरों का होना चाहिए!',
        type: 'warning'
      });
      setErrorMsg('यूजरनेम कम से कम 3 अक्षरों का होना चाहिए!');
      return;
    }

    // 2. Password (Compulsory)
    if (!regData.password) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ पासवर्ड अनिवार्य है',
        message: 'पासवर्ड दर्ज करना अनिवार्य है!',
        type: 'warning'
      });
      setErrorMsg('पासवर्ड दर्ज करना अनिवार्य है!');
      return;
    }
    if (passwordStrength.score < 3) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ कमजोर पासवर्ड',
        message: 'कृपया मजबूत पासवर्ड बनाएं (कम से कम 8 अक्षर, जिसमें बड़ा अक्षर A-Z, अंक 0-9 व विशेष चिन्ह जैसे @#$ शामिल हों)!',
        type: 'warning'
      });
      setErrorMsg('कृपया मजबूत पासवर्ड बनाएं (कम से कम 8 अक्षर)!');
      return;
    }
    if (regData.password !== regData.confirmPassword) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ पासवर्ड मेल नहीं खा रहा',
        message: 'पासवर्ड और कन्फर्म पासवर्ड दोनों एक समान होने चाहिए!',
        type: 'warning'
      });
      setErrorMsg('पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खा रहे हैं!');
      return;
    }

    // 3. Shop Name (Compulsory)
    if (!regData.shopName.trim()) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ दुकान / फर्म का नाम अनिवार्य है',
        message: 'दुकान / फर्म का नाम (Shop Name) दर्ज करना अनिवार्य है (यह बिल पर प्रिंट होगा)!',
        type: 'warning'
      });
      setErrorMsg('दुकान / फर्म का नाम दर्ज करना अनिवार्य है!');
      return;
    }

    // 4. Owner Name (Compulsory)
    if (!regData.ownerName.trim()) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ प्रोपराइटर / मालिक का नाम अनिवार्य है',
        message: 'मालिक / प्रोपराइटर का नाम दर्ज करना अनिवार्य है!',
        type: 'warning'
      });
      setErrorMsg('मालिक का नाम दर्ज करना अनिवार्य है!');
      return;
    }

    // 5. Primary Mobile Number (Compulsory - Verified on WhatsApp)
    const mobRes = validateMobile(regData.mobile, true, 'प्राथमिक मोबाइल नंबर');
    if (!mobRes.isValid) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ प्राथमिक मोबाइल नंबर अमान्य है',
        message: mobRes.error,
        type: 'warning'
      });
      setErrorMsg(mobRes.error);
      return;
    }
    const cleanMobile = mobRes.mobile;

    // 6. Alternate Mobile Number (OPTIONAL)
    if (regData.alternateMobile && regData.alternateMobile.trim()) {
      const altRes = validateMobile(regData.alternateMobile, false, 'अतिरिक्त मोबाइल नंबर');
      if (!altRes.isValid) {
        setWarningModal({
          isOpen: true,
          title: '⚠️ अतिरिक्त मोबाइल नंबर अमान्य',
          message: altRes.error,
          type: 'warning'
        });
        setErrorMsg(altRes.error);
        return;
      }
    }

    // 7. Email Address (Compulsory)
    const emailRes = validateEmail(regData.email, true);
    if (!emailRes.isValid) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ ईमेल पता अमान्य है',
        message: emailRes.error,
        type: 'warning'
      });
      setErrorMsg(emailRes.error);
      return;
    }

    // 8. Address (Compulsory)
    if (!regData.address.trim()) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ दुकान का पूरा पता अनिवार्य है',
        message: 'दुकान का पूरा पता दर्ज करना अनिवार्य है (यह इनवॉइस / बिल पर प्रिंट होगा)!',
        type: 'warning'
      });
      setErrorMsg('दुकान का पूरा पता दर्ज करना अनिवार्य है!');
      return;
    }

    // 9. State (Compulsory)
    if (!regData.state.trim()) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ राज्य अनिवार्य है',
        message: 'कृपया राज्य का नाम दर्ज करें!',
        type: 'warning'
      });
      setErrorMsg('राज्य दर्ज करना अनिवार्य है!');
      return;
    }

    // 10. Pincode (Compulsory, exactly 6 digits)
    const cleanPin = regData.pincode.replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ पिनकोड अनिवार्य है',
        message: 'पिनकोड (Pincode) पूरे 6 अंकों का होना अनिवार्य है!',
        type: 'warning'
      });
      setErrorMsg('पिनकोड पूरे 6 अंकों का होना अनिवार्य है!');
      return;
    }

    // 11. GSTIN Number (OPTIONAL)
    if (regData.gstin && regData.gstin.trim()) {
      const gstRes = validateGstin(regData.gstin, false);
      if (!gstRes.isValid) {
        setWarningModal({
          isOpen: true,
          title: '⚠️ GSTIN प्रारूप अमान्य',
          message: gstRes.error,
          type: 'warning'
        });
        setErrorMsg(gstRes.error);
        return;
      }
    }

    // 12. PAN Number (Compulsory, 10 characters)
    const panRes = validatePan(regData.pan, true);
    if (!panRes.isValid) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ PAN नंबर अमान्य है',
        message: panRes.error,
        type: 'warning'
      });
      setErrorMsg(panRes.error);
      return;
    }

    // 13. Bank Name (Compulsory)
    if (!regData.bankName.trim()) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ बैंक का नाम अनिवार्य है',
        message: 'बैंक का नाम दर्ज करना अनिवार्य है (उदा. SBI / HDFC / PNB)!',
        type: 'warning'
      });
      setErrorMsg('बैंक का नाम दर्ज करना अनिवार्य है!');
      return;
    }

    // 14. Bank Account Number (Compulsory, 9 to 18 digits)
    const accRes = validateAccountNo(regData.accountNo, true);
    if (!accRes.isValid) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ बैंक खाता संख्या अमान्य है',
        message: accRes.error,
        type: 'warning'
      });
      setErrorMsg(accRes.error);
      return;
    }

    // 15. IFSC Code (Compulsory, 11 alphanumeric characters)
    const ifscRes = validateIfsc(regData.ifsc, true);
    if (!ifscRes.isValid) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ IFSC कोड अमान्य है',
        message: ifscRes.error,
        type: 'warning'
      });
      setErrorMsg(ifscRes.error);
      return;
    }

    // 16. UPI ID (Compulsory)
    const upiRes = validateUpi(regData.upiId, true);
    if (!upiRes.isValid) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ UPI ID अमान्य है',
        message: upiRes.error,
        type: 'warning'
      });
      setErrorMsg(upiRes.error);
      return;
    }

    // 17. Security Captcha (Compulsory)
    if (parseInt(captchaInput, 10) !== captcha.answer) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ सुरक्षा कैप्चा गलत है',
        message: 'सुरक्षा कैप्चा (Captcha) का उत्तर गलत है! कृपया सही जोड़ दर्ज करें।',
        type: 'warning'
      });
      setErrorMsg('सुरक्षा कैप्चा गलत है!');
      generateNewCaptcha();
      return;
    }

    // Send WhatsApp OTP to primary mobile
    const otpRes = sendWhatsAppOtp(cleanMobile);
    if (!otpRes.success) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ OTP भेजने में त्रुटि',
        message: otpRes.error,
        type: 'error'
      });
      setErrorMsg(otpRes.error);
      return;
    }

    // Construct direct WhatsApp dispatch URL to user's mobile WhatsApp
    const waMsg = encodeURIComponent(
      `नमस्ते ${regData.ownerName}! Smart Billing सॉफ्टवेयर में आपका स्वागत है। आपकी फर्म "${regData.shopName}" के रजिस्ट्रेशन हेतु 4-अंकों का सत्यापन OTP कोड है: *${otpRes.otp}* (यह कोड 10 मिनट के लिए मान्य है)।`
    );
    const waUrl = `https://api.whatsapp.com/send?phone=91${cleanMobile}&text=${waMsg}`;

    // Auto-open WhatsApp on user's device/mobile
    try {
      window.open(waUrl, '_blank');
    } catch {
      // In case browser blocks popup, user can click "WhatsApp खोलें" button
    }

    setWhatsappDispatchUrl(waUrl);
    setEnteredOtp('');
    setOtpError('');
    setOtpTimer(60);
    setOtpModalOpen(true);
  };

  // Step 2 of Registration: Verify OTP and finalize account creation
  const handleVerifyOtpAndComplete = () => {
    setOtpError('');
    if (!enteredOtp || enteredOtp.length !== 4) {
      setOtpError('कृपया WhatsApp पर आया 4-अंकों का OTP कोड दर्ज करें।');
      return;
    }

    const cleanMobile = regData.mobile.replace(/\D/g, '');
    const vRes = verifyOtp(cleanMobile, enteredOtp);
    if (!vRes.success) {
      setOtpError(vRes.error);
      return;
    }

    // Register user in storage
    const regRes = registerSeller(regData);

    if (!regRes.success) {
      setOtpModalOpen(false);
      setErrorMsg(regRes.error);
      return;
    }

    setOtpModalOpen(false);
    // Show credential reminder modal to remember username and password
    setSignupSuccessModal({
      isOpen: true,
      creds: {
        username: regData.username,
        password: regData.password,
        shopName: regData.shopName,
        mobile: cleanMobile,
        ownerName: regData.ownerName
      }
    });
  };

  // --------------------------------------------------------------------------
  // FORGOT PASSWORD HANDLERS (WHATSAPP OTP BASED SELF-SERVICE)
  // --------------------------------------------------------------------------
  const handleRequestForgotOtp = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setForgotError('');
    const cleanInput = (forgotIdentifier || forgotVerifiedUsername).trim();
    if (!cleanInput) {
      setForgotError('कृपया अपना पंजीकृत यूजरनेम या 10-अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }

    // Anti-robot captcha verification (only for initial step 1)
    if (forgotStep === 1 && parseInt(captchaInput, 10) !== captcha.answer) {
      setForgotError('सुरक्षा कैप्चा (Captcha) गलत है!');
      generateNewCaptcha();
      return;
    }

    setForgotLoading(true);
    setTimeout(() => {
      const res = requestForgotPasswordOtp(cleanInput);
      setForgotLoading(false);

      if (!res.success) {
        setForgotError(res.error);
        if (forgotStep === 1) generateNewCaptcha();
        return;
      }

      // Construct direct WhatsApp message URL for forgot password OTP
      const waMsg = encodeURIComponent(
        `नमस्ते ${res.username}! Smart Billing पासवर्ड रीसेट हेतु आपका 4-अंकों का सत्यापन OTP कोड है: *${res.otp}* (यह कोड 10 मिनट के लिए मान्य है)।`
      );
      const waUrl = `https://api.whatsapp.com/send?phone=91${res.mobile}&text=${waMsg}`;
      try {
        window.open(waUrl, '_blank');
      } catch {
        // Fallback for popup blocker
      }

      setForgotWhatsappUrl(waUrl);
      setForgotMaskedMobile(res.maskedMobile);
      setForgotTargetMobile(res.mobile);
      setForgotVerifiedUsername(res.username);
      setForgotOtp('');
      setForgotTimer(60);
      setForgotStep(2);
    }, 400);
  };

  const handleVerifyForgotOtp = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setForgotError('');
    const cleanOtp = String(forgotOtp).trim();
    if (cleanOtp.length !== 4) {
      setForgotError('कृपया 4 अंकों का OTP कोड दर्ज करें।');
      return;
    }

    // Verify OTP securely via auth context without consuming it until final password change
    const vRes = verifyOtp(forgotTargetMobile, cleanOtp, false);
    if (!vRes.success) {
      setForgotError(vRes.error || 'गलत OTP कोड! कृपया WhatsApp पर प्राप्त सही 4-अंकों का कोड दर्ज करें।');
      return;
    }

    // OTP Verified! Advance to Step 3 (Set New Password)
    setForgotStep(3);
  };

  const handleCompleteResetPassword = (e) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotNewPassword) {
      setForgotError('कृपया नया पासवर्ड दर्ज करें!');
      return;
    }

    if (forgotPasswordStrength.score < 3) {
      setForgotError('कृपया मजबूत पासवर्ड बनाएं (कम से कम 8 अक्षर, बड़ा अक्षर, अंक व विशेष चिन्ह जैसे @#$)!');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('नया पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खा रहे हैं!');
      return;
    }

    setForgotLoading(true);
    setTimeout(() => {
      const res = resetPasswordWithOtp(
        forgotVerifiedUsername || forgotIdentifier, 
        forgotOtp, 
        forgotNewPassword
      );
      setForgotLoading(false);

      if (!res.success) {
        setForgotError(res.error);
        return;
      }

      // Password Reset Successfully!
      setSuccessMsg(res.message);
      setLoginUsername(forgotVerifiedUsername || forgotIdentifier);
      setLoginPassword('');
      // Reset forgot state
      setForgotStep(1);
      setForgotIdentifier('');
      setForgotOtp('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setActiveTab('login');
    }, 400);
  };

  // Quick fill helper for default SELLER testing (seller1 / Seller@123456 -> 4-Tab Hub)
  const handleFillSellerLogin = () => {
    setLoginUsername('seller1');
    setLoginPassword('Seller@123456');
    setCaptchaInput(String(captcha.answer));
    setErrorMsg('');
  };

  // Instant 1-Click Login directly as Seller (seller1) into the 4-Tab Hub
  const handleDirectSellerLogin = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    setTimeout(() => {
      const res = login('seller1', 'Seller@123456');
      setLoading(false);
      if (!res.success) {
        setWarningModal({
          isOpen: true,
          title: '⚠️ लॉगिन त्रुटि',
          message: res.error,
          type: 'error'
        });
        setErrorMsg(res.error);
      }
    }, 200);
  };

  const handleFillSuperAdminQuick = () => {
    setAdminUsername('jkp97847');
    setAdminPassword('jkp97847');
    setAdminCaptchaInput(String(adminCaptcha.answer));
    setAdminError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 font-sans">
      {/* 1. Header & Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white shadow-xl shadow-indigo-500/20 mb-3">
          <ReceiptText className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
          Online Welcome to Smart Billing
        </h1>
        <p className="text-xs text-indigo-200 mt-1 font-medium">
          ऑनलाइन वेलकम टू स्मार्ट बिलिंग • आधुनिक जीएसटी बिलिंग एवं स्टॉक मैनेजमेंट
        </p>
      </div>

      {/* 2. Main Authentication Card (Only Public Seller Tabs) */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Navigation Tabs (2 Primary Tabs: Login & New User / Sign Up) */}
        <div className="grid grid-cols-2 bg-slate-100 p-1.5 gap-1 border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-3 px-4 rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'login' || activeTab === 'seller_login'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. लॉगिन (Login)</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-3 px-4 rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'register'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2. नया यूजर / साइन-अप (New User)</span>
          </button>
        </div>

        {/* Notification alerts */}
        <div className="p-6 pb-0">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 mb-4 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 mb-4 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* TAB 1: USER LOGIN FORM */}
        {/* ---------------------------------------------------------------- */}
        {(activeTab === 'login' || activeTab === 'seller_login') && (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="inline-block px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded-full text-[11px] font-bold text-indigo-700 mb-1">
                  ✨ Online Welcome to Smart Billing
                </div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  <span>यूजर लॉगिन</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  कृपया अपना यूजरनेम और पासवर्ड दर्ज करके लॉगिन करें
                </p>
              </div>

              {/* Quick Fill & 1-Click Launch Buttons for Seller (4-Tab Hub) */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleFillSellerLogin}
                  className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="डेमो सेलर क्रेडेंशियल भरें (seller1)"
                >
                  <span>⚡ सेलर भरें</span>
                  <span className="font-mono bg-indigo-200/80 text-indigo-950 font-black px-1.5 py-0.2 rounded text-[10px]">seller1</span>
                </button>
                <button
                  type="button"
                  onClick={handleDirectSellerLogin}
                  className="text-[11px] font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm"
                  title="1-क्लिक से सीधे 4-टैब बिलिंग हब में प्रवेश करें"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>🚀 1-क्लिक 4-टैब हब</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSellerLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  यूजरनेम (Username) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    id="login-username"
                    data-no-uppercase="true"
                    autoComplete="username"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="उदा. seller1"
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    पासवर्ड (Password) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setForgotIdentifier(loginUsername);
                      setForgotStep(1);
                      setForgotError('');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                  >
                    पासवर्ड भूल गए? (Forgot?)
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="login-password"
                    data-no-uppercase="true"
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="अपना पासवर्ड दर्ज करें"
                    className="w-full pl-9 pr-10 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Anti-Robot Captcha */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>एंटी-रोबोट सत्यापन (Captcha):</span>
                  </span>
                  <button
                    type="button"
                    onClick={generateNewCaptcha}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>नया सवाल</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white border-2 border-indigo-300 px-4 py-2 rounded-lg font-mono font-black text-base text-indigo-900 tracking-wider select-none shadow-2xs">
                    {captcha.num1} + {captcha.num2} = ?
                  </div>
                  <input
                    type="number"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="उत्तर यहाँ लिखें"
                    className="flex-1 px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>सत्यापित हो रहा है...</span>
                ) : (
                  <>
                    <span>लॉगिन करें (Sign In)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

              {/* 4-Tab Hub Fast-Access Demo Card */}
              <div className="mt-4 p-3.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                    4
                  </div>
                  <div className="text-left">
                    <div className="font-black text-indigo-950 text-xs flex items-center gap-1.5">
                      <span>4-टैब मुख्य यूजर बिलिंग पोर्टल (हब)</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">लाइव</span>
                    </div>
                    <div className="text-[11px] text-indigo-700">
                      डेमो सेलर: <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-indigo-900">seller1</span> | पासवर्ड: <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-indigo-900">Seller@123456</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDirectSellerLogin}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>🚀 सीधे 4-टैब हब खोलें</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-2 text-center text-xs text-slate-500">
                <span>
                  नया खाता बनाना चाहते हैं?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    नया यूजर / साइन-अप करें
                  </button>
                </span>
              </div>
            </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TAB 2: USER REGISTRATION FORM WITH BILLING PROFILE */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === 'register' && (
          <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span>नया यूजर / साइन-अप (New User Registration)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                यहाँ भरी गई समस्त जानकारी आपकी बिलिंग प्रोफाइल में स्वतः सेट होगी और बिल प्रिंट पर प्रदर्शित होगी।
              </p>
            </div>

            <form onSubmit={handleStartRegistration} className="space-y-5">
              {/* SECTION A: ACCOUNT CREDENTIALS */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wide block">
                  1. लॉगिन खाता क्रेडेंशियल्स (Login Credentials):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      यूजरनेम (Username) *
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="reg-username"
                      data-no-uppercase="true"
                      autoComplete="username"
                      value={regData.username}
                      onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                      placeholder="उदा. mobilehub"
                      className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      स्ट्रॉन्ग पासवर्ड *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="reg-password"
                      data-no-uppercase="true"
                      autoComplete="new-password"
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      placeholder="कम से कम 8 अक्षर"
                      className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      कन्फर्म पासवर्ड *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      id="reg-confirm-password"
                      data-no-uppercase="true"
                      autoComplete="new-password"
                      value={regData.confirmPassword}
                      onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                      placeholder="पासवर्ड दोबारा लिखें"
                      className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Password Strength Meter */}
                {regData.password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-600">पासवर्ड मजबूती:</span>
                      <span className={`font-bold ${passwordStrength.textColor}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-full flex-1 transition-all ${
                            level <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      मजबूत पासवर्ड में कम से कम 8 अक्षर, बड़ा अक्षर (A-Z), अंक (0-9) व विशेष चिन्ह (@#$) शामिल करें।
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION B: SHOP & FIRM PROFILE */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wide block">
                  2. दुकान / फर्म का विवरण (Shop Profile):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      दुकान / फर्म का नाम (Shop Name) *
                    </label>
                    <input
                      type="text"
                      value={regData.shopName}
                      onChange={(e) => setRegData({ ...regData, shopName: e.target.value })}
                      placeholder="उदा. श्री श्याम मोबाइल & इलेक्ट्रॉनिक्स"
                      className="w-full px-3 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      प्रोपराइटर / मालिक का नाम *
                    </label>
                    <input
                      type="text"
                      value={regData.ownerName}
                      onChange={(e) => setRegData({ ...regData, ownerName: e.target.value })}
                      placeholder="उदा. रमेश कुमार शर्मा"
                      className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      प्राथमिक मोबाइल नंबर (10 अंक) *
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={regData.mobile}
                      onKeyDown={(e) => {
                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => setRegData({ ...regData, mobile: formatMobileInput(e.target.value) })}
                      placeholder="9829012345"
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      अतिरिक्त मोबाइल नं. 2 (Optional / ऐच्छिक)
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={regData.alternateMobile}
                      onKeyDown={(e) => {
                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => setRegData({ ...regData, alternateMobile: formatMobileInput(e.target.value) })}
                      placeholder="वैकल्पिक नंबर (ऐच्छिक)"
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      ईमेल पता (Email) *
                    </label>
                    <input
                      type="email"
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: formatEmailInput(e.target.value) })}
                      placeholder="shop@example.com"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      दुकान का पूरा पता (बिल पर प्रिंट होगा) *
                    </label>
                    <input
                      type="text"
                      value={regData.address}
                      onChange={(e) => setRegData({ ...regData, address: e.target.value })}
                      placeholder="दुकान नं. 5, मेन मार्केट, स्टेशन रोड"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      राज्य (State) *
                    </label>
                    <input
                      type="text"
                      value={regData.state}
                      onChange={(e) => setRegData({ ...regData, state: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      पिनकोड (6 अंक) *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={regData.pincode}
                      onKeyDown={(e) => {
                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => setRegData({ ...regData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      placeholder="332001"
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION C: GST & BANK / UPI DETAILS */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wide block">
                  3. टैक्स, बैंक व UPI QR विवरण:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      GSTIN नंबर (Optional / ऐच्छिक - यदि उपलब्ध हो)
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={regData.gstin}
                      onChange={(e) => {
                        const val = formatGstinInput(e.target.value);
                        let nextPan = regData.pan;
                        if (val.length >= 12 && (!regData.pan || (regData.gstin.length >= 12 && regData.pan === regData.gstin.slice(2, 12)))) {
                          nextPan = val.slice(2, 12);
                        }
                        setRegData({ ...regData, gstin: val, pan: nextPan });
                      }}
                      placeholder="08AAAAA0000A1Z5 (ऐच्छिक)"
                      className="w-full px-3 py-1.5 text-xs font-mono uppercase font-bold text-indigo-900 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      PAN नंबर (10 अक्षर) *
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={regData.pan}
                      onChange={(e) => setRegData({ ...regData, pan: formatPanInput(e.target.value) })}
                      placeholder="AAAAA0000A"
                      className="w-full px-3 py-1.5 text-xs font-mono uppercase font-bold border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      बैंक का नाम *
                    </label>
                    <input
                      type="text"
                      value={regData.bankName}
                      onChange={(e) => setRegData({ ...regData, bankName: e.target.value })}
                      placeholder="SBI / HDFC / PNB"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      खाता संख्या (A/C No) *
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      value={regData.accountNo}
                      onKeyDown={(e) => {
                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => setRegData({ ...regData, accountNo: formatAccountNoInput(e.target.value) })}
                      placeholder="1234567890"
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      IFSC कोड *
                    </label>
                    <input
                      type="text"
                      maxLength={11}
                      value={regData.ifsc}
                      onChange={(e) => setRegData({ ...regData, ifsc: formatIfscInput(e.target.value) })}
                      placeholder="SBIN0031245"
                      className="w-full px-3 py-1.5 text-xs font-mono uppercase font-bold border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      UPI ID (QR कोड हेतु) *
                    </label>
                    <input
                      type="text"
                      value={regData.upiId}
                      onChange={(e) => setRegData({ ...regData, upiId: formatUpiInput(e.target.value) })}
                      placeholder="shyam@okhdfcbank"
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold text-emerald-800 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Anti-Robot Captcha */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>एंटी-रोबोट सुरक्षा कैप्चा (Security Captcha) *</span>
                  </span>
                  <button
                    type="button"
                    onClick={generateNewCaptcha}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>नया सवाल</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white border-2 border-indigo-300 px-4 py-2 rounded-lg font-mono font-black text-base text-indigo-900 tracking-wider select-none shadow-2xs">
                    {captcha.num1} + {captcha.num2} = ?
                  </div>
                  <input
                    type="number"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="जोड़ का उत्तर यहाँ लिखें"
                    className="flex-1 px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Submit & Proceed Button */}
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>WhatsApp OTP सत्यापन हेतु आगे बढ़ें</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TAB 3: FORGOT PASSWORD - 3-STEP WHATSAPP OTP SELF-SERVICE */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === 'forgot' && (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-indigo-600" />
                  <span>पासवर्ड रीसेट (WhatsApp OTP Verification)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  अपने पंजीकृत मोबाइल पर WhatsApp OTP मंगाकर नया पासवर्ड तुरंत सेट करें
                </p>
              </div>

              {/* Step indicator pills */}
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <span className={`px-2 py-0.5 rounded-full ${forgotStep === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  1. विवरण
                </span>
                <span className="text-slate-300">›</span>
                <span className={`px-2 py-0.5 rounded-full ${forgotStep === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  2. OTP
                </span>
                <span className="text-slate-300">›</span>
                <span className={`px-2 py-0.5 rounded-full ${forgotStep === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  3. नया पासवर्ड
                </span>
              </div>
            </div>

            {forgotError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* STEP 1: ENTER USERNAME OR REGISTERED MOBILE NUMBER */}
            {forgotStep === 1 && (
              <form onSubmit={handleRequestForgotOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    पंजीकृत यूजरनेम अथवा 10-अंकों का मोबाइल नंबर *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      id="forgot-identifier"
                      data-no-uppercase="true"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="उदा. seller1 अथवा 9829012345"
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      autoFocus
                      required
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    सिस्टम इस खाते से जुड़े 1st मोबाइल नंबर पर WhatsApp सत्यापन कोड भेजेगा।
                  </p>
                </div>

                {/* Anti-Robot Captcha */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>सुरक्षा कैप्चा (Captcha):</span>
                    </span>
                    <button
                      type="button"
                      onClick={generateNewCaptcha}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>नया सवाल</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-white border-2 border-indigo-300 px-4 py-2 rounded-lg font-mono font-black text-base text-indigo-900 tracking-wider select-none shadow-2xs">
                      {captcha.num1} + {captcha.num2} = ?
                    </div>
                    <input
                      type="number"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder="उत्तर लिखें"
                      className="flex-1 px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {forgotLoading ? (
                    <span>खोज रहे हैं व OTP भेज रहे हैं...</span>
                  ) : (
                    <>
                      <span>WhatsApp OTP भेजें</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('seller_login')}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                  >
                    ← वापस सेलर लॉगिन पर जाएं
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: ENTER AND VERIFY 4-DIGIT WHATSAPP OTP */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
                {/* WhatsApp Dispatch Notification Card (OTP NOT displayed on screen) */}
                <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl text-xs space-y-2.5">
                  <div className="flex items-center justify-between font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>WhatsApp पर पासवर्ड रीसेट OTP भेजा गया</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 font-mono">+91-{forgotMaskedMobile}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    सुरक्षा के लिए 4-अंकों का पासवर्ड रीसेट OTP कोड सीधे आपके पंजीकृत मोबाइल नंबर के WhatsApp पर भेजा गया है। कृपया अपने मोबाइल में WhatsApp चेक करें और कोड नीचे दर्ज करें।
                  </p>
                  {forgotWhatsappUrl && (
                    <div className="pt-1">
                      <a
                        href={forgotWhatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-lg shadow transition"
                      >
                        <span>📱 WhatsApp पर OTP संदेश खोलें</span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-center">
                  <label className="block text-xs font-bold text-slate-700">
                    WhatsApp पर आया 4-अंकों का OTP कोड यहाँ दर्ज करें:
                  </label>
                  <div className="flex justify-center">
                    <input
                      type="text"
                      maxLength={4}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • •"
                      className="w-44 text-center tracking-[1em] text-2xl font-mono font-black border-2 border-indigo-400 rounded-xl py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-indigo-950 bg-indigo-50/40"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>
                    समय शेष: <strong className="font-mono text-slate-800">{forgotTimer > 0 ? `${forgotTimer}s` : 'समाप्त'}</strong>
                  </span>
                  {forgotTimer === 0 ? (
                    <button
                      type="button"
                      onClick={handleRequestForgotOtp}
                      className="text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                      OTP पुनः भेजें
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">प्रतीक्षा करें...</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>OTP सत्यापित करें व आगे बढ़ें</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setForgotStep(1); setForgotOtp(''); }}
                    className="text-xs text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                  >
                    गलत नंबर? विवरण बदलें
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SET NEW STRONG PASSWORD */}
            {forgotStep === 3 && (
              <form onSubmit={handleCompleteResetPassword} className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-950">सत्यापित सेलर खाता:</span>
                  <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                    {forgotVerifiedUsername || forgotIdentifier}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    नया पासवर्ड (New Strong Password) *
                  </label>
                  <div className="relative">
                    <input
                      type={forgotShowPassword ? 'text' : 'password'}
                      name="password"
                      id="forgot-new-password"
                      data-no-uppercase="true"
                      autoComplete="new-password"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="कम से कम 8 अक्षर (बड़ा अक्षर, अंक, @#$)"
                      className="w-full pl-9 pr-10 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      autoFocus
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setForgotShowPassword(!forgotShowPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {forgotShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {forgotNewPassword && (
                    <div className="space-y-1 pt-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-600">पासवर्ड मजबूती:</span>
                        <span className={`font-bold ${forgotPasswordStrength.textColor}`}>
                          {forgotPasswordStrength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex gap-0.5">
                        <div className={`h-full flex-1 ${forgotPasswordStrength.score >= 1 ? forgotPasswordStrength.color : 'bg-transparent'}`} />
                        <div className={`h-full flex-1 ${forgotPasswordStrength.score >= 2 ? forgotPasswordStrength.color : 'bg-transparent'}`} />
                        <div className={`h-full flex-1 ${forgotPasswordStrength.score >= 3 ? forgotPasswordStrength.color : 'bg-transparent'}`} />
                        <div className={`h-full flex-1 ${forgotPasswordStrength.score >= 4 ? forgotPasswordStrength.color : 'bg-transparent'}`} />
                        <div className={`h-full flex-1 ${forgotPasswordStrength.score >= 5 ? forgotPasswordStrength.color : 'bg-transparent'}`} />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    कन्फर्म नया पासवर्ड (Confirm Password) *
                  </label>
                  <div className="relative">
                    <input
                      type={forgotShowPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      id="forgot-confirm-password"
                      data-no-uppercase="true"
                      autoComplete="new-password"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="नया पासवर्ड दोबारा लिखें"
                      className="w-full pl-9 pr-10 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {forgotLoading ? (
                    <span>पासवर्ड बदल रहा है...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>नया पासवर्ड सुरक्षित करें व लॉगिन करें</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. BOTTOM FOOTER WITH SECRET HIDDEN SUPER ADMIN LOGO */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 select-none">
        <p className="text-[11px] text-slate-400">
          स्मार्ट मोबाइल एवं इलेक्ट्रॉनिक्स शॉप बिलिंग सिस्टम • 100% सुरक्षित स्थानीय डेटा
        </p>

        {/* Explicit dedicated Super Admin Portal button */}
        <button
          type="button"
          onClick={() => {
            setAdminModalOpen(true);
            setAdminUsername('jkp97847');
            setAdminPassword('jkp97847');
            setAdminError('');
            generateAdminCaptcha();
          }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-amber-300 border border-slate-700/80 hover:border-amber-400/50 text-xs font-bold transition-all cursor-pointer shadow-sm mt-1"
          title="सुपर एडमिन कंट्रोल रूम (Master Admin)"
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>🛡️ केवल सुपर एडमिन लॉगिन (Master Admin Portal)</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECRET SUPER ADMIN ACCESS MODAL */}
      {/* ------------------------------------------------------------------ */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-500 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/30 border border-purple-400 flex items-center justify-center text-purple-200">
                  <ShieldCheck className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    सुपर एडमिन कंट्रोल रूम (Master Admin)
                  </h3>
                  <p className="text-[10px] text-purple-200">गोपनीय प्रशासनिक लॉगिन</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdminModalOpen(false)}
                className="text-purple-300 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {adminError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{adminError}</span>
                </div>
              )}

              {/* Quick test credentials button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleFillSuperAdminQuick}
                  className="text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-lg cursor-pointer"
                >
                  ⚡ एडमिन क्रेडेंशियल भरें
                </button>
              </div>

              <form onSubmit={handleAdminLoginSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">एडमिन यूजरनेम *</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      id="admin-username"
                      data-no-uppercase="true"
                      autoComplete="username"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="superadmin"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                      required
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">मास्टर पासवर्ड *</label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      name="password"
                      id="admin-password"
                      data-no-uppercase="true"
                      autoComplete="current-password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Admin Captcha */}
                <div className="bg-purple-50/60 border border-purple-200 p-3 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-950 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                      <span>सुरक्षा कैप्चा:</span>
                    </span>
                    <button
                      type="button"
                      onClick={generateAdminCaptcha}
                      className="text-[10px] text-purple-700 font-bold hover:underline cursor-pointer"
                    >
                      नया सवाल
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-white border border-purple-300 px-3 py-1.5 rounded-lg font-mono font-black text-sm text-purple-950 select-none">
                      {adminCaptcha.num1} + {adminCaptcha.num2} = ?
                    </div>
                    <input
                      type="number"
                      value={adminCaptchaInput}
                      onChange={(e) => setAdminCaptchaInput(e.target.value)}
                      placeholder="उत्तर लिखें"
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 mt-2 transition-all"
                >
                  {adminLoading ? (
                    <span>सत्यापित हो रहा है...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>सुपर एडमिन लॉगिन करें</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* WHATSAPP / MOBILE OTP VERIFICATION MODAL DIALOG */}
      {/* ------------------------------------------------------------------ */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    WhatsApp OTP सत्यापन
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    मोबाइल नंबर +91-{regData.mobile}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOtpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* WhatsApp Dispatch Notification Card (OTP NOT displayed on screen) */}
            <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl mb-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>WhatsApp पर 4-अंकों का OTP भेजा गया है</span>
                </span>
                <span className="text-[11px] text-emerald-700 font-mono">+91-{regData.mobile}</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                सुरक्षा हेतु 4-अंकों का सत्यापन कोड सीधे आपके प्राथमिक मोबाइल नंबर के WhatsApp पर भेजा गया है। कृपया अपने मोबाइल में WhatsApp चेक करें और कोड नीचे दर्ज करें।
              </p>
              {whatsappDispatchUrl && (
                <div className="pt-1">
                  <a
                    href={whatsappDispatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-lg shadow transition"
                  >
                    <span>📱 WhatsApp पर OTP संदेश खोलें</span>
                  </a>
                </div>
              )}
            </div>

            {otpError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold mb-3">
                {otpError}
              </div>
            )}

            {/* 4-digit OTP input */}
            <div className="space-y-3">
              <label className="block text-center text-xs font-bold text-slate-700">
                WhatsApp पर प्राप्त 4-अंकों का OTP कोड यहाँ दर्ज करें:
              </label>
              <div className="flex justify-center">
                <input
                  type="text"
                  maxLength={4}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • •"
                  className="w-44 text-center tracking-[1em] text-2xl font-mono font-black border-2 border-indigo-400 rounded-xl py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-indigo-950 bg-indigo-50/40"
                  autoFocus
                />
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                <span>
                  समय शेष:{' '}
                  <span className="font-mono font-bold text-slate-800">
                    {otpTimer > 0 ? `${otpTimer}s` : 'समाप्त'}
                  </span>
                </span>
                {otpTimer === 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const res = sendWhatsAppOtp(regData.mobile);
                      if (res.success) {
                        setOtpTimer(60);
                        const cleanMobile = regData.mobile.replace(/\D/g, '').slice(-10);
                        const msg = encodeURIComponent(
                          `नमस्ते ${regData.ownerName}! Smart Billing सॉफ्टवेयर में आपका स्वागत है। आपकी फर्म "${regData.shopName}" के रजिस्ट्रेशन हेतु 4-अंकों का सत्यापन OTP कोड है: *${res.otp}* (यह कोड 10 मिनट के लिए मान्य है)।`
                        );
                        const waUrl = `https://api.whatsapp.com/send?phone=91${cleanMobile}&text=${msg}`;
                        setWhatsappDispatchUrl(waUrl);
                        try {
                          window.open(waUrl, '_blank');
                        } catch {
                          // Popup blocker fallback
                        }
                      }
                    }}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    OTP पुनः भेजें
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400">पुनः भेजने हेतु प्रतीक्षा करें</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleVerifyOtpAndComplete}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>सत्यापित करें व साइन-अप पूरा करें</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* WARNING / ALERT MESSAGE BOX MODAL */}
      {/* ------------------------------------------------------------------ */}
      {warningModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-amber-300 animate-in fade-in zoom-in-95 duration-200">
            <div className={`w-14 h-14 ${warningModal.type === 'error' ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-amber-100 text-amber-600 border border-amber-200'} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm`}>
              {warningModal.type === 'error' ? <AlertCircle className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
            </div>
            <h3 className="text-base font-black text-slate-900 text-center">
              {warningModal.title}
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2.5 leading-relaxed font-medium">
              {warningModal.message}
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setWarningModal({ isOpen: false, title: '', message: '', type: 'warning' })}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                autoFocus
              >
                ठीक है / समझ गया (OK)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SIGNUP SUCCESS: CREDENTIALS REMINDER MODAL */}
      {/* ------------------------------------------------------------------ */}
      {signupSuccessModal.isOpen && signupSuccessModal.creds && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-emerald-400 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center tracking-tight">
              🎉 रजिस्ट्रेशन सफलतापूर्वक संपन्न हुआ!
            </h3>
            <p className="text-xs text-slate-600 text-center mt-1">
              Online Welcome to Smart Billing! कृपया अपने लॉगिन क्रेडेंशियल याद रखें या सुरक्षित नोट कर लें:
            </p>

            <div className="my-4 bg-slate-50 border-2 border-indigo-200 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">यूजरनेम (Username):</span>
                <span className="font-mono font-black text-indigo-700 bg-white px-3 py-1 rounded-lg border border-indigo-200 text-sm select-all shadow-2xs">
                  {signupSuccessModal.creds.username}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">पासवर्ड (Password):</span>
                <span className="font-mono font-black text-indigo-700 bg-white px-3 py-1 rounded-lg border border-indigo-200 text-sm select-all shadow-2xs">
                  {signupSuccessModal.creds.password}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-medium">दुकान / फर्म:</span>
                <span className="font-bold text-slate-800">
                  {signupSuccessModal.creds.shopName}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">पंजीकृत मोबाइल:</span>
                <span className="font-mono text-slate-700 font-bold">
                  +91-{signupSuccessModal.creds.mobile}
                </span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 flex items-start gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>महत्वपूर्ण सूचना:</strong> भविष्य में इसी यूजरनेम और पासवर्ड से आप लॉगिन कर सकेंगे। कृपया इसे अपनी डायरी में या सुरक्षित नोट कर लें।
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Smart Billing Login Credentials:\nUsername: ${signupSuccessModal.creds.username}\nPassword: ${signupSuccessModal.creds.password}\nShop: ${signupSuccessModal.creds.shopName}\nMobile: ${signupSuccessModal.creds.mobile}`
                  );
                  setCopiedCreds(true);
                  setTimeout(() => setCopiedCreds(false), 2500);
                }}
                className="flex-1 py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedCreds ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCreds ? 'कॉपी हो गया ✓' : 'क्रेडेंशियल कॉपी करें'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const u = signupSuccessModal.creds.username;
                  const p = signupSuccessModal.creds.password;
                  setSignupSuccessModal({ isOpen: false, creds: null });
                  setLoginUsername(u);
                  setLoginPassword(p);
                  setCaptchaInput(String(captcha.answer));
                  setActiveTab('login');
                  // Auto-login directly
                  login(u, p);
                }}
                className="flex-1 py-3 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>सीधे लॉगिन करें ➔</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
