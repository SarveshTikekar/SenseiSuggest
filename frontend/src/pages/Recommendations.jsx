import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkle, 
  TrendUp, 
  Lightning, 
  Clock, 
  Play, 
  CheckCircle, 
  Info,
  CaretRight,
  Trophy,
  CalendarBlank,
  Browsers,
  ChartBar as ChartIcon
} from '@phosphor-icons/react';
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

const SkeletonHero = () => (
  <div className="ss-card h-[460px] mb-16 overflow-hidden animate-none">
    <div className="flex flex-col lg:flex-row h-full">
      <div className="w-full lg:w-1/2 h-full ss-skeleton"></div>
      <div className="w-full lg:w-1/2 p-10 space-y-5">
        <div className="h-4 w-28 ss-skeleton rounded-full"></div>
        <div className="h-12 w-3/4 ss-skeleton rounded-xl"></div>
        <div className="h-4 w-1/3 ss-skeleton rounded-full"></div>
        <div className="space-y-2.5 pt-4">
          <div className="h-4 w-full ss-skeleton rounded"></div>
          <div className="h-4 w-full ss-skeleton rounded"></div>
          <div className="h-4 w-2/3 ss-skeleton rounded"></div>
        </div>
        <div className="pt-8 flex gap-3">
          <div className="h-12 flex-1 ss-skeleton rounded-xl"></div>
          <div className="h-12 w-14 ss-skeleton rounded-xl"></div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonItem = () => (
  <div className="ss-card overflow-hidden">
    <div className="w-full aspect-[2/3] ss-skeleton"></div>
    <div className="p-6 space-y-3">
      <div className="h-3 w-1/4 ss-skeleton rounded"></div>
      <div className="h-6 w-3/4 ss-skeleton rounded"></div>
      <div className="h-4 w-full ss-skeleton rounded pt-3"></div>
      <div className="h-4 w-2/3 ss-skeleton rounded"></div>
      <div className="pt-4 flex gap-2">
        <div className="h-10 flex-1 ss-skeleton rounded-xl"></div>
        <div className="h-10 w-11 ss-skeleton rounded-xl"></div>
      </div>
    </div>
  </div>
);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Skeleton Header */}
        <div className="flex flex-col items-center mb-16 space-y-4 animate-pulse">
          <div className="h-4 w-32 bg-white/10 rounded-full"></div>
          <div className="h-16 w-96 bg-white/10 rounded-2xl"></div>
          <div className="h-6 w-64 bg-white/5 rounded-lg"></div>
        </div>

        {/* Skeleton Hero */}
        <SkeletonHero />

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[...Array(3)].map((_, i) => (
            <SkeletonItem key={i} />
          ))}
        </div>
      </div>
    );
  }

  const topPick = recommendedAnimeDetails[0];
  const otherPicks = recommendedAnimeDetails.slice(1);

  return (
    <div className="max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-8 py-12 font-inter selection:bg-anime-accent selection:text-white">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <span className="text-[#E8385A] text-[11px] font-mono font-black tracking-[0.3em] uppercase mb-3 block">Neural Recommendations</span>
        <h1 className="text-5xl md:text-6xl font-display font-black text-[#F0F0F5] leading-tight tracking-tight">
          Sensei <span className="text-[#E8385A] italic">Spotlight.</span>
        </h1>
        <p className="text-[#888895] mt-4 max-w-xl mx-auto text-sm font-sans leading-relaxed">
          Intelligence refined by your unique watch patterns.
        </p>
      </motion.div>

      {!userId ? (
        <div className="text-center p-16 bg-[#131316] rounded-3xl border border-[#222228] shadow-2xl backdrop-blur-sm ss-card">
          <Sparkle size={64} weight="bold" className="text-[#E8385A] mx-auto mb-6 opacity-40 shrink-0" />
          <h2 className="text-3xl font-display font-black text-[#F0F0F5] mb-2">Identify Yourself.</h2>
          <p className="text-[#888895] text-sm max-w-md mx-auto mb-8 leading-relaxed">
            Personalized intelligence requires a user profile. Log in to allow the Sensei to analyze your destiny.
          </p>
          <Link to="/login" className="ss-btn-primary px-8 py-3.5 rounded-xl font-bold inline-flex items-center gap-2">
            Proceed to Login
          </Link>
        </div>
      ) : (
        <AnimatePresence>
          {/* Sensei's Choice - Hero Spotlight */}
          {topPick && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-[2.5rem] overflow-hidden border border-[#222228] bg-[#0C0C0E] shadow-[0_40px_100px_rgba(0,0,0,0.6)] mb-24 group"
            >
              <div className="flex flex-col lg:flex-row items-stretch">
                {/* Hero Image */}
                <div className="w-full lg:w-1/2 h-[400px] lg:h-[640px] relative overflow-hidden bg-[#131316]">
                  {/* Blurred Backdrop */}
                  <img 
                    src={topPick.image_url_base_anime} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 pointer-events-none"
                    aria-hidden
                  />
                  <img 
                    src={topPick.image_url_base_anime} 
                    alt={topPick.animeName}
                    className="absolute inset-0 w-full h-full object-contain transition-transform duration-[1.5s] scale-100 group-hover:scale-105 z-10"
                    onError={(e) => { e.target.src=`https://placehold.co/800x1200/131316/3A3A4A?text=Post-Image` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0E] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0C0C0E]/40 z-20" />
                  <div className="absolute top-8 left-8 flex gap-3">
                    <span className="bg-[#E8385A] text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                      <Trophy size={14} weight="bold" /> Top Selection
                    </span>
                  </div>
                </div>

                <div className="w-full lg:w-1/2 p-10 lg:p-20 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 text-[#E8385A] font-mono text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                    <Lightning size={16} weight="bold" /> Compatibility High
                  </div>
                  
                  <h2 className="text-4xl lg:text-5xl font-display font-black text-[#F0F0F5] mb-4 leading-tight">
                    {topPick.animeName}
                  </h2>
                  
                  <div className="flex flex-wrap gap-2 mb-8 lowercase font-mono pb-8 border-b border-[#222228]">
                    {topPick.display_genres.map((genre, i) => (
                      <span key={i} className="text-[#888895] text-[11px] px-2 py-0.5 border border-[#222228] rounded">
                        #{genre.replace(/\s+/g, '') || genre}
                      </span>
                    ))}
                  </div>

                  <div className="bg-[#131316] border border-[#222228] p-6 rounded-2xl mb-10 shadow-inner">
                    <h4 className="text-[#3A3A4A] font-mono text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Info size={14} weight="bold" /> Neural Logic
                    </h4>
                    <p className="text-[#F0F0F5] text-sm font-sans leading-relaxed">
                      {topPick.sensei_reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-8 text-[#888895] text-[11px] mb-12 uppercase tracking-widest font-mono">
                     <span className="flex items-center gap-2"><CalendarBlank size={16} weight="bold" className="text-[#3A3A4A]" /> {topPick.releaseDate ? new Date(topPick.releaseDate).getFullYear() : 'Classic'}</span>
                     <span className="flex items-center gap-2"><Browsers size={16} weight="bold" className="text-[#3A3A4A]" /> {topPick.genre_count || topPick.display_genres.length} Nodes</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleStatusUpdate(topPick.animeId, 'watching')}
                      className="ss-btn-primary flex-1 py-4 justify-center"
                    >
                      <Play size={20} weight="fill" /> Track Progress
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(topPick.animeId, 'watched')}
                      className="w-16 h-16 border border-[#222228] rounded-2xl flex items-center justify-center hover:bg-white/5 transition-colors group"
                    >
                      <CheckCircle size={24} weight="bold" className="text-[#3A3A4A] group-hover:text-[#E8385A]" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <section className="mb-24">
            <div className="flex items-center justify-between mb-10 border-b border-[#222228] pb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#E8385A]/10 flex items-center justify-center">
                  <TrendUp size={24} weight="bold" className="text-[#E8385A]" />
                </div>
                <h3 className="text-2xl font-display font-black text-[#F0F0F5] tracking-tight">Handpicked Records</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {otherPicks.map((anime, idx) => (
                <motion.div 
                  key={anime.animeId || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="ss-anime-card group"
                >
                  <div className="ss-anime-card__img-container">
                    {/* Blurred Backdrop */}
                    <img 
                      src={anime.image_url_base_anime} 
                      className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 pointer-events-none"
                      alt=""
                      aria-hidden
                    />
                    <img 
                      src={anime.image_url_base_anime} 
                      className="relative z-10 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                      alt={anime.animeName}
                      onError={(e) => { e.target.src=`https://placehold.co/400x200/131316/3A3A4A?text=Missing+Intel` }}
                    />
                    <div className="absolute top-2 right-2 z-20">
                       <span className="bg-[#E8385A] px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-tighter border border-white/10 shadow-lg">
                         REC
                       </span>
                    </div>
                  </div>

                  <div className="ss-anime-card__body">
                    <h4 className="text-[13px] font-display font-black text-[#F0F0F5] mb-1 leading-tight group-hover:text-[#E8385A] transition-colors line-clamp-1 truncate">
                      {anime.animeName}
                    </h4>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-[#3A3A4A] font-medium leading-none">
                        Sub | Dub
                      </p>
                      {anime.rating && (
                        <div className="flex items-center gap-1 opacity-60">
                           <Star size={10} weight="fill" className="text-[#D97706]" />
                           <span className="text-[10px] text-[#888895] font-bold">{anime.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Analytics Visualizers */}
          <section className="mt-32">
             <div className="flex items-center gap-6 mb-16 justify-center">
                <div className="h-[1px] flex-grow max-w-[100px] bg-[#222228]"></div>
                <div className="flex items-center gap-4 text-center">
                   <ChartIcon size={32} weight="bold" className="text-[#E8385A]" />
                   <h3 className="text-3xl font-display font-black text-[#F0F0F5] tracking-tight">Intelligence <span className="text-[#E8385A]">Analysis.</span></h3>
                </div>
                <div className="h-[1px] flex-grow max-w-[100px] bg-[#222228]"></div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                 <motion.div 
                    whileInView={{ opacity: 1, x: 0 }}
                    initial={{ opacity: 0, x: -20 }}
                    className="lg:col-span-8 bg-[#131316] p-10 rounded-3xl border border-[#222228] shadow-2xl relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                       <Lightning size={160} weight="bold" className="text-[#F0F0F5]" />
                    </div>
                    <div className="flex justify-between items-center mb-8">
                       <h4 className="text-xl font-display font-black text-[#F0F0F5] flex items-center gap-3">
                          <Sparkle size={20} weight="bold" className="text-yellow-400" /> Global Genre Popularity
                       </h4>
                       <span className="text-[10px] font-mono text-[#3A3A4A] uppercase tracking-[0.3em]">Realtime Cluster Analysis</span>
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
                   className="lg:col-span-4 bg-[#131316] p-10 rounded-3xl border border-[#222228] shadow-2xl flex flex-col"
                >
                   <h4 className="text-xl font-display font-black text-[#F0F0F5] mb-10 flex items-center gap-3">
                      <Clock size={20} weight="bold" className="text-[#E8385A]" /> Density Map
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
                   
                   <div className="mt-8 p-6 bg-[#E8385A]/5 rounded-3xl border border-[#E8385A]/10">
                      <p className="text-[10px] text-[#E8385A] font-black uppercase tracking-[0.2em] mb-2">Algorithm Verdict</p>
                      <p className="text-xs text-[#888895] leading-relaxed font-sans opacity-95">The global user base is currently favoriting high-complexity narratives with 8+ scores.</p>
                   </div>
                </motion.div>
             </div>
          </section>

          {/* Hall of Fame - Most Popular overall */}
          <section className="mt-40 mb-32 text-center relative px-4">
             <div className="inline-block px-10 py-3 bg-[#131316] border border-[#222228] rounded-full mb-16">
                <span className="flex items-center gap-4 text-[10px] font-mono font-black uppercase tracking-[0.4em] text-[#888895]">
                   <CaretRight size={16} weight="bold" className="text-[#E8385A] animate-pulse" /> Legendary Picks <CaretRight size={16} weight="bold" className="text-[#E8385A] animate-pulse" />
                </span>
             </div>

             {mostPopularAnime && (
                <div className="max-w-5xl mx-auto relative group">
                   <div className="relative bg-[#131316] rounded-3xl border border-[#222228] p-10 lg:p-16 flex flex-col md:flex-row items-center gap-16 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
                      <div className="w-72 h-72 lg:w-96 lg:h-96 rounded-2xl overflow-hidden border border-[#222228] flex-shrink-0 group-hover:border-[#E8385A]/40 transition-all duration-500 bg-[#0C0C0E] relative flex items-center justify-center">
                         <img 
                           src={mostPopularAnime.image_url_base_anime} 
                           className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-50" 
                           alt={mostPopularAnime.animeName}
                         />
                      </div>
                      <div className="text-center md:text-left flex-grow">
                         <div className="flex flex-col md:flex-row items-center gap-6 mb-6 justify-center md:justify-start">
                            <h4 className="text-4xl lg:text-5xl font-display font-black text-[#F0F0F5] tracking-tight">{mostPopularAnime.animeName}</h4>
                            <div className="bg-[#E8385A]/10 text-[#E8385A] px-5 py-1.5 rounded-lg text-[10px] font-mono font-black tracking-widest border border-[#E8385A]/20 uppercase">
                               HALL OF FAME
                            </div>
                         </div>
                         <p className="text-[#888895] text-lg mb-10 leading-relaxed font-sans italic opacity-80">
                            The pinnacle of global narrative benchmarks. Consistently ranked at the apex.
                         </p>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="p-6 bg-[#0C0C0E] rounded-2xl border border-[#222228]">
                               <p className="text-[10px] text-[#3A3A4A] font-black uppercase tracking-widest mb-2">Positivity</p>
                               <p className="text-3xl font-display font-black text-[#F0F0F5]">{Math.round(mostPopularAnime["Positivity Percentage"] || 0)}%</p>
                            </div>
                            <div className="p-6 bg-[#0C0C0E] rounded-2xl border border-[#222228]">
                               <p className="text-[10px] text-[#3A3A4A] font-black uppercase tracking-widest mb-2">Records</p>
                               <p className="text-3xl font-display font-black text-[#F0F0F5]">{mostPopularAnime.releaseDate ? new Date(mostPopularAnime.releaseDate).getFullYear() : '2024'}</p>
                            </div>
                            <div className="p-6 bg-[#E8385A] rounded-2xl shadow-[0_10px_30px_rgba(232,56,90,0.3)] border border-white/10 text-white">
                               <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Status</p>
                               <p className="text-3xl font-display font-black">Viral</p>
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