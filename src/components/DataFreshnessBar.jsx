import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Wifi, WifiOff, Clock, Database, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

/**
 * DataFreshnessBar
 * Banner yang menampilkan status data terkini: sumber, waktu update, dan indikator kesegaran.
 *
 * Props:
 * - dataSource: 'sheets' | 'cache' | 'local'
 * - dataVersion: string (misal: 'SSGI 2024', 'SKI 2023')
 * - lastUpdated: ISO string kapan data terakhir diupdate
 * - isLoading: boolean
 * - onRefresh: function — callback ketika user klik refresh
 * - provincesCount: number
 */
const DataFreshnessBar = ({ dataSource, dataVersion, lastUpdated, isLoading, onRefresh, provincesCount }) => {
  const [expanded, setExpanded] = useState(false);

  // ─── Kalkulasi Kesegaran Data ──────────────────────────────────────────────
  const getDataAge = () => {
    if (!lastUpdated) return null;
    const now   = Date.now();
    const then  = new Date(lastUpdated).getTime();
    const diffMs = now - then;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);

    if (diffDays < 1)      return { label: 'Baru saja',         fresh: true  };
    if (diffDays < 7)      return { label: `${diffDays} hari lalu`,   fresh: true  };
    if (diffDays < 30)     return { label: `${Math.floor(diffDays/7)} minggu lalu`, fresh: true  };
    if (diffMonths < 12)   return { label: `${diffMonths} bulan lalu`, fresh: true  };
    return { label: `${Math.floor(diffMonths/12)} tahun lalu`, fresh: false };
  };

  const age = getDataAge();

  // ─── Config berdasarkan dataSource ────────────────────────────────────────
  const sourceConfig = {
    sheets: {
      icon:       <Wifi size={11} />,
      label:      'Live · Google Sheets',
      color:      'text-emerald-400',
      bg:         'bg-emerald-500/10',
      border:     'border-emerald-500/20',
      dot:        'bg-emerald-400',
      pulseColor: 'bg-emerald-400',
    },
    github: {
      icon:       <Wifi size={11} />,
      label:      'Live · GitHub',
      color:      'text-emerald-400',
      bg:         'bg-emerald-500/10',
      border:     'border-emerald-500/20',
      dot:        'bg-emerald-400',
      pulseColor: 'bg-emerald-400',
    },
    cache: {
      icon:       <Database size={11} />,
      label:      'Cache · 6 Jam',
      color:      'text-sky-400',
      bg:         'bg-sky-500/10',
      border:     'border-sky-500/20',
      dot:        'bg-sky-400',
      pulseColor: 'bg-sky-400',
    },
    local: {
      icon:       <WifiOff size={11} />,
      label:      'Data Lokal',
      color:      age?.fresh === false ? 'text-amber-400' : 'text-slate-400',
      bg:         age?.fresh === false ? 'bg-amber-500/10' : 'bg-slate-800/60',
      border:     age?.fresh === false ? 'border-amber-500/20' : 'border-slate-700/40',
      dot:        age?.fresh === false ? 'bg-amber-400' : 'bg-slate-500',
      pulseColor: 'bg-slate-500',
    },
  };

  const cfg = sourceConfig[dataSource] || sourceConfig.local;

  // ─── Format tanggal tampilan ───────────────────────────────────────────────
  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className={`w-full ${cfg.bg} border-b ${cfg.border} transition-all duration-300`}>
      {/* ── Bar Utama ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-3 flex-wrap">

        {/* Status dot + label */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center justify-center">
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            {dataSource === 'sheets' && (
              <span className={`absolute w-2 h-2 rounded-full ${cfg.pulseColor} animate-ping opacity-60`} />
            )}
            {dataSource === 'github' && (
              <span className={`absolute w-2 h-2 rounded-full ${cfg.pulseColor} animate-ping opacity-60`} />
            )}
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.color} flex items-center gap-1`}>
            {cfg.icon} {cfg.label}
          </span>
        </div>

        <div className="w-px h-3 bg-slate-700/60 shrink-0 hidden sm:block" />

        {/* Versi data */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">📊 Versi:</span>
          <span className={`text-[9px] font-black ${cfg.color} uppercase tracking-wider`}>
            {dataVersion || 'SKI 2023'}
          </span>
        </div>

        <div className="w-px h-3 bg-slate-700/60 shrink-0 hidden sm:block" />

        {/* Waktu update */}
        {lastUpdated && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Clock size={9} className="text-slate-600" />
            <span className="text-[9px] text-slate-500 font-bold">
              Diperbarui: <span className="text-slate-400">{age?.label}</span>
            </span>
          </div>
        )}

        {/* Stale warning */}
        {age?.fresh === false && (
          <>
            <div className="w-px h-3 bg-slate-700/60 shrink-0 hidden sm:block" />
            <span className="text-[9px] text-amber-400 font-black flex items-center gap-1 animate-pulse">
              ⚠️ Menunggu rilis data terbaru dari Kemenkes
            </span>
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh data dari Sheets"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
              isLoading
                ? 'border-slate-700 text-slate-600 cursor-not-allowed'
                : `${cfg.border} ${cfg.color} hover:bg-white/5 active:scale-95`
            }`}
          >
            <RefreshCw size={9} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Memuat...' : 'Refresh'}
          </button>
        )}

        {/* Expand/collapse detail */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-400 transition-colors"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* ── Panel Detail (collapsible) ────────────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 pt-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-3">
                  <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1">Sumber Stunting</p>
                  <p className={`text-[10px] font-black ${cfg.color}`}>{dataVersion || 'SKI 2023'}</p>
                  <p className="text-[8px] text-slate-600 mt-0.5">Kemenkes RI / BKPK</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-3">
                  <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1">Update Terakhir</p>
                  <p className="text-[10px] font-black text-slate-300">{formatDate(lastUpdated)}</p>
                  <p className="text-[8px] text-slate-600 mt-0.5">{age?.label}</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-3">
                  <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1">Cakupan Data</p>
                  <p className="text-[10px] font-black text-slate-300">{provincesCount || 38} Provinsi</p>
                  <p className="text-[8px] text-slate-600 mt-0.5">Seluruh Indonesia</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-3">
                  <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1">Mode Data</p>
                  <p className={`text-[10px] font-black ${cfg.color}`}>
                    {dataSource === 'sheets' ? '🟢 Live Sheets' : dataSource === 'cache' ? '🔵 Cache' : '⚫ Lokal'}
                  </p>
                  <a
                    href="https://data.go.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[8px] text-slate-600 hover:text-emerald-400 transition-colors mt-0.5 flex items-center gap-0.5"
                  >
                    data.go.id <ExternalLink size={7} />
                  </a>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DataFreshnessBar;
