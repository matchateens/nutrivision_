import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, TrendingUp, ChevronUp, ChevronDown, Award, AlertTriangle } from 'lucide-react';
import nutritionData from '../data/nutritionData.json';

const SEVERITY = (v) => {
  if (v < 15) return { label: 'AMAN',    bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-500' };
  if (v < 25) return { label: 'WASPADA', bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20',   dot: 'bg-amber-500' };
  return        { label: 'DARURAT', bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20',     dot: 'bg-red-500' };
};

const ProvinceRanking = ({ onSelectProvince }) => {
  const [sortBy, setSortBy]   = useState('stunting'); // 'stunting' | 'mbg' | 'name'
  const [sortDir, setSortDir] = useState('desc');
  const [showAll, setShowAll] = useState(false);

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(field); setSortDir('desc'); }
  };

  const sorted = [...nutritionData].sort((a, b) => {
    let va, vb;
    if (sortBy === 'stunting') { va = a.stunting; vb = b.stunting; }
    else if (sortBy === 'mbg') { va = a.mbg_progress; vb = b.mbg_progress; }
    else { va = a.name; vb = b.name; return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va); }
    return sortDir === 'desc' ? vb - va : va - vb;
  });

  const displayed = showAll ? sorted : sorted.slice(0, 10);

  const SortBtn = ({ field, label }) => (
    <button
      onClick={() => toggleSort(field)}
      className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg transition-all ${
        sortBy === field ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'
      }`}
    >
      {label}
      {sortBy === field ? (sortDir === 'desc' ? <ChevronDown size={10} /> : <ChevronUp size={10} />) : <ChevronDown size={10} className="opacity-30" />}
    </button>
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Award size={16} className="text-emerald-400" />
          <h3 className="text-white font-black text-sm uppercase tracking-widest">Ranking Stunting Provinsi</h3>
          <span className="text-[8px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold border border-slate-700">38 Provinsi</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[8px] text-slate-600 uppercase font-bold mr-1">Urutkan:</span>
          <SortBtn field="stunting" label="Stunting" />
          <SortBtn field="mbg"      label="MBG" />
          <SortBtn field="name"     label="Nama" />
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[28px_1fr_80px_80px_70px] gap-2 px-3 py-2 mb-1">
        <span className="text-[8px] text-slate-600 font-black uppercase">#</span>
        <span className="text-[8px] text-slate-600 font-black uppercase">Provinsi</span>
        <span className="text-[8px] text-slate-600 font-black uppercase text-right">Stunting</span>
        <span className="text-[8px] text-slate-600 font-black uppercase text-right hidden sm:block">Kesiapan MBG</span>
        <span className="text-[8px] text-slate-600 font-black uppercase text-right">Status</span>
      </div>

      {/* Rows */}
      <div className="space-y-1">
        <AnimatePresence>
          {displayed.map((prov, idx) => {
            const rank   = sorted.findIndex(p => p.id === prov.id) + 1;
            const sev    = SEVERITY(prov.stunting);
            const trendVal = prov.trend ? (prov.trend[0] - prov.stunting).toFixed(1) : null;
            return (
              <motion.button
                key={prov.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => onSelectProvince(prov)}
                className="w-full grid grid-cols-[28px_1fr_80px_80px_70px] gap-2 px-3 py-2.5 rounded-xl bg-slate-900/30 border border-slate-800/40 hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all group text-left"
              >
                {/* Rank */}
                <span className={`text-[11px] font-black ${rank <= 3 ? 'text-amber-400' : 'text-slate-600'} self-center`}>
                  {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : rank}
                </span>

                {/* Name */}
                <div className="flex flex-col justify-center min-w-0">
                  <p className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors truncate">{prov.name}</p>
                  <p className="text-[8px] text-slate-600 font-bold">{prov.region}</p>
                </div>

                {/* Stunting */}
                <div className="flex flex-col items-end justify-center">
                  <span className={`text-sm font-black ${sev.text}`}>{prov.stunting}%</span>
                  {trendVal && (
                    <span className="flex items-center gap-0.5 text-[8px] text-emerald-500 font-bold">
                      <TrendingDown size={8} />-{trendVal}%
                    </span>
                  )}
                </div>

                {/* MBG Progress */}
                <div className="hidden sm:flex flex-col items-end justify-center gap-1">
                  <span className="text-[10px] font-black text-slate-300">{prov.mbg_progress}%</span>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${prov.mbg_progress}%` }}
                    />
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-end">
                  <span className={`text-[7px] font-black px-2 py-0.5 rounded-full border ${sev.bg} ${sev.text} ${sev.border} uppercase tracking-wider`}>
                    {sev.label}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Show More */}
      {!showAll && sorted.length > 10 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-400 border border-slate-800/50 hover:border-emerald-500/20 rounded-xl transition-all hover:bg-emerald-500/5"
        >
          Tampilkan {sorted.length - 10} Provinsi Lainnya ↓
        </button>
      )}
      {showAll && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full mt-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-400 border border-slate-800/50 rounded-xl transition-all"
        >
          Sembunyikan ↑
        </button>
      )}
    </div>
  );
};

export default ProvinceRanking;
