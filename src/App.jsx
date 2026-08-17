import React, { useState, useEffect } from 'react';
import { LogOut, RotateCcw } from 'lucide-react';
import { SEED_USERS, SEED_STUDENTS } from './data/mockData';
import LoginPage from './components/LoginPage';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [students, setStudents] = useState(() => {
    const saved = sessionStorage.getItem('tk_session_students');
    return saved ? JSON.parse(saved) : SEED_STUDENTS;
  });
  const [attendance, setAttendance] = useState(() => {
    const saved = sessionStorage.getItem('tk_session_attendance');
    return saved ? JSON.parse(saved) : [];
  });
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('tk_session_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => { sessionStorage.setItem('tk_session_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { sessionStorage.setItem('tk_session_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { 
    if(user) sessionStorage.setItem('tk_session_user', JSON.stringify(user));
    else sessionStorage.removeItem('tk_session_user');
  }, [user]);

  const handleLogin = (email, password) => {
    const found = SEED_USERS.find(u => u.email === email && u.password === password);
    if (found) { setUser(found); return { success: true }; }
    return { success: false, message: 'Email atau Password Salah!' };
  };

  const handleLogout = () => setUser(null);

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

  const resetDemo = () => {
    if(window.confirm("Reset data demo? Data inputan akan hilang.")) {
      sessionStorage.clear();
      window.location.reload();
    }
  };

  if (!user) return <LoginPage onLogin={handleLogin} onReset={resetDemo} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
             {/* Logo Avatar - Ukuran tetap */}
             <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-white font-bold shadow-md ${user.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
                {user.name.charAt(0)}
             </div>
             {/* Info User - Truncate biar gak nabrak di HP */}
             <div className="leading-tight overflow-hidden">
               <h1 className="text-sm font-bold text-slate-900 truncate max-w-[120px] sm:max-w-none">{user.name}</h1>
               <div className="flex items-center gap-1">
                 <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{user.role === 'admin' ? 'Admin' : 'Guru'}</span>
                 {user.assignedClass !== 'ALL' && (
                   <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap">{user.assignedClass}</span>
                 )}
               </div>
             </div>
          </div>
          
          {/* Tombol Aksi - Shrink 0 biar gak gepeng */}
          <div className="flex gap-2 shrink-0">
            <button onClick={resetDemo} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Reset Demo Data"><RotateCcw size={18} /></button>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {user.role === 'teacher' ? (
          <TeacherDashboard user={user} students={students} attendance={attendance} onMark={markAttendance} />
        ) : (
          <AdminDashboard students={students} attendance={attendance} onAdd={addStudent} onUpdate={updateStudent} onDelete={deleteStudent} />
        )}
      </main>
    </div>
  );
}