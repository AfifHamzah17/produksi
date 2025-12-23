// // src/components/CompactDataCard.jsx
// import React from 'react';

// const CompactDataCard = ({ title, data, keys }) => {
  
//   // Format angka (sama seperti sebelumnya)
//   const formatValue = (key, value) => {
//     if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
//       return '0';
//     }
    
//     const numVal = Number(value);
//     if (key && key.toLowerCase().includes('capaian')) {
//       return numVal.toFixed(2).replace('.', ',') + '%';
//     } 
//     return numVal.toLocaleString('id-ID');
//   };

//   // Label pendek agar muat di kotak kecil
//   const getShortLabel = (key) => {
//     if (key.includes('rkap')) return 'Rkap';
//     if (key.includes('prognosa')) return 'Prog.';
//     if (key.includes('realisasi_2024')) return 'Real. 24';
//     if (key.includes('realisasi')) return 'Real.';
//     if (key.includes('capaian')) return '% Cap';
//     return key.replace(/_/g, ' ').substring(0, 8); // Potong jika terlalu panjang
//   };

//   // Progress bar color
//   const getProgressColor = (value) => {
//     const numVal = Number(value);
//     if (numVal >= 100) return 'bg-emerald-500';
//     if (numVal >= 80) return 'bg-blue-500';
//     return 'bg-amber-500';
//   };

//   return (
//     <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
//       {/* Header Kecil */}
//       <div className="px-3 py-2 bg-slate-50 border-b border-gray-100">
//         <h4 className="text-xs font-bold text-slate-700 uppercase text-center tracking-wide">
//           {title}
//         </h4>
//       </div>

//       {/* Isi Grid 2 Kolom */}
//       <div className="p-3 grid grid-cols-2 gap-x-3 gap-y-2 content-start flex-1">
//         {keys.map((key) => {
//           const val = data[key];
//           const displayVal = formatValue(key, val);
//           const isPercent = key.toLowerCase().includes('capaian');
//           const progressWidth = isPercent ? Math.min(Math.max(Number(val), 0), 100) : 0;
          
//           return (
//             <div key={key} className="flex flex-col">
//               <span className="text-[10px] text-gray-500 font-medium leading-tight mb-0.5">
//                 {getShortLabel(key)}
//               </span>
//               <span className="text-xs font-bold text-slate-800 leading-tight mb-1">
//                 {displayVal}
//               </span>
              
//               {/* Progress Bar Mini */}
//               {isPercent && (
//                 <div className="w-full bg-gray-100 rounded h-1 overflow-hidden">
//                   <div 
//                     className={`h-full rounded-full ${getProgressColor(val)}`}
//                     style={{ width: `${progressWidth}%` }}
//                   ></div>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default CompactDataCard;


// src/components/DataCard.jsx
import React from 'react';

const CompactDataCard = ({ title, data, keys }) => {
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

export default CompactDataCard;