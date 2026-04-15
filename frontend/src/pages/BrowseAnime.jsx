import React, { useEffect, useState, useMemo } from 'react';
import { getSortedAnime } from '../api';
import { Link }       from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  SortAscending, SortDescending,
  FilmSlate, CalendarBlank, Star, Funnel
} from '@phosphor-icons/react';
import {
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
  Sliders
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

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.025, 0.4) }}
    >
      <Link 
        to={`/anime/details/${encodeURIComponent(anime.animeName)}`} 
        className="ss-anime-card group"
      >
        <div className="ss-anime-card__img-container">
          {/* Blurred Backdrop */}
          <img 
            className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-110 pointer-events-none"
            src={anime.image_url_base_anime || ''} 
            alt=""
            aria-hidden
          />
          <img
            className="ss-anime-card__img relative z-10"
            src={anime.image_url_base_anime || ''}
            alt={anime.animeName}
            loading="lazy"
            onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x600/131316/3A3A4A?text=No+Image'; }}
          />
        </div>
        
        <div className="ss-anime-card__body">
          <p className="font-display font-black text-[13px] text-[#F5EBE0] line-clamp-1 group-hover:text-[#DD0426] transition-colors tracking-tight">
            {anime.animeName}
          </p>
          <p className="text-[11px] text-[#AAAAAA] font-medium">
            Sub | Dub
          </p>
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
  const ITEMS = 18; // 6 columns × 3 rows — high density discovery layout

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
    <div className="max-w-screen-xl mx-auto py-10">
      <div className="ss-skeleton rounded" style={{ height: '32px', width: '160px', marginBottom: '6px' }} />
      <div className="ss-skeleton rounded" style={{ height: '14px', width: '240px', marginBottom: '28px' }} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="py-32 text-center">
      <p className="font-display font-bold text-xl mb-1" style={{ color: '#F5EBE0' }}>Failed to load</p>
      <p className="text-sm" style={{ color: '#AAAAAA' }}>{error}</p>
    </div>
  );

  return (
    <div className="max-w-[1640px] mx-auto py-10 px-4 sm:px-6 lg:px-8">

      {/* Header — compact, no wasted space */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-black" style={{ color: '#F5EBE0', fontSize: 'clamp(1.5rem,3vw,2rem)', letterSpacing: '-0.02em' }}>
            Library
          </h1>
          <p style={{ color: '#AAAAAA', fontSize: '11px', fontFamily: 'Space Grotesk', marginTop: '4px' }}>
            {animeList.length.toLocaleString()} titles · page {currentPage}/{total}
          </p>
        </div>

        {/* Sort controls — right side, compact */}
        <div className="flex items-center gap-2">
          <Funnel size={14} weight="bold" style={{ color: '#AAAAAA' }} />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ fontSize: '12px', fontFamily: 'Space Grotesk', minWidth: '130px', padding: '6px 28px 6px 10px' }}
          >
            <option value="animeName">By Name</option>
            <option value="releaseDate">By Date</option>
          </select>

          <button
            onClick={() => setSortOrder(p => p === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1.5 transition-all"
            style={{
              padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontFamily: 'Space Grotesk',
              fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
              background: sortOrder === 'asc' ? 'rgba(221,4,38,0.1)' : 'rgba(186,175,184,0.05)',
              border: `1px solid ${sortOrder === 'asc' ? 'rgba(221,4,38,0.25)' : 'rgba(186,175,184,0.15)'}`,
              color: sortOrder === 'asc' ? '#DD0426' : '#AAAAAA',
            }}
          >
            <AnimatePresence mode="wait">
              <Motion.div
                key={sortOrder}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className="flex items-center gap-1.5"
              >
                {sortOrder === 'asc'
                  ? <><SortAscending size={13} weight="bold" /> Asc</>
                  : <><SortDescending size={13} weight="bold" /> Desc</>
                }
              </Motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Grid — 4 cols, larger image cards */}
      {animeList.length === 0 ? (
        <div className="py-32 text-center" style={{ color: '#AAAAAA', fontFamily: 'Space Grotesk', fontSize: '13px' }}>
          No anime found in the library.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {paged.map((anime, i) => <AnimeCard key={anime.animeId} anime={anime} index={i} />)}
          </div>

          {/* Pagination */}
          {total > 1 && (
            <div className="mt-12 flex items-center justify-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-25"
                style={{ border: '1px solid #2A2A2A', background: '#1A1A1A', color: '#AAAAAA' }}
              >
                <CaretLeft size={16} weight="bold" />
              </button>

              {pages().map((p, i) =>
                p === '…' ? (
                  <span key={`e${i}`} className="w-8 text-center" style={{ color: '#AAAAAA', fontSize: '13px' }}>···</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
                    style={currentPage === p
                      ? { background: '#DD0426', color: '#fff', boxShadow: '0 0 14px rgba(221,4,38,0.35)', border: '1px solid transparent' }
                      : { border: '1px solid rgba(170, 170, 170, 0.15)', background: '#0D0D0D', color: '#AAAAAA' }
                    }
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, total))}
                disabled={currentPage === total}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-25"
                style={{ border: '1px solid #2A2A2A', background: '#1A1A1A', color: '#AAAAAA' }}
              >
                <CaretRight size={16} weight="bold" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BrowseAnimePage;