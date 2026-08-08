import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BismillahRecord } from '../../types';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
  id?: string;
  onBack: () => void;
  onSave: () => void;
}

export function BismillahForm({ id, onBack, onSave }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<BismillahRecord>>({});

  const dbColumns = [
    'tanggal', 'brand', 'bulan', 'sumber_klien', 'status_klien', 'status', 'nama_lengkap', 
    'r', 'i', 'b', 'u', 's', 'attention', 'produk_tanya', 'qty', 'potensi_omset', 
    'perusahaan', 'pic', 'progress', 't_date', 'req_design', 'next_action', 'p_date', 
    'follow_up', 'status_lead_otomatis', 'status_order', 'produk_deal', 'lead_qualified', 
    'time_status_order', 'pic_2', 'keterangan'
  ];

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('bismillah').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) setFormData(data);
    } catch (error) {
      console.error('Error fetching record:', error);
      alert('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalVal: any = value;
    
    if (type === 'number') {
      finalVal = value === '' ? null : Number(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: finalVal }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!import.meta.env.VITE_SUPABASE_URL) {
      alert('Supabase URL belum dikonfigurasi.');
      return;
    }
    setLoading(true);
    
    try {
      if (id) {
        const { error } = await supabase.from('bismillah').update(formData).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('bismillah').insert([formData]);
        if (error) throw error;
      }
      onSave();
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-white/5 dark:backdrop-blur-md rounded-xl shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-white/10">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-emerald-400 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
            {id ? 'Edit Data Bismillah' : 'Tambah Data Bismillah'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dbColumns.map(col => {
            const isDate = ['tanggal', 't_date', 'p_date'].includes(col);
            const isNum = ['qty', 'potensi_omset'].includes(col);
            const isTextarea = ['keterangan'].includes(col);
            
            return (
              <div key={col} className={isTextarea ? 'col-span-full' : ''}>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 uppercase mb-1">
                  {col.replace(/_/g, ' ')}
                </label>
                
                {isTextarea ? (
                  <textarea
                    name={col}
                    value={(formData[col as keyof BismillahRecord] as string) || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800/50 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500/50"
                  />
                ) : (
                  <input
                    type={isDate ? 'date' : isNum ? 'number' : 'text'}
                    name={col}
                    value={(formData[col as keyof BismillahRecord] as string | number) || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800/50 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500/50"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 dark:bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-emerald-700 flex items-center disabled:bg-blue-400 dark:disabled:bg-emerald-800/50 transition-colors"
          >
            <Save size={16} className="mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan Data'}
          </button>
        </div>
      </form>
    </div>
  );
}
