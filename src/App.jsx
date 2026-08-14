import React, { useState } from 'react';
import { useMockStore } from './lib/mockStore';
import { LogOut, CheckCircle, XCircle, AlertCircle, Plus, Users, CalendarCheck } from 'lucide-react';

export default function App() {
  const { user, students, attendance, login, logout, markAttendance, addStudent } = useMockStore();
  
  // State Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // --- HALAMAN LOGIN ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-blue-100">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="text-blue-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Presensi TK Ceria</h1>
            <p className="text-gray-500 text-sm mt-1">Sistem Absensi Digital</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">EMAIL</label>
              <input 
                type="email" 
                placeholder="guru@tk.com" 
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">PASSWORD</label>
              <input 
                type="password" 
                placeholder="123" 
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button 
              onClick={() => {
                const res = login(email, password);
                if (!res.success) setErrorMsg(res.message);
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition active:scale-95"
            >
              Masuk Aplikasi
            </button>
            
            {errorMsg && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100">{errorMsg}</div>}
            
            <div className="mt-6 pt-4 border-t text-xs text-gray-400 text-center">
              <p>Demo Login:</p>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded mx-1">guru@tk.com / 123</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded mx-1">kepsek@tk.com / 123</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- HALAMAN UTAMA (DASHBOARD) ---
  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                {user.name.charAt(0)}
             </div>
             <div>
               <h1 className="text-sm font-bold text-gray-800 leading-tight">{user.name}</h1>
               <p className="text-xs text-gray-500 capitalize">{user.role === 'admin' ? 'Kepala Sekolah' : 'Guru Kelas'}</p>
             </div>
          </div>
          <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {user.role === 'teacher' ? (
          <TeacherDashboard students={students} attendance={attendance} onMark={markAttendance} />
        ) : (
          <AdminDashboard students={students} attendance={attendance} onAddStudent={addStudent} />
        )}
      </main>
    </div>
  );
}

// === KOMPONEN UI GURU ===
function TeacherDashboard({ students, attendance, onMark }) {
  const today = new Date().toISOString().split('T')[0];
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const todayFormatted = new Date().toLocaleDateString('id-ID', options);

  // Group siswa berdasarkan kelas
  const classes = [...new Set(students.map(s => s.class))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Absensi Hari Ini</h2>
        <span className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{todayFormatted}</span>
      </div>

      {classes.map(className => (
        <div key={className} className="space-y-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider pl-1 border-l-4 border-blue-500 ml-1">{className}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {students.filter(s => s.class === className).map(student => {
              const status = attendance.find(a => a.studentId === student.id && a.date === today)?.status;

              return (
                <div key={student.id} className={`bg-white p-4 rounded-xl shadow-sm border transition-all ${status ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <img src={student.photo} alt={student.name} className="w-12 h-12 rounded-full bg-gray-100" />
                    <div>
                      <h4 className="font-bold text-gray-800">{student.name}</h4>
                      <p className={`text-xs font-medium px-2 py-0.5 rounded w-fit mt-1 ${
                        status === 'hadir' ? 'bg-green-100 text-green-700' :
                        status === 'sakit' ? 'bg-orange-100 text-orange-700' :
                        status === 'alpha' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {status ? status.toUpperCase() : 'Belum Absen'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <VoteButton active={status === 'hadir'} onClick={() => onMark(student.id, 'hadir', today)} color="green" icon={<CheckCircle size={16}/>} label="Hadir" />
                    <VoteButton active={status === 'sakit'} onClick={() => onMark(student.id, 'sakit', today)} color="orange" icon={<AlertCircle size={16}/>} label="Sakit/Izin" />
                    <VoteButton active={status === 'alpha'} onClick={() => onMark(student.id, 'alpha', today)} color="red" icon={<XCircle size={16}/>} label="Alpha" />
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

function VoteButton({ active, onClick, color, icon, label }) {
  const activeStyle = {
    green: "bg-green-600 text-white border-green-600 shadow-green-200",
    orange: "bg-orange-500 text-white border-orange-500 shadow-orange-200",
    red: "bg-red-500 text-white border-red-500 shadow-red-200"
  };
  
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold border transition-all active:scale-95 shadow-sm ${
        active ? activeStyle[color] + " shadow-md" : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
      }`}
    >
      {icon} <span>{label}</span>
    </button>
  );
}

// === KOMPONEN UI ADMIN (KEPALA SEKOLAH) ===
function AdminDashboard({ students, attendance, onAddStudent }) {
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState('TK A');
  const today = new Date().toISOString().split('T')[0];

  // Statistik Ringkas
  const todayPresence = attendance.filter(a => a.date === today && a.status === 'hadir').length;
  const todaySick = attendance.filter(a => a.date === today && a.status === 'sakit').length;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-5 rounded-2xl shadow-lg shadow-purple-200">
          <div className="flex items-center gap-2 mb-1 opacity-80">
            <Users size={16} /> <span className="text-xs font-bold uppercase">Total Siswa</span>
          </div>
          <p className="text-3xl font-bold">{students.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1 text-gray-400">
            <CalendarCheck size={16} /> <span className="text-xs font-bold uppercase">Hadir Hari Ini</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{todayPresence} <span className="text-sm text-gray-400 font-normal">Anak</span></p>
          {todaySick > 0 && <p className="text-xs text-orange-500 mt-1 font-medium">{todaySick} Izin/Sakit</p>}
        </div>
      </div>

      {/* Form Tambah Siswa */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={18} className="text-purple-600 bg-purple-100 p-0.5 rounded"/> Tambah Siswa Baru
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" placeholder="Nama Lengkap Anak" 
            className="flex-1 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 transition"
            value={newName} onChange={e => setNewName(e.target.value)}
          />
          <select 
            className="p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none"
            value={newClass} onChange={e => setNewClass(e.target.value)}
          >
            <option>TK A</option>
            <option>TK B</option>
          </select>
          <button 
            onClick={() => {
              if(newName) {
                onAddStudent(newName, newClass);
                setNewName('');
              }
            }}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition shadow-lg shadow-purple-200 active:scale-95"
          >
            Simpan
          </button>
        </div>
      </div>

      {/* Tabel Data Siswa */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
          <h3 className="font-bold text-gray-700 text-sm">Database Siswa</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-gray-400 font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 border-b border-gray-50">Nama Siswa</th>
                <th className="p-4 border-b border-gray-50">Kelas</th>
                <th className="p-4 border-b border-gray-50">ID System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-gray-700 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                        <img src={s.photo} alt="" className="w-full h-full object-cover"/>
                     </div>
                     {s.name}
                  </td>
                  <td className="p-4 text-gray-500">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${s.class === 'TK A' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      {s.class}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-xs font-mono">#{s.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}