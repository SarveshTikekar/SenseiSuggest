import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Zap, 
  History, 
  Play, 
  CheckCircle2, 
  Info,
  ChevronRight,
  Trophy,
  Calendar,
  Layers,
  PieChart as ChartIcon
} from 'lucide-react';
import { getRecommendations, updateWatchList } from '../api'; 
import { useAuth } from '../context/AuthContext'; 
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const RecommendationPage = () => {
  const { userId } = useAuth(); 
  const [recommendedAnimeDetails, setRecommendedAnimeDetails] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [genrePopularity, setGenrePopularity] = useState([]);
  const [mostPopularAnime, setMostPopularAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAllData = useCallback(async () => {
    if (!userId) { 
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getRecommendations(userId); 
      
      const recommendationsData = response.recommendations || [];
      
      const fallbackReasons = [
        "Matches your unique taste profile",
        "Trending among fans with similar interests",
        "A hidden gem found by the Sensei",
        "Matches your favorite genres",
        "Popular community choice"
      ];

      const enrichedRecommendations = recommendationsData.filter(Boolean).map((anime, idx) => ({
        ...anime,
        animeId: anime.animeId || anime.animeid,
        sensei_reason: anime.sensei_reason || fallbackReasons[idx % fallbackReasons.length],
        recommendation_source: anime.recommendation_source || (idx === 0 ? "Top Pick" : "AI Discovery"),
        display_genres: Array.isArray(anime.genres) ? anime.genres : 
                        (anime.anime_genres?.map(g => g.genres?.name).filter(Boolean) || [])
      }));

      setRecommendedAnimeDetails(enrichedRecommendations); 

      const rawRatingsDistrib = response.ratings_distribution || {};
      const processedRatingDistribution = Array.from({ length: 10 }, (_, i) => i + 1).map(score => ({
        score: score,
        count: rawRatingsDistrib[score] || 0
      }));
      setRatingDistribution(processedRatingDistribution);

      const rawGenreDistrib = response.Genre_anime_distrib || [];
      const processedGenrePopularity = rawGenreDistrib.map(item => {
        const genreName = Object.keys(item)[0];
        const animeCount = item[genreName];
        return { genreName, animeCount };
      });
      setGenrePopularity(processedGenrePopularity);

      setMostPopularAnime(response.most_popular_anime || null);

    } catch (err) {
      console.error("Error fetching all data:", err);
      setError("Failed to fetch sensei suggestions.");
    } finally {
      setLoading(false); 
    }
  }, [userId]);

  useEffect(() => {
    fetchAllData(); 
  }, [fetchAllData]);

  const handleStatusUpdate = async (animeId, status) => {
    if (!animeId) return;
    setActionLoading(animeId);
    try {
      await updateWatchList(userId, animeId, status);
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-anime-card">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-anime-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-anime-text-light font-display text-xl animate-pulse font-bold tracking-widest uppercase">Consulting the Sensei...</p>
        </div>
      </div>
    );
  }

  const topPick = recommendedAnimeDetails[0];
  const otherPicks = recommendedAnimeDetails.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-inter selection:bg-anime-accent selection:text-white">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <span className="tech-label text-anime-accent text-sm font-bold tracking-[0.2em] uppercase mb-2 block">Personalized Intelligence</span>
        <h1 className="text-6xl font-display font-black text-white leading-tight">
          Sensei <span className="text-anime-accent font-outline italic">Spotlight</span>
        </h1>
        <p className="text-anime-text-dark mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
          Artificial intelligence refined by your personal taste.
        </p>
      </motion.div>

      {!userId ? (
        <div className="text-center p-12 bg-anime-bg rounded-3xl border border-anime-border shadow-2xl backdrop-blur-sm">
          <Sparkles className="w-16 h-16 text-anime-accent mx-auto mb-6 opacity-50" />
          <h2 className="text-3xl font-display font-bold text-white mb-4">Unlock Your Destiny</h2>
          <p className="text-anime-text-dark text-xl mb-8 leading-relaxed">
            Please log in to allow the Sensei to analyze your watch patterns.
          </p>
        </div>
      ) : (
        <AnimatePresence>
          {/* Sensei's Choice - Hero Spotlight */}
          {topPick && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative rounded-[2.5rem] overflow-hidden border border-anime-border bg-gradient-to-br from-anime-card to-[#0d1526] shadow-[0_0_50px_rgba(0,0,0,0.5)] mb-20 group"
            >
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
              
              <div className="flex flex-col lg:flex-row items-center">
                {/* Hero Image */}
                <div className="w-full lg:w-1/2 h-[400px] lg:h-[600px] relative overflow-hidden bg-anime-bg flex items-center justify-center">
                  {/* High-Vibrancy Ambient Backdrop */}
                  <img src={topPick.image_url_base_anime} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-50 scale-150 pointer-events-none" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-anime-bg/60 via-transparent to-anime-bg/20 z-0"></div>
                  <img 
                    src={topPick.image_url_base_anime} 
                    alt={topPick.animeName}
                    className="relative z-10 max-w-full max-h-full object-contain transition-transform duration-1000 group-hover:scale-105 shadow-2xl"
                    onError={(e) => { e.target.src=`https://placehold.co/600x800/16213E/9CA3AF?text=Anime` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-anime-card via-transparent to-transparent lg:bg-gradient-to-r"></div>
                  <div className="absolute top-6 left-6 flex gap-2">
                    <span className="bg-anime-accent text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2">
                      <Trophy className="w-3 h-3" /> Sensei's Choice
                    </span>
                    <span className="bg-white/10 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                      {topPick.recommendation_source}
                    </span>
                  </div>
                </div>

                {/* Hero Content */}
                <div className="w-full lg:w-1/2 p-8 lg:p-16 relative">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="w-12 h-[2px] bg-anime-accent"></div>
                    <span className="text-anime-accent font-bold uppercase tracking-tighter text-sm">Top Match Predicted</span>
                  </div>
                  
                  <h2 className="text-4xl lg:text-6xl font-display font-black text-white mb-2 leading-none">
                    {topPick.animeName}
                  </h2>
                  <p className="tech-label text-anime-accent-dark mb-6 tracking-widest">{topPick.studio || 'Unknown Studio'}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {topPick.display_genres.map((genre, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-accent text-anime-text-light whitespace-nowrap">
                        {genre}
                      </span>
                    ))}
                  </div>

                  <p className="text-anime-text-light text-lg mb-10 leading-relaxed line-clamp-4 font-inter opacity-90 italic">
                    "{topPick.description || 'No description available for this masterpiece.'}"
                  </p>

                  <div className="bg-anime-accent/10 border-l-4 border-anime-accent p-6 rounded-r-xl mb-10 backdrop-blur-md">
                    <h4 className="text-anime-accent font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-widest">
                      <Info className="w-4 h-4" /> Sensei Reasoning:
                    </h4>
                    <p className="text-white text-lg font-medium">
                      {topPick.sensei_reason}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 mb-10 text-anime-text-dark text-sm border-y border-white/5 py-4">
                     <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-anime-accent" /> {topPick.releaseDate ? new Date(topPick.releaseDate).getFullYear() : 'N/A'}</span>
                     <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-anime-accent" /> {topPick.genre_count || topPick.display_genres.length} Genres</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleStatusUpdate(topPick.animeId, 'watching')}
                      className="flex-1 bg-anime-accent hover:bg-anime-accent-dark text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-anime-accent/20"
                    >
                      <Play className="w-5 h-5 fill-current" /> Start Watching
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(topPick.animeId, 'watched')}
                      className="w-16 h-16 border border-anime-border rounded-2xl flex items-center justify-center hover:bg-white/5 transition-colors group"
                    >
                      <CheckCircle2 className="w-6 h-6 text-anime-text-dark group-hover:text-green-400" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* More Handpicked Suggestions */}
          <section className="mb-24">
            <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-3xl font-display font-bold text-white tracking-tight">Handpicked Discoveries</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {otherPicks.map((anime, idx) => (
                <motion.div 
                  key={anime.animeId || idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="bg-anime-card rounded-[2rem] border border-anime-border hover:border-anime-accent/50 transition-all duration-300 overflow-hidden flex flex-col group h-full shadow-2xl"
                >
                  <div className="relative overflow-hidden w-full max-h-[250px] bg-anime-bg flex items-center justify-center group-hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all">
                    {/* High-Vibrancy Ambient Backdrop */}
                    <img src={anime.image_url_base_anime} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-60 scale-150 pointer-events-none" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-anime-bg/80 via-transparent to-anime-bg/20 z-0"></div>
                    <img 
                      src={anime.image_url_base_anime} 
                      className="relative z-10 w-full h-auto max-h-[250px] object-contain transition-transform duration-700 group-hover:scale-105 shadow-2xl"
                      alt={anime.animeName}
                      onError={(e) => { e.target.src=`https://placehold.co/400x250/16213E/9CA3AF?text=Anime` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-anime-card via-transparent to-transparent opacity-90"></div>
                    <div className="absolute top-4 right-4 animate-float">
                       <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-anime-accent uppercase tracking-tighter border border-anime-accent/30">
                         {anime.recommendation_source}
                       </span>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-grow">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-anime-accent-dark italic">{anime.studio || 'General Release'}</div>
                    <h4 className="text-2xl font-display font-bold text-white mb-2 leading-tight group-hover:text-anime-accent transition-colors">
                      {anime.animeName}
                    </h4>
                    
                    <p className="text-anime-text-dark text-xs mb-4 line-clamp-2 leading-relaxed opacity-90 min-h-[2.5rem] italic border-l-2 border-anime-accent/30 pl-3">
                      {anime.sensei_reason}
                    </p>

                    <p className="text-anime-text-muted text-xs mb-6 line-clamp-3 leading-relaxed opacity-70">
                      {anime.description || 'Dive into another fascinating world of storytelling.'}
                    </p>

                    <div className="mt-auto space-y-6">
                       <div className="flex flex-wrap gap-2 transition-all duration-500 py-3 border-t border-white/5">
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-white/5 py-1 px-2 rounded-md uppercase tracking-tighter border border-white/5">
                             <Calendar className="w-3 h-3 text-anime-accent" /> {anime.releaseDate ? new Date(anime.releaseDate).getFullYear() : 'N/A'}
                          </span>
                          {anime.display_genres.slice(0, 2).map((g, i) => (
                             <span key={i} className="text-[10px] font-bold text-anime-text-dark bg-anime-accent/5 py-1 px-2 rounded-md uppercase tracking-tighter border border-anime-accent/10 whitespace-nowrap">
                               {g}
                             </span>
                          ))}
                       </div>

                       <div className="flex gap-2">
                          <button 
                            disabled={actionLoading === anime.animeId}
                            onClick={() => handleStatusUpdate(anime.animeId, 'watching')}
                            className="flex-1 bg-white/5 hover:bg-anime-accent hover:text-white text-anime-text-light py-3 rounded-xl text-xs font-bold transition-all border border-anime-border flex items-center justify-center gap-2 "
                          >
                            {actionLoading === anime.animeId ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Play className="w-3 h-3 fill-current" /> List</>}
                          </button>
                          <button 
                             onClick={() => handleStatusUpdate(anime.animeId, 'watched')}
                             className="px-4 py-3 bg-white/5 rounded-xl border border-anime-border hover:text-green-400 hover:border-green-400/50 transition-all text-anime-text-dark"
                          >
                             <CheckCircle2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Analytics Visualizers */}
          <section className="mt-32">
             <div className="flex items-center gap-4 mb-12 justify-center">
                <div className="w-12 h-[1px] bg-anime-border"></div>
                <div className="flex items-center gap-3">
                   <ChartIcon className="text-anime-accent w-6 h-6" />
                   <h3 className="text-4xl font-display font-black text-white tracking-widest uppercase">Intelligence <span className="text-anime-accent">Metrics</span></h3>
                </div>
                <div className="w-12 h-[1px] bg-anime-border"></div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <motion.div 
                   whileInView={{ opacity: 1, x: 0 }}
                   initial={{ opacity: 0, x: -30 }}
                   className="lg:col-span-8 bg-anime-bg/50 backdrop-blur-xl p-8 rounded-[3rem] border border-anime-border shadow-2xl relative overflow-hidden"
                >
                   <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Zap className="w-32 h-32 text-anime-accent" />
                   </div>
                   <div className="flex justify-between items-center mb-8">
                      <h4 className="text-xl font-bold text-white flex items-center gap-3">
                         <Sparkles className="text-yellow-400 w-5 h-5" /> Global Genre Popularity
                      </h4>
                      <span className="text-[10px] font-accent text-anime-text-dark uppercase tracking-[0.3em]">Realtime Cluster Analysis</span>
                   </div>

                   <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={genrePopularity} margin={{ top: 20, bottom: 20 }}>
                         <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#9f7aea" stopOpacity={1}/>
                               <stop offset="95%" stopColor="#4c51bf" stopOpacity={0.8}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a202c" />
                         <XAxis 
                           dataKey="genreName" 
                           stroke="#4a5568" 
                           tick={{ fill: '#718096', fontSize: 10 }}
                           angle={-45} 
                           textAnchor="end"
                           height={60}
                           axisLine={false}
                         />
                         <YAxis hide />
                         <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                         />
                         <Bar dataKey="animeCount" radius={[8, 8, 0, 0]} barSize={25}>
                            {genrePopularity.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={`url(#colorCount)`} />
                            ))}
                         </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </motion.div>

                <motion.div 
                   whileInView={{ opacity: 1, x: 0 }}
                   initial={{ opacity: 0, x: 30 }}
                   className="lg:col-span-4 bg-anime-bg/50 backdrop-blur-xl p-8 rounded-[3rem] border border-anime-border shadow-2xl flex flex-col"
                >
                   <h4 className="text-xl font-bold text-white mb-10 flex items-center gap-3">
                      <History className="text-anime-accent w-5 h-5" /> Rating Density
                   </h4>
                   
                   <div className="flex-grow space-y-8">
                      {ratingDistribution.slice().reverse().slice(0, 5).map((r, idx) => (
                         <div key={idx} className="space-y-3">
                           <div className="flex justify-between text-xs font-black uppercase tracking-widest text-anime-text-light px-1">
                              <span>Rating {r.score}</span>
                              <span className="text-anime-accent">{Math.round((r.count / (Math.max(...ratingDistribution.map(rd => rd.count)) || 1)) * 100)}%</span>
                           </div>
                           <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                              <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${(r.count / (Math.max(...ratingDistribution.map(rd => rd.count)) || 1)) * 100}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className="h-full bg-gradient-to-r from-anime-accent to-blue-500 rounded-full shadow-[0_0_10px_rgba(255,46,147,0.5)]"
                              />
                           </div>
                         </div>
                      ))}
                   </div>
                   
                   <div className="mt-8 p-6 bg-anime-accent/5 rounded-3xl border border-anime-accent/10">
                      <p className="text-[10px] text-anime-accent font-black uppercase tracking-[0.2em] mb-2">Algorithm Verdict</p>
                      <p className="text-xs text-anime-text-dark leading-relaxed font-accent">The global user base is currently favoriting high-complexity narratives with 8+ scores.</p>
                   </div>
                </motion.div>
             </div>
          </section>

          {/* Hall of Fame - Most Popular overall */}
          <section className="mt-40 mb-32 text-center relative">
             <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-anime-accent/5 blur-[120px] rounded-full pointer-events-none"></div>
             
             <div className="inline-block px-10 py-4 bg-white/5 border border-white/10 rounded-full mb-16 backdrop-blur-md">
                <span className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.5em] text-white">
                   <ChevronRight className="w-4 h-4 text-anime-accent animate-pulse" /> Legendary Picks <ChevronRight className="w-4 h-4 text-anime-accent animate-pulse" />
                </span>
             </div>

             {mostPopularAnime && (
                <div className="max-w-5xl mx-auto relative group">
                   <div className="absolute -inset-2 bg-gradient-to-r from-anime-accent via-pink-500 to-cyan-500 rounded-[4rem] blur opacity-10 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                   <div className="relative bg-anime-card rounded-[4rem] border border-anime-border p-10 lg:p-16 flex flex-col md:flex-row items-center gap-16 shadow-[0_0_100px_rgba(0,0,0,0.6)]">
                      <div className="w-72 h-72 lg:w-96 lg:h-96 rounded-[3rem] overflow-hidden shadow-2xl border-[6px] border-anime-border flex-shrink-0 group-hover:border-anime-accent/30 transition-all duration-500 bg-anime-bg relative flex items-center justify-center">
                         {/* High-Vibrancy Ambient Backdrop */}
                         <img src={mostPopularAnime.image_url_base_anime} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-50 scale-150 pointer-events-none" alt="" />
                         <div className="absolute inset-0 bg-gradient-to-t from-anime-bg/40 via-transparent to-anime-bg/20 z-0"></div>
                         <img 
                           src={mostPopularAnime.image_url_base_anime} 
                           className="relative z-10 max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105 shadow-2xl" 
                           alt={mostPopularAnime.animeName}
                         />
                      </div>
                      <div className="text-center md:text-left flex-grow">
                         <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                            <h4 className="text-5xl font-display font-black text-white leading-tight">{mostPopularAnime.animeName}</h4>
                            <div className="bg-green-500/10 text-green-400 px-6 py-2 rounded-full text-xs font-black tracking-widest border border-green-500/20">
                               HALL OF FAME
                            </div>
                         </div>
                         <p className="text-anime-text-light text-xl mb-12 leading-relaxed opacity-80 font-accent max-w-2xl">
                            Consistently ranking at the apex of the global otaku ecosystem. This masterpiece defines current narrative benchmarks.
                         </p>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 group-hover:border-anime-accent/20 transition-colors">
                               <p className="text-[10px] text-anime-text-dark font-black uppercase tracking-widest mb-2">Positivity</p>
                               <p className="text-3xl font-display font-bold text-white">{Math.round(mostPopularAnime["Positivity Percentage"] || 0)}%</p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 group-hover:border-anime-accent/20 transition-colors">
                               <p className="text-[10px] text-anime-text-dark font-black uppercase tracking-widest mb-2">Release</p>
                               <p className="text-3xl font-display font-bold text-white">{mostPopularAnime.releaseDate ? new Date(mostPopularAnime.releaseDate).getFullYear() : 'N/A'}</p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 group-hover:border-anime-accent/20 transition-colors">
                               <p className="text-[10px] text-anime-text-dark font-black uppercase tracking-widest mb-2">Status</p>
                               <p className="text-3xl font-display font-bold text-anime-accent">Viral</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             )}
          </section>
        </AnimatePresence>
      )}
    </div>
  );
};

export default RecommendationPage;