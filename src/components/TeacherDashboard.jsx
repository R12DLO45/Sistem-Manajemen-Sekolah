import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle, MessageSquareText } from 'lucide-react';

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

export default function TeacherDashboard({ user, students, attendance, onMark }) {
  const today = new Date().toISOString().split('T')[0];
  const myStudents = students.filter(s => s.class === user.assignedClass);
  const [modal, setModal] = useState({ show: false, studentId: null, type: '', name: '' });
  const [noteInput, setNoteInput] = useState('');

  const handleVote = (student, type) => {
    if (type === 'hadir') {
      onMark(student.id, 'hadir', '');
    } else {
      setModal({ show: true, studentId: student.id, type: type, name: student.name });
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
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kelas {user.assignedClass}</h2>
          <p className="text-slate-500 text-sm">Anda hanya melihat siswa kelas {user.assignedClass}.</p>
        </div>
        <LiveClock />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {myStudents.length === 0 ? (
          <div className="col-span-full text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed">
            Belum ada siswa di kelas {user.assignedClass}
          </div>
        ) : (
          myStudents.map(student => {
            const record = attendance.find(a => a.studentId === student.id && a.date === today);
            const status = record?.status;

            return (
              <div key={student.id} className={`bg-white p-4 rounded-2xl border transition hover:shadow-md ${status ? 'border-indigo-100 ring-2 ring-indigo-50' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={student.photo} className="w-10 h-10 rounded-full bg-slate-100 border border-white shadow-sm"/>
                    <div><h4 className="font-bold text-slate-800 text-sm">{student.name}</h4><p className="text-[10px] text-slate-400 font-mono">ID: {student.id}</p></div>
                  </div>
                  {status && <span className={`w-2 h-2 rounded-full ${status==='hadir'?'bg-green-500':status==='sakit'?'bg-orange-500':'bg-red-500'}`}></span>}
                </div>
                
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
          })
        )}
      </div>

      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
              <div className={`p-4 text-white flex justify-between items-center ${modal.type === 'sakit' ? 'bg-orange-500' : 'bg-red-500'}`}>
                 <h3 className="font-bold flex items-center gap-2">
                    {modal.type === 'sakit' ? <AlertCircle size={20}/> : <X size={20}/>}
                    Keterangan {modal.type === 'sakit' ? 'Sakit' : 'Alpha'}
                 </h3>
                 <button onClick={()=>setModal({...modal, show:false})} className="text-white/80 hover:text-white"><X size={20}/></button>
              </div>
              <div className="p-5">
                 <p className="text-sm text-slate-500 mb-2">Catatan untuk <span className="font-bold text-slate-800">{modal.name}</span>:</p>
                 <textarea 
                    autoFocus
                    placeholder="Tulis keterangan..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                    value={noteInput} onChange={e => setNoteInput(e.target.value)}
                 />
              </div>
              <div className="p-4 bg-slate-50 flex gap-3 justify-end">
                 <button onClick={()=>setModal({...modal, show:false})} className="px-4 py-2 text-slate-500 text-sm font-bold hover:bg-slate-200 rounded-lg transition">Batal</button>
                 <button onClick={saveNote} className="px-6 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-black transition shadow-lg">Simpan</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}