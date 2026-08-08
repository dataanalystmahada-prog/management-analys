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
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex justify-between items-start">
          <div>
            <p className="font-medium text-sm">Terjadi Kesalahan</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 dark:hover:text-red-300">×</button>
        </div>
      )}
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Master Data Alhamdulillah</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Total {totalCount} data sales</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={fetchData}
            className="flex items-center px-3 py-2 bg-white dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => onEditClick()}
            className="flex items-center px-4 py-2 bg-white dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Tambah Data
          </button>
          <button 
            onClick={onImportClick}
            className="flex items-center px-4 py-2 bg-blue-600 dark:bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Upload size={16} className="mr-2" />
            Import CSV
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-white/5 dark:backdrop-blur-md p-4 rounded-xl shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-white/10 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400 dark:text-slate-500" />
            </div>
            <input 
              type="text" 
              placeholder="Cari nama, perusahaan, INV..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500/50 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
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
                className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500/50 text-gray-700 dark:text-slate-200 max-w-[150px]"
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
            className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500/50 text-gray-700 dark:text-slate-200"
            title="Tgl Masuk"
          />
          
          {Object.values(filters).some(Boolean) && (
            <button 
              onClick={() => { setFilters({}); setPage(1); }}
              className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-white/5 dark:backdrop-blur-md rounded-xl shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-emerald-900/30">
            <thead className="bg-gray-50 dark:bg-slate-900/80">
              <tr>
                <th scope="col" className="sticky left-0 bg-gray-50 dark:bg-slate-900 z-10 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Aksi</th>
                {['Tgl Masuk', 'Bulan', 'INV', 'Brand', 'Sumber Klien', 'Status Klien', 'Status', 'Nama Klien', 'PIC Sales', 'Transaksi', 'Produk', 'Sub Produk', 'Kategori Perusahaan', 'Provinsi', 'Kota', 'Biaya Ongkir', 'Penjualan', 'QTY', 'Status Akhir', 'Sub Status Akhir', 'Purchasing', 'Produksi PIC', 'Solusi', 'Catatan Solusi', 'Produksi', 'Durasi Closing', 'Waktu Order Selesai', 'Perusahaan'].map((col) => (
                  <th key={col} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-black/10 divide-y divide-gray-200 dark:divide-white/5">
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={25} className="px-6 py-10 text-center text-gray-500 dark:text-slate-400">Memuat data...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={25} className="px-6 py-10 text-center text-gray-500 dark:text-slate-400">Tidak ada data ditemukan.</td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 group transition-colors">
                    <td className="sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-gray-50 dark:group-hover:bg-slate-800 z-10 px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 border-r border-gray-100 dark:border-emerald-900/30">
                      <div className="flex gap-2">
                        <button onClick={() => onEditClick(row.id)} className="text-blue-600 dark:text-emerald-400 hover:text-blue-800 dark:hover:text-emerald-300" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(row.id!)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.tgl_masuk}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.bulan}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-200">{row.inv}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.brand}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.sumber_klien}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.status_klien}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.status}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.nama_klien}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.pic_sales}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.transaksi}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.produk}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.sub_produk}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.kategori_perusahaan}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.provinsi}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.kota}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300 text-right">{row.biaya_ongkir?.toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300 text-right">{row.penjualan?.toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300 text-right">{row.qty}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.status_akhir}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.sub_status_akhir}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.purchasing}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.produksi_pic}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.solusi}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.catatan_solusi}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.produksi}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.durasi_closing}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.waktu_order_selesai}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{row.perusahaan}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white dark:bg-black/20 px-4 py-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-slate-300">
                Menampilkan <span className="font-medium text-gray-900 dark:text-slate-100">{(page - 1) * limit + 1}</span> ke <span className="font-medium text-gray-900 dark:text-slate-100">{Math.min(page * limit, totalCount)}</span> dari <span className="font-medium text-gray-900 dark:text-slate-100">{totalCount}</span> data
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:bg-gray-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft size={20} />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-slate-300">
                  Halaman {page} dari {totalPages || 1}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:bg-gray-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed transition-colors"
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
