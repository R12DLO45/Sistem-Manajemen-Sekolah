import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Users, UserPlus, Search, Edit2, Trash2, 
  ChevronDown, Menu, LogOut, X, Eye, 
  Phone, Calendar, User, ShieldCheck, Filter
} from 'lucide-react';

export default function StudentDataPage({ 
  user = { name: 'Admin TU', role: 'admin', assignedClass: 'ALL' }, 
  students = [], 
  onAddStudent = () => {}, 
  onUpdateStudent = () => {}, 
  onDeleteStudent = () => {}, 
  onLogout = () => {}, 
  onToggleSidebar = () => {} 
}) {
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const teacherClass = (user?.assignedClass || 'Kelas A').replace('TK ', 'Kelas ');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState(isTeacher ? teacherClass : 'ALL');

  // Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState(null);

  // Detail Modal
  const [detailModal, setDetailModal] = useState({ show: false, student: null });

  // Delete Confirm Modal
  const [deleteModal, setDeleteModal] = useState({ show: false, studentId: null, studentName: '' });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    class: isTeacher ? teacherClass : 'Kelas A',
    gender: 'L',
    birthDate: '',
    parentName: '',
    phone: '',
    address: ''
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

  // Filter Data Siswa Berdasarkan Hak Akses Role
  const filteredStudents = useMemo(() => {
    const list = Array.isArray(students) ? students : [];
    return list
      .filter(s => {
        if (isTeacher) {
          return (s.class || '').replace('TK ', 'Kelas ') === teacherClass;
        }
        if (filterClass === 'ALL') return true;
        return (s.class || '').replace('TK ', 'Kelas ') === filterClass;
      })
      .filter(s => (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  }, [students, isTeacher, teacherClass, filterClass, searchQuery]);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setCurrentStudentId(null);
    setFormData({
      name: '',
      class: isTeacher ? teacherClass : 'Kelas A',
      gender: 'L',
      birthDate: '',
      parentName: '',
      phone: '',
      address: ''
    });
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (s) => {
    setIsEditMode(true);
    setCurrentStudentId(s.id);
    setFormData({
      name: s.name || '',
      class: (s.class || 'Kelas A').replace('TK ', 'Kelas '),
      gender: s.gender || 'L',
      birthDate: s.birthDate || '',
      parentName: s.parentName || '',
      phone: s.phone || '',
      address: s.address || ''
    });
    setFormModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (isEditMode) {
      onUpdateStudent(currentStudentId, formData);
    } else {
      onAddStudent(formData);
    }
    setFormModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteModal.studentId) {
      onDeleteStudent(deleteModal.studentId);
      setDeleteModal({ show: false, studentId: null, studentName: '' });
    }
  };

  return (
    <div className="space-y-5 w-full font-sans pb-10">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between transition-all">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition"
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

      {/* 2. TITLE BAR & TOMBOL TAMBAH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full pt-1">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Data Anak Didik
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
            {isTeacher 
              ? `Daftar siswa terdaftar khusus di ${teacherClass}.` 
              : 'Kelola database informasi anak dan kontak wali murid.'}
          </p>
        </div>

        {isAdmin && (
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-md shadow-indigo-200 dark:shadow-none self-start sm:self-auto"
          >
            <UserPlus size={16} />
            <span>Tambah Anak</span>
          </button>
        )}
      </div>

      {/* 3. TOOLBAR PENCARIAN & FILTER KELAS */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama anak..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Rombel Kelas */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 shrink-0">Kelas:</span>
          <select 
            value={filterClass}
            disabled={isTeacher}
            onChange={(e) => setFilterClass(e.target.value)}
            className={`w-full sm:w-40 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold outline-none cursor-pointer ${
              isTeacher ? 'opacity-80 cursor-not-allowed bg-slate-100' : ''
            }`}
          >
            {!isTeacher && <option value="ALL">Semua Kelas</option>}
            <option value="Kelas A">Kelas A</option>
            <option value="Kelas B">Kelas B</option>
            <option value="Kelas C">Kelas C</option>
          </select>
        </div>
      </div>

      {/* 4. TABEL DATA SISWA */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-indigo-900/60 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 w-12 text-center">No.</th>
                <th className="px-4 py-4 w-16 text-center">Foto</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-4 py-4 text-center">Kelas</th>
                <th className="px-4 py-4 text-center">Gender</th>
                <th className="px-6 py-4">Nama Orang Tua</th>
                <th className="px-6 py-4">Kontak Telepon</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-slate-400 italic">
                    Data anak tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, index) => (
                  <tr key={s.id || index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-bold text-slate-400 text-center">{index + 1}</td>
                    <td className="px-4 py-4 text-center">
                      <img src={s.photo} className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 object-cover mx-auto" alt={s.name} />
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white text-sm">
                      {s.name}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                      {s.class}
                    </td>
                    <td className="px-4 py-4 text-center font-bold">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${s.gender === 'P' ? 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'}`}>
                        {s.gender === 'P' ? 'Perempuan' : 'Laki-laki'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                      {s.parentName || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {s.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Tombol Detail */}
                        <button
                          onClick={() => setDetailModal({ show: true, student: s })}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition"
                          title="Lihat Detail"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Tombol Edit & Hapus (Khusus Admin) */}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(s)}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 text-slate-500 hover:text-amber-600 transition"
                              title="Edit Data"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ show: true, studentId: s.id, studentName: s.name })}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition"
                              title="Hapus Siswa"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TAMBAH / EDIT SISWA (KHUSUS ADMIN) */}
      {formModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border dark:border-slate-800">
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <UserPlus size={18} /> {isEditMode ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button onClick={() => setFormModalOpen(false)} className="text-white/80 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Nama Lengkap Siswa</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Aira Putri"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Kelas / Rombel</label>
                  <select 
                    value={formData.class}
                    onChange={e => setFormData({ ...formData, class: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl outline-none cursor-pointer"
                  >
                    <option value="Kelas A">Kelas A</option>
                    <option value="Kelas B">Kelas B</option>
                    <option value="Kelas C">Kelas C</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Jenis Kelamin</label>
                  <select 
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl outline-none cursor-pointer"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Nama Orang Tua / Wali</label>
                  <input 
                    type="text" 
                    placeholder="Nama Orang Tua"
                    value={formData.parentName}
                    onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Nomor Telepon / WhatsApp</label>
                  <input 
                    type="text" 
                    placeholder="0812..."
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  {isEditMode ? 'Perbarui Data' : 'Simpan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL SISWA */}
      {detailModal.show && detailModal.student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border dark:border-slate-800">
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Informasi Detail Anak</h3>
              <button onClick={() => setDetailModal({ show: false, student: null })} className="text-white/80 hover:text-white"><X size={18}/></button>
            </div>
            <div className="p-6 text-center space-y-4 text-xs">
              <img src={detailModal.student.photo} alt="Avatar" className="w-20 h-20 rounded-full bg-indigo-50 border-2 border-indigo-200 mx-auto object-cover" />
              <div>
                <h4 className="text-base font-extrabold text-slate-800 dark:text-white">{detailModal.student.name}</h4>
                <p className="text-xs text-indigo-600 font-bold">{detailModal.student.class}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-left space-y-2">
                <div className="flex justify-between"><span className="text-slate-400">Gender:</span><span className="font-bold text-slate-800 dark:text-white">{detailModal.student.gender === 'P' ? 'Perempuan' : 'Laki-laki'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Orang Tua:</span><span className="font-bold text-slate-800 dark:text-white">{detailModal.student.parentName || '-'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Kontak:</span><span className="font-bold text-indigo-600">{detailModal.student.phone || '-'}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS (KHUSUS ADMIN) */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border dark:border-slate-800 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Hapus Data Siswa?</h4>
              <p className="text-xs text-slate-400 mt-1">
                Apakah Anda yakin ingin menghapus data <b>"{deleteModal.studentName}"</b>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button 
                onClick={() => setDeleteModal({ show: false, studentId: null, studentName: '' })}
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