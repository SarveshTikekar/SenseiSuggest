// my-anime-recs-frontend/src/pages/BrowseAnimePage.js

import React, { useEffect, useState } from 'react';
import { getAllAnime } from '../api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

function BrowseAnimePage() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <h2 className="text-4xl font-bold text-anime-accent text-center mb-10">
        Browse All Anime
      </h2>

      {animeList.length === 0 ? (
        <p className="text-anime-text-dark text-center text-xl">
          No anime found in the database.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {animeList.map((anime) => (
            <Link to={`/anime/details/${encodeURIComponent(anime.animeName)}`} key={anime.animeId} className="block h-full">
              <motion.div 
                whileHover={{ y: -10, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="glass-card overflow-hidden h-full flex flex-col group relative border border-white/10 shadow-lg hover:shadow-kawaii-glow"
              >
                <div className="relative overflow-hidden w-full h-80">
                  <img
                    src={anime.image_url_base_anime || 'https://placehold.co/200x280/16213E/9CA3AF?text=No+Image'}
                    alt={anime.animeName}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
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