import { supabase } from '../supabase';
import { BismillahRecord } from '../../types';

export interface GlobalFilter {
  startDate?: string;
  endDate?: string;
  bulan?: string;
  brand?: string;
  picSales?: string;
  sumberKlien?: string;
  produk?: string;
  status?: string;
  statusOrder?: string;
  provinsi?: string;
  kota?: string;
  kategoriPerusahaan?: string;
}

// ---------------------------------------------------------------------------
// DATA FETCHING (EFFICIENT COLUMN SELECTION)
// ---------------------------------------------------------------------------

export const fetchBismillahForAnalytics = async (filters: GlobalFilter) => {
  if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
    return [];
  }

  let query = supabase.from('bismillah').select('*');

  if (filters.startDate) query = query.gte('tanggal', filters.startDate);
  if (filters.endDate) query = query.lte('tanggal', filters.endDate);
  if (filters.bulan) query = query.eq('bulan', filters.bulan);
  if (filters.brand) query = query.eq('brand', filters.brand);
  if (filters.picSales) query = query.eq('pic', filters.picSales);
  if (filters.sumberKlien) query = query.eq('sumber_klien', filters.sumberKlien);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.statusOrder) query = query.eq('status_order', filters.statusOrder);
  // Note: produk, provinsi, kota, kategoriPerusahaan might not directly apply to Bismillah in the same way,
  // but we filter if they match the column names or skip if irrelevant to leads.
  if (filters.produk) query = query.ilike('produk_tanya', `%${filters.produk}%`);

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching Bismillah analytics:', error);
    if (error.message?.includes('Could not find the table')) {
      throw new Error(`Tabel 'bismillah' belum dibuat di Supabase. Silakan jalankan script SQL dari README.md.`);
    }
    throw new Error(`Gagal memuat data Leads: ${error.message}`);
  }
  return data || [];
};

export const fetchAlhamdulillahForAnalytics = async (filters: GlobalFilter) => {
  if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
    return [];
  }

  let query = supabase.from('alhamdulillah').select('*');

  if (filters.startDate) query = query.gte('tgl_masuk', filters.startDate);
  if (filters.endDate) query = query.lte('tgl_masuk', filters.endDate);
  if (filters.bulan) query = query.eq('bulan', filters.bulan);
  if (filters.brand) query = query.eq('brand', filters.brand);
  if (filters.picSales) query = query.eq('pic_sales', filters.picSales);
  if (filters.sumberKlien) query = query.eq('sumber_klien', filters.sumberKlien);
  if (filters.produk) query = query.eq('produk', filters.produk);
  if (filters.status) query = query.eq('status_klien', filters.status);
  if (filters.statusOrder) query = query.eq('status_akhir', filters.statusOrder);
  if (filters.provinsi) query = query.eq('provinsi', filters.provinsi);
  if (filters.kota) query = query.eq('kota', filters.kota);
  if (filters.kategoriPerusahaan) query = query.eq('kategori_perusahaan', filters.kategoriPerusahaan);

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching Alhamdulillah analytics:', error);
    if (error.message?.includes('Could not find the table')) {
      throw new Error(`Tabel 'alhamdulillah' belum dibuat di Supabase. Silakan jalankan script SQL dari README.md.`);
    }
    throw new Error(`Gagal memuat data Sales: ${error.message}`);
  }
  return data || [];
};

// ---------------------------------------------------------------------------
// 1. ANALISIS BISMILLAH ENGINE
// ---------------------------------------------------------------------------

export const calculateBismillahMetrics = (data: any[]) => {
  const totalLeads = data.length;
  
  const qualifiedLeads = data.filter(r => 
    r.lead_qualified === 'Yes' || 
    (r.status_klien && String(r.status_klien).toLowerCase().includes('qualified'))
  ).length;
  
  const unqualifiedLeads = data.filter(r => 
    r.lead_qualified === 'No' || 
    (r.status_klien && String(r.status_klien).toLowerCase().includes('unqualified'))
  ).length;

  const closing = data.filter(r => 
    (r.status_order && String(r.status_order).toLowerCase().includes('closing')) ||
    (r.status && String(r.status).toLowerCase().includes('closing'))
  ).length;

  const batal = data.filter(r => 
    (r.status_order && String(r.status_order).toLowerCase().includes('batal')) ||
    (r.status && String(r.status).toLowerCase().includes('batal'))
  ).length;

  const conversionRate = totalLeads > 0 ? (closing / totalLeads) * 100 : 0;
  
  const potentialOmzet = data.reduce((sum, r) => sum + (Number(r.potensi_omset) || 0), 0);
  const averagePotentialOmzet = totalLeads > 0 ? potentialOmzet / totalLeads : 0;

  return {
    totalLeads,
    qualifiedLeads,
    unqualifiedLeads,
    closing,
    batal,
    conversionRate,
    potentialOmzet,
    averagePotentialOmzet
  };
};

