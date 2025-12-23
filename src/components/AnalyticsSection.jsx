// src/components/AnalyticsSection.jsx
import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

// Palet Warna yang profesional
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AnalyticsSection = ({ paginatedViewData }) => {
  
  // --- 1. Processing Data untuk Charts ---

  const chartData = useMemo(() => {
    if (!paginatedViewData) return [];

    let flatItems = [];
    // Flatten data dari struktur grup
    paginatedViewData.forEach(group => {
      group.items.forEach(item => {
        flatItems.push({
          kebun: item.kebun,
          unitGroup: item.unitGroup,
          // Ambil data numerik, default ke 0 jika null/NaN
          rkapSetahun: Number(item.rkap_setahun) || 0,
          realisasiSdToday: Number(item.sd_month_realisasi_2024_sd_today) || 0,
          capaianRkap: Number(item.capaian_rkap_setahun) || 0,
          capaianPrognosa: Number(item.capaian_rko_setahun) || 0, // Menggunakan capaian_rko_setahun sebagai proxy jika capaian_prognosa kurang lengkap, atau sesuaikan
        });
      });
    });

    return flatItems;
  }, [paginatedViewData]);

  // --- 2. Data untuk Bar Chart (Target vs Actual) ---
  // Kita ambil Top 10 Kebun berdasarkan volume Realisasi agar chart tidak terlalu padat
  const barChartData = useMemo(() => {
    const sorted = [...chartData].sort((a, b) => b.realisasiSdToday - a.realisasiSdToday).slice(0, 10);
    return sorted.map(item => ({
      name: item.kebun,
      Target: item.rkapSetahun,
      Realisasi: item.realisasiSdToday,
      Capaian: item.capaianRkap // Untuk Tooltip
    }));
  }, [chartData]);

  // --- 3. Data untuk Pie Chart (Kontribusi Unit) ---
  const pieChartData = useMemo(() => {
    const groupMap = {};
    chartData.forEach(item => {
      if (!groupMap[item.unitGroup]) {
        groupMap[item.unitGroup] = 0;
      }
      groupMap[item.unitGroup] += item.realisasiSdToday;
    });

    return Object.keys(groupMap).map((key, index) => ({
      name: key,
      value: groupMap[key],
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);
  }, [chartData]);

  // --- 4. Data untuk Radar Chart (Health Score Top 5) ---
  const radarChartData = useMemo(() => {
    const top5 = [...chartData].sort((a, b) => b.realisasiSdToday - a.realisasiSdToday).slice(0, 5);
    
    // Normalisasi nilai agar Radar Chart proporsional (0-100)
    // Cari Max value untuk pembagi
    const maxRkap = Math.max(...chartData.map(d => d.rkapSetahun)) || 1;
    const maxReal = Math.max(...chartData.map(d => d.realisasiSdToday)) || 1;

    const data = top5.map(item => ({
      kebun: item.kebun,
      'Capaian (%)': item.capaianRkap, // Sudah persen
      'Volume Skala': (item.realisasiSdToday / maxReal) * 100,
      'Target Skala': (item.rkapSetahun / maxRkap) * 100,
    }));

    // Tambahkan "Rata-rata" sebagai pembanding
    const avgCapaian = chartData.reduce((sum, d) => sum + d.capaianRkap, 0) / chartData.length;
    const avgVol = (chartData.reduce((sum, d) => sum + d.realisasiSdToday, 0) / chartData.length) / maxReal * 100;
    const avgTarget = (chartData.reduce((sum, d) => sum + d.rkapSetahun, 0) / chartData.length) / maxRkap * 100;

    data.push({
      kebun: 'Rata-rata Unit',
      'Capaian (%)': avgCapaian,
      'Volume Skala': avgVol,
      'Target Skala': avgTarget,
      fill: '#999' // Warna khusus rata-rata
    });

    return data;
  }, [chartData]);

  if (chartData.length === 0) return <div className="p-4 text-center text-gray-500">Belum cukup data untuk analisa.</div>;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- BAR CHART SECTION --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            Gap Analysis: Target vs Realisasi (Top 10 Kebun)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Membandingkan target RKAP tahunan dengan realisasi tahun berjalan (YTD).</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} layout="vertical">
                <XAxis type="number" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${Number(value).toLocaleString('id-ID')} Ton`, 
                    name === 'Target' ? 'RKAP' : 'Realisasi YTD'
                  ]} 
                />
                <Legend />
                <Bar dataKey="Target" fill="#94a3b8" name="RKAP (Target)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Realisasi" fill="#3b82f6" name="Realisasi (Aktual)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- PIE CHART SECTION --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
            Kontribusi Produksi per Unit Group
          </h3>
          <p className="text-xs text-slate-500 mb-4">Distribusi beban produksi berdasarkan realisasi SD Hari Ini.</p>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${((entry.value / pieChartData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toLocaleString('id-ID')} Ton`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend Manual di bawah agar rapi */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieChartData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1 text-xs text-slate-600">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* --- RADAR CHART SECTION (Full Width) --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-purple-600 rounded-full"></span>
          Peta Kesehatan Kebun (Health Score)
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Membandingkan keseimbangan Capaian (%) dan Volume Produksi (Skala) pada 5 Kebun terbesar dibanding rata-rata.
          Bentuk radar yang simetris menunjukkan kinerja yang seimbang.
        </p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarChartData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="kebun" tick={{fontSize: 11, fill: '#64748b'}} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{fontSize: 10}} />
              <Radar
                name="Kebun Terpilih"
                dataKey="Capaian (%)"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Radar
                name="Volume"
                dataKey="Volume Skala"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.6}
              />
              <Legend />
              <Tooltip 
                formatter={(value) => `${Number(value).toFixed(1)}`}
                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none' }}
                itemStyle={{ color: '#fff' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsSection;