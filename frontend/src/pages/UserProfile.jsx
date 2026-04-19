import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile, getUserScrapbook, getAnimeStats } from '../api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import ScrapbookBook from '../components/Scrapbook/ScrapbookBook';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  TelevisionSimple,
  Trophy,
  Stack,
  ClockCounterClockwise,
  UserCircle,
  Play,
  WarningCircle,
  Lightning,
  Medal,
  BookmarksSimple
} from '@phosphor-icons/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
};

const getOtakuRank = (count) => {
  if (count >= 100) return { name: "SHŌGUN", kanji: "将軍", color: "text-[#D97706]", bg: "bg-[#D97706]/10", border: "border-[#D97706]/40", desc: "Supreme Commander" };
  if (count >= 50)  return { name: "DAIMYŌ", kanji: "大名", color: "text-[#DD0426]", bg: "bg-[#DD0426]/10", border: "border-[#DD0426]/40", desc: "Great Lord" };
  if (count >= 25)  return { name: "HATAMOTO", kanji: "旗本", color: "text-[#BE233F]", bg: "bg-[#BE233F]/10", border: "border-[#BE233F]/40", desc: "Elite Retainer" };
  if (count >= 10)  return { name: "SAMURAI", kanji: "侍", color: "text-[#F5EBE0]", bg: "bg-white/5", border: "border-white/20", desc: "Honorable Warrior" };
  if (count >= 1)   return { name: "ASHIGARU", kanji: "足軽", color: "text-[#AAAAAA]", bg: "bg-white/5", border: "border-white/10", desc: "Foot Soldier" };
  return { name: "RŌNIN", kanji: "浪人", color: "text-[#666666]", bg: "bg-transparent", border: "border-dashed border-white/10", desc: "Wandering soul" };
};

const SkeletonProfile = () => (
  <div className="max-w-screen-xl mx-auto space-y-6">
    {/* ID Card */}
    <div className="ss-card p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
      <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl ss-skeleton flex-shrink-0"></div>
      <div className="flex-grow space-y-3 w-full">
        <div className="flex gap-3">
          <div className="h-9 w-44 ss-skeleton rounded-lg"></div>
          <div className="h-6 w-20 ss-skeleton rounded-full mt-1.5"></div>
        </div>
        <div className="h-4 w-44 ss-skeleton rounded"></div>
        <div className="pt-3 space-y-1.5">
          <div className="flex justify-between w-60">
            <div className="h-3 w-28 ss-skeleton rounded"></div>
            <div className="h-3 w-8 ss-skeleton rounded"></div>
          </div>
          <div className="h-2 w-60 ss-skeleton rounded-full"></div>
        </div>
      </div>
    </div>
    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-24 ss-skeleton rounded-2xl"></div>)}
    </div>
    {/* Library */}
    <div className="space-y-10">
      <div className="h-7 w-44 ss-skeleton rounded"></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="ss-skeleton rounded-2xl" style={{ aspectRatio: '2/3' }}></div>
        ))}
      </div>
    </div>
  </div>
);

