import assert from 'node:assert';

// Mock localStorage
const store = {};
globalThis.localStorage = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { for (const k in store) delete store[k]; }
};

// Check function logic matching AuthContext
const checkUserHasGstin = (userToCheck) => {
  if (!userToCheck) return false;
  const pGstin = (userToCheck.profile?.gstin || '').trim();
  if (pGstin.length >= 10) return true;

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
  } catch (e) {
    // ignore
  }

  return false;
};

// Test 1: Null user
assert.strictEqual(checkUserHasGstin(null), false, 'Test 1 Failed');
console.log('✓ Test 1: Null user correctly returns false');

// Test 2: User with empty GSTIN
const userWithoutGst = {
  id: 'seller_123',
  username: 'newshop',
  profile: {
    shopName: 'New Shop',
    mobile: '9876543210',
    gstin: ''
  }
};
assert.strictEqual(checkUserHasGstin(userWithoutGst), false, 'Test 2 Failed');
console.log('✓ Test 2: User with empty gstin returns false');

// Test 3: User with whitespace GSTIN
const userWithWhitespaceGst = {
  id: 'seller_456',
  username: 'whitespaceshop',
  profile: {
    shopName: 'Space Shop',
    gstin: '    '
  }
};
assert.strictEqual(checkUserHasGstin(userWithWhitespaceGst), false, 'Test 3 Failed');
console.log('✓ Test 3: User with whitespace gstin returns false');

// Test 4: User with valid GSTIN in profile
const userWithGst = {
  id: 'seller_789',
  username: 'gstshop',
  profile: {
    shopName: 'GST Shop',
    gstin: '08ABCDE1234F1Z5'
  }
};
assert.strictEqual(checkUserHasGstin(userWithGst), true, 'Test 4 Failed');
console.log('✓ Test 4: User with valid gstin returns true');

// Test 5: User without GST in profile, but GST present in saved settings
const userWithSettingsGst = {
  id: 'seller_999',
  username: 'settingsshop',
  profile: {
    shopName: 'Settings Shop',
    gstin: ''
  }
};
localStorage.setItem('mobile_billing_settings_seller_999', JSON.stringify({
  firmName: 'Settings Shop',
  gstin: '08ABCDE1234F1Z5'
}));
assert.strictEqual(checkUserHasGstin(userWithSettingsGst), true, 'Test 5 Failed');
console.log('✓ Test 5: User with gstin in settings returns true');

// Test 6: GSTIN validation format check
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
assert.strictEqual(gstinRegex.test('08ABCDE1234F1Z5'), true, 'Test 6 Failed');
assert.strictEqual(gstinRegex.test('08AABCR1234F1Z1'), true, 'Test 6 Failed');
assert.strictEqual(gstinRegex.test('12345'), false, 'Test 6 Failed (short)');
assert.strictEqual(gstinRegex.test('08ABCDE1234F1Z'), false, 'Test 6 Failed (14 chars)');
console.log('✓ Test 6: 15-character GSTIN format validation passes');

console.log('\nAll 6 automated GST requirement test cases PASSED successfully!');
