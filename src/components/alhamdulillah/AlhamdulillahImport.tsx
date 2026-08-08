import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { supabase } from '../../lib/supabase';
import { Upload, AlertCircle, CheckCircle, FileText, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  onBack: () => void;
  onImportComplete: () => void;
}

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'result';

interface MappedData {
  valid: any[];
  invalid: any[];
  duplicateCount: number;
}

export function AlhamdulillahImport({ onBack, onImportComplete }: Props) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  
  // DB columns
  const dbColumns = [
    'produksi', 'tgl_masuk', 'bulan', 'inv', 'chat_masuk', 'brand', 
    'sumber_klien', 'status_klien', 'nama_klien', 'pic_sales', 'transaksi', 
    'produk', 'sub_produk', 'kode', 'kategory', 'type_kategoy', 'lapisan_box', 
    'perusahaan', 'kategori_perusahaan', 'informasi_kebutuhan', 'alamat_kirim', 
    'kota', 'provinsi', 'ekspedisi', 'biaya_ongkir', 'deadline_kons', 'diskon', 
    'ppn', 'pph', 'penjualan', 'qty', 'email_klien', 'file_design', 'status_kons', 
    'status_akhir', 'sub_status_akhir', 'purchasing', 'solusi', 'catatan_solusi', 
    'durasi_closing', 'waktu_order_selesai', 'isi_kuisioner', 'waktu_review_google'
  ];

  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [mappedData, setMappedData] = useState<MappedData>({ valid: [], invalid: [], duplicateCount: 0 });
  const [importResult, setImportResult] = useState({ success: 0, error: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields) {
          setHeaders(results.meta.fields);
          
          // Auto-map where names match closely
          const initialMapping: Record<string, string> = {};
          dbColumns.forEach(dbCol => {
            const match = results.meta.fields!.find(
              h => h.toLowerCase().replace(/[^a-z0-9]/g, '') === dbCol.toLowerCase().replace(/[^a-z0-9]/g, '')
            );
            if (match) {
              initialMapping[dbCol] = match;
            }
          });
          setMapping(initialMapping);
          setRawData(results.data);
          setStep('mapping');
        }
      }
    });
  };

  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    // Basic date standardizer. Assumes YYYY-MM-DD or DD/MM/YYYY
    // Adjust as needed based on actual CSV formats
    if (dateStr.includes('/')) {
       const parts = dateStr.split('/');
       if (parts.length === 3) {
         if (parts[0].length === 4) return dateStr.replace(/\//g, '-'); // YYYY/MM/DD
         return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`; // DD/MM/YYYY
       }
    }
    return dateStr;
  };

  const processData = () => {
    const valid: any[] = [];
    const invalid: any[] = [];
    let duplicateCount = 0;
    
    const seenMap = new Set();

    rawData.forEach((row, index) => {
      const record: any = {};
      let isRowValid = true;
      let errorMsg = '';

      dbColumns.forEach(dbCol => {
        const csvHeader = mapping[dbCol];
        let val = csvHeader ? row[csvHeader] : null;
        
        if (val === undefined || val === '') val = null;

        // Validation
        if (['qty', 'biaya_ongkir', 'penjualan', 'durasi_closing', 'diskon', 'ppn', 'pph'].includes(dbCol) && val !== null) {
          const num = Number(String(val).replace(/[^0-9.-]+/g,""));
          if (isNaN(num)) {
            isRowValid = false;
            errorMsg = `${dbCol} harus berupa angka`;
          } else {
            val = num;
          }
        }
        if (['tgl_masuk', 'chat_masuk', 'deadline_kons', 'waktu_order_selesai'].includes(dbCol) && val !== null) {
           const parsed = parseDate(val as string);
           if (!parsed) {
              isRowValid = false;
              errorMsg = `Format tanggal ${dbCol} tidak valid`;
           }
           val = parsed;
        }

        record[dbCol] = val;
      });

      // Dup Check (Simple unique key logic, e.g. nama_lengkap + perusahaan)
      const dupKey = `${record.inv || ''}-${record.produk || ''}`.toLowerCase();
      if (dupKey !== '-' && dupKey !== '') {
        if (seenMap.has(dupKey)) {
           duplicateCount++;
        } else {
           seenMap.add(dupKey);
        }
      }

      if (isRowValid) {
        valid.push({ ...record, _rowIndex: index + 2 });
      } else {
        invalid.push({ ...record, _rowIndex: index + 2, _error: errorMsg });
      }
    });

    setMappedData({ valid, invalid, duplicateCount });
    setStep('preview');
  };

  const handleImport = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      alert('Supabase URL belum dikonfigurasi.');
      return;
    }
    setStep('importing');
    
    try {
      // 1. Create Batch
      const { data: batchData, error: batchError } = await supabase
        .from('import_batches')
        .insert({
           file_name: file?.name || 'unknown.csv',
           data_type: 'alhamdulillah',
           row_count: mappedData.valid.length + mappedData.invalid.length,
           status: 'processing'
        })
        .select()
        .single();
        
      if (batchError) throw batchError;
      
      const batchId = batchData.id;

      // 2. Insert valid data in chunks
      const chunkSize = 500;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < mappedData.valid.length; i += chunkSize) {
        const chunk = mappedData.valid.slice(i, i + chunkSize).map(item => {
          const { _rowIndex, ...rest } = item;
          return { ...rest, import_batch_id: batchId };
        });

        const { error } = await supabase.from('alhamdulillah').insert(chunk);
        if (error) {
           console.error('Chunk insert error:', error);
           errorCount += chunk.length;
        } else {
           successCount += chunk.length;
        }
      }

      // 3. Update Batch Status
      await supabase.from('import_batches').update({
        status: errorCount > 0 ? 'error' : 'completed',
        error_count: errorCount + mappedData.invalid.length
      }).eq('id', batchId);

      setImportResult({ success: successCount, error: errorCount + mappedData.invalid.length });
      setStep('result');

    } catch (err: any) {
      console.error('Import failed:', err);
      setErrorMsg(`Gagal melakukan import: ${err.message}`);
      setStep('preview');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-start mb-6">
          <div>
            <p className="font-medium text-sm">Kesalahan Import</p>
            <p className="text-sm mt-1">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-700">×</button>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Upload className="mr-2 text-blue-600" /> Import Master Alhamdulillah
        </h2>
        <button 
          onClick={step === 'result' ? onImportComplete : onBack}
          className="text-gray-500 hover:text-gray-900 text-sm font-medium"
        >
          {step === 'result' ? 'Kembali ke Daftar' : 'Batal'}
        </button>
      </div>

      {step === 'upload' && (
        <div className="text-center py-12">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 flex items-center justify-center rounded-full mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload File CSV</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Pastikan file dalam format CSV. Kolom akan di-mapping pada tahap selanjutnya.
          </p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Pilih File CSV
          </button>
        </div>
      )}

      {step === 'mapping' && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            Mapping kolom dari file CSV Anda ({file?.name}) ke database Alhamdulillah.
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-4">
            {dbColumns.map(col => (
              <div key={col} className="flex items-center gap-4">
                <div className="w-1/3 text-sm font-medium text-gray-700">
                  {col.toUpperCase().replace(/_/g, ' ')}
                </div>
                <ArrowRight size={16} className="text-gray-400" />
                <select
                  value={mapping[col] || ''}
                  onChange={e => setMapping(prev => ({ ...prev, [col]: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Abaikan Kolom Ini --</option>
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button 
              onClick={processData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Lanjut ke Preview
            </button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
             <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                <div className="text-2xl font-bold text-gray-900">{rawData.length}</div>
                <div className="text-xs text-gray-500 uppercase font-bold mt-1">Total Row</div>
                <div className="text-[10px] text-gray-400 mt-1 capitalize font-normal">Semua baris di CSV</div>
             </div>
             <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                <div className="text-2xl font-bold text-green-700">{mappedData.valid.length}</div>
                <div className="text-xs text-green-600 uppercase font-bold mt-1">Valid</div>
                <div className="text-[10px] text-green-600/70 mt-1 capitalize font-normal">Siap untuk di-import</div>
             </div>
             <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                <div className="text-2xl font-bold text-red-700">{mappedData.invalid.length}</div>
                <div className="text-xs text-red-600 uppercase font-bold mt-1">Invalid</div>
                <div className="text-[10px] text-red-500/70 mt-1 capitalize font-normal">Data error / gagal</div>
             </div>
             <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                <div className="text-2xl font-bold text-yellow-700">{mappedData.duplicateCount}</div>
                <div className="text-xs text-yellow-600 uppercase font-bold mt-1">Duplicate</div>
                <div className="text-[10px] text-yellow-600/70 mt-1 capitalize font-normal">Kembar tapi tetap masuk</div>
             </div>
          </div>

          {mappedData.invalid.length > 0 && (
            <div className="bg-white border border-red-200 rounded-lg overflow-hidden">
              <div className="bg-red-50 px-4 py-2 border-b border-red-200">
                <h3 className="text-sm font-medium text-red-800 flex items-center">
                  <AlertCircle size={16} className="mr-2" /> Data Error (Tidakan di-import)
                </h3>
              </div>
              <div className="max-h-48 overflow-y-auto p-4 bg-red-50/30">
                <ul className="space-y-2 text-sm text-red-600">
                  {mappedData.invalid.slice(0, 50).map((err, i) => (
                    <li key={i}>Baris {err._rowIndex}: {err._error} ({err.nama_lengkap || err.perusahaan || 'N/A'})</li>
                  ))}
                  {mappedData.invalid.length > 50 && (
                    <li className="font-medium">...dan {mappedData.invalid.length - 50} lainnya</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button 
              onClick={() => setStep('mapping')}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center"
            >
              <ArrowLeft size={16} className="mr-2" /> Kembali
            </button>
            <button 
              onClick={handleImport}
              disabled={mappedData.valid.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              Import {mappedData.valid.length} Data
            </button>
          </div>
        </div>
      )}

      {step === 'importing' && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Mengimport Data...</h3>
          <p className="text-gray-500">Mohon tunggu sebentar, jangan tutup halaman ini.</p>
        </div>
      )}

      {step === 'result' && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 flex items-center justify-center rounded-full mb-4">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Import Selesai!</h3>
          <p className="text-gray-500 mb-6">
             Berhasil: <span className="font-bold text-green-600">{importResult.success}</span> row<br/>
             Gagal: <span className="font-bold text-red-600">{importResult.error}</span> row
          </p>
          <button 
            onClick={onImportComplete}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Selesai & Lihat Data
          </button>
        </div>
      )}
    </div>
  );
}
