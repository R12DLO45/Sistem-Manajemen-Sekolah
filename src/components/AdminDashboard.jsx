import React, { useState } from 'react';
import { Users, Check, Pencil, Plus, Trash2, FileSpreadsheet, Download } from 'lucide-react';
import * as XLSX from 'xlsx'; // <--- Import Library Excel

export default function AdminDashboard({ students, attendance, onAdd, onUpdate, onDelete }) {
  // STATE
  const [form, setForm] = useState({ id: null, name: '', class: 'TK A' });
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Format: YYYY-MM
  
  // STATISTIK
  const today = new Date().toISOString().split('T')[0];
  const totalSiswa = students.length;
  const hadirHariIni = attendance.filter(a => a.date === today && a.status === 'hadir').length;
  const persentase = totalSiswa > 0 ? Math.round((hadirHariIni / totalSiswa) * 100) : 0;

  // HANDLER CRUD 
  const handleSubmit = () => {
    if(!form.name) return;
    if(form.id) onUpdate(form.id, form.name, form.class);
    else onAdd(form.name, form.class);
    setForm({ id: null, name: '', class: 'TK A' });
  };

  const handleEdit = (s) => { setForm(s); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // LOGIKA EXPORT EXCEL
  const handleDownloadReport = () => {
    // 1. Siapkan Data
    const [year, month] = selectedMonth.split('-');
    const daysInMonth = new Date(year, month, 0).getDate(); // Hitung jumlah hari (28/30/31)
    
    // Header Excel
    const header = ['No', 'Nama Siswa', 'Kelas'];
    for (let d = 1; d <= daysInMonth; d++) header.push(d); // Kolom Tgl 1-31
    header.push('Hadir', 'Sakit', 'Alpha'); // Kolom Total

    // Isi Data Baris per Baris
    const data = students.map((s, index) => {
      const row = [index + 1, s.name, s.class];
      let totalH = 0, totalS = 0, totalA = 0;

      // Loop tanggal 1 sampai akhir bulan
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
      
      // Masukkan Total
      row.push(totalH, totalS, totalA);
      return row;
    });

    // 2. Buat Worksheet
    const ws = XLSX.utils.aoa_to_sheet([header, ...data]); // aoa = Array of Arrays
    
    // Atur Lebar Kolom (Biar rapi)
    ws['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 10 }]; // Lebar kolom No, Nama, Kelas

    // 3. Buat Workbook & Download
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Presensi ${selectedMonth}`);
    XLSX.writeFile(wb, `Laporan_Absensi_TK_${selectedMonth}.xlsx`);
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Widgets Stats (Atas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4"></div>
          <div className="relative z-10"><div className="flex items-center gap-2 mb-2 text-indigo-600"><Users size={18}/><span className="text-xs font-bold uppercase">Total Siswa</span></div><p className="text-4xl font-bold text-slate-800">{totalSiswa}</p></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
           <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4"></div>
           <div className="relative z-10"><div className="flex items-center gap-2 mb-2 text-green-600"><Check size={18}/><span className="text-xs font-bold uppercase">Hadir Hari Ini</span></div><p className="text-4xl font-bold text-slate-800">{hadirHariIni}</p></div>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-3xl shadow-lg shadow-indigo-200 flex flex-col justify-between">
           <div><span className="text-indigo-200 text-xs font-bold uppercase">Persentase</span><div className="flex items-end gap-2 mt-1"><p className="text-4xl font-bold">{persentase}%</p><span className="text-sm mb-1 opacity-80">Today</span></div></div>
           <div className="w-full bg-black/20 h-2 rounded-full mt-4 overflow-hidden"><div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${persentase}%` }}></div></div>
        </div>
      </div>

      {/* 2. AREA LAPORAN BULANAN */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-xl text-green-600">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Laporan Bulanan</h3>
              <p className="text-sm text-slate-500">Download rekap kehadiran format Excel.</p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <input 
              type="month" 
              className="p-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
            <button 
              onClick={handleDownloadReport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition shadow-lg shadow-green-100"
            >
              <Download size={16} /> Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* 3. CRUD Management */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Input */}
        <div className="lg:col-span-1">
          <div className={`p-6 rounded-3xl border sticky top-24 transition-colors ${form.id ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'}`}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${form.id ? 'text-orange-700' : 'text-slate-800'}`}>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.id ? 'bg-orange-200 text-orange-700' : 'bg-indigo-100 text-indigo-600'}`}>{form.id ? <Pencil size={18}/> : <Plus size={18}/>}</span>
              {form.id ? 'Edit Data Siswa' : 'Input Siswa Baru'}
            </h3>
            <div className="space-y-3">
              <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Nama Lengkap" />
              <select value={form.class} onChange={e=>setForm({...form, class:e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"><option>TK A</option><option>TK B</option></select>
              <button onClick={handleSubmit} className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-lg transition ${form.id ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-800 hover:bg-black'}`}>{form.id ? 'Update Perubahan' : '+ Simpan Data'}</button>
              {form.id && <button onClick={()=>setForm({id:null, name:'', class:'TK A'})} className="w-full text-xs text-slate-500 py-2">Batal Edit</button>}
            </div>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-50"><h3 className="font-bold text-slate-700">Database Siswa (Semua Kelas)</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  <tr><th className="px-6 py-4">Siswa</th><th className="px-6 py-4">Kelas</th><th className="px-6 py-4 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition group">
                      <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-3"><img src={s.photo} className="w-8 h-8 rounded-full bg-slate-100 object-cover"/>{s.name}</td>
                      <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-md text-xs font-bold ${s.class==='TK A'?'bg-blue-50 text-blue-600':'bg-purple-50 text-purple-600'}`}>{s.class}</span></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                           <button onClick={()=>handleEdit(s)} className="p-2 rounded-lg text-slate-300 hover:text-orange-600 hover:bg-orange-50 transition"><Pencil size={16}/></button>
                           <button onClick={()=>{if(confirm('Hapus siswa ini?')) onDelete(s.id)}} className="p-2 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}