import React, { useEffect, useState, useMemo } from 'react';
import { getSortedAnime } from '../api';
import { Link }       from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  SortAscending, SortDescending,
  FilmSlate, CalendarBlank, Star, Funnel,
  CaretLeft, CaretRight, Info
} from '@phosphor-icons/react';

/* ─── Skeleton card ─── */
const SkeletonCard = () => (
  <div className="ss-anime-card">
    <div className="ss-anime-card__img-container ss-skeleton" />
    <div className="ss-anime-card__body py-4 px-5">
      <div className="ss-skeleton rounded mb-2" style={{ height: '14px', width: '90%' }} />
      <div className="ss-skeleton rounded" style={{ height: '11px', width: '50%' }} />
    </div>
  </div>
);

/* ─── Anime card — fixed image + text panel ─── */
const AnimeCard = ({ anime, index }) => {
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
             <div className="flex items-center gap-1.5 text-[12px] font-accent text-[#FF1F44] font-bold uppercase tracking-widest bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-[#FF1F44]/40 shadow-lg">
                <Info size={13} weight="bold" /> View Details
             </div>
          </div>
        </div>
        
        <div className="ss-anime-card__body p-3.5 space-y-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <p className="font-accent text-[12px] text-[#F5EBE0] line-clamp-1 group-hover:text-[#FF1F44] transition-colors tracking-wide uppercase font-bold w-full text-center">
              {anime.animeName}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1 border-t border-white/5 flex-wrap">
            {year && (
              <span className="text-[12px] font-accent text-white font-bold tracking-wider">{year}</span>
            )}
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF1F44]" />
            <p className="text-[12px] text-white font-accent uppercase tracking-tighter font-bold">
              Sub | Dub
            </p>
            {anime.studio && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF1F44]" />
                <p className="text-[11px] font-accent text-[#FF1F44] uppercase tracking-[0.15em] font-black truncate">
                  {anime.studio}
                </p>
              </>
            )}
          </div>
        </div>
      </Link>
    </Motion.div>
  );
};

/* ─── Main page ─── */
function BrowseAnimePage() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy]       = useState('animeName');
  const [sortOrder, setSortOrder] = useState('asc');
  const ITEMS = 20; // 5 columns × 4 rows — exact user requirement

  useEffect(() => {
    setLoading(true);
    getSortedAnime(sortBy, sortOrder)
      .then(d => setAnimeList(d))
      .catch(e => setError(e.message || 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [sortBy, sortOrder]);

  useEffect(() => { setCurrentPage(1); }, [sortBy, sortOrder]);

  const total  = Math.ceil(animeList.length / ITEMS);
  const paged  = useMemo(() => animeList.slice((currentPage - 1) * ITEMS, currentPage * ITEMS), [animeList, currentPage]);

  const pages = () => {
    if (total <= 7) return [...Array(total)].map((_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '…', total];
    if (currentPage >= total - 3) return [1, '…', total-4, total-3, total-2, total-1, total];
    return [1, '…', currentPage-1, currentPage, currentPage+1, '…', total];
  };

  if (loading) return (
    <div className="max-w-[1880px] mx-auto py-12 px-8">
      <div className="ss-skeleton rounded h-12 w-48 mb-4" />
      <div className="ss-skeleton rounded h-4 w-64 mb-12" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="font-display font-bold text-3xl mb-2 text-[#FF1F44]">Transmission Interrupted</p>
      <p className="text-[#AAAAAA] text-lg font-hand max-w-md">{error}</p>
    </div>
  );

  return (
    <div className="max-w-[1880px] mx-auto py-12 px-4 sm:px-8 lg:px-12 min-h-screen flex flex-col">

      {/* Header — compact, premium */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#FF1F44]/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="font-display text-[#F5EBE0] text-5xl lg:text-7xl uppercase tracking-tighter">
            Library
          </h1>
        </div>

        {/* Sort controls — premium feel */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="flex items-center bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="px-3 border-r border-white/5 h-full flex items-center">
               <Funnel size={14} weight="bold" className="text-[#AAAAAA]" />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-transparent border-none py-2.5 pr-8 pl-3 text-[10px] font-accent text-[#F5EBE0] uppercase tracking-widest focus:ring-0 cursor-pointer"
            >
              <option value="animeName">By Name</option>
              <option value="releaseDate">By Timeline</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(p => p === 'asc' ? 'desc' : 'asc')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-accent text-[10px] uppercase tracking-widest transition-all border ${
              sortOrder === 'asc' 
              ? 'bg-[#FF1F44]/10 border-[#FF1F44]/30 text-[#FF1F44] shadow-[0_0_20px_rgba(255,31,68,0.1)]' 
              : 'bg-white/5 border-white/10 text-[#AAAAAA] hover:bg-white/10'
            }`}
          >
            <AnimatePresence mode="wait">
              <Motion.div
                key={sortOrder}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                {sortOrder === 'asc' ? <SortAscending size={16} weight="bold" /> : <SortDescending size={16} weight="bold" />}
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Grid — fixed 6 per row */}
      {animeList.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center py-32 text-center">
           <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center mb-6">
              <FilmSlate size={32} className="text-[#333]" />
           </div>
           <p className="text-[#AAAAAA] font-accent text-[12px] uppercase tracking-[0.4em] opacity-40">Zero matches found in data banks</p>
        </div>
      ) : (
        <div className="flex-grow">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8">
            {paged.map((anime, i) => <AnimeCard key={anime.animeId} anime={anime} index={i} />)}
          </div>

          {/* Pagination — Modern Premium UI */}
          {total > 1 && (
            <div className="mt-24 mb-12 flex flex-col items-center gap-6">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="flex items-center gap-2 p-1.5 bg-[#111] border border-white/10 rounded-2xl shadow-2xl">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-10 hover:bg-white/5 text-[#AAAAAA] hover:text-[#F5EBE0]"
                >
                  <CaretLeft size={18} weight="bold" />
                </button>

                <div className="flex items-center gap-1 mx-2">
                  {pages().map((p, i) =>
                    p === '…' ? (
                      <span key={`e${i}`} className="w-8 text-center text-[#333] font-bold">···</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-10 h-10 rounded-xl text-[11px] font-accent transition-all relative overflow-hidden group ${
                          currentPage === p
                          ? 'bg-[#FF1F44] text-white shadow-[0_0_25px_rgba(255,31,68,0.4)]'
                          : 'text-[#AAAAAA] hover:bg-white/5 hover:text-[#F5EBE0]'
                        }`}
                      >
                        {p}
                        {currentPage === p && (
                          <Motion.div 
                            layoutId="active-page"
                            className="absolute inset-0 bg-white/10"
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, total))}
                  disabled={currentPage === total}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-10 hover:bg-white/5 text-[#AAAAAA] hover:text-[#F5EBE0]"
                >
                  <CaretRight size={18} weight="bold" />
                </button>
              </div>
              <p className="text-[9px] font-accent text-[#AAAAAA] uppercase tracking-[0.5em] opacity-30">
              Page {currentPage} of {total}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BrowseAnimePage;