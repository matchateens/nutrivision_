import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, X, ChevronDown, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import nutritionData from '../data/nutritionData.json';

const MetricRow = ({ label, val1, val2, unit = '%', higherIsBetter = false }) => {
  const diff = (val1 - val2).toFixed(1);
  const better = higherIsBetter ? val1 > val2 : val1 < val2;
  const worse  = higherIsBetter ? val1 < val2 : val1 > val2;
  return (
    <div className="grid grid-cols-[1fr_80px_1fr] gap-3 items-center py-2 border-b border-slate-800/40 last:border-0">
      <p className={`text-sm font-black text-right ${better ? 'text-emerald-400' : worse ? 'text-red-400' : 'text-white'}`}>
        {val1}{unit}
      </p>
      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest text-center">{label}</p>
      <p className={`text-sm font-black text-left ${worse ? 'text-emerald-400' : better ? 'text-red-400' : 'text-white'}`}>
        {val2}{unit}
      </p>
    </div>
  );
};

const ProvinceSelect = ({ value, onChange, exclude }) => {
  const [open, setOpen] = useState(false);
  const options = nutritionData.filter(d => d.id !== exclude?.id);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30 rounded-xl px-3 py-2.5 text-left transition-all"
      >
        <span className={`text-xs font-black ${value ? 'text-white' : 'text-slate-500'}`}>
          {value ? value.name : 'Pilih Provinsi...'}
        </span>
        <ChevronDown size={14} className="text-slate-500 shrink-0" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-52 overflow-y-auto"
          >
            {options.map(p => (
              <button
                key={p.id}
                onClick={() => { onChange(p); setOpen(false); }}
                className="w-full px-3 py-2 text-left text-xs font-bold text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors border-b border-slate-800/40 last:border-0"
              >
                {p.name}
                <span className="ml-2 text-[9px] text-slate-600">{p.stunting}% stunting</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ComparePanel = ({ onSelectProvince }) => {
  const [provA, setProvA] = useState(null);
  const [provB, setProvB] = useState(null);

  const canCompare = provA && provB;

  const trendChartData = canCompare
    ? [2019, 2021, 2022, 2023, 2024].map((yr, i) => ({
        year: yr,
        [provA.name]: provA.trend?.[i],
        [provB.name]: provB.trend?.[i],
      }))
    : [];

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <GitCompare size={16} className="text-indigo-400" />
        <h3 className="text-white font-black text-sm uppercase tracking-widest">Komparasi Provinsi</h3>
      </div>

      {/* Province Selectors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[8px] text-indigo-400 font-black uppercase tracking-widest mb-1.5">Provinsi A</p>
          <ProvinceSelect value={provA} onChange={setProvA} exclude={provB} />
        </div>
        <div>
          <p className="text-[8px] text-emerald-400 font-black uppercase tracking-widest mb-1.5">Provinsi B</p>
          <ProvinceSelect value={provB} onChange={setProvB} exclude={provA} />
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-2">Preset Populer</p>
        <div className="flex flex-wrap gap-1.5">
          {[
            ['Bali', 'Papua Tengah'],
            ['DKI Jakarta', 'Nusa Tenggara Timur'],
            ['Jawa Barat', 'Jawa Timur'],
          ].map(([a, b]) => (
            <button
              key={a + b}
              onClick={() => {
                setProvA(nutritionData.find(d => d.name === a));
                setProvB(nutritionData.find(d => d.name === b));
              }}
              className="text-[8px] font-black px-2.5 py-1 rounded-lg bg-slate-800/60 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-slate-700/40 hover:border-emerald-500/20 transition-all uppercase tracking-wider"
            >
              {a} vs {b}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Result */}
      <AnimatePresence>
        {canCompare && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Province Name Row */}
            <div className="grid grid-cols-[1fr_80px_1fr] gap-3 items-center pb-3 border-b border-slate-700/40">
              <button onClick={() => onSelectProvince(provA)} className="text-right">
                <p className="text-sm font-black text-indigo-400 hover:text-indigo-300 transition-colors">{provA.name}</p>
                <p className="text-[8px] text-slate-500">{provA.region}</p>
              </button>
              <p className="text-[9px] text-slate-600 font-black uppercase text-center tracking-wider">VS</p>
              <button onClick={() => onSelectProvince(provB)} className="text-left">
                <p className="text-sm font-black text-emerald-400 hover:text-emerald-300 transition-colors">{provB.name}</p>
                <p className="text-[8px] text-slate-500">{provB.region}</p>
              </button>
            </div>

            {/* Metric Rows */}
            <div className="bg-slate-900/30 border border-slate-800/40 rounded-xl px-3 py-1">
              <MetricRow label="Stunting"     val1={provA.stunting}     val2={provB.stunting} />
              <MetricRow label="Wasting"      val1={provA.wasting}      val2={provB.wasting} />
              <MetricRow label="Underweight"  val1={provA.underweight}  val2={provB.underweight} />
              <MetricRow label="MBG Progress" val1={provA.mbg_progress} val2={provB.mbg_progress} higherIsBetter />
              <MetricRow label="Dapur SPPG"   val1={provA.mbg_dapur}    val2={provB.mbg_dapur} unit="" higherIsBetter />
            </div>

            {/* Trend Chart */}
            <div>
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-2">Tren Stunting 2019–2024</p>
              <div className="h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendChartData}>
                    <defs>
                      <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 8, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '10px' }}
                      formatter={(v, name) => [`${v}%`, name]}
                    />
                    <Area type="monotone" dataKey={provA.name} stroke="#818cf8" strokeWidth={2} fill="url(#gradA)" dot={{ fill: '#818cf8', r: 2 }} />
                    <Area type="monotone" dataKey={provB.name} stroke="#10b981" strokeWidth={2} fill="url(#gradB)" dot={{ fill: '#10b981', r: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-indigo-400 rounded" />
                  <span className="text-[8px] text-slate-500 font-bold">{provA.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-emerald-400 rounded" />
                  <span className="text-[8px] text-slate-500 font-bold">{provB.name}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!canCompare && (
        <div className="text-center py-8 text-slate-600">
          <GitCompare size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-[10px] font-bold">Pilih 2 provinsi untuk membandingkan data gizi</p>
        </div>
      )}
    </div>
  );
};

export default ComparePanel;
