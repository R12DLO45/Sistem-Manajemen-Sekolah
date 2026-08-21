// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { 
  LayoutDashboard, ClipboardCheck, Users, School, 
  UserCheck, FileText, Headphones, X, Menu, Sun, Moon
} from 'lucide-react';

export default function Sidebar({ 
  user = { name: 'User', role: 'teacher' }, 
  activeMenu = 'dashboard', 
  setActiveMenu = () => {}, 
  collapsed = false, 
  onToggleSidebar = () => {},
  mobileOpen = false, 
  setMobileOpen = () => {},
  darkMode = false,
  onToggleDark = () => {}
}) {
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchCurrentX, setTouchCurrentX] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchCurrentX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchCurrentX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX - touchCurrentX;
    if (swipeDistance > 50) {
      setMobileOpen(false);
    }
    setTouchStartX(0);
    setTouchCurrentX(0);
  };

  const allMenus = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'kepsek', 'teacher'] },
    { id: 'absensi', label: 'Absensi', icon: ClipboardCheck, roles: ['admin', 'teacher'] },
    { id: 'data-anak', label: 'Data Anak', icon: Users, roles: ['admin', 'kepsek', 'teacher'] },
    { id: 'kelas', label: 'Kelas', icon: School, roles: ['admin', 'kepsek'] },
    { id: 'guru', label: 'Guru', icon: UserCheck, roles: ['admin'] },
    { id: 'laporan', label: 'Laporan', icon: FileText, roles: ['admin', 'kepsek'] },
  ];

  const userRole = user?.role || 'teacher';
  const allowedMenus = allMenus.filter(m => m.roles.includes(userRole));

  return (
    <>
      {/* Overlay Gelap Mobile */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Principal */}
      <aside 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`
          fixed md:sticky top-0 left-0 h-screen z-50 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between shrink-0 transition-all duration-300 touch-pan-x overflow-y-auto
          ${collapsed ? 'md:w-20' : 'md:w-64'}
          ${mobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full justify-between p-0">
          <div>
            
            {/* Header Sidebar */}
            <div className="p-4 border-b border-slate-50 dark:border-slate-800/60 flex items-center justify-between min-h-[65px] relative">
              <div className={`items-center gap-3 min-w-0 ${collapsed ? 'flex md:hidden' : 'flex'}`}>
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200 dark:shadow-none shrink-0">
                  🏠
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 leading-none truncate">TK CERIA</h1>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1 truncate">Sistem Absensi</p>
                </div>
              </div>

              {/* Tombol Lipat Desktop */}
              <button 
                onClick={onToggleSidebar}
                className={`hidden md:flex p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
                  collapsed ? 'mx-auto' : 'ml-auto'
                }`}
                title={collapsed ? "Buka Sidebar" : "Lipat Sidebar"}
              >
                <Menu size={20} />
              </button>

              {/* Tombol Tutup Mobile */}
              <button 
                onClick={() => setMobileOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 md:hidden ml-auto"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Navigasi */}
            <nav className="p-3 space-y-1.5">
              {allowedMenus.map(menu => {
                const Icon = menu.icon;
                const isActive = activeMenu === menu.id;

                return (
                  <button
                    key={menu.id}
                    onClick={() => {
                      setActiveMenu(menu.id);
                      setMobileOpen(false);
                    }}
                    title={collapsed ? menu.label : ''}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                      collapsed ? 'md:justify-center' : ''
                    } ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                    <span className={`truncate ${collapsed ? 'inline md:hidden' : 'inline'}`}>
                      {menu.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bagian Bawah: Toggle Dark Mode & Help Card */}
          <div className="p-3 mt-auto space-y-2">
            <button
              onClick={onToggleDark}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition ${
                collapsed ? 'md:justify-center' : 'justify-between'
              }`}
              title={darkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            >
              <div className="flex items-center gap-2.5">
                {darkMode ? (
                  <Sun size={18} className="text-amber-400 shrink-0" />
                ) : (
                  <Moon size={18} className="text-indigo-600 shrink-0" />
                )}
                <span className={`truncate ${collapsed ? 'inline md:hidden' : 'inline'}`}>
                  {darkMode ? "Mode Terang" : "Mode Gelap"}
                </span>
              </div>

              <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'} ${collapsed ? 'hidden md:hidden' : 'block'}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>

            <div className={`p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl space-y-1.5 ${collapsed ? 'block md:hidden' : 'block'}`}>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                <Headphones size={18} />
                <span>Butuh Bantuan?</span>
              </div>
              <p className="text-[10px] text-indigo-900/70 dark:text-indigo-300 font-medium leading-relaxed">
                Hubungi admin jika ada kendala.
              </p>
            </div>

            {collapsed && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl text-center text-indigo-600 dark:text-indigo-400 hidden md:block" title="Butuh Bantuan? Hubungi Admin">
                <Headphones size={20} className="mx-auto" />
              </div>
            )}
          </div>

        </div>
      </aside>
    </>
  );
}