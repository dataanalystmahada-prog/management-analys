import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, BarChart3, Settings, Menu, X, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../lib/ThemeContext';

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navGroups = [
    {
      title: 'DASHBOARD',
      items: [
        { name: 'Overview', path: '/analisis/overview', icon: LayoutDashboard },
      ]
    },
    {
      title: 'BISMILLAH',
      items: [
        { name: 'Lead Analysis', path: '/analisis/bismillah/lead', icon: BarChart3 },
        { name: 'Conversion Analysis', path: '/analisis/bismillah/conversion', icon: BarChart3 },
        { name: 'Sales Performance', path: '/analisis/bismillah/sales', icon: BarChart3 },
        { name: 'Source Analysis', path: '/analisis/bismillah/source', icon: BarChart3 },
        { name: 'Product Analysis', path: '/analisis/bismillah/product', icon: BarChart3 },
        { name: 'Follow Up Analysis', path: '/analisis/bismillah/followup', icon: BarChart3 },
      ]
    },
    {
      title: 'ALHAMDULILLAH',
      items: [
        { name: 'Sales Analysis', path: '/analisis/alhamdulillah/sales', icon: BarChart3 },
        { name: 'Product Analysis', path: '/analisis/alhamdulillah/product', icon: BarChart3 },
        { name: 'Customer Analysis', path: '/analisis/alhamdulillah/customer', icon: BarChart3 },
        { name: 'Sales Performance', path: '/analisis/alhamdulillah/performance', icon: BarChart3 },
        { name: 'Production Analysis', path: '/analisis/alhamdulillah/production', icon: BarChart3 },
        { name: 'Order Analysis', path: '/analisis/alhamdulillah/order', icon: BarChart3 },
      ]
    },
    {
      title: 'DATA',
      items: [
        { name: 'Master Bismillah', path: '/bismillah', icon: Users },
        { name: 'Master Alhamdulillah', path: '/alhamdulillah', icon: ShoppingCart },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Settings', path: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 dark:bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] dark:from-slate-900 dark:via-[#0a192f] dark:to-[#064e3b] text-gray-900 dark:text-slate-100 font-sans selection:bg-emerald-500/30 transition-colors duration-300">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900/50 dark:bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-white/5 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 shadow-sm dark:shadow-[4px_0_24px_rgba(0,0,0,0.5)] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 overflow-y-auto",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 dark:border-white/10 sticky top-0 bg-white dark:bg-transparent backdrop-blur-xl z-10">
          <div className="flex flex-col w-full pr-4">
            <span className="text-3xl font-black text-gray-900 dark:text-transparent dark:bg-gradient-to-r dark:from-emerald-400 dark:to-cyan-400 dark:bg-clip-text leading-none tracking-widest dark:drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">MAHADA</span>
            <div className="flex justify-between w-full text-[9px] font-bold text-gray-500 dark:text-emerald-400/80 mt-1.5 uppercase tracking-widest">
              {'Analisis Pro'.split('').map((char, i) => (
                <span key={i}>{char === ' ' ? '\u00A0' : char}</span>
              ))}
            </div>
          </div>
          <button 
            className="p-1 lg:hidden text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-emerald-400 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-emerald-500/70 uppercase tracking-widest mb-3">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-blue-50 text-blue-700 dark:bg-gradient-to-r dark:from-emerald-400/20 dark:to-cyan-400/5 dark:text-white dark:border-l-4 dark:border-l-emerald-400 dark:shadow-[0_0_20px_rgba(52,211,153,0.15)] font-bold"
                          : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-emerald-200"
                      )
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon size={18} className={cn("mr-3 flex-shrink-0 transition-transform duration-200")} />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Glow Effects (Dark Mode Only) */}
        {theme === 'dark' && (
          <>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
          </>
        )}

        {/* Header */}
        <header className="flex items-center h-16 px-4 bg-white dark:bg-white/5 backdrop-blur-md border-b border-gray-200 dark:border-white/10 sm:px-6 lg:px-8 relative z-10">
          <button
            className="p-2 mr-4 text-gray-500 dark:text-slate-400 rounded-lg lg:hidden hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500/50 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-emerald-400 rounded-full transition-colors"
                title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-gradient-to-tr dark:from-emerald-500 dark:to-cyan-500 dark:p-[1px] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-blue-100 dark:bg-slate-900 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-700 dark:text-emerald-400">AD</span>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300 hidden sm:block">Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative z-10 scrollbar-thin scrollbar-thumb-emerald-900/50 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
