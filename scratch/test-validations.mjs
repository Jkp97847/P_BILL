// Unit tests for Indian format validations and typing restrictions
import assert from 'node:assert';
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
} from '../src/utils/validation.js';

console.log('--- Testing PAN Formatter & Validator ---');
// User requirement: "jese pan no ka last digit letters hota h to wo digit n interkar paye"
// Test 1: User types digits in first 5 characters -> must reject digits
assert.strictEqual(formatPanInput('123AB'), 'AB');
// Test 2: User types letters in 6-9 -> must reject letters
assert.strictEqual(formatPanInput('ABCDE12AB'), 'ABCDE12');
// Test 3: User tries to enter a digit at the 10th position -> MUST NOT ALLOW DIGIT!
assert.strictEqual(formatPanInput('ABCDE12345'), 'ABCDE1234');
// Test 4: User enters letter at 10th position -> ALLOWS!
assert.strictEqual(formatPanInput('ABCDE1234F'), 'ABCDE1234F');
// Test 5: PAN Validation
assert.strictEqual(validatePan('ABCDE1234F').isValid, true);
assert.strictEqual(validatePan('ABCDE12345').isValid, false);
assert.strictEqual(validatePan('12345ABCDE').isValid, false);
console.log('✓ PAN input restriction & validation passed');

console.log('--- Testing GSTIN Formatter & Validator ---');
// Test 6: GSTIN input typing
assert.strictEqual(formatGstinInput('AA08'), '08'); // State code must be digits
assert.strictEqual(formatGstinInput('08ABCDE1234F1Z5'), '08ABCDE1234F1Z5');
assert.strictEqual(validateGstin('08ABCDE1234F1Z5').isValid, true);
assert.strictEqual(validateGstin('08ABCDE1234F1Z5').stateName.includes('राजस्थान'), true);
assert.strictEqual(validateGstin('00ABCDE1234F1Z5').isValid, false); // Unknown state
assert.strictEqual(validateGstin('08ABCDE1234F1A5').isValid, false); // 14th char not Z
console.log('✓ GSTIN input restriction & validation passed');

console.log('--- Testing Mobile Formatter & Validator ---');
// Test 7: Mobile input typing
assert.strictEqual(formatMobileInput('9829012345abc'), '9829012345');
assert.strictEqual(validateMobile('9829012345').isValid, true);
assert.strictEqual(validateMobile('1234567890').isValid, false); // Doesn't start with 6-9
assert.strictEqual(validateMobile('98290').isValid, false); // Not 10 digits
console.log('✓ Mobile validation passed');

console.log('--- Testing Email Formatter & Validator ---');
// Test 8: Email
assert.strictEqual(formatEmailInput(' shop @ domain . com '), 'shop@domain.com');
assert.strictEqual(validateEmail('shop@example.com').isValid, true);
assert.strictEqual(validateEmail('shopexample.com').isValid, false);
assert.strictEqual(validateEmail('shop@com').isValid, false);
console.log('✓ Email validation passed');

console.log('--- Testing IFSC Formatter & Validator ---');
// Test 9: IFSC: 4 letters + 0 + 6 alphanumeric
assert.strictEqual(formatIfscInput('12SBIN'), 'SBIN');
assert.strictEqual(formatIfscInput('SBIN1001234'), 'SBIN0001234'); // 5th char forced to 0
assert.strictEqual(validateIfsc('SBIN0001234').isValid, true);
assert.strictEqual(validateIfsc('SBIN1001234').isValid, false);
console.log('✓ IFSC validation passed');

console.log('--- Testing UPI Formatter & Validator ---');
// Test 10: UPI
assert.strictEqual(formatUpiInput(' 98290 12345 @ paytm '), '9829012345@paytm');
assert.strictEqual(validateUpi('9829012345@paytm').isValid, true);
assert.strictEqual(validateUpi('shop.hub@okhdfcbank').isValid, true);
assert.strictEqual(validateUpi('noatsign').isValid, false);
console.log('✓ UPI validation passed');

console.log('--- Testing Bank Account Formatter & Validator ---');
// Test 11: Account No
assert.strictEqual(formatAccountNoInput('1234-5678-9012'), '123456789012');
assert.strictEqual(validateAccountNo('123456789012').isValid, true);
assert.strictEqual(validateAccountNo('1234').isValid, false); // Too short
console.log('✓ Bank Account validation passed');

console.log('\nAll validation & typing restriction tests passed 100%!');
