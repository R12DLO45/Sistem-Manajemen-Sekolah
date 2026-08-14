import { useState, useEffect } from 'react';

const INITIAL_STUDENTS = [
  { id: 1, name: 'Adit Sopo', class: 'TK A', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adit' },
  { id: 2, name: 'Jarwo Kuat', class: 'TK A', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jarwo' },
  { id: 3, name: 'Susanti', class: 'TK B', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Susanti' },
  { id: 4, name: 'Mei Mei', class: 'TK B', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mei' },
];

const INITIAL_USERS = [
  { id: 1, email: 'guru@tk.com', password: '123', name: 'Bu Guru Siti', role: 'teacher' },
  { id: 2, email: 'kepsek@tk.com', password: '123', name: 'Pak Budi (Kepsek)', role: 'admin' },
];

export const useMockStore = () => {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const storedStudents = JSON.parse(localStorage.getItem('tk_students'));
    const storedAttendance = JSON.parse(localStorage.getItem('tk_attendance'));
    const storedUser = JSON.parse(localStorage.getItem('tk_user_session')); 
    
    if (storedStudents) setStudents(storedStudents);
    else {
      setStudents(INITIAL_STUDENTS);
      localStorage.setItem('tk_students', JSON.stringify(INITIAL_STUDENTS));
    }

    if (storedAttendance) setAttendance(storedAttendance);
    if (storedUser) setUser(storedUser);
  }, []);

  const login = (email, password) => {
    const foundUser = INITIAL_USERS.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('tk_user_session', JSON.stringify(foundUser));
      return { success: true, role: foundUser.role };
    }
    return { success: false, message: 'Email/Password salah! (Coba: guru@tk.com / 123)' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tk_user_session');
  };

  const markAttendance = (studentId, status, date) => {
    const newRecord = { id: Date.now(), studentId, status, date, markedBy: user?.name };
    const filtered = attendance.filter(a => !(a.studentId === studentId && a.date === date));
    const newAttendance = [...filtered, newRecord];
    setAttendance(newAttendance);
    localStorage.setItem('tk_attendance', JSON.stringify(newAttendance));
  };

  const addStudent = (name, className) => {
    const newStudent = { 
      id: Date.now(), 
      name, 
      class: className, 
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` 
    };
    const newStudents = [...students, newStudent];
    setStudents(newStudents);
    localStorage.setItem('tk_students', JSON.stringify(newStudents));
  };

  // UPDATE BARU: EDIT & DELETE 
  const deleteStudent = (id) => {
    const newStudents = students.filter(s => s.id !== id);
    setStudents(newStudents);
    localStorage.setItem('tk_students', JSON.stringify(newStudents));
  };

  const updateStudent = (id, updatedName, updatedClass) => {
    const newStudents = students.map(s => 
      s.id === id ? { ...s, name: updatedName, class: updatedClass, photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${updatedName}` } : s
    );
    setStudents(newStudents);
    localStorage.setItem('tk_students', JSON.stringify(newStudents));
  };

  return { user, students, attendance, login, logout, markAttendance, addStudent, deleteStudent, updateStudent };
};