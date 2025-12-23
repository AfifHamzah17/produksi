// src/pages/DataViewPage/DataViewPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { SheetPresenter } from './SheetPresenter';
import DataTable from '../../components/DataTable';
import SkeletonLoader from '../../components/SkeletonLoader';
import AnalyticsSection from '../../components/AnalyticsSection'; // Import Komponen Baru

function DataViewPage() {
  const [data, setData] = useState(null);
  const [groupedData, setGroupedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  
  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [kebunPerPage, setKebunPerPage] = useState(10);

  // State untuk Tab View (Table vs Analytics)
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'analytics'

  const loadingTimeoutRef = useRef(null);

  const transformDataForGrouping = (flatData) => {
    const groups = flatData.reduce((acc, item) => {
      const unitGroup = item.unitGroup;
      if (!acc[unitGroup]) {
        acc[unitGroup] = [];
      }
      acc[unitGroup].push(item);
      return acc;
    }, {});
    
    return Object.keys(groups).map(groupName => ({
      groupName,
      items: groups[groupName],
    }));
  };

  const getPaginatedData = (groups, page, perPage) => {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    let paginatedView = [];
    let currentIndex = 0;

    for (const group of groups) {
      if (currentIndex + group.items.length <= startIndex) {
        currentIndex += group.items.length;
        continue;
      }

      if (currentIndex >= startIndex && currentIndex + group.items.length <= endIndex) {
        paginatedView.push({ group, items: group.items });
      } else {
        const sliceStartIndex = Math.max(0, startIndex - currentIndex);
        const sliceEndIndex = Math.min(group.items.length, endIndex - currentIndex);
        paginatedView.push({
          group,
          items: group.items.slice(sliceStartIndex, sliceEndIndex),
        });
      }

      currentIndex += group.items.length;
      if (currentIndex >= endIndex) {
        break; 
      }
    }
    return paginatedView;
  };

  useEffect(() => {
    const presenter = new SheetPresenter();
    const getData = async () => {
      try {
        loadingTimeoutRef.current = setTimeout(() => { setIsLoading(true); }, 400);
        const sheetData = await presenter.loadData();
        clearTimeout(loadingTimeoutRef.current);
        
        setData(sheetData);
        setError(null);
        const transformed = transformDataForGrouping(sheetData);
        setGroupedData(transformed);
        
        // Buka semua group secara default saat load awal
        const allGroupNames = new Set(transformed.map(g => g.groupName));
        setExpandedGroups(allGroupNames);
      } catch (err) {
        clearTimeout(loadingTimeoutRef.current);
        setError(err.message || 'An unknown error occurred.');
        setData(null);
        setGroupedData([]);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
    return () => { clearTimeout(loadingTimeoutRef.current); };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [kebunPerPage, groupedData]);

  const handleToggleGroup = (groupName) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const totalRows = groupedData.reduce((sum, group) => sum + group.items.length, 0);
  const totalPages = Math.ceil(totalRows / kebunPerPage);
  const paginatedViewData = getPaginatedData(groupedData, currentPage, kebunPerPage);

  return (
    <>
      {isLoading && <SkeletonLoader rows={10} cols={10} />}
      {error && <div className="text-center p-4 text-red-500 bg-red-100 border border-red-400 rounded">Error: {error}</div>}
      
      {!isLoading && !error && (
        <div className="space-y-6">
          
          {/* --- TAB CONTROLLER --- */}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-100 p-1 rounded-lg inline-flex">
              <button
                onClick={() => setViewMode('table')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'table' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Data Tabel
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'analytics' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                📊 Analisa Data
              </button>
            </div>
          </div>

          {/* --- CONTENT AREA --- */}
          {viewMode === 'analytics' ? (
             <AnalyticsSection paginatedViewData={paginatedViewData} />
          ) : (
            <DataTable
              paginatedViewData={paginatedViewData}
              expandedGroups={expandedGroups}
              onToggleGroup={handleToggleGroup}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              kebunPerPage={kebunPerPage}
              setKebunPerPage={setKebunPerPage}
              totalRows={totalRows}
            />
          )}

        </div>
      )}
    </>
  );
}

export default DataViewPage;