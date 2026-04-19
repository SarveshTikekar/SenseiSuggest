import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlass,
  X,
  CircleNotch,
  ArrowRight,
  Clock
} from '@phosphor-icons/react';
import { searchAnime, getAllAnime } from '../api';

const RECENT_KEY = 'ss_recent_searches';

function SearchModal({ open, onClose }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [animeMap, setAnimeMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [recent, setRecent]   = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; }
    catch { return []; }
  });
  const inputRef = useRef(null);

  // Build a lookup map of all anime for ID → detail resolution
  useEffect(() => {
    if (!open) return;
    getAllAnime().then(list => {
      const map = {};
      list.forEach(a => { map[a.animeId] = a; });
      setAnimeMap(map);
    }).catch(() => {});
  }, [open]);

  // Focus on open
  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); }
    else { setQuery(''); setResults([]); }
  }, [open]);

  // Keyboard shortcut
  useEffect(() => {
    const down = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open ? onClose() : onClose(false); // toggle handled by parent
      }
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const ids = await searchAnime(query);
        setResults(ids.map(id => animeMap[id]).filter(Boolean).slice(0, 8));
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [query, animeMap]);

  const handleSelect = (anime) => {
    const updated = [anime.animeName, ...recent.filter(r => r !== anime.animeName)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    onClose();
  };

  const showRecent  = !query.trim() && recent.length > 0;
  const showResults = query.trim() && results.length > 0;
  const showEmpty   = query.trim() && !loading && results.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <Motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[12vh] px-4 pointer-events-none">
            <Motion.div
              key="modal"
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="pointer-events-auto w-full max-w-xl"
            >
              <div
                className="rounded-2xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.85)]"
                style={{ background: '#0D0D0D', border: '1px solid rgba(170, 170, 170, 0.15)' }}
              >
                {/* Input row */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
                  {loading
                    ? <CircleNotch size={18} weight="bold" className="text-[#DD0426] animate-spin flex-shrink-0" />
                    : <MagnifyingGlass size={18} weight="bold" className="text-[#AAAAAA] flex-shrink-0" />
                  }
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search anime titles..."
                    className="flex-1 bg-transparent border-none outline-none text-[#F5EBE0] text-sm placeholder:text-[#9A8C98] font-accent uppercase tracking-widest"
                  />
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {query && (
                      <button onClick={() => setQuery('')} className="text-[#AAAAAA] hover:text-[#F5EBE0] transition-colors">
                        <X size={16} weight="bold" />
                      </button>
                    )}
                    <kbd className="hidden sm:flex items-center px-1.5 py-0.5 rounded border border-white/[0.08] text-[#AAAAAA] text-[10px] font-accent">
                      ESC
                    </kbd>
                  </div>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                  {/* Recent searches */}
                  {showRecent && (
                    <div className="py-2">
                      <p className="px-4 py-2 text-[#9A8C98] text-[10px] font-accent uppercase tracking-widest">Recent</p>
                      {recent.map(name => (
                        <Link
                          key={name}
                          to={`/anime/details/${encodeURIComponent(name)}`}
                          onClick={onClose}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors group"
                        >
                          <Clock size={14} weight="bold" className="text-[#AAAAAA] opacity-60" />
                          <span className="flex-1 text-[#AAAAAA] text-[13px] font-accent uppercase tracking-widest group-hover:text-[#F5EBE0] transition-colors truncate">{name}</span>
                          <ArrowRight size={14} weight="bold" className="text-[#DD0426] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Live results */}
                  {showResults && (
                    <div className="py-2">
                      <p className="px-4 py-2 text-[#9A8C98] text-[10px] font-accent uppercase tracking-widest">Results</p>
                      {results.map(anime => (
                        <Link
                          key={anime.animeId}
                          to={`/anime/details/${encodeURIComponent(anime.animeName)}`}
                          onClick={() => handleSelect(anime)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors group"
                        >
                          {/* Tiny thumbnail */}
                          <div className="w-8 h-10 rounded-md overflow-hidden flex-shrink-0 bg-white/[0.04]">
                            <img
                              src={anime.image_url_base_anime || ''}
                              alt=""
                              className="w-full h-full object-cover object-top"
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#F5EBE0] text-[13px] font-accent uppercase tracking-widest truncate group-hover:text-[#DD0426] transition-colors">{anime.animeName}</p>
                            {anime.releaseDate && (
                              <p className="text-[#AAAAAA] opacity-60 text-[10px] font-accent">{new Date(anime.releaseDate).getFullYear()}</p>
                            )}
                          </div>
                          <ArrowRight size={14} weight="bold" className="text-[#DD0426] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* No results */}
                  {showEmpty && (
                    <div className="px-4 py-10 text-center">
                      <p className="text-[#9A8C98] text-[1.2rem] font-hand">No results for "<span className="text-[#AAAAAA]">{query}</span>"</p>
                    </div>
                  )}

                  {/* Idle hint */}
                  {!query && !showRecent && (
                    <div className="px-4 py-10 text-center">
                      <p className="text-[#9A8C98] text-[1.2rem] font-hand">Start typing to search the library...</p>
                    </div>
                  )}
                </div>

                {/* Footer hint */}
                <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[#AAAAAA] opacity-60 text-[10px] font-accent uppercase tracking-widest">↑↓ navigate · Enter select</span>
                  <span className="text-[#AAAAAA] opacity-60 text-[10px] font-accent uppercase tracking-widest select-none">Sensei v2.0</span>
                </div>
              </div>
            </Motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default SearchModal;
