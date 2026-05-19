import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, Target, Zap } from 'lucide-react';

const SimulationPanel = ({ region, budget, onBudgetChange }) => {
  // Simple simulation logic
  // Estimated cost to feed 1 child per year: ~5,400,000 IDR (15k per meal)
  const populationInNeed = Math.round(region.population * (region.stunting / 100));
  const fullCoverageCost = populationInNeed * 5400000;
  
  // Projected impact: percentage of children covered by the current budget
  const coveragePercent = Math.min(100, (budget / fullCoverageCost) * 100).toFixed(1);
  const potentialStuntingReduction = ((region.stunting * (coveragePercent / 100)) * 0.1).toFixed(2);
  
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
        <Zap className="w-3 h-3 text-amber-400" />
        Simulasi Alokasi Anggaran
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col gap-6">
        {/* Slider Input */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-500 font-medium uppercase">Alokasi Dana (Tahunan)</span>
            <span className="text-emerald-400 font-bold text-lg font-mono">
              {formatCurrency(budget)}
            </span>
          </div>
          <input 
            type="range" 
            min="100000000" 
            max="20000000000" 
            step="100000000"
            value={budget}
            onChange={(e) => onBudgetChange(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between mt-2 text-[10px] text-slate-600 font-bold">
            <span>100 JUTA</span>
            <span>20 MILIAR</span>
          </div>
        </div>

        {/* Projection Results */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
              <Target className="w-2 h-2" /> Coverage
            </span>
            <span className="text-xl font-bold text-white">{coveragePercent}%</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1 justify-end">
              <TrendingDown className="w-2 h-2" /> Impact
            </span>
            <span className="text-xl font-bold text-emerald-400">-{potentialStuntingReduction}%</span>
          </div>
        </div>

        <div className="bg-slate-950/50 p-3 rounded-xl">
            <p className="text-[10px] text-slate-500 text-center">
              Dengan alokasi ini, diperkirakan tingkat stunting di <span className="text-slate-300">{region.name}</span> akan turun menjadi <span className="text-emerald-400 font-bold">{(region.stunting - potentialStuntingReduction).toFixed(1)}%</span> dalam 12 bulan.
            </p>
        </div>
      </div>
    </div>
  );
};

export default SimulationPanel;
