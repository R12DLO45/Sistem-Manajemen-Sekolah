import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Monitor, Bell, Lock, Database, Info, 
  Camera, Save, Sun, Moon, Globe, ListFilter, 
  Calendar, ChevronRight, Download, ChevronDown, 
  Menu, LogOut, X, Check, ShieldAlert, KeyRound
} from 'lucide-react';

export default function SettingsPage({ 
  user = { name: 'Admin TU', role: 'admin', assignedClass: 'Kelas A', email: 'admin@tk.com', phone: '0812-3456-7890' }, 
  students = [], 
  attendance = [],
  darkMode = false,
  onToggleDark = () => {},
  onUpdateUser = () => {},
  onLogout = () => {}, 
  onToggleSidebar = () => {},
  onToast = () => {}
}) {
  const [activeTab, setActiveTab] = useState('semua');

  // Form Profil
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Admin TU',
    email: user?.email || 'admin@tk.com',
    roleDisplay: user?.role === 'teacher' ? 'Wali Kelas' : user?.role === 'kepsek' ? 'Kepala Sekolah' : 'Admin TU',
    assignedClass: user?.assignedClass ? user.assignedClass.replace('TK ', 'Kelas ') : 'Kelas A',
    phone: user?.phone || '0812-3456-7890',
    avatarSeed: user?.name || 'Admin TU'
  });

  // Pengaturan Aplikasi
  const [language, setLanguage] = useState(() => localStorage.getItem('tk_app_lang') || 'id');
  const [itemsPerPageSetting, setItemsPerPageSetting] = useState(() => localStorage.getItem('tk_items_per_page') || '10 data');
  const [dateFormatSetting, setDateFormatSetting] = useState(() => localStorage.getItem('tk_date_format') || 'DD MMM YYYY');

  // Switch Notifikasi
  const [notifSettings, setNotifSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('tk_notif_settings');
      return saved ? JSON.parse(saved) : { absensi: true, pengingat: true, sistem: true, email: false };
    } catch {
      return { absensi: true, pengingat: true, sistem: true, email: false };
    }
  });

  useEffect(() => {
    localStorage.setItem('tk_notif_settings', JSON.stringify(notifSettings));
  }, [notifSettings]);

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'avatar' | 'password' | 'backupHistory' | 'about' | 'logoutAll' | null
  
  // Password Form State
  const [passwordForm, setPasswordForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  
  // Log Riwayat Backup
  const [backupLogs, setBackupLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('tk_backup_logs');
      return saved ? JSON.parse(saved) : [
        { id: 1, date: '18 Agu 2026, 09:30 WIB', size: '24 KB', count: `${students.length} Siswa`, status: 'Berhasil' }
      ];
    } catch {
      return [];
    }
  });

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

  // 1. Simpan Profil
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (onUpdateUser && user?.id) {
      onUpdateUser(user.id, {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        assignedClass: profileForm.assignedClass
      });
    }
    if (onToast) onToast('Perubahan profil berhasil disimpan!', 'success');
  };

  // 2. Ubah Password
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.oldPass || !passwordForm.newPass) {
      if (onToast) onToast('Semua kolom kata sandi wajib diisi!', 'error');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      if (onToast) onToast('Konfirmasi kata sandi baru tidak cocok!', 'error');
      return;
    }
    if (passwordForm.newPass.length < 4) {
      if (onToast) onToast('Kata sandi minimal 4 karakter!', 'error');
      return;
    }

    if (onUpdateUser && user?.id) {
      onUpdateUser(user.id, { password: passwordForm.newPass });
    }
    setPasswordForm({ oldPass: '', newPass: '', confirmPass: '' });
    setActiveModal(null);
    if (onToast) onToast('Kata sandi berhasil diperbarui!', 'success');
  };

  // 3. Backup Data Sekarang
  const handleBackupNow = () => {
    const backupData = { timestamp: new Date().toISOString(), user, students, attendance };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_tk_ceria_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
      size: `${(JSON.stringify(backupData).length / 1024).toFixed(1)} KB`,
      count: `${students.length} Siswa, ${attendance.length} Absensi`,
      status: 'Berhasil'
    };

    const updatedLogs = [newLog, ...backupLogs];
    setBackupLogs(updatedLogs);
    localStorage.setItem('tk_backup_logs', JSON.stringify(updatedLogs));

    if (onToast) onToast('Cadangan data sistem berhasil diunduh!', 'success');
  };

  // 4. Export CSV
  const handleExportExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID Siswa,Nama Siswa,Kelas,Nama Wali,No HP Wali\n" + 
      students.map(s => `${s.id},"${s.name}","${s.class}","${s.parentName || '-'}","${s.parentPhone || '-'}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `data_siswa_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    if (onToast) onToast('Data siswa berhasil diexport ke CSV/Excel!', 'success');
  };

  const toggleNotif = (key) => {
    setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
    if (onToast) onToast(`Notifikasi ${key} ${!notifSettings[key] ? 'diaktifkan' : 'dinonaktifkan'}`, 'info');
  };

  const handleLangChange = (val) => {
    setLanguage(val);
    localStorage.setItem('tk_app_lang', val);
    if (onToast) onToast(`Bahasa diatur ke ${val === 'id' ? 'Bahasa Indonesia' : 'English'}`, 'success');
  };

  const handleDateFormatChange = (val) => {
    setDateFormatSetting(val);
    localStorage.setItem('tk_date_format', val);
    if (onToast) onToast(`Format tanggal diubah ke ${val}`, 'success');
  };

  const handleItemsPerPageChange = (val) => {
    setItemsPerPageSetting(val);
    localStorage.setItem('tk_items_per_page', val);
    if (onToast) onToast(`Paginasi tabel diatur ke ${val}`, 'success');
  };

  const menuNav = [
    { id: 'semua', label: 'Semua Pengaturan', desc: 'Tampilkan seluruh panel pengaturan', icon: ListFilter },
    { id: 'profil', label: 'Profil Saya', desc: 'Informasi akun dan foto profil', icon: User },
    { id: 'aplikasi', label: 'Pengaturan Aplikasi', desc: 'Tampilan dan preferensi aplikasi', icon: Monitor },
    { id: 'notifikasi', label: 'Notifikasi', desc: 'Kelola notifikasi dan pengingat', icon: Bell },
    { id: 'keamanan', label: 'Keamanan', desc: 'Ubah password dan keamanan akun', icon: Lock },
    { id: 'backup', label: 'Backup & Data', desc: 'Kelola cadangan dan data sistem', icon: Database },
    { id: 'tentang', label: 'Tentang Aplikasi', desc: 'Informasi versi dan pengembang', icon: Info },
  ];

  return (
    <div className="space-y-5 w-full">
      
      {/* 1. TOP NAVBAR STICKY */}
      <header className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between transition-all">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition"
        >
          <Menu size={22} />
        </button>

        {/* Profile Dropdown */}
        <div className="relative ml-auto" ref={profileRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
          >
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileForm.avatarSeed}`} 
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

      {/* 2. TITLE BAR */}
      <div className="w-full pt-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Pengaturan</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Kelola preferensi akun, kustomisasi aplikasi, keamanan, dan cadangan data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
        
        {/* KOLOM KIRI: MENU PENGATURAN */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-1">
          <p className="px-3 py-2 text-xs font-extrabold text-slate-800 dark:text-white">Menu Pengaturan</p>
          {menuNav.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'tentang') {
                    setActiveModal('about');
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all ${
                  isActive
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight truncate">{item.label}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* KOLOM KANAN: KARTU PENGATURAN MELEBAR PENUH (FULL WIDTH) */}
        <div className="lg:col-span-9 space-y-5 w-full">
          
          {/* KARTU 1: PROFIL SAYA */}
          {(activeTab === 'semua' || activeTab === 'profil') && (
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5 w-full">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">Profil Saya</h3>
                  <p className="text-[11px] text-slate-400">Informasi identitas akun dan kelas penugasan</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  Akun Aktif
                </span>
              </div>
              
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <div className="relative group shrink-0">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileForm.avatarSeed}`} 
                      alt={profileForm.name} 
                      className="w-24 h-24 rounded-full bg-indigo-50 border-2 border-indigo-100 dark:border-slate-700 object-cover"
                    />
                    <button 
                      type="button" 
                      onClick={() => setActiveModal('avatar')}
                      className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md transition"
                      title="Ganti Karakter Avatar"
                    >
                      <Camera size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Nama Lengkap</label>
                      <input 
                        type="text" 
                        required
                        value={profileForm.name} 
                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Email</label>
                      <input 
                        type="email" 
                        required
                        value={profileForm.email} 
                        onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Peran</label>
                      <input 
                        type="text" 
                        disabled 
                        value={profileForm.roleDisplay} 
                        className="w-full p-3 bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-slate-500 rounded-2xl outline-none cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Kelas yang Diampu</label>
                      <div className="relative">
                        <select 
                          value={profileForm.assignedClass} 
                          onChange={e => setProfileForm({ ...profileForm, assignedClass: e.target.value })} 
                          className="w-full p-3 pr-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                        >
                          <option value="Kelas A">Kelas A</option>
                          <option value="Kelas B">Kelas B</option>
                          <option value="Kelas C">Kelas C</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-bold text-slate-700 dark:text-slate-300">No. HP / WhatsApp</label>
                      <input 
                        type="text" 
                        value={profileForm.phone} 
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-md shadow-indigo-200 dark:shadow-none">
                    <Save size={15} /> Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* KARTU 2: PENGATURAN APLIKASI */}
          {(activeTab === 'semua' || activeTab === 'aplikasi') && (
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5 w-full">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Pengaturan Aplikasi</h3>
                <p className="text-[11px] text-slate-400">Sesuaikan preferensi tampilan dan interaksi sistem</p>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {/* Mode Tampilan */}
                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shrink-0"><Monitor size={18} /></div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-xs">Mode Tampilan</p>
                      <p className="text-[11px] text-slate-400">Pilih tema terang atau gelap untuk kenyamanan mata</p>
                    </div>
                  </div>
                  <button onClick={onToggleDark} className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 text-xs hover:bg-slate-100 transition shadow-sm">
                    {darkMode ? <Moon size={14} className="text-indigo-400" /> : <Sun size={14} className="text-amber-500" />}
                    <span>{darkMode ? 'Mode Gelap' : 'Mode Terang'}</span>
                  </button>
                </div>

                {/* Bahasa */}
                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shrink-0"><Globe size={18} /></div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-xs">Bahasa Sistem</p>
                      <p className="text-[11px] text-slate-400">Bahasa utama yang digunakan di seluruh navigasi</p>
                    </div>
                  </div>
                  <select value={language} onChange={e => handleLangChange(e.target.value)} className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 text-xs outline-none cursor-pointer">
                    <option value="id">Bahasa Indonesia (ID)</option>
                    <option value="en">English (EN)</option>
                  </select>
                </div>

                {/* Paginasi Data */}
                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shrink-0"><ListFilter size={18} /></div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-xs">Tampilan Data per Halaman</p>
                      <p className="text-[11px] text-slate-400">Batas jumlah data per halaman pada tabel siswa & absensi</p>
                    </div>
                  </div>
                  <select value={itemsPerPageSetting} onChange={e => handleItemsPerPageChange(e.target.value)} className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 text-xs outline-none cursor-pointer">
                    <option value="5 data">5 data / halaman</option>
                    <option value="10 data">10 data / halaman</option>
                    <option value="25 data">25 data / halaman</option>
                  </select>
                </div>

                {/* Format Tanggal */}
                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 shrink-0"><Calendar size={18} /></div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-xs">Format Tanggal</p>
                      <p className="text-[11px] text-slate-400">Pola tampilan tanggal di tabel dan laporan</p>
                    </div>
                  </div>
                  <select value={dateFormatSetting} onChange={e => handleDateFormatChange(e.target.value)} className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 text-xs outline-none cursor-pointer">
                    <option value="DD MMM YYYY">DD MMM YYYY (18 Agu 2026)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (18/08/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2026-08-18)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* KARTU 3: NOTIFIKASI */}
          {(activeTab === 'semua' || activeTab === 'notifikasi') && (
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5 w-full">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Preferensi Notifikasi</h3>
                <p className="text-[11px] text-slate-400">Atur pemberitahuan kegiatan dan rekap absensi otomatis</p>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {[
                  { key: 'absensi', label: 'Notifikasi Absensi', desc: 'Terima konfirmasi setiap kali sesi absensi harian disimpan' },
                  { key: 'pengingat', label: 'Notifikasi Pengingat', desc: 'Peringatan otomatis sebelum jam batas absensi kelas berakhir' },
                  { key: 'sistem', label: 'Notifikasi Pembaruan Sistem', desc: 'Informasi rilis fitur dan pemeliharaan server aplikasi' },
                  { key: 'email', label: 'Ringkasan Absensi via Email', desc: 'Kirim salinan laporan absensi mingguan ke email terdaftar' }
                ].map(n => (
                  <div key={n.key} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shrink-0"><Bell size={18} /></div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-xs">{n.label}</p>
                        <p className="text-[11px] text-slate-400">{n.desc}</p>
                      </div>
                    </div>
                    <button onClick={() => toggleNotif(n.key)} className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${notifSettings[n.key] ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifSettings[n.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KARTU 4: KEAMANAN */}
          {(activeTab === 'semua' || activeTab === 'keamanan') && (
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5 w-full">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Keamanan Akun</h3>
                <p className="text-[11px] text-slate-400">Proteksi kata sandi dan riwayat sesi login Anda</p>
              </div>
              <div className="space-y-3 text-xs">
                <button onClick={() => setActiveModal('password')} className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center justify-between transition text-left">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 shrink-0"><Lock size={18} /></div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-xs">Ubah Password</p>
                      <p className="text-[11px] text-slate-400">Disarankan mengganti kata sandi secara berkala</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>

                <div className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center justify-between text-left">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 shrink-0"><Monitor size={18} /></div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-xs">Sesi Login Saat Ini</p>
                      <p className="text-[11px] text-slate-400">Perangkat aktif di browser ini</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">Aktif</span>
                </div>

                <button onClick={() => setActiveModal('logoutAll')} className="w-full p-4 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50 border border-rose-100 dark:border-rose-900/40 rounded-2xl flex items-center justify-between transition text-left">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-600 shrink-0"><LogOut size={18} /></div>
                    <div>
                      <p className="font-bold text-rose-600 dark:text-rose-400 text-xs">Keluar dari Semua Perangkat</p>
                      <p className="text-[11px] text-rose-400">Putuskan seluruh sesi akun yang login di perangkat lain</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-rose-400" />
                </button>
              </div>
            </div>
          )}

          {/* KARTU 5: BACKUP & DATA */}
          {(activeTab === 'semua' || activeTab === 'backup') && (
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5 w-full">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Pencadangan & Ekspor Data</h3>
                <p className="text-[11px] text-slate-400">Amankan data seluruh siswa dan riwayat presensi ke berkas lokal</p>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 shrink-0"><Database size={18} /></div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-xs">Backup Data Sistem Sekarang</p>
                      <p className="text-[11px] text-slate-400">Unduh seluruh berkas JSON data siswa, guru, dan presensi</p>
                    </div>
                  </div>
                  <button onClick={handleBackupNow} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition">
                    Unduh Cadangan
                  </button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 shrink-0"><Calendar size={18} /></div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-xs">Riwayat Backup</p>
                      <p className="text-[11px] text-slate-400">Lihat riwayat dan daftar log pencadangan data sistem</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveModal('backupHistory')} className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs shadow-sm transition">
                    Lihat Log
                  </button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 shrink-0"><Download size={18} /></div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-xs">Ekspor Berkas CSV / Excel</p>
                      <p className="text-[11px] text-slate-400">Unduh daftar lengkap data siswa untuk kebutuhan cetak formulir</p>
                    </div>
                  </div>
                  <button onClick={handleExportExcel} className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs shadow-sm transition">
                    Ekspor CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER INFORMASI */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <p>TK Ceria © 2026. All rights reserved.</p>
            <button onClick={() => setActiveModal('about')} className="hover:text-indigo-600 hover:underline">
              Versi 1.0.0 (Tentang Aplikasi)
            </button>
          </div>

        </div>
      </div>

      {/* MODAL 1: GANTI FOTO AVATAR */}
      {activeModal === 'avatar' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border dark:border-slate-800">
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2"><Camera size={16}/> Pilih Avatar Baru</h3>
              <button onClick={() => setActiveModal(null)} className="text-white/80 hover:text-white"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-4 text-center">
              <p className="text-xs text-slate-500">Klik salah satu karakter avatar di bawah untuk profil Anda:</p>
              <div className="grid grid-cols-4 gap-3">
                {['Admin TU', 'Bu Sari', 'Bu Rina', 'Bu Dewi', 'Pak Andi', 'Bima', 'Aira', 'Guru'].map(seed => (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => {
                      setProfileForm({ ...profileForm, avatarSeed: seed });
                      setActiveModal(null);
                      if (onToast) onToast('Avatar profil berhasil diganti!', 'success');
                    }}
                    className={`p-2 rounded-2xl border-2 transition ${profileForm.avatarSeed === seed ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200'}`}
                  >
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={seed} className="w-12 h-12 mx-auto rounded-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UBAH PASSWORD */}
      {activeModal === 'password' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-800">
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2"><KeyRound size={16}/> Ubah Password Akun</h3>
              <button onClick={() => setActiveModal(null)} className="text-white/80 hover:text-white"><X size={18}/></button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Password Lama</label>
                <input 
                  type="password" 
                  required
                  placeholder="Masukkan kata sandi saat ini"
                  value={passwordForm.oldPass}
                  onChange={e => setPasswordForm({ ...passwordForm, oldPass: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Password Baru</label>
                <input 
                  type="password" 
                  required
                  placeholder="Minimal 4 karakter"
                  value={passwordForm.newPass}
                  onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Konfirmasi Password Baru</label>
                <input 
                  type="password" 
                  required
                  placeholder="Ulangi kata sandi baru"
                  value={passwordForm.confirmPass}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPass: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl">Batal</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RIWAYAT BACKUP */}
      {activeModal === 'backupHistory' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-800">
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2"><Database size={16}/> Riwayat Backup Data</h3>
              <button onClick={() => setActiveModal(null)} className="text-white/80 hover:text-white"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-3 max-h-80 overflow-y-auto text-xs">
              {backupLogs.map(log => (
                <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{log.date}</p>
                    <p className="text-[10px] text-slate-400">{log.count} • Ukuran: {log.size}</p>
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full">{log.status}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button onClick={() => setActiveModal(null)} className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-xl text-xs">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: TENTANG APLIKASI */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border dark:border-slate-800 text-center p-6 space-y-4">
            <div className="w-14 h-14 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto text-2xl shadow-lg shadow-indigo-200">
              🏠
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">TK CERIA</h3>
              <p className="text-xs text-indigo-600 font-bold mt-0.5">Sistem Absensi & Administrasi Sekolah</p>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Aplikasi modern berbasis web untuk efisiensi presensi anak didik, manajemen wali kelas, komunikasi wali murid, dan rekapitulasi laporan terpadu.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl text-[11px] text-slate-500 font-medium">
              <p>Versi: 1.0.0 (Release Build 2026)</p>
              <p>Platform: React + Tailwind CSS</p>
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition">
              Tutup Informasi
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: KELUAR SEMUA PERANGKAT */}
      {activeModal === 'logoutAll' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border dark:border-slate-800 p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Reset Semua Sesi Login?</h3>
              <p className="text-xs text-slate-400 mt-1">Anda akan keluar dari akun ini di seluruh perangkat lain.</p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs">Batal</button>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  if (onToast) onToast('Semua sesi login di perangkat lain telah diputus!', 'success');
                }} 
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Konfirmasi Keluar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}