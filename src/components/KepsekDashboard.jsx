import React, { useState } from 'react';
import { Users, Check, FileSpreadsheet, Download, AlertCircle, X, Eye, BookOpen, MessageSquareText, Search } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function KepsekDashboard({ students, attendance }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const totalSiswa = students.length;
  const hadirHariIni = attendance.filter(a => a.date === today && a.status === 'hadir').length;
  const sakitHariIni = attendance.filter(a => a.date === today && a.status === 'sakit').length;
  const alphaHariIni = attendance.filter(a => a.date === today && a.status === 'alpha').length;
  const persentase = totalSiswa > 0 ? Math.round((hadirHariIni / totalSiswa) * 100) : 0;

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

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

  const getStudentStats = (studentId) => {
    const records = attendance.filter(a => a.studentId === studentId);
    const totalHadir = records.filter(a => a.status === 'hadir').length;
    const totalSakit = records.filter(a => a.status === 'sakit').length;
    const totalAlpha = records.filter(a => a.status === 'alpha').length;
    const notes = records.filter(a => a.note && a.note.trim() !== '');

    return { totalHadir, totalSakit, totalAlpha, notes };
  };

  return (
    <div className="space-y-6 sm:space-y-8 relative">
      <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 p-4 rounded-2xl flex items-center gap-3 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm">
        <Eye size={20} className="shrink-0" />
        <span>Mode Eksekutif: Klik nama siswa di tabel bawah untuk membuka <b>Buku Saku Digital</b> siswa.</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1 text-indigo-600 dark:text-indigo-400"><Users size={16}/><span className="text-[10px] font-bold uppercase tracking-wider">Total</span></div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{totalSiswa}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1 text-green-600 dark:text-green-400"><Check size={16}/><span className="text-[10px] font-bold uppercase tracking-wider">Hadir</span></div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{hadirHariIni}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1 text-orange-500 dark:text-orange-400"><AlertCircle size={16}/><span className="text-[10px] font-bold uppercase tracking-wider">Izin/Sakit</span></div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{sakitHariIni}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1 text-red-500 dark:text-red-400"><X size={16}/><span className="text-[10px] font-bold uppercase tracking-wider">Alpha</span></div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{alphaHariIni}</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-4 sm:p-5 rounded-3xl shadow-lg shadow-indigo-200 dark:shadow-none flex flex-col justify-between col-span-2 lg:col-span-1">
           <div><span className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider">Kehadiran</span><p className="text-3xl font-bold mt-1">{persentase}%</p></div>
           <div className="w-full bg-black/20 h-1.5 rounded-full mt-2 overflow-hidden"><div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${persentase}%` }}></div></div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-950/60 p-3 rounded-xl text-green-600 dark:text-green-400"><FileSpreadsheet size={24} /></div>
            <div><h3 className="font-bold text-slate-800 dark:text-white">Laporan Bulanan</h3><p className="text-sm text-slate-500 dark:text-slate-400">Download rekap kehadiran format Excel.</p></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input type="month" className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-sm outline-none focus:border-indigo-500 w-full sm:w-auto" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
            <button onClick={handleDownloadReport} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition shadow-lg shadow-green-100 dark:shadow-none w-full sm:w-auto"><Download size={16} /> Export Excel</button>
          </div>
        </div>
      </div>

      {/* Tabel Database Siswa */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-bold text-slate-700 dark:text-slate-200">Database Siswa (Klik Nama untuk Detail)</h3>
          
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Cari siswa..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-4 sm:px-6 py-4">Siswa</th>
                <th className="px-2 sm:px-6 py-4 text-center">Kelas</th>
                <th className="px-4 sm:px-6 py-4 text-right">Hari Ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-slate-400 dark:text-slate-500 text-xs italic">Siswa tidak ditemukan.</td>
                </tr>
              ) : (
                filteredStudents.map(s => {
                  const record = attendance.find(a => a.studentId === s.id && a.date === today);
                  return (
                    <tr key={s.id} onClick={() => setSelectedStudent(s)} className="hover:bg-indigo-50/50 dark:hover:bg-slate-800/60 transition cursor-pointer group">
                      <td className="px-4 sm:px-6 py-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2.5 sm:gap-3">
                        <img src={s.photo} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 object-cover shrink-0"/>
                        <div className="min-w-0">
                          <p className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate text-xs sm:text-sm">{s.name}</p>
                          <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate">Klik lihat detail</p>
                        </div>
                      </td>
                      
                      <td className="px-2 sm:px-6 py-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold ${s.class==='TK A'?'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400':'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'}`}>
                          {s.class}
                        </span>
                      </td>

                      <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap">
                        {record ? (
                          <span className={`inline-block px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                            record.status === 'hadir' ? 'bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300' :
                            record.status === 'sakit' ? 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300' : 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300'
                          }`}>
                            {record.status.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-[10px] sm:text-xs italic">Belum Diabsen</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL BUKU SAKU */}
      {selectedStudent && (() => {
        const stats = getStudentStats(selectedStudent.id);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-slate-800">
              <div className="bg-slate-900 dark:bg-slate-950 p-6 text-white relative">
                <button onClick={() => setSelectedStudent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition"><X size={20}/></button>
                <div className="flex items-center gap-4">
                  <img src={selectedStudent.photo} className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-indigo-500/30 object-cover shrink-0"/>
                  <div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-indigo-400"/>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Buku Saku Siswa</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mt-0.5">{selectedStudent.name}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold">{selectedStudent.class}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Akumulasi Kehadiran</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/40 p-3 rounded-2xl text-center">
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.totalHadir}</p>
                      <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">Hadir</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/40 p-3 rounded-2xl text-center">
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.totalSakit}</p>
                      <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase">Izin/Sakit</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40 p-3 rounded-2xl text-center">
                      <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.totalAlpha}</p>
                      <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">Alpha</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Riwayat Catatan Guru</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                    {stats.notes.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">Belum ada catatan izin/sakit.</p>
                    ) : (
                      stats.notes.map(rec => (
                        <div key={rec.id} className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 p-3 rounded-xl flex items-start gap-2.5">
                          <MessageSquareText size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"/>
                          <div className="text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{rec.date}: </span>
                            <span className="text-amber-900 dark:text-amber-200 italic">"{rec.note}"</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-right">
                <button onClick={() => setSelectedStudent(null)} className="px-5 py-2 bg-slate-800 dark:bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-black dark:hover:bg-indigo-700 transition">Tutup</button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}