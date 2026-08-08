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

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <h2 className="text-md font-medium text-gray-900">Global Filters</h2>
        </div>
        <button 
          onClick={refreshData}
          disabled={loading}
          className="flex items-center px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
          <input type="date" name="startDate" value={filters.startDate || ''} onChange={handleFilterChange} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
          <input type="date" name="endDate" value={filters.endDate || ''} onChange={handleFilterChange} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Bulan</label>
          <input type="month" name="bulan" value={filters.bulan || ''} onChange={handleFilterChange} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Brand</label>
          <input type="text" name="brand" value={filters.brand || ''} placeholder="All Brands" onChange={handleFilterChange} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">PIC Sales</label>
          <input type="text" name="picSales" value={filters.picSales || ''} placeholder="All PICs" onChange={handleFilterChange} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Sumber Klien</label>
          <input type="text" name="sumberKlien" value={filters.sumberKlien || ''} placeholder="All Sources" onChange={handleFilterChange} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Produk</label>
          <input type="text" name="produk" value={filters.produk || ''} placeholder="All Products" onChange={handleFilterChange} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
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
