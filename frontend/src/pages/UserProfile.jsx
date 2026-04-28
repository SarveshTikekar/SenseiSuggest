import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile, getUserScrapbook, getAnimeStats, getPendingRequests, processFriendRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import ScrapbookBook from '../components/Scrapbook/ScrapbookBook';
import ScrapbookDrawer from '../components/Scrapbook/ScrapbookDrawer';
import FriendSearchModal from '../components/FriendSearchModal';
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
  BookmarksSimple,
  Sword,
  ShieldCheck
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
  if (count >= 100) return { name: "ELITE", color: "text-[#D97706]", bg: "bg-[#D97706]/10", border: "border-[#D97706]/40", desc: "Top Tier Contributor" };
  if (count >= 50)  return { name: "MASTER", color: "text-[#DD0426]", bg: "bg-[#DD0426]/10", border: "border-[#DD0426]/40", desc: "Highly Experienced" };
  if (count >= 25)  return { name: "EXPERT", color: "text-[#BE233F]", bg: "bg-[#BE233F]/10", border: "border-[#BE233F]/40", desc: "Regular Contributor" };
  if (count >= 10)  return { name: "ADVANCED", color: "text-[#F5EBE0]", bg: "bg-white/5", border: "border-white/20", desc: "Active Member" };
  if (count >= 1)   return { name: "NOVICE", color: "text-[#AAAAAA]", bg: "bg-white/5", border: "border-white/10", desc: "New Member" };
  return { name: "BEGINNER", color: "text-[#666666]", bg: "bg-transparent", border: "border-dashed border-white/10", desc: "Initial Phase" };
};

