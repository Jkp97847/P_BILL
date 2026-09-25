import assert from 'node:assert';
import { 
  parseDate, 
  getFinancialYearFromDate, 
  getCurrentFinancialYear, 
  isDateInFinancialYear, 
  getAvailableFinancialYears 
} from '../src/utils/financialYear.js';

// Test 1: Date parsing
const d1 = parseDate('2026-09-24');
assert.strictEqual(d1.year, 2026);
assert.strictEqual(d1.month, 9);
assert.strictEqual(d1.day, 24);
assert.strictEqual(d1.iso, '2026-09-24');

// Test 2: April date belongs to same year start
const fyApril = getFinancialYearFromDate('2026-04-01');
assert.strictEqual(fyApril.startYear, 2026);
assert.strictEqual(fyApril.endYear, 2027);
assert.strictEqual(fyApril.shortKey, '2026-27');

// Test 3: March date belongs to previous year start
const fyMarch = getFinancialYearFromDate('2026-03-31');
assert.strictEqual(fyMarch.startYear, 2025);
assert.strictEqual(fyMarch.endYear, 2026);
assert.strictEqual(fyMarch.shortKey, '2025-26');

// Test 4: January date belongs to previous year start
const fyJan = getFinancialYearFromDate('2026-01-15');
assert.strictEqual(fyJan.startYear, 2025);
assert.strictEqual(fyJan.endYear, 2026);
assert.strictEqual(fyJan.shortKey, '2025-26');

// Test 5: isDateInFinancialYear
assert.strictEqual(isDateInFinancialYear('2025-04-01', 2025), true);
assert.strictEqual(isDateInFinancialYear('2026-03-31', 2025), true);
assert.strictEqual(isDateInFinancialYear('2026-04-01', 2025), false);
assert.strictEqual(isDateInFinancialYear('2025-03-31', 2025), false);

// Test 6: Available years list
const list = getAvailableFinancialYears(['2022-05-10', '2026-09-24']);
assert(list.length >= 5);
assert(list.some(f => f.startYear === 2026));
assert(list.some(f => f.startYear === 2025));
assert(list.some(f => f.startYear === 2022));

console.log('All Financial Year unit tests PASSED successfully!');
