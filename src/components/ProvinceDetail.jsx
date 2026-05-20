import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingDown, Activity, Utensils, X, Target,
  TrendingUp, Info, ChefHat, Users, Banknote
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import AiInsight from './AiInsight';


// ─── Konstanta MBG ─────────────────────────────────────────────────────────
const BIAYA_PORSI_DEFAULT  = 10000;   // Rp 10.000 per porsi (standar BGN 2025)
const HARI_MAKAN_PER_TAHUN = 250;     // Hari efektif sekolah/tahun
const KAPASITAS_DAPUR      = 3000;    // Kapasitas rata-rata 1 Dapur SPPG
const RATIO_ANAK_SEKOLAH   = 0.178;   // Anak sekolah SD-SMP-SMA ≈ 17.8% populasi (BPS 2023)
const MBG_STUNTING_EFFECT  = 0.15;    // Kontribusi MBG terhadap penurunan stunting

const QUICK_AMOUNTS = [
  { label: 'Rp 10 M',  value: 10_000_000_000  },
  { label: 'Rp 100 M', value: 100_000_000_000 },
  { label: 'Rp 500 M', value: 500_000_000_000 },
  { label: 'Rp 1 T',   value: 1_000_000_000_000 },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

const MiniCard = ({ label, value, sub, icon: Icon, color, tooltip }) => (
  <div className="bg-slate-800/50 border border-slate-700/30 p-3 rounded-xl group relative hover:border-slate-600/50 transition-all">
    <div className="flex justify-between items-start mb-1.5">
      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}15` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <span className="text-white font-black text-base tracking-tight">{value}</span>
    </div>
    <div className="flex items-center gap-1">
      <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest">{label}</p>
      {tooltip && (
        <div className="group/tip relative">
          <Info size={8} className="text-slate-700 cursor-help" />
          <div className="absolute bottom-full left-0 mb-2 w-44 p-2 bg-slate-900 border border-slate-700/80 rounded-lg text-[9px] text-slate-400 opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl leading-relaxed">
            {tooltip}
          </div>
        </div>
      )}
    </div>
    {sub && <p className="text-slate-700 text-[8px] font-medium mt-0.5">{sub}</p>}
  </div>
);

const TrendChart = ({ data }) => {
  if (!data) return null;
  const chartData = data.map((val, i) => ({ year: [2019, 2021, 2022, 2023, 2024][i], value: val }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="year" axisLine={false} tickLine={false}
          tick={{ fill: '#475569', fontSize: 8, fontWeight: '700' }} />
        <YAxis hide domain={['dataMin - 3', 'dataMax + 3']} />
        <Tooltip
          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '10px' }}
          itemStyle={{ color: '#10b981', fontWeight: '700' }}
          formatter={(v) => [`${v}%`, 'Stunting']}
        />
        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2}
          fillOpacity={1} fill="url(#tGrad)" dot={{ fill: '#10b981', r: 2.5 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// ─── Simulator MBG ──────────────────────────────────────────────────────────
const MBGSimulator = ({ region }) => {
  const [inputStr, setInputStr] = useState('100000000000');
  const [budget, setBudget]     = useState(100_000_000_000);
  const [results, setResults]   = useState(null);

  useEffect(() => { runSim(budget); }, [budget, region]);

  const runSim = (val) => {
    const totalPop      = region.population || 1_000_000;
    const biayaPerPorsi = region.mbg_biaya  || BIAYA_PORSI_DEFAULT;
    const biayaPerTahun = biayaPerPorsi * HARI_MAKAN_PER_TAHUN;
    const popAnakSekolah = Math.round(totalPop * RATIO_ANAK_SEKOLAH);

    const anakTerjangkau = Math.min(popAnakSekolah, Math.floor(val / biayaPerTahun));
    const pctCakupan     = popAnakSekolah > 0 ? Math.min(100, (anakTerjangkau / popAnakSekolah) * 100) : 0;
    const dapurDibutuhkan = Math.ceil(anakTerjangkau / KAPASITAS_DAPUR);

    const stuntingDrop     = region.stunting * (pctCakupan / 100) * MBG_STUNTING_EFFECT;
    const proyeksiStunting = Math.max(2, region.stunting - stuntingDrop);
    const annualDrop       = 0.7 + (stuntingDrop / 5);
    const gap              = Math.max(0, proyeksiStunting - 14);
    const years            = annualDrop > 0 ? Math.ceil(gap / annualDrop) : null;

    setResults({ popAnakSekolah, anakTerjangkau, pctCakupan: pctCakupan.toFixed(1),
      dapurDibutuhkan, stuntingDrop: stuntingDrop.toFixed(2),
      proyeksiStunting: proyeksiStunting.toFixed(1), years, biayaPerTahun });
  };

  const handleChange = (e) => setInputStr(e.target.value.replace(/\D/g, ''));
  const handleApply  = () => { const n = parseInt(inputStr); if (!isNaN(n) && n > 0) setBudget(n); };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Quick presets */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_AMOUNTS.map(q => (
          <button key={q.value}
            onClick={() => { setInputStr(q.value.toString()); setBudget(q.value); }}
            className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${
              budget === q.value
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'bg-slate-800/60 border-slate-700/50 text-slate-500 hover:border-slate-600 hover:text-slate-400'
            }`}>
            {q.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <div className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2 flex items-center focus-within:border-emerald-500/40 transition-colors">
          <span className="text-slate-500 font-bold mr-1 text-xs">Rp</span>
          <input type="text"
            className="bg-transparent border-none outline-none text-white font-black text-sm w-full"
            value={Number(inputStr || 0).toLocaleString('id-ID')}
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()} />
        </div>
        <button onClick={handleApply}
          className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black px-4 rounded-xl text-[9px] uppercase tracking-widest transition-all">
          Hitung
        </button>
      </div>

      {/* Results */}
      {results && (
        <motion.div key={budget} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/70 border border-emerald-500/15 rounded-2xl p-3 flex-1">
          {/* Headline */}
          <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-white/5">
            <div className="p-1.5 bg-emerald-500/15 rounded-lg shrink-0">
              <Utensils size={13} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-400 font-black text-sm leading-none">
                {results.anakTerjangkau.toLocaleString('id-ID')} Anak Sekolah
              </p>
              <p className="text-[8px] text-slate-500 mt-0.5">
                dari {results.popAnakSekolah.toLocaleString('id-ID')} total · cakupan {results.pctCakupan}%
              </p>
            </div>
          </div>
          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-2 mb-2.5">
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <p className="text-white font-black text-sm">{results.pctCakupan}%</p>
              <p className="text-[7px] text-slate-500 uppercase tracking-widest mt-0.5">Cakupan</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <p className="text-white font-black text-sm">{results.dapurDibutuhkan}</p>
              <p className="text-[7px] text-slate-500 uppercase tracking-widest mt-0.5">Dapur</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <p className="text-emerald-400 font-black text-sm">-{results.stuntingDrop}%</p>
              <p className="text-[7px] text-slate-500 uppercase tracking-widest mt-0.5">Stunting↓</p>
            </div>
          </div>
          {/* Projection */}
          <div className="flex items-start gap-2 pt-2 border-t border-white/5">
            <TrendingDown size={12} className="text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-[9px] text-slate-400 leading-relaxed">
              Stunting diproyeksi turun ke <span className="text-emerald-400 font-black">{results.proyeksiStunting}%</span>.
              Target 14% tercapai dalam{' '}
              <span className={`font-black ${results.years && results.years <= 5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {results.years ? `±${results.years} tahun` : 'waktu sangat lama'}
              </span>.
            </p>
          </div>
        </motion.div>
      )}
      <p className="text-[8px] text-slate-700 italic">
        Basis: Rp {(region.mbg_biaya || BIAYA_PORSI_DEFAULT).toLocaleString('id-ID')}/porsi × 250 hari · Efek MBG 15% · Dapur kapasitas 3.000 anak
      </p>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const ProvinceDetail = ({ region, onClose }) => {
  if (!region) return null;

  const popAnakSekolah = Math.round(region.population * RATIO_ANAK_SEKOLAH);
  const pctCakupanAktual = popAnakSekolah > 0
    ? Math.min(100, (region.mbg_penerima / popAnakSekolah) * 100).toFixed(1)
    : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full bg-[#0a1122] border-t border-slate-800/50"
    >
      {/* ── Topbar ── */}
      <div className="w-full px-6 md:px-10 py-4 border-b border-slate-800/50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-[0.15em] rounded-full border border-emerald-500/20">
            Program MBG
          </span>
          <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">
            Stunting: SKI 2023 ✓
          </span>
          <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">
            MBG: Estimasi BGN
          </span>
          <span className="text-slate-400 font-black text-lg">·</span>
          <h2 className="text-white font-black text-xl tracking-tight">{region.name}</h2>
          <span className="text-slate-500 text-sm">— Analisis kesiapan & dampak Program MBG</span>
        </div>
        <button onClick={onClose}
          className="p-2.5 bg-slate-800/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all border border-slate-700/50 active:scale-90 shrink-0">
          <X size={18} />
        </button>
      </div>

      {/* ── 3-Column Grid ── */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/50">

        {/* ── Col 1: Status MBG ── */}
        <div className="p-6 space-y-4">
          {/* Section title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat size={14} className="text-emerald-500" />
              <h3 className="text-white font-black text-[10px] uppercase tracking-widest">Status Program MBG</h3>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-black text-xl">{region.mbg_progress}%</span>
              <p className="text-[7px] text-slate-500 font-bold uppercase">Kesiapan</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-900/60 h-1.5 rounded-full overflow-hidden border border-slate-700/20">
            <motion.div initial={{ width: 0 }} animate={{ width: `${region.mbg_progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-emerald-700 to-emerald-300 rounded-full" />
          </div>

          {/* MBG stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <MiniCard label="Dapur SPPG" value={region.mbg_dapur} icon={ChefHat} color="#10b981" sub="Unit aktif"
              tooltip="Satuan Pelayanan Program Gizi (SPPG) — dapur produksi yang mendistribusikan makanan bergizi ke sekolah." />
            <MiniCard label="Penerima" value={`${(region.mbg_penerima/1000).toFixed(0)}K`} icon={Users} color="#6366f1" sub="Anak sekolah"
              tooltip={`Estimasi anak sekolah yang dijadwalkan menerima program. Cakupan: ~${pctCakupanAktual}% dari total.`} />
            <div className="hidden sm:block">
              <MiniCard label="Biaya/Porsi" value={`Rp${(region.mbg_biaya/1000).toFixed(0)}rb`} icon={Banknote} color="#f59e0b" sub="Per hari"
                tooltip="Standar biaya satu porsi makan bergizi lengkap per hari (BGN 2025)." />
            </div>
            <div className="sm:hidden">
              <MiniCard label="Biaya" value={`Rp${(region.mbg_biaya/1000).toFixed(0)}rb`} icon={Banknote} color="#f59e0b" sub="Per porsi"
                tooltip="Standar biaya satu porsi makan bergizi lengkap per hari (BGN 2025)." />
            </div>
          </div>

          {/* Cakupan aktual */}
          <div className="bg-slate-800/30 rounded-xl p-3 flex justify-between items-center">
            <div>
              <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Cakupan Aktual</p>
              <p className="text-[9px] text-slate-400 mt-0.5">dari {(popAnakSekolah/1000).toFixed(0)}K anak sekolah</p>
            </div>
            <p className="text-white font-black text-2xl">{pctCakupanAktual}%</p>
          </div>

          {/* Konteks Gizi */}
          <div>
            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black mb-2">Konteks Gizi Wilayah</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
              <MiniCard label="Stunting" value={`${region.stunting}%`} icon={Activity} color="#10b981" sub="Prevalensi"
                tooltip="Persen anak dengan tinggi badan tidak sesuai usia. MBG membantu memperbaiki asupan gizi harian." />
              <MiniCard label="Wasting" value={`${region.wasting}%`} icon={TrendingDown} color="#f59e0b" sub="Berat badan"
                tooltip="Berat badan rendah untuk tinggi badan. Konsumsi bergizi rutin membantu pemulihan." />
              <MiniCard label="Target 2029" value="14.0%" icon={Target} color="#a78bfa" sub={`Gap: ${(region.stunting - 14).toFixed(1)}%`}
                tooltip="Target prevalensi stunting nasional sesuai RPJMN 2024-2029." />
              <MiniCard label="Selisih" value={`${(region.stunting - 14).toFixed(1)}%`} icon={TrendingUp} color="#ef4444" sub="Harus turun"
                tooltip="Gap antara kondisi stunting saat ini dan target nasional yang harus dijembatani." />
            </div>
          </div>
        </div>

        {/* ── Col 2: Tren & Ringkasan ── */}
        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} className="text-emerald-500" />
              <h3 className="text-white font-black text-[10px] uppercase tracking-widest">Tren Stunting 2019–2024</h3>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed">Progres penurunan prevalensi stunting (sumber: SSGI / SKI Kemenkes).</p>
          </div>

          <div className="h-[170px] w-full">
            <TrendChart data={region.trend} />
          </div>

          <div className="flex justify-between items-center py-2.5 px-3 bg-slate-800/30 rounded-xl">
            <div>
              <p className="text-[8px] text-slate-500 uppercase tracking-widest">Penurunan 2019→2024</p>
              <p className="text-emerald-400 font-black text-sm">
                -{(region.trend?.[0] - region.stunting).toFixed(1)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-slate-500 uppercase tracking-widest">Rata-rata/tahun</p>
              <p className="text-amber-400 font-black text-sm">
                ~{((region.trend?.[0] - region.stunting) / 5).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Target cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/30 rounded-xl p-3 text-center group relative overflow-hidden cursor-help">
              <div className="absolute inset-0 bg-slate-900/95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl">
                <p className="text-[8px] text-slate-400 leading-relaxed">Target prevalensi stunting nasional 14% sesuai RPJMN 2024–2029 untuk Indonesia Emas 2045.</p>
              </div>
              <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-1">Target 2029</p>
              <p className="text-white font-black text-xl">14.0%</p>
              <p className="text-[8px] text-red-400 font-bold mt-0.5">+{(region.stunting - 14).toFixed(1)}% selisih</p>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-3 text-center group relative overflow-hidden cursor-help">
              <div className="absolute inset-0 bg-slate-900/95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl">
                <p className="text-[8px] text-slate-400 leading-relaxed">Total anak sekolah SD-SMP-SMA di wilayah ini (BPS 17.8% populasi).</p>
              </div>
              <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-1">Anak Sekolah</p>
              <p className="text-white font-black text-xl">{(popAnakSekolah/1000).toFixed(0)}K</p>
              <p className="text-[8px] text-slate-500 font-bold mt-0.5">SD · SMP · SMA</p>
            </div>
          </div>

          {/* Province data note */}
          <div className="flex gap-2 items-start p-3 bg-slate-800/20 border border-slate-700/20 rounded-xl">
            <Info size={11} className="text-slate-600 shrink-0 mt-0.5" />
            <p className="text-[8px] text-slate-600 leading-relaxed">
              Data stunting: <span className="text-blue-400 font-bold">{region?.data_source?.stunting || 'SKI 2023'}</span> ·
              Data MBG: <span className="text-amber-400 font-bold">{region?.data_source?.mbg || 'Estimasi BGN'}</span>
            </p>
          </div>
        </div>

        {/* ── Col 3: Simulator ── */}
        <div className="p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🍱</span>
            <div>
              <h3 className="text-white font-black text-[10px] uppercase tracking-widest">Simulator Anggaran MBG</h3>
              <p className="text-[9px] text-slate-500 mt-0.5">
                Proyeksi jangkauan MBG per anggaran (Rp {(region.mbg_biaya || BIAYA_PORSI_DEFAULT).toLocaleString('id-ID')}/porsi × 250 hari).
              </p>
            </div>
          </div>
          <MBGSimulator region={region} />
        </div>

      </div>
      
      {/* ── Section: AI Strategic Insight ── */}
      <div className="px-6 pb-6 pt-0 border-t border-slate-800/30 bg-slate-950/10">
        <AiInsight region={region} />
      </div>
    </motion.div>
  );
};

export default ProvinceDetail;
