import React, { useState, useEffect } from 'react';
import { SEED_USERS, SEED_STUDENTS } from './data/mockData';

import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import MainDashboard from './components/MainDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import KepsekDashboard from './components/KepsekDashboard';
import AdminDashboard from './components/AdminDashboard';
import Toast from './components/Toast';

export default function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('tk_theme') === 'dark');

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

  // Data States
  const [users, setUsers] = useState(() => JSON.parse(sessionStorage.getItem('tk_session_users')) || SEED_USERS);
  const [students, setStudents] = useState(() => JSON.parse(sessionStorage.getItem('tk_session_students')) || SEED_STUDENTS);
  const [attendance, setAttendance] = useState(() => JSON.parse(sessionStorage.getItem('tk_session_attendance')) || []);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(sessionStorage.getItem('tk_session_user')) || null);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => setToast({ show: true, message, type });
  const hideToast = () => setToast(prev => ({ ...prev, show: false }));

  useEffect(() => { sessionStorage.setItem('tk_session_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { sessionStorage.setItem('tk_session_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { sessionStorage.setItem('tk_session_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { 
    if(currentUser) sessionStorage.setItem('tk_session_user', JSON.stringify(currentUser));
    else sessionStorage.removeItem('tk_session_user');
  }, [currentUser]);

  const handleLogin = (email, password) => {
    const found = users.find(u => (u.email === email || u.name === email) && u.password === password);
    if (found) { 
      setCurrentUser(found); 
      showToast(`Selamat datang, ${found.name}!`, 'success');
      return { success: true }; 
    }
    return { success: false, message: 'Email atau Password Salah!' };
  };

  const handleLogout = () => setCurrentUser(null);

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

  const addUser = (userData) => {
    const newUser = { id: Date.now(), ...userData };
    setUsers([...users, newUser]);
    showToast(`Akun "${userData.name}" berhasil dibuat!`, 'success');
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

  // Content Router Berdasarkan Menu Sidebar
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <MainDashboard user={currentUser} students={students} attendance={attendance} setActiveMenu={setActiveMenu} />;
      case 'absensi':
        return <TeacherDashboard user={currentUser} students={students} attendance={attendance} onMark={markAttendance} onToast={showToast} />;
      case 'data-anak':
      case 'kelas':
      case 'laporan':
        return <KepsekDashboard students={students} attendance={attendance} />;
      case 'guru':
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
      default:
        return <MainDashboard user={currentUser} students={students} attendance={attendance} setActiveMenu={setActiveMenu} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Sidebar Kiri */}
      <Sidebar 
        user={currentUser} 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDark={toggleDarkMode}
        onReset={resetDemo}
      />

      {/* Konten Utama Kanan */}
      <main className="flex-1 p-6 sm:p-8 max-w-7xl overflow-y-auto">
        {renderContent()}
      </main>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}