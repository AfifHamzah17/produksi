// src/components/DataCard.jsx
import React from 'react';

const DataCard = ({ title, data, keys }) => {
  
  const formatValue = (key, value) => {
    if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
      return '0';
    }
    
    const numVal = Number(value);
    if (key && key.toLowerCase().includes('capaian')) {
      return numVal.toFixed(2).replace('.', ',') + '%';
    } 
    return numVal.toLocaleString('id-ID');
  };

  const getLabel = (key) => {
    if (key.includes('rkap')) return 'Rkap';
    if (key.includes('prognosa')) return 'Prognosa';
    if (key.includes('realisasi_2024')) return 'Real. 24';
    if (key.includes('realisasi')) return 'Realisasi';
    if (key.includes('capaian')) return '% Capaian';
    return key.replace(/_/g, ' ');
  };

  const getProgressColor = (value) => {
    const numVal = Number(value);
    if (numVal >= 100) return 'bg-emerald-500';
    if (numVal >= 80) return 'bg-blue-500';
    return 'bg-amber-500';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header Kecil Kartu */}
      <div className="px-3 py-2 bg-slate-100 border-b border-gray-200 text-center">
        <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
          {title}
        </h4>
      </div>

      {/* List Item Vertikal ke Bawah (1 Row 1 Kebawah) */}
      <div className="p-2 bg-gray-50 flex-1 flex flex-col gap-1.5">
        {keys.map((key) => {
          const val = data[key];
          const displayVal = formatValue(key, val);
          const isPercent = key.toLowerCase().includes('capaian');
          const progressWidth = isPercent ? Math.min(Math.max(Number(val), 0), 100) : 0;
          const barColor = isPercent ? getProgressColor(val) : 'bg-transparent';

          return (
            <div key={key} className="bg-white p-2 rounded border border-gray-200 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase w-1/2">
                  {getLabel(key)}
                </span>
                <span className="text-xs font-bold text-slate-800 text-right w-1/2">
                  {displayVal}
                </span>
              </div>
              
              {/* Progress Bar */}
              {isPercent && (
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-0.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${barColor}`}
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