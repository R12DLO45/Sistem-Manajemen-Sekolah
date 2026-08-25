import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  GraduationCap, UserPlus, Search, Edit2, Trash2, 
  ChevronDown, Menu, LogOut, X, Eye, 
  ShieldCheck, Users, CheckCircle2, KeyRound, Lock, Mail, Phone, Hash
} from 'lucide-react';

export default function TeacherDataPage({ 
  user = { name: 'Admin TU', role: 'admin', assignedClass: 'ALL' }, 
  users = [], 
  onAddUser = () => {}, 
  onUpdateUser = () => {}, 
  onDeleteUser = () => {}, 
  onLogout = () => {}, 
  onToggleSidebar = () => {},
  onToast = () => {}
}) {
  const isAdmin = user?.role === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  // Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [detailModal, setDetailModal] = useState({ show: false, userData: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, userId: null, userName: '' });
  const [resetPassModal, setResetPassModal] = useState({ show: false, user: null, newPass: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher',
    assignedClass: 'Kelas A',
    nip: '',
    phone: ''
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

  const teacherStats = useMemo(() => {
    const safeUsers = Array.isArray(users) ? users : [];
    const totalTeachers = safeUsers.filter(u => u.role === 'teacher').length;
    const assignedTeachers = safeUsers.filter(u => u.role === 'teacher' && u.assignedClass && u.assignedClass !== 'ALL').length;
    return { totalTeachers, totalStaff: safeUsers.length, assignedTeachers };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return (Array.isArray(users) ? users : [])
      .filter(u => filterRole === 'ALL' ? true : u.role === filterRole)
      .filter(u => 
        (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.nip || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [users, filterRole, searchQuery]);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setCurrentUserId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'teacher',
      assignedClass: 'Kelas A',
      nip: '',
      phone: ''
    });
    setFormModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setIsEditMode(true);
    setCurrentUserId(t.id);
    setFormData({
      name: t.name || '',
      email: t.email || '',
      password: t.password || '',
      role: t.role || 'teacher',
      assignedClass: (t.assignedClass || 'Kelas A').replace('TK ', 'Kelas '),
      nip: t.nip || '',
      phone: t.phone || ''
    });
    setFormModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      return onToast('Nama dan Email login wajib diisi!', 'error');
    }
    if (!isEditMode && !formData.password.trim()) {
      return onToast('Password wajib untuk pembuatan akun baru!', 'error');
    }

    const payload = { 
      ...formData, 
      assignedClass: formData.role === 'teacher' ? formData.assignedClass : 'ALL' 
    };

    if (isEditMode) {
      onUpdateUser(currentUserId, payload);
    } else {
      onAddUser(payload);
    }
    setFormModalOpen(false);
  };

  const handleConfirmResetPass = (e) => {
    e.preventDefault();
    if (!resetPassModal.newPass.trim()) {
      return onToast('Password baru tidak boleh kosong!', 'error');
    }
    onUpdateUser(resetPassModal.user.id, { ...resetPassModal.user, password: resetPassModal.newPass });
    onToast(`Password untuk ${resetPassModal.user.name} berhasil diubah!`, 'success');
    setResetPassModal({ show: false, user: null, newPass: '' });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.userId) {
      onDeleteUser(deleteModal.userId);
      setDeleteModal({ show: false, userId: null, userName: '' });
    }
  };

  return (
    <div className="space-y-5 w-full font-sans pb-10">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between transition-all">
        <button onClick={onToggleSidebar} className="md:hidden p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-300 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
          <Menu size={22} />
        </button>

        <div className="relative ml-auto" ref={profileRef}>
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-left">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="Avatar" className="w-8 h-8 rounded-full bg-indigo-100 object-cover" />
            <div className="hidden sm:block pr-1">
              <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-medium">Admin TU</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 ml-0.5" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in duration-150">
              <button onClick={() => { setProfileOpen(false); onLogout(); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-left">
                <LogOut size={16} /> Keluar Akun
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. TITLE BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Data Pengajar & Tenaga Pendidik</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Kelola data akun guru, penugasan wali rombel, dan hak akses aplikasi.</p>
        </div>

        {isAdmin && (
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md self-start sm:self-auto transition">
            <UserPlus size={16} /> Tambah Pengajar
          </button>
        )}
      </div>

      {/* 3. KARTU STATISTIK */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0"><GraduationCap size={22} /></div>
          <div><p className="text-[10px] font-bold text-slate-400">Total Guru</p><p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{teacherStats.totalTeachers}</p><p className="text-[10px] text-slate-400 font-medium">pendidik aktif</p></div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"><CheckCircle2 size={22} /></div>
          <div><p className="text-[10px] font-bold text-slate-400">Wali Kelas Terisi</p><p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{teacherStats.assignedTeachers}</p><p className="text-[10px] text-emerald-600 font-bold">rombel terisi</p></div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0"><Users size={22} /></div>
          <div><p className="text-[10px] font-bold text-slate-400">Total Semua Akun</p><p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{teacherStats.totalStaff}</p><p className="text-[10px] text-slate-400 font-medium">staf & kepsek</p></div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0"><ShieldCheck size={22} /></div>
          <div><p className="text-[10px] font-bold text-slate-400">Kepegawaian</p><p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">100%</p><p className="text-[10px] text-slate-400 font-medium">terverifikasi</p></div>
        </div>
      </div>

      {/* 4. TOOLBAR SEARCH & FILTER */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama guru, email, NIP..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" 
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 shrink-0">Filter Role:</span>
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)} 
            className="w-full sm:w-48 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold outline-none cursor-pointer"
          >
            <option value="ALL">Semua Pengguna</option>
            <option value="teacher">Guru / Wali Kelas</option>
            <option value="kepsek">Kepala Sekolah</option>
            <option value="admin">Administrator TU</option>
          </select>
        </div>
      </div>

      {/* 5. TABEL PENGGUNA */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-indigo-900/60 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 w-12 text-center">No.</th>
                <th className="px-4 py-4 w-16 text-center">Foto</th>
                <th className="px-6 py-4">Nama & NIP</th>
                <th className="px-6 py-4">Email Login</th>
                <th className="px-4 py-4 text-center">Role Akses</th>
                <th className="px-4 py-4 text-center">Tugas Wali</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-400 italic">
                    Data pengajar tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, i) => (
                  <tr key={u.id || i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-bold text-slate-400 text-center">{i + 1}</td>
                    <td className="px-4 py-4 text-center">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 object-cover mx-auto" alt={u.name} />
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white text-sm">
                      {u.name}
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">NIP: {u.nip || '-'}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200' :
                        u.role === 'kepsek' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200' :
                        'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                      {u.role === 'teacher' ? (u.assignedClass || 'Kelas A') : 'Semua'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => setDetailModal({ show: true, userData: u })} 
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition" 
                          title="Lihat Detail Profil"
                        >
                          <Eye size={15} />
                        </button>
                        {isAdmin && (
                          <>
                            <button 
                              onClick={() => setResetPassModal({ show: true, user: u, newPass: '' })} 
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition" 
                              title="Reset Password Akun"
                            >
                              <KeyRound size={15} />
                            </button>
                            <button 
                              onClick={() => handleOpenEdit(u)} 
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 text-slate-500 hover:text-amber-600 transition" 
                              title="Edit Data Pengajar"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button 
                              onClick={() => setDeleteModal({ show: true, userId: u.id, userName: u.name })} 
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition" 
                              title="Hapus Akun Pengajar"
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

      {/* MODAL 1: TAMBAH / EDIT AKUN */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border dark:border-slate-800">
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <UserPlus size={18} /> {isEditMode ? 'Edit Data Pengajar' : 'Tambah Pengajar Baru'}
              </h3>
              <button onClick={() => setFormModalOpen(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Nama Lengkap & Gelar</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Contoh: Bu Sari, S.Pd" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Email Login</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="nama@tkceria.sch.id" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">NIP / Kode Pendidik</label>
                  <input 
                    type="text" 
                    placeholder="19900215..." 
                    value={formData.nip} 
                    onChange={e => setFormData({...formData, nip: e.target.value})} 
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl outline-none" 
                  />
                </div>
              </div>

              {!isEditMode && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Password Awal</label>
                  <input 
                    type="password" 
                    required 
                    placeholder="Minimal 4 karakter" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl outline-none" 
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Role Hak Akses</label>
                  <select 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})} 
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl outline-none cursor-pointer"
                  >
                    <option value="teacher">Guru / Wali Kelas</option>
                    <option value="kepsek">Kepala Sekolah</option>
                    <option value="admin">Administrator TU</option>
                  </select>
                </div>

                {formData.role === 'teacher' ? (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Penugasan Wali Kelas</label>
                    <select 
                      value={formData.assignedClass} 
                      onChange={e => setFormData({...formData, assignedClass: e.target.value})} 
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl outline-none cursor-pointer"
                    >
                      <option value="Kelas A">Kelas A</option>
                      <option value="Kelas B">Kelas B</option>
                      <option value="Kelas C">Kelas C</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-400">Penugasan Wali</label>
                    <input type="text" disabled value="Akses Semua Kelas" className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl cursor-not-allowed" />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setFormModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md">
                  {isEditMode ? 'Perbarui Data' : 'Simpan Pengajar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DETAIL PROFIL PENGGUNA */}
      {detailModal.show && detailModal.userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border dark:border-slate-800">
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Informasi Pendidik</h3>
              <button onClick={() => setDetailModal({ show: false, userData: null })} className="text-white/80 hover:text-white"><X size={18}/></button>
            </div>
            <div className="p-6 text-center space-y-4 text-xs">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${detailModal.userData.name}`} alt="Avatar" className="w-20 h-20 rounded-full bg-indigo-50 border-2 border-indigo-200 mx-auto object-cover" />
              <div>
                <h4 className="text-base font-extrabold text-slate-800 dark:text-white">{detailModal.userData.name}</h4>
                <p className="text-xs text-indigo-600 font-bold capitalize mt-0.5">Role: {detailModal.userData.role}</p>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-left space-y-2.5">
                <div className="flex justify-between items-center"><span className="text-slate-400 flex items-center gap-1.5"><Hash size={13}/> NIP:</span><span className="font-bold text-slate-800 dark:text-white">{detailModal.userData.nip || '-'}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400 flex items-center gap-1.5"><Mail size={13}/> Email:</span><span className="font-bold text-slate-800 dark:text-white">{detailModal.userData.email}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400 flex items-center gap-1.5"><ShieldCheck size={13}/> Tugas:</span><span className="font-bold text-indigo-600">{detailModal.userData.role === 'teacher' ? `Wali ${detailModal.userData.assignedClass}` : 'Akses Global'}</span></div>
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button onClick={() => setDetailModal({ show: false, userData: null })} className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-xl text-xs">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RESET PASSWORD */}
      {resetPassModal.show && resetPassModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border dark:border-slate-800">
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2"><KeyRound size={16}/> Reset Password</h3>
              <button onClick={() => setResetPassModal({ show: false, user: null, newPass: '' })} className="text-white/80 hover:text-white"><X size={18}/></button>
            </div>
            <form onSubmit={handleConfirmResetPass} className="p-6 space-y-4 text-xs">
              <p className="text-slate-500 dark:text-slate-400">Atur ulang password login untuk akun <strong>{resetPassModal.user.name}</strong> ({resetPassModal.user.email}).</p>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Password Baru</label>
                <input 
                  type="password" 
                  required
                  placeholder="Ketik password baru..." 
                  value={resetPassModal.newPass} 
                  onChange={e => setResetPassModal({...resetPassModal, newPass: e.target.value})} 
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setResetPassModal({ show: false, user: null, newPass: '' })} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl">Batal</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md">Simpan Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: KONFIRMASI HAPUS */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border dark:border-slate-800 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Hapus Akun Pengajar?</h4>
              <p className="text-xs text-slate-400 mt-1">
                Apakah Anda yakin ingin menghapus akun <b>"{deleteModal.userName}"</b>? Akun ini tidak akan bisa login lagi ke sistem.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button 
                onClick={() => setDeleteModal({ show: false, userId: null, userName: '' })}
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