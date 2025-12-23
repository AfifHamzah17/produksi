// src/pages/DataViewPage/DataViewPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { SheetPresenter } from './SheetPresenter';
import DataTable from '../../components/DataTable';
import SkeletonLoader from '../../components/SkeletonLoader';

function DataViewPage() {
  const [data, setData] = useState(null);
  const [groupedData, setGroupedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // --- NEW: Pagination is now based on Kebun (rows) ---
  const [currentPage, setCurrentPage] = useState(1);
  const [kebunPerPage, setKebunPerPage] = useState(10); // Default to 10 rows

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
    
    // Tambahkan logging untuk memeriksa data yang dikelompokkan
    console.log('Grouped data keys:', Object.keys(groups));
    
    // Periksa nilai sd_month_capaian_pbb_sd_today di setiap grup
    Object.keys(groups).forEach(groupName => {
      const firstItem = groups[groupName][0];
      console.log(`Group ${groupName} - sd_month_capaian_pbb_sd_today:`, firstItem.sd_month_capaian_pbb_sd_today);
    });
    
    return Object.keys(groups).map(groupName => ({
      groupName,
      items: groups[groupName],
    }));
  };

  // --- NEW: Helper function to get the paginated view ---
  const getPaginatedData = (groups, page, perPage) => {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    let paginatedView = [];
    let currentIndex = 0;

    for (const group of groups) {
      // If the current group is completely outside the page range, skip it
      if (currentIndex + group.items.length <= startIndex) {
        currentIndex += group.items.length;
        continue;
      }

      // If the current group is completely within the page range, add it all
      if (currentIndex >= startIndex && currentIndex + group.items.length <= endIndex) {
        paginatedView.push({ group, items: group.items });
      }
      // If the current group is partially on the page, add the relevant slice
      else {
        const sliceStartIndex = Math.max(0, startIndex - currentIndex);
        const sliceEndIndex = Math.min(group.items.length, endIndex - currentIndex);
        paginatedView.push({
          group,
          items: group.items.slice(sliceStartIndex, sliceEndIndex),
        });
      }

      currentIndex += group.items.length;
      if (currentIndex >= endIndex) {
        break; // We've filled the page, so we can stop
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
        
        // Tambahkan logging untuk memeriksa data mentah
        console.log('Raw sheet data sample:', sheetData.slice(0, 3));
        
        setData(sheetData);
        setError(null);
        const transformed = transformDataForGrouping(sheetData);
        setGroupedData(transformed);
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

  // Reset to page 1 if page size or data changes
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

  // --- NEW: Pagination logic based on total rows ---
  const totalRows = groupedData.reduce((sum, group) => sum + group.items.length, 0);
  const totalPages = Math.ceil(totalRows / kebunPerPage);
  const paginatedViewData = getPaginatedData(groupedData, currentPage, kebunPerPage);

  return (
    <>
      {isLoading && <SkeletonLoader rows={10} cols={10} />}
      {error && <div className="text-center p-4 text-red-500 bg-red-100 border border-red-400 rounded">Error: {error}</div>}
      {!isLoading && !error && (
        <DataTable
          // --- Pass the new paginated data structure ---
          paginatedViewData={paginatedViewData}
          expandedGroups={expandedGroups}
          onToggleGroup={handleToggleGroup}
          // --- Pass updated pagination props ---
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          kebunPerPage={kebunPerPage}
          setKebunPerPage={setKebunPerPage}
          totalRows={totalRows}
        />
      )}
    </>
  );
}

export default DataViewPage;