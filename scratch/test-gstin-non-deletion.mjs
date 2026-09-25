// Test GSTIN Non-Deletion and Change Protection
import assert from 'node:assert';

// 1. Validation Logic
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

function validateAndSaveGstin(hadExistingGstin, inputGstin, existingGstin) {
  const clean = String(inputGstin || '').trim().toUpperCase().replace(/[^0-9A-Z]/g, '');

  if (hadExistingGstin) {
    if (!clean) {
      return {
        success: false,
        error: 'सुरक्षा नियम: GST नंबर हटाया नहीं जा सकता! आप GST नंबर बदल सकते हैं, लेकिन खाली नहीं छोड़ सकते।'
      };
    }
  }

  if (clean) {
    if (clean.length !== 15) {
      return {
        success: false,
        error: `GSTIN नंबर ठीक 15 अक्षरों का होना चाहिए! (वर्तमान में: ${clean.length} अक्षर)`
      };
    }
    if (!gstinRegex.test(clean)) {
      return {
        success: false,
        error: 'मानक 15-अक्षरों का वैध GSTIN फॉर्मेट दर्ज करें।'
      };
    }
  }

  return {
    success: true,
    gstin: clean || existingGstin
  };
}

// 2. BillingContext updateSettings Logic
function updateSettings(prevSettings, newSettings, effectiveSeller) {
  let gstin = newSettings.gstin !== undefined ? newSettings.gstin : prevSettings.gstin;
  const hadGstin = Boolean(
    (prevSettings.gstin && String(prevSettings.gstin).trim().length >= 10) ||
    (effectiveSeller?.profile?.gstin && String(effectiveSeller.profile.gstin).trim().length >= 10)
  );

  if (hadGstin && (!gstin || !String(gstin).trim())) {
    gstin = prevSettings.gstin || effectiveSeller?.profile?.gstin;
  }

  return {
    ...prevSettings,
    ...newSettings,
    gstin
  };
}

// 3. BillingContext resetSettings Logic
function resetSettings(prevSettings, effectiveSeller, initialSettings) {
  return {
    ...initialSettings,
    gstin: prevSettings.gstin || effectiveSeller?.profile?.gstin || initialSettings.gstin,
    firmName: prevSettings.firmName || effectiveSeller?.profile?.shopName || initialSettings.firmName,
  };
}

// Run Tests
const initialGst = '08ABCDE1234F1Z5';

// Test 1: User with existing GSTIN tries to wipe/delete it -> MUST FAIL
const t1 = validateAndSaveGstin(true, '', initialGst);
assert.strictEqual(t1.success, false, 'Test 1 Failed: Must reject empty GSTIN');
assert.ok(t1.error.includes('हटाया नहीं जा सकता'), 'Test 1 Failed: Error message mismatch');
console.log('✓ Test 1 Passed: Emptying/deleting GSTIN is strictly prevented');

// Test 2: User tries to save whitespace only -> MUST FAIL
const t2 = validateAndSaveGstin(true, '   ', initialGst);
assert.strictEqual(t2.success, false, 'Test 2 Failed: Must reject whitespace GSTIN');
console.log('✓ Test 2 Passed: Whitespace-only GSTIN is rejected');

// Test 3: User changes GSTIN to another valid 15-char GSTIN -> MUST SUCCEED
const newValidGst = '08BAPRS9988D1Z9';
const t3 = validateAndSaveGstin(true, newValidGst, initialGst);
assert.strictEqual(t3.success, true, 'Test 3 Failed: Valid change must succeed');
assert.strictEqual(t3.gstin, newValidGst, 'Test 3 Failed: GSTIN must be updated');
console.log('✓ Test 3 Passed: User can successfully CHANGE to a new valid GSTIN');

// Test 4: User tries to change to an invalid length/format GSTIN -> MUST FAIL
const t4 = validateAndSaveGstin(true, '12345', initialGst);
assert.strictEqual(t4.success, false, 'Test 4 Failed: Invalid format must be rejected');
console.log('✓ Test 4 Passed: Invalid GSTIN change is rejected');

// Test 5: updateSettings called with empty gstin retains previous GSTIN
const prev = { firmName: 'श्री गणेश', gstin: initialGst };
const updated = updateSettings(prev, { firmName: 'श्री गणेश न्यू', gstin: '' }, null);
assert.strictEqual(updated.gstin, initialGst, 'Test 5 Failed: Empty gstin in updateSettings must retain previous GSTIN');
assert.strictEqual(updated.firmName, 'श्री गणेश न्यू', 'Test 5 Failed: Other fields must update normally');
console.log('✓ Test 5 Passed: updateSettings maintains existing GSTIN against accidental clearing');

// Test 6: resetSettings retains existing user GSTIN
const initial = { firmName: 'दुकान', gstin: '08AAAAA0000A1Z5' };
const reset = resetSettings(prev, null, initial);
assert.strictEqual(reset.gstin, initialGst, 'Test 6 Failed: resetSettings must retain user GSTIN');
console.log('✓ Test 6 Passed: resetSettings retains user GSTIN');

console.log('\nAll 6 GSTIN non-deletion tests passed successfully!');
