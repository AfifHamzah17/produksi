// src/models/SheetModel.js

// --- Configuration ---
const SHEET_ID = '1WoVBWDZCtT5yi_GyeifveCIukMpe0nAO';
const GID_ID = '1678463815';
const CSV_EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID_ID}`;

// --- MAPPING ---
const COLUMN_MAPPING = {
  // --- Group & Kebun Info ---
  'B': 'unitGroup',
  'C': 'kebun',

  // --- Bulan Ini (This Month) ---
  'D': 'rkap_today',
  'E': 'month_rkap_sd_today',
  'F': 'month_rkap_month',
  'G': 'month_prognosa_today',
  'H': 'month_prognosa_sd_today',
  'I': 'month_prognosa_month',
  'J': 'month_realisasi_2024_today',
  'K': 'month_realisasi_2024_sd_today',
  'L': 'month_realisasi_2024_month',
  'M': 'month_realisasi_today',
  'N': 'month_realisasi_sd_today',
  'O': 'month_capaian_rkap_today',
  'P': 'month_capaian_rkap_sd_today',
  'Q': 'month_capaian_rkap_month',
  'R': 'month_capaian_prognosa_today',
  'S': 'month_capaian_prognosa_sd_today',
  'T': 'month_capaian_prognosa_month',
  'U': 'month_capaian_realisasi_today',
  'V': 'month_capaian_realisasi_sd_today',
  'W': 'month_capaian_realisasi_month',

  // --- S.D. Bulan Ini (Until This Month) ---
  'X': 'sd_month_rkap_sd_today',
  'Y': 'sd_month_prognosa_sd_today',
  'Z': 'sd_month_realisasi_2024_sd_today',
  'AA': 'sd_month_realisasi_sd_today',
  'AB': 'sd_month_capaian_rkap_sd_today',
  'AC': 'sd_month_capaian_pbb_sd_today', 
  'AD': 'sd_month_capaian_2024_sd_today',

  // --- Setahun (Yearly) ---
  'AE': 'rkap_setahun',
  'AF': 'prognosa_setahun',
  'AG': 'capaian_rkap_setahun',
  'AH': 'capaian_rko_setahun', 
};

const parseCSV = (text) => {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; 
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
    } else {
      currentField += char;
    }
  }
  
  if (currentField || currentRow.length) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }
  
  return rows;
};

export const fetchAndProcessSheetData = async () => {
  try {
    const response = await fetch(CSV_EXPORT_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }
    const csvText = await response.text();
    const rows = parseCSV(csvText);

    const dataRows = rows.slice(13, 70); 
    const rowsToSkipIndices = [38, 39, 40]; 
    const filteredRows = dataRows.filter((_, index) => !rowsToSkipIndices.includes(index));

    let lastUnitGroup = null;

    const processedData = filteredRows.map((row, rowIndex) => {
      const rawUnitGroup = row[1]?.trim();
      if (rawUnitGroup) {
        lastUnitGroup = rawUnitGroup;
      }

      const rowData = {};
      Object.entries(COLUMN_MAPPING).forEach(([colLetter, key]) => {
        const colIndex = colLetter.charCodeAt(0) - 'A'.charCodeAt(0);
        const actualColIndex = colLetter.length > 1 ? 
          26 + (colLetter.charCodeAt(0) - 'A'.charCodeAt(0)) * 26 + (colLetter.charCodeAt(1) - 'A'.charCodeAt(0)) : 
          colIndex;
        
        let value = row[actualColIndex]?.trim() || null;

        // --- FIX: Handle Parsing "744.880" (Ribuan) vs "12,00" (Desimal) ---
        // Di Excel/CSV data: Titik (.) = Ribuan, Koma (,) = Desimal
        // Contoh: "744.880" -> Harusnya 744880
        // Contoh: "15.276.470" -> Harusnya 15276470
        // Contoh: "12,50" -> Harusnya 12.5
        
        if (value) {
          // 1. Hapus semua titik (karena itu ribuan)
          let cleanVal = value.replace(/\./g, '');
          
          // 2. Ganti koma dengan titik (standar JS Float)
          cleanVal = cleanVal.replace(',', '.');

          // 3. Parse jadi Float
          if (!isNaN(cleanVal)) {
            value = parseFloat(cleanVal);
          }
        }

        if (key === 'unitGroup' && value === null) {
          value = lastUnitGroup;
        }

        rowData[key] = value;
      });

      if (rowData.unitGroup && rowData.kebun && rowData.kebun.startsWith('1')) {
        return rowData;
      }
      return null;
    }).filter(row => row !== null);

    return processedData;

  } catch (error) {
    console.error("Error processing sheet data:", error);
    throw error;
  }
};