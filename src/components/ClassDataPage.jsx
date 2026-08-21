// src/components/ClassDataPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  School, Users, UserCheck, Calendar, Plus, 
  Search, Download, Edit, Trash2, ChevronLeft, ChevronRight, 
  Menu, LogOut, ChevronDown, ShieldCheck, X, Users2
} from 'lucide-react';

export default function ClassDataPage({ 
  user = { name: 'Guru', role: 'teacher', assignedClass: 'TK A' }, 
  students = [], 
  users = [],
  onLogout = () => {}, 
  onToggleSidebar = () => {},
  onToast = () => {},
  setActiveMenu = () => {}
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Profile Dropdown State
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

  // State Data Kelas (Local Storage / Session)
  const [classes, setClasses] = useState(() => {
    try {
      const saved = sessionStorage.getItem('tk_session_classes');
      return saved ? JSON.parse(saved) : [
        { id: 1, name: 'Kelas A', code: 'TK A', teacherName: 'Bu Sari', academicYear: '2025/2026', status: 'Aktif', color: 'indigo' },
        { id: 2, name: 'Kelas B', code: 'TK B', teacherName: 'Bu Rina', academicYear: '2025/2026', status: 'Aktif', color: 'emerald' },
        { id: 3, name: 'Kelas C', code: 'TK C', teacherName: 'Bu Dewi', academicYear: '2025/2026', status: 'Aktif', color: 'amber' },
      ];
    } catch {
      return [
        { id: 1, name: 'Kelas A', code: 'TK A', teacherName: 'Bu Sari', academicYear: '2025/2026', status: 'Aktif', color: 'indigo' },
        { id: 2, name: 'Kelas B', code: 'TK B', teacherName: 'Bu Rina', academicYear: '2025/2026', status: 'Aktif', color: 'emerald' },
        { id: 3, name: 'Kelas C', code: 'TK C', teacherName: 'Bu Dewi', academicYear: '2025/2026', status: 'Aktif', color: 'amber' },
      ];
    }
  });

  useEffect(() => {
    sessionStorage.setItem('tk_session_classes', JSON.stringify(classes));
  }, [classes]);

  // Modal State
  const [modalType, setModalType] = useState(null); // 'create' | 'edit' | null
  const [activeClass, setActiveClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    teacherName: 'Bu Sari',
    academicYear: '2025/2026',
    status: 'Aktif',
    color: 'indigo'
  });

  // Filter List Kelas
  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Perhitungan Statistik
  const totalClasses = classes.length;
  const totalStudents = students.length;
  const totalTeachers = new Set(classes.map(c => c.teacherName)).size;
  const activeYear = '2025/2026';

  // Helper Hitung Anak Per Kelas
  const getStudentCount = (classCode, className) => {
    return students.filter(s => s.class === classCode || s.class === className).length;
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage) || 1;
  const paginatedClasses = filteredClasses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openCreateModal = () => {
    setFormData({
      name: '',
      code: '',
      teacherName: users.find(u => u.role === 'teacher')?.name || 'Bu Sari',
      academicYear: '2025/2026',
      status: 'Aktif',
      color: 'indigo'
    });
    setModalType('create');
  };

  const openEditModal = (cls) => {
    setActiveClass(cls);
    setFormData({
      name: cls.name,
      code: cls.code,
      teacherName: cls.teacherName,
      academicYear: cls.academicYear,
      status: cls.status,
      color: cls.color || 'indigo'
    });
    setModalType('edit');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    if (modalType === 'create') {
      const newClass = {
        id: Date.now(),
        ...formData,
        code: formData.code || formData.name
      };
      setClasses([...classes, newClass]);
      if (onToast) onToast(`Kelas "${formData.name}" berhasil dibuat!`, 'success');
    } else if (modalType === 'edit' && activeClass) {
      setClasses(classes.map(c => c.id === activeClass.id ? { ...c, ...formData } : c));
      if (onToast) onToast(`Data ${formData.name} diperbarui!`, 'orange');
    }
    setModalType(null);
  };

  const handleDeleteClass = (id, name) => {
    setClasses(classes.filter(c => c.id !== id));
    if (onToast) onToast(`Kelas "${name}" berhasil dihapus`, 'error');
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "No,Nama Kelas,Wali Kelas,Jumlah Anak,Tahun Ajaran,Status\n" +
      classes.map((c, i) => `${i+1},${c.name},${c.teacherName},${getStudentCount(c.code, c.name)},${c.academicYear},${c.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `data_kelas_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onToast) onToast('Data kelas berhasil diexport ke CSV!', 'success');
  };

  // Badge Warna Inisial Kelas Box
  const getClassBoxBadge = (name = '', color = 'indigo') => {
    const initial = name.replace('Kelas ', '').charAt(0) || 'A';
    if (initial === 'A' || color === 'indigo') {
      return { bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300', label: initial };
    }
    if (initial === 'B' || color === 'emerald') {
      return { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', label: initial };
    }
    return { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', label: initial };
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
                <p className="text-[10px] text-slate-400">{user?.email || 'Wali Kelas'}</p>
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

      {/* 2. TITLE BAR & TOMBOL TAMBAH KELAS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full pt-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Kelas</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Kelola data kelas yang ada di TK Ceria.</p>
        </div>

        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-md shadow-indigo-200 dark:shadow-none self-start sm:self-auto"
        >
          <Plus size={16} /> Tambah Kelas
        </button>
      </div>

      {/* 3. 4 KARTU STATISTIK RINGKASAN PERSIS GAMBAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        
        {/* Total Kelas */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <School size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Total Kelas</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{totalClasses}</p>
            <p className="text-[10px] text-slate-400 font-medium">kelas</p>
          </div>
        </div>

        {/* Total Anak */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Total Anak</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{totalStudents}</p>
            <p className="text-[10px] text-slate-400 font-medium">anak</p>
          </div>
        </div>

        {/* Wali Kelas */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Wali Kelas</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{totalTeachers}</p>
            <p className="text-[10px] text-slate-400 font-medium">guru</p>
          </div>
        </div>

        {/* Tahun Ajaran */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Tahun Ajaran</p>
            <p className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white leading-tight">{activeYear}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Aktif</p>
          </div>
        </div>

      </div>

      {/* 4. BARIS PENCARIAN & TOMBOL EXPORT */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
        
        {/* Search Bar Input */}
        <div className="relative flex-1 max-w-md w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari kelas..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Tombol Export */}
        <button 
          onClick={handleExport}
          className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0"
        >
          <Download size={14} /> Export
        </button>

      </div>

      {/* 5. TABEL DATA KELAS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden w-full">
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-indigo-900/60 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 w-12 text-center">No.</th>
                <th className="px-6 py-4">Nama Kelas</th>
                <th className="px-6 py-4">Wali Kelas</th>
                <th className="px-6 py-4">Jumlah Anak</th>
                <th className="px-6 py-4">Tahun Ajaran</th>
                <th className="px-6 py-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedClasses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">
                    Tidak ada data kelas yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                paginatedClasses.map((cls, index) => {
                  const no = (currentPage - 1) * itemsPerPage + index + 1;
                  const badge = getClassBoxBadge(cls.name, cls.color);
                  const studentCount = getStudentCount(cls.code, cls.name);

                  return (
                    <tr key={cls.id || index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-bold text-slate-400 text-center">{no}</td>
                      
                      {/* Nama Kelas dengan Box Inisial */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 ${badge.bg}`}>
                            {badge.label}
                          </div>
                          <span className="font-bold text-slate-800 dark:text-white text-sm">{cls.name}</span>
                        </div>
                      </td>

                      {/* Wali Kelas dengan Foto & Badge */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${cls.teacherName}`} 
                            alt={cls.teacherName}
                            className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 object-cover shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white leading-tight">{cls.teacherName}</p>
                            <span className="px-2 py-0.5 mt-0.5 rounded-md text-[9px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 inline-block">
                              Wali Kelas
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Jumlah Anak */}
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                        {studentCount} anak
                      </td>

                      {/* Tahun Ajaran & Status Aktif */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{cls.academicYear}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60">
                            {cls.status}
                          </span>
                        </div>
                      </td>

                      {/* Tombol Aksi (Edit & Hapus) */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => openEditModal(cls)}
                            className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl transition"
                            title="Edit Kelas"
                          >
                            <Edit size={15} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClass(cls.id, cls.name)}
                            className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl transition"
                            title="Hapus Kelas"
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
            Menampilkan {filteredClasses.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredClasses.length)} dari {filteredClasses.length} kelas
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
              Setiap kelas dapat memiliki wali kelas yang bertanggung jawab mengelola absensi dan data anak.
            </p>
          </div>
        </div>

        <button 
          onClick={() => setActiveMenu('guru')}
          className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 shadow-sm"
        >
          <Users2 size={16} /> Kelola Wali Kelas
        </button>
      </div>

      {/* MODAL: TAMBAH / EDIT KELAS */}
      {(modalType === 'create' || modalType === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-800">
            <div className="p-5 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <School size={18} /> {modalType === 'create' ? 'Tambah Kelas Baru' : `Edit: ${activeClass?.name}`}
              </h3>
              <button onClick={() => setModalType(null)} className="text-white/80 hover:text-white"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Nama Kelas</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Kelas D" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Pilih Wali Kelas</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Bu Sari" 
                  value={formData.teacherName}
                  onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Tahun Ajaran</label>
                  <input 
                    type="text" 
                    placeholder="2025/2026" 
                    value={formData.academicYear}
                    onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
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
                  {modalType === 'create' ? 'Simpan Kelas' : 'Perbarui'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}