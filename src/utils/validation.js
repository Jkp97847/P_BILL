/**
 * Comprehensive Validation & Input Formatting Utility for Indian Financial & Identity Formats
 * Supports: GSTIN, PAN, Mobile, Email, IFSC, UPI ID, Bank Account Number
 */

// Indian State Codes for GSTIN
export const GST_STATE_CODES = {
  '01': 'जम्मू एवं कश्मीर (Jammu & Kashmir)',
  '02': 'हिमाचल प्रदेश (Himachal Pradesh)',
  '03': 'पंजाब (Punjab)',
  '04': 'चंडीगढ़ (Chandigarh)',
  '05': 'उत्तराखंड (Uttarakhand)',
  '06': 'हरियाणा (Haryana)',
  '07': 'दिल्ली (Delhi)',
  '08': 'राजस्थान (Rajasthan)',
  '09': 'उत्तर प्रदेश (Uttar Pradesh)',
  '10': 'बिहार (Bihar)',
  '11': 'सिक्किम (Sikkim)',
  '12': 'अरुणाचल प्रदेश (Arunachal Pradesh)',
  '13': 'नागालैंड (Nagaland)',
  '14': 'मणिपुर (Manipur)',
  '15': 'मिजोरम (Mizoram)',
  '16': 'त्रिपुरा (Tripura)',
  '17': 'मेघालय (Meghalaya)',
  '18': 'असम (Assam)',
  '19': 'पश्चिम बंगाल (West Bengal)',
  '20': 'झारखंड (Jharkhand)',
  '21': 'ओडिशा (Odisha)',
  '22': 'छत्तीसगढ़ (Chhattisgarh)',
  '23': 'मध्य प्रदेश (Madhya Pradesh)',
  '24': 'गुजरात (Gujarat)',
  '26': 'दादरा एवं नगर हवेली और दमन एवं दीव',
  '27': 'महाराष्ट्र (Maharashtra)',
  '29': 'कर्नाटक (Karnataka)',
  '30': 'गोवा (Goa)',
  '31': 'लक्षद्वीप (Lakshadweep)',
  '32': 'केरल (Kerala)',
  '33': 'तमिलनाडु (Tamil Nadu)',
  '34': 'पुडुचेरी (Puducherry)',
  '35': 'अंडमान एवं निकोबार द्वीप समूह',
  '36': 'तेलंगाना (Telangana)',
  '37': 'आंध्र प्रदेश (Andhra Pradesh)',
  '38': 'लद्दाख (Ladakh)',
  '97': 'अन्य क्षेत्र (Other Territory)',
  '99': 'केंद्र शासित विशेष (Centre Jurisdiction)'
};

// ----------------------------------------------------------------------------
// 1. PAN NUMBER (Permanent Account Number)
// Structure: 5 letters + 4 digits + 1 letter (Total: 10 chars)
// Example: ABCDE1234F
// ----------------------------------------------------------------------------
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

/**
 * Real-time character-by-character input formatter for PAN:
 * Prevents user from entering digits in letter positions and vice-versa.
 * Position 0-4: A-Z only
 * Position 5-8: 0-9 only
 * Position 9: A-Z only (Prevents digits in last position as specifically requested!)
 */
export function formatPanInput(raw) {
  if (!raw) return '';
  const clean = String(raw).toUpperCase().replace(/[^0-9A-Z]/g, '');
  let result = '';

  for (let i = 0; i < clean.length && result.length < 10; i++) {
    const char = clean[i];
    const pos = result.length;

    if (pos >= 0 && pos <= 4) {
      // First 5 characters must be letters (A-Z)
      if (/[A-Z]/.test(char)) {
        result += char;
      }
    } else if (pos >= 5 && pos <= 8) {
      // Next 4 characters must be digits (0-9)
      if (/[0-9]/.test(char)) {
        result += char;
      }
    } else if (pos === 9) {
      // 10th character MUST be letter (A-Z), NEVER digit
      if (/[A-Z]/.test(char)) {
        result += char;
      }
    }
  }

  return result;
}

