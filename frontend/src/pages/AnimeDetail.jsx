import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  getAnimeDetails, 
  rateAnime, 
  getUserProfile, 
  addTowatchedList, 
  addTowatchingList, 
  removeFromWatched, 
  removeFromWatching 
} from '../api'; 
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Eye, CheckCircle, Info, Clapperboard, Calendar, AppWindow, Clock, Sparkles, PlayCircle, PlusCircle, MinusCircle } from 'lucide-react';

const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('embed/') || url.includes('player.vimeo.com/video/')) return url;
    const youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/);
    if (youtubeMatch && youtubeMatch[1]) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0&modestbranding=1&rel=0`;
    }
    return null;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

function AnimeDetailPage() {
    const { animeName } = useParams();
    const { userId } = useAuth();
    const [anime, setAnime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rating, setRating] = useState('');
    const [ratingMessage, setRatingMessage] = useState('');
    const [ratingError, setRatingError] = useState('');
    
    const [animeStatus, setAnimeStatus] = useState('none'); 
    const [listActionMessage, setListActionMessage] = useState(''); 
    const [processingListAction, setProcessingListAction] = useState(false); 

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const decodedAnimeName = decodeURIComponent(animeName);
                const data = await getAnimeDetails(decodedAnimeName);
                setAnime(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch anime details.');
            } finally {
                setLoading(false);
            }
        };
        if (animeName) fetchDetails();
    }, [animeName]);

    useEffect(() => {
        const fetchUserAnimeLists = async () => {
            if (!userId || !anime?.animeId) {
                setAnimeStatus('none'); 
                return;
            }
            try {
                const userProfile = await getUserProfile(userId); 
                const watched = userProfile.watchedAnime || [];
                const watching = userProfile.watchingAnime || [];

                if (watched.includes(anime.animeId)) {
                    setAnimeStatus('watched');
                } else if (watching.includes(anime.animeId)) {
                    setAnimeStatus('watching');
                } else {
                    setAnimeStatus('none');
                }
            } catch (err) {
                console.error("Failed to fetch user lists from profile:", err);
            }
        };
        fetchUserAnimeLists();
    }, [userId, anime?.animeId]); 

    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        setRatingMessage('');
        setRatingError('');

        if (!userId) {
            setRatingError('Please log in to rate anime.');
            return;
        }
        const score = parseInt(rating);

        if (isNaN(score) || score < 1 || score > 10) { 
            setRatingError('Rating must be between 1 and 10.');
            return;
        }
        if (!anime?.animeId) return;

        try {
            const response = await rateAnime({
                userId: userId,
                animeId: anime.animeId,
                score: score,
                review_text: "User rated via Sensei Suggest" 
            });
            setRatingMessage(`Rated ${response.score}/10 successfully! 🌸`); 
            setRating(''); 
        } catch (err) {
            setRatingError(err.message || 'Failed to submit rating.');
        }
    };

    const handleAddToList = async (listType) => {
        setProcessingListAction(true);
        setListActionMessage('');
        try {
            if (listType === 'watching') {
                await addTowatchingList({ userId, animeId: anime.animeId });
            } else if (listType === 'watched') {
                await addTowatchedList({ userId, animeId: anime.animeId });
            }
            setAnimeStatus(listType); 
            setListActionMessage(`Added to ${listType} list! 💖`);
        } catch (err) {
            setListActionMessage(`Failed to add: ${err.message}`);
        } finally {
            setProcessingListAction(false);
        }
    };

    const handleRemoveFromList = async (listType) => {
        setProcessingListAction(true);
        setListActionMessage('');
        try {
            if (listType === 'watching') {
                await removeFromWatching({ userId, animeId: anime.animeId });
            } else if (listType === 'watched') {
                await removeFromWatched({ userId, animeId: anime.animeId });
            }
            setAnimeStatus('none'); 
            setListActionMessage(`Removed from ${listType} list. 💔`);
        } catch (err) {
            setListActionMessage(`Failed to remove: ${err.message}`);
        } finally {
            setProcessingListAction(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen overflow-hidden relative">
                 <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                   <Star className="w-20 h-20 text-kawaii-accent fill-kawaii-accent" />
                 </motion.div>
                 <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute mt-32 text-kawaii-accent font-bold text-xl">Loading Data...</motion.p>
            </div>
        );
    }

    if (error) return <div className="text-center p-8 text-kawaii-error font-bold text-2xl">{error}</div>;
    if (!anime) return <div className="text-center p-8 text-kawaii-text-dark font-bold text-2xl">Anime not found or loading glitch.</div>;

    const trailerEmbedUrl = getEmbedUrl(anime.trailer_url_base_anime);

    return (
        <div className="relative py-12 px-4 min-h-screen overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 opacity-10 blur-xl pointer-events-none" style={{
                backgroundImage: `url(${anime.image_url_base_anime || ''})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}></div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-6xl mx-auto glass-card rounded-3xl shadow-2xl p-6 md:p-10 border-2 border-white/60 relative z-10"
            >
                <motion.h1 
                  variants={itemVariants} 
                  className="text-3xl md:text-5xl font-display font-extrabold text-kawaii-text-dark text-center mb-4 drop-shadow-sm flex items-center justify-center gap-3"
                >
                    <Sparkles className="text-kawaii-tertiary w-6 h-6 md:w-10 md:h-10" />
                    {anime.animeName}
                    <Sparkles className="text-kawaii-tertiary w-6 h-6 md:w-10 md:h-10" />
                </motion.h1>

                {/* Status Reflection Badge */}
                <motion.div variants={itemVariants} className="flex justify-center mb-10">
                   {animeStatus === 'watching' ? (
                       <span className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full font-accent text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] shadow-lg animate-pulse-gentle">
                          <Zap size={14} className="fill-blue-500/20" /> IN ACTION
                       </span>
                   ) : animeStatus === 'watched' ? (
                       <span className="flex items-center gap-2 px-4 py-1.5 bg-kawaii-accent/10 border border-kawaii-accent/30 rounded-full font-accent text-[10px] font-black text-kawaii-accent uppercase tracking-[0.2em] shadow-lg">
                          <Medal size={14} className="fill-kawaii-accent/20" /> MASTERED
                       </span>
                   ) : null}
                </motion.div>

                <div className="md:flex gap-12">
                    {/* Left Column: Image & Details */}
                    <div className="md:w-1/3 flex flex-col items-center">
                        <motion.div variants={itemVariants} className="relative w-full max-w-sm rounded-[2rem] overflow-hidden shadow-kawaii-glow border-4 border-white/60 mb-8 group">
                            <img
                                src={anime.image_url_base_anime || '/placeholder.png'}
                                alt={anime.animeName}
                                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110"
                                onError={(e) => {e.target.onerror = null; e.target.src='/placeholder.png';}}
                            />
                            {/* Floating Rating Badge */}
                            <div className="absolute top-4 right-4 bg-anime-card/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 font-accent text-xs font-black text-kawaii-accent-dark">
                                <Star className="w-4 h-4 fill-kawaii-accent-dark" />
                                {anime.rating ? anime.rating.toFixed(1) : 'N/A'}
                            </div>
                        </motion.div>

                        {/* Smart Action Center */}
                        <AnimatePresence mode="wait">
                          <motion.div 
                             key={animeStatus}
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: -10 }}
                             variants={itemVariants} 
                             className="w-full bg-anime-card/40 p-1 rounded-2xl border border-white/10 shadow-sm mb-8 flex flex-col gap-2 overflow-hidden"
                          >
                                {animeStatus === 'none' ? (
                                    <div className="flex flex-col gap-2 p-4">
                                        <button onClick={() => handleAddToList('watching')} disabled={processingListAction} className="group relative overflow-hidden bg-blue-500 rounded-xl px-4 py-3 flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                            <Eye className="w-5 h-5 text-white" />
                                            <span className="font-accent text-xs font-black text-white uppercase tracking-wider">Start Watching</span>
                                        </button>
                                        <button onClick={() => handleAddToList('watched')} disabled={processingListAction} className="group relative overflow-hidden bg-kawaii-accent rounded-xl px-4 py-3 flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_20px_rgba(255,46,147,0.5)]">
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                            <CheckCircle className="w-5 h-5 text-white" />
                                            <span className="font-accent text-xs font-black text-white uppercase tracking-wider">Mark as Completed</span>
                                        </button>
                                    </div>
                                ) : animeStatus === 'watching' ? (
                                    <div className="p-4 flex flex-col gap-2">
                                        <button onClick={() => handleAddToList('watched')} disabled={processingListAction} className="group relative overflow-hidden bg-kawaii-accent rounded-xl px-4 py-3 flex items-center justify-center gap-3 transition-all hover:shadow-kawaii-glow">
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                            <CheckCircle className="w-5 h-5 text-white" />
                                            <span className="font-accent text-xs font-black text-white uppercase tracking-wider">Finish & Rank</span>
                                        </button>
                                        <button onClick={() => handleRemoveFromList('watching')} disabled={processingListAction} className="bg-anime-sub-card/60 hover:bg-red-500/20 text-kawaii-error font-accent text-[10px] font-black uppercase py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                                            <MinusCircle className="w-4 h-4" /> Drop from Current List
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-4 flex flex-col gap-2">
                                        <button onClick={() => handleAddToList('watching')} disabled={processingListAction} className="group relative overflow-hidden bg-blue-500 rounded-xl px-4 py-3 flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                            <History className="w-5 h-5 text-white" />
                                            <span className="font-accent text-xs font-black text-white uppercase tracking-wider">Start Rewatching</span>
                                        </button>
                                        <button onClick={() => handleRemoveFromList('watched')} disabled={processingListAction} className="bg-anime-sub-card/60 hover:bg-red-500/20 text-kawaii-error font-accent text-[10px] font-black uppercase py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                                            <MinusCircle className="w-4 h-4" /> Reset Achievement
                                        </button>
                                    </div>
                                )}
                                
                                {listActionMessage && (
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-[10px] pb-4 px-4 font-black uppercase text-center tracking-tighter ${listActionMessage.includes('Failed') ? 'text-kawaii-error' : 'text-green-400'}`}>
                                        {listActionMessage}
                                    </motion.p>
                                )}
                          </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right Column: Info, Trailer, Rating */}
                    <div className="md:w-2/3">
                        {/* Synopsis Card */}
                        <motion.div variants={itemVariants} className="bg-anime-card/60 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-kawaii-border shadow-sm mb-10"> 
                            <h3 className="text-2xl font-display font-bold text-kawaii-accent mb-6 flex items-center gap-2"><Info className="w-6 h-6"/> Anime Info</h3> 
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base md:text-lg"> 
                                <div className="flex items-center gap-3"> 
                                    <Clapperboard className="text-kawaii-tertiary w-6 h-6 flex-shrink-0" />
                                    <div><span className="font-bold text-kawaii-text-muted text-sm block">Genre</span><span className="font-semibold text-kawaii-text-dark">{anime.genres && anime.genres.length > 0 ? anime.genres.map((g) => g.name).join(', ') : 'N/A'}</span></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-kawaii-tertiary w-6 h-6 flex-shrink-0" />
                                    <div><span className="font-bold text-kawaii-text-muted text-sm block">Release</span><span className="font-semibold text-kawaii-text-dark">{anime.releaseDate ? new Date(anime.releaseDate).toLocaleDateString() : 'N/A'}</span></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <AppWindow className="text-kawaii-tertiary w-6 h-6 flex-shrink-0" />
                                    <div><span className="font-bold text-kawaii-text-muted text-sm block">Studio</span><span className="font-semibold text-kawaii-text-dark">{anime.studio || 'N/A'}</span></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="text-kawaii-tertiary w-6 h-6 flex-shrink-0" />
                                    <div><span className="font-bold text-kawaii-text-muted text-sm block">Status</span><span className="font-semibold text-kawaii-text-dark">{typeof anime.is_running === 'boolean' ? (anime.is_running ? 'Currently Airing' : 'Finished') : 'N/A'}</span></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Info className="text-kawaii-tertiary w-6 h-6 flex-shrink-0" />
                                    <div><span className="font-bold text-kawaii-text-muted text-sm block">Adult Content</span><span className="font-semibold text-kawaii-text-dark">{typeof anime.is_adult_rated === 'boolean' ? (anime.is_adult_rated ? 'Yes (18+)' : 'No (Safe)') : 'N/A'}</span></div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Description */}
                        <motion.div variants={itemVariants} className="mb-10"> 
                            <h3 className="text-2xl font-display font-bold text-kawaii-accent mb-4">Lore</h3>
                            <div className="bg-anime-sub-card/40 p-6 rounded-2xl border-l-4 border-kawaii-accent shadow-sm">
                              <p className="text-kawaii-text-dark leading-relaxed font-medium">
                                  {anime.description || 'No lore available for this world.'}
                              </p>
                            </div>
                        </motion.div>

                        {/* Trailer */}
                        {trailerEmbedUrl && (
                            <motion.div variants={itemVariants} className="mb-10">
                                <h3 className="text-2xl font-display font-bold text-kawaii-accent mb-4 flex items-center gap-2"><PlayCircle className="w-6 h-6"/> Cinematic Trailer</h3>
                                <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border-4 border-white" style={{ paddingBottom: '56.25%' }}>
                                    <iframe
                                        src={trailerEmbedUrl}
                                        title={`${anime.animeName} Trailer`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute top-0 left-0 w-full h-full"
                                    ></iframe>
                                </div>
                            </motion.div>
                        )}

                        {/* Review / Rating Section */}
                        <motion.div variants={itemVariants} className="bg-anime-card/60 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-kawaii-border shadow-sm"> 
                            <h3 className="text-2xl font-display font-bold text-kawaii-accent mb-6 flex items-center gap-2">
                                <Star className="w-6 h-6"/> Leave a Rating
                            </h3>
                            {ratingMessage && (
                                <p className="text-green-500 font-bold mb-4 bg-green-100 p-3 rounded-xl border border-green-200">
                                    {ratingMessage}
                                </p>
                            )}
                            {ratingError && (
                                <p className="text-kawaii-error font-bold mb-4 bg-red-100 p-3 rounded-xl border border-red-200">
                                    {ratingError}
                                </p>
                            )}
                            {userId ? (
                                <form onSubmit={handleRatingSubmit} className="flex gap-4 items-center">
                                    <input
                                        type="number"
                                        min="1"
                                        max="10" 
                                        value={rating}
                                        onChange={(e) => setRating(e.target.value)}
                                        placeholder="1-10" 
                                        className="w-32 p-3 font-bold rounded-xl bg-anime-sub-card border-2 border-kawaii-border text-kawaii-text-dark focus:outline-none focus:border-kawaii-accent text-center"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="px-8 py-3 bg-kawaii-accent text-white font-bold rounded-xl hover:bg-kawaii-accent-dark transition-transform hover:scale-105 active:scale-95 shadow-md flex-grow md:flex-grow-0 text-center"
                                    >
                                        Submit
                                    </button>
                                </form>
                            ) : (
                                <p className="text-center text-kawaii-text-muted mt-4 font-semibold">
                                    Please log in to leave your feedback on this anime.
                                </p>
                            )}
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default AnimeDetailPage;