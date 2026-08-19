import React, { useState } from 'react';
import { Lock, Mail, RotateCcw, Sun, Moon } from 'lucide-react';

export default function LoginPage({ onLogin, onReset, darkMode, onToggleDark }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = onLogin(email, password);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 transition-colors duration-200 relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button 
          onClick={onToggleDark} 
          className="p-2 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition"
          title={darkMode ? 'Ubah ke Mode Terang' : 'Ubah ke Mode Gelap'}
        >
          {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
        </button>
        <button 
          onClick={onReset} 
          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition" 
          title="Reset Demo Data"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 space-y-6 transition-colors">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg shadow-indigo-200 dark:shadow-none">
            TK
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">SiHadir TK</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sistem Informasi Presensi & Kehadiran Siswa</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs text-center font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Email Akses</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="email" 
                required
                placeholder="nama@tk.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg transition"
          >
            Masuk Ke Sistem
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Akun Demo Standar:</p>
          <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 font-mono">
            <p>Admin TU: admin@tk.com (Pass: 123)</p>
            <p>Kepsek: kepsek@tk.com (Pass: 123)</p>
            <p>Guru TK A: guru.a@tk.com (Pass: 123)</p>
          </div>
        </div>
      </div>
    </div>
  );
}