export const groupBismillahByField = (data: any[], field: string) => {
  const grouped = data.reduce((acc, row) => {
    const key = row[field] || 'Unknown';
    if (!acc[key]) acc[key] = { count: 0, potentialOmzet: 0 };
    acc[key].count += 1;
    acc[key].potentialOmzet += (Number(row.potensi_omset) || 0);
    return acc;
  }, {} as Record<string, { count: number, potentialOmzet: number }>);

  return Object.entries(grouped)
    .map(([key, val]: [string, any]) => ({ name: key, count: val.count, potentialOmzet: val.potentialOmzet }))
    .sort((a, b) => b.count - a.count);
};


// ---------------------------------------------------------------------------
// 2. ANALISIS ALHAMDULILLAH ENGINE (Anti Double-Counting)
// ---------------------------------------------------------------------------

export const calculateAlhamdulillahMetrics = (data: any[]) => {
  const uniqueInvoices = new Set();
  
  let totalSales = 0;
  let totalQty = 0;
  
  // Invoice level stats
  let totalBiayaOngkir = 0;

  data.forEach(row => {
    // Product-level aggregations
    totalSales += (Number(row.penjualan) || 0);
    totalQty += (Number(row.qty) || 0);

    // Invoice-level aggregations
    if (row.inv && !uniqueInvoices.has(row.inv)) {
      uniqueInvoices.add(row.inv);
      totalBiayaOngkir += (Number(row.biaya_ongkir) || 0);
    }
  });

  const uniqueInvoiceCount = uniqueInvoices.size;
  const averageOrderValue = uniqueInvoiceCount > 0 ? totalSales / uniqueInvoiceCount : 0;

  return {
    uniqueInvoiceCount,
    totalSales,
    totalQty,
    averageOrderValue,
    totalBiayaOngkir
  };
};

// For grouping invoice-level fields (e.g. Sales by Province), we must NOT double count invoices
export const groupAlhamdulillahByInvoiceField = (data: any[], field: string) => {
  const uniqueInvoices = new Set();
  const grouped: Record<string, { invoiceCount: number, sales: number }> = {};

  data.forEach(row => {
    const key = row[field] || 'Unknown';
    if (!grouped[key]) grouped[key] = { invoiceCount: 0, sales: 0 };
    
    // Always add sales (since it's product level)
    grouped[key].sales += (Number(row.penjualan) || 0);

    // Only count invoice once per field group
    if (row.inv && !uniqueInvoices.has(row.inv)) {
      uniqueInvoices.add(row.inv);
      grouped[key].invoiceCount += 1;
    }
  });

  return Object.entries(grouped)
    .map(([key, val]: [string, any]) => ({ name: key, invoiceCount: val.invoiceCount, sales: val.sales }))
    .sort((a, b) => b.sales - a.sales);
};

// For product-level fields
export const groupAlhamdulillahByProductField = (data: any[], field: string) => {
  const grouped: Record<string, { qty: number, sales: number }> = {};

  data.forEach(row => {
    const key = row[field] || 'Unknown';
    if (!grouped[key]) grouped[key] = { qty: 0, sales: 0 };
    
    grouped[key].sales += (Number(row.penjualan) || 0);
    grouped[key].qty += (Number(row.qty) || 0);
  });

  return Object.entries(grouped)
    .map(([key, val]: [string, any]) => ({ name: key, qty: val.qty, sales: val.sales }))
    .sort((a, b) => b.sales - a.sales);
};

// ---------------------------------------------------------------------------
// 3. CROSS DATA ANALYSIS
// ---------------------------------------------------------------------------

/**
 * Matches Leads (Bismillah) to Orders (Alhamdulillah)
 * Uses a heuristic matching strategy since there's no strict foreign key.
 * Match criteria: 
 * 1. Exact match on Perusahaan (Company) if available
 * 2. Exact match on Nama Lengkap / Nama Klien
 */
export const calculateCrossDataMetrics = (bismillahData: any[], alhamdulillahData: any[]) => {
  let matchedByPerusahaan = 0;
  let matchedByNama = 0;
  
  // Extract unique identifiers from Alhamdulillah for faster lookup
  const alhamPerusahaan = new Set(alhamdulillahData.map(r => String(r.perusahaan || '').toLowerCase().trim()).filter(Boolean));
  const alhamNama = new Set(alhamdulillahData.map(r => String(r.nama_klien || '').toLowerCase().trim()).filter(Boolean));

  bismillahData.forEach(lead => {
    const p = String(lead.perusahaan || '').toLowerCase().trim();
    const n = String(lead.nama_lengkap || '').toLowerCase().trim();
    
    let matched = false;
    
    if (p && alhamPerusahaan.has(p)) {
      matchedByPerusahaan++;
      matched = true;
    }
    
    if (!matched && n && alhamNama.has(n)) {
      matchedByNama++;
    }
  });

  const totalMatched = matchedByPerusahaan + matchedByNama;
  const leadToOrderMatchRate = bismillahData.length > 0 ? (totalMatched / bismillahData.length) * 100 : 0;

  return {
    totalLeadsAnalyzed: bismillahData.length,
    totalOrdersAnalyzed: alhamdulillahData.length,
    matchedByPerusahaan,
    matchedByNama,
    totalMatched,
    leadToOrderMatchRate
  };
};
