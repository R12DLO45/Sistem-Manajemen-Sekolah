import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle, MessageSquareText, Share2, Copy, Search } from 'lucide-react';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  
  return (
    <div className="text-left sm:text-right mt-2 sm:mt-0">
      <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white leading-none">
        {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
        {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>
  );
};

export default function TeacherDashboard({ user, students, attendance, onMark, onToast }) {
  const today = new Date().toISOString().split('T')[0];
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState({ show: false, studentId: null, type: '', name: '' });
  const [noteInput, setNoteInput] = useState('');

  const myStudents = students
    .filter(s => s.class === user.assignedClass)
    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleVote = (student, type) => {
    if (type === 'hadir') {
      onMark(student.id, 'hadir', '');
    } else {
      setModal({ show: true, studentId: student.id, type: type, name: student.name });
      const existing = attendance.find(a => a.studentId === student.id && a.date === today);
      setNoteInput(existing?.note || '');
    }
  };

  const saveNote = () => {
    onMark(modal.studentId, modal.type, noteInput);
    setModal({ show: false, studentId: null, type: '', name: '' });
    setNoteInput('');
  };

  const generateWARekap = () => {
    const dateFormatted = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const classStudents = students.filter(s => s.class === user.assignedClass);

    const hadirList = [];
    const sakitList = [];
    const alphaList = [];

    classStudents.forEach(s => {
      const rec = attendance.find(a => a.studentId === s.id && a.date === today);
      if (rec?.status === 'hadir') hadirList.push(s.name);
      else if (rec?.status === 'sakit') sakitList.push(`${s.name}${rec.note ? ` (${rec.note})` : ''}`);
      else if (rec?.status === 'alpha') alphaList.push(`${s.name}${rec.note ? ` (${rec.note})` : ''}`);
    });

    return `*LAPORAN PRESENSI KELAS ${user.assignedClass}*\n` +
      `📅 *Tanggal:* ${dateFormatted}\n\n` +
      `🟢 *Hadir (${hadirList.length}):*\n${hadirList.length ? hadirList.map(n => `• ${n}`).join('\n') : '-'}\n\n` +
      `🟡 *Izin/Sakit (${sakitList.length}):*\n${sakitList.length ? sakitList.map(n => `• ${n}`).join('\n') : '-'}\n\n` +
      `🔴 *Alpha (${alphaList.length}):*\n${alphaList.length ? alphaList.map(n => `• ${n}`).join('\n') : '-'}\n\n` +
      `_Sistem Informasi Kehadiran TK_`;
  };

  const handleCopyWA = () => {
    navigator.clipboard.writeText(generateWARekap());
    if (onToast) onToast('Teks rekap WA berhasil disalin!', 'success');
  };

  const handleShareWA = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(generateWARekap())}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 relative">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Kelas {user.assignedClass}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Absensi Harian Siswa.</p>
        </div>
        <LiveClock />
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors">
        <div className="text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">
          <p className="font-bold">Fitur Bagikan ke WhatsApp Group</p>
          <p className="text-emerald-700 dark:text-emerald-400 text-xs">Salin atau langsung kirim format rekap absen kelas hari ini ke grup WA orang tua.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={handleCopyWA} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm">
            <Copy size={14} /> Salin Teks
          </button>
          <button onClick={handleShareWA} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-200 dark:shadow-none">
            <Share2 size={14} /> Kirim ke WA
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input 
          type="text" 
          placeholder="Cari nama siswa..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-colors"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold hover:text-slate-600 dark:hover:text-slate-300">
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {myStudents.length === 0 ? (
          <div className="col-span-full text-center py-10 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            {searchQuery ? `Siswa "${searchQuery}" tidak ditemukan.` : `Belum ada siswa di kelas ${user.assignedClass}`}
          </div>
        ) : (
          myStudents.map(student => {
            const record = attendance.find(a => a.studentId === student.id && a.date === today);
            const status = record?.status;

            return (
              <div key={student.id} className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition hover:shadow-md ${status ? 'border-indigo-100 dark:border-indigo-900 ring-2 ring-indigo-50 dark:ring-indigo-950/50' : 'border-slate-100 dark:border-slate-800'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={student.photo} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-white dark:border-slate-700 shadow-sm"/>
                    <div><h4 className="font-bold text-slate-800 dark:text-white text-sm">{student.name}</h4><p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">ID: {student.id}</p></div>
                  </div>
                  {status && <span className={`w-2 h-2 rounded-full ${status==='hadir'?'bg-green-500':status==='sakit'?'bg-orange-500':'bg-red-500'}`}></span>}
                </div>
                
                {record?.note && (
                  <div className="mb-3 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs p-2 rounded-lg flex gap-2 items-start border border-amber-100 dark:border-amber-900/40">
                    <MessageSquareText size={14} className="mt-0.5 shrink-0"/>
                    <span className="line-clamp-2 italic">"{record.note}"</span>
                  </div>
                )}

                <div className="flex bg-slate-50 dark:bg-slate-800/60 p-1 rounded-xl gap-1">
                  {['hadir','sakit','alpha'].map(type => (
                    <button key={type} onClick={() => handleVote(student, type)} className={`flex-1 py-2 rounded-lg transition flex justify-center items-center ${status === type 
                      ? (type==='hadir'?'bg-white dark:bg-slate-800 text-green-600 shadow ring-1 ring-green-500': type==='sakit'?'bg-white dark:bg-slate-800 text-orange-600 shadow ring-1 ring-orange-500':'bg-white dark:bg-slate-800 text-red-600 shadow ring-1 ring-red-500') 
                      : 'text-slate-400 hover:bg-white dark:hover:bg-slate-800/80'}`}>
                      {type==='hadir'?<Check size={16} strokeWidth={3}/> : type==='sakit'?<AlertCircle size={16} strokeWidth={3}/> : <X size={16} strokeWidth={3}/>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-slate-800">
              <div className={`p-4 text-white flex justify-between items-center ${modal.type === 'sakit' ? 'bg-orange-500' : 'bg-red-500'}`}>
                 <h3 className="font-bold flex items-center gap-2">
                    {modal.type === 'sakit' ? <AlertCircle size={20}/> : <X size={20}/>}
                    {modal.type === 'sakit' ? 'Keterangan Sakit' : 'Keterangan Alpha'}
                 </h3>
                 <button onClick={()=>setModal({...modal, show:false})} className="text-white/80 hover:text-white"><X size={20}/></button>
              </div>
              <div className="p-5">
                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Catatan untuk <span className="font-bold text-slate-800 dark:text-white">{modal.name}</span>:</p>
                 <textarea autoFocus placeholder="Tulis keterangan..." className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none" value={noteInput} onChange={e => setNoteInput(e.target.value)} />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800">
                 <button onClick={()=>setModal({...modal, show:false})} className="px-4 py-2 text-slate-500 dark:text-slate-400 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition">Batal</button>
                 <button onClick={saveNote} className="px-6 py-2 bg-slate-800 dark:bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-black dark:hover:bg-indigo-700 transition shadow-lg">Simpan</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}