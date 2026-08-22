import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, Phone, MessageSquare, Plus, Search, 
  Filter, Eye, Edit, Trash2, ChevronLeft, ChevronRight, 
  Menu, LogOut, ChevronDown, ShieldCheck, X, PhoneCall
} from 'lucide-react';

export default function ParentDataPage({ 
  user = { name: 'Bu Sari', role: 'teacher', assignedClass: 'TK A' }, 
  students = [], 
  onLogout = () => {}, 
  onToggleSidebar = () => {},
  onToast = () => {}
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
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

  // Data Orang Tua Default (Bisa diderive dari Siswa atau Custom)
  const defaultParents = [
    { id: 1, name: 'Ibu Melati', studentName: 'Aira Putri', class: 'Kelas A', phone: '0812-3456-7890', relation: 'Ibu', status: 'Aktif', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IbuMelati' },
    { id: 2, name: 'Bapak Andi', studentName: 'Bima Pratama', class: 'Kelas A', phone: '0812-3456-7891', relation: 'Ayah', status: 'Aktif', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BapakAndi' },
    { id: 3, name: 'Ibu Sinta', studentName: 'Cinta Meilani', class: 'Kelas A', phone: '0812-3456-7892', relation: 'Ibu', status: 'Aktif', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IbuSinta' },
    { id: 4, name: 'Bapak Rizi', studentName: 'Daffa Alfarizi', class: 'Kelas A', phone: '0812-3456-7893', relation: 'Ayah', status: 'Aktif', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BapakRizi' },
    { id: 5, name: 'Ibu Nurul', studentName: 'Eka Nur A.', class: 'Kelas B', phone: '0812-3456-7894', relation: 'Ibu', status: 'Aktif', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IbuNurul' },
    { id: 6, name: 'Bapak Fajar', studentName: 'Fathan Rafi', class: 'Kelas B', phone: '0812-3456-7895', relation: 'Ayah', status: 'Aktif', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BapakFajar' },
    { id: 7, name: 'Ibu Azizah', studentName: 'Ghina Azzahra', class: 'Kelas B', phone: '0812-3456-7896', relation: 'Ibu', status: 'Aktif', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IbuAzizah' },
    { id: 8, name: 'Bapak Dimas', studentName: 'Hafidz Ramadhan', class: 'Kelas C', phone: '0812-3456-7897', relation: 'Ayah', status: 'Aktif', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BapakDimas' },
    { id: 9, name: 'Ibu Permata', studentName: 'Intan Permata', class: 'Kelas C', phone: '0812-3456-7898', relation: 'Ibu', status: 'Aktif', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IbuPermata' },
    { id: 10, name: 'Bapak Arkan', studentName: 'Jovan Arkan', class: 'Kelas C', phone: '0812-3456-7899', relation: 'Ayah', status: 'Aktif', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BapakArkan' },
  ];

  const [parentList, setParentList] = useState(() => {
    try {
      const saved = sessionStorage.getItem('tk_session_parents');
      return saved ? JSON.parse(saved) : defaultParents;
    } catch {
      return defaultParents;
    }
  });

  useEffect(() => {
    sessionStorage.setItem('tk_session_parents', JSON.stringify(parentList));
  }, [parentList]);

  // Modal State
  const [modalType, setModalType] = useState(null); // 'create' | 'edit' | 'detail' | null
  const [activeParent, setActiveParent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    studentName: '',
    class: 'Kelas A',
    phone: '',
    relation: 'Ibu',
    status: 'Aktif'
  });

  // Filter Data
  const filteredParents = parentList.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(query) || 
                        p.studentName.toLowerCase().includes(query) ||
                        p.phone.includes(query);
    const matchClass = selectedClass === 'ALL' || p.class === selectedClass;
    const matchStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    return matchSearch && matchClass && matchStatus;
  });

  // Statistik
  const totalOrangTua = parentList.length;
  const countAktif = parentList.filter(p => p.status === 'Aktif').length;
  const pctAktif = totalOrangTua ? ((countAktif / totalOrangTua) * 100).toFixed(1) : '100';
  const avgPerKelas = totalOrangTua ? Math.round(totalOrangTua / 3) : 8;
  const totalGrupWA = 3;

  // Pagination
  const totalPages = Math.ceil(filteredParents.length / itemsPerPage) || 1;
  const paginatedParents = filteredParents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openCreateModal = () => {
    setFormData({
      name: '',
      studentName: '',
      class: 'Kelas A',
      phone: '',
      relation: 'Ibu',
      status: 'Aktif'
    });
    setModalType('create');
  };

  const openEditModal = (p) => {
    setActiveParent(p);
    setFormData({
      name: p.name,
      studentName: p.studentName,
      class: p.class,
      phone: p.phone,
      relation: p.relation || 'Ibu',
      status: p.status || 'Aktif'
    });
    setModalType('edit');
  };

  const openDetailModal = (p) => {
    setActiveParent(p);
    setModalType('detail');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    if (modalType === 'create') {
      const newParent = {
        id: Date.now(),
        ...formData,
        photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`
      };
      setParentList([...parentList, newParent]);
      if (onToast) onToast(`Data "${formData.name}" berhasil ditambahkan!`, 'success');
    } else if (modalType === 'edit' && activeParent) {
      setParentList(parentList.map(p => p.id === activeParent.id ? { ...p, ...formData } : p));
      if (onToast) onToast(`Data "${formData.name}" diperbarui!`, 'orange');
    }
    setModalType(null);
  };

  const handleDelete = (id, name) => {
    setParentList(parentList.filter(p => p.id !== id));
    if (onToast) onToast(`Data "${name}" berhasil dihapus`, 'error');
  };

  // Helper Badge Kelas
  const getClassBadge = (cls) => {
    if (cls.includes('A')) return 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800';
    if (cls.includes('B')) return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
  };

  // Helper Badge Hubungan
  const getRelationBadge = (relation) => {
    if (relation === 'Ibu') {
      return 'bg-rose-50/80 text-rose-500 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60';
    }
    return 'bg-sky-50/80 text-sky-600 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/60';
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

      {/* 2. TITLE BAR & TOMBOL TAMBAH ORANG TUA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full pt-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Orang Tua / Wali</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Kelola data orang tua / wali murid TK Ceria.</p>
        </div>

        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-md shadow-indigo-200 dark:shadow-none self-start sm:self-auto"
        >
          <Plus size={16} /> Tambah Orang Tua
        </button>
      </div>

      {/* 3. 4 KARTU STATISTIK RINGKASAN PERSIS GAMBAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        
        {/* Total Orang Tua */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Total Orang Tua</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{totalOrangTua}</p>
            <p className="text-[10px] text-slate-400 font-medium">orang tua / wali</p>
          </div>
        </div>

        {/* Nomor Aktif */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Phone size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Nomor Aktif</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{countAktif}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">({pctAktif}%)</p>
          </div>
        </div>

        {/* Orang Tua per Kelas */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Orang Tua per Kelas</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{avgPerKelas}</p>
            <p className="text-[10px] text-slate-400 font-medium">rata-rata</p>
          </div>
        </div>

        {/* Grup WhatsApp */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Grup WhatsApp</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{totalGrupWA}</p>
            <p className="text-[10px] text-slate-400 font-medium">grup aktif</p>
          </div>
        </div>

      </div>

      {/* 4. BARIS FILTER & PENCARIAN */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama orang tua / wali..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Filter Kelas */}
        <div className="relative w-full md:w-48">
          <select 
            value={selectedClass} 
            onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
          >
            <option value="ALL">Semua Kelas</option>
            <option value="Kelas A">Kelas A</option>
            <option value="Kelas B">Kelas B</option>
            <option value="Kelas C">Kelas C</option>
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">∨</span>
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

        {/* Tombol Filter */}
        <button 
          onClick={() => { setSearchQuery(''); setSelectedClass('ALL'); setSelectedStatus('ALL'); }}
          className="w-full md:w-auto px-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0"
        >
          <Filter size={14} /> Filter Lainnya
        </button>

      </div>

      {/* 5. TABEL DATA ORANG TUA */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden w-full">
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-indigo-900/60 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4 w-12 text-center">No.</th>
                <th className="px-3 py-4 w-16 text-center">Foto</th>
                <th className="px-5 py-4">Nama Orang Tua / Wali</th>
                <th className="px-5 py-4">Anak</th>
                <th className="px-5 py-4 text-center">Kelas</th>
                <th className="px-5 py-4">No. HP</th>
                <th className="px-5 py-4 text-center">Hubungan</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedParents.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-slate-400 italic">
                    Tidak ada data orang tua / wali yang cocok dengan pencarian / filter.
                  </td>
                </tr>
              ) : (
                paginatedParents.map((p, index) => {
                  const no = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr key={p.id || index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 font-bold text-slate-400 text-center">{no}</td>
                      
                      {/* Foto */}
                      <td className="px-3 py-4 text-center">
                        <img 
                          src={p.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} 
                          alt={p.name}
                          className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 object-cover mx-auto"
                        />
                      </td>

                      {/* Nama Orang Tua */}
                      <td className="px-5 py-4 font-bold text-slate-800 dark:text-white text-sm">
                        {p.name}
                      </td>

                      {/* Nama Anak */}
                      <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                        {p.studentName}
                      </td>

                      {/* Kelas */}
                      <td className="px-5 py-4 text-center">
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold border inline-flex items-center justify-center ${getClassBadge(p.class)}`}>
                          {p.class}
                        </span>
                      </td>

                      {/* No HP & Quick WA Link */}
                      <td className="px-5 py-4">
                        <a 
                          href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 font-medium transition flex items-center gap-1.5"
                          title="Kirim pesan WhatsApp"
                        >
                          {p.phone}
                        </a>
                      </td>

                      {/* Hubungan */}
                      <td className="px-5 py-4 text-center">
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold border inline-flex items-center justify-center ${getRelationBadge(p.relation)}`}>
                          {p.relation}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60 inline-block">
                          {p.status || 'Aktif'}
                        </span>
                      </td>

                      {/* Tombol Aksi */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => openDetailModal(p)}
                            className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl transition"
                            title="Lihat Detail"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            onClick={() => openEditModal(p)}
                            className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-600 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl transition"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl transition"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
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
            Menampilkan {filteredParents.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredParents.length)} dari {filteredParents.length} orang tua
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
            <Users size={22} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">Informasi</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Data orang tua / wali digunakan untuk komunikasi dan informasi seputar kegiatan serta absensi anak.
            </p>
          </div>
        </div>

        <a 
          href="https://chat.whatsapp.com" 
          target="_blank" 
          rel="noreferrer"
          className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 shadow-sm"
        >
          <MessageSquare size={16} /> Kelola Grup WhatsApp
        </a>
      </div>

      {/* MODAL: TAMBAH / EDIT ORANG TUA */}
      {(modalType === 'create' || modalType === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-800">
            <div className="p-5 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Users size={18} /> {modalType === 'create' ? 'Tambah Data Orang Tua / Wali' : `Edit: ${activeParent?.name}`}
              </h3>
              <button onClick={() => setModalType(null)} className="text-white/80 hover:text-white"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Nama Orang Tua / Wali</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Ibu Melati" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Nama Anak Didik</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Aira Putri" 
                  value={formData.studentName}
                  onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Kelas</label>
                  <select 
                    value={formData.class}
                    onChange={e => setFormData({ ...formData, class: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Kelas A">Kelas A</option>
                    <option value="Kelas B">Kelas B</option>
                    <option value="Kelas C">Kelas C</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Hubungan</label>
                  <select 
                    value={formData.relation}
                    onChange={e => setFormData({ ...formData, relation: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Ibu">Ibu</option>
                    <option value="Ayah">Ayah</option>
                    <option value="Wali">Wali</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Nomor WhatsApp / HP</label>
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
                  {modalType === 'create' ? 'Simpan Data' : 'Perbarui'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL ORANG TUA */}
      {modalType === 'detail' && activeParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-800">
            <div className="p-5 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Eye size={18} /> Profil Orang Tua / Wali
              </h3>
              <button onClick={() => setModalType(null)} className="text-white/80 hover:text-white"><X size={18}/></button>
            </div>

            <div className="p-6 space-y-4 text-center">
              <img 
                src={activeParent.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeParent.name}`} 
                alt={activeParent.name}
                className="w-20 h-20 rounded-full bg-slate-100 border-2 border-indigo-200 mx-auto object-cover"
              />
              <div>
                <h4 className="text-lg font-extrabold text-slate-800 dark:text-white">{activeParent.name}</h4>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{activeParent.relation} dari {activeParent.studentName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">KELAS ANAK</p>
                  <p className="font-bold text-slate-800 dark:text-white mt-0.5">{activeParent.class}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">STATUS NOMOR</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{activeParent.status}</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                  <p className="text-[10px] text-slate-400 font-bold">WHATSAPP / NO. HP</p>
                  <p className="font-bold text-slate-800 dark:text-white mt-0.5">{activeParent.phone}</p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <a 
                  href={`https://wa.me/${activeParent.phone.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2"
                >
                  <PhoneCall size={16} /> Hubungi via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}