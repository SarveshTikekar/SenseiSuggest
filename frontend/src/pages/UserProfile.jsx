import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Tv, Award, ListVideo, History, UserCircle, Play, ShieldAlert, Zap, Medal } from 'lucide-react';

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
  if (count >= 50) return { name: "Kage", color: "text-red-400", bg: "bg-red-400/20" };
  if (count >= 25) return { name: "Jonin", color: "text-purple-400", bg: "bg-purple-400/20" };
  if (count >= 10) return { name: "Chunin", color: "text-blue-400", bg: "bg-blue-400/20" };
  return { name: "Genin", color: "text-green-400", bg: "bg-green-400/20" };
};

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
      <div className="flex justify-center items-center h-screen bg-anime-background relative overflow-hidden">
        <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <Tv className="w-16 h-16 text-anime-accent" />
        </motion.div>
        <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute mt-32 text-anime-accent font-bold text-lg">Synchronizing Otaku Data...</motion.p>
      </div>
    );
  }

  if (error) return <div className="text-center p-8 text-kawaii-error text-xl h-screen flex items-center justify-center font-bold">{error}</div>;
  if (!userProfile) return <div className="text-center p-8 text-kawaii-text-dark text-xl h-screen flex items-center justify-center font-bold">User Not Found. 🚫</div>;

  const profilePicSrc = userProfile.profilePicture || `https://ui-avatars.com/api/?name=${userProfile.userName}&background=FF2E93&color=fff&size=200`;
  const watchedCount = userProfile.anime_watched_count || 0;
  const rank = getOtakuRank(watchedCount);
  const nextRankCount = watchedCount >= 50 ? 100 : (watchedCount >= 25 ? 50 : (watchedCount >= 10 ? 25 : 10));
  const progressPercent = Math.min((watchedCount / nextRankCount) * 100, 100);

  const AnimeCard = ({ anime }) => (
    <motion.div variants={itemVariants} className="block group">
      <Link to={`/anime/details/${encodeURIComponent(anime.animeName)}`} className="h-full">
        <div className="glass-card rounded-2xl shadow-lg border-2 border-white/10 flex flex-col h-full hover:shadow-kawaii-glow transition-all duration-300 bg-anime-sub-card/40 group-hover:-translate-y-2">
          <div className="relative w-full h-64 overflow-hidden">
            <img
              src={anime.image_url_base_anime || 'https://placehold.co/200x280/16213E/9CA3AF?text=No+Image'}
              alt={anime.animeName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/200x280/16213E/9CA3AF?text=Image+Missing';}}
            />
            {/* Play overlay on hover */}
            <div className="absolute inset-0 bg-kawaii-accent/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/40 shadow-xl">
                 <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
            {/* Genre Badge */}
             <div className="absolute top-2 left-2 px-2 py-0.5 bg-anime-card/80 backdrop-blur-md border border-white/10 rounded-md text-[10px] font-bold text-kawaii-secondary uppercase tracking-widest">
                Anime
            </div>
          </div>
          <div className="p-4 bg-anime-sub-card/80 backdrop-blur-sm flex-grow flex flex-col">
            <p className="text-kawaii-text-dark group-hover:text-kawaii-accent text-sm font-bold line-clamp-2 text-center leading-snug transition-colors">
              {anime.animeName}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen py-12 px-4 overflow-hidden font-sans">
      {/* Dynamic Background */}
      <motion.div animate={{ y: [0, -40, 0], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 10, repeat: Infinity }} className="absolute -top-20 right-10 w-96 h-96 bg-kawaii-accent/20 blur-3xl rounded-full z-0 pointer-events-none" />
      <motion.div animate={{ x: [0, 50, 0], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 12, repeat: Infinity }} className="absolute bottom-10 left-10 w-80 h-80 bg-kawaii-tertiary/20 blur-3xl rounded-full z-0 pointer-events-none" />

      <div className="container mx-auto relative z-10 max-w-6xl">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          
          {/* Header Card: The ID Card Experience */}
          <motion.div variants={itemVariants} className="glass-card rounded-[2.5rem] p-6 md:p-8 border-2 border-white/20 shadow-2xl flex flex-col md:flex-row gap-8 items-center bg-gradient-to-br from-anime-card/90 to-anime-sub-card/90">
             <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-kawaii-accent shadow-kawaii-glow rotate-3 hover:rotate-0 transition-transform duration-500">
                   <img src={profilePicSrc} alt={userProfile.userName} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-kawaii-text-dark text-anime-bg font-black px-3 py-1 rounded-lg shadow-lg text-xs transform -rotate-6 border-2 border-kawaii-accent">
                   LVL {Math.floor(watchedCount / 5) + 1}
                </div>
             </div>
             
             <div className="flex-grow text-center md:text-left space-y-3">
                <div className="flex flex-col md:flex-row items-center gap-3">
                   <h2 className="text-3xl md:text-4xl font-display font-extrabold text-kawaii-text-dark tracking-tight leading-none">
                      {userProfile.userName}
                   </h2>
                   <div className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm border border-current ${rank.bg} ${rank.color}`}>
                      {rank.name} CLASS
                   </div>
                </div>
                <p className="text-kawaii-text-muted text-sm font-semibold flex items-center justify-center md:justify-start gap-2 opacity-80 italic">
                   <UserCircle size={16} className="text-kawaii-accent" />
                   {userProfile.email}
                </p>
                
                {/* Leveling System */}
                <div className="mt-4 pt-4 border-t border-white/5 w-full max-w-md mx-auto md:mx-0">
                   <div className="flex justify-between items-end mb-2">
                       <span className="tech-label text-kawaii-text-muted">Next Class: {nextRankCount} Completed</span>
                       <span className="text-xs font-accent font-bold text-kawaii-accent">{progressPercent.toFixed(0)}%</span>
                   </div>
                   <div className="h-2.5 w-full bg-anime-border rounded-full p-0.5 border border-white/10 shadow-inner overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-kawaii-accent to-kawaii-tertiary rounded-full shadow-glow" />
                   </div>
                </div>
             </div>
          </motion.div>

          {/* Stats Section: Compact Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
             <div className="bg-anime-card/40 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-sm flex items-center gap-4 group hover:border-kawaii-secondary transition-colors">
                 <div className="p-3 bg-kawaii-secondary/20 rounded-2xl text-kawaii-secondary group-hover:scale-110 transition-transform">
                    <History size={24} />
                 </div>
                 <div>
                    <p className="tech-label text-kawaii-text-muted">Anime Watched</p>
                    <p className="text-2xl font-display font-extrabold text-kawaii-text-dark mt-1">{userProfile.anime_watched_count || 0}</p>
                 </div>
             </div>
             <div className="bg-anime-card/40 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-sm flex items-center gap-4 group hover:border-kawaii-tertiary transition-colors">
                 <div className="p-3 bg-kawaii-tertiary/20 rounded-2xl text-kawaii-tertiary group-hover:scale-110 transition-transform">
                    <ListVideo size={24} />
                 </div>
                 <div>
                    <p className="tech-label text-kawaii-text-muted">Currently Playing</p>
                    <p className="text-2xl font-display font-extrabold text-kawaii-text-dark mt-1">{userProfile.anime_watching_count || 0}</p>
                 </div>
             </div>
             <div className="bg-anime-card/40 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-sm flex items-center gap-4 group hover:border-kawaii-accent transition-colors">
                 <div className="p-3 bg-kawaii-accent/20 rounded-2xl text-kawaii-accent group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                 </div>
                 <div>
                    <p className="tech-label text-kawaii-text-muted">Otaku Level</p>
                    <p className="text-2xl font-display font-extrabold text-kawaii-text-dark mt-1">{Math.max(1, Math.floor((userProfile.anime_watched_count || 0) / 5))}</p>
                 </div>
             </div>
          </motion.div>

          {/* Library Section: Using the 3-Column Standard */}
          <div className="space-y-12 pt-8">
            {/* Watching List */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-8 border-b-2 border-kawaii-border pb-4">
                 <h3 className="text-2xl font-display font-extrabold text-kawaii-accent flex items-center gap-3">
                   <ListVideo size={28} className="text-kawaii-secondary" /> Currently In-Action
                 </h3>
                 <span className="bg-anime-sub-card px-3 py-1 rounded-full text-[10px] font-black text-kawaii-text-muted uppercase tracking-widest">{userProfile.watchingAnime?.length || 0} Anime</span>
              </div>
              
              {userProfile.watchingAnime && userProfile.watchingAnime.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {userProfile.watchingAnime.map((anime) => (
                    <AnimeCard key={anime.animeId} anime={anime} />
                  ))}
                </div>
              ) : (
                <div className="bg-anime-sub-card/20 border-2 border-dashed border-white/5 rounded-[2rem] p-12 text-center text-kawaii-text-muted font-bold text-sm tracking-wide">
                  Your library is currently empty. Start discovering new worlds! 🗾
                </div>
              )}
            </motion.div>

            {/* Completed List */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-8 border-b-2 border-kawaii-border pb-4">
                 <h3 className="text-2xl font-display font-extrabold text-kawaii-accent flex items-center gap-3">
                   <Award size={28} className="text-kawaii-tertiary" /> Hall of Masterpieces
                 </h3>
                 <span className="bg-anime-sub-card px-3 py-1 rounded-full text-[10px] font-black text-kawaii-text-muted uppercase tracking-widest">{userProfile.watchedAnime?.length || 0} Anime</span>
              </div>
              
              {userProfile.watchedAnime && userProfile.watchedAnime.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {userProfile.watchedAnime.map((anime) => (
                    <AnimeCard key={anime.animeId} anime={anime} />
                  ))}
                </div>
              ) : (
                <div className="bg-anime-sub-card/20 border-2 border-dashed border-white/5 rounded-[2rem] p-12 text-center text-kawaii-text-muted font-bold text-sm tracking-wide">
                   No completed anime found yet. Every legend starts somewhere! ⚔️
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