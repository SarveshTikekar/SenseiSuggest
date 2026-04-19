import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
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
  const [categorizedRecoms, setCategorizedRecoms] = useState({});
  const [categoryTitles, setCategoryTitles] = useState({});
  const [isColdStart, setIsColdStart] = useState(false);
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [genrePopularity, setGenrePopularity] = useState([]);
  const [mostPopularAnime, setMostPopularAnime] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    if (!userId) { 
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getRecommendations(userId); 
      
      const recommendationsData = response.recommendations || [];
      const categorized = response.categorized || {};
      const titles = response.category_titles || {};
      setIsColdStart(response.is_cold_start || false);

      const enrich = (list) => list.filter(Boolean).map((anime) => ({
        ...anime,
        animeId: anime.animeId || anime.animeid,
        display_genres: Array.isArray(anime.genres) ? anime.genres : 
                        (anime.anime_genres?.map(g => g.genres?.name).filter(Boolean) || [])
      }));

      setRecommendedAnimeDetails(enrich(recommendationsData)); 
      setCategorizedRecoms({
        primary: enrich(categorized.primary || []),
        contextual: enrich(categorized.contextual || []),
        discovery: enrich(categorized.discovery || [])
      });
      setCategoryTitles(titles);

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
    } finally {
      setLoading(false); 
    }
  }, [userId]);

  useEffect(() => {
    fetchAllData(); 
  }, [fetchAllData]);

  const handleStatusUpdate = async (animeId, status) => {
    if (!animeId) return;
    try {
      await updateWatchList(userId, animeId, status);
    } catch (err) {
      console.error("Status update failed:", err);
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

  return (
    <div className="max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-8 py-12 font-inter selection:bg-anime-accent selection:text-white">
      
      {/* Header Section */}
      <Motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <span className="text-[#DD0426] text-[11px] font-mono font-black tracking-[0.3em] uppercase mb-3 block">Neural Recommendations</span>
        <h1 className="text-5xl md:text-6xl font-display font-black text-[#F5EBE0] leading-tight tracking-tight">
          Sensei <span className="text-[#DD0426] italic">Spotlight.</span>
        </h1>
        <p className="text-[#AAAAAA] mt-4 max-w-xl mx-auto text-sm font-sans leading-relaxed">
          Intelligence refined by your unique watch patterns.
        </p>
      </Motion.div>

      {!userId ? (
        <div className="text-center p-16 bg-white/[0.03] rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm ss-card">
          <Sparkle size={64} weight="bold" className="text-[#DD0426] mx-auto mb-6 opacity-40 shrink-0" />
          <h2 className="text-3xl font-display font-black text-[#F5EBE0] mb-2">Identify Yourself.</h2>
          <p className="text-[#AAAAAA] text-sm max-w-md mx-auto mb-8 leading-relaxed">
            Personalized intelligence requires a user profile. Log in to allow the Sensei to analyze your destiny.
          </p>
          <Link to="/login" className="ss-btn-primary px-8 py-3.5 rounded-xl font-bold inline-flex items-center gap-2">
            Proceed to Login
          </Link>
        </div>
      ) : (
        <AnimatePresence>
          {topPick && (
            <Motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0D0D0D] shadow-[0_40px_100px_rgba(0,0,0,0.6)] mb-24 group"
            >
              <div className="flex flex-col lg:flex-row items-stretch">
                <div className="w-full lg:w-1/2 h-[400px] lg:h-[640px] relative overflow-hidden bg-[#1A1A1A]">
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
                      onError={(e) => { e.target.src=`https://placehold.co/800x1200/2A1F2D/BBAFB8?text=Post-Image` }}
                    />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0D0D0D]/40 z-20" />
                  <div className="absolute top-8 left-8 flex gap-3 z-30">
                    <span className="bg-[#DD0426] text-white px-5 py-1.5 rounded-full text-[10px] font-accent uppercase tracking-widest shadow-xl flex items-center gap-2">
                      <Trophy size={14} weight="bold" /> {isColdStart ? "Global Apex" : "Top Selection"}
                    </span>
                    {isColdStart && (
                      <span className="bg-white/10 backdrop-blur-md text-white px-5 py-1.5 rounded-full text-[10px] font-accent uppercase tracking-widest shadow-xl border border-white/10">
                        New User Special
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full lg:w-1/2 p-10 lg:p-20 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 text-[#DD0426] font-accent text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                    <Lightning size={16} weight="bold" /> {isColdStart ? "High Viral Potential" : "Compatibility High"}
                  </div>
                  
                  <h2 className="text-4xl lg:text-5xl font-display font-black text-[#F5EBE0] mb-4 leading-tight">
                    {topPick.animeName}
                  </h2>
                  
                  <div className="flex flex-wrap gap-2 mb-8 lowercase font-accent pb-8 border-b border-white/10">
                    {topPick.display_genres.map((genre, i) => (
                      <span key={i} className="text-[#AAAAAA] text-[11px] px-2 py-0.5 border border-white/10 rounded">
                        #{genre.replace(/\s+/g, '') || genre}
                      </span>
                    ))}
                  </div>

                  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-10 shadow-inner">
                    <h4 className="text-[#AAAAAA] opacity-60 font-accent text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Info size={14} weight="bold" /> {isColdStart ? "Discovery Logic" : "Neural Logic"}
                    </h4>
                    <p className="text-[#F5EBE0] text-[1.4rem] font-hand leading-relaxed">
                      {isColdStart 
                        ? "As a new initiate, the Sensei recommends this masterpiece which has defined the current era of animation."
                        : topPick.sensei_reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-8 text-[#AAAAAA] text-[11px] mb-12 uppercase tracking-widest font-accent">
                     <span className="flex items-center gap-2"><CalendarBlank size={16} weight="bold" className="text-[#DD0426]" /> {topPick.releaseDate ? new Date(topPick.releaseDate).getFullYear() : 'Classic'}</span>
                     <span className="flex items-center gap-2"><Browsers size={16} weight="bold" className="text-[#DD0426]" /> {topPick.genre_count || topPick.display_genres.length} Nodes</span>
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
                      className="w-16 h-16 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/5 transition-colors group"
                    >
                      <CheckCircle size={24} weight="bold" className="text-[#AAAAAA] group-hover:text-[#DD0426]" />
                    </button>
                  </div>
                </div>
              </div>
            </Motion.div>
          )}

          {Object.entries(categorizedRecoms).map(([key, list]) => (
            list.length > 0 && (
              <section key={key} className="mb-24">
                <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#DD0426]/10 flex items-center justify-center">
                      {key === 'primary' ? <TrendUp size={24} weight="bold" className="text-[#DD0426]" /> :
                       key === 'contextual' ? <Sparkle size={24} weight="bold" className="text-[#DD0426]" /> :
                       <Trophy size={24} weight="bold" className="text-[#DD0426]" />}
                    </div>
                    <h3 className="text-3xl font-display text-[#F5EBE0] tracking-tight">
                      {categoryTitles[key] || "Discovery Hub"}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {list.map((anime, idx) => (
                    <Motion.div 
                      key={anime.animeId || `${key}-${idx}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * idx }}
                      className="ss-anime-card group"
                    >
                      <div className="ss-anime-card__img-container">
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
                          onError={(e) => { e.target.src=`https://placehold.co/400x200/2A1F2D/BBAFB8?text=Missing+Intel` }}
                        />
                        <div className="absolute top-2 right-2 z-20">
                           <span className="bg-[#DD0426] px-2 py-0.5 rounded text-[8px] font-accent text-white uppercase tracking-tighter border border-white/10 shadow-lg">
                             {isColdStart ? "TREND" : "MATCH"}
                           </span>
                        </div>
                      </div>

                      <div className="ss-anime-card__body">
                        <h4 className="text-[12px] font-accent text-[#F5EBE0] mb-1 leading-tight group-hover:text-[#DD0426] transition-colors line-clamp-1 truncate uppercase">
                          {anime.animeName}
                        </h4>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-[#AAAAAA] font-accent leading-none uppercase">
                            Sub | Dub
                          </p>
                          {anime.rating && (
                            <div className="flex items-center gap-1 opacity-60">
                               <span className="text-[10px] text-[#AAAAAA] font-accent uppercase tracking-tighter">SCORE</span>
                               <span className="text-[10px] text-[#AAAAAA] font-bold">{anime.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Motion.div>
                  ))}
                </div>
              </section>
            )
          ))}

          <section className="mt-32">
             <div className="flex items-center gap-6 mb-16 justify-center">
                <div className="h-[1px] flex-grow max-w-[100px] bg-white/10"></div>
                <div className="flex items-center gap-4 text-center">
                   <ChartIcon size={32} weight="bold" className="text-[#DD0426]" />
                   <h3 className="text-4xl font-display text-[#F5EBE0] tracking-tight">Intelligence <span className="text-[#DD0426]">Analysis.</span></h3>
                </div>
                <div className="h-[1px] flex-grow max-w-[100px] bg-white/10"></div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                 <Motion.div 
                    whileInView={{ opacity: 1, x: 0 }}
                    initial={{ opacity: 0, x: -20 }}
                    className="lg:col-span-8 bg-[#1A1A1A] p-10 rounded-3xl border border-[#2A2A2A] shadow-2xl relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                       <Lightning size={160} weight="bold" className="text-[#F5EBE0]" />
                    </div>
                    <div className="flex justify-between items-center mb-8">
                       <h4 className="text-2xl font-display text-[#F5EBE0] flex items-center gap-3">
                          <Sparkle size={20} weight="bold" className="text-yellow-400" /> Global Genre Popularity
                       </h4>
                       <span className="text-[10px] font-accent text-[#8D7F8B] uppercase tracking-[0.3em]">Realtime Cluster Analysis</span>
                    </div>

                   <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={genrePopularity} margin={{ top: 20, bottom: 20 }}>
                         <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#DD0426" stopOpacity={1}/>
                               <stop offset="95%" stopColor="#8E1B34" stopOpacity={0.8}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0D0D0D" />
                         <XAxis 
                           dataKey="genreName" 
                           stroke="#9A8C98" 
                           tick={{ fill: '#AAAAAA', fontSize: 10 }}
                           angle={-45} 
                           textAnchor="end"
                           height={60}
                           axisLine={false}
                         />
                         <YAxis hide />
                         <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#222222', border: '1px solid #2A2A2A', borderRadius: '12px', fontSize: '12px' }}
                         />
                         <Bar dataKey="animeCount" radius={[8, 8, 0, 0]} barSize={25}>
                            {genrePopularity.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={`url(#colorCount)`} />
                            ))}
                         </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </Motion.div>

                <Motion.div 
                   whileInView={{ opacity: 1, x: 0 }}
                   initial={{ opacity: 0, x: 30 }}
                   className="lg:col-span-4 bg-[#1A1A1A] p-10 rounded-3xl border border-[#2A2A2A] shadow-2xl flex flex-col"
                >
                   <h4 className="text-2xl font-display text-[#F5EBE0] mb-10 flex items-center gap-3">
                      <Clock size={20} weight="bold" className="text-[#DD0426]" /> Density Map
                   </h4>
                   
                   <div className="flex-grow space-y-8">
                      {ratingDistribution.slice().reverse().slice(0, 5).map((r, idx) => (
                         <div key={idx} className="space-y-3">
                           <div className="flex justify-between text-[10px] font-accent uppercase tracking-widest text-anime-text-light px-1">
                              <span>Rating {r.score}</span>
                              <span className="text-[#DD0426]">{Math.round((r.count / (Math.max(...ratingDistribution.map(rd => rd.count)) || 1)) * 100)}%</span>
                           </div>
                           <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                              <Motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${(r.count / (Math.max(...ratingDistribution.map(rd => rd.count)) || 1)) * 100}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className="h-full bg-gradient-to-r from-[#DD0426] to-[#A10A24] rounded-full shadow-[0_0_10px_rgba(221,4,38,0.45)]"
                              />
                           </div>
                         </div>
                      ))}
                   </div>
                   
                   <div className="mt-8 p-6 bg-[#DD0426]/5 rounded-3xl border border-[#DD0426]/10">
                      <p className="text-[10px] text-[#DD0426] font-accent uppercase tracking-[0.2em] mb-2">Algorithm Verdict</p>
                      <p className="text-[1.2rem] text-[#AAAAAA] leading-relaxed font-hand opacity-95">The global user base is currently favoriting high-complexity narratives with 8+ scores.</p>
                   </div>
                </Motion.div>
             </div>
          </section>

          {/* Hall of Fame - Most Popular overall */}
          <section className="mt-40 mb-32 text-center relative px-4">
             <div className="inline-block px-10 py-3 bg-white/[0.03] border border-white/10 rounded-full mb-16 backdrop-blur-3xl">
                <span className="flex items-center gap-4 text-[10px] font-accent uppercase tracking-[0.4em] text-[#AAAAAA]">
                   <CaretRight size={16} weight="bold" className="text-[#DD0426] animate-pulse" /> Legendary Picks <CaretRight size={16} weight="bold" className="text-[#DD0426] animate-pulse" />
                </span>
             </div>

             {mostPopularAnime && (
                <div className="max-w-5xl mx-auto relative group">
                   <div className="relative bg-white/[0.03] rounded-3xl border border-white/10 p-10 lg:p-16 flex flex-col md:flex-row items-center gap-16 shadow-[0_40px_120px_rgba(0,0,0,0.6)] backdrop-blur-md">
                      <div className="w-72 h-72 lg:w-96 lg:h-96 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 group-hover:border-[#DD0426]/40 transition-all duration-500 bg-[#0D0D0D] relative flex items-center justify-center">
                         <img 
                           src={mostPopularAnime.image_url_base_anime} 
                           className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-50" 
                           alt={mostPopularAnime.animeName}
                         />
                      </div>
                      <div className="text-center md:text-left flex-grow">
                         <div className="flex flex-col md:flex-row items-center gap-6 mb-6 justify-center md:justify-start">
                            <h4 className="text-4xl lg:text-6xl font-display text-[#F5EBE0] tracking-tight">{mostPopularAnime.animeName}</h4>
                            <div className="bg-[#DD0426]/10 text-[#DD0426] px-5 py-1.5 rounded-lg text-[10px] font-accent tracking-widest border border-[#DD0426]/20 uppercase">
                               HALL OF FAME
                            </div>
                         </div>
                         <p className="text-[#AAAAAA] text-[1.4rem] mb-10 leading-relaxed font-hand italic opacity-80">
                            The pinnacle of global narrative benchmarks. Consistently ranked at the apex.
                         </p>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="p-6 bg-black/20 rounded-2xl border border-white/10">
                               <p className="text-[10px] text-[#AAAAAA] opacity-60 font-accent uppercase tracking-widest mb-2">Positivity</p>
                               <p className="text-3xl font-display text-[#F5EBE0]">{Math.round(mostPopularAnime["Positivity Percentage"] || 0)}%</p>
                            </div>
                            <div className="p-6 bg-black/20 rounded-2xl border border-white/10">
                               <p className="text-[10px] text-[#AAAAAA] opacity-60 font-accent uppercase tracking-widest mb-2">Records</p>
                               <p className="text-3xl font-display text-[#F5EBE0]">{mostPopularAnime.releaseDate ? new Date(mostPopularAnime.releaseDate).getFullYear() : '2024'}</p>
                            </div>
                            <div className="p-6 bg-[#DD0426] rounded-2xl shadow-[0_10px_30px_rgba(221,4,38,0.3)] border border-white/10 text-white">
                               <p className="text-[10px] font-accent uppercase tracking-widest mb-2 opacity-60">Status</p>
                               <p className="text-3xl font-display text-[#F5EBE0]">Viral</p>
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
