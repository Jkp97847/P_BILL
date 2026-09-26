import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const DEFAULT_MODULE_PERMISSIONS = {
  gst_billing: true,      // 1. Smart GST Billing
  nongst_billing: true,   // 2. Non GST All Only Billing
  receipt_billing: true,  // 3. Premium Receipt Billing
  pos_billing: true       // 4. POS & Quick Counter Billing
};

// ----------------------------------------------------------------------------
// INITIAL SEED USERS (Super Admin and Demo Seller)
// ----------------------------------------------------------------------------
const INITIAL_USERS = [
  {
    id: 'superadmin_1',
    username: 'jkp97847',
    password: 'jkp97847',
    role: 'superadmin',
    status: 'approved', // 'approved' | 'pending' | 'disabled'
    createdAt: '2026-09-01T10:00:00.000Z',
    allowedModules: { ...DEFAULT_MODULE_PERMISSIONS },
    profile: {
      shopName: 'स्मार्ट बिलिंग एडमिन मुख्यालय',
      ownerName: 'चीफ एडमिनिस्ट्रेटर',
      mobile: '9829097847',
      alternateMobile: '',
      email: 'admin@smartbilling.in',
      address: 'सेंट्रल कंट्रोल रूम, जयपुर (राज.)',
      state: 'Rajasthan',
      stateCode: '08',
      pincode: '302001',
      gstin: '08AAACA0000A1Z5',
      pan: 'AAACA0000A',
      bankName: 'State Bank of India',
      accountNo: '10000000001',
      ifsc: 'SBIN0001000',
      upiId: 'jkp97847@sbi'
    }
  },
  {
    id: 'seller_demo',
    username: 'seller1',
    password: 'Seller@123456',
    role: 'seller',
    status: 'approved',
    createdAt: '2026-09-10T12:00:00.000Z',
    allowedModules: { ...DEFAULT_MODULE_PERMISSIONS },
    profile: {
      shopName: 'श्री श्याम मोबाइल & इलेक्ट्रॉनिक्स',
      ownerName: 'रमेश कुमार शर्मा',
      mobile: '9829012345',
      alternateMobile: '9829054321',
      email: 'shyam.mobile@example.com',
      address: 'स्टेशन रोड, सीकर (राज.)',
      state: 'Rajasthan',
      stateCode: '08',
      pincode: '332001',
      gstin: '08AABCR1234F1Z1',
      pan: 'AABCR1234F',
      bankName: 'State Bank of India (SBI)',
      accountNo: '30495867201',
      ifsc: 'SBIN0031245',
      upiId: 'shyam.mobile@oksbi'
    }
  }
];

export function AuthProvider({ children }) {
  // 1. Registered Users List
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('mobile_billing_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          let combined = parsed.map(u => ({
            ...u,
            role: u.username.toLowerCase() === 'jkp97847' ? 'superadmin' : 'seller',
            status: u.username.toLowerCase() === 'seller1' ? 'approved' : (u.status || 'approved'),
            allowedModules: u.allowedModules || { ...DEFAULT_MODULE_PERMISSIONS }
          }));
          // Ensure jkp97847 exists with password jkp97847 and superadmin role
          const adminIdx = combined.findIndex(u => u.username.toLowerCase() === 'jkp97847');
          if (adminIdx >= 0) {
            combined[adminIdx] = { 
              ...combined[adminIdx], 
              password: 'jkp97847', 
              role: 'superadmin', 
              status: 'approved',
              allowedModules: combined[adminIdx].allowedModules || { ...DEFAULT_MODULE_PERMISSIONS }
            };
          } else {
            combined.unshift(INITIAL_USERS[0]);
          }

          // Ensure demo seller seller1 exists with password Seller@123456 and seller role
          const demoIdx = combined.findIndex(u => u.username.toLowerCase() === 'seller1');
          if (demoIdx >= 0) {
            combined[demoIdx] = {
              ...combined[demoIdx],
              password: 'Seller@123456',
              role: 'seller',
              status: 'approved',
              allowedModules: combined[demoIdx].allowedModules || { ...DEFAULT_MODULE_PERMISSIONS }
            };
          } else {
            combined.push(INITIAL_USERS[1]);
          }

          return combined;
        }
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

