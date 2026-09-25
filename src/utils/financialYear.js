/**
 * Utility functions for Indian Financial Year (April 1 to March 31)
 * Used across Smart GST Billing and Non-GST Retail Billing for yearly reports and filters.
 */

// Parse any common Indian/ISO date format to { year, month, day, iso: 'YYYY-MM-DD' }
export function parseDate(dateStr) {
  if (!dateStr) return null;
  const str = String(dateStr).trim();

  // YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(str)) {
    const parts = str.split('T')[0].split(/[-/]/).map(Number);
    const y = parts[0];
    const m = parts[1];
    const d = parts[2];
    if (y && m && d) {
      return { 
        year: y, 
        month: m, 
        day: d, 
        iso: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` 
      };
    }
  }

  // DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(str)) {
    const parts = str.split(/[-/]/).map(Number);
    const d = parts[0];
    const m = parts[1];
    const y = parts[2];
    if (y && m && d) {
      return { 
        year: y, 
        month: m, 
        day: d, 
        iso: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` 
      };
    }
  }

  // Fallback to Date object parsing
  const dt = new Date(str);
  if (!isNaN(dt.getTime())) {
    const y = dt.getFullYear();
    const m = dt.getMonth() + 1;
    const d = dt.getDate();
    return { 
      year: y, 
      month: m, 
      day: d, 
      iso: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` 
    };
  }

  return null;
}

// Get the financial year object for a given date
export function getFinancialYearFromDate(dateStr) {
  const p = parseDate(dateStr);
  if (!p) return null;

  // In India: April (4) to March (3) of next year
  const startYear = p.month >= 4 ? p.year : p.year - 1;
  const endYear = startYear + 1;
  const shortEnd = String(endYear).slice(-2);

  return {
    startYear,
    endYear,
    key: String(startYear),
    shortKey: `${startYear}-${shortEnd}`,
    label: `FY ${startYear}-${shortEnd} (1 Apr ${startYear} - 31 Mar ${endYear})`,
    hindiLabel: `वित्तीय वर्ष ${startYear}-${shortEnd} (01/04/${startYear} से 31/03/${endYear})`,
    startDate: `${startYear}-04-01`,
    endDate: `${endYear}-03-31`
  };
}

// Get current active Financial Year
export function getCurrentFinancialYear() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const startYear = m >= 4 ? y : y - 1;
  const endYear = startYear + 1;
  const shortEnd = String(endYear).slice(-2);

  return {
    startYear,
    endYear,
    key: String(startYear),
    shortKey: `${startYear}-${shortEnd}`,
    label: `FY ${startYear}-${shortEnd} (1 Apr ${startYear} - 31 Mar ${endYear})`,
    hindiLabel: `वित्तीय वर्ष ${startYear}-${shortEnd} (01/04/${startYear} से 31/03/${endYear})`,
    startDate: `${startYear}-04-01`,
    endDate: `${endYear}-03-31`
  };
}

// Check if a date falls within a specified financial year startYear
export function isDateInFinancialYear(dateStr, fyStartYear) {
  if (!fyStartYear || fyStartYear === 'ALL') return true;
  const p = parseDate(dateStr);
  if (!p) return false;

  const startY = Number(fyStartYear);
  const startDate = `${startY}-04-01`;
  const endDate = `${startY + 1}-03-31`;

  return p.iso >= startDate && p.iso <= endDate;
}

// Generate the list of available financial years based on data + standard range
export function getAvailableFinancialYears(datesList = []) {
  const yearsSet = new Set();

  const currentFY = getCurrentFinancialYear();
  const currentStartYear = currentFY.startYear;

  // Add next year, current year, and past 4 years
  for (let y = currentStartYear + 1; y >= currentStartYear - 4; y--) {
    yearsSet.add(y);
  }

  // Also include any years from actual dates passed in
  datesList.forEach(d => {
    if (d) {
      const fy = getFinancialYearFromDate(d);
      if (fy) {
        yearsSet.add(fy.startYear);
      }
    }
  });

  const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);

  return sortedYears.map(startY => {
    const endY = startY + 1;
    const shortEnd = String(endY).slice(-2);
    return {
      startYear: startY,
      endYear: endY,
      key: String(startY),
      shortKey: `${startY}-${shortEnd}`,
      label: `FY ${startY}-${shortEnd} (1 Apr ${startY} - 31 Mar ${endY})`,
      hindiLabel: `वित्तीय वर्ष ${startY}-${shortEnd} (01/04/${startY} से 31/03/${endY})`,
      displayTitle: `वित्तीय वर्ष ${startY}-${shortEnd} (1 अप्रैल ${startY} से 31 मार्च ${endY})`,
      startDate: `${startY}-04-01`,
      endDate: `${endY}-03-31`
    };
  });
}
