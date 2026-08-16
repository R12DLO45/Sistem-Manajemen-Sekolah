import React, { useState } from 'react';
import { AlertCircle, School } from 'lucide-react';

export default function LoginPage({ onLogin, onReset }) {
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
           <p className="text-indigo-100 text-lg">Platform Absensi Modern & Terpisah Per Kelas.</p>
         </div>
       </div>
       <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
         <div className="w-full max-w-md">
           <div className="mb-8 text-center lg:text-left">
             <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mb-4 lg:hidden"><School size={24} /></div>
             <h2 className="text-3xl font-bold text-slate-900">Selamat Datang</h2>
             <p className="text-slate-500 mt-2">Masuk sesuai Akun Kelas masing-masing.</p>
           </div>
           <div className="space-y-5">
             <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Email (guru.a@tk.com)" />
             <input type="password" value={pass} onChange={e=>setPass(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Password (123)" />
             {err && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100"><AlertCircle size={16} /> {err}</div>}
             <button onClick={()=>{setLoading(true); setTimeout(()=>{const res=onLogin(email, pass); if(!res.success) setErr(res.message); setLoading(false);}, 500)}} disabled={loading} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-70">
               {loading ? 'Memproses...' : 'Masuk Aplikasi'}
             </button>
           </div>
           <div className="mt-8 text-center text-xs text-slate-400">
             <p>Akun Demo Guru:</p>
             <div className="mt-2 flex flex-wrap justify-center gap-2">
               <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded font-mono">guru.a@tk.com / 123</span>
               <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded font-mono">guru.b@tk.com / 123</span>
             </div>
             <p className="mt-2">Akun Kepala Sekolah:</p>
             <div className="mt-1">
                <span className="bg-slate-100 px-2 py-1 rounded border font-mono">kepsek@tk.com / 123</span>
             </div>
             <button onClick={onReset} className="mt-4 text-indigo-500 underline hover:text-indigo-700 block mx-auto">Reset Data</button>
           </div>
         </div>
       </div>
    </div>
  );
}