export function validatePan(pan, isRequired = false) {
  const clean = String(pan || '').trim().toUpperCase();
  if (!clean) {
    if (isRequired) {
      return { isValid: false, error: 'PAN नंबर दर्ज करना आवश्यक है।' };
    }
    return { isValid: true, error: null };
  }

  if (clean.length !== 10) {
    return { isValid: false, error: `PAN नंबर ठीक 10 अक्षरों का होना चाहिए! (वर्तमान में: ${clean.length} अक्षर)` };
  }

  if (!PAN_REGEX.test(clean)) {
    return {
      isValid: false,
      error: 'PAN प्रारूप अमान्य है! मानक 10-अक्षरों का फॉर्मेट (पहले 5 अक्षर A-Z, फिर 4 अंक 0-9, और अंतिम 1 अक्षर A-Z, उदा. ABCDE1234F) होना चाहिए।'
    };
  }

  return { isValid: true, error: null, pan: clean };
}

// ----------------------------------------------------------------------------
// 2. GSTIN NUMBER (Goods and Services Tax Identification Number)
// Structure: 2 digits (State) + 10 chars (PAN) + 1 char (Entity) + 'Z' + 1 checksum
// Example: 08ABCDE1234F1Z5 (Total: 15 chars)
// ----------------------------------------------------------------------------
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/**
 * Real-time character-by-character input formatter for GSTIN:
 * Pos 0-1: 0-9 (State code)
 * Pos 2-6: A-Z (PAN letters)
 * Pos 7-10: 0-9 (PAN digits)
 * Pos 11: A-Z (PAN letter)
 * Pos 12: 1-9 or A-Z (Entity)
 * Pos 13: Z
 * Pos 14: 0-9 or A-Z (Checksum)
 */
export function formatGstinInput(raw) {
  if (!raw) return '';
  const clean = String(raw).toUpperCase().replace(/[^0-9A-Z]/g, '');
  let result = '';

  for (let i = 0; i < clean.length && result.length < 15; i++) {
    const char = clean[i];
    const pos = result.length;

    if (pos >= 0 && pos <= 1) {
      // 0-1: State Code (Digits)
      if (/[0-9]/.test(char)) {
        result += char;
      }
    } else if (pos >= 2 && pos <= 6) {
      // 2-6: PAN 5 Letters
      if (/[A-Z]/.test(char)) {
        result += char;
      }
    } else if (pos >= 7 && pos <= 10) {
      // 7-10: PAN 4 Digits
      if (/[0-9]/.test(char)) {
        result += char;
      }
    } else if (pos === 11) {
      // 11: PAN 10th Letter (Must be letter)
      if (/[A-Z]/.test(char)) {
        result += char;
      }
    } else if (pos === 12) {
      // 12: Entity Number
      if (/[0-9A-Z]/.test(char)) {
        result += char;
      }
    } else if (pos === 13) {
      // 13: Must be 'Z'
      if (char === 'Z' || /[0-9A-Z]/.test(char)) {
        result += 'Z';
      }
    } else if (pos === 14) {
      // 14: Checksum
      if (/[0-9A-Z]/.test(char)) {
        result += char;
      }
    }
  }

  return result;
}

export function validateGstin(gstin, isRequired = false) {
  const clean = String(gstin || '').trim().toUpperCase();
  if (!clean) {
    if (isRequired) {
      return { isValid: false, error: 'GSTIN नंबर दर्ज करना अनिवार्य है।' };
    }
    return { isValid: true, error: null };
  }

  if (clean.length !== 15) {
    return { isValid: false, error: `GSTIN ठीक 15 अक्षरों का होना चाहिए! (वर्तमान में: ${clean.length} अक्षर)` };
  }

  const stateCode = clean.slice(0, 2);
  if (!GST_STATE_CODES[stateCode]) {
    return { isValid: false, error: `अमान्य राज्य कोड "${stateCode}"! कृपया 01 से 38 के बीच मान्य राज्य कोड दर्ज करें।` };
  }

  if (!GSTIN_REGEX.test(clean)) {
    return {
      isValid: false,
      error: 'GSTIN प्रारूप अमान्य है! मानक 15-अक्षरों का फॉर्मेट (उदा. 08ABCDE1234F1Z5) दर्ज करें।'
    };
  }

  const derivedPan = clean.slice(2, 12);
  const stateName = GST_STATE_CODES[stateCode] || 'अज्ञात राज्य';

  return { 
    isValid: true, 
    error: null, 
    gstin: clean, 
    stateCode, 
    stateName, 
    derivedPan 
  };
}

