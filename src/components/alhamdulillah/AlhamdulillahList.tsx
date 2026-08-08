import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AlhamdulillahRecord } from '../../types';
import { Search, Filter, Edit, Trash2, ChevronLeft, ChevronRight, RefreshCw, Plus, Upload } from 'lucide-react';

interface Props {
  onImportClick: () => void;
  onEditClick: (id?: string) => void;
}

export function AlhamdulillahList({ onImportClick, onEditClick }: Props) {
  const [data, setData] = useState<AlhamdulillahRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 20;

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({});

  const filterFields = [
    'tgl_masuk', 'bulan', 'inv', 'brand', 'sumber_klien', 'status_klien',
    'pic_sales', 'transaksi', 'produk', 'kategori_perusahaan', 'status_akhir'
  ];

  const fetchData = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('alhamdulillah')
        .select('*', { count: 'exact' });

      // Search
      if (search) {
        query = query.or(`nama_klien.ilike.%${search}%,perusahaan.ilike.%${search}%,inv.ilike.%${search}%`);
      }

      // Filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          query = query.eq(key, value);
        }
      });

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data: alhamdulillahData, error, count } = await query;

      if (error) throw error;
      
      setData(alhamdulillahData || []);
      if (count !== null) setTotalCount(count);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      if (err.message?.includes('Could not find the table')) {
        setError(`Tabel 'alhamdulillah' belum dibuat di Supabase. Silakan jalankan script SQL dari README.md.`);
      } else {
        setError(err.message || 'Gagal memuat data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL) return;
    try {
      const options: Record<string, string[]> = {};
      
      for (const field of filterFields) {
        if (field === 'tgl_masuk') continue; 
        
        const { data, error } = await supabase
          .from('alhamdulillah')
          .select(field)
          .neq(field, null)
          .neq(field, '')
          .limit(100); 
          
        if (data && !error) {
          const uniqueValues = Array.from(new Set(data.map(item => item[field]).filter(Boolean)));
          options[field] = uniqueValues.sort() as string[];
        }
      }
      setFilterOptions(options);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search, filters]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      alert('Supabase URL belum dikonfigurasi.');
      return;
    }
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    try {
      const { error } = await supabase.from('alhamdulillah').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Gagal menghapus data');
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-start">
          <div>
            <p className="font-medium text-sm">Terjadi Kesalahan</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">×</button>
        </div>
      )}
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Data Alhamdulillah</h1>
          <p className="text-sm text-gray-500 mt-1">Total {totalCount} data sales</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={fetchData}
            className="flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => onEditClick()}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Tambah Data
          </button>
          <button 
            onClick={onImportClick}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Upload size={16} className="mr-2" />
            Import CSV
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Cari nama, perusahaan, INV..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {filterFields.map(field => (
             field !== 'tgl_masuk' && (
               <select
                key={field}
                value={filters[field] || ''}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, [field]: e.target.value }));
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 max-w-[150px]"
              >
                <option value="">{field.replace(/_/g, ' ').toUpperCase()}</option>
                {filterOptions[field]?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
             )
          ))}
          
          <input
            type="date"
            value={filters['tgl_masuk'] || ''}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, tgl_masuk: e.target.value }));
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            title="Tgl Masuk"
          />
          
          {Object.values(filters).some(Boolean) && (
            <button 
              onClick={() => { setFilters({}); setPage(1); }}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="sticky left-0 bg-gray-50 z-10 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
                {['Tgl Masuk', 'Bulan', 'INV', 'Brand', 'Sumber Klien', 'Status Klien', 'Nama Klien', 'PIC Sales', 'Transaksi', 'Produk', 'Sub Produk', 'Kategori Perusahaan', 'Provinsi', 'Kota', 'Biaya Ongkir', 'Penjualan', 'QTY', 'Status Akhir', 'Sub Status Akhir', 'Purchasing', 'Produksi', 'Durasi Closing', 'Waktu Order Selesai', 'Perusahaan'].map((col) => (
                  <th key={col} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={25} className="px-6 py-10 text-center text-gray-500">Memuat data...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={25} className="px-6 py-10 text-center text-gray-500">Tidak ada data ditemukan.</td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="sticky left-0 bg-white group-hover:bg-gray-50 z-10 px-4 py-2 whitespace-nowrap text-sm text-gray-500 border-r border-gray-100">
                      <div className="flex gap-2">
                        <button onClick={() => onEditClick(row.id)} className="text-blue-600 hover:text-blue-800" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(row.id!)} className="text-red-600 hover:text-red-800" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.tgl_masuk}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.bulan}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{row.inv}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.brand}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.sumber_klien}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.status_klien}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.nama_klien}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.pic_sales}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.transaksi}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.produk}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.sub_produk}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.kategori_perusahaan}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.provinsi}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.kota}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{row.biaya_ongkir?.toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{row.penjualan?.toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{row.qty}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.status_akhir}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.sub_status_akhir}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.purchasing}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.produksi}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.durasi_closing}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.waktu_order_selesai}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.perusahaan}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Menampilkan <span className="font-medium">{(page - 1) * limit + 1}</span> ke <span className="font-medium">{Math.min(page * limit, totalCount)}</span> dari <span className="font-medium">{totalCount}</span> data
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft size={20} />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Halaman {page} dari {totalPages || 1}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight size={20} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
