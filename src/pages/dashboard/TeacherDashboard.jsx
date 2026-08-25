import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Check, Clock, Frown, UserX, 
  Search, Save, X, RotateCcw, History, 
  ChevronDown, MessageSquare, Calendar, Menu, LogOut, Users,
  ArrowRight, FileText
} from 'lucide-react';

export default function TeacherDashboard({ 
  user = { name: 'Bu Sari', role: 'teacher', assignedClass: 'Kelas A' }, 
  students = [], 
  attendance = [], 
  selectedClass: propSelectedClass = 'Kelas A',
  onClassChange = () => {},
  onSaveBatch = () => {}, 
  onToast = () => {},
  onLogout = () => {},
  onToggleSidebar = () => {},
  setActiveMenu = () => {}
}) {
  const isTeacher = user?.role === 'teacher';
  const teacherClass = (user?.assignedClass || 'Kelas A').replace('TK ', 'Kelas ');

  const [selectedClass, setSelectedClass] = useState(isTeacher ? teacherClass : (propSelectedClass || 'Kelas A'));
  const [searchQuery, setSearchQuery] = useState('');
  
  const dateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const todayIso = new Date().toISOString().split('T')[0];

  const [noteModal, setNoteModal] = useState({ show: false, studentId: null, studentName: '', noteText: '' });
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historySelectedDate, setHistorySelectedDate] = useState(todayIso);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isTeacher) setSelectedClass(teacherClass);
    else if (propSelectedClass && propSelectedClass !== 'ALL') setSelectedClass(propSelectedClass);
  }, [isTeacher, teacherClass, propSelectedClass]);

  const classStudents = useMemo(() => {
    const list = Array.isArray(students) ? students : [];
    if (isTeacher) return list.filter(s => (s?.class || '').replace('TK ', 'Kelas ') === teacherClass);
    if (selectedClass === 'ALL' || selectedClass === 'Semua Kelas') return list;
    return list.filter(s => (s?.class || '').replace('TK ', 'Kelas ') === selectedClass);
  }, [students, isTeacher, teacherClass, selectedClass]);

  const [draftRecords, setDraftRecords] = useState({});

  useEffect(() => {
    const initialMap = {};
    const safeAttendance = Array.isArray(attendance) ? attendance : [];

    classStudents.forEach(s => {
      const existing = safeAttendance.find(a => String(a?.studentId) === String(s?.id) && a?.date === todayIso);
      initialMap[String(s?.id)] = {
        studentId: s?.id,
        status: existing ? String(existing.status).toLowerCase().trim() : '',
        note: existing?.note || ''
      };
    });

    setDraftRecords(initialMap);
  }, [classStudents, attendance, todayIso]);

  const handleStatusChange = (studentId, status) => {
    setDraftRecords(prev => ({ ...prev, [String(studentId)]: { ...prev[String(studentId)], studentId, status } }));
  };

  const handleMarkAllHadir = () => {
    setDraftRecords(prev => {
      const updated = { ...prev };
      classStudents.forEach(s => { updated[String(s.id)] = { ...updated[String(s.id)], studentId: s.id, status: 'hadir' }; });
      return updated;
    });
    if (onToast) onToast('Semua anak ditandai Hadir!', 'success');
  };

  const handleResetAbsensi = () => {
    setDraftRecords(prev => {
      const updated = { ...prev };
      classStudents.forEach(s => { updated[String(s.id)] = { ...updated[String(s.id)], studentId: s.id, status: '', note: '' }; });
      return updated;
    });
    if (onToast) onToast('Status absensi berhasil direset (Netral)!', 'info');
  };

  const handleSaveNote = () => {
    if (noteModal.studentId) {
      setDraftRecords(prev => ({ ...prev, [String(noteModal.studentId)]: { ...prev[String(noteModal.studentId)], note: noteModal.noteText } }));
      setNoteModal({ show: false, studentId: null, studentName: '', noteText: '' });
      if (onToast) onToast('Catatan disimpan', 'success');
    }
  };

  const handleSaveAll = () => {
    const list = Object.values(draftRecords);
    if (list.length === 0) return;
    onSaveBatch(list);
  };

  let countHadir = 0, countIzin = 0, countSakit = 0, countAlpa = 0;
  Object.values(draftRecords).forEach(r => {
    const st = r?.status || '';
    if (st === 'hadir') countHadir++;
    else if (st === 'izin') countIzin++;
    else if (st === 'sakit') countSakit++;
    else if (st === 'alpa' || st === 'belum') countAlpa++;
  });

  const displayedStudents = classStudents.filter(s => (s?.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

  const historyLogs = useMemo(() => {
    const safeAttendance = Array.isArray(attendance) ? attendance : [];
    return classStudents.map(student => {
      const log = safeAttendance.find(a => String(a.studentId) === String(student.id) && a.date === historySelectedDate);
      return {
        ...student,
        status: log ? String(log.status).toLowerCase().trim() : 'alpa',
        note: log?.note || '-'
      };
    });
  }, [classStudents, attendance, historySelectedDate]);

  let historyHadir = 0, historyIzin = 0, historySakit = 0, historyAlpa = 0;
  historyLogs.forEach(item => {
    if (item.status === 'hadir') historyHadir++;
    else if (item.status === 'izin') historyIzin++;
    else if (item.status === 'sakit') historySakit++;
    else historyAlpa++;
  });

  return (
    <div className="space-y-5 w-full font-sans pb-16">
      
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between transition-all">
        <button onClick={onToggleSidebar} className="md:hidden p-2 text-slate-600 hover:text-indigo-600 rounded-xl bg-white shadow-sm transition">
          <Menu size={22} />
        </button>

        <div className="relative ml-auto" ref={profileRef}>
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2.5 p-1 rounded-2xl bg-white shadow-sm hover:bg-slate-100 transition text-left">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} alt="Avatar" className="w-8 h-8 rounded-full bg-indigo-100 object-cover" />
            <div className="hidden sm:block pr-1">
              <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 font-medium">{isTeacher ? `Wali ${user.assignedClass}` : 'Admin TU'}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 ml-0.5" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
              <button onClick={() => { setProfileOpen(false); onLogout(); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition text-left">
                <LogOut size={16} /> Keluar Akun
              </button>
            </div>
          )}
        </div>
      </header>

      {/* TITLE & DATE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Absensi Hari Ini</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Catat kehadiran anak untuk hari ini (Hadir, Izin, Sakit, Alpa).</p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 shadow-sm">
            <Calendar size={15} className="text-slate-400" />
            <span>{dateFormatted}</span>
          </div>

          <button 
            type="button"
            onClick={() => setHistoryModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-md"
          >
            <History size={15} /> <span>Riwayat Absensi</span>
          </button>
        </div>
      </div>

      {/* 3 PANEL HEADER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* PILIH KELAS */}
        <div className="lg:col-span-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span className="text-indigo-600"><Users size={16}/></span> <span>Pilih Kelas</span>
          </div>
          <div className="relative mt-auto">
            <select
              value={selectedClass}
              disabled={isTeacher}
              onChange={(e) => { setSelectedClass(e.target.value); onClassChange(e.target.value); }}
              className={`w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-800 outline-none appearance-none cursor-pointer ${isTeacher ? 'opacity-80 cursor-not-allowed bg-slate-100' : ''}`}
            >
              {!isTeacher && <option value="ALL">Semua Kelas</option>}
              <option value="Kelas A">Kelas A</option>
              <option value="Kelas B">Kelas B</option>
              <option value="Kelas C">Kelas C</option>
            </select>
            <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* RINGKASAN H-I-S-A */}
        <div className="lg:col-span-6 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="text-xs font-bold text-slate-700">Ringkasan Kehadiran</div>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
              <div className="flex items-center justify-center gap-1.5"><span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span><span className="text-2xl font-black text-emerald-600">{countHadir}</span></div>
              <p className="text-[10px] font-bold text-emerald-700 mt-1">Hadir</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl">
              <div className="flex items-center justify-center gap-1.5"><span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">⏱</span><span className="text-2xl font-black text-amber-600">{countIzin}</span></div>
              <p className="text-[10px] font-bold text-amber-700 mt-1">Izin</p>
            </div>
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl">
              <div className="flex items-center justify-center gap-1.5"><span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">☹</span><span className="text-2xl font-black text-rose-600">{countSakit}</span></div>
              <p className="text-[10px] font-bold text-rose-700 mt-1">Sakit</p>
            </div>
            <div className="bg-slate-100 border border-slate-200 p-3 rounded-2xl">
              <div className="flex items-center justify-center gap-1.5"><span className="w-5 h-5 rounded-full bg-slate-500 text-white flex items-center justify-center text-[10px] font-bold">✕</span><span className="text-2xl font-black text-slate-700">{countAlpa}</span></div>
              <p className="text-[10px] font-bold text-slate-600 mt-1">Alpa / Tanpa Ket.</p>
            </div>
          </div>
        </div>

        {/* AKSI CEPAT */}
        <div className="lg:col-span-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3 flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700"><Clock size={14} className="text-slate-400" /><span>Aksi Cepat</span></div>
          <div className="space-y-2 mt-auto">
            <button onClick={handleMarkAllHadir} className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
              <Check size={14} /> Tandai Semua Hadir
            </button>
            <button onClick={handleResetAbsensi} className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
              <RotateCcw size={13} /> Reset Semua Status
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Cari nama anak..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
        </div>
      </div>

      {/* TABEL PRESENSI (H-I-S-A) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 w-12 text-center">No.</th>
                <th className="px-4 py-4 w-16 text-center">Foto</th>
                <th className="px-6 py-4">Nama Anak</th>
                <th className="px-6 py-4 text-center">Status Kehadiran</th>
                <th className="px-6 py-4 text-center w-24">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayedStudents.map((s, index) => {
                const cur = draftRecords[String(s.id)]?.status || '';
                const hasNote = Boolean(draftRecords[String(s.id)]?.note);

                return (
                  <tr key={s.id || index} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-center font-bold text-slate-400">{index + 1}</td>
                    <td className="px-4 py-4 text-center"><img src={s.photo} alt={s.name} className="w-9 h-9 rounded-full object-cover mx-auto" /></td>
                    <td className="px-6 py-4 font-bold text-slate-800">{s.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* HADIR */}
                        <button 
                          onClick={() => handleStatusChange(s.id, 'hadir')} 
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition ${
                            cur === 'hadir' 
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs' 
                              : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-200 hover:text-emerald-500'
                          }`}
                        >
                          <Check size={14}/> Hadir
                        </button>

                        {/* IZIN */}
                        <button 
                          onClick={() => handleStatusChange(s.id, 'izin')} 
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition ${
                            cur === 'izin' 
                              ? 'bg-amber-500 text-white border-amber-500 shadow-xs' 
                              : 'bg-white text-slate-400 border-slate-200 hover:border-amber-200 hover:text-amber-500'
                          }`}
                        >
                          <Clock size={14}/> Izin
                        </button>

                        {/* SAKIT */}
                        <button 
                          onClick={() => handleStatusChange(s.id, 'sakit')} 
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition ${
                            cur === 'sakit' 
                              ? 'bg-rose-500 text-white border-rose-500 shadow-xs' 
                              : 'bg-white text-slate-400 border-slate-200 hover:border-rose-200 hover:text-rose-500'
                          }`}
                        >
                          <Frown size={14}/> Sakit
                        </button>

                        {/* ALPA / TANPA KETERANGAN */}
                        <button 
                          onClick={() => handleStatusChange(s.id, 'alpa')} 
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition ${
                            cur === 'alpa' 
                              ? 'bg-slate-700 text-white border-slate-700 shadow-xs' 
                              : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-700'
                          }`}
                        >
                          <UserX size={14}/> Alpa
                        </button>

                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => setNoteModal({ show: true, studentId: s.id, studentName: s.name, noteText: draftRecords[String(s.id)]?.note || '' })} className={`p-2 rounded-xl border ${hasNote ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}>
                        <MessageSquare size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FLOATING BOTTOM BAR */}
      <div className="flex flex-col items-center justify-center space-y-2 pt-4">
        <div className="flex items-center gap-3">
          <button onClick={handleSaveAll} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg transition flex items-center gap-2">
            <Save size={18} /> Simpan Absensi
          </button>
          <button onClick={handleResetAbsensi} className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-sm rounded-2xl transition flex items-center gap-2">
            <X size={18} /> Batal
          </button>
        </div>
        <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">ⓘ Pastikan semua status kehadiran sudah benar sebelum disimpan.</p>
      </div>

      {/* MODAL CATATAN */}
      {noteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-3">
            <h3 className="font-bold text-xs">Catatan untuk {noteModal.studentName}</h3>
            <textarea rows={3} placeholder="Misal: Surat dokter menyusul, tanpa kabar..." value={noteModal.noteText} onChange={(e) => setNoteModal({ ...noteModal, noteText: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setNoteModal({ show: false, studentId: null, studentName: '', noteText: '' })} className="px-3 py-1.5 text-xs font-bold text-slate-500">Tutup</button>
              <button onClick={handleSaveNote} className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RIWAYAT ABSENSI */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border dark:border-slate-800 flex flex-col max-h-[85vh]">
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={18} />
                <h3 className="font-bold text-sm">Riwayat Presensi - {selectedClass === 'ALL' ? 'Semua Kelas' : selectedClass}</h3>
              </div>
              <button onClick={() => setHistoryModalOpen(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="font-bold text-slate-600 shrink-0">Pilih Tanggal:</span>
                <input 
                  type="date"
                  value={historySelectedDate}
                  onChange={(e) => setHistorySelectedDate(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                />
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700">{historyHadir} Hadir</span>
                <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-700">{historyIzin} Izin</span>
                <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700">{historySakit} Sakit</span>
                <span className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-700">{historyAlpa} Alpa</span>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2.5 w-10 text-center">No.</th>
                    <th className="px-4 py-2.5">Nama Siswa</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                    <th className="px-4 py-2.5">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyLogs.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-800">
                        {item.name}
                        <span className="block text-[10px] text-slate-400 font-normal">{item.class}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                          item.status === 'hadir' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                          item.status === 'izin' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          item.status === 'sakit' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                          'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 italic text-[11px]">{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setHistoryModalOpen(false);
                  if (setActiveMenu) setActiveMenu('laporan');
                }}
                className="text-indigo-600 hover:text-indigo-700 font-bold text-xs flex items-center gap-1"
              >
                <FileText size={14} /> Buka Laporan Lengkap & Cetak PDF <ArrowRight size={12} />
              </button>
              <button onClick={() => setHistoryModalOpen(false)} className="px-4 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs">Tutup</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}