// ----------------------------------------------------------------------------
// 3. MOBILE NUMBER (10 Digits, starting with 6, 7, 8, 9)
// Example: 9829012345
// ----------------------------------------------------------------------------
export const MOBILE_REGEX = /^[6-9][0-9]{9}$/;

export function formatMobileInput(raw) {
  if (!raw) return '';
  return String(raw).replace(/\D/g, '').slice(0, 10);
}

export function validateMobile(mobile, isRequired = false, fieldLabel = 'मोबाइल नंबर') {
  const clean = String(mobile || '').replace(/\D/g, '');
  if (!clean) {
    if (isRequired) {
      return { isValid: false, error: `${fieldLabel} दर्ज करना अनिवार्य है।` };
    }
    return { isValid: true, error: null };
  }

  if (clean.length !== 10) {
    return { isValid: false, error: `${fieldLabel} ठीक 10 अंकों का होना चाहिए! (वर्तमान: ${clean.length} अंक)` };
  }

  if (!MOBILE_REGEX.test(clean)) {
    return { isValid: false, error: `${fieldLabel} अमान्य है! यह 6, 7, 8 या 9 से शुरू होना चाहिए।` };
  }

  return { isValid: true, error: null, mobile: clean };
}

// ----------------------------------------------------------------------------
// 4. EMAIL ADDRESS (RFC 5322 Standard)
// Example: shopname@example.com
// ----------------------------------------------------------------------------
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function formatEmailInput(raw) {
  if (!raw) return '';
  return String(raw).replace(/\s+/g, '');
}

export function validateEmail(email, isRequired = false) {
  const clean = String(email || '').trim();
  if (!clean) {
    if (isRequired) {
      return { isValid: false, error: 'ईमेल पता दर्ज करना आवश्यक है।' };
    }
    return { isValid: true, error: null };
  }

  if (!clean.includes('@')) {
    return { isValid: false, error: 'ईमेल पते में "@" चिह्न होना अनिवार्य है (उदा. name@example.com)।' };
  }

  if (!EMAIL_REGEX.test(clean)) {
    return { isValid: false, error: 'अमान्य ईमेल प्रारूप! कृपया सही ईमेल दर्ज करें (उदा. info@shreeganesh.com)।' };
  }

  return { isValid: true, error: null, email: clean };
}

// ----------------------------------------------------------------------------
// 5. BANK IFSC CODE (Indian Financial System Code)
// Structure: 4 letters (Bank) + '0' + 6 alphanumeric (Branch) (Total: 11 chars)
// Example: SBIN0001234, HDFC0000123
// ----------------------------------------------------------------------------
export const IFSC_REGEX = /^[A-Z]{4}0[0-9A-Z]{6}$/;

export function formatIfscInput(raw) {
  if (!raw) return '';
  const clean = String(raw).toUpperCase().replace(/[^0-9A-Z]/g, '');
  let result = '';

  for (let i = 0; i < clean.length && result.length < 11; i++) {
    const char = clean[i];
    const pos = result.length;

    if (pos >= 0 && pos <= 3) {
      // 0-3: 4 Letters (Bank Code)
      if (/[A-Z]/.test(char)) {
        result += char;
      }
    } else if (pos === 4) {
      // 4: 5th character MUST be '0'
      if (char === '0' || /[0-9A-Z]/.test(char)) {
        result += '0';
      }
    } else if (pos >= 5 && pos <= 10) {
      // 5-10: 6 alphanumeric
      if (/[0-9A-Z]/.test(char)) {
        result += char;
      }
    }
  }

  return result;
}