// Helper to detect if the current page load is a true in-tab reload (F5 / Refresh button)
const isCleanReload = () => {
  try {
    const navEntries = performance.getEntriesByType?.('navigation');
    if (navEntries && navEntries[0] && navEntries[0].type === 'reload') {
      return true;
    }
  } catch {
    // fallback
  }
  try {
    const reloadFlag = sessionStorage.getItem('mobile_billing_page_reloading');
    if (reloadFlag && Date.now() - parseInt(reloadFlag, 10) < 8000) {
      return true;
    }
  } catch {
    // fallback
  }
  return false;
};

// Safely retrieve session user from sessionStorage with power-cut and unexpected close protection
const getInitialSessionUser = () => {
  try {
    // Clean legacy persistent session keys from localStorage
    localStorage.removeItem('mobile_billing_current_session');
    localStorage.removeItem('mobile_billing_impersonated_seller');
    localStorage.removeItem('mobile_billing_selected_module');

    const saved = sessionStorage.getItem('mobile_billing_current_session');
    if (!saved) return null;

    // Heartbeat check: detect if browser crashed, light went out (power failure), or browser was closed and restored
    const lastHeartbeat = sessionStorage.getItem('mobile_billing_session_heartbeat');
    const heartbeatAge = lastHeartbeat ? Date.now() - parseInt(lastHeartbeat, 10) : Infinity;
    const reloaded = isCleanReload();

    // If it is NOT an instant in-tab page reload (i.e. power cut occurred, PC restarted,
    // browser reopened after closure, or heartbeat was halted > 8 seconds ago):
    // Force complete session wipe so user MUST always see login page!
    if (!reloaded && heartbeatAge > 8000) {
      sessionStorage.removeItem('mobile_billing_current_session');
      sessionStorage.removeItem('mobile_billing_impersonated_seller');
      sessionStorage.removeItem('mobile_billing_selected_module');
      sessionStorage.removeItem('mobile_billing_session_heartbeat');
      sessionStorage.removeItem('mobile_billing_page_reloading');
      return null;
    }

    const parsedSession = JSON.parse(saved);
    if (parsedSession && parsedSession.username) {
      parsedSession.role = parsedSession.username.toLowerCase() === 'jkp97847' ? 'superadmin' : 'seller';
    }
    return parsedSession;
  } catch {
    return null;
  }
};

  // 2. Current Session User (strictly session-based: tab close / power failure automatically logs out)
  const [currentUser, setCurrentUser] = useState(() => getInitialSessionUser());

  // 3. Impersonation / View-as-Seller (strictly session-based)
  const [impersonatedSeller, setImpersonatedSeller] = useState(() => {
    try {
      if (!sessionStorage.getItem('mobile_billing_current_session')) return null;
      const saved = sessionStorage.getItem('mobile_billing_impersonated_seller');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 4. Platform Settings (e.g. Auto-approve vs Manual-approve, Auto-grant modules - saved permanently)
  const [platformConfig, setPlatformConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('mobile_billing_platform_config');
      return saved ? JSON.parse(saved) : { autoApproveSellers: true, autoGrantAllModules: true };
    } catch {
      return { autoApproveSellers: true, autoGrantAllModules: true };
    }
  });

  // 5. Active View (for Super Admin: 'admin_portal' vs 'seller_view')
  const [activeAdminView, setActiveAdminView] = useState('admin_portal'); // 'admin_portal' | 'billing_app'

  // 6. Selected Module in Multi-Module Platform ('hub' | 'gst_billing' | 'nongst_billing' | 'receipt_billing' | 'pos_billing')
  const [selectedModule, setSelectedModule] = useState(() => {
    try {
      if (!sessionStorage.getItem('mobile_billing_current_session')) return 'hub';
      return sessionStorage.getItem('mobile_billing_selected_module') || 'hub';
    } catch {
      return 'hub';
    }
  });

  // Mark beforeunload so legitimate page reloads (F5) can be recognized
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        sessionStorage.setItem('mobile_billing_page_reloading', Date.now().toString());
      } catch {
        // ignore
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Heartbeat monitoring for active sessions: continuously updates timestamp in sessionStorage
  useEffect(() => {
    if (!currentUser) {
      try {
        sessionStorage.removeItem('mobile_billing_session_heartbeat');
        sessionStorage.removeItem('mobile_billing_page_reloading');
      } catch {
        // ignore
      }
      return;
    }

    const stampHeartbeat = () => {
      try {
        sessionStorage.setItem('mobile_billing_session_heartbeat', Date.now().toString());
      } catch {
        // ignore
      }
    };

    stampHeartbeat();
    const interval = setInterval(stampHeartbeat, 1500);

    window.addEventListener('mousemove', stampHeartbeat, { passive: true });
    window.addEventListener('keydown', stampHeartbeat, { passive: true });
    window.addEventListener('click', stampHeartbeat, { passive: true });
    document.addEventListener('visibilitychange', stampHeartbeat);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', stampHeartbeat);
      window.removeEventListener('keydown', stampHeartbeat);
      window.removeEventListener('click', stampHeartbeat);
      document.removeEventListener('visibilitychange', stampHeartbeat);
    };
  }, [currentUser]);

  // Sync selectedModule to sessionStorage (reset to hub on fresh session)
  useEffect(() => {
    try {
      if (selectedModule) {
        sessionStorage.setItem('mobile_billing_selected_module', selectedModule);
      }
      localStorage.removeItem('mobile_billing_selected_module');
    } catch (err) {
      console.error('Error saving selectedModule:', err);
    }
  }, [selectedModule]);

  // Sync users to localStorage (User accounts and passwords must be persistent)
  useEffect(() => {
    try {
      localStorage.setItem('mobile_billing_users', JSON.stringify(users));
    } catch (err) {
      console.error('Error saving users to localStorage:', err);
    }
  }, [users]);

  // Sync session strictly to sessionStorage
  useEffect(() => {
    try {
      if (currentUser) {
        sessionStorage.setItem('mobile_billing_current_session', JSON.stringify(currentUser));
        sessionStorage.setItem('mobile_billing_session_heartbeat', Date.now().toString());
      } else {
        sessionStorage.removeItem('mobile_billing_current_session');
        sessionStorage.removeItem('mobile_billing_session_heartbeat');
        sessionStorage.removeItem('mobile_billing_page_reloading');
      }
      localStorage.removeItem('mobile_billing_current_session');
    } catch (err) {
      console.error('Error saving session:', err);
    }
  }, [currentUser]);

  // Sync impersonation strictly to sessionStorage
  useEffect(() => {
    try {
      if (impersonatedSeller) {
        sessionStorage.setItem('mobile_billing_impersonated_seller', JSON.stringify(impersonatedSeller));
      } else {
        sessionStorage.removeItem('mobile_billing_impersonated_seller');
      }
      localStorage.removeItem('mobile_billing_impersonated_seller');
    } catch (err) {
      console.error('Error saving impersonation:', err);
    }
  }, [impersonatedSeller]);

  // Sync platform config to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mobile_billing_platform_config', JSON.stringify(platformConfig));
    } catch (err) {
      console.error('Error saving platform config:', err);
    }
  }, [platformConfig]);

  // --------------------------------------------------------------------------
  // AUTHENTICATION METHODS
  // --------------------------------------------------------------------------

  // Login
  const login = (username, password) => {
    const cleanUser = String(username || '').trim().toLowerCase();
    const found = users.find(u => u.username.toLowerCase() === cleanUser);

    if (!found) {
      return { success: false, error: 'यूजरनेम मौजूद नहीं है! कृपया सही यूजरनेम दर्ज करें या नया साइन-अप करें।' };
    }

    if (found.password !== password) {
      return { success: false, error: 'गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें।' };
    }

    if (found.status === 'disabled') {
      return { success: false, error: 'आपका खाता सुपर एडमिन द्वारा निष्क्रिय (Disabled) कर दिया गया है। कृपया एडमिन से संपर्क करें।' };
    }

    if (found.status === 'pending') {
      return { success: false, error: 'आपका खाता अनुमोदन हेतु लंबित (Pending Approval) है। सुपर एडमिन द्वारा स्वीकार करने के बाद आप लॉगिन कर सकेंगे।' };
    }

    // Set session: Super admin lands directly in admin_portal (no personal billing); Seller lands in billing_app
    setCurrentUser(found);
    setImpersonatedSeller(null);
    if (found.role === 'superadmin') {
      setActiveAdminView('admin_portal');
      setSelectedModule('hub');
    } else {
      setActiveAdminView('billing_app');
      setSelectedModule('hub');
    }
    try {
      sessionStorage.setItem('mobile_billing_current_session', JSON.stringify(found));
      sessionStorage.setItem('mobile_billing_session_heartbeat', Date.now().toString());
      sessionStorage.setItem('mobile_billing_selected_module', 'hub');
    } catch {
      // ignore
    }
    return { success: true, user: found };
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    setImpersonatedSeller(null);
    setActiveAdminView('billing_app');
    setSelectedModule('hub');
    try {
      sessionStorage.removeItem('mobile_billing_current_session');
      sessionStorage.removeItem('mobile_billing_impersonated_seller');
      sessionStorage.removeItem('mobile_billing_selected_module');
      sessionStorage.removeItem('mobile_billing_session_heartbeat');
      sessionStorage.removeItem('mobile_billing_page_reloading');
      localStorage.removeItem('mobile_billing_current_session');
      localStorage.removeItem('mobile_billing_impersonated_seller');
      localStorage.removeItem('mobile_billing_selected_module');
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  // Helper to check if a username already exists in any user account (case-insensitive)
  const isUsernameTaken = (username, excludeUserId = null) => {
    const clean = String(username || '').trim().toLowerCase();
    if (!clean) return false;
    return users.some(u => {
      if (excludeUserId && u.id === excludeUserId) return false;
      return String(u.username || '').trim().toLowerCase() === clean;
    });
  };

  // Helper to check if a 10-digit mobile number already exists in any user account
  const isMobileTaken = (mobile, excludeUserId = null) => {
    const clean = String(mobile || '').replace(/\D/g, '').slice(-10);
    if (!clean || clean.length < 10) return false;
    return users.some(u => {
      if (excludeUserId && u.id === excludeUserId) return false;
      const uMob = String(u.profile?.mobile || u.mobile || '').replace(/\D/g, '').slice(-10);
      const uAlt = String(u.profile?.alternateMobile || u.alternateMobile || '').replace(/\D/g, '').slice(-10);
      return (uMob && uMob === clean) || (uAlt && uAlt === clean);
    });
  };

  // Register New Seller
  const registerSeller = (sellerData) => {
    const cleanUser = String(sellerData.username || '').trim();
    const cleanMobile = String(sellerData.mobile || '').replace(/\D/g, '').slice(-10);

    // 1. Check unique username (Already exists check)
    if (isUsernameTaken(cleanUser)) {
      return { 
        success: false, 
        error: `यूजरनेम "${cleanUser}" पहले से किसी अन्य यूजर द्वारा पंजीकृत है! कृपया कोई दूसरा यूनिक यूजरनेम चुनें।` 
      };
    }

    // 2. Check unique primary mobile (Already exists check)
    if (isMobileTaken(cleanMobile)) {
      return { 
        success: false, 
        error: `मोबाइल नंबर "+91-${cleanMobile}" पहले से पंजीकृत है! कृपया किसी अन्य मोबाइल नंबर का उपयोग करें या सीधे लॉगिन करें।` 
      };
    }

    // Determine initial status based on platform policy
    const initialStatus = platformConfig.autoApproveSellers ? 'approved' : 'pending';
    const initialModules = platformConfig.autoGrantAllModules !== false
      ? { ...DEFAULT_MODULE_PERMISSIONS }
      : { gst_billing: true, nongst_billing: false, receipt_billing: false, pos_billing: false };

    const newId = `seller_${Date.now()}`;
    const newUser = {
      id: newId,
      username: sellerData.username.trim(),
      password: sellerData.password,
      role: 'seller',
      status: initialStatus,
      allowedModules: initialModules,
      createdAt: new Date().toISOString(),
      profile: {
        shopName: (sellerData.shopName || '').trim(),
        ownerName: (sellerData.ownerName || '').trim(),
        mobile: cleanMobile,
        alternateMobile: sellerData.alternateMobile ? String(sellerData.alternateMobile).replace(/\D/g, '') : '',
        email: (sellerData.email || '').trim(),
        address: (sellerData.address || '').trim(),
        state: sellerData.state || 'Rajasthan',
        stateCode: sellerData.stateCode || '08',
        pincode: sellerData.pincode || '',
        gstin: (sellerData.gstin || '').toUpperCase().trim(),
        pan: (sellerData.pan || '').toUpperCase().trim(),
        bankName: (sellerData.bankName || '').trim(),
        accountNo: (sellerData.accountNo || '').trim(),
        ifsc: (sellerData.ifsc || '').toUpperCase().trim(),
        upiId: (sellerData.upiId || '').trim()
      }
    };

    setUsers(prev => [newUser, ...prev]);

    return {
      success: true,
      user: newUser,
      isPending: initialStatus === 'pending'
    };
  };

  // --------------------------------------------------------------------------
  // WHATSAPP / MOBILE OTP SIMULATION
  // --------------------------------------------------------------------------
  const [activeOtpStore, setActiveOtpStore] = useState({});

  const sendWhatsAppOtp = (mobileNumber) => {
    const clean = String(mobileNumber || '').replace(/\D/g, '');
    if (clean.length !== 10) {
      return { success: false, error: 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' };
    }

    // Generate random 4-digit OTP
    const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));
    setActiveOtpStore(prev => ({
      ...prev,
      [clean]: {
        otp: generatedOtp,
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
      }
    }));

    return {
      success: true,
      otp: generatedOtp,
      mobile: clean,
      message: `WhatsApp OTP (+91-${clean}) पर सफलतापूर्वक प्रेषित किया गया!`
    };
  };

  const verifyOtp = (mobileNumber, enteredOtp, clearOnSuccess = true) => {
    const clean = String(mobileNumber || '').replace(/\D/g, '');
    const record = activeOtpStore[clean];

    if (!record) {
      return { success: false, error: 'इस नंबर के लिए कोई OTP नहीं भेजा गया है या समय समाप्त हो चुका है।' };
    }

    if (Date.now() > record.expiresAt) {
      return { success: false, error: 'OTP की वैधता समाप्त हो गई है! कृपया नया OTP भेजें।' };
    }

    if (String(record.otp).trim() !== String(enteredOtp).trim()) {
      return { success: false, error: 'गलत OTP! कृपया WhatsApp पर आया 4-अंकों का सही कोड दर्ज करें।' };
    }

    // Clear OTP on success if requested
    if (clearOnSuccess) {
      setActiveOtpStore(prev => {
        const next = { ...prev };
        delete next[clean];
        return next;
      });
    }

    return { success: true };
  };

  // --------------------------------------------------------------------------
  // FORGOT PASSWORD SELF-SERVICE WITH WHATSAPP OTP
  // --------------------------------------------------------------------------
  const requestForgotPasswordOtp = (identifier) => {
    const cleanId = String(identifier || '').trim().toLowerCase();
    const cleanDigits = cleanId.replace(/\D/g, '');

    // Find user by username or primary mobile
    const user = users.find(u => {
      const matchUsername = u.username.toLowerCase() === cleanId;
      const matchMobile = cleanDigits.length === 10 && u.profile?.mobile === cleanDigits;
      return matchUsername || matchMobile;
    });

    if (!user) {
      return { 
        success: false, 
        error: 'यह यूजरनेम या मोबाइल नंबर पंजीकृत नहीं है! कृपया सही विवरण दर्ज करें।' 
      };
    }

    if (!user.profile?.mobile || user.profile.mobile.length !== 10) {
      return { 
        success: false, 
        error: 'इस खाते में कोई मान्य 10-अंकों का मोबाइल नंबर दर्ज नहीं है। कृपया सुपर एडमिन से संपर्क करें।' 
      };
    }

    const otpRes = sendWhatsAppOtp(user.profile.mobile);
    if (!otpRes.success) {
      return otpRes;
    }

    const masked = `${user.profile.mobile.slice(0, 2)}******${user.profile.mobile.slice(-2)}`;
    return {
      success: true,
      mobile: user.profile.mobile,
      maskedMobile: masked,
      username: user.username,
      otp: otpRes.otp,
      message: `WhatsApp OTP पंजीकृत मोबाइल (+91-${masked}) पर भेज दिया गया है!`
    };
  };

  const resetPasswordWithOtp = (identifier, enteredOtp, newPassword) => {
    const cleanId = String(identifier || '').trim().toLowerCase();
    const cleanDigits = cleanId.replace(/\D/g, '');

    const user = users.find(u => {
      const matchUsername = u.username.toLowerCase() === cleanId;
      const matchMobile = cleanDigits.length === 10 && u.profile?.mobile === cleanDigits;
      return matchUsername || matchMobile;
    });

    if (!user) {
      return { success: false, error: 'यूजर खाता नहीं मिला!' };
    }

    // Verify OTP
    const verifyRes = verifyOtp(user.profile.mobile, enteredOtp);
    if (!verifyRes.success) {
      return verifyRes;
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'नया पासवर्ड कम से कम 6 अक्षरों का होना अनिवार्य है।' };
    }

    // Update user password
    setUsers(prev =>
      prev.map(u => (u.id === user.id ? { ...u, password: newPassword } : u))
    );

    return { 
      success: true, 
      message: `उपयोगकर्ता "${user.username}" का पासवर्ड सफलतापूर्वक बदल दिया गया है! अब आप नए पासवर्ड से लॉगिन कर सकते हैं।` 
    };
  };

  // --------------------------------------------------------------------------
  // SUPER ADMIN MANAGEMENT ACTIONS
  // --------------------------------------------------------------------------

  // Approve Seller
  const approveSeller = (sellerId) => {
    setUsers(prev =>
      prev.map(u => (u.id === sellerId ? { ...u, status: 'approved' } : u))
    );
    return { success: true, message: 'सेलर को सफलतापूर्वक अनुमोदित (Approved) कर दिया गया है!' };
  };

  // Reject / Delete Seller
  const rejectSeller = (sellerId) => {
    setUsers(prev => prev.filter(u => u.id !== sellerId));
    return { success: true, message: 'सेलर का आवेदन निरस्त/हटा दिया गया है।' };
  };

  // Toggle User Active / Disabled Status
  const toggleUserStatus = (sellerId) => {
    let newStatus = 'approved';
    setUsers(prev =>
      prev.map(u => {
        if (u.id === sellerId) {
          newStatus = u.status === 'approved' ? 'disabled' : 'approved';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
    return { success: true, newStatus };
  };

  // Reset Seller Password (by Super Admin)
  const resetUserPassword = (sellerId, newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' };
    }
    setUsers(prev =>
      prev.map(u => (u.id === sellerId ? { ...u, password: newPassword } : u))
    );
    return { success: true, message: 'पासवर्ड सफलतापूर्वक बदल दिया गया है!' };
  };

  // Edit Seller Profile (by Super Admin or Seller)
  // Edit Seller Profile (by Super Admin or Seller)
  const updateSellerProfile = (sellerId, updatedProfile) => {
    // Check GSTIN deletion restriction:
    // "ek baar user gst no se login kar le uske baad user gst no ko hatakar save n kar sakte ha change jarur kar sakta h"
    if (updatedProfile && updatedProfile.gstin !== undefined) {
      const existingUser = users.find(u => u.id === sellerId || u.username === sellerId);
      const existingGst = existingUser?.profile?.gstin?.trim();
      const newGst = String(updatedProfile.gstin || '').trim();

      if (existingGst && existingGst.length >= 10 && !newGst) {
        return { 
          success: false, 
          error: 'सुरक्षा नियम: GST नंबर हटाया नहीं जा सकता! आप GST नंबर बदल सकते हैं, लेकिन खाली नहीं छोड़ सकते।' 
        };
      }
    }

    setUsers(prev =>
      prev.map(u => {
        if (u.id === sellerId) {
          return {
            ...u,
            profile: {
              ...u.profile,
              ...updatedProfile
            }
          };
        }
        return u;
      })
    );

    // If updating current user's profile, update session as well
    if (currentUser && (currentUser.id === sellerId || currentUser.username === sellerId)) {
      setCurrentUser(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          ...updatedProfile
        }
      }));
    }

    return { success: true, message: 'सेलर प्रोफाइल सफलतापूर्वक अपडेट हो गई!' };
  };

  // Helper method to check if current user or specified user has a valid GST number filled
  const checkUserHasGstin = (userToCheck = currentUser) => {
    if (!userToCheck) return false;
    // 1. Check user profile
    const pGstin = (userToCheck.profile?.gstin || '').trim();
    if (pGstin.length >= 10) return true;

    // 2. Check saved settings in localStorage
    try {
      const sellerId = userToCheck.id || userToCheck.username;
      let saved = localStorage.getItem(`mobile_billing_settings_${sellerId}`);
      if (!saved && (sellerId === 'seller_demo' || sellerId === 'seller1')) {
        saved = localStorage.getItem('mobile_billing_settings');
      }
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.gstin && String(parsed.gstin).trim().length >= 10) {
          return true;
        }
      }
    } catch {
      // ignore
    }

    return false;
  };

  // Save GSTIN for user (updates profile, current session, and billing settings in localStorage)
  const saveUserGstin = (userId, rawGstin) => {
    const cleanGstin = String(rawGstin || '').trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
    if (!cleanGstin) {
      return { success: false, error: 'सुरक्षा नियम: GST नंबर हटाया नहीं जा सकता! आप GST नंबर बदल सकते हैं, लेकिन खाली नहीं छोड़ सकते।' };
    }
    if (cleanGstin.length !== 15) {
      return { success: false, error: `GSTIN नंबर ठीक 15 अक्षरों का होना चाहिए! (वर्तमान में: ${cleanGstin.length} अक्षर)` };
    }
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(cleanGstin)) {
      return { success: false, error: 'मानक 15-अक्षरों का वैध GSTIN फॉर्मेट दर्ज करें (उदा. 08ABCDE1234F1Z5)।' };
    }

    const stateCode = cleanGstin.slice(0, 2);
    const pan = cleanGstin.slice(2, 12);

    // 1. Update Profile in users & currentUser
    const profileRes = updateSellerProfile(userId, {
      gstin: cleanGstin,
      ...(pan ? { pan } : {}),
      ...(stateCode ? { stateCode } : {})
    });

    if (profileRes && !profileRes.success) {
      return profileRes;
    }

    // 2. Update Billing Settings in localStorage for this user
    try {
      const key = `mobile_billing_settings_${userId}`;
      let settings = {};
      const saved = localStorage.getItem(key);
      if (saved) {
        settings = JSON.parse(saved);
      }
      settings = {
        ...settings,
        gstin: cleanGstin,
        ...(pan ? { pan } : {}),
        ...(stateCode ? { stateCode } : {})
      };
      localStorage.setItem(key, JSON.stringify(settings));

      if (userId === 'seller_demo' || userId === 'seller1') {
        localStorage.setItem('mobile_billing_settings', JSON.stringify(settings));
      }
    } catch (err) {
      console.error('Error saving GSTIN to billing settings:', err);
    }

    return { success: true, gstin: cleanGstin };
  };

  // Impersonate / View as Seller (Super Admin support tool)
  const startImpersonation = (sellerId) => {
    const target = users.find(u => (u.id === sellerId || u.username === sellerId) && u.role === 'seller');
    if (target) {
      setImpersonatedSeller(target);
      setActiveAdminView('billing_app');
      setSelectedModule('hub');
      try {
        sessionStorage.setItem('mobile_billing_impersonated_seller', JSON.stringify(target));
        sessionStorage.setItem('mobile_billing_selected_module', 'hub');
      } catch {
        // ignore
      }
      return { success: true, seller: target };
    }
    return { success: false, error: 'सेलर नहीं मिला।' };
  };

  const stopImpersonation = () => {
    setImpersonatedSeller(null);
    setActiveAdminView('admin_portal');
    setSelectedModule('hub');
    try {
      sessionStorage.removeItem('mobile_billing_impersonated_seller');
      sessionStorage.removeItem('mobile_billing_selected_module');
    } catch {
      // ignore
    }
  };

  // Safe setter for activeAdminView with strict role guard: regular sellers can NEVER access admin_portal!
  const safeSetActiveAdminView = (view) => {
    if (view === 'admin_portal' && currentUser?.role !== 'superadmin') {
      console.warn('Unauthorized: Regular users/sellers cannot access Admin Portal');
      return;
    }
    setActiveAdminView(view);
  };

  // Super Admin: Update user's allowed module access (turn any tab on/off)
  const updateUserModules = (userId, moduleKey, isEnabled) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId || u.username === userId) {
        const currentMods = u.allowedModules || { ...DEFAULT_MODULE_PERMISSIONS };
        const updatedUser = {
          ...u,
          allowedModules: {
            ...currentMods,
            [moduleKey]: Boolean(isEnabled)
          }
        };
        // Update current session user in-memory if matching
        if (currentUser && (currentUser.id === u.id || currentUser.username === u.username)) {
          setCurrentUser(updatedUser);
        }
        return updatedUser;
      }
      return u;
    }));
  };

  // Update Platform Config (Auto-approve vs Manual)
  const updatePlatformConfig = (newConfig) => {
    setPlatformConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Active Effective Seller (either currentUser if seller, or impersonated seller)
  const activeSeller = impersonatedSeller || (currentUser?.role === 'seller' ? currentUser : null);

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        activeSeller,
        impersonatedSeller,
        activeAdminView,
        setActiveAdminView: safeSetActiveAdminView,
        selectedModule,
        setSelectedModule,
        updateUserModules,
        DEFAULT_MODULE_PERMISSIONS,
        platformConfig,
        updatePlatformConfig,
        login,
        logout,
        registerSeller,
        sendWhatsAppOtp,
        verifyOtp,
        requestForgotPasswordOtp,
        resetPasswordWithOtp,
        approveSeller,
        rejectSeller,
        toggleUserStatus,
        resetUserPassword,
        updateSellerProfile,
        checkUserHasGstin,
        saveUserGstin,
        startImpersonation,
        stopImpersonation,
        isUsernameTaken,
        isMobileTaken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
