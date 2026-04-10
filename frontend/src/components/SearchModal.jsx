import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
          <motion.div
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
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="pointer-events-auto w-full max-w-xl"
            >
              <div
                className="rounded-2xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.85)]"
                style={{ background: '#131316', border: '1px solid #222228' }}
              >
                {/* Input row */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#222228]">
                  {loading
                    ? <CircleNotch size={18} weight="bold" className="text-[#E8385A] animate-spin flex-shrink-0" />
                    : <MagnifyingGlass size={18} weight="bold" className="text-[#3A3A4A] flex-shrink-0" />
                  }
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search anime titles..."
                    className="flex-1 bg-transparent border-none outline-none text-[#EDF0F7] text-sm placeholder:text-[#3D4A5C] font-sans"
                  />
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {query && (
                      <button onClick={() => setQuery('')} className="text-[#3A3A4A] hover:text-[#888895] transition-colors">
                        <X size={16} weight="bold" />
                      </button>
                    )}
                    <kbd className="hidden sm:flex items-center px-1.5 py-0.5 rounded border border-[#222228] text-[#3A3A4A] text-[10px] font-mono">
                      ESC
                    </kbd>
                  </div>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                  {/* Recent searches */}
                  {showRecent && (
                    <div className="py-2">
                      <p className="px-4 py-2 text-[#3D4A5C] text-[10px] font-mono uppercase tracking-widest">Recent</p>
                      {recent.map(name => (
                        <Link
                          key={name}
                          to={`/anime/details/${encodeURIComponent(name)}`}
                          onClick={onClose}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#161B27] transition-colors group"
                        >
                          <Clock size={14} weight="bold" className="text-[#3A3A4A]" />
                          <span className="flex-1 text-[#888895] text-sm group-hover:text-[#F0F0F5] transition-colors truncate">{name}</span>
                          <ArrowRight size={14} weight="bold" className="text-[#E8385A] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Live results */}
                  {showResults && (
                    <div className="py-2">
                      <p className="px-4 py-2 text-[#3D4A5C] text-[10px] font-mono uppercase tracking-widest">Results</p>
                      {results.map(anime => (
                        <Link
                          key={anime.animeId}
                          to={`/anime/details/${encodeURIComponent(anime.animeName)}`}
                          onClick={() => handleSelect(anime)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#161B27] transition-colors group"
                        >
                          {/* Tiny thumbnail */}
                          <div className="w-8 h-10 rounded-md overflow-hidden flex-shrink-0 bg-[#161B27]">
                            <img
                              src={anime.image_url_base_anime || ''}
                              alt=""
                              className="w-full h-full object-cover object-top"
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#F0F0F5] text-sm font-medium truncate group-hover:text-[#E8385A] transition-colors">{anime.animeName}</p>
                            {anime.releaseDate && (
                              <p className="text-[#3A3A4A] text-xs font-mono">{new Date(anime.releaseDate).getFullYear()}</p>
                            )}
                          </div>
                          <ArrowRight size={14} weight="bold" className="text-[#E8385A] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* No results */}
                  {showEmpty && (
                    <div className="px-4 py-10 text-center">
                      <p className="text-[#3D4A5C] text-sm font-sans">No results for "<span className="text-[#8892A4]">{query}</span>"</p>
                    </div>
                  )}

                  {/* Idle hint */}
                  {!query && !showRecent && (
                    <div className="px-4 py-10 text-center">
                      <p className="text-[#3D4A5C] text-sm font-sans">Start typing to search the library...</p>
                    </div>
                  )}
                </div>

                {/* Footer hint */}
                <div className="px-4 py-2.5 border-t border-[#222228] flex items-center justify-between">
                  <span className="text-[#3A3A4A] text-[10px] font-mono">↑↓ navigate · Enter select</span>
                  <span className="text-[#3A3A4A] text-[10px] font-mono select-none">Sensei v2.0</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default SearchModal;
