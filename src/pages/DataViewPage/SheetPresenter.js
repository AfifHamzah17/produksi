// src/pages/DataViewPage/SheetPresenter.js
import { fetchAndProcessSheetData } from '../../models/SheetModel.js';

export class SheetPresenter {
  /**
   * Loads the data from the sheet.
   * @returns {Promise<Array<Object>>} A promise that resolves to the processed data.
   */
async loadData() {
    try {
      // Tambahkan logging untuk melihat data yang diambil
      const data = await fetchAndProcessSheetData();
      console.log('Data loaded in SheetPresenter:', data.length, 'rows');
      
      // Periksa nilai sd_month_capaian_pbb_sd_today
      data.forEach((item, index) => {
        if (index < 5) { // Hanya log 5 baris pertama
          console.log(`Row ${index} - sd_month_capaian_pbb_sd_today:`, item.sd_month_capaian_pbb_sd_today);
        }
      });
      
      return data;
    } catch (error) {
      console.error('Error in SheetPresenter.loadData:', error);
      throw error;
    }
  }
}