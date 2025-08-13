/**
 * Currency utility functions for consistent INR formatting
 */

/**
 * Format amount in Indian Rupees (INR)
 * @param {number} amount - The amount to format
 * @param {object} options - Formatting options
 * @returns {string} - Formatted currency string
 */
export const formatINR = (amount, options = {}) => {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
    locale = 'en-IN'
  } = options;

  if (typeof amount !== 'number' || isNaN(amount)) {
    return showSymbol ? '₹0.00' : '0.00';
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    minimumFractionDigits,
    maximumFractionDigits
  });

  return formatter.format(amount);
};

/**
 * Format amount with custom INR symbol placement
 * @param {number} amount - The amount to format
 * @param {object} options - Formatting options
 * @returns {string} - Formatted currency string with ₹ symbol
 */
export const formatINRCustom = (amount, options = {}) => {
  const {
    decimals = 2,
    prefix = '₹',
    suffix = '',
    thousandsSeparator = ',',
    decimalSeparator = '.'
  } = options;

  if (typeof amount !== 'number' || isNaN(amount)) {
    return `${prefix}0${decimalSeparator}${'0'.repeat(decimals)}${suffix}`;
  }

  // Convert to fixed decimal places
  const fixedAmount = amount.toFixed(decimals);
  const [integerPart, decimalPart] = fixedAmount.split('.');

  // Add thousands separators to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

  // Combine parts
  let result = formattedInteger;
  if (decimals > 0 && decimalPart) {
    result += decimalSeparator + decimalPart;
  }

  return `${prefix}${result}${suffix}`;
};

/**
 * Format amount in Indian numbering system (Lakhs and Crores)
 * @param {number} amount - The amount to format
 * @param {object} options - Formatting options
 * @returns {string} - Formatted currency string in Indian format
 */
export const formatINRIndian = (amount, options = {}) => {
  const {
    showSymbol = true,
    showUnits = true,
    decimals = 2
  } = options;

  if (typeof amount !== 'number' || isNaN(amount)) {
    return showSymbol ? '₹0.00' : '0.00';
  }

  const symbol = showSymbol ? '₹' : '';
  
  if (amount >= 10000000) { // 1 Crore
    const crores = amount / 10000000;
    const formatted = crores.toFixed(decimals);
    return `${symbol}${formatted}${showUnits ? ' Cr' : ''}`;
  } else if (amount >= 100000) { // 1 Lakh
    const lakhs = amount / 100000;
    const formatted = lakhs.toFixed(decimals);
    return `${symbol}${formatted}${showUnits ? ' L' : ''}`;
  } else if (amount >= 1000) { // 1 Thousand
    const thousands = amount / 1000;
    const formatted = thousands.toFixed(decimals);
    return `${symbol}${formatted}${showUnits ? ' K' : ''}`;
  } else {
    return `${symbol}${amount.toFixed(decimals)}`;
  }
};

/**
 * Parse INR string back to number
 * @param {string} currencyString - The currency string to parse
 * @returns {number} - Parsed amount
 */
export const parseINR = (currencyString) => {
  if (typeof currencyString !== 'string') {
    return 0;
  }

  // Remove currency symbols and spaces
  const cleanString = currencyString
    .replace(/₹/g, '')
    .replace(/[,\s]/g, '')
    .trim();

  const amount = parseFloat(cleanString);
  return isNaN(amount) ? 0 : amount;
};

/**
 * Convert amount to words in Indian format
 * @param {number} amount - The amount to convert
 * @returns {string} - Amount in words
 */
export const amountToWords = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Zero Rupees Only';
  }

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertHundreds = (num) => {
    let result = '';
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    } else if (num >= 10) {
      result += teens[num - 10] + ' ';
      return result;
    }
    if (num > 0) {
      result += ones[num] + ' ';
    }
    return result;
  };

  let integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  if (integerPart === 0) {
    return 'Zero Rupees Only';
  }

  let words = '';

  // Crores
  if (integerPart >= 10000000) {
    words += convertHundreds(Math.floor(integerPart / 10000000)) + 'Crore ';
    integerPart %= 10000000;
  }

  // Lakhs
  if (integerPart >= 100000) {
    words += convertHundreds(Math.floor(integerPart / 100000)) + 'Lakh ';
    integerPart %= 100000;
  }

  // Thousands
  if (integerPart >= 1000) {
    words += convertHundreds(Math.floor(integerPart / 1000)) + 'Thousand ';
    integerPart %= 1000;
  }

  // Hundreds
  if (integerPart > 0) {
    words += convertHundreds(integerPart);
  }

  words += 'Rupees';

  if (decimalPart > 0) {
    words += ' and ' + convertHundreds(decimalPart) + 'Paise';
  }

  words += ' Only';

  return words.trim();
};

/**
 * Default export with all formatting functions
 */
export default {
  formatINR,
  formatINRCustom,
  formatINRIndian,
  parseINR,
  amountToWords
};
