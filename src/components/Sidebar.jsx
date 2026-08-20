import React from 'react';
import { 
  LayoutDashboard, ClipboardCheck, Users, School, 
  UserCheck, HeartHandshake, FileText, Settings, LogOut, Sun, Moon, RotateCcw
} from 'lucide-react';

export default function Sidebar({ 
  user, 
  activeMenu, 
  setActiveMenu, 
  onLogout, 
  darkMode, 
  onToggleDark, 
  onReset 
}) {
  
  // Daftar Menu dengan Akses Role
  const allMenus = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'kepsek', 'teacher'] },
    { id: 'absensi', label: 'Absensi', icon: ClipboardCheck, roles: ['admin', 'teacher'] },
    { id: 'data-anak', label: 'Data Anak', icon: Users, roles: ['admin', 'kepsek', 'teacher'] },
    { id: 'kelas', label: 'Kelas', icon: School, roles: ['admin', 'kepsek'] },
    { id: 'guru', label: 'Guru & Akun', icon: UserCheck, roles: ['admin'] },
    { id: 'laporan', label: 'Laporan', icon: FileText, roles: ['admin', 'kepsek'] },
  ];

  // Filter menu sesuai role user yang sedang login
  const allowedMenus = allMenus.filter(m => m.roles.includes(user.role));

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between shrink-0 min-h-screen transition-colors duration-200">
      <div>
        {/* Branding Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-50 dark:border-slate-800/60">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200 dark:shadow-none">
            🏠
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 leading-none">SIHADIR TK</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">Sistem Absensi & Administrasi</p>
          </div>
        </div>

        {/* List Menu Navigasi */}
        <nav className="p-4 space-y-1.5">
          {allowedMenus.map(menu => {
            const Icon = menu.icon;
            const isActive = activeMenu === menu.id;

            return (
              <button
                key={menu.id}
                onClick={() => setActiveMenu(menu.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{menu.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bagian Bawah Sidebar */}
      <div className="p-4 space-y-4">
        
        {/* Card Ilustrasi Mini */}
        <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-center space-y-2">
          <img 
            src="https://img.freepik.com/free-vector/happy-children-jumping-school-building-background_1308-31295.jpg?w=826" 
            alt="TK School" 
            className="w-full h-24 object-cover rounded-xl"
          />
          <p className="text-[10px] text-indigo-900 dark:text-indigo-300 font-bold">SiHadir TK v1.0</p>
        </div>

        {/* Controls & Profil User */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          
          <div className="flex items-center justify-between px-1">
            <button 
              onClick={onToggleDark} 
              className="p-2 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
            <button 
              onClick={onReset} 
              className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition" 
              title="Reset Demo Data"
            >
              <RotateCcw size={18} />
            </button>
            <button 
              onClick={onLogout} 
              className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition" 
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${
              user.role === 'admin' ? 'bg-slate-900' : user.role === 'kepsek' ? 'bg-purple-600' : 'bg-indigo-600'
            }`}>
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize font-medium">{user.role === 'teacher' ? `Wali ${user.assignedClass}` : user.role}</p>
            </div>
          </div>

        </div>

      </div>
    </aside>
  );
}