export function validateIfsc(ifsc, isRequired = false) {
  const clean = String(ifsc || '').trim().toUpperCase();
  if (!clean) {
    if (isRequired) {
      return { isValid: false, error: 'बैंक IFSC कोड दर्ज करना आवश्यक है।' };
    }
    return { isValid: true, error: null };
  }

  if (clean.length !== 11) {
    return { isValid: false, error: `IFSC कोड ठीक 11 अक्षरों का होना चाहिए! (वर्तमान: ${clean.length} अक्षर)` };
  }

  if (clean[4] !== '0') {
    return { isValid: false, error: 'IFSC कोड का 5वां अक्षर हमेशा शून्य "0" होना चाहिए (उदा. SBIN0001234)।' };
  }

  if (!IFSC_REGEX.test(clean)) {
    return {
      isValid: false,
      error: 'IFSC कोड अमान्य है! मानक 11-अक्षरों का फॉर्मेट (पहले 4 अक्षर बैंक कोड, 5वां 0 और अंतिम 6 शाखा कोड) होना चाहिए।'
    };
  }

  return { isValid: true, error: null, ifsc: clean };
}

// ----------------------------------------------------------------------------
// 6. UPI ID / VPA (Virtual Payment Address)
// Format: username@handle (e.g. 9829012345@paytm, shop@okhdfcbank, merchant@upi)
// ----------------------------------------------------------------------------
export const UPI_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;

export function formatUpiInput(raw) {
  if (!raw) return '';
  const clean = String(raw).replace(/\s+/g, '');
  let result = '';
  let hasAt = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (char === '@') {
      if (!hasAt && result.length > 0) {
        result += '@';
        hasAt = true;
      }
    } else if (/[a-zA-Z0-9._-]/.test(char)) {
      result += char;
    }
  }

  return result;
}

export function validateUpi(upi, isRequired = false) {
  const clean = String(upi || '').trim();
  if (!clean) {
    if (isRequired) {
      return { isValid: false, error: 'UPI ID दर्ज करना आवश्यक है।' };
    }
    return { isValid: true, error: null };
  }

  if (!clean.includes('@')) {
    return { isValid: false, error: 'UPI ID में "@" और बैंक हैंडल होना अनिवार्य है (उदा. 9829012345@paytm या shop@upi)।' };
  }

  const parts = clean.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { isValid: false, error: 'अमान्य UPI ID! सही प्रारूप दर्ज करें (उदा. mobile@paytm या name@okhdfcbank)।' };
  }

  if (!UPI_REGEX.test(clean)) {
    return { isValid: false, error: 'UPI ID में केवल अक्षर, अंक, बिंदु, हाइफन या अंडरस्कोर मान्य हैं।' };
  }

  return { isValid: true, error: null, upi: clean };
}

// ----------------------------------------------------------------------------
// 7. BANK ACCOUNT NUMBER (9 to 18 digits)
// ----------------------------------------------------------------------------
export function formatAccountNoInput(raw) {
  if (!raw) return '';
  return String(raw).replace(/\D/g, '').slice(0, 18);
}

export function validateAccountNo(acc, isRequired = false) {
  const clean = String(acc || '').replace(/\D/g, '');
  if (!clean) {
    if (isRequired) {
      return { isValid: false, error: 'बैंक खाता संख्या दर्ज करना आवश्यक है।' };
    }
    return { isValid: true, error: null };
  }

  if (clean.length < 9 || clean.length > 18) {
    return { isValid: false, error: `बैंक खाता संख्या 9 से 18 अंकों के बीच होनी चाहिए! (वर्तमान: ${clean.length} अंक)` };
  }

  return { isValid: true, error: null, accountNo: clean };
}
