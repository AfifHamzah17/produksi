// src/components/DataTable.jsx
import React, { useEffect } from 'react';
import DataCard from './DataCard';

const HEADER_GROUPS = {
  'Hari Ini': [
    'rkap_today', 
    'month_prognosa_today', 
    'month_realisasi_2024_today', 
    'month_realisasi_today', 
    'month_capaian_rkap_today', 
    'month_capaian_prognosa_today', 
    'month_capaian_realisasi_today'
  ],
  'SD Hari Ini': [
    'month_rkap_sd_today', 
    'month_prognosa_sd_today', 
    'month_realisasi_2024_sd_today', 
    'month_realisasi_sd_today', 
    'month_capaian_rkap_sd_today', 
    'month_capaian_prognosa_sd_today', 
    'month_capaian_realisasi_sd_today'
  ],
  'Bulan Ini': [
    'month_rkap_month', 
    'month_prognosa_month', 
    'month_realisasi_2024_month', 
    'month_capaian_rkap_month', 
    'month_capaian_prognosa_month', 
    'month_capaian_realisasi_month'
  ],
  'SD Bulan Ini': [
    'sd_month_rkap_sd_today',
    'sd_month_prognosa_sd_today',
    'sd_month_realisasi_2024_sd_today',
    'sd_month_realisasi_sd_today',
    'sd_month_capaian_rkap_sd_today',
    'sd_month_capaian_pbb_sd_today',
    'sd_month_capaian_2024_sd_today'
  ],
  'Tahun Ini': [
    'rkap_setahun', 
    'prognosa_setahun', 
    'capaian_rkap_setahun', 
    'capaian_rko_setahun'
  ],
};

const DataTable = ({ paginatedViewData, expandedGroups, onToggleGroup, currentPage, totalPages, setCurrentPage, kebunPerPage, setKebunPerPage, totalRows }) => {
  
  if (!paginatedViewData || paginatedViewData.length === 0) {
    return <div className="text-center p-8 text-gray-500">No valid data to display.</div>;
  }

  const groupNames = Object.keys(HEADER_GROUPS);

  return (
    <div className="p-4">
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-100">
            <tr>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border border-gray-300 w-16 sticky left-0 bg-slate-100 z-10">No.</th>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border border-gray-300 w-32 sticky left-16 bg-slate-100 z-10">Kebun</th>
              
              {/* Header Utama Grup */}
              {groupNames.map(groupName => (
                <th key={groupName} className="px-2 py-3 text-center text-xs font-bold text-slate-800 uppercase tracking-wider border border-gray-300 min-w-[140px]">
                  {groupName}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedViewData.map((groupView, index) => {
              const isFirstOnPage = index === 0 || paginatedViewData[index - 1].group.groupName !== groupView.group.groupName;
              const isExpanded = expandedGroups.has(groupView.group.groupName);

              return (
                <React.Fragment key={groupView.group.groupName}>
                  {/* --- HEADER UNIT GROUP (Expand/Collapse) --- */}
                  {isFirstOnPage && (
                    <tr>
                      <td colSpan={groupNames.length + 2} className="p-0">
                        <div
                          className="flex items-center space-x-3 px-4 py-3 bg-blue-50/50 cursor-pointer hover:bg-blue-100/50 transition-colors duration-200 border-b border-gray-200"
                          onClick={() => onToggleGroup(groupView.group.groupName)}
                        >
                          <svg className={`w-4 h-4 text-slate-600 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          <h3 className="text-sm font-bold text-slate-800">{groupView.group.groupName}</h3>
                          <span className="text-sm text-slate-600">({groupView.group.items.length} Kebun)</span>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* --- BARIS DATA KEBUN --- */}
                  {isExpanded && groupView.items.map((item, idx) => (
                    <tr key={item.kebun + idx} className="hover:bg-gray-50 transition-colors">
                      {/* Kolom Nomor */}
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-900 border border-gray-200 text-center sticky left-0 bg-white z-0">
                        {idx + 1}
                      </td>
                      
                      {/* Kolom Kebun */}
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-900 border border-gray-200 sticky left-16 bg-white z-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.kebun}
                        </span>
                      </td>

                      {/* Loop Render DataCard untuk setiap Grup (Sejajar Kebawah di dalam card) */}
                      {groupNames.map(groupName => {
                        const keys = HEADER_GROUPS[groupName];
                        return (
                          <td key={groupName} className="px-2 py-2 align-top border border-gray-200 w-[140px] min-w-[140px]">
                            <DataCard 
                              title={groupName} 
                              data={item} 
                              keys={keys} 
                            />
                          </td>
                        );
                      })}
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
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 mt-4">
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
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
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