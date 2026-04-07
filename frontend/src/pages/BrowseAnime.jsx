// my-anime-recs-frontend/src/pages/BrowseAnimePage.js

import React, { useEffect, useState } from 'react';
import { getAllAnime, searchAnime } from '../api';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Search, Loader2, X } from 'lucide-react';

function BrowseAnimePage() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

  // Determine which list to display
  const displayedAnime = searchQuery.trim() ? searchResults : animeList;

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

      {/* Search Bar - Premium UI */}
      <div className="max-w-2xl mx-auto mb-12 relative group">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className={`w-5 h-5 transition-colors duration-300 ${isSearching ? 'text-kawaii-accent animate-pulse' : 'text-kawaii-text-muted group-focus-within:text-kawaii-accent'}`} />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-12 py-4 bg-anime-sub-card/30 backdrop-blur-xl border-2 border-white/10 rounded-2xl text-kawaii-text-dark focus:outline-none focus:border-kawaii-accent/50 focus:ring-4 focus:ring-kawaii-accent/10 transition-all duration-300 placeholder:text-kawaii-text-muted/50 font-medium text-lg shadow-lg group-hover:border-white/20"
            placeholder="Search for your favorite anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-kawaii-text-muted hover:text-kawaii-error transition-colors"
              >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        
        {/* Search Status Indicator */}
        <AnimatePresence>
          {searchQuery && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -bottom-7 left-2 text-sm font-bold tracking-wider"
            >
              {isSearching ? (
                <span className="text-kawaii-accent animate-pulse flex items-center gap-2">
                  Searching the database...
                </span>
              ) : (
                <span className="text-kawaii-text-muted">
                  Showing {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for "{searchQuery}"
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {displayedAnime.length === 0 ? (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedAnime.map((anime) => (
            <Link to={`/anime/details/${encodeURIComponent(anime.animeName)}`} key={anime.animeId} className="block h-full">
              <motion.div 
                whileHover={{ y: -10, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="glass-card overflow-hidden h-full flex flex-col group relative border border-white/10 shadow-lg hover:shadow-kawaii-glow"
              >
                <div className="relative overflow-hidden w-full max-h-[250px] bg-anime-bg flex items-center justify-center group-hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all">
                  {/* High-Vibrancy Ambient Backdrop */}
                  <img 
                    src={anime.image_url_base_anime || ''} 
                    className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-60 scale-150 pointer-events-none"
                    alt=""
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-anime-bg/80 via-transparent to-anime-bg/20 z-0"></div>
                  <img
                    src={anime.image_url_base_anime || 'https://placehold.co/200x280/16213E/9CA3AF?text=No+Image'}
                    alt={anime.animeName}
                    className="relative z-10 w-full h-auto max-h-[250px] object-contain group-hover:scale-105 transition-transform duration-700 shadow-2xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/200x280/16213E/9CA3AF?text=Image+Missing';
                    }}
                  />
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-anime-card/90 backdrop-blur-md px-3 py-1 rounded-full shadow-md flex items-center gap-1 font-bold text-kawaii-accent-dark text-sm">
                    <Star className="w-4 h-4 fill-kawaii-accent-dark" />
                    N/A
                  </div>
                </div>
                
                <div className="p-5 flex-grow flex flex-col justify-between bg-anime-sub-card/50 backdrop-blur-sm">
                  <div>
                    <h3 className="text-lg font-sans font-medium text-kawaii-text-dark mb-2 line-clamp-2 leading-tight group-hover:text-kawaii-accent transition-colors tracking-wide">
                      {anime.animeName}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="tech-label px-2 py-1 bg-kawaii-tertiary/20 text-kawaii-tertiary rounded-md">
                        Anime
                      </span>
                      <span className="tech-label px-2 py-1 bg-kawaii-secondary/20 text-kawaii-secondary rounded-md">
                        N/A
                      </span>
                    </div>
                  </div>
                  <p className="text-kawaii-text-muted text-xs font-bold flex items-center justify-between mt-2 pt-3 border-t border-kawaii-border uppercase tracking-widest">
                    <span>Episodes</span>
                    <span className="text-kawaii-accent group-hover:underline font-accent uppercase">View info ➔</span>
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default BrowseAnimePage;