import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile } from '../api';
import { motion } from 'framer-motion';
import { Star, Tv, Award, ListVideo, History, UserCircle, Play } from 'lucide-react';

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
            <Tv className="w-20 h-20 text-anime-accent" />
        </motion.div>
        <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute mt-32 text-anime-accent font-bold text-xl">Loading Otaku Data...</motion.p>
      </div>
    );
  }

  if (error) return <div className="text-center p-8 text-anime-error text-xl h-screen flex items-center justify-center font-bold">{error}</div>;
  if (!userProfile) return <div className="text-center p-8 text-anime-text-dark text-xl h-screen flex items-center justify-center font-bold">User Not Found in Database.</div>;

  const profilePicSrc = userProfile.profilePicture || `https://ui-avatars.com/api/?name=${userProfile.userName}&background=9D4EDD&color=fff&size=200`;

  const AnimeCard = ({ anime }) => (
    <motion.div variants={itemVariants} className="flex-shrink-0 w-40 sm:w-48 transform">
      <Link 
        to={`/anime/${encodeURIComponent(anime.animeName)}`} 
        className="block group"
      >
        <div className="glass-card rounded-2xl shadow-md overflow-hidden border-2 border-white/20 flex flex-col h-full hover:shadow-lg transition-shadow bg-anime-sub-card">
          <div className="relative w-full h-56 lg:h-64 bg-gray-800 flex items-center justify-center overflow-hidden">
            {anime.image_url_base_anime ? (
              <img
                src={anime.image_url_base_anime}
                alt={anime.animeName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/150x200/16213E/fff?text=No+Image';}}
              />
            ) : (
              <div className="text-gray-500 text-sm flex flex-col items-center justify-center p-4 text-center">
                <Play className="w-10 h-10 mb-2 opacity-50" />
                <span className="font-semibold">No Cover Art</span>
              </div>
            )}
            {/* Play overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="w-12 h-12 text-white fill-white drop-shadow-md" />
            </div>
          </div>
          <div className="p-3 bg-anime-sub-card border-t border-white/10">
            <p className="text-anime-text-light group-hover:text-anime-accent text-sm md:text-base font-bold line-clamp-2 text-center leading-snug">
              {anime.animeName}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen py-10 overflow-hidden font-display">
      {/* Decorative Parallax Backdrops */}
      <motion.div animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }} transition={{ duration: 30, repeat: Infinity }} className="absolute -top-20 -left-20 w-80 h-80 bg-kawaii-tertiary rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></motion.div>
      <motion.div animate={{ rotate: [360, 0], scale: [1, 1.5, 1] }} transition={{ duration: 25, repeat: Infinity }} className="absolute -bottom-20 -right-20 w-96 h-96 bg-kawaii-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></motion.div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="glass-card rounded-3xl shadow-2xl p-6 md:p-12 border-2 border-white/10">
          
          {/* Profile Header */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center text-center md:text-left mb-10 pb-8 border-b-2 border-kawaii-border gap-6 sm:gap-10">
            <div className="relative group">
              <img
                src={profilePicSrc}
                alt={`${userProfile.userName}'s avatar`}
                className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-8 border-anime-card shadow-kawaii-glow transition-transform duration-500 group-hover:rotate-6"
              />
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -bottom-2 -right-2 bg-kawaii-accent text-white p-2 rounded-full shadow-md border-2 border-anime-card">
                <Medal className="w-6 h-6" />
              </motion.div>
            </div>
            <div>
              <h2 className="text-5xl md:text-6xl font-extrabold text-kawaii-accent mb-2 drop-shadow-sm flex items-center justify-center md:justify-start gap-2">
                 {userProfile.userName} <UserCircle className="text-kawaii-tertiary w-8 h-8" />
              </h2>
              <p className="text-kawaii-text-muted text-xl font-bold bg-anime-sub-card/50 inline-block px-4 py-1 rounded-full">{userProfile.email}</p>
            </div>
          </motion.div>

          {/* Stats Badges */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center md:justify-start gap-4 mb-12">
            <div className="flex items-center gap-3 bg-anime-card/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-sm hover:shadow-md transition-shadow">
              <History className="text-kawaii-secondary w-8 h-8" />
              <div>
                <p className="text-sm font-bold text-kawaii-text-muted uppercase">Anime Completed</p>
                <p className="text-3xl font-extrabold text-kawaii-text-dark">{userProfile.anime_watched_count || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-anime-card/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-sm hover:shadow-md transition-shadow">
              <ListVideo className="text-kawaii-tertiary w-8 h-8" />
              <div>
                <p className="text-sm font-bold text-kawaii-text-muted uppercase">Currently Playing</p>
                <p className="text-3xl font-extrabold text-kawaii-text-dark">{userProfile.anime_watching_count || 0}</p>
              </div>
            </div>
             <div className="flex items-center gap-3 bg-anime-card/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-sm hover:shadow-md transition-shadow">
              <Award className="text-kawaii-accent w-8 h-8" />
              <div>
                <p className="text-sm font-bold text-kawaii-text-muted uppercase">Otaku Level</p>
                <p className="text-3xl font-extrabold text-kawaii-text-dark">{Math.max(1, Math.floor((userProfile.anime_watched_count || 0) / 5))}</p>
              </div>
            </div>
          </motion.div>

          {/* Anime Lists */}
          <motion.div variants={itemVariants} className="space-y-12">
            
            {/* Watching List */}
            <div>
              <h3 className="text-3xl font-extrabold text-kawaii-accent mb-6 flex items-center gap-3">
                 <ListVideo className="w-8 h-8"/> Currently Watching
              </h3>
              {userProfile.watchingAnime && userProfile.watchingAnime.length > 0 ? (
                <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-6 scrollbar-kawaii snap-x">
                  {userProfile.watchingAnime.map((anime) => (
                    <div className="snap-start" key={anime.animeId}>
                       <AnimeCard anime={anime} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-anime-sub-card/40 border-2 border-dashed border-kawaii-border rounded-2xl p-8 text-center text-kawaii-text-muted font-bold text-lg">
                  Not watching anything right now. Time to explore! 🗺️
                </div>
              )}
            </div>

            {/* Watched List */}
            <div>
              <h3 className="text-3xl font-extrabold text-kawaii-accent mb-6 flex items-center gap-3">
                 <History className="w-8 h-8"/> Completed Anime
              </h3>
              {userProfile.watchedAnime && userProfile.watchedAnime.length > 0 ? (
                <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-6 scrollbar-kawaii snap-x">
                  {userProfile.watchedAnime.map((anime) => (
                    <div className="snap-start" key={anime.animeId}>
                       <AnimeCard anime={anime} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-anime-sub-card/40 border-2 border-dashed border-kawaii-border rounded-2xl p-8 text-center text-kawaii-text-muted font-bold text-lg">
                  You haven't completed any anime yet. Get out there! ⚔️
                </div>
              )}
            </div>

          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}

// Quick component for the little medal icon since I missed importing it initially
function Medal(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
      <path d="M11 12 5.12 2.2" />
      <path d="m13 12 5.88-9.8" />
      <path d="M8 7h8" />
      <circle cx="12" cy="17" r="5" />
      <path d="M12 18v-2h-.5" />
    </svg>
  );
}

export default UserProfilePage;