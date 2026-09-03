import React from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  CalendarDots,
  MonitorPlay,
  Factory,
  Info,
} from '@phosphor-icons/react';

function AnimeCard({ anime, index = 0 }) {
  const year = anime.releaseDate ? new Date(anime.releaseDate).getFullYear() : null;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.4) }}
    >
      <Link
        to={`/anime/details/${encodeURIComponent(anime.animeName)}`}
        className="ss-anime-card group flex flex-col h-full bg-[#111111]/40 rounded-2xl border border-white/5 hover:border-[#FF1F44]/30 hover:bg-[#111111]/80 transition-all overflow-hidden"
      >
        <div className="ss-anime-card__img-container relative aspect-[16/9] overflow-hidden">
          <img
            className="ss-anime-card__img w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            src={anime.image_url_base_anime || 'https://placehold.co/400x225/131316/3A3A4A?text=No+Image'}
            alt={anime.animeName}
            loading="lazy"
            onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x225/131316/3A3A4A?text=Image+Missing'; }}
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <div className="flex items-center gap-1.5 text-[10px] font-accent text-[#FF1F44] font-bold uppercase tracking-widest bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#FF1F44]/40 shadow-lg">
                <Info size={12} weight="bold" /> View Details
             </div>
          </div>
        </div>

        <div className="ss-anime-card__body p-3 space-y-1.5 text-center">
          <div className="flex items-center justify-center gap-2">
            <p className="font-accent text-[11px] text-[#F5EBE0] line-clamp-1 group-hover:text-[#FF1F44] transition-colors tracking-wide uppercase font-bold w-full text-center">
              {anime.animeName}
            </p>
          </div>
          <div className="flex items-center justify-center gap-x-2 gap-y-1 pt-1 border-t border-white/5 flex-wrap">
            {year && (
              <span className="inline-flex items-center gap-1 text-[10px] font-accent text-white font-bold tracking-wider">
                <CalendarDots size={11} weight="bold" className="text-[#AAAAAA]" />
                {year}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] text-white font-accent uppercase tracking-tighter font-bold">
              <MonitorPlay size={11} weight="bold" className="text-[#AAAAAA]" />
              Sub | Dub
            </span>
            {anime.studio && (
              <span className="inline-flex min-w-0 max-w-full items-center gap-1 text-[10px] font-accent text-[#FF1F44] uppercase tracking-[0.15em] font-black">
                <Factory size={11} weight="bold" className="shrink-0 text-[#AAAAAA]" />
                <span className="truncate">{anime.studio}</span>
              </span>
            )}
          </div>
        </div>
      </Link>
    </Motion.div>
  );
}

export default AnimeCard;