function UserProfilePage() {
  const { userId } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [animeStats, setAnimeStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scrapbookEntries, setScrapbookEntries] = useState([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(''); 
        const profileRes = await getUserProfile(userId);
        setUserProfile(profileRes.UserProfile); 
        
        // Fetch Stats
        const statsRes = await getAnimeStats(userId);
        setAnimeStats(statsRes);
      } catch (err) {
        setError(err.message || 'Failed to fetch user profile.');
      } finally {
        setLoading(false);
      }
      
      // Fetch Scrapbook
      try {
        const scrapRes = await getUserScrapbook(userId);
        if (scrapRes && scrapRes.data) {
          setScrapbookEntries(scrapRes.data);
        }
      } catch (e) {
        console.error("Scrapbook fetch error:", e);
      }
    };
    if (userId) fetchUserProfile();
  }, [userId]); 

  if (loading) {
    return (
      <div className="container mx-auto py-20 px-4">
        <SkeletonProfile />
      </div>
    );
  }

  if (error) return <div className="text-center p-8 text-[#EF4444] text-xl h-screen flex items-center justify-center font-bold font-display">{error}</div>;
  if (!userProfile) return <div className="text-center p-8 text-[#AAAAAA] text-xl h-screen flex items-center justify-center font-bold font-display">User Not Found.</div>;

  const profilePicSrc = userProfile.profilePicture || `https://ui-avatars.com/api/?name=${userProfile.userName}&background=FF2E93&color=fff&size=200`;
  const watchedCount = userProfile.anime_watched_count || 0;
  const rank = getOtakuRank(watchedCount);
  const getNextThreshold = (c) => {
    if (c >= 100) return c + 50; 
    if (c >= 50)  return 100;
    if (c >= 25)  return 50;
    if (c >= 10)  return 25;
    if (c >= 1)   return 10;
    return 1;
  };
  const nextRankCount = getNextThreshold(watchedCount);
  const progressPercent = Math.min((watchedCount / nextRankCount) * 100, 100);

  const AnimeCard = ({ anime }) => (
    <Motion.div variants={itemVariants} className="block group">
      <Link 
        to={`/anime/details/${encodeURIComponent(anime.animeName)}`} 
        className="ss-anime-card group"
      >
        <div className="ss-anime-card__img-container">
          {/* Blurred Backdrop */}
          <img 
            src={anime.image_url_base_anime || 'https://placehold.co/400x600/131316/3A3A4A?text=No+Image'} 
            className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-110 pointer-events-none"
            alt=""
            aria-hidden
          />
          <img
            src={anime.image_url_base_anime || 'https://placehold.co/400x600/131316/3A3A4A?text=No+Image'}
            alt={anime.animeName}
            className="ss-anime-card__img relative z-10"
            onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/400x600/131316/3A3A4A?text=Image+Missing';}}
          />
        </div>
        <div className="ss-anime-card__body">
          <p className="text-[#F5EBE0] group-hover:text-[#DD0426] text-[13px] font-black tracking-tight transition-colors line-clamp-1">
            {anime.animeName}
          </p>
          <p className="text-[11px] text-[#AAAAAA] font-medium">
            Sub | Dub
          </p>
        </div>
      </Link>
    </Motion.div>
  );

  const AnimeSection = ({ title, list, icon, color }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const displayList = isExpanded ? list : list.slice(0, 9);
    const hasMore = list.length > 9;

    return (
      <div className="bg-[#0D0D0D] p-10 lg:p-14 border-white/5 border-b lg:border-b-0">
        <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
          <h3 className="text-3xl font-display text-[#F5EBE0] tracking-tight flex items-center gap-4 uppercase">
            {React.cloneElement(icon, { size: 28, weight: "bold", className: color })} {title}
          </h3>
          <span className="text-[11px] font-accent text-[#AAAAAA] uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
            {list.length} Units
          </span>
        </div>
        
        {list.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-4">
              {displayList.map((anime) => (
                <AnimeCard key={anime.animeId} anime={anime} />
              ))}
            </div>
            
            {hasMore && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-accent text-[#AAAAAA] uppercase tracking-[0.3em] hover:bg-white/5 transition-colors"
              >
                {isExpanded ? "Collapse Archive" : `View All ${list.length} Records`}
              </button>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 border border-dashed border-white/10 rounded-3xl">
             <p className="text-[#AAAAAA] text-lg font-hand">No entries found in this sector.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen py-12 px-4 overflow-hidden font-sans">
      {/* Dynamic Background */}
      <Motion.div animate={{ y: [0, -40, 0], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 10, repeat: Infinity }} className="absolute -top-20 right-10 w-96 h-96 bg-kawaii-accent/20 blur-3xl rounded-full z-0 pointer-events-none" />
      <Motion.div animate={{ x: [0, 50, 0], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 12, repeat: Infinity }} className="absolute bottom-10 left-10 w-80 h-80 bg-kawaii-tertiary/20 blur-3xl rounded-full z-0 pointer-events-none" />

      <div className="container mx-auto relative z-10 max-w-[1640px] px-4 md:px-8">
        <Motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
          
          {/* 3-Column Header Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Col 1: ID Card */}
            <Motion.div variants={itemVariants} className="ss-card rounded-[2.5rem] p-6 border border-white/10 shadow-2xl flex flex-col items-center bg-[#0D0D0D]/80 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#DD0426]/5 blur-3xl rounded-full" />
              
              <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#DD0426] shadow-[0_0_30px_rgba(221,4,38,0.2)]">
                    <img src={profilePicSrc} alt={userProfile.userName} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-[#DD0426] text-white font-accent px-3 py-1.5 rounded-lg shadow-2xl text-[10px] border border-white/20 uppercase tracking-widest">
                    LVL {Math.floor(watchedCount / 5) + 1}
                  </div>
              </div>
              
              <div className="text-center space-y-4 w-full">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-display font-black text-[#F5EBE0] tracking-tight uppercase">
                      {userProfile.userName}
                    </h2>
                    <div className="inline-flex px-4 py-1 rounded-xl text-[9px] font-accent font-black uppercase tracking-[0.2em] border border-white/10 bg-white/5 text-[#AAAAAA] gap-2 items-center">
                        <span className="text-base opacity-80 font-serif">{rank.kanji}</span>
                        <span>{rank.name} CLASS</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 w-full">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-accent text-[#AAAAAA] uppercase tracking-[0.2em]">Ascension</span>
                        <span className="text-[10px] font-accent font-bold text-[#DD0426] tracking-widest">{watchedCount} / {nextRankCount}</span>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full border border-white/10 p-0.5 overflow-hidden">
                        <Motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 2 }} className="h-full bg-gradient-to-r from-[#DD0426] to-[#FF2E93] rounded-full" />
                    </div>
                  </div>
              </div>
            </Motion.div>

            {/* Col 2: Semicircular Stats Chart */}
            <Motion.div variants={itemVariants} className="ss-card rounded-[2.5rem] p-6 border border-white/10 bg-[#0D0D0D]/80 backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden">
               <div className="w-full h-40 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Watched', value: animeStats?.watched || 0, color: '#DD0426' },
                          { name: 'Watching', value: animeStats?.watching || 0, color: '#F5EBE0' },
                          { name: 'Bookmarked', value: animeStats?.bookmarked || 0, color: '#D97706' },
                          { name: 'Remaining', value: Math.max(0, (animeStats?.total || 1000) - (animeStats?.watched || 0) - (animeStats?.watching || 0)), color: 'rgba(255,255,255,0.05)' }
                        ]}
                        cx="50%"
                        cy="100%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {[
                          { name: 'Watched', color: '#DD0426' },
                          { name: 'Watching', color: '#F5EBE0' },
                          { name: 'Bookmarked', color: '#D97706' },
                          { name: 'Remaining', color: 'rgba(255,255,255,0.05)' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-1">
                     <p className="text-xl font-display text-[#F5EBE0] leading-none">{animeStats?.watched || 0}</p>
                     <p className="text-[8px] font-accent text-[#AAAAAA] uppercase tracking-widest">Records</p>
                  </div>
               </div>
               <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[7px] font-accent uppercase tracking-widest text-[#AAAAAA] opacity-60">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#DD0426]"></span> Watched</span>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#F5EBE0]"></span> Watching</span>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span> Saved</span>
               </div>
            </Motion.div>

            {/* Col 3: Battle Allies (Friends) */}
            <Motion.div variants={itemVariants} className="ss-card rounded-[2.5rem] p-6 border border-white/10 bg-[#0D0D0D]/80 backdrop-blur-xl relative overflow-hidden group flex flex-col">
               <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                  <h3 className="text-[11px] font-accent text-[#F5EBE0] uppercase tracking-[0.2em] flex items-center gap-2">
                     <UserCircle size={16} className="text-[#DD0426]" weight="bold" /> Battle Allies
                  </h3>
                  <span className="text-[10px] font-accent text-[#AAAAAA] opacity-50">4 active</span>
               </div>
               
               <div className="space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                  {userProfile.friends && userProfile.friends.length > 0 ? (
                    userProfile.friends.map((friend, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-transparent hover:border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group/item">
                         <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                            <img src={friend.img} alt="" className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all" />
                         </div>
                         <div className="flex-grow min-w-0">
                            <p className="text-[11px] font-accent text-[#F5EBE0] truncate group-hover/item:text-[#DD0426] transition-colors">{friend.name}</p>
                            <p className="text-[8px] font-accent text-[#AAAAAA] uppercase tracking-tighter opacity-60">{friend.rank}</p>
                         </div>
                         <div className="w-1 h-1 rounded-full bg-[#DD0426] animate-pulse" />
                      </div>
                    ))
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/5 rounded-2xl opacity-40">
                       <p className="text-[10px] font-accent text-[#AAAAAA] uppercase tracking-widest">No active allies found</p>
                    </div>
                  )}
               </div>
               
               <button className="mt-4 w-full py-2 bg-white/5 rounded-xl text-[9px] font-accent text-[#AAAAAA] uppercase tracking-[0.2em] hover:bg-[#DD0426]/10 hover:text-[#DD0426] transition-all border border-white/5">
                  Recruit Allies
               </button>
            </Motion.div>

          </div>


          {/* Structured War-Journal Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
             
             {/* Cell 1: Combat Stats */}
             <div className="bg-[#0D0D0D] p-10 lg:p-14 space-y-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 rounded-xl bg-[#DD0426]/10 flex items-center justify-center">
                      <Lightning size={28} weight="bold" className="text-[#DD0426]" />
                   </div>
                   <h3 className="text-3xl font-display text-[#F5EBE0] tracking-tight uppercase">Combat Portfolio</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   {[
                     { label: 'Victory Records (Watched)', value: userProfile.anime_watched_count || 0, icon: <Trophy />, color: 'text-[#DD0426]' },
                     { label: 'Active Missions (Watching)', value: userProfile.anime_watching_count || 0, icon: <Play />, color: 'text-[#F5EBE0]' },
                     { label: 'Strategic Intel (Saved)', value: userProfile.anime_bookmarked_count || 0, icon: <BookmarksSimple />, color: 'text-[#D97706]' },
                     { label: 'Tactical Seniority (Rank)', value: `LVL ${Math.max(1, Math.floor((userProfile.anime_watched_count || 0) / 5))}`, icon: <Medal />, color: 'text-[#AAAAAA]' }
                   ].map((stat, i) => (
                     <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all group">
                        <div className={`mb-4 ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`}>
                           {React.cloneElement(stat.icon, { size: 24, weight: 'bold' })}
                        </div>
                        <p className="text-[10px] font-accent text-[#AAAAAA] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <p className="text-3xl font-display text-[#F5EBE0]">{stat.value}</p>
                     </div>
                   ))}
                </div>

                <div className="p-8 rounded-3xl bg-[#DD0426]/5 border border-[#DD0426]/20">
                   <p className="font-hand text-xl text-[#F5EBE0]/80 leading-relaxed italic">
                     "The path of the Shōgun is paved with thousands of stories. Each record added is a step closer to supreme enlightenment."
                   </p>
                </div>
             </div>

             <AnimeSection 
                title="Watching Anime" 
                list={userProfile.watchingAnime || []} 
                icon={<Stack />} 
                color="text-[#DD0426]" 
             />

             <AnimeSection 
                title="Bookmarked Anime" 
                list={userProfile.bookmarkedAnime || []} 
                icon={<BookmarksSimple />} 
                color="text-[#D97706]" 
             />

             <AnimeSection 
                title="Watched Anime" 
                list={userProfile.watchedAnime || []} 
                icon={<Trophy />} 
                color="text-[#DD0426]" 
             />
          </div>

          {/* Scrapbook Section */}
          <div className="pt-20">
            <div className="flex flex-col items-center mb-16 space-y-4 text-center">
               <div className="w-16 h-px bg-[#DD0426]" />
               <h3 className="text-4xl md:text-5xl font-display font-black text-[#F5EBE0] tracking-tight uppercase">
                 The Shōgun's Scrapbook
               </h3>
               <p className="font-hand text-2xl text-[#AAAAAA] max-w-2xl">
                 A visual testament to your journey through the worlds of animation.
               </p>
               <div className="flex items-center gap-3 text-[10px] font-accent text-[#DD0426] uppercase tracking-[0.4em] pt-4">
                  <span className="w-2 h-2 rounded-full bg-[#DD0426] animate-pulse" />
                  {scrapbookEntries.length} Captured Moments
               </div>
            </div>
            
            <div className="max-w-screen-xl mx-auto">
              <ScrapbookBook 
                entries={scrapbookEntries} 
                username={userProfile.userName} 
                rank={getOtakuRank(userProfile.anime_watched_count || 0).name}
              />
            </div>
          </div>

        </Motion.div>
      </div>
    </div>
  );
}

export default UserProfilePage;