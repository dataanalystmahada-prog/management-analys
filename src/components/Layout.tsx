import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, BarChart3, Settings, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 overflow-y-auto",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <span className="text-lg font-bold text-gray-900 tracking-tight">Management Analytics</span>
          <button 
            className="p-1 lg:hidden text-gray-500 hover:text-gray-900"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon size={18} className="mr-3 flex-shrink-0" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center h-16 px-4 bg-white border-b border-gray-200 sm:px-6 lg:px-8">
          <button
            className="p-2 mr-4 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 flex justify-end">
            {/* Header content like user profile or notifications could go here */}
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
