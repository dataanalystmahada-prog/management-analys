-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: import_batches
CREATE TABLE import_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name TEXT NOT NULL,
    data_type TEXT NOT NULL CHECK (data_type IN ('bismillah', 'alhamdulillah')),
    row_count INTEGER NOT NULL DEFAULT 0,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'error')),
    error_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: bismillah (Leads / Pre-closing)
CREATE TABLE bismillah (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tanggal DATE,
    brand TEXT,
    bulan TEXT,
    sumber_klien TEXT,
    status_klien TEXT,
    status TEXT,
    nama_lengkap TEXT,
    r TEXT,
    i TEXT,
    b TEXT,
    u TEXT,
    s TEXT,
    attention TEXT,
    produk_tanya TEXT,
    qty INTEGER,
    potensi_omset NUMERIC,
    perusahaan TEXT,
    pic TEXT,
    progress TEXT,
    t_date DATE,
    req_design TEXT,
    next_action TEXT,
    p_date DATE,
    follow_up TEXT,
    status_lead_otomatis TEXT,
    status_order TEXT,
    produk_deal TEXT,
    lead_qualified TEXT,
    time_status_order TEXT,
    pic_2 TEXT, -- Second PIC field if needed
    keterangan TEXT,
    import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: alhamdulillah (Orders / Post-closing)
CREATE TABLE alhamdulillah (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produksi TEXT,
    tgl_masuk DATE,
    bulan TEXT,
    inv TEXT,
    chat_masuk DATE,
    brand TEXT,
    sumber_klien TEXT,
    status_klien TEXT,
    status TEXT,
    nama_klien TEXT,
    pic_sales TEXT,
    transaksi TEXT,
    produk TEXT,
    sub_produk TEXT,
    kode TEXT,
    kategory TEXT,
    type_kategoy TEXT,
    lapisan_box TEXT,
    perusahaan TEXT,
    kategori_perusahaan TEXT,
    informasi_kebutuhan TEXT,
    alamat_kirim TEXT,
    kota TEXT,
    provinsi TEXT,
    ekspedisi TEXT,
    biaya_ongkir NUMERIC,
    deadline_kons DATE,
    diskon NUMERIC,
    ppn NUMERIC,
    pph NUMERIC,
    penjualan NUMERIC,
    qty INTEGER,
    email_klien TEXT,
    file_design TEXT,
    status_kons TEXT,
    status_akhir TEXT,
    sub_status_akhir TEXT,
    purchasing TEXT,
    produksi_pic TEXT,
    solusi TEXT,
    catatan_solusi TEXT,
    durasi_closing TEXT,
    waktu_order_selesai DATE,
    isi_kuisioner TEXT,
    waktu_review_google TEXT,
    import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. View: alhamdulillah_invoices
-- This view enforces the "1 INV = 1" rule by selecting distinct invoice-level fields.
-- Do not SUM or COUNT products here; this represents unique transactions.
CREATE OR REPLACE VIEW alhamdulillah_invoices AS
SELECT DISTINCT
    inv,
    tgl_masuk,
    bulan,
    chat_masuk,
    sumber_klien,
    status_klien,
    transaksi,
    perusahaan,
    kategori_perusahaan,
    alamat_kirim,
    kota,
    provinsi,
    ekspedisi,
    biaya_ongkir,
    status_akhir,
    sub_status_akhir,
    purchasing
FROM alhamdulillah
WHERE inv IS NOT NULL;

-- Triggers to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_import_batches_updated_at BEFORE UPDATE ON import_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bismillah_updated_at BEFORE UPDATE ON bismillah FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alhamdulillah_updated_at BEFORE UPDATE ON alhamdulillah FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