const SkeletonProfile = () => (
  <div className="max-w-[1880px] mx-auto space-y-6">
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
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isFriendSearchOpen, setIsFriendSearchOpen] = useState(false);
  const { userId: currentUserId } = useAuth();

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

    // Fetch Pending Requests if it's the user's own profile
    if (userId && currentUserId && parseInt(userId) === currentUserId) {
      getPendingRequests(userId).then(setPendingRequests).catch(console.error);
    }
  }, [userId, currentUserId]); 

  const handleFriendAction = async (sender_id, action) => {
    try {
      await processFriendRequest({
        sender_id,
        receiver_id: currentUserId,
        action
      });
      // Refresh pending list
      const updated = await getPendingRequests(currentUserId);
      setPendingRequests(updated);
      // Also refresh profile to see new friends
      const profileRes = await getUserProfile(userId);
      setUserProfile(profileRes.UserProfile);
    } catch (err) {
      alert("Action failed: " + err.message);
    }
  };

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
          {/* Blurred Backdrop - Disabled on mobile for performance */}
          <img 
            src={anime.image_url_base_anime || 'https://placehold.co/400x600/131316/3A3A4A?text=No+Image'} 
            className="hidden sm:block absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-110 pointer-events-none"
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
            {list.length} Series
          </span>
        </div>
        
        {list.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayList.map((anime) => (
                <AnimeCard key={anime.animeId} anime={anime} />
              ))}
            </div>
            
            {hasMore && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-accent text-[#AAAAAA] uppercase tracking-[0.3em] hover:bg-white/5 transition-colors"
              >
                {isExpanded ? "Collapse View" : `View All ${list.length} Records`}
              </button>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 border border-dashed border-white/10 rounded-3xl">
             <p className="text-[#AAAAAA] text-lg font-hand">No records found in this category.</p>
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

      <div className="container mx-auto relative z-10 max-w-[1880px] px-4 md:px-8">
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
                        <span>{rank.name} ACCOUNT</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 w-full">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-accent text-[#AAAAAA] uppercase tracking-[0.2em]">Account Progress</span>
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
                          { name: 'Watching', value: animeStats?.watching || 0, color: '#FFB302' },
                          { name: 'Saved', value: animeStats?.bookmarked || 0, color: '#AAAAAA' },
                          { name: 'Remaining', value: Math.max(0, (animeStats?.total || 1000) - (animeStats?.watched || 0) - (animeStats?.watching || 0)), color: 'rgba(255,255,255,0.05)' }
                        ]}
                        cx="50%"
                        cy="100%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {[
                          { name: 'Watched', color: '#DD0426' },
                          { name: 'Watching', color: '#FFB302' },
                          { name: 'Saved', color: '#AAAAAA' },
                          { name: 'Remaining', color: 'rgba(255,255,255,0.05)' }
                        ].map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            style={{ filter: entry.name !== 'Remaining' ? 'drop-shadow(0 0 8px rgba(221,4,38,0.2))' : 'none' }}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-[#111] border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md">
                                <p className="text-[10px] font-accent font-black uppercase tracking-widest mb-1 text-white/40">Data Distribution</p>
                                <p className="text-sm font-display uppercase tracking-wider" style={{ color: payload[0].payload.color }}>
                                  {payload[0].name}: {payload[0].value}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center pb-2">
                     <p className="text-3xl font-display font-black text-[#F5EBE0] leading-none mb-1">{animeStats?.watched || 0}</p>
                     <p className="text-[9px] font-accent text-[#AAAAAA] uppercase tracking-[0.2em] font-bold">Total Records</p>
                  </div>
               </div>
               <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-[8px] font-accent uppercase tracking-widest font-black">
                  <span className="flex items-center gap-2 text-[#DD0426]"><span className="w-2 h-2 rounded-full bg-[#DD0426] shadow-[0_0_10px_rgba(221,4,38,0.5)]"></span> Watched</span>
                  <span className="flex items-center gap-2 text-[#FFB302]"><span className="w-2 h-2 rounded-full bg-[#FFB302] shadow-[0_0_10px_rgba(255,179,2,0.5)]"></span> Watching</span>
                  <span className="flex items-center gap-2 text-[#AAAAAA]"><span className="w-2 h-2 rounded-full bg-[#AAAAAA]"></span> Saved</span>
               </div>
            </Motion.div>

            {/* Col 3: Connections */}
            <Motion.div variants={itemVariants} className="ss-card rounded-[2.5rem] p-6 border border-white/10 bg-[#0D0D0D]/80 backdrop-blur-xl relative overflow-hidden group flex flex-col">
               <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                  <h3 className="text-[11px] font-accent text-[#F5EBE0] uppercase tracking-[0.2em] flex items-center gap-2">
                     <UserCircle size={16} className="text-[#DD0426]" weight="bold" /> Connections
                  </h3>
                  <span className="text-[10px] font-accent text-[#AAAAAA] opacity-50">
                    {userProfile.friends?.length || 0} active
                  </span>
               </div>
               
               <div className="space-y-4 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                  {/* Pending Section - Only visible on user's own profile */}
                  {parseInt(userId) === currentUserId && pendingRequests.length > 0 && (
                    <div className="space-y-2 mb-6">
                      <p className="text-[9px] font-accent text-[#DD0426] uppercase tracking-[0.2em] font-black mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#DD0426] animate-pulse" /> Pending Requests
                      </p>
                      {pendingRequests.map((req) => (
                        <div key={req.req_id} className="p-3 rounded-2xl bg-[#DD0426]/5 border border-[#DD0426]/20 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#DD0426]/30">
                              <img 
                                src={req.sender?.profilePicture || `https://ui-avatars.com/api/?name=${req.sender?.userName || 'U'}&background=DD0426&color=fff`} 
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            </div>
                            <span className="text-[11px] font-accent text-[#F5EBE0] font-bold">{req.sender?.userName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleFriendAction(req.sender_id, "ACCEPT")}
                              className="flex-grow py-1.5 bg-[#DD0426] hover:bg-[#A10A24] text-white text-[9px] font-accent uppercase tracking-widest rounded-lg transition-all"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleFriendAction(req.sender_id, "REJECT")}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[#AAAAAA] text-[9px] font-accent uppercase tracking-widest rounded-lg transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Connections List */}
                  {userProfile.friends && userProfile.friends.length > 0 ? (
                    userProfile.friends.map((friendId, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-transparent hover:border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group/item">
                         <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-[#111] flex items-center justify-center">
                            <UserCircle size={18} className="text-[#333] group-hover/item:text-[#DD0426] transition-colors" />
                         </div>
                         <div className="flex-grow min-w-0">
                            <p className="text-[11px] font-accent text-[#F5EBE0] truncate group-hover/item:text-[#DD0426] transition-colors">User #{friendId}</p>
                            <p className="text-[8px] font-accent text-[#AAAAAA] uppercase tracking-tighter opacity-60">Active Connection</p>
                         </div>
                         <div className="w-1 h-1 rounded-full bg-[#DD0426] opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </div>
                    ))
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center py-10 border border-dashed border-white/5 rounded-2xl opacity-40">
                       <UserCircle size={24} className="mb-2 text-[#AAAAAA]" />
                       <p className="text-[10px] font-accent text-[#AAAAAA] uppercase tracking-widest">No active connections found</p>
                    </div>
                  )}
               </div>
               
               <button 
                  onClick={() => setIsFriendSearchOpen(true)}
                  className="mt-4 w-full py-2 bg-white/5 rounded-xl text-[9px] font-accent text-[#AAAAAA] uppercase tracking-[0.2em] hover:bg-[#DD0426]/10 hover:text-[#DD0426] transition-all border border-white/5"
               >
                  Find Connections
               </button>
            </Motion.div>

            <FriendSearchModal 
              open={isFriendSearchOpen} 
              onClose={() => setIsFriendSearchOpen(false)} 
            />

          </div>


          {/* Structured Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
             
             {/* Cell 1: User Statistics */}
             <div className="bg-[#0D0D0D] p-10 lg:p-14 space-y-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 rounded-xl bg-[#DD0426]/10 flex items-center justify-center">
                      <Lightning size={28} weight="bold" className="text-[#DD0426]" />
                   </div>
                   <h3 className="text-3xl font-display text-[#F5EBE0] tracking-tight uppercase">User Statistics</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   {[
                     { label: 'Completed Series', value: userProfile.anime_watched_count || 0, icon: <Trophy />, color: 'text-[#DD0426]' },
                     { label: 'Currently Watching', value: userProfile.anime_watching_count || 0, icon: <Play />, color: 'text-[#F5EBE0]' },
                     { label: 'Saved Records', value: userProfile.anime_bookmarked_count || 0, icon: <BookmarksSimple />, color: 'text-[#D97706]' },
                     { label: 'Account Rank', value: `LVL ${Math.max(1, Math.floor((userProfile.anime_watched_count || 0) / 5))}`, icon: <Medal />, color: 'text-[#AAAAAA]' }
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
                     "Each record added is a milestone in your journey through the worlds of animation."
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

          {/* Gallery Section */}
          <div className="pt-20">
            <div className="flex flex-col items-center mb-16 space-y-4 text-center">
               <div className="w-16 h-px bg-[#DD0426]" />
               <h3 className="text-4xl md:text-5xl font-display font-black text-[#F5EBE0] tracking-tight uppercase">
                 Personal Gallery
               </h3>
               <p className="font-sans text-2xl text-[#AAAAAA] max-w-2xl opacity-80">
                 A visual record of your journey through the worlds of animation.
               </p>
               <div className="flex items-center gap-3 text-[10px] font-accent text-[#DD0426] uppercase tracking-[0.4em] pt-4">
                  <span className="w-2 h-2 rounded-full bg-[#DD0426] animate-pulse" />
                  {scrapbookEntries.length} Saved Moments
               </div>
            </div>
            
            <div className="max-w-[1880px] mx-auto">
              <div className="hidden lg:block">
                <ScrapbookBook 
                  entries={scrapbookEntries} 
                  username={userProfile.userName} 
                  rank={getOtakuRank(userProfile.anime_watched_count || 0).name}
                />
              </div>
              <div className="lg:hidden">
                <ScrapbookDrawer 
                  photos={scrapbookEntries}
                  loading={false}
                  onRemove={() => {}} // Remove not allowed from profile usually
                  onUpload={() => {}} // Upload not allowed from profile usually
                />
              </div>
            </div>
          </div>

        </Motion.div>
      </div>
    </div>
  );
}

export default UserProfilePage;