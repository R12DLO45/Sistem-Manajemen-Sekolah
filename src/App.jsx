import React, { useState, useEffect } from 'react';
import { LogOut, RotateCcw } from 'lucide-react';

import { SEED_USERS, SEED_STUDENTS } from './data/mockData';
import LoginPage from './components/LoginPage';
import TeacherDashboard from './components/TeacherDashboard';
import KepsekDashboard from './components/KepsekDashboard';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  // STATE MANAGEMENT
  const [users, setUsers] = useState(() => {
    const saved = sessionStorage.getItem('tk_session_users');
    return saved ? JSON.parse(saved) : SEED_USERS;
  });

  const [students, setStudents] = useState(() => {
    const saved = sessionStorage.getItem('tk_session_students');
    return saved ? JSON.parse(saved) : SEED_STUDENTS;
  });

  const [attendance, setAttendance] = useState(() => {
    const saved = sessionStorage.getItem('tk_session_attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('tk_session_user');
    return saved ? JSON.parse(saved) : null;
  });

  // EFFECT
  useEffect(() => { sessionStorage.setItem('tk_session_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { sessionStorage.setItem('tk_session_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { sessionStorage.setItem('tk_session_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { 
    if(currentUser) sessionStorage.setItem('tk_session_user', JSON.stringify(currentUser));
    else sessionStorage.removeItem('tk_session_user');
  }, [currentUser]);

  // ACTIONS LOGIN & LOGOUT
  const handleLogin = (email, password) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (found) { setCurrentUser(found); return { success: true }; }
    return { success: false, message: 'Email atau Password Salah!' };
  };

  const handleLogout = () => setCurrentUser(null);

  // ACTIONS SISWA
  const markAttendance = (studentId, status, note = '') => {
    const date = new Date().toISOString().split('T')[0];
    const newRecord = { id: Date.now(), studentId, status, date, note };
    const filtered = attendance.filter(a => !(a.studentId === studentId && a.date === date));
    setAttendance([...filtered, newRecord]);
  };

  const addStudent = (name, className) => {
    const newS = { id: Date.now(), name, class: className, photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` };
    setStudents([...students, newS]);
  };

  const updateStudent = (id, name, className) => {
    setStudents(students.map(s => s.id === id ? { ...s, name, class: className } : s));
  };

  const deleteStudent = (id) => {
    setStudents(students.filter(s => s.id !== id));
  };

  // ACTIONS USER
  const addUser = (userData) => {
    const newUser = { id: Date.now(), ...userData };
    setUsers([...users, newUser]);
  };

  const updateUser = (id, userData) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...userData } : u));
  };

  const deleteUser = (id) => {
    if (id === currentUser.id) {
      alert("Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan!");
      return;
    }
    setUsers(users.filter(u => u.id !== id));
  };

  const resetDemo = () => {
    if(window.confirm("Reset data demo? Semua perubahan siswa dan akun akan kembali ke kondisi awal.")) {
      sessionStorage.clear();
      window.location.reload();
    }
  };

  if (!currentUser) return <LoginPage onLogin={handleLogin} onReset={resetDemo} />;

  // ROUTING
  const renderDashboard = () => {
    if (currentUser.role === 'teacher') {
      return <TeacherDashboard user={currentUser} students={students} attendance={attendance} onMark={markAttendance} />;
    } 
    if (currentUser.role === 'kepsek') {
      return <KepsekDashboard students={students} attendance={attendance} />;
    } 
    if (currentUser.role === 'admin') {
      return (
        <AdminDashboard 
          students={students} 
          users={users}
          onAddStudent={addStudent} 
          onUpdateStudent={updateStudent} 
          onDeleteStudent={deleteStudent}
          onAddUser={addUser}
          onUpdateUser={updateUser}
          onDeleteUser={deleteUser}
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
             <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-white font-bold shadow-md ${currentUser.role === 'admin' ? 'bg-gradient-to-br from-slate-700 to-black' : currentUser.role === 'kepsek' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
                {currentUser.name.charAt(0)}
             </div>
             <div className="leading-tight overflow-hidden">
               <h1 className="text-sm font-bold text-slate-900 truncate max-w-[120px] sm:max-w-none">{currentUser.name}</h1>
               <div className="flex items-center gap-1">
                 <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {currentUser.role === 'admin' ? 'Admin TU' : currentUser.role === 'kepsek' ? 'Kepala Sekolah' : 'Guru'}
                 </span>
                 {currentUser.assignedClass !== 'ALL' && (
                   <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap">{currentUser.assignedClass}</span>
                 )}
               </div>
             </div>
          </div>
          
          <div className="flex gap-2 shrink-0">
            <button onClick={resetDemo} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Reset Demo Data"><RotateCcw size={18} /></button>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {renderDashboard()}
      </main>
    </div>
  );
}