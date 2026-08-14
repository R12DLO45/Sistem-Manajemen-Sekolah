import React, { useState, useEffect } from 'react';
import { useMockStore } from './lib/mockStore';
import { 
  LogOut, Check, X, AlertCircle, Plus, 
  LayoutDashboard, Users, Clock, ShieldCheck, ChevronRight,
  Pencil, Trash2 
} from 'lucide-react';

// KOMPONEN JAM REALTIME
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="text-right">
      <p className="text-3xl font-bold text-slate-800 leading-none">
        {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
      </p>
      <p className="text-xs text-slate-500 font-medium">
        {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>
  );
};

export default function App() {
  const { user, students, attendance, login, logout, markAttendance, addStudent } = useMockStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // HALAMAN LOGIN 
  if (!user) {
    return (
      <div className="min-h-screen flex bg-slate-50 font-sans text-slate-800">
        {/* Sisi Kiri (Branding) */}
        <div className="hidden lg:flex w-1/2 bg-indigo-600 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90"></div>
          <div className="relative z-10 text-center text-white px-10">
            <h1 className="text-5xl font-bold mb-4">SiHadir TK</h1>
            <p className="text-indigo-100 text-lg">Sistem Informasi Kehadiran Siswa<br/>Terintegrasi & Real-time.</p>
          </div>
          {/* Hiasan Circle */}
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        </div>

        {/* Sisi Kanan (Form Login) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mb-4 lg:hidden">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Selamat Datang</h2>
              <p className="text-slate-500 mt-2">Masuk untuk mengakses dashboard presensi.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Email Akses</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="name@school.id"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                  <AlertCircle size={16} /> {errorMsg}
                </div>
              )}

              <button 
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => { 
                    const res = login(email, password);
                    if (!res.success) setErrorMsg(res.message);
                    setIsLoading(false);
                  }, 800);
                }}
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Memproses...' : 'Masuk ke Dashboard'}
              </button>
            </div>

            <div className="mt-8 text-center text-xs text-slate-400">
              <p>Demo Access:</p>
              <div className="mt-2 space-x-2">
                <span className="bg-slate-100 px-2 py-1 rounded border">guru@tk.com / 123</span>
                <span className="bg-slate-100 px-2 py-1 rounded border">kepsek@tk.com / 123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN LAYOUT (DASHBOARD) 
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Top Navbar Modern */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold shadow-md ${user.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
                {user.name.charAt(0)}
             </div>
             <div className="leading-tight">
               <h1 className="text-sm font-bold text-slate-900">{user.name}</h1>
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{user.role === 'admin' ? 'Administrator' : 'Pengajar'}</span>
             </div>
          </div>
          <button onClick={logout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {user.role === 'teacher' ? (
          <TeacherDashboard students={students} attendance={attendance} onMark={markAttendance} />
        ) : (
          <AdminDashboard students={students} attendance={attendance} onAddStudent={addStudent} />
        )}
      </main>
    </div>
  );
}

// DASHBOARD GURU 
function TeacherDashboard({ students, attendance, onMark }) {
  const today = new Date().toISOString().split('T')[0];
  const classes = [...new Set(students.map(s => s.class))];

  return (
    <div className="space-y-6">
      {/* Header Widget */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Presensi Harian</h2>
          <p className="text-slate-500 text-sm">Silakan input kehadiran siswa hari ini.</p>
        </div>
        <LiveClock />
      </div>

      {classes.map(className => (
        <div key={className} className="space-y-3">
          <div className="flex items-center gap-2 px-1">
             <div className="h-4 w-1 bg-indigo-500 rounded-full"></div>
             <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">{className}</h3>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {students.filter(s => s.class === className).map(student => {
              const status = attendance.find(a => a.studentId === student.id && a.date === today)?.status;

              return (
                <div key={student.id} className={`bg-white p-4 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                  status ? 'border-indigo-100 ring-2 ring-indigo-50/50' : 'border-slate-100'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-white shadow-sm">
                        <img src={student.photo} alt="" className="w-full h-full object-cover"/>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{student.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {student.id}</p>
                      </div>
                    </div>
                    {/* Status Badge Kecil */}
                    {status && (
                       <span className={`w-2 h-2 rounded-full ${
                         status === 'hadir' ? 'bg-green-500' : status === 'sakit' ? 'bg-orange-500' : 'bg-red-500'
                       }`}></span>
                    )}
                  </div>
                  
                  {/* Tombol Modern */}
                  <div className="flex bg-slate-50 p-1 rounded-xl gap-1">
                    <ModernVoteBtn 
                      active={status === 'hadir'} 
                      onClick={() => onMark(student.id, 'hadir', today)} 
                      type="hadir" icon={<Check size={14} strokeWidth={3} />} 
                    />
                    <ModernVoteBtn 
                      active={status === 'sakit'} 
                      onClick={() => onMark(student.id, 'sakit', today)} 
                      type="sakit" icon={<AlertCircle size={14} strokeWidth={3} />} 
                    />
                    <ModernVoteBtn 
                      active={status === 'alpha'} 
                      onClick={() => onMark(student.id, 'alpha', today)} 
                      type="alpha" icon={<X size={14} strokeWidth={3} />} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Tombol Khusus Guru
function ModernVoteBtn({ active, onClick, type, icon }) {
  const styles = {
    hadir: active ? "bg-white text-green-600 shadow-sm ring-1 ring-green-500" : "text-slate-400 hover:text-green-600 hover:bg-white",
    sakit: active ? "bg-white text-orange-600 shadow-sm ring-1 ring-orange-500" : "text-slate-400 hover:text-orange-600 hover:bg-white",
    alpha: active ? "bg-white text-red-600 shadow-sm ring-1 ring-red-500" : "text-slate-400 hover:text-red-600 hover:bg-white",
  };

  return (
    <button 
      onClick={onClick} 
      className={`flex-1 py-2 rounded-lg transition-all duration-200 flex justify-center items-center ${styles[type]}`}
    >
      {icon}
    </button>
  );
}


// DASHBOARD ADMIN 
function AdminDashboard({ students, attendance, onAddStudent }) {
  // Ambil fungsi tambahan dari store
  const { deleteStudent, updateStudent } = useMockStore();

  // State Form
  const [name, setName] = useState('');
  const [className, setClassName] = useState('TK A');
  const [editingId, setEditingId] = useState(null); // Jika null = Mode Tambah, Jika ada ID = Mode Edit

  const today = new Date().toISOString().split('T')[0];
  const totalSiswa = students.length;
  const hadirHariIni = attendance.filter(a => a.date === today && a.status === 'hadir').length;
  const persentase = totalSiswa > 0 ? Math.round((hadirHariIni / totalSiswa) * 100) : 0;

  // Handler Tombol Simpan/Update
  const handleSubmit = () => {
    if (!name) return;

    if (editingId) {
      // Mode Edit
      updateStudent(editingId, name, className);
      setEditingId(null); // Reset ke mode tambah
    } else {
      // Mode Tambah
      onAddStudent(name, className);
    }
    
    // Reset Form
    setName('');
    setClassName('TK A');
  };

  // Handler Tombol Edit di Tabel
  const handleEditClick = (student) => {
    setEditingId(student.id);
    setName(student.name);
    setClassName(student.class);
    // Scroll ke atas agar user sadar form berubah
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler Tombol Hapus
  const handleDeleteClick = (id) => {
    if (window.confirm("Yakin ingin menghapus siswa ini? Data absensi lama mungkin akan terdampak.")) {
      deleteStudent(id);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Overview Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-indigo-600">
               <Users size={18} /> <span className="text-xs font-bold uppercase tracking-wider">Total Siswa</span>
            </div>
            <p className="text-4xl font-bold text-slate-800">{totalSiswa}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
           <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-green-600">
               <Check size={18} /> <span className="text-xs font-bold uppercase tracking-wider">Hadir Hari Ini</span>
            </div>
            <p className="text-4xl font-bold text-slate-800">{hadirHariIni}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-3xl shadow-lg shadow-indigo-200 flex flex-col justify-between">
           <div>
             <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Persentase Kehadiran</span>
             <div className="flex items-end gap-2 mt-1">
               <p className="text-4xl font-bold">{persentase}%</p>
               <span className="text-sm mb-1 opacity-80">Today</span>
             </div>
           </div>
           <div className="w-full bg-black/20 h-2 rounded-full mt-4 overflow-hidden">
              <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${persentase}%` }}></div>
           </div>
        </div>
      </div>

      {/* 2. Management Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Form Tambah/Edit */}
        <div className="lg:col-span-1">
          <div className={`p-6 rounded-3xl shadow-sm border sticky top-24 transition-colors duration-300 ${editingId ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'}`}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${editingId ? 'text-orange-700' : 'text-slate-800'}`}>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${editingId ? 'bg-orange-200 text-orange-700' : 'bg-indigo-100 text-indigo-600'}`}>
                {editingId ? <Pencil size={18}/> : <Plus size={18}/>}
              </span>
              {editingId ? 'Edit Data Siswa' : 'Input Siswa Baru'}
            </h3>
            
            <div className="space-y-3">
              <input 
                type="text" placeholder="Nama Lengkap" 
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={name} onChange={e => setName(e.target.value)}
              />
              <select 
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={className} onChange={e => setClassName(e.target.value)}
              >
                <option>TK A</option>
                <option>TK B</option>
              </select>
              
              <button 
                onClick={handleSubmit}
                className={`w-full text-white py-3 rounded-xl font-bold text-sm transition shadow-lg ${
                    editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-800 hover:bg-black'
                }`}
              >
                {editingId ? 'Update Perubahan' : '+ Simpan Data'}
              </button>

              {editingId && (
                <button 
                  onClick={() => {
                    setEditingId(null);
                    setName('');
                    setClassName('TK A');
                  }}
                  className="w-full text-slate-500 py-2 text-xs font-bold hover:text-slate-700"
                >
                  Batal Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* List Data */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-700">Database Siswa</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Siswa</th>
                    <th className="px-6 py-4">Kelas</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition group">
                      <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-3">
                         <img src={s.photo} alt="" className="w-8 h-8 rounded-full bg-slate-100 object-cover"/>
                         {s.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${s.class === 'TK A' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                          {s.class}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => handleEditClick(s)}
                                className="p-2 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition" 
                                title="Edit"
                            >
                                <Pencil size={16} />
                            </button>
                            <button 
                                onClick={() => handleDeleteClick(s.id)}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="Hapus"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}