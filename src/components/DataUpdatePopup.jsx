import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, CheckCircle, Clock, Database, ExternalLink } from 'lucide-react';

/**
 * DataUpdatePopup
 * Muncul sekali saat user pertama kali buka web (per sesi atau per versi data).
 * Menampilkan informasi kapan data terakhir diperbarui.
 *
 * Props:
 * - dataVersion: string (misal: 'SSGI 2024')
 * - lastUpdated: ISO string
 * - dataSource: 'sheets' | 'cache' | 'local'
 */

const POPUP_KEY = 'nutrivision_popup_seen'; // localStorage key

const DataUpdatePopup = ({ dataVersion, lastUpdated, dataSource }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Cek apakah popup sudah pernah ditampilkan untuk versi data ini
    const seen = localStorage.getItem(POPUP_KEY);
    if (seen !== dataVersion) {
      // Delay 1.5 detik biar web load dulu
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [dataVersion]);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem(POPUP_KEY, dataVersion);
  };

  // Format tanggal
  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format waktu
  const formatTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }) + ' WIB';
  };

  const getDataAge = () => {
    if (!lastUpdated) return null;
    const diffMs = Date.now() - new Date(lastUpdated).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    if (diffDays < 1)    return { label: 'Hari ini', fresh: true };
    if (diffDays < 7)    return { label: `${diffDays} hari lalu`, fresh: true };
    if (diffDays < 30)   return { label: `${Math.floor(diffDays / 7)} minggu lalu`, fresh: true };
    if (diffMonths < 12) return { label: `${diffMonths} bulan lalu`, fresh: true };
    return { label: `${Math.floor(diffMonths / 12)} tahun lalu`, fresh: false };
  };

  const age = getDataAge();

  const sourceLabel = {
    sheets: { text: 'Live · Google Sheets', color: 'text-emerald-400', icon: '🟢' },
    cache:  { text: 'Cache 24 Jam',          color: 'text-sky-400',     icon: '🔵' },
    local:  { text: 'Data Lokal (Offline)',   color: 'text-slate-400',   icon: '⚫' },
  }[dataSource] || { text: 'Data Lokal', color: 'text-slate-400', icon: '⚫' };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Popup Card */}
          <motion.div
            key="popup"
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 flex items-center justify-center z-[101] px-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md bg-[#0a1628] border border-emerald-500/30 rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.15)] overflow-hidden">

              {/* Header hijau */}
              <div className="relative bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border-b border-emerald-500/20 px-6 pt-6 pb-5">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition-all"
                >
                  <X size={14} />
                </button>

                {/* Icon + Title */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="text-emerald-400 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-0.5">
                      Pembaruan Data
                    </p>
                    <h2 className="text-lg font-black text-white leading-tight">
                      Data Telah Diperbarui!
                    </h2>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Dashboard NutriVision ID menggunakan data gizi terkini yang diperbarui secara otomatis dari sumber resmi pemerintah Indonesia.
                </p>
              </div>

              {/* Body: Info Cards */}
              <div className="px-6 py-5 space-y-3">

                {/* Versi Data */}
                <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/60 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Database size={15} className="text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Versi Data</p>
                      <p className="text-sm font-black text-white">{dataVersion || 'SKI 2023'}</p>
                    </div>
                  </div>
                  <span className="text-[9px] px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-full font-black">
                    Terkini
                  </span>
                </div>

                {/* Tanggal Update */}
                <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/60 rounded-2xl px-4 py-3">
                  <Clock size={15} className="text-amber-400 shrink-0" />
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Terakhir Diperbarui</p>
                    <p className="text-sm font-black text-white">
                      {lastUpdated ? formatDate(lastUpdated) : 'Februari 2025'}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-0.5">
                      {lastUpdated ? formatTime(lastUpdated) : ''} · {age?.label || '—'}
                    </p>
                  </div>
                </div>

                {/* Sumber */}
                <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/60 rounded-2xl px-4 py-3">
                  <span className="text-base shrink-0">{sourceLabel.icon}</span>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Sumber Data</p>
                    <p className={`text-sm font-black ${sourceLabel.color}`}>{sourceLabel.text}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">
                      Kemenkes RI · SSGI · Badan Gizi Nasional
                    </p>
                  </div>
                </div>

                {/* Auto-update info */}
                <div className="flex items-start gap-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl px-4 py-3">
                  <RefreshCw size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Data diperbarui <span className="text-emerald-400 font-bold">otomatis setiap minggu</span> dari sumber resmi pemerintah. Tidak diperlukan update manual.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm py-3 rounded-2xl transition-all active:scale-95 shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                >
                  Mengerti, Lihat Dashboard
                </button>
                <a
                  href="https://stunting.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClose}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-700 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/40 transition-all shrink-0"
                  title="Lihat sumber data"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DataUpdatePopup;
