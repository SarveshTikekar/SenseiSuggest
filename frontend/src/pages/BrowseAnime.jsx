// my-anime-recs-frontend/src/pages/BrowseAnimePage.js

import React, { useEffect, useState, useMemo } from 'react';
import { getAllAnime, searchAnime } from '../api';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, X, ChevronLeft, ChevronRight, Hash } from 'lucide-react';

function BrowseAnimePage() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAllAnime();
        setAnimeList(data);
      } catch (err) {
        setError(err.message || 'Failed to load anime.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnime();
  }, []);

  // Debounced Search Effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const ids = await searchAnime(searchQuery);
        // Map IDs to full objects from the master animeList
        const results = animeList.filter(anime => ids.includes(anime.animeId));
        setSearchResults(results);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, animeList]);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // OPTIMIZATION: Memoize the base filtered list
  const displayedAnimeBase = useMemo(() => {
    return searchQuery.trim() ? searchResults : animeList;
  }, [searchQuery, searchResults, animeList]);

  // OPTIMIZATION: Memoize the paginated slice
  const paginatedAnime = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return displayedAnimeBase.slice(startIndex, startIndex + itemsPerPage);
  }, [displayedAnimeBase, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(displayedAnimeBase.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-anime-accent text-xl">Loading all anime...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-anime-error text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <h2 className="text-4xl font-bold text-anime-accent text-center mb-6">
        Browse All Anime
      </h2>

      {/* Expandable Search Button - Premium UI */}
      <div className="flex justify-center mb-16 relative">
        <motion.div 
          initial={false}
          animate={{ 
            width: isSearchExpanded ? '100%' : '60px',
            maxWidth: isSearchExpanded ? '672px' : '60px' // 672px is max-w-2xl
          }}
          transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
          style={{ willChange: 'transform, width', transform: 'translateZ(0)' }}
          className={`relative h-[60px] bg-anime-sub-card/30 backdrop-blur-xl border-2 rounded-2xl overflow-hidden shadow-lg group transition-colors duration-300 ${isSearchExpanded ? 'border-kawaii-accent/40 shadow-kawaii-glow' : 'border-white/10 hover:border-white/20'}`}
        >
          {/* Search/Toggle Button */}
          <div className="absolute inset-y-0 left-0 w-[60px] flex items-center justify-center z-20">
            <button 
              onClick={() => setIsSearchExpanded(prev => !prev)}
              className={`w-full h-full flex items-center justify-center rounded-full transition-all duration-300 ${isSearchExpanded ? 'text-kawaii-accent scale-110' : 'text-kawaii-text-muted hover:text-white'}`}
            >
              <Search className={`w-6 h-6 ${isSearching ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          <AnimatePresence>
            {isSearchExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex items-center pl-14 pr-12"
              >
                <input
                  type="text"
                  autoFocus
                  className="w-full bg-transparent border-none text-kawaii-text-dark focus:outline-none placeholder:text-kawaii-text-muted/50 font-medium text-lg"
                  placeholder="Search for your favorite anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      // Optional: collapse back when cleared
                      // setIsSearchExpanded(false); 
                    }}
                    className="absolute right-4 text-kawaii-text-muted hover:text-kawaii-error transition-colors"
                  >
                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Search Status Indicator - Outside the expanding div for layout stability */}
        <AnimatePresence>
          {searchQuery && isSearchExpanded && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 text-sm font-bold tracking-wider text-center"
            >
              {isSearching ? (
                <span className="text-kawaii-accent animate-pulse">
                  Searching the database...
                </span>
              ) : (
                <span className="text-kawaii-text-muted">
                  Showing {searchResults.length} {searchResults.length === 1 ? 'item' : 'items'} for "{searchQuery}"
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {displayedAnimeBase.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-80">
          <div className="w-24 h-24 bg-kawaii-bg/50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-kawaii-border">
            <Search className="w-10 h-10 text-kawaii-text-muted" />
          </div>
          <p className="text-kawaii-text-dark text-center text-2xl font-bold mb-2">
            {searchQuery ? "No results found" : "No anime found in the database"}
          </p>
          <p className="text-kawaii-text-muted text-center max-w-md">
            {searchQuery 
              ? `We couldn't find any anime matching "${searchQuery}". Try a different term!` 
              : "Wait for it... the database seems to be empty or still loading!"}
          </p>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-6 px-6 py-2 bg-kawaii-accent/10 text-kawaii-accent rounded-full hover:bg-kawaii-accent hover:text-white transition-all font-bold"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedAnime.map((anime) => (
              <Link to={`/anime/details/${encodeURIComponent(anime.animeName)}`} key={anime.animeId} className="block h-full">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5, scale: 1.01 }}
                  transition={{ type: "tween", duration: 0.2 }}
                  style={{ transform: 'translateZ(0)' }}
                  className="glass-card overflow-hidden h-full flex flex-col group relative border border-white/10 shadow-lg hover:shadow-kawaii-glow"
                >
                  <div className="relative overflow-hidden w-full max-h-[250px] bg-anime-bg flex items-center justify-center group-hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all">
                    {/* High-Vibrancy Ambient Backdrop */}
                    <img 
                      src={anime.image_url_base_anime || ''} 
                      className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-60 scale-150 pointer-events-none"
                      alt=""
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-anime-bg/80 via-transparent to-anime-bg/20 z-0"></div>
                    <img
                      src={anime.image_url_base_anime || 'https://placehold.co/200x280/16213E/9CA3AF?text=No+Image'}
                      alt={anime.animeName}
                      className="relative z-10 w-full h-auto max-h-[250px] object-contain group-hover:scale-105 transition-transform duration-700 shadow-2xl"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/200x280/16213E/9CA3AF?text=Image+Missing';
                      }}
                    />
                  </div>
                  
                  <div className="p-5 flex-grow flex flex-col justify-between bg-anime-sub-card/50 backdrop-blur-sm">
                    <div>
                      <h3 className="text-lg font-sans font-medium text-kawaii-text-dark mb-2 line-clamp-2 leading-tight group-hover:text-kawaii-accent transition-colors tracking-wide">
                        {anime.animeName}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-1">
                        <span className="tech-label px-2 py-1 bg-kawaii-tertiary/20 text-kawaii-tertiary rounded-md">
                          Anime
                        </span>
                        {/* Redundant labels removed for cleaner UI */}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-kawaii-border">
                      <span className="text-kawaii-text-muted text-[10px] uppercase tracking-widest font-bold">Details Available</span>
                      <span className="text-kawaii-accent text-xs font-accent uppercase group-hover:underline">Explore ➔</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls - Premium UI */}
          {totalPages > 1 && (
            <div className="mt-16 flex flex-col items-center gap-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-3 rounded-full bg-anime-sub-card/30 border border-white/5 hover:border-kawaii-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-kawaii-text-dark" />
                </button>
                
                <div className="flex items-center gap-2 px-4 py-2 bg-anime-sub-card/30 rounded-2xl border border-white/5">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-bold transition-all ${
                        currentPage === i + 1 
                          ? 'bg-kawaii-accent text-white shadow-kawaii-glow' 
                          : 'text-kawaii-text-muted hover:bg-white/5 hover:text-kawaii-text-dark'
                      }`}
                    >
                      {i + 1}
                    </button>
                  )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="text-kawaii-text-muted px-2">...</span>
                  )}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-10 h-10 rounded-xl font-bold text-kawaii-text-muted hover:bg-white/5 hover:text-kawaii-text-dark"
                    >
                      {totalPages}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-full bg-anime-sub-card/30 border border-white/5 hover:border-kawaii-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-kawaii-text-dark" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BrowseAnimePage;