import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  FileText, Printer, Calendar, Clock, 
  ChevronDown, Menu, LogOut, ChevronRight, 
  CheckCircle2, Frown, HelpCircle, ShieldCheck, Users,
  Search, Eye, X, CalendarDays, Lock, UserX
} from 'lucide-react';

export default function ReportPage({ 
  user = { name: 'Bu Sari', role: 'teacher', assignedClass: 'Kelas A' }, 
  students = [], 
  attendance = [], 
  onLogout = () => {},
  onToggleSidebar = () => {},
  onToast = () => {}
}) {
  const isTeacher = user?.role === 'teacher';
  const teacherClass = (user?.assignedClass || 'Kelas A').replace('TK ', 'Kelas ');

  const [activeReportTab, setActiveReportTab] = useState('ringkasan');
  const [selectedRange, setSelectedRange] = useState('all');
  const [chartRange, setChartRange] = useState('14');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClassTab, setFilterClassTab] = useState(isTeacher ? teacherClass : 'ALL');

  // Modal Detail Siswa
  const [detailModal, setDetailModal] = useState({ show: false, student: null, logs: [] });

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

  const todayIso = new Date().toISOString().split('T')[0];
  const dateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // 1. ISOLASI SISWA SESUAI ROLE (GURU HANYA AKSES KELASNYA)
  const safeStudents = useMemo(() => {
    const raw = Array.isArray(students) ? students : [];
    if (isTeacher) {
      return raw.filter(s => (s?.class || '').replace('TK ', 'Kelas ') === teacherClass);
    }
    return raw;
  }, [students, isTeacher, teacherClass]);

  const studentIdSet = useMemo(() => new Set(safeStudents.map(s => String(s.id))), [safeStudents]);
  const totalAnak = safeStudents.length;

  // 2. FILTER LOG ABSENSI
  const filteredAttendance = useMemo(() => {
    const rawAtt = Array.isArray(attendance) ? attendance : [];
    return rawAtt
      .filter(a => a && studentIdSet.has(String(a.studentId)))
      .filter(a => {
        if (!a.date) return true;
        if (selectedRange === 'today') return a.date === todayIso;
        if (selectedRange === 'week') {
          const d = new Date(a.date);
          const now = new Date();
          return Math.abs(now - d) / (1000 * 60 * 60 * 24) <= 7;
        }
        if (selectedRange === 'month') {
          const d = new Date(a.date);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        return true;
      });
  }, [attendance, studentIdSet, selectedRange, todayIso]);

  // 3. STATISTIK UTAMA
  const stats = useMemo(() => {
    let hadir = 0, izin = 0, sakit = 0, alpa = 0;

    filteredAttendance.forEach(a => {
      const st = String(a.status || 'alpa').toLowerCase().trim();
      if (st === 'hadir') hadir++;
      else if (st === 'izin') izin++;
      else if (st === 'sakit') sakit++;
      else if (st === 'alpa' || st === 'belum') alpa++;
    });

    const totalTerdata = hadir + izin + sakit + alpa;
    const grandTotal = totalTerdata || totalAnak;

    const pctHadir = grandTotal > 0 ? ((hadir / grandTotal) * 100).toFixed(1) : '0.0';
    const pctIzin = grandTotal > 0 ? ((izin / grandTotal) * 100).toFixed(1) : '0.0';
    const pctSakit = grandTotal > 0 ? ((sakit / grandTotal) * 100).toFixed(1) : '0.0';
    const pctAlpa = grandTotal > 0 ? ((alpa / grandTotal) * 100).toFixed(1) : '0.0';

    return { hadir, izin, sakit, alpa, pctHadir, pctIzin, pctSakit, pctAlpa, grandTotal };
  }, [filteredAttendance, totalAnak]);

  // 4. REKAP DATA PER KELAS
  const classList = isTeacher ? [teacherClass] : ['Kelas A', 'Kelas B', 'Kelas C'];
  const classBreakdown = useMemo(() => {
    return classList.map(clsName => {
      const classStudents = safeStudents.filter(s => (s?.class || '').replace('TK ', 'Kelas ') === clsName);
      const sIds = new Set(classStudents.map(s => String(s.id)));
      const classLogs = filteredAttendance.filter(a => sIds.has(String(a.studentId)));

      let hadir = 0, izin = 0, sakit = 0, alpa = 0;
      classLogs.forEach(l => {
        const st = String(l.status || 'alpa').toLowerCase().trim();
        if (st === 'hadir') hadir++;
        else if (st === 'izin') izin++;
        else if (st === 'sakit') sakit++;
        else if (st === 'alpa' || st === 'belum') alpa++;
      });

      const totalSiswaKelas = classStudents.length;
      const allEvents = hadir + izin + sakit + alpa;
      const pct = allEvents > 0 ? ((hadir / allEvents) * 100).toFixed(1) : '0.0';

      return {
        name: clsName,
        total: totalSiswaKelas,
        hadir,
        izin,
        sakit,
        alpa,
        students: classStudents,
        pct: pct.endsWith('.0') ? pct.replace('.0', '') : pct,
        sessionStr: `${hadir}/${allEvents || totalSiswaKelas}`
      };
    });
  }, [safeStudents, filteredAttendance, classList]);

  // 5. TITIK GRAFIK
  const chartPoints = useMemo(() => {
    const daysCount = parseInt(chartRange, 10) || 14;
    return Array.from({ length: daysCount }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (daysCount - 1 - i));
      const iso = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

      const dayLogs = filteredAttendance.filter(a => a.date === iso);
      const hadir = dayLogs.filter(a => String(a.status).toLowerCase().trim() === 'hadir').length;
      const izin = dayLogs.filter(a => String(a.status).toLowerCase().trim() === 'izin').length;
      const sakit = dayLogs.filter(a => String(a.status).toLowerCase().trim() === 'sakit').length;
      const alpa = dayLogs.filter(a => {
        const st = String(a.status).toLowerCase().trim();
        return st === 'alpa' || st === 'belum';
      }).length;

      return { label, iso, hadir, izin, sakit, alpa };
    });
  }, [filteredAttendance, chartRange]);

  // 6. DATA REKAP SISWA
  const studentReports = useMemo(() => {
    return safeStudents
      .filter(s => {
        if (isTeacher) return true;
        const matchClass = filterClassTab === 'ALL' || (s.class || '').replace('TK ', 'Kelas ') === filterClassTab;
        return matchClass;
      })
      .filter(s => (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
      .map(s => {
        const logs = filteredAttendance.filter(a => String(a.studentId) === String(s.id));
        let hadir = 0, izin = 0, sakit = 0, alpa = 0;
        logs.forEach(l => {
          const st = String(l.status || 'alpa').toLowerCase().trim();
          if (st === 'hadir') hadir++;
          else if (st === 'izin') izin++;
          else if (st === 'sakit') sakit++;
          else if (st === 'alpa' || st === 'belum') alpa++;
        });

        const totalSesi = hadir + izin + sakit + alpa;
        const rate = totalSesi > 0 ? ((hadir / totalSesi) * 100).toFixed(1) : '0.0';

        return { ...s, hadir, izin, sakit, alpa, totalSesi, rate, logs };
      });
  }, [safeStudents, filteredAttendance, searchQuery, filterClassTab, isTeacher]);

  const handlePrint = () => {
    window.print();
  };

  const openStudentDetail = (student) => {
    const logs = filteredAttendance
      .filter(a => String(a.studentId) === String(student.id))
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    setDetailModal({ show: true, student, logs });
  };

  return (
    <div className="w-full font-sans pb-10">

      {/* A. TAMPILAN INTERAKTIF LAYAR (PRINT:HIDDEN) */}
      <div className="space-y-5 print:hidden">
        
        {/* 1. TOP NAVBAR HEADER */}
        <header className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between transition-all">
          <button 
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition"
            title="Buka Menu"
          >
            <Menu size={22} />
          </button>

          <div className="relative ml-auto" ref={profileRef}>
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
            >
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
                alt="Avatar" 
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
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 sm:hidden">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-slate-400">{user?.email || 'User'}</p>
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

        {/* 2. TITLE BAR & PERIODE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full pt-1">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Laporan Kehadiran
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              {isTeacher 
                ? `Rekapitulasi dan evaluasi data kehadiran anak khusus di ${teacherClass}.` 
                : 'Lihat dan cetak laporan absensi serta rekap kehadiran sekolah.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
                className="appearance-none flex items-center gap-2 bg-white dark:bg-slate-900 pl-8 pr-8 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer outline-none"
              >
                <option value="all">Semua Waktu</option>
                <option value="month">Bulan Ini</option>
                <option value="week">7 Hari Terakhir</option>
                <option value="today">Hari Ini</option>
              </select>
              <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl text-xs font-bold transition shadow-sm"
            >
              <Printer size={15} />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>

        {/* 3. TABS NAVIGASI UTAMA */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1 overflow-x-auto">
          {[
            { id: 'ringkasan', label: 'Ringkasan' },
            { id: 'harian', label: 'Absensi Harian' },
            { id: 'bulanan', label: 'Rekap Bulanan' },
            { id: 'anak', label: 'Rekap Anak' },
            { id: 'kelas', label: 'Rekap Kelas' },
          ].map(tab => {
            const isActive = activeReportTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReportTab(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: RINGKASAN */}
        {activeReportTab === 'ringkasan' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full">
              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400">Total Siswa</p>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{totalAnak}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{isTeacher ? teacherClass : 'anak'}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400">Total Hadir</p>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{stats.hadir}</p>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 inline-block">
                    {stats.pctHadir}%
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400">Total Izin</p>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{stats.izin}</p>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/50 inline-block">
                    {stats.pctIzin}%
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Frown size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400">Total Sakit</p>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{stats.sakit}</p>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/50 inline-block">
                    {stats.pctSakit}%
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5 col-span-2 sm:col-span-1">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <UserX size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400">Total Alpa</p>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{stats.alpa}</p>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 inline-block">
                    {stats.pctAlpa}%
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
              {/* Grafik Garis */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">Tren Kehadiran Siswa</h3>
                  <div className="relative">
                    <select 
                      value={chartRange} 
                      onChange={e => setChartRange(e.target.value)}
                      className="p-1.5 pr-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer appearance-none"
                    >
                      <option value="14">Per 14 Hari</option>
                      <option value="7">Per 7 Hari</option>
                      <option value="30">Per 30 Hari</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span>Hadir</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span>Izin</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span><span>Sakit</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span><span>Alpa</span></div>
                </div>

                <div className="w-full h-52 relative pt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
                    {[0, 5, 10, 15, 20].map((val) => {
                      const y = 140 - (val / 20) * 120;
                      return (
                        <g key={val}>
                          <text x="5" y={y + 3} className="text-[9px] fill-slate-400 font-medium">{val}</text>
                          <line x1="25" y1={y} x2="495" y2={y} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="2 2" />
                        </g>
                      );
                    })}

                    <polyline
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      points={chartPoints.map((d, i) => `${35 + i * (460 / Math.max(chartPoints.length - 1, 1))},${140 - (Math.min(d.hadir, 20) / 20) * 120}`).join(' ')}
                    />
                    <polyline
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="1.8"
                      points={chartPoints.map((d, i) => `${35 + i * (460 / Math.max(chartPoints.length - 1, 1))},${140 - (Math.min(d.izin, 20) / 20) * 120}`).join(' ')}
                    />
                    <polyline
                      fill="none"
                      stroke="#F43F5E"
                      strokeWidth="1.8"
                      points={chartPoints.map((d, i) => `${35 + i * (460 / Math.max(chartPoints.length - 1, 1))},${140 - (Math.min(d.sakit, 20) / 20) * 120}`).join(' ')}
                    />

                    {chartPoints.map((d, i) => {
                      const cx = 35 + i * (460 / Math.max(chartPoints.length - 1, 1));
                      const cyHadir = 140 - (Math.min(d.hadir, 20) / 20) * 120;
                      return (
                        <g key={i}>
                          <circle cx={cx} cy={cyHadir} r="3" fill="#10B981" />
                          <text x={cx} y={cyHadir - 5} textAnchor="middle" className="text-[9px] font-bold fill-emerald-600">{d.hadir}</text>
                          <text x={cx} y="155" textAnchor="middle" className="text-[9px] fill-slate-400 font-medium">{d.label.split(' ')[0]}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Progress Kehadiran per Status */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                  Distribusi Status {isTeacher ? `(${teacherClass})` : '(Total)'}
                </h3>

                <div className="space-y-3.5 my-auto">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold"><span>Hadir</span><span>{stats.hadir} ({stats.pctHadir}%)</span></div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats.pctHadir}%` }} /></div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold"><span>Izin</span><span>{stats.izin} ({stats.pctIzin}%)</span></div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden"><div className="bg-amber-500 h-full rounded-full" style={{ width: `${stats.pctIzin}%` }} /></div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold"><span>Sakit</span><span>{stats.sakit} ({stats.pctSakit}%)</span></div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden"><div className="bg-rose-500 h-full rounded-full" style={{ width: `${stats.pctSakit}%` }} /></div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold"><span>Alpa / Tanpa Ket.</span><span>{stats.alpa} ({stats.pctAlpa}% )</span></div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden"><div className="bg-slate-700 dark:bg-slate-500 h-full rounded-full" style={{ width: `${stats.pctAlpa}%` }} /></div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-indigo-600 shrink-0" />
                  <p className="text-[10px] text-indigo-700 dark:text-indigo-400">
                    {isTeacher ? `Data ini terisolasi otomatis khusus untuk siswa ${teacherClass}.` : 'Persentase dihitung berdasarkan akumulasi seluruh kelas.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ABSENSI HARIAN */}
        {activeReportTab === 'harian' && (
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                  <CalendarDays size={18} className="text-indigo-600" /> Log Sesi Absensi Harian
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Status kehadiran seluruh siswa yang tersimpan di database.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={filterClassTab}
                  disabled={isTeacher}
                  onChange={e => setFilterClassTab(e.target.value)}
                  className={`px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer ${
                    isTeacher ? 'opacity-80 cursor-not-allowed' : ''
                  }`}
                >
                  {!isTeacher && <option value="ALL">Semua Kelas</option>}
                  <option value="Kelas A">Kelas A</option>
                  <option value="Kelas B">Kelas B</option>
                  <option value="Kelas C">Kelas C</option>
                </select>

                <div className="relative w-full sm:w-56">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama anak..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-indigo-900/60 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5 w-12 text-center">No.</th>
                    <th className="px-4 py-3.5">Tanggal</th>
                    <th className="px-4 py-3.5">Nama Siswa</th>
                    <th className="px-4 py-3.5 text-center">Kelas</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {studentReports.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 italic">
                        Tidak ada data log yang cocok.
                      </td>
                    </tr>
                  ) : (
                    studentReports.map((s, idx) => {
                      const logs = filteredAttendance.filter(a => String(a.studentId) === String(s.id));
                      const latest = logs.length > 0 ? logs[logs.length - 1] : null;
                      const cleanSt = String(latest?.status || 'alpa').toLowerCase().trim();

                      const formattedDate = latest?.date 
                        ? new Date(latest.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

                      return (
                        <tr key={s.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <td className="px-4 py-3 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">{formattedDate}</td>
                          <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{s.name}</td>
                          <td className="px-4 py-3 text-center font-bold text-indigo-600">{s.class}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                              cleanSt === 'hadir' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                              cleanSt === 'izin' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                              cleanSt === 'sakit' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                              'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}>
                              {cleanSt}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 italic">{latest?.note || '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REKAP BULANAN */}
        {activeReportTab === 'bulanan' && (
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" /> Matriks Akumulasi Bulanan
                </h3>
                <p className="text-xs text-slate-400">Rekapitulasi total kehadiran dan tingkat kedisiplinan presensi.</p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl">Bulan Berjalan 2026</span>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-indigo-900/60 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-center">No.</th>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-4 py-3 text-center">Kelas</th>
                    <th className="px-4 py-3 text-center text-emerald-600">Total Hadir</th>
                    <th className="px-4 py-3 text-center text-amber-600">Total Izin</th>
                    <th className="px-4 py-3 text-center text-rose-600">Total Sakit</th>
                    <th className="px-4 py-3 text-center text-slate-700">Total Alpa</th>
                    <th className="px-4 py-3 text-center">Total Hari Efektif</th>
                    <th className="px-4 py-3 text-center">Kepatuhan (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {studentReports.map((s, idx) => (
                    <tr key={s.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{s.name}</td>
                      <td className="px-4 py-3 text-center font-bold text-indigo-600">{s.class}</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-600">{s.hadir} Hari</td>
                      <td className="px-4 py-3 text-center font-bold text-amber-600">{s.izin} Hari</td>
                      <td className="px-4 py-3 text-center font-bold text-rose-600">{s.sakit} Hari</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">{s.alpa} Hari</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-200">{s.totalSesi} Hari</td>
                      <td className="px-4 py-3 text-center font-extrabold text-indigo-600 dark:text-indigo-400">{s.rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: REKAP ANAK */}
        {activeReportTab === 'anak' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Kelas:</span>
                {isTeacher ? (
                  <span className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold">
                    {teacherClass}
                  </span>
                ) : (
                  ['ALL', 'Kelas A', 'Kelas B', 'Kelas C'].map(c => (
                    <button
                      key={c}
                      onClick={() => setFilterClassTab(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterClassTab === c ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                    >
                      {c === 'ALL' ? 'Semua' : c}
                    </button>
                  ))
                )}
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama anak..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentReports.map(s => (
                <div key={s.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <img src={s.photo} alt={s.name} className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 object-cover" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{s.name}</h4>
                      <p className="text-xs text-indigo-600 font-bold">{s.class}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl text-center text-xs">
                    <div><p className="font-extrabold text-emerald-600">{s.hadir}</p><p className="text-[10px] text-slate-400">Hadir</p></div>
                    <div><p className="font-extrabold text-amber-600">{s.izin}</p><p className="text-[10px] text-slate-400">Izin</p></div>
                    <div><p className="font-extrabold text-rose-600">{s.sakit}</p><p className="text-[10px] text-slate-400">Sakit</p></div>
                    <div><p className="font-extrabold text-slate-700 dark:text-slate-300">{s.alpa}</p><p className="text-[10px] text-slate-400">Alpa</p></div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div><span className="text-[10px] text-slate-400">Kehadiran: </span><span className="font-extrabold text-xs text-indigo-600">{s.rate}%</span></div>
                    <button onClick={() => openStudentDetail(s)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition inline-flex items-center gap-1">
                      <Eye size={13} /> Rincian Log
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: REKAP KELAS */}
        {activeReportTab === 'kelas' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {classBreakdown.map((cls, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {cls.name.replace('Kelas ', '')}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">{cls.name}</h4>
                        <p className="text-[10px] text-slate-400">{cls.total} Siswa Terdaftar</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-sm text-emerald-600">{cls.pct}%</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center py-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl"><p className="font-extrabold text-emerald-600 text-sm">{cls.hadir}</p><p className="text-[9px] text-slate-400">Hadir</p></div>
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl"><p className="font-extrabold text-amber-600 text-sm">{cls.izin}</p><p className="text-[9px] text-slate-400">Izin</p></div>
                    <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl"><p className="font-extrabold text-rose-600 text-sm">{cls.sakit}</p><p className="text-[9px] text-slate-400">Sakit</p></div>
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl"><p className="font-extrabold text-slate-700 dark:text-slate-300 text-sm">{cls.alpa}</p><p className="text-[9px] text-slate-400">Alpa</p></div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Daftar Siswa di Kelas Ini:</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-xs">
                      {cls.students.map((st, i) => (
                        <div key={st.id || i} className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <span className="font-medium truncate">{st.name}</span>
                          <button onClick={() => openStudentDetail(st)} className="text-indigo-600 text-[10px] font-bold hover:underline">Log</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* B. LEMBAR RESMI CETAK A4 (HANYA MUNCUL SAAT CETAK / PRINT:BLOCK) */}
      <div className="hidden print:block bg-white text-black p-8 font-sans">
        {/* KOP SURAT */}
        <div className="border-b-2 border-black pb-4 mb-6 text-center space-y-1">
          <h1 className="text-2xl font-black tracking-wider uppercase">TK CERIA NUSANTARA</h1>
          <p className="text-xs text-gray-700">Sistem Informasi Manajemen Presensi & Administrasi Terpadu</p>
          <p className="text-[11px] text-gray-500">Jl. Pahlawan Pendidikan No. 45 • Telp: (0354) 890123 • Kediri, Jawa Timur</p>
        </div>

        {/* JUDUL DOKUMEN */}
        <div className="text-center mb-6">
          <h2 className="text-base font-bold uppercase underline">
            LAPORAN REKAPITULASI PRESENSI {isTeacher ? teacherClass.toUpperCase() : 'SEKOLAH'}
          </h2>
          <p className="text-xs text-gray-600 mt-1">Periode: {selectedRange === 'all' ? 'Semua Waktu' : selectedRange} | Tanggal Cetak: {dateFormatted}</p>
        </div>

        {/* TABEL RINGKASAN DATA KELAS */}
        <div className="mb-6">
          <h3 className="text-xs font-bold mb-2 uppercase">I. Ringkasan Kehadiran Rombongan Belajar</h3>
          <table className="w-full text-xs border border-collapse border-black text-center">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2">Rombel / Kelas</th>
                <th className="border border-black p-2">Jumlah Siswa</th>
                <th className="border border-black p-2">Total Hadir</th>
                <th className="border border-black p-2">Total Izin</th>
                <th className="border border-black p-2">Total Sakit</th>
                <th className="border border-black p-2">Total Alpa</th>
                <th className="border border-black p-2">Persentase (%)</th>
              </tr>
            </thead>
            <tbody>
              {classBreakdown.map((c, i) => (
                <tr key={i}>
                  <td className="border border-black p-1.5 font-bold text-left pl-3">{c.name}</td>
                  <td className="border border-black p-1.5">{c.total}</td>
                  <td className="border border-black p-1.5 font-bold">{c.hadir}</td>
                  <td className="border border-black p-1.5">{c.izin}</td>
                  <td className="border border-black p-1.5">{c.sakit}</td>
                  <td className="border border-black p-1.5">{c.alpa}</td>
                  <td className="border border-black p-1.5 font-bold">{c.pct}%</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="border border-black p-2 text-left pl-3">TOTAL KESELURUHAN</td>
                <td className="border border-black p-2">{totalAnak}</td>
                <td className="border border-black p-2">{stats.hadir}</td>
                <td className="border border-black p-2">{stats.izin}</td>
                <td className="border border-black p-2">{stats.sakit}</td>
                <td className="border border-black p-2">{stats.alpa}</td>
                <td className="border border-black p-2">{stats.pctHadir}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TABEL RINCIAN SISWA */}
        <div className="mb-8">
          <h3 className="text-xs font-bold mb-2 uppercase">II. Daftar Rincian Kehadiran Siswa</h3>
          <table className="w-full text-xs border border-collapse border-black">
            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="border border-black p-2 w-10">No.</th>
                <th className="border border-black p-2 text-left">Nama Lengkap Siswa</th>
                <th className="border border-black p-2 w-20">Kelas</th>
                <th className="border border-black p-2 w-14">Hadir</th>
                <th className="border border-black p-2 w-14">Izin</th>
                <th className="border border-black p-2 w-14">Sakit</th>
                <th className="border border-black p-2 w-14">Alpa</th>
                <th className="border border-black p-2 w-24">Tingkat Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              {studentReports.map((s, idx) => (
                <tr key={s.id || idx}>
                  <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                  <td className="border border-black p-1.5 font-bold">{s.name}</td>
                  <td className="border border-black p-1.5 text-center">{s.class}</td>
                  <td className="border border-black p-1.5 text-center">{s.hadir}</td>
                  <td className="border border-black p-1.5 text-center">{s.izin}</td>
                  <td className="border border-black p-1.5 text-center">{s.sakit}</td>
                  <td className="border border-black p-1.5 text-center">{s.alpa}</td>
                  <td className="border border-black p-1.5 text-center font-bold">{s.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TANDA TANGAN */}
        <div className="grid grid-cols-2 text-xs pt-6">
          <div className="text-center space-y-16">
            <p>Mengetahui,<br /><b>Kepala Sekolah TK Ceria</b></p>
            <p className="font-bold underline uppercase">( Hj. Siti Nurjanah, M.Pd )</p>
          </div>
          <div className="text-center space-y-16">
            <p>Kediri, {dateFormatted}<br /><b>{isTeacher ? `Wali ${teacherClass}` : 'Staf Administrasi TU'}</b></p>
            <p className="font-bold underline uppercase">( {user?.name || 'Bu Sari'} )</p>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL SISWA */}
      {detailModal.show && detailModal.student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150 print:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-800">
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src={detailModal.student.photo} alt="Avatar" className="w-8 h-8 rounded-full bg-white/20 object-cover" />
                <div>
                  <h3 className="font-bold text-sm leading-tight">{detailModal.student.name}</h3>
                  <p className="text-[10px] text-white/80">{detailModal.student.class} • Riwayat Absensi</p>
                </div>
              </div>
              <button onClick={() => setDetailModal({ show: false, student: null, logs: [] })} className="text-white/80 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto text-xs">
              <div className="space-y-1.5">
                {detailModal.logs.length === 0 ? (
                  <p className="text-slate-400 italic py-6 text-center">Belum ada rekaman absensi untuk siswa ini.</p>
                ) : (
                  detailModal.logs.map((l, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{l.date}</p>
                        {l.note && <p className="text-[10px] text-slate-400 italic">Catatan: {l.note}</p>}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        l.status === 'hadir' ? 'bg-emerald-50 text-emerald-600' :
                        l.status === 'izin' ? 'bg-amber-50 text-amber-600' :
                        l.status === 'sakit' ? 'bg-rose-50 text-rose-600' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {l.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => setDetailModal({ show: false, student: null, logs: [] })}
                className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}