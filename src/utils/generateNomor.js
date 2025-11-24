// src/utils/generateNomor.js

/**
 * Generate Nomor Agenda
 * Format: PREFIX-YYYYMM-XXXX
 * Example: SM-202411-0001 (Surat Masuk)
 *          SK-202411-0001 (Surat Keluar)
 */
const generateNomorAgenda = (prefix = 'SM', lastNumber = 0) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const number = String(lastNumber + 1).padStart(4, '0');
  
  return `${prefix}-${year}${month}-${number}`;
};

/**
 * Get last number from nomor agenda
 */
const extractNumber = (nomorAgenda) => {
  if (!nomorAgenda) return 0;
  const parts = nomorAgenda.split('-');
  return parseInt(parts[2]) || 0;
};

/**
 * Check if nomor agenda is from current month
 */
const isCurrentMonth = (nomorAgenda) => {
  if (!nomorAgenda) return false;
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const parts = nomorAgenda.split('-');
  return parts[1] === currentYearMonth;
};

module.exports = {
  generateNomorAgenda,
  extractNumber,
  isCurrentMonth
};