import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, UserCheck, User, GraduationCap, Plus, 
  Search, Filter, Edit, Trash2, ChevronLeft, ChevronRight, 
  Menu, LogOut, ChevronDown, ShieldCheck, X, Users2
} from 'lucide-react';

export default function TeacherDataPage({ 
  user = { name: 'Bu Sari', role: 'teacher', assignedClass: 'TK A' }, 
  users = [],
  onAddUser = () => {},
  onUpdateUser = () => {},
  onDeleteUser = () => {},
  onLogout = () => {}, 
  onToggleSidebar = () => {},
  onToast = () => {}
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Profile Dropdown
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

  // Data Guru Default sesuai Gambar
  const defaultTeachers = [
    { id: 1, name: 'Bu Sari', email: 'sari@tk.com', roleDisplay: 'Guru', assignedClass: 'Kelas A', phone: '0812-3456-7890', status: 'Aktif', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BuSari' },
    { id: 2, name: 'Bu Rina', email: 'rina@tk.com', roleDisplay: 'Guru', assignedClass: 'Kelas B', phone: '0812-3456-7891', status: 'Aktif', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BuRina' },
    { id: 3, name: 'Bu Dewi', email: 'dewi@tk.com', roleDisplay: 'Guru', assignedClass: 'Kelas C', phone: '0812-3456-7892', status: 'Aktif', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BuDewi' },
    { id: 4, name: 'Bu Ani', email: 'ani@tk.com', roleDisplay: 'Guru Pendamping', assignedClass: '-', phone: '0812-3456-7893', status: 'Aktif', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BuAni' },
    { id: 5, name: 'Pak Andi', email: 'andi@tk.com', roleDisplay: 'Guru Pendamping', assignedClass: '-', phone: '0812-3456-7894', status: 'Aktif', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PakAndi' },
    { id: 6, name: 'Bu Lala', email: 'lala@tk.com', roleDisplay: 'Tata Usaha', assignedClass: '-', phone: '0812-3456-7895', status: 'Aktif', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BuLala' },
  ];

  const [teacherList, setTeacherList] = useState(() => {
    try {
      const saved = sessionStorage.getItem('tk_session_teachers_page');
      return saved ? JSON.parse(saved) : defaultTeachers;
    } catch {
      return defaultTeachers;
    }
  });

  useEffect(() => {
    sessionStorage.setItem('tk_session_teachers_page', JSON.stringify(teacherList));
  }, [teacherList]);

  // Modal Form State
  const [modalType, setModalType] = useState(null); // 'create' | 'edit' | null
  const [activeTeacher, setActiveTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleDisplay: 'Guru',
    assignedClass: 'Kelas A',
    phone: '',
    status: 'Aktif'
  });

  // Filter List Guru
  const filteredTeachers = teacherList.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.phone.includes(searchQuery);
    const matchStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    const matchRole = selectedRole === 'ALL' || t.roleDisplay === selectedRole;
    return matchSearch && matchStatus && matchRole;
  });

  // Statistik Data
  const totalGuru = teacherList.length;
  const countAktif = teacherList.filter(t => t.status === 'Aktif').length;
  const pctAktif = totalGuru ? Math.round((countAktif / totalGuru) * 100) : 100;
  const countWali = teacherList.filter(t => t.assignedClass && t.assignedClass !== '-').length;
  const countTenagaPendidik = totalGuru;

  // Pagination Logic
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage) || 1;
  const paginatedTeachers = filteredTeachers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openCreateModal = () => {
    setFormData({
      name: '',
      email: '',
      roleDisplay: 'Guru',
      assignedClass: 'Kelas A',
      phone: '',
      status: 'Aktif'
    });
    setModalType('create');
  };

  const openEditModal = (t) => {
    setActiveTeacher(t);
    setFormData({
      name: t.name,
      email: t.email || '',
      roleDisplay: t.roleDisplay || 'Guru',
      assignedClass: t.assignedClass || '-',
      phone: t.phone || '',
      status: t.status || 'Aktif'
    });
    setModalType('edit');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    if (modalType === 'create') {
      const newTeacher = {
        id: Date.now(),
        ...formData,
        photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`
      };
      setTeacherList([...teacherList, newTeacher]);
      if (onToast) onToast(`Data ${formData.name} berhasil ditambahkan!`, 'success');
    } else if (modalType === 'edit' && activeTeacher) {
      setTeacherList(teacherList.map(t => t.id === activeTeacher.id ? { ...t, ...formData } : t));
      if (onToast) onToast(`Data ${formData.name} berhasil diperbarui!`, 'orange');
    }
    setModalType(null);
  };

  const handleDelete = (id, name) => {
    setTeacherList(teacherList.filter(t => t.id !== id));
    if (onToast) onToast(`Data "${name}" berhasil dihapus`, 'error');
  };

  // Badge Warna Peran
  const getRoleBadge = (roleDisplay) => {
    if (roleDisplay === 'Guru') {
      return 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900/50';
    }
    if (roleDisplay === 'Guru Pendamping') {
      return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/50';
    }
    return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/50';
  };

  // Badge Warna Wali Kelas (Support Rata Tengah)
  const getClassBadge = (cls) => {
    if (!cls || cls === '-') return <span className="text-slate-400 font-bold">-</span>;
    if (cls.includes('A')) {
      return <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 inline-flex items-center justify-center">{cls}</span>;
    }
    if (cls.includes('B')) {
      return <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 inline-flex items-center justify-center">{cls}</span>;
    }
    return <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 inline-flex items-center justify-center">{cls}</span>;
  };

  return (
    <div className="space-y-5 w-full">
      
      {/* 1. TOP NAVBAR STICKY MELAYANG */}
      <header className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between transition-all">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition"
          title="Buka Menu"
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
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 sm:hidden">
                <p className="text-xs font-bold text-slate-800 dark:text-white">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400">{user?.email || 'Guru'}</p>
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

      {/* 2. TITLE BAR & TOMBOL TAMBAH GURU */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full pt-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Guru</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Kelola data guru dan tenaga pendidik di TK Ceria.</p>
        </div>

        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-md shadow-indigo-200 dark:shadow-none self-start sm:self-auto"
        >
          <Plus size={16} /> Tambah Guru
        </button>
      </div>

      {/* 3. 4 KARTU STATISTIK RINGKASAN PERSIS GAMBAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        
        {/* Total Guru */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Total Guru</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{totalGuru}</p>
            <p className="text-[10px] text-slate-400 font-medium">orang</p>
          </div>
        </div>

        {/* Guru Aktif */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Guru Aktif</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{countAktif}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">orang ({pctAktif}%)</p>
          </div>
        </div>

        {/* Guru Wali Kelas */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <User size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Guru Wali Kelas</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{countWali}</p>
            <p className="text-[10px] text-slate-400 font-medium">orang</p>
          </div>
        </div>

        {/* Tenaga Pendidik */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Tenaga Pendidik</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{countTenagaPendidik}</p>
            <p className="text-[10px] text-slate-400 font-medium">orang</p>
          </div>
        </div>

      </div>

      {/* 4. BARIS FILTER & PENCARIAN */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
        
        {/* Search Bar Input */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama guru..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Filter Status */}
        <div className="relative w-full md:w-48">
          <select 
            value={selectedStatus} 
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">∨</span>
        </div>

        {/* Filter Peran */}
        <div className="relative w-full md:w-52">
          <select 
            value={selectedRole} 
            onChange={(e) => { setSelectedRole(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
          >
            <option value="ALL">Semua Peran</option>
            <option value="Guru">Guru</option>
            <option value="Guru Pendamping">Guru Pendamping</option>
            <option value="Tata Usaha">Tata Usaha</option>
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">∨</span>
        </div>

        {/* Tombol Filter */}
        <button 
          onClick={() => { setSearchQuery(''); setSelectedStatus('ALL'); setSelectedRole('ALL'); }}
          className="w-full md:w-auto px-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0"
        >
          <Filter size={14} /> Filter
        </button>

      </div>

      {/* 5. TABEL DATA GURU */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden w-full">
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-indigo-900/60 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4 w-12 text-center">No.</th>
                <th className="px-3 py-4 w-16 text-center">Foto</th>
                <th className="px-5 py-4">Nama Guru</th>
                <th className="px-5 py-4">Peran</th>
                <th className="px-5 py-4 text-center">Wali Kelas</th>
                <th className="px-5 py-4">No. HP</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedTeachers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400 italic">
                    Tidak ada data guru yang cocok dengan pencarian / filter.
                  </td>
                </tr>
              ) : (
                paginatedTeachers.map((t, index) => {
                  const no = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr key={t.id || index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 font-bold text-slate-400 text-center">{no}</td>
                      
                      {/* Foto */}
                      <td className="px-3 py-4 text-center">
                        <img 
                          src={t.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`} 
                          alt={t.name}
                          className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 object-cover mx-auto"
                        />
                      </td>

                      {/* Nama Guru */}
                      <td className="px-5 py-4 font-bold text-slate-800 dark:text-white text-sm">
                        {t.name}
                      </td>

                      {/* Peran Badge */}
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold border inline-block ${getRoleBadge(t.roleDisplay)}`}>
                          {t.roleDisplay}
                        </span>
                      </td>

                      {/* Wali Kelas Pill (Rata Tengah / Center Aligned) */}
                      <td className="px-5 py-4 text-center">
                        {getClassBadge(t.assignedClass)}
                      </td>

                      {/* No HP */}
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300 font-medium">
                        {t.phone || '0812-3456-7890'}
                      </td>

                      {/* Status Aktif */}
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60 inline-block">
                          {t.status || 'Aktif'}
                        </span>
                      </td>

                      {/* Tombol Aksi */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => openEditModal(t)}
                            className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl transition"
                            title="Edit Guru"
                          >
                            <Edit size={15} />
                          </button>
                          <button 
                            onClick={() => handleDelete(t.id, t.name)}
                            className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl transition"
                            title="Hapus Guru"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 6. FOOTER PAGINATION */}
        <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Menampilkan {filteredTeachers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTeachers.length)} dari {filteredTeachers.length} guru
          </p>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-xl font-bold transition flex items-center justify-center ${
                  currentPage === page 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' 
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* 7. CARD BANNER INFORMASI DI BAWAH */}
      <div className="p-4 sm:p-5 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">Informasi</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Pastikan data guru selalu diperbarui untuk kelancaran proses absensi dan administrasi.
            </p>
          </div>
        </div>

        <button 
          onClick={openCreateModal}
          className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 shadow-sm"
        >
          <Users2 size={16} /> Kelola Peran Guru
        </button>
      </div>

      {/* MODAL: TAMBAH / EDIT GURU */}
      {(modalType === 'create' || modalType === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-800">
            <div className="p-5 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Users size={18} /> {modalType === 'create' ? 'Tambah Guru / Tenaga Pendidik' : `Edit: ${activeTeacher?.name}`}
              </h3>
              <button onClick={() => setModalType(null)} className="text-white/80 hover:text-white"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Nama Lengkap Guru</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Bu Sari" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Peran / Jabatan</label>
                  <select 
                    value={formData.roleDisplay}
                    onChange={e => setFormData({ ...formData, roleDisplay: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Guru">Guru</option>
                    <option value="Guru Pendamping">Guru Pendamping</option>
                    <option value="Tata Usaha">Tata Usaha</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Wali Kelas</label>
                  <select 
                    value={formData.assignedClass}
                    onChange={e => setFormData({ ...formData, assignedClass: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="-">Bukan Wali Kelas (-)</option>
                    <option value="Kelas A">Kelas A</option>
                    <option value="Kelas B">Kelas B</option>
                    <option value="Kelas C">Kelas C</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Nomor Telepon / WhatsApp</label>
                <input 
                  type="text" 
                  placeholder="Contoh: 0812-3456-7890" 
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setModalType(null)} 
                  className="px-4 py-2.5 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition"
                >
                  {modalType === 'create' ? 'Simpan Guru' : 'Perbarui'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}