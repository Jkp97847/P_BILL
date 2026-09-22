import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const INITIAL_USERS = [
  {
    id: 'admin_root',
    username: 'admin',
    password: 'Admin@123',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    profile: {
      name: 'सिस्टम एडमिनिस्ट्रेटर',
      shopName: 'स्मार्ट बिलिंग एडमिन मुख्यालय',
      mobile: '9999999999',
      email: 'admin@smartbilling.local',
      address: 'हेडक्वार्टर'
    }
  },
  {
    id: 'seller_demo',
    username: 'user1',
    password: 'User@123',
    role: 'seller',
    status: 'active',
    createdAt: new Date().toISOString(),
    profile: {
      name: 'राजेश कुमार (प्रोपराइटर)',
      shopName: 'श्री गणेश ट्रेडर्स',
      mobile: '9876543210',
      email: 'shreeganesh@example.com',
      address: 'मेन मार्केट, रेलवे स्टेशन के पास, भारत'
    }
  }
];

export function AuthProvider({ children }) {
  // 1. Users List in LocalStorage
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('billing_app_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure default admin always exists
          const hasAdmin = parsed.some(u => u.username.toLowerCase() === 'admin');
          if (!hasAdmin) return [INITIAL_USERS[0], ...parsed];
          return parsed;
        }
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // 2. Current Logged-in Session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('billing_app_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Save users on changes
  useEffect(() => {
    try {
      localStorage.setItem('billing_app_users', JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users to localStorage', e);
    }
  }, [users]);

  // Save session on changes
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('billing_app_session', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('billing_app_session');
      }
    } catch (e) {
      console.error('Error saving session to localStorage', e);
    }
  }, [currentUser]);

  // LOGIN FUNCTION
  const login = (username, password, requiredRole = null) => {
    const cleanUser = (username || '').trim().toLowerCase();
    const foundUser = users.find(
      u => u.username.toLowerCase() === cleanUser || (u.profile?.mobile && u.profile.mobile === cleanUser)
    );

    if (!foundUser) {
      return { success: false, message: 'यूजरनेम या मोबाइल नंबर सही नहीं है।' };
    }

    if (foundUser.password !== password) {
      return { success: false, message: 'गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें।' };
    }

    if (foundUser.status === 'inactive') {
      return { success: false, message: 'यह खाता निष्क्रिय कर दिया गया है। एडमिन से संपर्क करें।' };
    }

    if (requiredRole && foundUser.role !== requiredRole) {
      return { success: false, message: `इस अनुभाग के लिए ${requiredRole === 'admin' ? 'एडमिन' : 'यूजर'} अधिकार आवश्यक हैं।` };
    }

    // Success
    const sessionUser = {
      id: foundUser.id,
      username: foundUser.username,
      role: foundUser.role,
      profile: foundUser.profile || {}
    };

    setCurrentUser(sessionUser);
    return { success: true, user: sessionUser };
  };

  // SIGNUP FUNCTION
  const signup = (signupData) => {
    const cleanUser = (signupData.username || '').trim().toLowerCase();
    const cleanMobile = (signupData.mobile || '').trim();

    // Check existing
    const existing = users.find(
      u => u.username.toLowerCase() === cleanUser || (u.profile?.mobile && u.profile.mobile === cleanMobile)
    );

    if (existing) {
      if (existing.username.toLowerCase() === cleanUser) {
        return { success: false, message: 'यह यूजरनेम पहले से पंजीकृत है। कृपया दूसरा यूजरनेम चुनें।' };
      }
      return { success: false, message: 'यह मोबाइल नंबर पहले से किसी खाते से जुड़ा है।' };
    }

    const newUser = {
      id: `user_${Date.now()}`,
      username: signupData.username.trim(),
      password: signupData.password,
      role: 'seller',
      status: 'active',
      createdAt: new Date().toISOString(),
      profile: {
        name: signupData.ownerName?.trim() || signupData.name?.trim() || 'दुकानदार',
        shopName: signupData.shopName?.trim() || 'मेरी दुकान',
        mobile: cleanMobile,
        email: signupData.email?.trim() || '',
        address: signupData.address?.trim() || ''
      }
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);

    // Auto-login new user
    const sessionUser = {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      profile: newUser.profile
    };
    setCurrentUser(sessionUser);

    return { success: true, user: sessionUser };
  };

  // LOGOUT FUNCTION
  const logout = () => {
    setCurrentUser(null);
  };

  // CHANGE OWN PASSWORD
  const changePassword = (userId, currentPassword, newPassword) => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: 'यूजर खाता नहीं मिला।' };
    }

    if (users[userIndex].password !== currentPassword) {
      return { success: false, message: 'वर्तमान (पुराना) पासवर्ड गलत है।' };
    }

    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' };
    }

    const updatedUsers = [...users];
    updatedUsers[userIndex] = {
      ...updatedUsers[userIndex],
      password: newPassword
    };

    setUsers(updatedUsers);
    return { success: true, message: 'पासवर्ड सफलतापूर्वक बदल दिया गया है!' };
  };

  // ADMIN RESET USER PASSWORD
  const adminResetPassword = (userId, newPassword) => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: 'यूजर खाता नहीं मिला।' };
    }

    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' };
    }

    const updatedUsers = [...users];
    updatedUsers[userIndex] = {
      ...updatedUsers[userIndex],
      password: newPassword
    };

    setUsers(updatedUsers);
    return { success: true, message: 'यूजर का पासवर्ड सफलतापूर्वक रीसेट कर दिया गया!' };
  };

  // FORGOT PASSWORD RECOVERY
  const forgotPasswordReset = (username, mobile, newPassword) => {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanMobile = (mobile || '').trim();

    const userIndex = users.findIndex(
      u => u.username.toLowerCase() === cleanUser && u.profile?.mobile === cleanMobile
    );

    if (userIndex === -1) {
      return { success: false, message: 'दर्ज किए गए यूजरनेम और मोबाइल नंबर से मेल खाता कोई खाता नहीं मिला।' };
    }

    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' };
    }

    const updatedUsers = [...users];
    updatedUsers[userIndex] = {
      ...updatedUsers[userIndex],
      password: newPassword
    };

    setUsers(updatedUsers);
    return { success: true, message: 'पासवर्ड सफलतापूर्वक रीसेट हो गया है! अब आप नए पासवर्ड से लॉगिन कर सकते हैं।' };
  };

  // TOGGLE STATUS
  const toggleUserStatus = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    if (user.role === 'admin') {
      alert('मुख्य एडमिन खाते को निष्क्रिय नहीं किया जा सकता।');
      return;
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const updatedUsers = users.map(u => u.id === userId ? { ...u, status: newStatus } : u);
    setUsers(updatedUsers);
  };

  // DELETE USER
  const deleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    if (user.role === 'admin') {
      alert('मुख्य एडमिन खाते को हटाया नहीं जा सकता।');
      return;
    }

    if (window.confirm(`क्या आप यूजर "${user.username}" को सचमुच हटाना चाहते हैं?`)) {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        login,
        signup,
        logout,
        changePassword,
        adminResetPassword,
        forgotPasswordReset,
        toggleUserStatus,
        deleteUser
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
