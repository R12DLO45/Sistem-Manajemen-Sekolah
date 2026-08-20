import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle2, Clock, Frown, HelpCircle, 
  MessageSquare, CheckCheck, RotateCcw, Save, X, Search, Calendar, History, Menu, LogOut, ChevronDown, UserCheck, Info
} from 'lucide-react';

export default function TeacherDashboard({ 
  user = { name: 'Guru', role: 'teacher', assignedClass: 'TK A' }, 
  students = [], 
  attendance = [], 
  onMark = () => {}, 
  onToast = () => {}, 
  onLogout = () => {},
  onToggleSidebar = () => {}
}) {
  const today = new Date().toISOString().split('T')[0];
  const dateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const [selectedClass, setSelectedClass] = useState(user.assignedClass !== 'ALL' ? user.assignedClass : 'TK A');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State Dropdown Profile
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // State Local Absensi
  const [localAttendance, setLocalAttendance] = useState(() => {
    const initialMap = {};
    students.forEach(s => {
      const existing = attendance.find(a => a.studentId === s.id && a.date === today);
      initialMap[s.id] = {
        status: existing?.status || 'belum',
        note: existing?.note || ''
      };
    });
    return initialMap;
  });

  const [noteModal, setNoteModal] = useState({ show: false, studentId: null, name: '' });
  const [tempNote, setTempNote] = useState('');

  const filteredStudents = students
    .filter(s => s.class === selectedClass)
    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const classStudents = students.filter(s => s.class === selectedClass);
  let countHadir = 0, countIzin = 0, countSakit = 0, countBelum = 0;

  classStudents.forEach(s => {
    const st = localAttendance[s.id]?.status || 'belum';
    if (st === 'hadir') countHadir++;
    else if (st === 'izin') countIzin++;
    else if (st === 'sakit') countSakit++;
    else countBelum++;
  });

  const handleStatusChange = (studentId, status) => {
    setLocalAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status: status }
    }));
  };

  const handleMarkAllHadir = () => {
    const updated = { ...localAttendance };
    classStudents.forEach(s => {
      updated[s.id] = { ...updated[s.id], status: 'hadir' };
    });
    setLocalAttendance(updated);
    if(onToast) onToast(`Semua anak ${selectedClass} ditandai HADIR`, 'success');
  };

  const handleReset = () => {
    const updated = { ...localAttendance };
    classStudents.forEach(s => {
      updated[s.id] = { status: 'belum', note: '' };
    });
    setLocalAttendance(updated);
    if(onToast) onToast(`Absensi ${selectedClass} di-reset`, 'orange');
  };

  const openNoteModal = (student) => {
    setNoteModal({ show: true, studentId: student.id, name: student.name });
    setTempNote(localAttendance[student.id]?.note || '');
  };

  const saveNote = () => {
    setLocalAttendance(prev => ({
      ...prev,
      [noteModal.studentId]: { ...prev[noteModal.studentId], note: tempNote }
    }));
    setNoteModal({ show: false, studentId: null, name: '' });
  };

  const handleSaveAll = () => {
    classStudents.forEach(s => {
      const item = localAttendance[s.id];
      if (item && item.status !== 'belum') {
        onMark(s.id, item.status, item.note);
      }
    });
    if(onToast) onToast(`Absensi ${selectedClass} berhasil disimpan!`, 'success');
  };

  return (
    <div className="space-y-5 w-full">
      
      {/* 1. TOP NAVBAR NAiK DIKIT & SIMETRIS */}
      <header className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between transition-all">
        
        {/* Tombol Hamburger Khusus Layar HP */}
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition"
          title="Buka Menu Navigasi"
        >
          <Menu size={22} />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative ml-auto" ref={profileRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
          >
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
              alt={user.name} 
              className="w-8 h-8 rounded-full bg-indigo-100 border border-slate-200 dark:border-slate-700 object-cover"
            />
            <div className="hidden sm:block pr-1">
              <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-medium">
                {user.role === 'teacher' ? `Wali ${user.assignedClass}` : user.role === 'kepsek' ? 'Kepala Sekolah' : 'Admin TU'}
              </p>
            </div>
            <ChevronDown size={14} className="text-slate-400 ml-0.5" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 sm:hidden">
                <p className="text-xs font-bold text-slate-800 dark:text-white">{user.name}</p>
                <p className="text-[10px] text-slate-400">{user.email || 'Guru TK'}</p>
              </div>
              
              <button 
                onClick={() => { setProfileOpen(false); onLogout(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left"
              >
                <LogOut size={16} /> Keluar dari Akun
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. TITLE BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full pt-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Absensi Hari Ini</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Catat kehadiran anak untuk hari ini.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer">
            <Calendar size={14} className="text-slate-400" />
            <span>{dateFormatted}</span>
            <span className="text-slate-400 text-[10px] ml-1">∨</span>
          </div>

          <button className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-2xl text-xs font-bold transition shadow-md shadow-indigo-200 dark:shadow-none shrink-0">
            <History size={14} /> Riwayat
          </button>
        </div>
      </div>

      {/* 3. WIDGET CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <UserCheck size={16} className="text-indigo-600" /> Pilih Kelas
          </p>
          <div className="relative">
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="TK A">Kelas A</option>
              <option value="TK B">Kelas B</option>
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">∨</span>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Ringkasan Kehadiran</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100/80 dark:border-emerald-900/40 rounded-2xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">{countHadir}</p>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Hadir</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/40 border border-amber-100/80 dark:border-amber-900/40 rounded-2xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-100/80 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">{countIzin}</p>
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Izin</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50/50 dark:bg-rose-950/40 border border-rose-100/80 dark:border-rose-900/40 rounded-2xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-100/80 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Frown size={16} />
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">{countSakit}</p>
                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400">Sakit</p>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100/80 dark:border-indigo-900/40 rounded-2xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-100/80 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <HelpCircle size={16} />
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">{countBelum}</p>
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Belum Absen</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Clock size={16} className="text-emerald-600" /> Aksi Cepat
          </p>
          <div className="space-y-2">
            <button onClick={handleMarkAllHadir} className="w-full py-2 px-3 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2 transition">
              <CheckCheck size={14} /> Tandai Semua Hadir
            </button>
            <button onClick={handleReset} className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition">
              <RotateCcw size={14} /> Reset Absensi
            </button>
          </div>
        </div>
      </div>

      {/* 4. TABEL ABSENSI SISWA */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden w-full">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama anak..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-indigo-900/60 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 w-12 text-center">No.</th>
                <th className="px-4 py-4 w-16 text-center">Foto</th>
                <th className="px-6 py-4">Nama Anak</th>
                <th className="px-6 py-4 text-center">Status Kehadiran</th>
                <th className="px-6 py-4 text-center">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400 italic">Anak tidak ditemukan di {selectedClass}.</td>
                </tr>
              ) : (
                filteredStudents.map((s, index) => {
                  const currentStatus = localAttendance[s.id]?.status || 'belum';
                  const currentNote = localAttendance[s.id]?.note || '';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-bold text-slate-400 text-center">{index + 1}</td>
                      <td className="px-4 py-4 text-center">
                        <img src={s.photo} className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 object-cover mx-auto"/>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white text-sm">
                        {s.name}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleStatusChange(s.id, 'hadir')}
                            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border text-xs ${
                              currentStatus === 'hadir' 
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200 dark:shadow-none' 
                                : 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50'
                            }`}
                          >
                            <CheckCircle2 size={13} /> Hadir
                          </button>

                          <button 
                            onClick={() => handleStatusChange(s.id, 'izin')}
                            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border text-xs ${
                              currentStatus === 'izin' 
                                ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200 dark:shadow-none' 
                                : 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-50'
                            }`}
                          >
                            <Clock size={13} /> Izin
                          </button>

                          <button 
                            onClick={() => handleStatusChange(s.id, 'sakit')}
                            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border text-xs ${
                              currentStatus === 'sakit' 
                                ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200 dark:shadow-none' 
                                : 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-50'
                            }`}
                          >
                            <Frown size={13} /> Sakit
                          </button>

                          <button 
                            onClick={() => handleStatusChange(s.id, 'belum')}
                            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border text-xs ${
                              currentStatus === 'belum' 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-none' 
                                : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50'
                            }`}
                          >
                            <HelpCircle size={13} /> Belum Absen
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => openNoteModal(s)}
                          className={`p-2 rounded-xl border transition relative inline-flex items-center justify-center ${
                            currentNote 
                              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-600' 
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600'
                          }`}
                          title={currentNote ? `Catatan: ${currentNote}` : 'Tambah Catatan'}
                        >
                          <MessageSquare size={15} />
                          {currentNote && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full"></span>}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

       <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2.5">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full max-w-md">
            <button 
              onClick={handleSaveAll} 
              className="w-full py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition flex items-center justify-center gap-2"
            >
              <Save size={16} /> Simpan Absensi
            </button>
            <button 
              onClick={handleReset} 
              className="w-full sm:w-36 py-2.5 sm:py-3 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1.5"
            >
              <X size={16} /> Batal
            </button>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5">
            <Info size={13} className="text-slate-400" /> Pastikan semua status kehadiran sudah benar sebelum disimpan.
          </p>
        </div>
      </div>

      {/* Modal Input Catatan */}
      {noteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border dark:border-slate-800">
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <MessageSquare size={18} /> Catatan untuk {noteModal.name}
              </h3>
              <button onClick={() => setNoteModal({ show: false, studentId: null, name: '' })} className="text-white/80 hover:text-white"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">Tuliskan alasan izin/sakit atau catatan perkembangan anak hari ini:</p>
              <textarea 
                autoFocus 
                placeholder="Contoh: Demam ringan sejak pagi..." 
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none" 
                value={tempNote} 
                onChange={e => setTempNote(e.target.value)} 
              />
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setNoteModal({ show: false, studentId: null, name: '' })} className="px-4 py-2 text-slate-500 text-xs font-bold hover:bg-slate-200 rounded-xl transition">Batal</button>
              <button onClick={saveNote} className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-md">Simpan Catatan</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}