import React, { useState, useEffect } from 'react';
import { SEED_USERS, SEED_STUDENTS } from './data/mockData';

import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import MainDashboard from './components/MainDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDataPage from './components/StudentDataPage';
import ClassDataPage from './components/ClassDataPage';
import TeacherDataPage from './components/TeacherDataPage'; // <-- IMPORT HALAMAN GURU
import KepsekDashboard from './components/KepsekDashboard';
import Toast from './components/Toast';

export default function App() {
  const [activeMenu, setActiveMenu] = useState('guru'); // atau 'dashboard'
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('tk_theme') === 'dark');

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileSidebarOpen(prev => !prev);
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  };

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

  // States
  const [users, setUsers] = useState(() => {
    try {
      const saved = sessionStorage.getItem('tk_session_users');
      return saved ? JSON.parse(saved) : SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  });

  const [students, setStudents] = useState(() => {
    try {
      const saved = sessionStorage.getItem('tk_session_students');
      return saved ? JSON.parse(saved) : SEED_STUDENTS;
    } catch {
      return SEED_STUDENTS;
    }
  });

  const [attendance, setAttendance] = useState(() => {
    try {
      const saved = sessionStorage.getItem('tk_session_attendance');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('tk_session_user');
      return saved ? JSON.parse(saved) : (SEED_USERS && SEED_USERS[0] ? SEED_USERS[0] : null);
    } catch {
      return SEED_USERS && SEED_USERS[0] ? SEED_USERS[0] : null;
    }
  });

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
      setActiveMenu('dashboard');
      showToast(`Selamat datang, ${found.name}!`, 'success');
      return { success: true }; 
    }
    return { success: false, message: 'Email atau Password Salah!' };
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveMenu('dashboard');
  };

  const markAttendance = (studentId, status, note = '') => {
    const date = new Date().toISOString().split('T')[0];
    const newRecord = { id: Date.now(), studentId, status, date, note };
    const filtered = attendance.filter(a => !(a.studentId === studentId && a.date === date));
    setAttendance([...filtered, newRecord]);
    
    const student = students.find(s => s.id === studentId);
    showToast(`Presensi ${student?.name || 'siswa'} tercatat (${status.toUpperCase()})`, 'success');
  };

  const addStudent = (newStudentData) => {
    const newS = { 
      id: Date.now(), 
      ...newStudentData,
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newStudentData.name || Date.now()}` 
    };
    setStudents(prev => [...prev, newS]);
    showToast(`Siswa "${newStudentData.name}" berhasil ditambahkan!`, 'success');
  };

  const updateStudent = (id, updatedData) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updatedData } : s));
    showToast(`Data siswa berhasil diperbarui!`, 'orange');
  };

  const deleteStudent = (id) => {
    const s = students.find(item => item.id === id);
    setStudents(prev => prev.filter(item => item.id !== id));
    showToast(`Siswa "${s?.name || ''}" dihapus dari database`, 'error');
  };

  const addUser = (userData) => {
    const newUser = { id: Date.now(), ...userData };
    setUsers(prev => [...prev, newUser]);
    showToast(`Akun "${userData.name}" berhasil dibuat!`, 'success');
  };

  const updateUser = (id, userData) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
    showToast(`Akun "${userData.name}" berhasil diupdate!`, 'orange');
  };

  const deleteUser = (id) => {
    if (id === currentUser.id) {
      showToast("Gagal: Anda tidak dapat menghapus akun Anda sendiri!", 'error');
      return;
    }
    const u = users.find(item => item.id === id);
    setUsers(prev => prev.filter(item => item.id !== id));
    showToast(`Akun "${u?.name || ''}" berhasil dihapus`, 'error');
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} onReset={() => { sessionStorage.clear(); window.location.reload(); }} darkMode={darkMode} onToggleDark={toggleDarkMode} />;
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <MainDashboard 
            user={currentUser} 
            students={students} 
            attendance={attendance} 
            setActiveMenu={setActiveMenu} 
            onLogout={handleLogout}
            onToggleSidebar={toggleSidebar}
          />
        );
      case 'absensi':
        return (
          <TeacherDashboard 
            user={currentUser} 
            students={students} 
            attendance={attendance} 
            onMark={markAttendance} 
            onToast={showToast} 
            onLogout={handleLogout} 
            onToggleSidebar={toggleSidebar} 
          />
        );
      case 'data-anak':
        return (
          <StudentDataPage 
            user={currentUser} 
            students={students} 
            onAddStudent={addStudent}
            onUpdateStudent={updateStudent}
            onDeleteStudent={deleteStudent}
            onLogout={handleLogout}
            onToggleSidebar={toggleSidebar}
          />
        );
      case 'kelas':
        return (
          <ClassDataPage 
            user={currentUser}
            students={students}
            users={users}
            onLogout={handleLogout}
            onToggleSidebar={toggleSidebar}
            onToast={showToast}
            setActiveMenu={setActiveMenu}
          />
        );
      case 'guru':
        return (
          <TeacherDataPage 
            user={currentUser}
            users={users}
            onAddUser={addUser}
            onUpdateUser={updateUser}
            onDeleteUser={deleteUser}
            onLogout={handleLogout}
            onToggleSidebar={toggleSidebar}
            onToast={showToast}
          />
        );
      case 'laporan':
        return <KepsekDashboard students={students} attendance={attendance} />;
      default:
        return (
          <TeacherDataPage 
            user={currentUser}
            users={users}
            onAddUser={addUser}
            onUpdateUser={updateUser}
            onDeleteUser={deleteUser}
            onLogout={handleLogout}
            onToggleSidebar={toggleSidebar}
            onToast={showToast}
          />
        );
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200 overflow-hidden">
      
      {/* Sidebar Navigasi Kiri */}
      <Sidebar 
        user={currentUser} 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        collapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        darkMode={darkMode}
        onToggleDark={toggleDarkMode}
      />

      {/* Area Utama Kanan */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 pt-3 sm:pt-4 w-full min-w-0 h-full overflow-y-auto">
        {renderContent()}
      </main>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}