import React, { useState, useEffect } from 'react';
import { 
  LogOut, Check, X, AlertCircle, Plus, 
  Users, ShieldCheck, ChevronRight, Clock,
  Pencil, Trash2, RotateCcw, MessageSquareText // <--- Icon Baru untuk Notes
} from 'lucide-react';

// DATA CONTOH (SEED DATA)
const SEED_STUDENTS = [
  { id: 1, name: 'Adit Sopo', class: 'TK A', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adit' },
  { id: 2, name: 'Jarwo Kuat', class: 'TK A', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jarwo' },
  { id: 3, name: 'Susanti', class: 'TK B', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Susanti' },
  { id: 4, name: 'Mei Mei', class: 'TK B', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mei' },
];

const SEED_USERS = [
  { id: 1, email: 'guru@tk.com', password: '123', name: 'Bu Guru Siti', role: 'teacher' },
  { id: 2, email: 'kepsek@tk.com', password: '123', name: 'Pak Budi (Kepsek)', role: 'admin' },
];

// KOMPONEN JAM REALTIME 
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="text-right hidden sm:block">
      <p className="text-3xl font-bold text-slate-800 leading-none">
        {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
      </p>
      <p className="text-xs text-slate-500 font-medium">
        {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>
  );
};

// KOMPONEN UTAMA (APP)
export default function App() {
  // STATE MANAGEMENT
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

  // ACTIONS
  const handleLogin = (email, password) => {
    const found = SEED_USERS.find(u => u.email === email && u.password === password);
    if (found) { setUser(found); return { success: true }; }
    return { success: false, message: 'Email atau Password Salah!' };
  };

  const handleLogout = () => setUser(null);

  // UPDATE: Fungsi Absen sekarang menerima parameter 'note'
  const markAttendance = (studentId, status, note = '') => {
    const date = new Date().toISOString().split('T')[0];
    const newRecord = { id: Date.now(), studentId, status, date, note }; // Simpan Note disini
    
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
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold shadow-md ${user.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
                {user.name.charAt(0)}
             </div>
             <div className="leading-tight">
               <h1 className="text-sm font-bold text-slate-900">{user.name}</h1>
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{user.role === 'admin' ? 'Administrator' : 'Pengajar'}</span>
             </div>
          </div>
          <div className="flex gap-2">
            <button onClick={resetDemo} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Reset Demo Data"><RotateCcw size={18} /></button>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {user.role === 'teacher' ? (
          <TeacherDashboard students={students} attendance={attendance} onMark={markAttendance} />
        ) : (
          <AdminDashboard students={students} attendance={attendance} onAdd={addStudent} onUpdate={updateStudent} onDelete={deleteStudent} />
        )}
      </main>
    </div>
  );
}

// HALAMAN LOGIN 
function LoginPage({ onLogin, onReset }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-800">
       <div className="hidden lg:flex w-1/2 bg-indigo-600 items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90"></div>
         <div className="relative z-10 text-center text-white px-10">
           <h1 className="text-5xl font-bold mb-4">SiHadir TK</h1>
           <p className="text-indigo-100 text-lg">Platform Absensi Modern & Cerdas.</p>
         </div>
       </div>
       <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
         <div className="w-full max-w-md">
           <div className="mb-8 text-center lg:text-left">
             <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mb-4 lg:hidden"><ShieldCheck size={24} /></div>
             <h2 className="text-3xl font-bold text-slate-900">Selamat Datang</h2>
             <p className="text-slate-500 mt-2">Masuk ke Dashboard Guru / Admin</p>
           </div>
           <div className="space-y-5">
             <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Email (guru@tk.com)" />
             <input type="password" value={pass} onChange={e=>setPass(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Password (123)" />
             {err && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100"><AlertCircle size={16} /> {err}</div>}
             <button onClick={()=>{setLoading(true); setTimeout(()=>{const res=onLogin(email, pass); if(!res.success) setErr(res.message); setLoading(false);}, 500)}} disabled={loading} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-70">
               {loading ? 'Memproses...' : 'Masuk Aplikasi'}
             </button>
           </div>
           <div className="mt-8 text-center text-xs text-slate-400">
             <p>Demo Access:</p>
             <div className="mt-2 space-x-2">
               <span className="bg-slate-100 px-2 py-1 rounded border">guru@tk.com / 123</span>
               <span className="bg-slate-100 px-2 py-1 rounded border">kepsek@tk.com / 123</span>
             </div>
             <button onClick={onReset} className="mt-4 text-indigo-500 underline hover:text-indigo-700 block mx-auto">Reset Data</button>
           </div>
         </div>
       </div>
    </div>
  );
}

// DASHBOARD GURU (DENGAN POPUP NOTES)
function TeacherDashboard({ students, attendance, onMark }) {
  const today = new Date().toISOString().split('T')[0];
  const classes = [...new Set(students.map(s => s.class))];

  // State untuk Modal Popup
  const [modal, setModal] = useState({ show: false, studentId: null, type: '', name: '' });
  const [noteInput, setNoteInput] = useState('');

  // Handler saat tombol ditekan
  const handleVote = (student, type) => {
    // Jika HADIR: Langsung simpan (Cepat)
    if (type === 'hadir') {
      onMark(student.id, 'hadir', '');
    } 
    // Jika SAKIT/ALPHA: Buka Popup dulu untuk minta keterangan
    else {
      setModal({ show: true, studentId: student.id, type: type, name: student.name });
      // Cari note lama jika ada
      const existing = attendance.find(a => a.studentId === student.id && a.date === today);
      setNoteInput(existing?.note || '');
    }
  };

  const saveNote = () => {
    onMark(modal.studentId, modal.type, noteInput);
    setModal({ show: false, studentId: null, type: '', name: '' });
    setNoteInput('');
  };

  return (
    <div className="space-y-6 relative">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div><h2 className="text-xl font-bold text-slate-800">Presensi Harian</h2><p className="text-slate-500 text-sm">Klik Sakit/Alpha untuk tambah keterangan.</p></div>
        <LiveClock />
      </div>

      {classes.map(className => (
        <div key={className} className="space-y-3">
          <div className="flex items-center gap-2 px-1"><div className="h-4 w-1 bg-indigo-500 rounded-full"></div><h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">{className}</h3></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {students.filter(s => s.class === className).map(student => {
              const record = attendance.find(a => a.studentId === student.id && a.date === today);
              const status = record?.status;

              return (
                <div key={student.id} className={`bg-white p-4 rounded-2xl border transition hover:shadow-md ${status ? 'border-indigo-100 ring-2 ring-indigo-50' : 'border-slate-100'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img src={student.photo} className="w-10 h-10 rounded-full bg-slate-100 border border-white shadow-sm"/>
                      <div><h4 className="font-bold text-slate-800 text-sm">{student.name}</h4><p className="text-[10px] text-slate-400 font-mono">ID: {student.id}</p></div>
                    </div>
                    {/* Status Dot */}
                    {status && <span className={`w-2 h-2 rounded-full ${status==='hadir'?'bg-green-500':status==='sakit'?'bg-orange-500':'bg-red-500'}`}></span>}
                  </div>
                  
                  {/* Indikator Note jika ada */}
                  {record?.note && (
                    <div className="mb-3 bg-amber-50 text-amber-700 text-xs p-2 rounded-lg flex gap-2 items-start border border-amber-100">
                      <MessageSquareText size={14} className="mt-0.5 shrink-0"/>
                      <span className="line-clamp-2 italic">"{record.note}"</span>
                    </div>
                  )}

                  <div className="flex bg-slate-50 p-1 rounded-xl gap-1">
                    {['hadir','sakit','alpha'].map(type => (
                      <button key={type} onClick={() => handleVote(student, type)} className={`flex-1 py-2 rounded-lg transition flex justify-center ${status === type 
                        ? (type==='hadir'?'bg-white text-green-600 shadow ring-1 ring-green-500': type==='sakit'?'bg-white text-orange-600 shadow ring-1 ring-orange-500':'bg-white text-red-600 shadow ring-1 ring-red-500') 
                        : 'text-slate-400 hover:bg-white'}`}>
                        {type==='hadir'?<Check size={14} strokeWidth={3}/> : type==='sakit'?<AlertCircle size={14} strokeWidth={3}/> : <X size={14} strokeWidth={3}/>}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* MODAL POPUP */}
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
              <div className={`p-4 text-white flex justify-between items-center ${modal.type === 'sakit' ? 'bg-orange-500' : 'bg-red-500'}`}>
                 <h3 className="font-bold flex items-center gap-2">
                    {modal.type === 'sakit' ? <AlertCircle size={20}/> : <X size={20}/>}
                    Input Keterangan {modal.type === 'sakit' ? 'Sakit' : 'Alpha'}
                 </h3>
                 <button onClick={()=>setModal({...modal, show:false})} className="text-white/80 hover:text-white"><X size={20}/></button>
              </div>
              <div className="p-5">
                 <p className="text-sm text-slate-500 mb-2">Tambahkan catatan untuk <span className="font-bold text-slate-800">{modal.name}</span>:</p>
                 <textarea 
                    autoFocus
                    placeholder={modal.type === 'sakit' ? "Contoh: Demam tinggi, Batuk..." : "Contoh: Tanpa keterangan, Membolos..."}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                    value={noteInput} onChange={e => setNoteInput(e.target.value)}
                 />
              </div>
              <div className="p-4 bg-slate-50 flex gap-3 justify-end">
                 <button onClick={()=>setModal({...modal, show:false})} className="px-4 py-2 text-slate-500 text-sm font-bold hover:bg-slate-200 rounded-lg transition">Batal</button>
                 <button onClick={saveNote} className="px-6 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-black transition shadow-lg">Simpan Absen</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

// DASHBOARD ADMIN
function AdminDashboard({ students, attendance, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState({ id: null, name: '', class: 'TK A' });
  const today = new Date().toISOString().split('T')[0];
  
  const totalSiswa = students.length;
  const hadirHariIni = attendance.filter(a => a.date === today && a.status === 'hadir').length;
  const persentase = totalSiswa > 0 ? Math.round((hadirHariIni / totalSiswa) * 100) : 0;

  const handleSubmit = () => {
    if(!form.name) return;
    if(form.id) onUpdate(form.id, form.name, form.class);
    else onAdd(form.name, form.class);
    setForm({ id: null, name: '', class: 'TK A' });
  };

  const handleEdit = (s) => { setForm(s); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4"></div>
          <div className="relative z-10"><div className="flex items-center gap-2 mb-2 text-indigo-600"><Users size={18}/><span className="text-xs font-bold uppercase">Total Siswa</span></div><p className="text-4xl font-bold text-slate-800">{totalSiswa}</p></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group relative overflow-hidden">
           <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4"></div>
           <div className="relative z-10"><div className="flex items-center gap-2 mb-2 text-green-600"><Check size={18}/><span className="text-xs font-bold uppercase">Hadir Hari Ini</span></div><p className="text-4xl font-bold text-slate-800">{hadirHariIni}</p></div>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-3xl shadow-lg shadow-indigo-200 flex flex-col justify-between">
           <div><span className="text-indigo-200 text-xs font-bold uppercase">Persentase</span><div className="flex items-end gap-2 mt-1"><p className="text-4xl font-bold">{persentase}%</p><span className="text-sm mb-1 opacity-80">Today</span></div></div>
           <div className="w-full bg-black/20 h-2 rounded-full mt-4 overflow-hidden"><div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${persentase}%` }}></div></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className={`p-6 rounded-3xl border sticky top-24 transition-colors ${form.id ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'}`}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${form.id ? 'text-orange-700' : 'text-slate-800'}`}>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.id ? 'bg-orange-200 text-orange-700' : 'bg-indigo-100 text-indigo-600'}`}>{form.id ? <Pencil size={18}/> : <Plus size={18}/>}</span>
              {form.id ? 'Edit Data Siswa' : 'Input Siswa Baru'}
            </h3>
            <div className="space-y-3">
              <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Nama Lengkap" />
              <select value={form.class} onChange={e=>setForm({...form, class:e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"><option>TK A</option><option>TK B</option></select>
              <button onClick={handleSubmit} className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-lg transition ${form.id ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-800 hover:bg-black'}`}>{form.id ? 'Update Perubahan' : '+ Simpan Data'}</button>
              {form.id && <button onClick={()=>setForm({id:null, name:'', class:'TK A'})} className="w-full text-xs text-slate-500 py-2">Batal Edit</button>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-50"><h3 className="font-bold text-slate-700">Database Siswa</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  <tr><th className="px-6 py-4">Siswa</th><th className="px-6 py-4">Kelas</th><th className="px-6 py-4 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition group">
                      <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-3"><img src={s.photo} className="w-8 h-8 rounded-full bg-slate-100 object-cover"/>{s.name}</td>
                      <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-md text-xs font-bold ${s.class==='TK A'?'bg-blue-50 text-blue-600':'bg-purple-50 text-purple-600'}`}>{s.class}</span></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                           <button onClick={()=>handleEdit(s)} className="p-2 rounded-lg text-slate-300 hover:text-orange-600 hover:bg-orange-50 transition"><Pencil size={16}/></button>
                           <button onClick={()=>{if(confirm('Hapus siswa ini?')) onDelete(s.id)}} className="p-2 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition"><Trash2 size={16}/></button>
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
    </div>
  );
}