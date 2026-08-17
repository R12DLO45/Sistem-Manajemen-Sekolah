import React, { useState } from 'react';
import { Users, Check, FileSpreadsheet, Download, AlertCircle, X, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function KepsekDashboard({ students, attendance }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // STATISTIK HARI INI 
  const today = new Date().toISOString().split('T')[0];
  const totalSiswa = students.length;
  const hadirHariIni = attendance.filter(a => a.date === today && a.status === 'hadir').length;
  const sakitHariIni = attendance.filter(a => a.date === today && a.status === 'sakit').length;
  const alphaHariIni = attendance.filter(a => a.date === today && a.status === 'alpha').length;
  const persentase = totalSiswa > 0 ? Math.round((hadirHariIni / totalSiswa) * 100) : 0;

  // EXPORT EXCEL
  const handleDownloadReport = () => {
    const [year, month] = selectedMonth.split('-');
    const daysInMonth = new Date(year, month, 0).getDate();
    
    const header = ['No', 'Nama Siswa', 'Kelas'];
    for (let d = 1; d <= daysInMonth; d++) header.push(d);
    header.push('Hadir', 'Sakit', 'Alpha');

    const data = students.map((s, index) => {
      const row = [index + 1, s.name, s.class];
      let totalH = 0, totalS = 0, totalA = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${selectedMonth}-${String(d).padStart(2, '0')}`;
        const record = attendance.find(a => a.studentId === s.id && a.date === dateStr);
        
        let statusSymbol = '-';
        if (record) {
          if (record.status === 'hadir') { statusSymbol = 'v'; totalH++; }
          else if (record.status === 'sakit') { statusSymbol = 'S'; totalS++; }
          else if (record.status === 'alpha') { statusSymbol = 'A'; totalA++; }
        }
        row.push(statusSymbol);
      }
      row.push(totalH, totalS, totalA);
      return row;
    });

    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
    ws['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 10 }]; 
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Presensi ${selectedMonth}`);
    XLSX.writeFile(wb, `Laporan_Absensi_TK_${selectedMonth}.xlsx`);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Banner Mode Eksekutif */}
      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-3 text-indigo-700 text-xs sm:text-sm">
        <Eye size={20} className="shrink-0" />
        <span>Mode Eksekutif: Anda memiliki akses penuh untuk memantau ringkasan kehadiran dan mengunduh laporan bulanan.</span>
      </div>

      {/* 1. Widgets Stats (5 Kartu Ringkasan) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-1 text-indigo-600"><Users size={16}/><span className="text-[10px] font-bold uppercase tracking-wider">Total</span></div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800">{totalSiswa}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-1 text-green-600"><Check size={16}/><span className="text-[10px] font-bold uppercase tracking-wider">Hadir</span></div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800">{hadirHariIni}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-1 text-orange-500"><AlertCircle size={16}/><span className="text-[10px] font-bold uppercase tracking-wider">Izin</span></div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800">{sakitHariIni}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-1 text-red-500"><X size={16}/><span className="text-[10px] font-bold uppercase tracking-wider">Alpha</span></div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800">{alphaHariIni}</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-4 sm:p-5 rounded-3xl shadow-lg shadow-indigo-200 flex flex-col justify-between col-span-2 lg:col-span-1">
           <div><span className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider">Kehadiran</span><p className="text-3xl font-bold mt-1">{persentase}%</p></div>
           <div className="w-full bg-black/20 h-1.5 rounded-full mt-2 overflow-hidden"><div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${persentase}%` }}></div></div>
        </div>
      </div>

      {/* 2. Export Excel Section */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-xl text-green-600"><FileSpreadsheet size={24} /></div>
            <div><h3 className="font-bold text-slate-800">Laporan Bulanan</h3><p className="text-sm text-slate-500">Download rekap kehadiran format Excel.</p></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input type="month" className="p-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 w-full sm:w-auto" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
            <button onClick={handleDownloadReport} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition shadow-lg shadow-green-100 w-full sm:w-auto"><Download size={16} /> Export Excel</button>
          </div>
        </div>
      </div>

      {/* 3. Monitoring Tabel Siswa (Read Only) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-50"><h3 className="font-bold text-slate-700">Database Siswa (Pantauan)</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
              <tr><th className="px-6 py-4">Siswa</th><th className="px-6 py-4">Kelas</th><th className="px-6 py-4 text-right">Status Hari Ini</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map(s => {
                const record = attendance.find(a => a.studentId === s.id && a.date === today);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-3"><img src={s.photo} className="w-8 h-8 rounded-full bg-slate-100 object-cover"/>{s.name}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-md text-xs font-bold ${s.class==='TK A'?'bg-blue-50 text-blue-600':'bg-purple-50 text-purple-600'}`}>{s.class}</span></td>
                    <td className="px-6 py-4 text-right">
                      {record ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          record.status === 'hadir' ? 'bg-green-100 text-green-700' :
                          record.status === 'sakit' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {record.status.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Belum Diabsen</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}