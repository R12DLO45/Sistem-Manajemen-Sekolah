import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, CheckCircle2, Clock, Frown, HelpCircle, 
  ArrowRight, ChevronRight, Calendar, ShieldCheck, 
  Menu, LogOut, ChevronDown 
} from 'lucide-react';

export default function MainDashboard({ 
  user = { name: 'Pengguna', role: 'teacher', assignedClass: 'TK A' }, 
  students = [], 
  attendance = [], 
  setActiveMenu = () => {}, 
  onLogout = () => {}, 
  onToggleSidebar = () => {} 
}) {
  const today = new Date().toISOString().split('T')[0];
  
  const dateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

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

  const relevantStudents = user.role === 'teacher' 
    ? students.filter(s => s.class === user.assignedClass) 
    : students;

  const totalAnak = relevantStudents.length;

  const todayRecords = attendance.filter(a => a.date === today && relevantStudents.some(s => s.id === a.studentId));
  const hadirCount = todayRecords.filter(a => a.status === 'hadir').length;
  const izinCount = todayRecords.filter(a => a.status === 'izin').length;
  const sakitCount = todayRecords.filter(a => a.status === 'sakit').length;
  const belumAbsenCount = totalAnak - (hadirCount + izinCount + sakitCount);

  const hadirPct = totalAnak ? Math.round((hadirCount / totalAnak) * 100) : 0;
  const izinPct = totalAnak ? Math.round((izinCount / totalAnak) * 100) : 0;
  const sakitPct = totalAnak ? Math.round((sakitCount / totalAnak) * 100) : 0;
  const belumPct = totalAnak ? Math.round((belumAbsenCount / totalAnak) * 100) : 0;

  const recentActivities = [...attendance]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5)
    .map(record => {
      const student = students.find(s => s.id === record.studentId);
      return { ...record, student };
    })
    .filter(item => item.student);

  return (
    <div className="space-y-6 w-full">
      
      {/* 1. TOP NAVBAR NAiK DIKIT & SIMETRIS */}
      <header className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between transition-all">
        
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition"
          title="Buka Menu Navigasi"
        >
          <Menu size={22} />
        </button>

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

      {/* 2. TITLE BAR & GREETING */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full pt-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Selamat datang, {user.name}! 👋
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
            <Calendar size={14} /> {dateFormatted}
          </p>
        </div>
      </div>

      {/* 3. 5 KARTU STATISTIK RINGKASAN */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Anak</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{totalAnak} <span className="text-xs font-normal text-slate-400">anak</span></p>
            </div>
          </div>
          <button onClick={() => setActiveMenu('data-anak')} className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition">
            Lihat semua anak <ArrowRight size={12} />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hadir Hari Ini</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{hadirCount} <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">({hadirPct}%)</span></p>
            </div>
          </div>
          <button onClick={() => setActiveMenu('absensi')} className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 transition">
            Lihat detail <ArrowRight size={12} />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Izin Hari Ini</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{izinCount} <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">({izinPct}%)</span></p>
            </div>
          </div>
          <button onClick={() => setActiveMenu('absensi')} className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 transition">
            Lihat detail <ArrowRight size={12} />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Frown size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sakit Hari Ini</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{sakitCount} <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">({sakitPct}%)</span></p>
            </div>
          </div>
          <button onClick={() => setActiveMenu('absensi')} className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 transition">
            Lihat detail <ArrowRight size={12} />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <HelpCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Belum Absen</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{belumAbsenCount} <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">({belumPct}%)</span></p>
            </div>
          </div>
          <button onClick={() => setActiveMenu('absensi')} className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 transition">
            Mulai Absen <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* 4. DONUT CHART & ABSENSI PER KELAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Ringkasan Absensi Hari Ini</h3>
          
          <div className="flex items-center justify-center relative py-2">
            <div className="w-44 h-44 rounded-full border-[16px] border-emerald-500 border-t-amber-400 border-r-rose-500 border-l-indigo-500 flex items-center justify-center text-center shadow-inner">
              <div>
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{totalAnak}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Anak</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span><span className="text-slate-600 dark:text-slate-400">Hadir:</span><span className="font-bold text-slate-800 dark:text-white ml-auto">{hadirCount} ({hadirPct}%)</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400 shrink-0"></span><span className="text-slate-600 dark:text-slate-400">Izin:</span><span className="font-bold text-slate-800 dark:text-white ml-auto">{izinCount} ({izinPct}%)</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span><span className="text-slate-600 dark:text-slate-400">Sakit:</span><span className="font-bold text-slate-800 dark:text-white ml-auto">{sakitCount} ({sakitPct}%)</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0"></span><span className="text-slate-600 dark:text-slate-400">Belum:</span><span className="font-bold text-slate-800 dark:text-white ml-auto">{belumAbsenCount} ({belumPct}%)</span></div>
          </div>

          <button onClick={() => setActiveMenu('absensi')} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition flex items-center justify-center gap-2">
            <CheckCircle2 size={16} /> Buka Absensi Hari Ini
          </button>
        </div>

        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Absensi Per Kelas</h3>
            <button onClick={() => setActiveMenu('kelas')} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              Lihat semua <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-4 my-auto">
            {['TK A', 'TK B'].map(kelasName => {
              const classStudents = students.filter(s => s.class === kelasName);
              const classHadir = attendance.filter(a => a.date === today && a.status === 'hadir' && classStudents.some(s => s.id === a.studentId)).length;
              const classPct = classStudents.length ? Math.round((classHadir / classStudents.length) * 100) : 0;

              return (
                <div key={kelasName} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-base shrink-0 ${
                    kelasName === 'TK A' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                  }`}>
                    {kelasName.split(' ')[1]}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 dark:text-white">Kelas {kelasName.split(' ')[1]}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{classPct}%</span>
                    </div>
                    
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${classPct}%` }}></div>
                    </div>
                    
                    <p className="text-[10px] text-slate-400 font-medium">{classHadir} / {classStudents.length} anak hadir</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
            <span className="font-medium">Semua kelas terpantau secara real-time.</span>
            <span className="font-bold underline cursor-pointer" onClick={() => setActiveMenu('absensi')}>Absen sekarang</span>
          </div>
        </div>
      </div>

      {/* 5. AKTIVITAS TERBARU & INFORMASI PENTING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Aktivitas Terbaru</h3>
            <button onClick={() => setActiveMenu('absensi')} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Lihat semua
            </button>
          </div>

          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">Belum ada aktivitas presensi hari ini.</p>
            ) : (
              recentActivities.map(item => (
                <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={item.student.photo} className="w-9 h-9 rounded-full bg-white border shrink-0 object-cover" alt={item.student.name}/>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {item.student.name} <span className="font-normal text-slate-400">ditandai {item.status}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">Kelas {item.student.class} • {item.date}</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                    item.status === 'hadir' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                    item.status === 'sakit' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between text-center space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm text-left">Informasi Penting</h3>

          <div className="my-auto space-y-3">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/60 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
              <ShieldCheck size={32} />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Pengingat Presensi</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2">
              Pastikan semua presensi anak hari ini sudah tersimpan dan terekap sebelum jam pulang sekolah.
            </p>
          </div>

          <button onClick={() => setActiveMenu('absensi')} className="w-full py-3 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl transition">
            Lihat Panduan & Presensi
          </button>
        </div>
      </div>

    </div>
  );
}