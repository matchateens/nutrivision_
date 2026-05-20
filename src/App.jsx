import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Map as MapIcon, Layers, Info, PieChart, Search, Award, GitCompare, X } from 'lucide-react';
import MapChart from './components/MapChart';
import ProvinceDetail from './components/ProvinceDetail';
import ProvinceRanking from './components/ProvinceRanking';
import ComparePanel from './components/ComparePanel';
import nutritionData from './data/nutritionData.json';
import districtData from './data/districtData.json';

const REGIONS = ['Semua', 'Jawa', 'Sumatera', 'Kalimantan', 'Sulawesi', 'Bali & NT', 'Maluku', 'Papua'];

const App = () => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [searchResults, setSearchResults]   = useState([]);
  const [activeTab, setActiveTab]           = useState('ranking');    // 'ranking' | 'compare'
  const [filterRegion, setFilterRegion]     = useState(null);         // null = semua
  const [mobileSearch, setMobileSearch]     = useState(false);
  const searchRef = useRef(null);

  const totalPopulation   = nutritionData.reduce((acc, d) => acc + d.population, 0);
  const avgStunting       = (nutritionData.reduce((acc, d) => acc + d.stunting, 0) / nutritionData.length).toFixed(1);
  const totalStuntingAnak = Math.round(nutritionData.reduce((acc, d) => acc + d.population * (d.stunting / 100) * 0.178, 0));
  const totalMbgPenerima  = nutritionData.reduce((acc, d) => acc + (d.mbg_penerima || 0), 0);
  const totalDapur        = nutritionData.reduce((acc, d) => acc + (d.mbg_dapur    || 0), 0);
  const gapToTarget       = (parseFloat(avgStunting) - 14).toFixed(1);
  // Progress toward 14% target (baseline 2019 national avg ~30%)
  const BASELINE_2019     = 30.0;
  const progressPct       = Math.min(100, ((BASELINE_2019 - parseFloat(avgStunting)) / (BASELINE_2019 - 14)) * 100).toFixed(1);

  const handleSelectProvince = (prov) => {
    setSelectedRegion(prov);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30 flex flex-col overflow-x-hidden">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-slate-800/50 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-6">
          <div 
            onClick={() => setSelectedRegion(null)}
            className="flex items-center gap-3 cursor-pointer group transition-transform active:scale-95"
          >
            <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:bg-emerald-500/30 group-hover:border-emerald-500/50 transition-all">
              <Activity className="text-emerald-400 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                NutriVision <span className="bg-emerald-500 text-[10px] px-1.5 py-0.5 rounded text-black font-bold">ID</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">National Nutrition Intelligence</p>
            </div>
          </div>
        </div>

        {/* --- MOBILE SEARCH TOGGLE (visible on mobile) --- */}
        <button
          onClick={() => setMobileSearch(o => !o)}
          className="lg:hidden p-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-400 hover:text-emerald-400 transition-colors"
        >
          {mobileSearch ? <X size={18} /> : <Search size={18} />}
        </button>

        {/* --- SEARCH BAR (desktop) --- */}
        <div ref={searchRef} className="relative flex-1 max-w-md group hidden lg:block">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            <input 
              type="text"
              placeholder="Cari Provinsi atau Kabupaten..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-2.5 pl-12 pr-4 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all"
              onChange={(e) => {
                const query = e.target.value.toLowerCase();
                if (query.length > 1) {
                  const provResults = nutritionData.filter(d => d.name.toLowerCase().includes(query));
                  const distResults = districtData.filter(d => d.name.toLowerCase().includes(query));
                  setSearchResults([...provResults, ...distResults].slice(0, 8)); // limit to 8 results to prevent huge dropdowns
                } else {
                  setSearchResults([]);
                }
              }}
              onBlur={() => setTimeout(() => setSearchResults([]), 150)}
            />
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[60] max-h-64 overflow-y-auto backdrop-blur-xl"
              >
                {searchResults.map((res) => (
                  <button
                    key={res.id}
                    onClick={() => {
                      setSelectedRegion(res);
                      setSearchResults([]);
                    }}
                    className="w-full px-5 py-3 text-left hover:bg-emerald-500/10 flex justify-between items-center group/item transition-colors border-b border-slate-800/50 last:border-0"
                  >
                    <div>
                      <p className="text-xs font-black text-white group-hover/item:text-emerald-400 transition-colors">{res.name}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                        {res.province ? `KAB/KOTA · ${res.province}` : 'PROVINSI'} • Stunting: {res.stunting}%
                      </p>
                    </div>
                    <div className="bg-slate-800 p-1.5 rounded-lg group-hover/item:bg-emerald-500/20 transition-colors">
                      <MapIcon className="w-3 h-3 text-slate-500 group-hover/item:text-emerald-400" />
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4 National KPI Stats - Responsive Grid/Flex */}
        <div className="grid grid-cols-2 md:flex items-stretch divide-slate-700/60 md:divide-x w-full md:w-auto border-t md:border-t-0 border-slate-800/50 md:border-none pt-4 md:pt-0">

          <div className="px-4 md:px-6 text-right py-2 md:py-0">
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Stunting Nasional</p>
            <p className="text-xl md:text-2xl font-black text-red-400 leading-none">{avgStunting}%</p>
            <p className="text-[7px] md:text-[9px] text-slate-500 mt-1">SKI 2023 · Target: 14%</p>
          </div>

          <div className="px-4 md:px-6 text-right py-2 md:py-0">
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Anak Terdampak</p>
            <p className="text-xl md:text-2xl font-black text-amber-300 leading-none">~{(totalStuntingAnak / 1_000_000).toFixed(1)} Juta</p>
            <p className="text-[7px] md:text-[9px] text-slate-500 mt-1">Estimasi usia sekolah</p>
          </div>

          <div className="px-4 md:px-6 text-right py-2 md:py-0 border-t border-slate-800/50 md:border-none">
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Target RPJMN 2029</p>
            <p className="text-xl md:text-2xl font-black text-cyan-300 leading-none">14.0%</p>
            <p className="text-[7px] md:text-[9px] text-slate-500 mt-1">Gap: -{gapToTarget}%</p>
          </div>

          <div className="px-4 md:px-6 text-right py-2 md:py-0 border-t border-slate-800/50 md:border-none">
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Penerima MBG</p>
            <p className="text-xl md:text-2xl font-black text-emerald-300 leading-none">{(totalMbgPenerima / 1_000_000).toFixed(1)} Juta</p>
            <p className="text-[7px] md:text-[9px] text-slate-500 mt-1">Dapur: {totalDapur.toLocaleString('id-ID')}</p>
          </div>

        </div>
      </header>

      {/* --- MOBILE SEARCH DROPDOWN --- */}
      <AnimatePresence>
        {mobileSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#020617] border-b border-slate-800/50 px-4 py-3 z-40"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                autoFocus
                type="text"
                placeholder="Cari Provinsi atau Kabupaten..."
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all"
                onChange={(e) => {
                  const q = e.target.value.toLowerCase();
                  if (q.length > 1) {
                    const pr = nutritionData.filter(d => d.name.toLowerCase().includes(q));
                    const dr = districtData.filter(d => d.name.toLowerCase().includes(q));
                    setSearchResults([...pr, ...dr].slice(0, 6));
                  } else setSearchResults([]);
                }}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {searchResults.map(res => (
                  <button key={res.id} onClick={() => { setSelectedRegion(res); setSearchResults([]); setMobileSearch(false); }}
                    className="w-full px-4 py-2.5 text-left hover:bg-emerald-500/10 border-b border-slate-800/40 last:border-0 transition-colors"
                  >
                    <p className="text-xs font-black text-white">{res.name}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">{res.province ? `KAB/KOTA · ${res.province}` : 'PROVINSI'} • {res.stunting}%</p>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PROGRESS BAR TOWARD 2029 TARGET --- */}
      <div className="w-full bg-[#010d1a] border-b border-slate-800/40 px-6 py-2.5 flex items-center gap-4">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest shrink-0">Progres Nasional → Target 14% (2029)</p>
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-500 rounded-full"
          />
        </div>
        <p className="text-[9px] font-black text-emerald-400 shrink-0">{progressPct}%</p>
        <p className="text-[8px] text-slate-600 shrink-0 hidden sm:block">{avgStunting}% → 14.0%</p>
      </div>

      {/* --- MAIN CONTENT (STACKED) --- */}
      <main className="flex-1 flex flex-col w-full bg-[#020617]">
        
        {/* TOP SECTION: MAP AREA */}
        <section className="relative w-full h-[75vh] min-h-[550px] bg-slate-950/40 border-b border-slate-800/30 overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_70%)]"></div>

          {/* REGION FILTER TABS */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-slate-900/80 backdrop-blur-xl border border-slate-700/40 p-1 rounded-2xl shadow-2xl flex-wrap justify-center">
            {REGIONS.map(r => (
              <button
                key={r}
                onClick={() => setFilterRegion(r === 'Semua' ? null : r)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  (r === 'Semua' && !filterRegion) || filterRegion === r
                    ? 'bg-emerald-500 text-black shadow-[0_4px_12px_rgba(16,185,129,0.4)]'
                    : 'text-slate-500 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          
          <MapChart
            onSelectRegion={setSelectedRegion}
            onHoverRegion={() => {}}
            selectedId={selectedRegion}
            filterRegion={filterRegion}
          />

          {/* Floating Legend - Bottom Left (Responsive) */}
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-10 bg-slate-900/60 backdrop-blur-md border border-slate-700/30 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-2xl">
            <h3 className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2">
              <MapIcon className="w-3 h-3 text-emerald-400" /> Legend
            </h3>
            <div className="flex flex-col gap-2 md:gap-2.5">
              {[
                { label: 'Aman (<15%)', color: 'bg-emerald-500' },
                { label: 'Waspada (15-25%)', color: 'bg-amber-500' },
                { label: 'Darurat (>25%)', color: 'bg-red-500' }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 md:gap-3">
                  <div className={`w-2 md:w-2.5 h-2 md:h-2.5 rounded-full ${item.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></div>
                  <span className="text-[8px] md:text-[10px] text-slate-300 font-bold uppercase tracking-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* BOTTOM SECTION: ANALYTICS AREA */}
        <section className="w-full bg-[#020617] relative">
          <AnimatePresence mode="wait">
            {!selectedRegion ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto w-full px-6 py-12 flex flex-col items-center justify-center text-center"
              >
              <div className="w-16 h-16 bg-slate-900/50 rounded-2xl flex items-center justify-center border border-slate-800 shadow-2xl mb-6 group hover:border-emerald-500/30 transition-colors">
                  <PieChart className="w-7 h-7 text-slate-700 group-hover:text-emerald-500/50 transition-colors" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Analisis Wilayah</h2>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed mb-8 text-sm">
                  Klik provinsi pada peta, atau gunakan panel di bawah untuk eksplorasi data.
                </p>

                {/* Quick stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-10">
                  {[
                    { label: 'Capaian Terendah',   name: 'Bali',         val: '8.0%',  color: 'text-emerald-400', sub: 'Stunting terendah nasional' },
                    { label: 'Prioritas Tertinggi', name: 'Papua Tengah', val: '39.4%', color: 'text-red-400',     sub: 'Butuh intervensi MBG segera' },
                    { label: 'Target Nasional 2029',name: 'RPJMN 2024–2029', val: '14.0%', color: 'text-amber-400', sub: `Rata-rata nasional SKI 2023: ${avgStunting}%` }
                  ].map((card, i) => (
                    <div key={i} className="bg-slate-900/30 border border-slate-800/50 p-5 rounded-2xl text-left hover:bg-slate-800/40 transition-all group">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{card.label}</p>
                      <h4 className="text-base font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{card.name}</h4>
                      <p className={`text-xl font-black ${card.color} mb-1`}>{card.val}</p>
                      <p className="text-[9px] text-slate-600 font-medium">{card.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Tab Navigation */}
                <div className="w-full max-w-5xl">
                  <div className="flex items-center gap-2 mb-5">
                    <button onClick={() => setActiveTab('ranking')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                        activeTab === 'ranking'
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : 'border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'
                      }`}>
                      <Award size={13} /> Ranking Provinsi
                    </button>
                    <button onClick={() => setActiveTab('compare')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                        activeTab === 'compare'
                          ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                          : 'border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'
                      }`}>
                      <GitCompare size={13} /> Bandingkan
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab === 'ranking' ? (
                      <motion.div key="ranking" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <ProvinceRanking onSelectProvince={handleSelectProvince} />
                      </motion.div>
                    ) : (
                      <motion.div key="compare" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <ComparePanel onSelectProvince={handleSelectProvince} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="details-active"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full"
              >
                <ProvinceDetail
                  region={selectedRegion}
                  onClose={() => setSelectedRegion(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* --- DATA SOURCES & DISCLAIMER SECTION --- */}
      <section className="w-full bg-[#010d1a] border-t border-slate-800/60 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="mb-8">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">Transparansi Data</p>
            <h2 className="text-lg font-black text-white">Sumber Data & Metodologi</h2>
            <p className="text-[11px] text-slate-500 mt-1 max-w-2xl leading-relaxed">
              NutriVision menggunakan data dari survei resmi pemerintah dan lembaga internasional. Berikut adalah rincian sumber, versi, dan tingkat kepercayaan setiap data yang digunakan.
            </p>
          </div>

          {/* Source Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">

            {/* SKI 2023 */}
            <div className="bg-slate-900/50 border border-blue-500/20 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Data Terverifikasi</p>
                </div>
                <span className="text-[8px] px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-bold">SKI 2023</span>
              </div>
              <h3 className="text-white font-black text-sm mb-1">Stunting & Gizi Balita</h3>
              <p className="text-[10px] text-slate-500 leading-relaxed mb-3">
                Prevalensi stunting, wasting, dan underweight per provinsi.
              </p>
              <div className="space-y-1.5 text-[9px] text-slate-500">
                <p>📋 <span className="text-slate-400 font-bold">Sumber:</span> Survei Kesehatan Indonesia (SKI) 2023</p>
                <p>🏛️ <span className="text-slate-400 font-bold">Penerbit:</span> Kementerian Kesehatan RI / BKPK</p>
                <p>📅 <span className="text-slate-400 font-bold">Dirilis:</span> 2024</p>
                <p>📍 <span className="text-slate-400 font-bold">Cakupan:</span> 38 Provinsi Indonesia</p>
                <p>🔗 <span className="text-slate-400 font-bold">Portal:</span> bkpk.kemkes.go.id</p>
              </div>
            </div>

            {/* MBG Badan Gizi Nasional */}
            <div className="bg-slate-900/50 border border-amber-500/20 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-amber-400">Estimasi Awal</p>
                </div>
                <span className="text-[8px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-bold">BGN 2025</span>
              </div>
              <h3 className="text-white font-black text-sm mb-1">Program Makan Bergizi Gratis</h3>
              <p className="text-[10px] text-slate-500 leading-relaxed mb-3">
                Data kesiapan dapur SPPG, penerima, dan biaya per porsi.
              </p>
              <div className="space-y-1.5 text-[9px] text-slate-500">
                <p>📋 <span className="text-slate-400 font-bold">Sumber:</span> Badan Gizi Nasional (BGN)</p>
                <p>🏛️ <span className="text-slate-400 font-bold">Dasar hukum:</span> Perpres 83/2024</p>
                <p>📅 <span className="text-slate-400 font-bold">Data per:</span> April 2025 (nasional)</p>
                <p>⚠️ <span className="text-amber-400 font-bold">Catatan:</span> Data per provinsi merupakan estimasi proporsi — BGN belum merilis breakdown resmi per provinsi</p>
                <p>🔗 <span className="text-slate-400 font-bold">Portal:</span> mitra.bgn.go.id</p>
              </div>
            </div>

            {/* Target & Demografi */}
            <div className="bg-slate-900/50 border border-emerald-500/20 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Data Resmi</p>
                </div>
                <span className="text-[8px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold">BPS / RPJMN</span>
              </div>
              <h3 className="text-white font-black text-sm mb-1">Populasi & Target Kebijakan</h3>
              <p className="text-[10px] text-slate-500 leading-relaxed mb-3">
                Data kependudukan per provinsi dan target penurunan stunting.
              </p>
              <div className="space-y-1.5 text-[9px] text-slate-500">
                <p>📋 <span className="text-slate-400 font-bold">Populasi:</span> BPS Sensus 2020 + Proyeksi 2023</p>
                <p>📋 <span className="text-slate-400 font-bold">Target:</span> RPJMN 2024–2029, target 14% nasional</p>
                <p>📋 <span className="text-slate-400 font-bold">Rasio anak sekolah:</span> BPS 2023 (17.8% populasi)</p>
                <p>🏛️ <span className="text-slate-400 font-bold">Penerbit:</span> Bappenas & BPS RI</p>
                <p>🔗 <span className="text-slate-400 font-bold">Portal:</span> bappenas.go.id / bps.go.id</p>
              </div>
            </div>

          </div>

          {/* Disclaimer box */}
          <div className="bg-slate-900/30 border border-slate-700/40 rounded-2xl p-5 flex gap-4 items-start">
            <span className="text-2xl shrink-0">⚠️</span>
            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Disclaimer & Keterbatasan Data</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Dashboard ini dibuat untuk tujuan <span className="text-white font-bold">visualisasi dan edukasi kebijakan publik</span>, bukan untuk pengambilan keputusan medis atau kebijakan formal. 
                Data stunting bersumber dari SKI 2023 (Kemenkes) dan sebagian dari SSGI 2021–2022 untuk provinsi yang belum memiliki data SKI 2023 terpisah. 
                Data operasional MBG (jumlah dapur, penerima per provinsi) merupakan <span className="text-amber-400 font-bold">estimasi berdasarkan proporsi nasional</span> karena Badan Gizi Nasional belum mempublikasikan rincian per provinsi secara resmi. 
                Simulasi anggaran menggunakan model proyeksi sederhana berbasis studi WFP/Kemenkes dan bukan merupakan prediksi kebijakan resmi.
              </p>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default App;
