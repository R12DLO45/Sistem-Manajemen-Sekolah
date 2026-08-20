import React from 'react';
import { Bell, HelpCircle, LogOut, Moon, Sun } from 'lucide-react';

export default function Header({ user, onLogout, darkMode, onToggleDark }) {
  return (
    <header className="flex justify-end items-center py-2 px-1 mb-2">
      <div className="flex items-center gap-3">
        {/* Toggle Theme */}
        <button 
          onClick={onToggleDark} 
          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          title="Mode Gelap / Terang"
        >
          {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>

        {/* Notifikasi */}
        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Bantuan */}
        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
          <HelpCircle size={18} />
        </button>

        {/* Logout */}
        <button 
          onClick={onLogout}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-xl transition"
          title="Keluar"
        >
          <LogOut size={18} />
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
            alt={user.name} 
            className="w-9 h-9 rounded-full bg-indigo-100 border border-slate-200 dark:border-slate-700 object-cover"
          />
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{user.name}</p>
            <p className="text-[10px] text-slate-400 font-medium">
              {user.role === 'teacher' ? `Wali ${user.assignedClass}` : user.role === 'kepsek' ? 'Kepala Sekolah' : 'Admin TU'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}