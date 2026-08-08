import React from 'react';
import { Outlet } from 'react-router-dom';
import { FilterProvider, useFilter } from '../../lib/analytics/FilterContext';
import { Filter, RefreshCw } from 'lucide-react';

const GlobalFilterBar = () => {
  const { filters, setFilters, loading, refreshData } = useFilter();

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const inputClasses = "w-full px-3 py-2 bg-white dark:bg-slate-900/60 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-blue-500/50 dark:focus:ring-emerald-500/50 transition-colors";
  const labelClasses = "block text-xs font-semibold text-gray-700 dark:text-emerald-500/80 mb-1.5 uppercase tracking-wider";

  return (
    <div className="bg-white dark:bg-white/5 dark:backdrop-blur-md p-5 rounded-2xl shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-white/10 mb-6 relative overflow-hidden transition-colors duration-300">
      <div className="hidden dark:block absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-emerald-500/10 rounded-lg">
            <Filter size={18} className="text-gray-500 dark:text-emerald-400" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-slate-100">Global Filters</h2>
        </div>
        <button 
          onClick={refreshData}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700 dark:hover:text-emerald-400 transition-all duration-200 shadow-sm dark:shadow-lg dark:shadow-black/20"
        >
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin text-blue-500 dark:text-emerald-400' : ''}`} />
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 relative z-10">
        <div>
          <label className={labelClasses}>Start Date</label>
          <input type="date" name="startDate" value={filters.startDate || ''} onChange={handleFilterChange} className={inputClasses} />
        </div>
        <div>
          <label className={labelClasses}>End Date</label>
          <input type="date" name="endDate" value={filters.endDate || ''} onChange={handleFilterChange} className={inputClasses} />
        </div>
        <div>
          <label className={labelClasses}>Bulan</label>
          <input type="month" name="bulan" value={filters.bulan || ''} onChange={handleFilterChange} className={inputClasses} />
        </div>
        <div>
          <label className={labelClasses}>Brand</label>
          <input type="text" name="brand" value={filters.brand || ''} placeholder="All Brands" onChange={handleFilterChange} className={inputClasses} />
        </div>
        <div>
          <label className={labelClasses}>PIC Sales</label>
          <input type="text" name="picSales" value={filters.picSales || ''} placeholder="All PICs" onChange={handleFilterChange} className={inputClasses} />
        </div>
        <div>
          <label className={labelClasses}>Sumber Klien</label>
          <input type="text" name="sumberKlien" value={filters.sumberKlien || ''} placeholder="All Sources" onChange={handleFilterChange} className={inputClasses} />
        </div>
        <div>
          <label className={labelClasses}>Produk</label>
          <input type="text" name="produk" value={filters.produk || ''} placeholder="All Products" onChange={handleFilterChange} className={inputClasses} />
        </div>
      </div>
    </div>
  );
};

const AnalyticsContent = () => {
  const { error } = useFilter();
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl my-6">
        <h3 className="font-semibold text-lg mb-2">Terjadi Kesalahan</h3>
        <p>{error}</p>
        <p className="mt-2 text-sm text-red-600">Pastikan konfigurasi Supabase (URL dan Anon Key) dan schema database sudah benar.</p>
      </div>
    );
  }
  
  return <Outlet />;
};

export function AnalyticsLayout() {
  return (
    <FilterProvider>
      <div className="space-y-4">
        <GlobalFilterBar />
        <AnalyticsContent />
      </div>
    </FilterProvider>
  );
}
