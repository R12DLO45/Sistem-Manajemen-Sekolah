import React, { useState, useEffect, useMemo } from 'react';

// Import Komponen Halaman
import LoginPage from './pages/auth/LoginPage';
import Sidebar from './components/layout/Sidebar';
import MainDashboard from './pages/dashboard/MainDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import StudentDataPage from './pages/data/StudentDataPage';
import ParentDataPage from './pages/data/ParentDataPage'; 
import ClassDataPage from './pages/data/ClassDataPage';
import TeacherDataPage from './pages/data/TeacherDataPage';
import ReportPage from './pages/data/ReportPage';
import SettingsPage from './pages/data/SettingsPage';
import { SEED_USERS, SEED_STUDENTS } from './data/mockData';

export default function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [selectedAbsensiClass, setSelectedAbsensiClass] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
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

  // Inisialisasi Data Session Storage menggunakan SEED data dari mockData
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

  // Nilai awal null agar dimulai dari halaman login jika belum ada sesi
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('tk_session_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ show: true, message, type });
  const hideToast = () => setToast(prev => ({ ...prev, show: false }));

  useEffect(() => { sessionStorage.setItem('tk_session_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { sessionStorage.setItem('tk_session_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { sessionStorage.setItem('tk_session_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { 
    if (currentUser) sessionStorage.setItem('tk_session_user', JSON.stringify(currentUser));
    else sessionStorage.removeItem('tk_session_user');
  }, [currentUser]);

  // Hak Akses Role
  const isTeacher = currentUser?.role === 'teacher';
  const teacherClass = String(currentUser?.assignedClass || 'Kelas A').replace('TK ', 'Kelas ');

  const accessibleStudents = useMemo(() => {
    const list = Array.isArray(students) ? students : [];
    if (isTeacher) {
      return list.filter(s => String(s?.class || '').replace('TK ', 'Kelas ') === teacherClass);
    }
    return list;
  }, [students, isTeacher, teacherClass]);

  const handleLogin = (email, password) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const listUsers = Array.isArray(users) ? users : SEED_USERS;
    const found = listUsers.find(u => 
      (String(u?.email || '').toLowerCase() === cleanEmail || String(u?.name || '').toLowerCase() === cleanEmail) && 
      u?.password === password
    );

    if (found) { 
      setCurrentUser(found); 
      setActiveMenu('dashboard');
      if (found.role === 'teacher') {
        setSelectedAbsensiClass(String(found.assignedClass || 'Kelas A').replace('TK ', 'Kelas '));
      } else {
        setSelectedAbsensiClass('ALL');
      }
      showToast(`Selamat datang, ${found.name}!`, 'success');
      return { success: true }; 
    }
    return { success: false, message: 'Email atau Password Salah!' };
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveMenu('dashboard');
  };

  const handleNavigateToAbsensi = (className = 'ALL', status = 'ALL') => {
    if (isTeacher) {
      setSelectedAbsensiClass(teacherClass);
    } else {
      const normalizedClass = (!className || className === 'ALL' || className === 'Semua Kelas')
        ? 'ALL'
        : String(className).replace('TK ', 'Kelas ');
      setSelectedAbsensiClass(normalizedClass);
    }
    setSelectedStatusFilter(status ? String(status).toLowerCase() : 'ALL');
    setActiveMenu('absensi');
  };

  // Simpan Batch Absensi
  const saveBatchAttendance = (newRecords) => {
    const date = new Date().toISOString().split('T')[0];
    const targetStudentIds = new Set((newRecords || []).map(r => String(r.studentId)));

    setAttendance(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const filtered = safePrev.filter(a => !(targetStudentIds.has(String(a.studentId)) && a.date === date));
      
      const formatted = (newRecords || []).map(r => ({
        id: Date.now() + Math.random(),
        studentId: r.studentId,
        status: String(r.status || 'alpa').toLowerCase().trim(),
        date: date,
        note: r.note || ''
      }));

      return [...filtered, ...formatted];
    });

    showToast('Absensi berhasil disimpan ke sistem!', 'success');
  };

  const addStudent = (newStudentData) => {
    const newS = { 
      id: Date.now(), 
      ...newStudentData,
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newStudentData.name || Date.now()}` 
    };
    setStudents(prev => [...(Array.isArray(prev) ? prev : []), newS]);
    showToast(`Siswa "${newStudentData.name}" berhasil ditambahkan!`, 'success');
  };

  const updateStudent = (id, updatedData) => {
    setStudents(prev => (Array.isArray(prev) ? prev : []).map(s => s.id === id ? { ...s, ...updatedData } : s));
    showToast(`Data siswa berhasil diperbarui!`, 'success');
  };

  const deleteStudent = (id) => {
    const list = Array.isArray(students) ? students : [];
    const s = list.find(item => item.id === id);
    setStudents(prev => (Array.isArray(prev) ? prev : []).filter(item => item.id !== id));
    showToast(`Siswa "${s?.name || ''}" berhasil dihapus`, 'error');
  };

  const addUser = (userData) => {
    const newUser = { id: Date.now(), ...userData };
    setUsers(prev => [...(Array.isArray(prev) ? prev : []), newUser]);
    showToast(`Akun "${userData.name}" berhasil dibuat!`, 'success');
  };

  const updateUser = (id, userData) => {
    setUsers(prev => (Array.isArray(prev) ? prev : []).map(u => u.id === id ? { ...u, ...userData } : u));
    if (currentUser?.id === id) {
      setCurrentUser(prev => ({ ...prev, ...userData }));
    }
    showToast(`Akun berhasil diperbarui!`, 'success');
  };

  const deleteUser = (id) => {
    if (id === currentUser?.id) {
      showToast("Gagal: Anda tidak dapat menghapus akun Anda sendiri!", 'error');
      return;
    }
    setUsers(prev => (Array.isArray(prev) ? prev : []).filter(item => item.id !== id));
    showToast(`Akun berhasil dihapus`, 'error');
  };

  if (!currentUser) {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        onReset={() => { sessionStorage.clear(); window.location.reload(); }} 
        darkMode={darkMode} 
        onToggleDark={toggleDarkMode} 
      />
    );
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <MainDashboard 
            user={currentUser} 
            students={accessibleStudents} 
            attendance={attendance} 
            setActiveMenu={setActiveMenu} 
            onNavigateToAbsensi={handleNavigateToAbsensi}
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
            selectedClass={isTeacher ? teacherClass : selectedAbsensiClass}
            selectedStatusFilter={selectedStatusFilter}
            onClassChange={setSelectedAbsensiClass}
            onSaveBatch={saveBatchAttendance} 
            onToast={showToast} 
            onLogout={handleLogout} 
            onToggleSidebar={toggleSidebar} 
            setActiveMenu={setActiveMenu}
          />
        );

      case 'data-anak':
        return (
          <StudentDataPage 
            user={currentUser} 
            students={accessibleStudents} 
            onAddStudent={addStudent}
            onUpdateStudent={updateStudent}
            onDeleteStudent={deleteStudent}
            onLogout={handleLogout}
            onToggleSidebar={toggleSidebar}
          />
        );

      case 'orang-tua':
        return (
          <ParentDataPage 
            user={currentUser} 
            students={accessibleStudents} 
            onLogout={handleLogout} 
            onToggleSidebar={toggleSidebar}
            onToast={showToast}
          />
        );

      case 'kelas':
        if (isTeacher) return null;
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
      case 'kelola-akun':
        if (isTeacher) return null;
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
        return (
          <ReportPage 
            user={currentUser}
            students={accessibleStudents}
            attendance={attendance}
            onLogout={handleLogout}
            onToggleSidebar={toggleSidebar}
            onToast={showToast}
          />
        );

      case 'pengaturan':
        return (
          <SettingsPage 
            user={currentUser}
            students={accessibleStudents}
            attendance={attendance}
            darkMode={darkMode}
            onToggleDark={toggleDarkMode}
            onUpdateUser={updateUser}
            onLogout={handleLogout}
            onToggleSidebar={toggleSidebar}
            onToast={showToast}
          />
        );

      default:
        return (
          <MainDashboard 
            user={currentUser} 
            students={accessibleStudents} 
            attendance={attendance} 
            setActiveMenu={setActiveMenu} 
            onNavigateToAbsensi={handleNavigateToAbsensi}
            onLogout={handleLogout}
            onToggleSidebar={toggleSidebar}
          />
        );
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200 overflow-hidden">
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
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 pt-3 sm:pt-4 w-full min-w-0 h-full overflow-y-auto">
        {renderContent()}
      </main>

      {/* Komponen Notifikasi Toast */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-white text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200 ${
          toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900 dark:bg-slate-800'
        }`}>
          <span className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-white' : 'bg-emerald-400'}`} />
          <span>{toast.message}</span>
          <button onClick={hideToast} className="ml-2 text-slate-400 hover:text-white">✕</button>
        </div>
      )}
    </div>
  );
}