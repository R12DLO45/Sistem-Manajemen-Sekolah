import React, { useState } from 'react';
import { Pencil, Plus, Trash2, Shield, UserCheck } from 'lucide-react';
import { SEED_USERS } from '../data/mockData';

export default function AdminDashboard({ students, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState({ id: null, name: '', class: 'TK A' });
  const [activeTab, setActiveTab] = useState('siswa'); // 'siswa' atau 'users'

  const handleSubmit = () => {
    if(!form.name) return;
    if(form.id) onUpdate(form.id, form.name, form.class);
    else onAdd(form.name, form.class);
    setForm({ id: null, name: '', class: 'TK A' });
  };

  const handleEdit = (s) => { 
    setForm(s); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  return (
    <div className="space-y-6">
      {/* Banner Admin */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield size={16} /> Control Panel Tata Usaha
          </div>
          <h2 className="text-2xl font-bold">Pengelolaan Master Data</h2>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('siswa')} 
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'siswa' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Data Siswa ({students.length})
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Akun Sistem ({SEED_USERS.length})
          </button>
        </div>
      </div>

      {/* TAB 1: MANAJEMEN SISWA */}
      {activeTab === 'siswa' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Form Input / Edit */}
          <div className="lg:col-span-1">
            <div className={`p-5 sm:p-6 rounded-3xl border sticky top-24 transition-colors ${form.id ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'}`}>
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${form.id ? 'text-orange-700' : 'text-slate-800'}`}>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.id ? 'bg-orange-200 text-orange-700' : 'bg-indigo-100 text-indigo-600'}`}>{form.id ? <Pencil size={18}/> : <Plus size={18}/>}</span>
                {form.id ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">NAMA LENGKAP SISWA</label>
                  <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Contoh: Muhammad Budi" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">PLOT KELAS</label>
                  <select value={form.class} onChange={e=>setForm({...form, class:e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>TK A</option>
                    <option>TK B</option>
                  </select>
                </div>
                <button onClick={handleSubmit} className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-lg transition ${form.id ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-800 hover:bg-black'}`}>
                  {form.id ? 'Update Perubahan' : '+ Simpan Ke Database'}
                </button>
                {form.id && <button onClick={()=>setForm({id:null, name:'', class:'TK A'})} className="w-full text-xs text-slate-500 py-2 font-bold">Batal Edit</button>}
              </div>
            </div>
          </div>

          {/* Tabel Master Siswa (Full Action) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-50"><h3 className="font-bold text-slate-700">Daftar Siswa Terdaftar</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                    <tr><th className="px-6 py-4">Siswa</th><th className="px-6 py-4">Kelas</th><th className="px-6 py-4 text-right">Aksi Manajemen</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {students.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition group">
                        <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-3"><img src={s.photo} className="w-8 h-8 rounded-full bg-slate-100 object-cover"/>{s.name}</td>
                        <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-md text-xs font-bold ${s.class==='TK A'?'bg-blue-50 text-blue-600':'bg-purple-50 text-purple-600'}`}>{s.class}</span></td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={()=>handleEdit(s)} className="p-2 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition" title="Edit Data"><Pencil size={16}/></button>
                            <button onClick={()=>{if(confirm('Hapus siswa ini dari database?')) onDelete(s.id)}} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition" title="Hapus Data"><Trash2 size={16}/></button>
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
      )}

      {/* TAB 2: MANAJEMEN AKUN SISTEM */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-6">
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
            <UserCheck size={20} className="text-indigo-600" />
            <h3>Daftar Pengguna Aplikasi</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Nama Pengguna</th>
                  <th className="p-4">Email Akses</th>
                  <th className="p-4">Role Akses</th>
                  <th className="p-4">Akses Kelas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {SEED_USERS.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-slate-800">{u.name}</td>
                    <td className="p-4 text-slate-500 font-mono text-xs">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-slate-900 text-white' :
                        u.role === 'kepsek' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-bold text-xs">{u.assignedClass}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}