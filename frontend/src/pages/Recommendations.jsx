import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkle, TrendUp, Lightning, Clock, Play, CheckCircle, Info,
  CaretRight, Trophy, CalendarBlank, Browsers, ChartBar as ChartIcon
} from '@phosphor-icons/react';
import { getRecommendations, updateWatchList } from '../api'; 
import { useAuth } from '../context/AuthContext'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SkeletonHero = () => (
  <div className="ss-card mb-12 overflow-hidden animate-none">
    <div className="flex flex-col lg:flex-row h-full">
      <div className="w-full lg:w-1/2 h-48 sm:h-64 lg:h-[500px] ss-skeleton" />
      <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10 space-y-4">
        <div className="h-3 w-24 ss-skeleton rounded-full" />
        <div className="h-10 w-3/4 ss-skeleton rounded-xl" />
        <div className="h-3 w-1/3 ss-skeleton rounded-full" />
        <div className="space-y-2 pt-3">
          <div className="h-3 w-full ss-skeleton rounded" />
          <div className="h-3 w-full ss-skeleton rounded" />
          <div className="h-3 w-2/3 ss-skeleton rounded" />
        </div>
        <div className="pt-6 flex gap-3">
          <div className="h-11 flex-1 ss-skeleton rounded-xl" />
          <div className="h-11 w-12 ss-skeleton rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

const SkeletonItem = () => (
  <div className="ss-card overflow-hidden">
    <div className="w-full aspect-[16/9] ss-skeleton" />
    <div className="p-4 space-y-2">
      <div className="h-3 w-1/4 ss-skeleton rounded" />
      <div className="h-5 w-3/4 ss-skeleton rounded" />
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
    if (!userId) { setLoading(false); return; }
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
        primary:    enrich(categorized.primary    || []),
        contextual: enrich(categorized.contextual || []),
        discovery:  enrich(categorized.discovery  || []),
        newest:     enrich(categorized.newest     || []),
      });
      setCategoryTitles(titles);

      const rawRatingsDistrib = response.ratings_distribution || {};
      setRatingDistribution(Array.from({ length: 10 }, (_, i) => i + 1).map(score => ({
        score, count: rawRatingsDistrib[score] || 0
      })));

      setGenrePopularity((response.Genre_anime_distrib || []).map(item => {
        const genreName = Object.keys(item)[0];
        return { genreName, animeCount: item[genreName] };
      }));
      setMostPopularAnime(response.most_popular_anime || null);
    } catch (err) {
      console.error('Error fetching all data:', err);
    } finally {
      setLoading(false); 
    }
  }, [userId]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const handleStatusUpdate = async (animeId, status) => {
    if (!animeId) return;
    try { await updateWatchList(userId, animeId, status); }
    catch (err) { console.error('Status update failed:', err); }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col items-center mb-10 sm:mb-16 space-y-3 animate-pulse">
          <div className="h-3 w-24 sm:w-32 bg-white/10 rounded-full" />
          <div className="h-10 sm:h-16 w-64 sm:w-96 bg-white/10 rounded-2xl" />
          <div className="h-4 sm:h-6 w-48 sm:w-64 bg-white/5 rounded-lg" />
        </div>
        <SkeletonHero />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => <SkeletonItem key={i} />)}
        </div>
      </div>
    );
  }

  const topPick = recommendedAnimeDetails[0] || categorizedRecoms.newest?.[0] || null;

  const categoryIcon = (key) => {
    if (key === 'primary')    return <TrendUp size={20} weight="bold" className="text-[#DD0426]" />;
    if (key === 'contextual') return <Sparkle size={20} weight="bold" className="text-[#DD0426]" />;
    if (key === 'newest')     return <Clock   size={20} weight="bold" className="text-[#DD0426]" />;
    return <Trophy size={20} weight="bold" className="text-[#DD0426]" />;
  };

  return (
    <div className="max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 selection:bg-[#DD0426] selection:text-white">

      {/* Page Header */}
      <Motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 sm:mb-16">
        <span className="text-[#DD0426] text-[10px] font-accent uppercase tracking-[0.3em] mb-2 sm:mb-3 block">
          Personalized Analytics
        </span>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-display text-[#F5EBE0] leading-tight tracking-tight">
          Sensei <span className="text-[#DD0426] italic">Recommendations.</span>
        </h1>
        <p className="text-[#AAAAAA] mt-3 sm:mt-4 max-w-xl mx-auto text-sm sm:text-base font-hand leading-relaxed opacity-80">
          Algorithmically refined by your unique watch patterns.
        </p>
      </Motion.div>

      {!userId ? (
        /* Auth gate */
        <div className="text-center p-8 sm:p-16 bg-white/[0.03] rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm ss-card">
          <Sparkle size={48} weight="bold" className="text-[#DD0426] mx-auto mb-5 opacity-40 shrink-0" />
          <h2 className="text-2xl sm:text-3xl font-display text-[#F5EBE0] mb-2">Authentication Required.</h2>
          <p className="text-[#AAAAAA] text-sm max-w-md mx-auto mb-8 leading-relaxed">
            Personalized recommendations require an active profile.
          </p>
          <Link to="/login" className="ss-btn-primary px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl inline-flex items-center gap-2">
            Proceed to Login
          </Link>
        </div>
      ) : (
        <AnimatePresence>

          {/* Hero Card */}
          {topPick && (
            <Motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0D0D0D] shadow-[0_40px_100px_rgba(0,0,0,0.6)] mb-12 sm:mb-24 group"
            >
              <div className="flex flex-col lg:flex-row items-stretch">
                {/* Poster */}
                <div className="w-full lg:w-1/2 h-56 sm:h-80 md:h-[420px] lg:h-[580px] relative overflow-hidden bg-[#1A1A1A] flex-shrink-0">
                  <img src={topPick.image_url_base_anime} alt="" aria-hidden
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 pointer-events-none" />
                  <img src={topPick.image_url_base_anime} alt={topPick.animeName}
                    className="absolute inset-0 w-full h-full object-contain transition-transform duration-[1.5s] scale-100 group-hover:scale-105 z-10"
                    onError={(e) => { e.target.src = 'https://placehold.co/800x1200/2A1F2D/BBAFB8?text=No+Image'; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0D0D0D]/40 z-20" />
                  <div className="absolute top-4 sm:top-8 left-4 sm:left-8 flex flex-wrap gap-2 z-30">
                    <span className="bg-[#DD0426] text-white px-3 sm:px-5 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-accent uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                      <Trophy size={12} weight="bold" /> {isColdStart ? 'Global Trending' : 'Top Selection'}
                    </span>
                    {isColdStart && (
                      <span className="bg-white/10 backdrop-blur-md text-white px-3 sm:px-5 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-accent uppercase tracking-widest shadow-xl border border-white/10">
                        Getting Started
                      </span>
                    )}
                  </div>
                </div>

                {/* Info panel */}
                <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-16 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 text-[#DD0426] font-accent text-[10px] uppercase tracking-[0.2em] mb-3 sm:mb-4">
                    <Lightning size={14} weight="bold" /> {isColdStart ? 'High Popularity' : 'Strong Compatibility'}
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display text-[#F5EBE0] mb-3 sm:mb-4 leading-tight">
                    {topPick.animeName}
                  </h2>
                  {topPick.display_genres?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5 sm:mb-8 lowercase font-accent pb-5 sm:pb-8 border-b border-white/10">
                      {topPick.display_genres.slice(0, 6).map((genre, i) => (
                        <span key={i} className="text-[#AAAAAA] text-[10px] sm:text-[11px] px-2 py-0.5 border border-white/10 rounded">
                          #{typeof genre === 'string' ? genre.replace(/\s+/g, '') : genre}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="bg-white/5 border border-white/10 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-6 sm:mb-10 shadow-inner">
                    <h4 className="text-[#AAAAAA] opacity-60 font-accent text-[10px] uppercase tracking-widest mb-2 sm:mb-3 flex items-center gap-2">
                      <Info size={13} weight="bold" /> {isColdStart ? 'Discovery Logic' : 'Algorithm Logic'}
                    </h4>
                    <p className="text-[#F5EBE0] text-sm sm:text-[1.2rem] font-hand leading-relaxed opacity-90">
                      {isColdStart ? 'As a new user, we recommend this series which has significantly influenced modern animation.' : (topPick.sensei_reason || 'Algorithmically selected based on your profile.')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-8 text-[#AAAAAA] text-[10px] sm:text-[11px] mb-6 sm:mb-12 uppercase tracking-widest font-accent">
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <CalendarBlank size={14} weight="bold" className="text-[#DD0426]" />
                      {topPick.releaseDate ? new Date(topPick.releaseDate).getFullYear() : 'Classic'}
                    </span>
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <Browsers size={14} weight="bold" className="text-[#DD0426]" />
                      {topPick.genre_count || topPick.display_genres?.length || 0} Nodes
                    </span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button onClick={() => handleStatusUpdate(topPick.animeId, 'watching')}
                      className="ss-btn-primary flex-1 py-3 sm:py-4 justify-center text-xs sm:text-sm">
                      <Play size={16} weight="fill" /> Track Progress
                    </button>
                    <button onClick={() => handleStatusUpdate(topPick.animeId, 'watched')}
                      className="w-12 h-12 sm:w-14 sm:h-14 border border-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-white/5 transition-colors group/chk flex-shrink-0">
                      <CheckCircle size={20} weight="bold" className="text-[#AAAAAA] group-hover/chk:text-[#DD0426]" />
                    </button>
                  </div>
                </div>
              </div>
            </Motion.div>
          )}

          {/* Category sections */}
          {Object.entries(categorizedRecoms).map(([key, list]) =>
            list.length > 0 && (
              <section key={key} className="mb-14 sm:mb-24">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10 border-b border-white/10 pb-4 sm:pb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#DD0426]/10 flex items-center justify-center flex-shrink-0">
                    {categoryIcon(key)}
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-display text-[#F5EBE0] tracking-tight">
                    {categoryTitles[key] || 'Discovery Hub'}
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 lg:gap-6">
                  {(key === 'newest' ? list : list.slice(0, 2)).map((anime, idx) => (
                    <Motion.div key={anime.animeId || `${key}-${idx}`}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * idx }} className="ss-anime-card group">
                      <div className="ss-anime-card__img-container">
                        <img src={anime.image_url_base_anime} alt="" aria-hidden
                          className="hidden sm:block absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 pointer-events-none" />
                        <img src={anime.image_url_base_anime} alt={anime.animeName}
                          className="relative z-10 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => { e.target.src = 'https://placehold.co/400x225/2A1F2D/BBAFB8?text=No+Image'; }} />
                        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20">
                          <span className="bg-[#DD0426] px-1.5 sm:px-2 py-0.5 rounded text-[7px] sm:text-[8px] font-accent text-white uppercase tracking-tighter border border-white/10 shadow-lg">
                            {key === 'newest' ? 'NEW' : isColdStart ? 'TREND' : 'MATCH'}
                          </span>
                        </div>
                      </div>
                      <div className="ss-anime-card__body">
                        <h4 className="text-[11px] sm:text-[12px] font-accent text-[#F5EBE0] mb-0.5 sm:mb-1 leading-tight group-hover:text-[#DD0426] transition-colors truncate uppercase">
                          {anime.animeName}
                        </h4>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-[9px] sm:text-[10px] text-[#AAAAAA] font-accent leading-none uppercase truncate">
                            {key === 'newest' && anime.releaseDate
                              ? new Date(anime.releaseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                              : 'Sub & Dub'}
                          </p>
                          {anime.rating && (
                            <div className="flex items-center gap-0.5 opacity-60 flex-shrink-0">
                              <span className="hidden sm:inline text-[9px] text-[#AAAAAA] font-accent uppercase tracking-tighter">SCORE</span>
                              <span className="text-[9px] sm:text-[10px] text-[#AAAAAA] font-bold">{anime.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Motion.div>
                  ))}
                </div>
              </section>
            )
          )}

          {/* Data Analytics */}
          <section className="mt-16 sm:mt-32">
            <div className="flex items-center gap-4 sm:gap-6 mb-10 sm:mb-16 justify-center">
              <div className="h-px flex-grow max-w-[60px] sm:max-w-[100px] bg-white/10" />
              <div className="flex items-center gap-3 sm:gap-4">
                <ChartIcon size={24} weight="bold" className="text-[#DD0426]" />
                <h3 className="text-2xl sm:text-4xl font-display text-[#F5EBE0] tracking-tight">
                  Data <span className="text-[#DD0426]">Analytics.</span>
                </h3>
              </div>
              <div className="h-px flex-grow max-w-[60px] sm:max-w-[100px] bg-white/10" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12">
              {/* Genre chart */}
              <Motion.div whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: -20 }}
                className="lg:col-span-8 bg-[#1A1A1A] p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-[#2A2A2A] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-[0.03]">
                  <Lightning size={100} weight="bold" className="text-[#F5EBE0]" />
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 mb-5 sm:mb-8">
                  <h4 className="text-lg sm:text-2xl font-display text-[#F5EBE0] flex items-center gap-2 sm:gap-3">
                    <Sparkle size={16} weight="bold" className="text-yellow-400" /> Global Genre Popularity
                  </h4>
                  <span className="text-[10px] font-accent text-[#8D7F8B] uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                    Realtime Cluster Analysis
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={genrePopularity} margin={{ top: 10, bottom: 30, left: 0, right: 0 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DD0426" stopOpacity={1} />
                        <stop offset="95%" stopColor="#8E1B34" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0D0D0D" />
                    <XAxis dataKey="genreName" stroke="#9A8C98" tick={{ fill: '#AAAAAA', fontSize: 9 }}
                      angle={-40} textAnchor="end" height={55} axisLine={false} />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#222222', border: '1px solid #2A2A2A', borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="animeCount" radius={[6, 6, 0, 0]} barSize={20}>
                      {genrePopularity.map((_, index) => (
                        <Cell key={`cell-${index}`} fill="url(#colorCount)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Motion.div>

              {/* Rating density */}
              <Motion.div whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: 30 }}
                className="lg:col-span-4 bg-[#1A1A1A] p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-[#2A2A2A] shadow-2xl flex flex-col">
                <h4 className="text-lg sm:text-2xl font-display text-[#F5EBE0] mb-6 sm:mb-10 flex items-center gap-2 sm:gap-3">
                  <Clock size={18} weight="bold" className="text-[#DD0426]" /> Density Map
                </h4>
                <div className="flex-grow space-y-4 sm:space-y-8">
                  {ratingDistribution.slice().reverse().slice(0, 5).map((r, idx) => {
                    const maxCount = Math.max(...ratingDistribution.map(rd => rd.count)) || 1;
                    const pct = Math.round((r.count / maxCount) * 100);
                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-accent uppercase tracking-widest text-[#AAAAAA] px-1">
                          <span>Rating {r.score}</span>
                          <span className="text-[#DD0426]">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <Motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className="h-full bg-gradient-to-r from-[#DD0426] to-[#A10A24] rounded-full shadow-[0_0_10px_rgba(221,4,38,0.45)]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-[#DD0426]/5 rounded-2xl sm:rounded-3xl border border-[#DD0426]/10">
                  <p className="text-[10px] text-[#DD0426] font-accent uppercase tracking-[0.2em] mb-1.5 sm:mb-2">Trend Analysis</p>
                  <p className="text-sm sm:text-[1.2rem] text-[#AAAAAA] leading-relaxed font-hand opacity-95">
                    The global user base is currently favoriting high-complexity narratives with 8+ scores.
                  </p>
                </div>
              </Motion.div>
            </div>
          </section>

          {/* Hall of Fame */}
          <section className="mt-20 sm:mt-40 mb-16 sm:mb-32 text-center relative">
            <div className="inline-block px-5 sm:px-10 py-2.5 sm:py-3 bg-white/[0.03] border border-white/10 rounded-full mb-10 sm:mb-16 backdrop-blur-3xl">
              <span className="flex items-center gap-3 sm:gap-4 text-[10px] font-accent uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#AAAAAA]">
                <CaretRight size={13} weight="bold" className="text-[#DD0426] animate-pulse" />
                Top Rated
                <CaretRight size={13} weight="bold" className="text-[#DD0426] animate-pulse" />
              </span>
            </div>

            {mostPopularAnime && (
              <div className="max-w-5xl mx-auto relative group">
                <div className="relative bg-white/[0.03] rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-10 lg:p-16 flex flex-col md:flex-row items-center gap-8 sm:gap-10 md:gap-16 shadow-[0_40px_120px_rgba(0,0,0,0.6)] backdrop-blur-md">
                  {/* Image */}
                  <div className="w-36 h-36 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 group-hover:border-[#DD0426]/40 transition-all duration-500 bg-[#0D0D0D] relative">
                    <img src={mostPopularAnime.image_url_base_anime} alt={mostPopularAnime.animeName}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-50" />
                  </div>
                  {/* Text */}
                  <div className="text-center md:text-left flex-grow min-w-0">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-4 sm:mb-6 justify-center md:justify-start flex-wrap">
                      <h4 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display text-[#F5EBE0] tracking-tight leading-tight">
                        {mostPopularAnime.animeName}
                      </h4>
                      <div className="bg-[#DD0426]/10 text-[#DD0426] px-3 sm:px-5 py-1 rounded-lg text-[9px] sm:text-[10px] font-accent tracking-widest border border-[#DD0426]/20 uppercase flex-shrink-0">
                        TOP RATED
                      </div>
                    </div>
                    <p className="text-[#AAAAAA] text-sm sm:text-[1.2rem] mb-6 sm:mb-10 leading-relaxed font-hand italic opacity-80">
                      The pinnacle of global narrative benchmarks. Consistently ranked at the apex.
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:gap-6">
                      <div className="p-3 sm:p-6 bg-black/20 rounded-xl sm:rounded-2xl border border-white/10">
                        <p className="text-[8px] sm:text-[10px] text-[#AAAAAA] opacity-60 font-accent uppercase tracking-widest mb-1 sm:mb-2">Positivity</p>
                        <p className="text-lg sm:text-3xl font-display text-[#F5EBE0]">{Math.round(mostPopularAnime['Positivity Percentage'] || 0)}%</p>
                      </div>
                      <div className="p-3 sm:p-6 bg-black/20 rounded-xl sm:rounded-2xl border border-white/10">
                        <p className="text-[8px] sm:text-[10px] text-[#AAAAAA] opacity-60 font-accent uppercase tracking-widest mb-1 sm:mb-2">Year</p>
                        <p className="text-lg sm:text-3xl font-display text-[#F5EBE0]">
                          {mostPopularAnime.releaseDate ? new Date(mostPopularAnime.releaseDate).getFullYear() : '—'}
                        </p>
                      </div>
                      <div className="p-3 sm:p-6 bg-[#DD0426] rounded-xl sm:rounded-2xl shadow-[0_10px_30px_rgba(221,4,38,0.3)] border border-white/10">
                        <p className="text-[8px] sm:text-[10px] font-accent uppercase tracking-widest mb-1 sm:mb-2 opacity-60 text-white">Status</p>
                        <p className="text-lg sm:text-3xl font-display text-[#F5EBE0]">Popular</p>
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
