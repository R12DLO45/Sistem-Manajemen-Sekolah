import React, { useState, useEffect } from 'react';
import { LogOut, RotateCcw, Sun, Moon } from 'lucide-react';

import { SEED_USERS, SEED_STUDENTS } from './data/mockData';
import LoginPage from './components/LoginPage';
import TeacherDashboard from './components/TeacherDashboard';
import KepsekDashboard from './components/KepsekDashboard';
import AdminDashboard from './components/AdminDashboard';
import Toast from './components/Toast';

export default function App() {
  // STATE DARK MODE UNIVERSAL
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('tk_theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('tk_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('tk_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // STATE DATA SISTEM
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

  // STATE TOAST NOTIFICATION
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  useEffect(() => { sessionStorage.setItem('tk_session_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { sessionStorage.setItem('tk_session_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { sessionStorage.setItem('tk_session_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { 
    if(currentUser) sessionStorage.setItem('tk_session_user', JSON.stringify(currentUser));
    else sessionStorage.removeItem('tk_session_user');
  }, [currentUser]);

  // ACTIONS AUTH
  const handleLogin = (email, password) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (found) { 
      setCurrentUser(found); 
      showToast(`Selamat datang, ${found.name}!`, 'success');
      return { success: true }; 
    }
    return { success: false, message: 'Email atau Password Salah!' };
  };

  const handleLogout = () => setCurrentUser(null);

  // ACTIONS SISWA
  const markAttendance = (studentId, status, note = '') => {
    const date = new Date().toISOString().split('T')[0];
    const newRecord = { id: Date.now(), studentId, status, date, note };
    const filtered = attendance.filter(a => !(a.studentId === studentId && a.date === date));
    setAttendance([...filtered, newRecord]);
    
    const student = students.find(s => s.id === studentId);
    showToast(`Presensi ${student?.name || 'siswa'} tercatat (${status.toUpperCase()})`, 'success');
  };

  const addStudent = (name, className) => {
    const newS = { id: Date.now(), name, class: className, photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` };
    setStudents([...students, newS]);
    showToast(`Siswa "${name}" berhasil ditambahkan!`, 'success');
  };

  const updateStudent = (id, name, className) => {
    setStudents(students.map(s => s.id === id ? { ...s, name, class: className } : s));
    showToast(`Data siswa "${name}" berhasil diperbarui!`, 'orange');
  };

  const deleteStudent = (id) => {
    const s = students.find(item => item.id === id);
    setStudents(students.filter(item => item.id !== id));
    showToast(`Siswa "${s?.name || ''}" dihapus dari database`, 'error');
  };

  // ACTIONS USER / AKUN
  const addUser = (userData) => {
    const newUser = { id: Date.now(), ...userData };
    setUsers([...users, newUser]);
    showToast(`Akun pengguna "${userData.name}" berhasil dibuat!`, 'success');
  };

  const updateUser = (id, userData) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...userData } : u));
    showToast(`Akun "${userData.name}" berhasil diupdate!`, 'orange');
  };

  const deleteUser = (id) => {
    if (id === currentUser.id) {
      showToast("Gagal: Anda tidak dapat menghapus akun Anda sendiri!", 'error');
      return;
    }
    const u = users.find(item => item.id === id);
    setUsers(users.filter(item => item.id !== id));
    showToast(`Akun "${u?.name || ''}" berhasil dihapus`, 'error');
  };

  const resetDemo = () => {
    if(window.confirm("Reset data demo? Semua perubahan siswa dan akun akan kembali ke kondisi awal.")) {
      sessionStorage.clear();
      window.location.reload();
    }
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} onReset={resetDemo} darkMode={darkMode} onToggleDark={toggleDarkMode} />;
  }

  const renderDashboard = () => {
    if (currentUser.role === 'teacher') {
      return <TeacherDashboard user={currentUser} students={students} attendance={attendance} onMark={markAttendance} onToast={showToast} />;
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
             <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-white font-bold shadow-md ${currentUser.role === 'admin' ? 'bg-gradient-to-br from-slate-700 to-black' : currentUser.role === 'kepsek' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
                {currentUser.name.charAt(0)}
             </div>
             <div className="leading-tight overflow-hidden">
               <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px] sm:max-w-none">{currentUser.name}</h1>
               <div className="flex items-center gap-1">
                 <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                    {currentUser.role === 'admin' ? 'Admin TU' : currentUser.role === 'kepsek' ? 'Kepala Sekolah' : 'Guru'}
                 </span>
                 {currentUser.assignedClass !== 'ALL' && (
                   <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap">{currentUser.assignedClass}</span>
                 )}
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button 
              onClick={toggleDarkMode} 
              className="p-2 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            <button onClick={resetDemo} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition" title="Reset Demo Data">
              <RotateCcw size={18} />
            </button>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {renderDashboard()}
      </main>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}