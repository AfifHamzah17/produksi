// src/components/DataCard.jsx
import React from 'react';

const DataCard = ({ title, data, keys }) => {
  // Helper untuk format angka (Ribuan vs Persen)
  const formatValue = (key, value) => {
    if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
      return '0';
    }
    
    const numVal = Number(value);

    // Logika Persen
    if (key && key.toLowerCase().includes('capaian')) {
      return numVal.toFixed(2).replace('.', ',') + '%';
    } 
    
    // Logika Ribuan (Format Indonesia)
    return numVal.toLocaleString('id-ID');
  };

  // Helper untuk menentukan warna progress bar
  const getProgressColor = (key, value) => {
    if (!key.toLowerCase().includes('capaian')) return 'bg-gray-200'; // Bukan persen, abu-abu
    
    const numVal = Number(value);
    if (numVal >= 100) return 'bg-green-500'; // Hijau jika mencapai target
    if (numVal >= 80) return 'bg-blue-500';   // Biru jika mendekati
    return 'bg-yellow-500';                   // Kuning jika rendah
  };

  const formatLabel = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="h-full">
      {/* Header Card */}
      <div className="text-sm font-bold text-slate-700 mb-2 text-center border-b border-gray-200 pb-1">
        {title}
      </div>

      {/* Grid Isi Card */}
      <div className="grid grid-cols-2 gap-2">
        {keys.map((key) => {
          const val = data[key];
          const displayVal = formatValue(key, val);
          const isPercent = key.toLowerCase().includes('capaian');
          const progressWidth = isPercent ? Math.min(Math.max(Number(val), 0), 100) : 0; // Clamp 0-100

          return (
            <div key={key} className="bg-white border border-gray-200 rounded p-2 shadow-sm">
              <div className="text-[10px] text-gray-500 truncate mb-1" title={formatLabel(key)}>
                {formatLabel(key)}
              </div>
              <div className="text-sm font-semibold text-slate-800 mb-1">
                {displayVal}
              </div>
              
              {/* Progress Bar Hanya untuk Persen */}
              {isPercent && (
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(key, val)}`}
                    style={{ width: `${progressWidth}%` }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DataCard;