import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { X, PlayCircle, ShieldCheck, BookmarkSimple } from '@phosphor-icons/react';

const SeasonTimeline = ({ seasons = [] }) => {
  const [selectedSeason, setSelectedSeason] = useState(null);

  if (!seasons || seasons.length === 0) return null;

  const sortedSeasons = [...seasons].sort((a, b) => a.seasonNumber - b.seasonNumber);

  // Group into rows of 3
  const rows = [];
  for (let i = 0; i < sortedSeasons.length; i += 3) {
    rows.push(sortedSeasons.slice(i, i + 3));
  }

  return (
    <section className="py-48 relative bg-[#0D0D0D] overflow-hidden">
      
      {/* 📜 BACKGROUND TEXTURES */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-0" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/parchment.png")' }} />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Timeline Header */}
        <div className="mb-60 flex flex-col items-center text-center">
          <div className="w-20 h-1.5 bg-[#DD0426] mb-8 shadow-[0_0_20px_rgba(221,4,38,0.8)]" />
          <h2 className="text-5xl md:text-7xl font-display font-black text-[#F5EBE0] uppercase tracking-tighter leading-none mb-2">
            Series Timeline
          </h2>
          <p className="font-sans text-xl text-[#AAAAAA] uppercase tracking-widest opacity-60">
            Chronological Progression
          </p>
        </div>

        {/* The Square Snake Container */}
        <div className="relative flex flex-col items-center">
          
          {/* TIMELINE CONNECTOR PATH */}
          <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true" style={{ height: `${rows.length * 400}px` }}>
            <svg 
              width="100%" 
              height="100%" 
              viewBox={`0 0 1200 ${rows.length * 400}`} 
              preserveAspectRatio="none"
            >
              <defs>
                <pattern id="timeline-pattern" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
                   <path d="M 0 10 Q 10 0, 20 10 Q 30 20, 40 10" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                </pattern>
                <filter id="timeline-filter">
                  <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
                </filter>
              </defs>
              
              <path d={generateSquareSnakePath(rows)} fill="none" stroke="#DD0426" strokeWidth="22" className="opacity-20 blur-md" />
              <path d={generateSquareSnakePath(rows)} fill="none" stroke="#DD0426" strokeWidth="18" filter="url(#timeline-filter)" className="opacity-100" />
              <path d={generateSquareSnakePath(rows)} fill="none" stroke="url(#timeline-pattern)" strokeWidth="18" className="opacity-40" />
            </svg>
          </div>

          <div className="space-y-48 relative z-10 w-full max-w-5xl mx-auto">
            {rows.map((row, rowIdx) => {
              const isReverse = rowIdx % 2 !== 0;
              const seasonsToRender = isReverse ? [...row].reverse() : row;
              
              return (
                <div key={rowIdx} className={`flex flex-wrap justify-between gap-16 px-12 ${isReverse ? 'flex-row-reverse' : 'flex-row'}`}>
                  {seasonsToRender.map((season) => (
                    <Motion.div 
                      key={season.seasonNumber}
                      whileHover={{ scale: 1.05 }}
                      className="relative group cursor-pointer flex flex-col items-center"
                      onClick={() => setSelectedSeason(season)}
                    >
                      <div className="w-40 h-40 md:w-56 md:h-56 border-[8px] border-[#DD0426] p-2 bg-[#0D0D0D] shadow-2xl relative z-10 overflow-hidden group-hover:border-white transition-all duration-500">
                        <div className="w-full h-full overflow-hidden relative grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-110 transition-all duration-700">
                          <img src={season.seasonImage || 'https://placehold.co/600x600/0D0D0D/F5EBE0?text=Arc'} alt={season.seasonName} className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="mt-8 text-center max-w-[200px]">
                        <p className="text-[#DD0426] font-accent text-[10px] tracking-[0.5em] uppercase font-black mb-1 opacity-60">SEASON 0{season.seasonNumber}</p>
                        <h3 className="text-base md:text-xl font-display text-[#F5EBE0] uppercase tracking-widest group-hover:text-white transition-colors">
                          {season.seasonName || `Season ${season.seasonNumber}`}
                        </h3>
                      </div>
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#DD0426] text-white font-display text-2xl flex items-center justify-center shadow-2xl z-20 border border-white/20 font-black">
                        {season.seasonNumber}
                      </div>
                    </Motion.div>
                  ))}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ════════════════ REFINED STRUCTURED EXPANSION MODAL ════════════════ */}
      <AnimatePresence>
        {selectedSeason && (
          <Motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/98 backdrop-blur-3xl"
            onClick={() => setSelectedSeason(null)}
          >
            <Motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative max-w-7xl w-full h-auto max-h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_150px_rgba(221,4,38,0.15)] flex flex-col md:flex-row"
              onClick={e => e.stopPropagation()}
            >
              {/* Parchment Texture Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay z-0" 
                   style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/parchment.png")' }} />

              {/* Close Button */}
              <button 
                className="absolute top-8 right-8 z-[110] p-4 bg-black/50 hover:bg-[#DD0426] rounded-full text-white transition-all border border-white/10 group"
                onClick={() => setSelectedSeason(null)}
              >
                <X size={24} weight="bold" className="group-hover:rotate-90 transition-transform" />
              </button>

              {/* LEFT: Season Visuals */}
              <div className="w-full md:w-[45%] relative bg-black flex-shrink-0">
                <img 
                  src={selectedSeason.seasonImage || 'https://placehold.co/1200x1200/0D0D0D/F5EBE0?text=Intel'} 
                  alt={selectedSeason.seasonName}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#0A0A0A]" />
                
                {/* Visual Label (Subtle) */}
                <div className="absolute bottom-10 left-10">
                   <div className="flex items-center gap-3 mb-2">
                      <BookmarkSimple size={20} className="text-[#DD0426]" weight="fill" />
                      <span className="text-white/40 font-accent text-[10px] tracking-[0.5em] uppercase font-black">Official Record</span>
                   </div>
                   <h3 className="text-4xl md:text-6xl font-display text-white uppercase leading-none tracking-tighter drop-shadow-2xl">
                      {selectedSeason.seasonName}
                   </h3>
                </div>
              </div>

              {/* RIGHT: Season Information */}
              <div className="flex-1 p-10 md:p-20 flex flex-col justify-between space-y-12 bg-gradient-to-br from-[#0D0D0D] to-[#0A0A0A] relative z-10 overflow-hidden">
                
                {/* Header Sector */}
                <div className="space-y-10">
                  <div className="flex items-center justify-between border-b border-white/5 pb-10">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-4 h-1 bg-[#DD0426]" />
                           <p className="text-[#DD0426] font-accent text-[11px] tracking-[0.4em] uppercase font-black">Record Entry</p>
                        </div>
                        <p className="text-white text-4xl font-display tracking-[0.2em] uppercase font-black">Season 0{selectedSeason.seasonNumber}</p>
                     </div>
                     <ShieldCheck size={40} className="text-[#DD0426] opacity-30" weight="fill" />
                  </div>

                  {/* Narrative Sector */}
                  <div className="space-y-8">
                    <p className="text-white/30 font-accent text-[10px] tracking-[0.6em] uppercase flex items-center gap-4">
                       <div className="w-10 h-px bg-white/20" /> Overview
                    </p>
                    
                    {/* Information Panel */}
                    <div className="p-10 md:p-14 rounded-[3rem] bg-white/[0.02] border border-white/5 shadow-inner relative group/card">
                       <div className="max-h-[380px] overflow-y-auto pr-6 custom-scrollbar">
                          <p className="text-[#F5EBE0] font-sans leading-relaxed opacity-90 text-lg">
                             {selectedSeason.seasonInfo || "Detailed information for this season is being compiled. The story continues."}
                          </p>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-10 flex flex-col sm:flex-row gap-6">
                  {selectedSeason.seasonTrailer && (
                    <a 
                      href={selectedSeason.seasonTrailer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-4 px-10 py-6 bg-[#DD0426] text-white text-xs font-accent uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all shadow-[10px_10px_0px_rgba(221,4,38,0.15)] font-black group"
                    >
                      <PlayCircle size={24} weight="bold" className="group-hover:scale-110 transition-transform" /> View Trailer
                    </a>
                  )}
                  <button 
                    onClick={() => setSelectedSeason(null)}
                    className="flex-1 px-10 py-6 border border-white/10 text-white/40 text-xs font-accent uppercase tracking-[0.3em] hover:bg-white hover:text-black hover:border-white transition-all font-black"
                  >
                    Close
                  </button>
                </div>

              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(221, 4, 38, 0.5); border-radius: 10px; }
      `}</style>
    </section>
  );
};

const generateSquareSnakePath = (rows) => {
  if (rows.length === 0) return "";
  const colX = [200, 600, 1000];
  let path = `M ${colX[0]} 200 `; 
  for (let r = 0; r < rows.length; r++) {
    const isReverse = r % 2 !== 0;
    const y = r * 400 + 200;
    const nextY = (r + 1) * 400 + 200;
    if (isReverse) path += `L ${colX[2]} ${y} L ${colX[0]} ${y} `; 
    else path += `L ${colX[0]} ${y} L ${colX[2]} ${y} `;
    if (r < rows.length - 1) {
      const dropX = isReverse ? colX[0] : colX[2];
      path += `L ${dropX} ${nextY} `;
    }
  }
  return path;
};

export default SeasonTimeline;
