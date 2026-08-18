import React, { useState } from 'react';
import { Pencil, Plus, Trash2, Shield, UserCheck, Search } from 'lucide-react';

export default function AdminDashboard({ 
  students, users, 
  onAddStudent, onUpdateStudent, onDeleteStudent,
  onAddUser, onUpdateUser, onDeleteUser 
}) {
  const [activeTab, setActiveTab] = useState('siswa');
  const [searchStudent, setSearchStudent] = useState('');
  const [searchUser, setSearchUser] = useState('');

  const [formStudent, setFormStudent] = useState({ id: null, name: '', class: 'TK A' });
  const [formUser, setFormUser] = useState({ id: null, name: '', email: '', password: '', role: 'teacher', assignedClass: 'TK A' });

  // FILTERED DATA
  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchStudent.toLowerCase()));
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase()));

  const handleSubmitStudent = () => {
    if(!formStudent.name) return;
    if(formStudent.id) onUpdateStudent(formStudent.id, formStudent.name, formStudent.class);
    else onAddStudent(formStudent.name, formStudent.class);
    setFormStudent({ id: null, name: '', class: 'TK A' });
  };

  const handleEditStudent = (s) => { 
    setFormStudent(s); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleSubmitUser = () => {
    if(!formUser.name || !formUser.email || !formUser.password) return;
    
    const finalClass = formUser.role === 'teacher' ? formUser.assignedClass : 'ALL';
    const payload = { ...formUser, assignedClass: finalClass };

    if(formUser.id) onUpdateUser(formUser.id, payload);
    else onAddUser(payload);

    setFormUser({ id: null, name: '', email: '', password: '', role: 'teacher', assignedClass: 'TK A' });
  };

  const handleEditUser = (u) => {
    setFormUser({ ...u });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Banner Admin Header */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield size={16} /> Control Panel Tata Usaha
          </div>
          <h2 className="text-2xl font-bold">Pengelolaan Master Data</h2>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
          <button onClick={() => setActiveTab('siswa')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'siswa' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            Data Siswa ({students.length})
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            Akun Sistem ({users.length})
          </button>
        </div>
      </div>

      {/* TAB 1: MANAJEMEN SISWA */}
      {activeTab === 'siswa' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <div className={`p-5 sm:p-6 rounded-3xl border sticky top-24 transition-colors ${formStudent.id ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'}`}>
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${formStudent.id ? 'text-orange-700' : 'text-slate-800'}`}>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${formStudent.id ? 'bg-orange-200 text-orange-700' : 'bg-indigo-100 text-indigo-600'}`}>{formStudent.id ? <Pencil size={18}/> : <Plus size={18}/>}</span>
                {formStudent.id ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">NAMA LENGKAP SISWA</label>
                  <input value={formStudent.name} onChange={e=>setFormStudent({...formStudent, name:e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Contoh: Muhammad Budi" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">PLOT KELAS</label>
                  <select value={formStudent.class} onChange={e=>setFormStudent({...formStudent, class:e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>TK A</option>
                    <option>TK B</option>
                  </select>
                </div>
                <button onClick={handleSubmitStudent} className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-lg transition ${formStudent.id ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-800 hover:bg-black'}`}>
                  {formStudent.id ? 'Update Perubahan' : '+ Simpan Ke Database'}
                </button>
                {formStudent.id && <button onClick={()=>setFormStudent({id:null, name:'', class:'TK A'})} className="w-full text-xs text-slate-500 py-2 font-bold">Batal Edit</button>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="font-bold text-slate-700">Daftar Siswa Terdaftar</h3>
                
                {/* Search Bar Input */}
                <div className="relative w-full sm:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cari nama siswa..." 
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                    <tr><th className="px-6 py-4">Siswa</th><th className="px-6 py-4">Kelas</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredStudents.length === 0 ? (
                      <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400 text-xs italic">Siswa tidak ditemukan.</td></tr>
                    ) : (
                      filteredStudents.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition group">
                          <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-3"><img src={s.photo} className="w-8 h-8 rounded-full bg-slate-100 object-cover"/>{s.name}</td>
                          <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-md text-xs font-bold ${s.class==='TK A'?'bg-blue-50 text-blue-600':'bg-purple-50 text-purple-600'}`}>{s.class}</span></td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={()=>handleEditStudent(s)} className="p-2 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition"><Pencil size={16}/></button>
                              <button onClick={()=>{if(confirm('Hapus siswa ini dari database?')) onDeleteStudent(s.id)}} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAJEMEN AKUN SISTEM */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <div className={`p-5 sm:p-6 rounded-3xl border sticky top-24 transition-colors ${formUser.id ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'}`}>
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${formUser.id ? 'text-orange-700' : 'text-slate-800'}`}>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${formUser.id ? 'bg-orange-200 text-orange-700' : 'bg-indigo-100 text-indigo-600'}`}>{formUser.id ? <Pencil size={18}/> : <Plus size={18}/>}</span>
                {formUser.id ? 'Edit Akun Pengguna' : 'Tambah Akun Baru'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">NAMA PENGGUNA</label>
                  <input value={formUser.name} onChange={e=>setFormUser({...formUser, name:e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Bu Murni (Guru TK A)" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">EMAIL AKSES</label>
                  <input type="email" value={formUser.email} onChange={e=>setFormUser({...formUser, email:e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="murni@tk.com" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">PASSWORD</label>
                  <input type="text" value={formUser.password} onChange={e=>setFormUser({...formUser, password:e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Password login" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">ROLE AKSES</label>
                  <select value={formUser.role} onChange={e=>setFormUser({...formUser, role:e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="teacher">Guru Kelas (Teacher)</option>
                    <option value="kepsek">Kepala Sekolah (Kepsek)</option>
                    <option value="admin">Admin TU (Administrator)</option>
                  </select>
                </div>

                {formUser.role === 'teacher' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">PLOT KELAS PENGAMPU</label>
                    <select value={formUser.assignedClass} onChange={e=>setFormUser({...formUser, assignedClass:e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="TK A">TK A</option>
                      <option value="TK B">TK B</option>
                    </select>
                  </div>
                )}

                <button onClick={handleSubmitUser} className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-lg transition ${formUser.id ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-800 hover:bg-black'}`}>
                  {formUser.id ? 'Update Akun' : '+ Buat Akun Baru'}
                </button>
                {formUser.id && <button onClick={()=>setFormUser({id:null, name:'', email:'', password:'', role:'teacher', assignedClass:'TK A'})} className="w-full text-xs text-slate-500 py-2 font-bold">Batal Edit</button>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="font-bold text-slate-700">Daftar Akun Pengguna Sistem</h3>
                
                {/* Search Bar Input */}
                <div className="relative w-full sm:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cari nama/email..." 
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Pengguna</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Akses Kelas</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400 text-xs italic">Akun tidak ditemukan.</td></tr>
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800">{u.name}</p>
                            <p className="text-xs text-slate-400 font-mono">{u.email} • Pass: {u.password}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              u.role === 'admin' ? 'bg-slate-900 text-white' :
                              u.role === 'kepsek' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-600">{u.assignedClass}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={()=>handleEditUser(u)} className="p-2 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition"><Pencil size={16}/></button>
                              <button onClick={()=>{if(confirm(`Hapus akun ${u.name}?`)) onDeleteUser(u.id)}} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}