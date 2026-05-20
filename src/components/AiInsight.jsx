import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Activity, AlertCircle, Loader2 } from 'lucide-react';
import { getAiSummary } from '../services/geminiService';

const parseMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // 1. Check for headings: ### Header
    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} className="text-[10px] font-black text-emerald-400 mt-4 mb-2 first:mt-0 uppercase tracking-widest">
          {line.replace('### ', '')}
        </h4>
      );
    }
    
    // 2. Check for bullet points: * Item or - Item
    const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
    let cleanLine = isBullet ? line.trim().substring(2) : line;
    
    // 3. Check for numbered list: 1. Item
    const isNumbered = /^\d+\.\s/.test(cleanLine.trim());
    let numPrefix = "";
    if (isNumbered) {
      const match = cleanLine.trim().match(/^(\d+\.\s)/);
      numPrefix = match[1];
      cleanLine = cleanLine.trim().replace(/^\d+\.\s/, '');
    }

    // 4. Parse bold text **something**
    const parts = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(cleanLine)) !== null) {
      if (match.index > lastIndex) {
        parts.push(cleanLine.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-black text-white">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }
    
    if (lastIndex < cleanLine.length) {
      parts.push(cleanLine.substring(lastIndex));
    }

    // Return element
    if (isBullet) {
      return (
        <div key={idx} className="flex items-start gap-2 pl-2 py-0.5 text-slate-300">
          <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
          <p className="flex-1 text-[11px] leading-relaxed">{parts.length > 0 ? parts : cleanLine}</p>
        </div>
      );
    }

    if (isNumbered) {
      return (
        <div key={idx} className="flex items-start gap-2 pl-2 py-0.5 text-slate-300">
          <span className="text-emerald-400 font-bold shrink-0 mt-0.5">{numPrefix}</span>
          <p className="flex-1 text-[11px] leading-relaxed">{parts.length > 0 ? parts : cleanLine}</p>
        </div>
      );
    }

    // Regular paragraph (could be empty line)
    if (line.trim() === '') {
      return <div key={idx} className="h-1.5" />;
    }

    return (
      <p key={idx} className="text-[11px] text-slate-300 leading-relaxed py-0.5">
        {parts.length > 0 ? parts : cleanLine}
      </p>
    );
  });
};

const AiInsight = ({ region }) => {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (region) {
      generateInsight();
    }
  }, [region]);

  const generateInsight = async () => {
    setLoading(true);
    setError(false);
    setInsight('');
    
    try {
      const result = await getAiSummary(region);
      setInsight(result);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-5 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-3xl relative overflow-hidden group">
      {/* Background Decorative Sparkles */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles className="w-20 h-20 text-indigo-400" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-500/20 p-1.5 rounded-lg border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">AI Strategic Insight</h3>
          </div>
          
          {loading ? (
            <div className="flex items-center gap-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
              Analyzing Data...
            </div>
          ) : (
            <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-bold text-emerald-400 uppercase tracking-widest">
              Gemini AI Active
            </div>
          )}
        </div>

        <div className="min-h-[80px]">
          {loading ? (
            <div className="space-y-2 pt-2">
              <div className="h-2 w-3/4 bg-slate-800/50 rounded-full animate-pulse"></div>
              <div className="h-2 w-full bg-slate-800/50 rounded-full animate-pulse delay-75"></div>
              <div className="h-2 w-5/6 bg-slate-800/50 rounded-full animate-pulse delay-150"></div>
            </div>
          ) : insight ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-slate-300 leading-relaxed font-medium"
            >
              {parseMarkdown(insight)}
            </motion.div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold py-4">
              <AlertCircle className="w-4 h-4" />
              Gagal memuat analisis AI. Coba lagi nanti.
            </div>
          ) : null}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center">
          <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Powered by Google Gemini 1.5 Flash</p>
          {!loading && (
            <button 
              onClick={generateInsight}
              className="text-[8px] text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-widest transition-colors flex items-center gap-1.5"
            >
              <Activity className="w-2.5 h-2.5" /> Regenerate Insight
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiInsight;
