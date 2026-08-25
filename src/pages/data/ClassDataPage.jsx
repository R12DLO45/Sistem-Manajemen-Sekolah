import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  School, User, Plus, Trash2, Edit2, X, 
  Search, Users, ChevronDown, Menu, LogOut, 
  CheckCircle2, Eye, MapPin, Clock, 
  ShieldCheck, HelpCircle, UserCheck, Sparkles
} from 'lucide-react';

export default function ClassDataPage({ 
  user = { name: 'Admin TU', role: 'admin', assignedClass: 'ALL' }, 
  students = [], 
  users = [], 
  onLogout = () => {}, 
  onToggleSidebar = () => {}, 
  onToast = () => {},
  setActiveMenu = () => {}
}) {
  const isAdmin = user?.role === 'admin';
  const isKepsek = user?.role === 'kepsek';

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

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('ALL');

  // Master Data Rombel Kelas
  const [classes, setClasses] = useState([
    { 
      id: 'TK A', 
      name: 'Kelas A', 
      alias: 'TK A', 
      room: 'Ruang Mawar (Lantai 1)', 
      capacity: 20, 
      schedule: '07:30 - 11:00 WIB',
      academicYear: '2026/2027',
      description: 'Kelompok bermain awal anak usia 4 - 5 tahun fokus motorik & pengenalan huruf.'
    },
    { 
      id: 'TK B', 
      name: 'Kelas B', 
      alias: 'TK B', 
      room: 'Ruang Melati (Lantai 1)', 
      capacity: 20, 
      schedule: '07:30 - 11:30 WIB',
      academicYear: '2026/2027',
      description: 'Kelompok persiapan usia 5 - 6 tahun fokus calistung dasar & kemandirian.'
    },
    { 
      id: 'TK C', 
      name: 'Kelas C', 
      alias: 'TK C', 
      room: 'Ruang Anggrek (Lantai 2)', 
      capacity: 15, 
      schedule: '08:00 - 11:30 WIB',
      academicYear: '2026/2027',
      description: 'Kelompok minat & bakat khusus serta penguatan pra-sekolah dasar.'
    }
  ]);

  // Modal States
  const [detailModal, setDetailModal] = useState({ show: false, classData: null, students: [], teacher: null });
  const [formModal, setFormModal] = useState({ show: false, isEdit: false, targetId: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, classId: null, className: '' });

  const [formData, setFormData] = useState({
    name: '',
    room: '',
    capacity: 20,
    schedule: '07:30 - 11:00 WIB',
    description: ''
  });

  // Statistik Rombel
  const stats = useMemo(() => {
    const safeStudents = Array.isArray(students) ? students : [];
    const totalRombel = classes.length;
    const totalCapacity = classes.reduce((acc, c) => acc + (Number(c.capacity) || 0), 0);
    const totalEnrolled = safeStudents.length;
    const avgPerClass = totalRombel > 0 ? (totalEnrolled / totalRombel).toFixed(1) : 0;
    const occupancyRate = totalCapacity > 0 ? ((totalEnrolled / totalCapacity) * 100).toFixed(1) : 0;

    return { totalRombel, totalCapacity, totalEnrolled, avgPerClass, occupancyRate };
  }, [classes, students]);

  // Filter Kelas
  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRoom = selectedRoomFilter === 'ALL' || c.room.includes(selectedRoomFilter);
      return matchSearch && matchRoom;
    });
  }, [classes, searchQuery, selectedRoomFilter]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      room: '',
      capacity: 20,
      schedule: '07:30 - 11:00 WIB',
      description: ''
    });
    setFormModal({ show: true, isEdit: false, targetId: null });
  };

  const handleOpenEdit = (cls) => {
    setFormData({
      name: cls.name,
      room: cls.room,
      capacity: cls.capacity,
      schedule: cls.schedule,
      description: cls.description
    });
    setFormModal({ show: true, isEdit: true, targetId: cls.id });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      if (onToast) onToast('Nama rombel kelas wajib diisi!', 'error');
      return;
    }

    if (formModal.isEdit) {
      setClasses(prev => prev.map(c => c.id === formModal.targetId ? { ...c, ...formData } : c));
      if (onToast) onToast(`Konfigurasi ${formData.name} berhasil diperbarui!`, 'success');
    } else {
      const newClass = {
        id: `TK-${Date.now()}`,
        alias: formData.name,
        academicYear: '2026/2027',
        ...formData
      };
      setClasses(prev => [...prev, newClass]);
      if (onToast) onToast(`Rombel ${formData.name} berhasil ditambahkan!`, 'success');
    }

    setFormModal({ show: false, isEdit: false, targetId: null });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.classId) {
      setClasses(prev => prev.filter(c => c.id !== deleteModal.classId));
      if (onToast) onToast(`Rombel "${deleteModal.className}" berhasil dihapus`, 'error');
      setDeleteModal({ show: false, classId: null, className: '' });
    }
  };

  const openClassDetail = (cls) => {
    const safeStudents = Array.isArray(students) ? students : [];
    const safeUsers = Array.isArray(users) ? users : [];
    const classStudents = safeStudents.filter(s => (s.class || '').replace('TK ', 'Kelas ') === cls.name);
    const waliKelas = safeUsers.find(u => u.role === 'teacher' && (u.assignedClass || '').replace('TK ', 'Kelas ') === cls.name);
    setDetailModal({ show: true, classData: cls, students: classStudents, teacher: waliKelas });
  };

  return (
    <div className="space-y-5 w-full font-sans pb-10">
      
      {/* 1. TOP NAVBAR */}
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

      {/* 2. TITLE BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full pt-1">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Data Rombongan Belajar (Kelas)
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
            Manajemen rombel, penetapan ruangan kelas, kapasitas tampung, dan penugasan wali kelas.
          </p>
        </div>

        {isAdmin && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-md shadow-indigo-200 dark:shadow-none self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Tambah Rombel Baru</span>
          </button>
        )}
      </div>

      {/* 3. 4 KARTU STATISTIK AGREGAT ROMBEL */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <School size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Total Rombel</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{stats.totalRombel}</p>
            <p className="text-[10px] text-slate-400 font-medium">kelas aktif</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Total Siswa</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{stats.totalEnrolled}</p>
            <p className="text-[10px] text-emerald-600 font-bold">anak didik</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Rata-Rata per Kelas</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{stats.avgPerClass}</p>
            <p className="text-[10px] text-slate-400 font-medium">anak / rombel</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Kapasitas Terisi</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{stats.occupancyRate}%</p>
            <p className="text-[10px] text-slate-400 font-medium">dari {stats.totalCapacity} kursi</p>
          </div>
        </div>
      </div>

      {/* 4. TOOLBAR PENCARIAN & FILTER */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama rombel, ruangan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <select 
            value={selectedRoomFilter}
            onChange={e => setSelectedRoomFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold outline-none cursor-pointer"
          >
            <option value="ALL">Semua Lantai</option>
            <option value="Lantai 1">Lantai 1</option>
            <option value="Lantai 2">Lantai 2</option>
          </select>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Grid
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Tabel
            </button>
          </div>
        </div>
      </div>

      {/* 5. GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls, idx) => {
            const safeStudents = Array.isArray(students) ? students : [];
            const safeUsers = Array.isArray(users) ? users : [];
            const classStudents = safeStudents.filter(s => (s.class || '').replace('TK ', 'Kelas ') === cls.name);
            const waliKelas = safeUsers.find(u => u.role === 'teacher' && (u.assignedClass || '').replace('TK ', 'Kelas ') === cls.name);
            const studentCount = classStudents.length;
            const capacityPct = ((studentCount / (cls.capacity || 20)) * 100).toFixed(0);

            return (
              <div 
                key={cls.id || idx} 
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-indigo-200 dark:shadow-none">
                        {cls.name.replace('Kelas ', '')}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                          {cls.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                          <MapPin size={12} className="text-slate-400" /> {cls.room}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 border border-emerald-200">
                      Aktif
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    {cls.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-2 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                        <Users size={14} className="text-indigo-600" /> Siswa Terisi
                      </span>
                      <span className="font-extrabold text-slate-800 dark:text-white">
                        {studentCount} / {cls.capacity} Murid
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          capacityPct > 90 ? 'bg-rose-500' : capacityPct > 60 ? 'bg-indigo-600' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(capacityPct, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 font-medium">
                      <span className="flex items-center gap-1"><Clock size={12} /> {cls.schedule}</span>
                      <span className="font-bold text-indigo-600">{capacityPct}% Kapasitas</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${waliKelas?.name || 'Empty'}`} 
                        alt="Wali" 
                        className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wali Kelas</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[130px]">
                          {waliKelas?.name || 'Belum Ditugaskan'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => openClassDetail(cls)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 transition"
                        title="Lihat Daftar Siswa"
                      >
                        <Eye size={15} />
                      </button>

                      {isAdmin && (
                        <>
                          <button 
                            onClick={() => handleOpenEdit(cls)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-600 text-slate-500 transition"
                            title="Edit Konfigurasi Kelas"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button 
                            onClick={() => setDeleteModal({ show: true, classId: cls.id, className: cls.name })}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition"
                            title="Hapus Rombel"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 6. TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-indigo-900/60 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 w-12 text-center">No.</th>
                  <th className="px-6 py-4">Nama Rombel</th>
                  <th className="px-6 py-4">Ruangan</th>
                  <th className="px-6 py-4">Wali Kelas</th>
                  <th className="px-4 py-4 text-center">Terisi / Kapasitas</th>
                  <th className="px-6 py-4">Jadwal Belajar</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredClasses.map((cls, index) => {
                  const safeStudents = Array.isArray(students) ? students : [];
                  const safeUsers = Array.isArray(users) ? users : [];
                  const classStudents = safeStudents.filter(s => (s.class || '').replace('TK ', 'Kelas ') === cls.name);
                  const waliKelas = safeUsers.find(u => u.role === 'teacher' && (u.assignedClass || '').replace('TK ', 'Kelas ') === cls.name);

                  return (
                    <tr key={cls.id || index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-bold text-slate-400 text-center">{index + 1}</td>
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white text-sm">{cls.name}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{cls.room}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${waliKelas?.name || 'Empty'}`} className="w-6 h-6 rounded-full bg-slate-100" />
                          <span className="font-bold text-slate-800 dark:text-white">{waliKelas?.name || 'Belum Ditugaskan'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-bold text-indigo-600">
                        {classStudents.length} / {cls.capacity} Siswa
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{cls.schedule}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => openClassDetail(cls)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-indigo-600"><Eye size={14} /></button>
                          {isAdmin && (
                            <>
                              <button onClick={() => handleOpenEdit(cls)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-amber-600"><Edit2 size={14} /></button>
                              <button onClick={() => setDeleteModal({ show: true, classId: cls.id, className: cls.name })} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-rose-600"><Trash2 size={14} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: DETAIL KELAS & DAFTAR SISWA */}
      {detailModal.show && detailModal.classData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border dark:border-slate-800">
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center font-extrabold text-sm">
                  {detailModal.classData.name.replace('Kelas ', '')}
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">{detailModal.classData.name}</h3>
                  <p className="text-[10px] text-white/80">{detailModal.classData.room}</p>
                </div>
              </div>
              <button onClick={() => setDetailModal({ show: false, classData: null, students: [], teacher: null })} className="text-white/80 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Wali Kelas Pengampu</p>
                  <p className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">
                    {detailModal.teacher?.name || 'Belum Ditugaskan'}
                  </p>
                  <p className="text-[10px] text-slate-400">{detailModal.teacher?.email || '-'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Jam Pembelajaran</p>
                  <p className="font-bold text-indigo-600 text-xs mt-0.5">{detailModal.classData.schedule}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-white">
                  Daftar Murid ({detailModal.students?.length || 0} Siswa)
                </h4>

                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {!detailModal.students || detailModal.students.length === 0 ? (
                    <p className="text-slate-400 italic py-6 text-center">Belum ada siswa yang dimasukkan ke kelas ini.</p>
                  ) : (
                    detailModal.students.map((st, i) => (
                      <div key={st.id || i} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-slate-400 w-4 text-center">{i + 1}.</span>
                          <img src={st.photo} alt={st.name} className="w-7 h-7 rounded-full bg-slate-200 object-cover" />
                          <span className="font-bold text-slate-800 dark:text-white">{st.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{st.gender === 'P' ? 'Perempuan' : 'Laki-laki'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => setDetailModal({ show: false, classData: null, students: [], teacher: null })}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FORM TAMBAH / EDIT KELAS (KHUSUS ADMIN) */}
      {formModal.show && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-800">
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <School size={16} /> {formModal.isEdit ? 'Edit Konfigurasi Rombel' : 'Tambah Rombel Baru'}
              </h3>
              <button onClick={() => setFormModal({ show: false, isEdit: false, targetId: null })} className="text-white/80 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Nama Rombel / Kelas</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Kelas D"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Ruangan</label>
                  <input 
                    type="text" 
                    placeholder="Ruang Cempaka"
                    value={formData.room}
                    onChange={e => setFormData({ ...formData, room: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Kapasitas Kursi</label>
                  <input 
                    type="number" 
                    min="1"
                    max="50"
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Jadwal Pembelajaran</label>
                <input 
                  type="text" 
                  value={formData.schedule}
                  onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl outline-none"
                  placeholder="07:30 - 11:00 WIB"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Deskripsi / Program Belajar</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setFormModal({ show: false, isEdit: false, targetId: null })}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  {formModal.isEdit ? 'Perbarui Konfigurasi' : 'Simpan Rombel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: KONFIRMASI HAPUS ROMBEL */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border dark:border-slate-800 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Hapus Rombongan Belajar?</h4>
              <p className="text-xs text-slate-400 mt-1">
                Apakah Anda yakin ingin menghapus <b>"{deleteModal.className}"</b>?
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button 
                onClick={() => setDeleteModal({ show: false, classId: null, className: '' })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}