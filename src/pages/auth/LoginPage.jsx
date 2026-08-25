import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, ShieldCheck, Sun, Moon, RotateCcw } from 'lucide-react';

export default function LoginPage({ onLogin, onReset, darkMode, onToggleDark }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = onLogin(identifier, password);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex justify-center items-center p-0 sm:p-4 md:p-6 transition-colors duration-200 relative">
      
      {/* Tombol Control (Theme Toggle & Reset Demo) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button 
          onClick={onToggleDark} 
          className="p-2.5 text-slate-500 hover:text-indigo-600 dark:hover:text-amber-400 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition"
          title={darkMode ? 'Ubah ke Mode Terang' : 'Ubah ke Mode Gelap'}
        >
          {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>
        <button 
          onClick={onReset} 
          className="p-2.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition" 
          title="Reset Demo Data"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Container Utama Split Screen */}
      <div className="w-full max-w-5xl min-h-screen sm:min-h-[640px] bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-colors">
        
        {/* KOLOM KIRI: Illustration & Branding */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-b from-indigo-50/80 via-purple-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-8 lg:p-10 flex-col justify-between relative border-r border-slate-100 dark:border-slate-800">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                🏠
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">SIHADIR TK</h1>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">
                Sistem Absensi <br />dan Administrasi TK
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Kelola data anak, absensi, guru, dan laporan harian dengan mudah, cepat, dan efisien.
              </p>
            </div>
          </div>

          {/* Gambar Ilustrasi Sekolah TK */}
          <div className="my-6 flex justify-center items-center">
            <img 
              src="https://img.freepik.com/free-vector/happy-children-jumping-school-building-background_1308-31295.jpg?w=826" 
              alt="Ilustrasi Anak TK Sekolah" 
              className="w-full max-w-[280px] rounded-2xl object-cover shadow-md hover:scale-105 transition duration-300 border border-indigo-100/50 dark:border-slate-800"
            />
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center font-medium">
            Dipersembahkan khusus untuk efisiensi sekolah.
          </div>
        </div>

        {/* KOLOM KANAN: Form Card Login */}
        <div className="col-span-1 md:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between items-center bg-white dark:bg-slate-900 transition-colors">
          
          <div className="w-full max-w-sm my-auto space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto shadow-sm">
                <Lock size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Selamat Datang!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Silakan masuk untuk melanjutkan ke sistem presensi
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold text-center animate-in fade-in duration-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email atau Username
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    placeholder="Masukkan email atau username" 
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    placeholder="Masukkan kata sandi" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                  Ingat saya
                </label>
                <button type="button" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                  Lupa kata sandi?
                </button>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 transition duration-200 active:scale-[0.99]"
              >
                <LogIn size={18} /> Masuk
              </button>
            </form>

            <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl flex items-center gap-3 text-indigo-900 dark:text-indigo-300 text-xs">
              <ShieldCheck size={20} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
              <p className="leading-tight font-medium">
                Hanya pengguna terdaftar yang dapat mengakses sistem ini.
              </p>
            </div>

            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Akun Demo Standar:</p>
              <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 space-x-2 font-mono">
                <span className="cursor-pointer hover:text-indigo-600 underline" onClick={() => { setIdentifier('admin@tk.com'); setPassword('admin123'); }}>Admin</span> • 
                <span className="cursor-pointer hover:text-indigo-600 underline" onClick={() => { setIdentifier('kepsek@tk.com'); setPassword('kepsek123'); }}>Kepsek</span> • 
                <span className="cursor-pointer hover:text-indigo-600 underline" onClick={() => { setIdentifier('sari@tk.com'); setPassword('sari123'); }}>Guru A</span> •
                <span className="cursor-pointer hover:text-indigo-600 underline" onClick={() => { setIdentifier('rini@tk.com'); setPassword('rini123'); }}>Guru B</span> •
                <span className="cursor-pointer hover:text-indigo-600 underline" onClick={() => { setIdentifier('budi@tk.com'); setPassword('budi123'); }}>Guru C</span>
              </div>
            </div>

          </div>

          <div className="mt-6 text-[11px] text-slate-400 dark:text-slate-500 text-center font-medium">
            © {new Date().getFullYear()} SiHadir TK. All rights reserved.
          </div>

        </div>

      </div>
    </div>
  );
}