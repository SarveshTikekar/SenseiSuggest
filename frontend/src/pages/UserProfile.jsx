import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
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
  Medal
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
  if (count >= 50) return { name: "Sensei", color: "text-[#E8385A]", bg: "bg-[#E8385A]/10" };
  if (count >= 25) return { name: "Pro", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" };
  if (count >= 10) return { name: "Enthusiast", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" };
  return { name: "Watcher", color: "text-[#10B981]", bg: "bg-[#10B981]/10" };
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(''); 
        const response = await getUserProfile(userId);
        setUserProfile(response.UserProfile); 
      } catch (err) {
        setError(err.message || 'Failed to fetch user profile.');
      } finally {
        setLoading(false);
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
  if (!userProfile) return <div className="text-center p-8 text-[#888895] text-xl h-screen flex items-center justify-center font-bold font-display">User Not Found.</div>;

  const profilePicSrc = userProfile.profilePicture || `https://ui-avatars.com/api/?name=${userProfile.userName}&background=FF2E93&color=fff&size=200`;
  const watchedCount = userProfile.anime_watched_count || 0;
  const rank = getOtakuRank(watchedCount);
  const nextRankCount = watchedCount >= 50 ? 100 : (watchedCount >= 25 ? 50 : (watchedCount >= 10 ? 25 : 10));
  const progressPercent = Math.min((watchedCount / nextRankCount) * 100, 100);

  const AnimeCard = ({ anime }) => (
    <motion.div variants={itemVariants} className="block group">
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
          <p className="text-[#F0F0F5] group-hover:text-[#E8385A] text-[13px] font-black tracking-tight transition-colors line-clamp-1">
            {anime.animeName}
          </p>
          <p className="text-[11px] text-[#3A3A4A] font-medium">
            Sub | Dub
          </p>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen py-12 px-4 overflow-hidden font-sans">
      {/* Dynamic Background */}
      <motion.div animate={{ y: [0, -40, 0], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 10, repeat: Infinity }} className="absolute -top-20 right-10 w-96 h-96 bg-kawaii-accent/20 blur-3xl rounded-full z-0 pointer-events-none" />
      <motion.div animate={{ x: [0, 50, 0], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 12, repeat: Infinity }} className="absolute bottom-10 left-10 w-80 h-80 bg-kawaii-tertiary/20 blur-3xl rounded-full z-0 pointer-events-none" />

      <div className="container mx-auto relative z-10 max-w-[1640px] px-4 md:px-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          
          {/* Header Card: The ID Card Experience */}
          <motion.div variants={itemVariants} className="ss-card rounded-[2rem] p-6 md:p-8 border border-[#222228] shadow-2xl flex flex-col md:flex-row gap-8 items-center bg-[#131316]">
             <div className="relative">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2 border-[#E8385A] shadow-[0_0_20px_rgba(232,56,90,0.3)]">
                   <img src={profilePicSrc} alt={userProfile.userName} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#0C0C0E] text-[#F0F0F5] font-black px-2 py-1 rounded-lg shadow-lg text-[10px] border border-[#E8385A]/40 uppercase tracking-widest">
                   LVL {Math.floor(watchedCount / 5) + 1}
                </div>
             </div>
             
             <div className="flex-grow text-center md:text-left space-y-3">
                <div className="flex flex-col md:flex-row items-center gap-3">
                   <h2 className="text-3xl md:text-4xl font-display font-black text-[#F0F0F5] tracking-tight leading-none">
                      {userProfile.userName}
                   </h2>
                   <div className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${rank.bg} ${rank.color} border-[#222228]`}>
                      {rank.name} CLASS
                   </div>
                </div>
                <p className="text-[#888895] text-[13px] font-mono flex items-center justify-center md:justify-start gap-2 opacity-80">
                   <UserCircle size={14} weight="bold" className="text-[#3A3A4A]" />
                   {userProfile.email}
                </p>
                
                {/* Leveling System */}
                <div className="mt-4 pt-4 border-t border-[#222228] w-full max-w-sm mx-auto md:mx-0">
                   <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-mono text-[#3A3A4A] uppercase tracking-widest">Next Class: {nextRankCount} Items</span>
                       <span className="text-[10px] font-mono font-bold text-[#E8385A]">{progressPercent.toFixed(0)}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-[#0C0C0E] rounded-full border border-[#222228] shadow-inner overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-[#E8385A] to-[#F0A0B0] rounded-full" />
                   </div>
                </div>
             </div>
          </motion.div>

          {/* Stats Section: Compact Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
             <div className="bg-[#131316] p-5 rounded-2xl border border-[#222228] shadow-sm flex items-center gap-4 group hover:border-[#E8385A]/40 transition-colors">
                 <div className="p-3 bg-white/[0.03] rounded-xl text-[#888895] group-hover:text-[#E8385A] transition-colors">
                    <ClockCounterClockwise size={20} weight="bold" />
                 </div>
                 <div>
                    <p className="text-[10px] font-mono text-[#3A3A4A] uppercase tracking-widest">Watched</p>
                    <p className="text-2xl font-display font-black text-[#F0F0F5] mt-1">{userProfile.anime_watched_count || 0}</p>
                 </div>
             </div>
             <div className="bg-[#131316] p-5 rounded-2xl border border-[#222228] shadow-sm flex items-center gap-4 group hover:border-[#E8385A]/40 transition-colors">
                 <div className="p-3 bg-white/[0.03] rounded-xl text-[#888895] group-hover:text-[#E8385A] transition-colors">
                    <Stack size={20} weight="bold" />
                 </div>
                 <div>
                    <p className="text-[10px] font-mono text-[#3A3A4A] uppercase tracking-widest">In-Progress</p>
                    <p className="text-2xl font-display font-black text-[#F0F0F5] mt-1">{userProfile.anime_watching_count || 0}</p>
                 </div>
             </div>
             <div className="bg-[#131316] p-5 rounded-2xl border border-[#222228] shadow-sm flex items-center gap-4 group hover:border-[#E8385A]/40 transition-colors">
                 <div className="p-3 bg-white/[0.03] rounded-xl text-[#888895] group-hover:text-[#E8385A] transition-colors">
                    <Lightning size={20} weight="bold" />
                 </div>
                 <div>
                    <p className="text-[10px] font-mono text-[#3A3A4A] uppercase tracking-widest">Seniority</p>
                    <p className="text-2xl font-display font-black text-[#F0F0F5] mt-1">LVL {Math.max(1, Math.floor((userProfile.anime_watched_count || 0) / 5))}</p>
                 </div>
             </div>
          </motion.div>

          {/* Library Section */}
          <div className="space-y-16 pt-8">
            {/* Watching List */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-8 border-b border-[#222228] pb-4">
                 <h3 className="text-lg font-display font-black text-[#F0F0F5] tracking-tight flex items-center gap-3">
                   <Stack size={20} weight="bold" className="text-[#E8385A]" /> Currently Tracking
                 </h3>
                 <span className="text-[10px] font-mono text-[#3A3A4A] uppercase tracking-widest">{userProfile.watchingAnime?.length || 0} Units</span>
              </div>
              
              {userProfile.watchingAnime && userProfile.watchingAnime.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {userProfile.watchingAnime.map((anime) => (
                    <AnimeCard key={anime.animeId} anime={anime} />
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-[#222228] rounded-2xl p-12 text-center text-[#3A3A4A] text-[13px] font-sans">
                  No active tracking. Start your discovery in the library.
                </div>
              )}
            </motion.div>

            {/* Completed List */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-8 border-b border-[#222228] pb-4">
                 <h3 className="text-lg font-display font-black text-[#F0F0F5] tracking-tight flex items-center gap-3">
                   <Trophy size={20} weight="bold" className="text-[#E8385A]" /> Hall of Records
                 </h3>
                 <span className="text-[10px] font-mono text-[#3A3A4A] uppercase tracking-widest">{userProfile.watchedAnime?.length || 0} Units</span>
              </div>
              
              {userProfile.watchedAnime && userProfile.watchedAnime.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {userProfile.watchedAnime.map((anime) => (
                    <AnimeCard key={anime.animeId} anime={anime} />
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-[#222228] rounded-2xl p-12 text-center text-[#3A3A4A] text-[13px] font-sans">
                   No completed records found.
                </div>
              )}
            </motion.div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}

export default UserProfilePage;