// =====================================================
// KONEKSI SUPABASE
// Sistem Pembelian dan Pengendalian Anggaran Salon
// =====================================================

const SUPABASE_URL = "https://snhidpqdliqnhawysldt.supabase.co";

const SUPABASE_KEY = "sb_publishable_do7wsVxWbHFry9inJx_Cyw_Ik-GieO6";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);