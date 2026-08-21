import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, UserCheck, Plus, Search, Filter, Eye, 
  Edit, Trash2, ChevronLeft, ChevronRight, Menu, 
  LogOut, ChevronDown, School, X
} from 'lucide-react';

// Helper ubah format YYYY-MM-DD ke "12 Jan 2021"
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '-';
  if (dateStr.includes(' ')) return dateStr;
  
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Helper ubah format teks kembali ke "YYYY-MM-DD" untuk input type="date"
const toInputDate = (dateStr) => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

export default function StudentDataPage({ 
  user = { name: 'Guru', role: 'teacher', assignedClass: 'TK A' }, 
  students = [], 
  onAddStudent = () => {}, 
  onUpdateStudent = () => {}, 
  onDeleteStudent = () => {}, 
  onLogout = () => {}, 
  onToggleSidebar = () => {} 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Modal State
  const [modalType, setModalType] = useState(null); // 'create' | 'edit' | 'detail' | null
  const [activeStudent, setActiveStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    class: 'TK A',
    gender: 'Laki-laki',
    birthDate: '',
    parentName: '',
    parentPhone: ''
  });

  const safeStudents = Array.isArray(students) ? students : [];

  const filteredStudents = safeStudents.filter(s => {
    if (!s) return false;
    const name = (s.name || '').toLowerCase();
    const parent = (s.parentName || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchSearch = name.includes(query) || parent.includes(query);
    const matchClass = selectedClass === 'ALL' || s.class === selectedClass;
    const sGender = s.gender || 'Laki-laki';
    const matchGender = selectedGender === 'ALL' || sGender === selectedGender;
    return matchSearch && matchClass && matchGender;
  });

  // Hitung Statistik
  const totalAnak = safeStudents.length;
  const countLaki = safeStudents.filter(s => (s?.gender || 'Laki-laki') === 'Laki-laki').length;
  const countPerempuan = safeStudents.filter(s => s?.gender === 'Perempuan').length;
  const pctLaki = totalAnak ? ((countLaki / totalAnak) * 100).toFixed(1) : '0.0';
  const pctPerempuan = totalAnak ? ((countPerempuan / totalAnak) * 100).toFixed(1) : '0.0';
  const uniqueClasses = Array.from(new Set(safeStudents.map(s => s?.class || 'TK A')));
  const totalKelas = uniqueClasses.length || 3;

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openCreateModal = () => {
    setFormData({
      name: '',
      class: 'TK A',
      gender: 'Laki-laki',
      birthDate: '',
      parentName: '',
      parentPhone: ''
    });
    setModalType('create');
  };

  const openEditModal = (student) => {
    setActiveStudent(student);
    setFormData({
      name: student?.name || '',
      class: student?.class || 'TK A',
      gender: student?.gender || 'Laki-laki',
      birthDate: toInputDate(student?.birthDate),
      parentName: student?.parentName || '',
      parentPhone: student?.parentPhone || ''
    });
    setModalType('edit');
  };

  const openDetailModal = (student) => {
    setActiveStudent(student);
    setModalType('detail');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const preparedData = {
      ...formData,
      birthDate: formatDisplayDate(formData.birthDate)
    };

    if (modalType === 'create') {
      onAddStudent(preparedData);
    } else if (modalType === 'edit' && activeStudent) {
      onUpdateStudent(activeStudent.id, preparedData);
    }
    setModalType(null);
  };

  const getClassBadgeStyle = (cls = '') => {
    if (cls.includes('A')) return 'bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800';
    if (cls.includes('B')) return 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    return 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
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
                <p className="text-[10px] text-slate-400">{user?.email || 'Guru TK'}</p>
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

      {/* 2. TITLE BAR & TOMBOL TAMBAH ANAK */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full pt-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Data Anak</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Kelola data anak didik TK Ceria.</p>
        </div>

        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-md shadow-indigo-200 dark:shadow-none self-start sm:self-auto"
        >
          <Plus size={16} /> Tambah Anak
        </button>
      </div>

      {/* 3. 4 KARTU STATISTIK RINGKASAN */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Total Anak</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{totalAnak}</p>
            <p className="text-[10px] text-slate-400 font-medium">anak</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0 overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Bima" className="w-10 h-10 object-cover" alt="Boy" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Laki-laki</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{countLaki}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">anak ({pctLaki}%)</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center shrink-0 overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aira" className="w-10 h-10 object-cover" alt="Girl" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Perempuan</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{countPerempuan}</p>
            <p className="text-[10px] text-rose-500 dark:text-rose-400 font-bold">anak ({pctPerempuan}%)</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <School size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Total Kelas</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{totalKelas}</p>
            <p className="text-[10px] text-slate-400 font-medium">kelas</p>
          </div>
        </div>
      </div>

      {/* 4. BARIS FILTER & PENCARIAN */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama anak..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="relative w-full md:w-48">
          <School size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select 
            value={selectedClass} 
            onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
          >
            <option value="ALL">Semua Kelas</option>
            <option value="TK A">Kelas A</option>
            <option value="TK B">Kelas B</option>
            <option value="TK C">Kelas C</option>
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">∨</span>
        </div>

        <div className="relative w-full md:w-56">
          <UserCheck size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select 
            value={selectedGender} 
            onChange={(e) => { setSelectedGender(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
          >
            <option value="ALL">Semua Jenis Kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">∨</span>
        </div>

        <button 
          onClick={() => { setSearchQuery(''); setSelectedClass('ALL'); setSelectedGender('ALL'); }}
          className="w-full md:w-auto px-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0"
        >
          <Filter size={14} /> Filter Lainnya
        </button>
      </div>

      {/* 5. TABEL DATA ANAK */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-indigo-900/60 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4 w-12 text-center">No.</th>
                <th className="px-3 py-4 w-16 text-center">Foto</th>
                <th className="px-5 py-4">Nama Anak</th>
                <th className="px-5 py-4">Kelas</th>
                <th className="px-5 py-4">Jenis Kelamin</th>
                <th className="px-5 py-4">Tanggal Lahir</th>
                <th className="px-5 py-4">Orang Tua / Wali</th>
                <th className="px-5 py-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400 italic">
                    Tidak ada data anak didik yang cocok dengan filter / pencarian.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s, index) => {
                  const no = (currentPage - 1) * itemsPerPage + index + 1;
                  const isGirl = s.gender === 'Perempuan';
                  const sClass = s.class || 'TK A';

                  return (
                    <tr key={s.id || index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 font-bold text-slate-400 text-center">{no}</td>
                      <td className="px-3 py-4 text-center">
                        <img 
                          src={s.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name || 'Anak'}`} 
                          alt={s.name || 'Anak'}
                          className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 object-cover mx-auto"
                        />
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800 dark:text-white text-sm">
                        {s.name || '-'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold inline-block ${getClassBadgeStyle(sClass)}`}>
                          {sClass.replace('TK ', 'Kelas ')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border ${
                          isGirl 
                            ? 'bg-rose-50/70 text-rose-500 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60' 
                            : 'bg-sky-50/70 text-sky-600 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/60'
                        }`}>
                          <span className="text-xs">⚥</span> {s.gender || 'Laki-laki'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300 font-medium">
                        {s.birthDate || '12 Jan 2021'}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800 dark:text-white leading-tight">{s.parentName || 'Ibu Melati'}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{s.parentPhone || '0812-3456-7890'}</p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => openDetailModal(s)}
                            className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl transition"
                            title="Lihat Detail"
                          >
                            <Eye size={15} />
                          </button>
                          <button 
                            onClick={() => openEditModal(s)}
                            className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-600 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl transition"
                            title="Edit Data"
                          >
                            <Edit size={15} />
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
            Menampilkan {filteredStudents.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredStudents.length)} dari {filteredStudents.length} anak
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

      {/* MODAL: TAMBAH / EDIT ANAK */}
      {(modalType === 'create' || modalType === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border dark:border-slate-800">
            <div className="p-5 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Users size={18} /> {modalType === 'create' ? 'Tambah Anak Didik Baru' : `Edit Data: ${activeStudent?.name}`}
              </h3>
              <button onClick={() => setModalType(null)} className="text-white/80 hover:text-white"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Nama Lengkap Anak</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: Aira Putri" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Pilih Kelas</label>
                  <select 
                    value={formData.class}
                    onChange={e => setFormData({ ...formData, class: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="TK A">Kelas A</option>
                    <option value="TK B">Kelas B</option>
                    <option value="TK C">Kelas C</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Jenis Kelamin</label>
                  <select 
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                {/* Tanggal Lahir (Pop-up Kalender) */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Tanggal Lahir</label>
                  <input 
                    type="date" 
                    max="2026-12-31"
                    value={formData.birthDate}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Nama Orang Tua / Wali</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Ibu Melati" 
                    value={formData.parentName}
                    onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Nomor Telepon / WhatsApp Wali</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: 0812-3456-7890" 
                    value={formData.parentPhone}
                    onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                {modalType === 'edit' && (
                  <button 
                    type="button" 
                    onClick={() => { onDeleteStudent(activeStudent.id); setModalType(null); }}
                    className="px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-2xl font-bold transition flex items-center gap-1.5"
                  >
                    <Trash2 size={15} /> Hapus
                  </button>
                )}
                
                <div className="flex gap-2 ml-auto">
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
                    {modalType === 'create' ? 'Simpan Data' : 'Perbarui'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL ANAK */}
      {modalType === 'detail' && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-800">
            <div className="p-5 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Eye size={18} /> Profil & Informasi Anak
              </h3>
              <button onClick={() => setModalType(null)} className="text-white/80 hover:text-white"><X size={18}/></button>
            </div>

            <div className="p-6 space-y-5 text-center">
              <img 
                src={activeStudent.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeStudent.name || 'Anak'}`} 
                alt={activeStudent.name}
                className="w-20 h-20 rounded-full bg-slate-100 border-2 border-indigo-200 mx-auto object-cover"
              />
              <div>
                <h4 className="text-lg font-extrabold text-slate-800 dark:text-white">{activeStudent.name}</h4>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{(activeStudent.class || 'TK A').replace('TK ', 'Kelas ')}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">JENIS KELAMIN</p>
                  <p className="font-bold text-slate-800 dark:text-white mt-0.5">{activeStudent.gender || 'Laki-laki'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">TANGGAL LAHIR</p>
                  <p className="font-bold text-slate-800 dark:text-white mt-0.5">{activeStudent.birthDate || '12 Jan 2021'}</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                  <p className="text-[10px] text-slate-400 font-bold">ORANG TUA / WALI</p>
                  <p className="font-bold text-slate-800 dark:text-white mt-0.5">{activeStudent.parentName || 'Ibu Melati'} ({activeStudent.parentPhone || '0812-3456-7890'})</p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  onClick={() => openEditModal(activeStudent)} 
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl transition"
                >
                  Edit Data Anak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}