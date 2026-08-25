import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Users, CheckCircle2, Clock, Frown, HelpCircle, 
  ChevronRight, ChevronDown, Calendar, Bell, LogOut, Menu,
  X, Lock, UserX
} from 'lucide-react';

export default function MainDashboard({ 
  user = { name: 'Admin TU', role: 'admin', assignedClass: 'ALL' }, 
  students = [], 
  attendance = [], 
  setActiveMenu = () => {}, 
  onNavigateToAbsensi = () => {},
  onLogout = () => {},
  onToggleSidebar = () => {}
}) {
  const isTeacher = user?.role === 'teacher';
  const teacherClass = (user?.assignedClass || 'Kelas A').replace('TK ', 'Kelas ');

  const dateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // Profile Header Dropdown
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

  // 1. Filter Siswa Berdasarkan Hak Akses User
  const displayStudents = useMemo(() => {
    if (isTeacher) {
      return students.filter(s => (s.class || '').replace('TK ', 'Kelas ') === teacherClass);
    }
    return students;
  }, [students, isTeacher, teacherClass]);

  const totalAnak = displayStudents.length;
  const studentIdSet = useMemo(() => new Set(displayStudents.map(s => String(s.id))), [displayStudents]);

  // 2. Kalkulasi Status Terkini Siswa (H-I-S-A)
  const studentStatusMap = useMemo(() => {
    const map = {};
    displayStudents.forEach(s => {
      const logs = attendance.filter(a => String(a.studentId) === String(s.id));
      const latest = logs.length > 0 ? logs[logs.length - 1] : null;
      map[String(s.id)] = (latest?.status || 'belum').toLowerCase().trim();
    });
    return map;
  }, [displayStudents, attendance]);

  let countHadir = 0, countIzin = 0, countSakit = 0, countAlpa = 0;
  Object.values(studentStatusMap).forEach(st => {
    if (st === 'hadir') countHadir++;
    else if (st === 'izin') countIzin++;
    else if (st === 'sakit') countSakit++;
    else if (st === 'alpa' || st === 'belum' || !st) countAlpa++;
  });

  const pctHadir = totalAnak > 0 ? ((countHadir / totalAnak) * 100).toFixed(1) : '0.0';
  const pctIzin = totalAnak > 0 ? ((countIzin / totalAnak) * 100).toFixed(1) : '0.0';
  const pctSakit = totalAnak > 0 ? ((countSakit / totalAnak) * 100).toFixed(1) : '0.0';
  const pctAlpa = totalAnak > 0 ? ((countAlpa / totalAnak) * 100).toFixed(1) : '0.0';

  // Segmen Donut Chart (0 - 100)
  const degHadir = totalAnak > 0 ? (countHadir / totalAnak) * 100 : 0;
  const degIzin = totalAnak > 0 ? (countIzin / totalAnak) * 100 : 0;
  const degSakit = totalAnak > 0 ? (countSakit / totalAnak) * 100 : 0;
  const degAlpa = totalAnak > 0 ? (countAlpa / totalAnak) * 100 : 100;

  // 3. Rekap Kehadiran per Kelas
  const classBreakdown = useMemo(() => {
    const classes = ['Kelas A', 'Kelas B', 'Kelas C'];
    return classes.map(clsName => {
      const sInClass = students.filter(s => (s.class || '').replace('TK ', 'Kelas ') === clsName);
      const totalInClass = sInClass.length;

      let hadirInClass = 0;
      sInClass.forEach(s => {
        const logs = attendance.filter(a => String(a.studentId) === String(s.id));
        const latest = logs.length > 0 ? logs[logs.length - 1] : null;
        if ((latest?.status || '').toLowerCase().trim() === 'hadir') {
          hadirInClass++;
        }
      });

      const pct = totalInClass > 0 ? ((hadirInClass / totalInClass) * 100).toFixed(1) : '0.0';

      return {
        name: clsName,
        code: clsName.replace('Kelas ', ''),
        total: totalInClass,
        hadir: hadirInClass,
        pct: pct.endsWith('.0') ? pct.replace('.0', '') : pct,
        isAccessible: !isTeacher || teacherClass === clsName
      };
    });
  }, [students, attendance, isTeacher, teacherClass]);

  // 4. Riwayat Presensi Terbaru
  const recentList = useMemo(() => {
    return [...attendance]
      .filter(a => studentIdSet.has(String(a.studentId)))
      .slice(-4)
      .reverse()
      .map((a, i) => {
        const s = students.find(item => String(item.id) === String(a.studentId));
        const cleanSt = (a.status || 'alpa').toLowerCase().trim();
        return {
          id: a.id || i,
          name: s?.name || 'Siswa',
          photo: s?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s?.name || 'Siswa'}`,
          text: `${s?.name || 'Siswa'} ditandai ${cleanSt}`,
          sub: `${s?.class || teacherClass} • ${a.date || 'Hari Ini'}`,
          status: cleanSt
        };
      });
  }, [attendance, studentIdSet, students, teacherClass]);

  return (
    <div className="space-y-5 w-full font-sans pb-10">
      
      {/* 1. TOP NAVBAR HEADER */}
      <header className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between transition-all">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition"
        >
          <Menu size={22} />
        </button>

        {/* Dropdown Container */}
        <div className="relative inline-block ml-auto" ref={profileRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
          >
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
              alt={user?.name || 'User'} 
              className="w-8 h-8 rounded-full bg-indigo-100 border border-slate-200 dark:border-slate-700 object-cover"
            />
            <div className="hidden sm:block pr-1">
              <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 font-medium">
                {user?.role === 'teacher' ? `Wali ${user.assignedClass}` : user?.role === 'kepsek' ? 'Kepala Sekolah' : 'Admin TU'}
              </p>
            </div>
            <ChevronDown size={14} className="text-slate-400 ml-0.5" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 sm:hidden">
                <p className="text-xs font-bold text-slate-800 dark:text-white">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400">{user?.email || 'User'}</p>
              </div>
              <button 
                onClick={() => { setProfileOpen(false); onLogout(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left"
              >
                <LogOut size={16} className="text-red-600 shrink-0" />
                <span>Keluar Akun</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. TITLE BAR */}
      <div className="w-full pt-1">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Selamat pagi, {user?.name || 'Guru'}! 👋
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
          {dateFormatted} {isTeacher && `• Fokus Rombel: ${teacherClass}`}
        </p>
      </div>

      {/* 3. 5 KARTU STATISTIK RINGKASAN */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full">
        
        {/* Total Anak */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Anak</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{totalAnak}</p>
              <p className="text-[11px] text-slate-400 font-medium">anak</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveMenu('data-anak')}
            className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 pt-1 transition text-left"
          >
            Lihat semua anak <ChevronRight size={13} />
          </button>
        </div>

        {/* Hadir Hari Ini */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-200 dark:shadow-none shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Hadir Hari Ini</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{countHadir}</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">anak ({pctHadir}%)</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigateToAbsensi(isTeacher ? teacherClass : 'ALL', 'hadir')}
            className="text-[11px] font-bold text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 pt-1 transition text-left"
          >
            Lihat detail <ChevronRight size={13} />
          </button>
        </div>

        {/* Izin Hari Ini */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200 dark:shadow-none shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Izin Hari Ini</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{countIzin}</p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">anak ({pctIzin}%)</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigateToAbsensi(isTeacher ? teacherClass : 'ALL', 'izin')}
            className="text-[11px] font-bold text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 pt-1 transition text-left"
          >
            Lihat detail <ChevronRight size={13} />
          </button>
        </div>

        {/* Sakit Hari Ini */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-200 dark:shadow-none shrink-0">
              <Frown size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Sakit Hari Ini</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{countSakit}</p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">anak ({pctSakit}%)</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigateToAbsensi(isTeacher ? teacherClass : 'ALL', 'sakit')}
            className="text-[11px] font-bold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 pt-1 transition text-left"
          >
            Lihat detail <ChevronRight size={13} />
          </button>
        </div>

        {/* Alpa / Belum Absen */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-700 text-white flex items-center justify-center shadow-md shadow-slate-300 dark:shadow-none shrink-0">
              <UserX size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Alpa / Belum</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{countAlpa}</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold">anak ({pctAlpa}%)</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigateToAbsensi(isTeacher ? teacherClass : 'ALL', 'alpa')}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center gap-1 pt-1 transition text-left"
          >
            Lihat detail <ChevronRight size={13} />
          </button>
        </div>

      </div>

      {/* 4. ROW 2: DONUT CHART & ABSENSI PER KELAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        
        {/* KARTU KIRI: RINGKASAN ABSENSI */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">
            Ringkasan Absensi {isTeacher ? `(${teacherClass})` : 'Hari Ini'}
          </h3>

          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-6 my-auto">
            
            {/* SVG DONUT CHART */}
            <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="4.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {degHadir > 0 && (
                  <path
                    stroke="#10B981"
                    strokeWidth="4.5"
                    strokeDasharray={`${degHadir}, 100`}
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                )}
                {degIzin > 0 && (
                  <path
                    stroke="#F59E0B"
                    strokeWidth="4.5"
                    strokeDasharray={`${degIzin}, 100`}
                    strokeDashoffset={`-${degHadir}`}
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                )}
                {degSakit > 0 && (
                  <path
                    stroke="#F43F5E"
                    strokeWidth="4.5"
                    strokeDasharray={`${degSakit}, 100`}
                    strokeDashoffset={`-${degHadir + degIzin}`}
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                )}
                {degAlpa > 0 && (
                  <path
                    stroke="#334155"
                    strokeWidth="4.5"
                    strokeDasharray={`${degAlpa}, 100`}
                    strokeDashoffset={`-${degHadir + degIzin + degSakit}`}
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none">{totalAnak}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">{isTeacher ? teacherClass : 'Total Anak'}</p>
              </div>
            </div>

            {/* Legend Samping Donut */}
            <div className="space-y-2.5 w-full sm:w-auto text-xs">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">Hadir</span>
                <span className="font-bold text-slate-800 dark:text-white ml-auto">{countHadir} anak ({pctHadir}%)</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">Izin</span>
                <span className="font-bold text-slate-800 dark:text-white ml-auto">{countIzin} anak ({pctIzin}%)</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">Sakit</span>
                <span className="font-bold text-slate-800 dark:text-white ml-auto">{countSakit} anak ({pctSakit}%)</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700 shrink-0"></span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">Alpa / Belum</span>
                <span className="font-bold text-slate-800 dark:text-white ml-auto">{countAlpa} anak ({pctAlpa}%)</span>
              </div>
            </div>

          </div>

          <button 
            onClick={() => onNavigateToAbsensi(isTeacher ? teacherClass : 'ALL', 'ALL')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl transition shadow-md shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
          >
            <Calendar size={16} /> Buka Absensi {isTeacher ? teacherClass : 'Hari Ini'}
          </button>
        </div>

        {/* KARTU KANAN: ABSENSI PER KELAS */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Status per Kelas</h3>
            {!isTeacher && (
              <button 
                onClick={() => setActiveMenu('kelas')} 
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                Lihat semua <ChevronRight size={13} />
              </button>
            )}
          </div>

          <div className="space-y-3.5 my-auto">
            {classBreakdown.map((item, idx) => {
              const colorBg = idx === 0 ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400' :
                              idx === 1 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' :
                              'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400';

              return (
                <div 
                  key={idx} 
                  onClick={() => {
                    if (item.isAccessible) onNavigateToAbsensi(item.name, 'ALL');
                  }}
                  className={`p-3.5 rounded-2xl transition space-y-2 border ${
                    item.isAccessible 
                      ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent hover:border-slate-100 dark:hover:border-slate-800' 
                      : 'opacity-50 cursor-not-allowed bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-extrabold text-sm ${colorBg}`}>
                        {item.code}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                          {item.name}
                          {!item.isAccessible && <Lock size={12} className="text-slate-400" />}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium">{item.hadir} / {item.total} anak hadir</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">{item.pct}%</span>
                      {item.isAccessible && <ChevronRight size={14} className="text-slate-300" />}
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${item.pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 5. ROW 3: AKTIVITAS TERBARU & INFORMASI PENTING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        
        {/* AKTIVITAS TERBARU */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Aktivitas Presensi Terbaru</h3>
            <button 
              onClick={() => onNavigateToAbsensi(isTeacher ? teacherClass : 'ALL', 'ALL')} 
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
            >
              Lihat semua <ChevronRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentList.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">Belum ada riwayat absensi yang tersimpan.</p>
            ) : (
              recentList.map((item, idx) => (
                <div key={item.id || idx} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      item.status === 'hadir' ? 'bg-emerald-50 text-emerald-600' :
                      item.status === 'izin' ? 'bg-amber-50 text-amber-600' :
                      item.status === 'sakit' ? 'bg-rose-50 text-rose-600' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status === 'hadir' ? <CheckCircle2 size={16} /> :
                       item.status === 'izin' ? <Clock size={16} /> :
                       item.status === 'sakit' ? <Frown size={16} /> :
                       <UserX size={16} />}
                    </div>

                    <img 
                      src={item.photo} 
                      alt={item.name} 
                      className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 object-cover shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.text}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{item.sub}</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold shrink-0 capitalize ${
                    item.status === 'hadir' ? 'bg-emerald-50 text-emerald-600' :
                    item.status === 'izin' ? 'bg-amber-50 text-amber-600' :
                    item.status === 'sakit' ? 'bg-rose-50 text-rose-600' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* INFORMASI PENTING / PENGINGAT */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between text-center space-y-4">
          <p className="text-left text-xs font-bold text-slate-800 dark:text-white">Informasi Presensi</p>

          <div className="my-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-3xl shadow-sm">
              📋
            </div>
            
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Pengingat Guru</h4>
            <p className="text-xs text-slate-400 leading-relaxed px-2">
              Pastikan semua absensi anak {isTeacher ? `di ${teacherClass}` : ''} hari ini sudah disimpan sebelum jam pulang sekolah.
            </p>
          </div>

          <button 
            onClick={() => setGuideModalOpen(true)} 
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl transition shadow-md shadow-indigo-200 dark:shadow-none"
          >
            Lihat Panduan
          </button>
        </div>

      </div>

      {/* FOOTER COPYRIGHT */}
      <footer className="pt-4 text-center text-[11px] text-slate-400 font-medium">
        © 2026 TK Ceria. All rights reserved.
      </footer>

      {/* MODAL PANDUAN PENGGUNAAN SISTEM */}
      {guideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-800">
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <HelpCircle size={18} /> Panduan Absensi TK Ceria
              </h3>
              <button onClick={() => setGuideModalOpen(false)} className="text-white/80 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Buka Halaman Absensi</h4>
                  <p className="text-slate-400 mt-0.5">Buka menu <b>Absensi</b> untuk melihat daftar siswa di kelas Anda.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Tandai Status Kehadiran</h4>
                  <p className="text-slate-400 mt-0.5">Klik tombol <b>Hadir</b>, <b>Izin</b>, <b>Sakit</b>, atau <b>Alpa</b> pada tiap baris nama anak.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Simpan Absensi</h4>
                  <p className="text-slate-400 mt-0.5">Tekan tombol <b>Simpan Absensi</b> di bagian bawah agar data tersimpan ke laporan.</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button 
                  onClick={() => setGuideModalOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Tutup
                </button>
                <button 
                  onClick={() => { setGuideModalOpen(false); onNavigateToAbsensi(isTeacher ? teacherClass : 'ALL', 'ALL'); }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-md"
                >
                  Buka Absensi Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}