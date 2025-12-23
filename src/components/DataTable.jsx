// src/components/DataTable.jsx
import React, { useEffect } from 'react';

const HEADER_GROUPS = {
  'Rkap': ['rkap_today', 'month_rkap_sd_today', 'month_rkap_month'],
  'Prognosa': ['month_prognosa_today', 'month_prognosa_sd_today', 'month_prognosa_month'],
  'Realisasi 2024': ['month_realisasi_2024_today', 'month_realisasi_2024_sd_today', 'month_realisasi_2024_month'],
  'Realisasi': ['month_realisasi_today', 'month_realisasi_sd_today' ],
  '% Capaian RKAP': ['month_capaian_rkap_today', 'month_capaian_rkap_sd_today', 'month_capaian_rkap_month'],
  '% Capaian Prognosa': ['month_capaian_prognosa_today', 'month_capaian_prognosa_sd_today', 'month_capaian_prognosa_month'],
  '% Capaian REAL THN 2024': ['month_capaian_realisasi_today','month_capaian_realisasi_sd_today', 'month_capaian_realisasi_month'],
  'S.D Bulan Ini': ['sd_month_rkap_sd_today','sd_month_prognosa_sd_today', 'sd_month_realisasi_2024_sd_today', 'sd_month_realisasi_sd_today', 'sd_month_capaian_rkap_sd_today', 'sd_month_capaian_pbb_sd_today','sd_month_capaian_2024_sd_today'],
  'Setahun': ['rkap_setahun', 'prognosa_setahun', 'capaian_rkap_setahun', 'capaian_rko_setahun'],
};

const findGroupForKey = (key) => {
  for (const [groupName, keys] of Object.entries(HEADER_GROUPS)) {
    if (keys.includes(key)) {
      return groupName;
    }
  }
  return null;
};

// --- PERBAIKAN: Fungsi formatValue yang benar ---
const formatValue = (value, key) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  
  const numVal = Number(value);

  // 1. Jika kolom 'capaian' (Persen)
  if (key && key.toLowerCase().includes('capaian')) {
    // Data mentah: 100
    // Langsung format 2 desimal belakang koma, tambah %
    // Hasil: 100,00%
    return numVal.toFixed(2).replace('.', ',') + '%';
  } else {
    // 2. Kolom Biasa (RKAP, Realisasi, dll)
    // Format Indonesia: Titik (.) sebagai ribuan
    // 744880 -> "744.880"
    return numVal.toLocaleString('id-ID');
  }
};

const DataTable = ({ paginatedViewData, expandedGroups, onToggleGroup, currentPage, totalPages, setCurrentPage, kebunPerPage, setKebunPerPage, totalRows }) => {
  
  if (!paginatedViewData || paginatedViewData.length === 0) {
    return <div className="text-center p-4 text-gray-500">No valid data to display.</div>;
  }

  const allHeaders = Object.keys(paginatedViewData[0]?.items[0] || {}).filter(h => h !== 'unitGroup' && h !== 'kebun');
  
  const formatHeader = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const colSpan = allHeaders.length + 2; 

  const groupedKeys = new Set(Object.values(HEADER_GROUPS).flat());
  const nonGroupedHeaders = allHeaders.filter(h => !groupedKeys.has(h));

  return (
    <div className="p-4">
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full">
          <thead className="bg-slate-100">
            <tr>
              <th rowSpan={2} className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border border-gray-300">No.</th>
              <th rowSpan={2} className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border border-gray-300">Kebun</th>
              {Object.entries(HEADER_GROUPS).map(([groupName, keys]) => {
                const firstKeyIndex = allHeaders.findIndex(h => h === keys[0]);
                if (firstKeyIndex === -1) return null;
                return (
                  <th key={groupName} colSpan={keys.length} className="px-4 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border border-gray-300">
                    {groupName}
                  </th>
                );
              }).filter(Boolean)}
              {nonGroupedHeaders.map(header => (
                <th key={header} rowSpan={2} className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border border-gray-300">
                  {formatHeader(header)}
                </th>
              ))}
            </tr>
            <tr>
              {allHeaders.map(header => {
                if (groupedKeys.has(header)) {
                  return (
                    <th key={header} className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider border border-gray-300">
                      {formatHeader(header)}
                    </th>
                  );
                }
                return null;
              }).filter(Boolean)}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedViewData.map((groupView, index) => {
              const isFirstOnPage = index === 0 || paginatedViewData[index - 1].group.groupName !== groupView.group.groupName;
              const isExpanded = expandedGroups.has(groupView.group.groupName);

              return (
                <React.Fragment key={groupView.group.groupName}>
                  {isFirstOnPage && (
                    <tr>
                      <td colSpan={colSpan} className="p-0">
                        <div
                          className="flex items-center space-x-3 px-6 py-4 bg-blue-50/50 cursor-pointer hover:bg-blue-100/50 transition-colors duration-200"
                          onClick={() => onToggleGroup(groupView.group.groupName)}
                        >
                          <svg className={`w-4 h-4 text-slate-600 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          <h3 className="text-sm font-bold text-slate-800">{groupView.group.groupName}</h3>
                          <span className="text-sm text-slate-600">({groupView.group.items.length} Kebun)</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isExpanded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {isExpanded ? 'Expanded' : 'Minimized'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}

                  {isExpanded && groupView.items.map((item, index) => (
                    <tr key={item.kebun + index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 border-b border-gray-200">{index + 1}</td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 border-b border-gray-200">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.kebun}
                        </span>
                      </td>

                      {allHeaders.map(header => (
                        <td key={header} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 border-b border-gray-200">
                          {formatValue(item[header], header)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalRows > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Showing <span className="font-medium">{(currentPage - 1) * kebunPerPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * kebunPerPage, totalRows)}</span> of{' '}
                <span className="font-medium">{totalRows}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <label htmlFor="page-size" className="text-sm text-slate-700">Show</label>
              <select id="page-size" value={kebunPerPage} onChange={(e) => setKebunPerPage(Number(e.target.value))} className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500">
                <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
              </select>
              <span className="text-sm text-slate-700">per page</span>
              {totalPages > 1 && (
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="sr-only">Previous</span><svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </button>
                  <div className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-slate-700">{currentPage}</div>
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="sr-only">Next</span><svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                  </button>
                </nav>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;