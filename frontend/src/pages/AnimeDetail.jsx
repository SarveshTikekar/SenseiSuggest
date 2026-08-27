import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getAnimeDetails, rateAnime, updateAnimeRating, getUserProfile,
  addTowatchedList, addTowatchingList, removeFromWatched, removeFromWatching,
  addToBookmarkList, removeFromBookmarkList,
  getUserScrapbook, uploadScrapbookImage, deleteScrapbookImage
} from '../api';
import ScrapbookGrid from '../components/Scrapbook/ScrapbookGrid';
import ScrapbookDrawer from '../components/Scrapbook/ScrapbookDrawer';
import SeasonTimeline from '../components/SeasonTimeline';
import { useAuth } from '../context/AuthContext';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Eye,
  CheckCircle,
  CalendarBlank,
  PlayCircle,
  MinusCircle,
  CaretLeft,
  Clock,
  FilmSlate,
  Users,
  WarningCircle,
  BookmarksSimple
} from '@phosphor-icons/react';

/* ── Trailer URL normaliser ── */
const getEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes('embed/')) return url;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}?modestbranding=1&rel=0`;
  return null;
};

/* ── Loading skeleton ── */
const SkeletonDetail = () => (
  <div className="min-h-screen" style={{ background: '#0D0D0D' }}>
    {/* Hero area */}
    <div className="relative h-[420px] overflow-hidden">
      <div className="absolute inset-0 ss-skeleton opacity-40" />
    </div>
    <div className="max-w-[1880px] mx-auto px-4 sm:px-6 -mt-32 relative z-10 pb-20">
      <div className="flex gap-8">
        <div className="w-44 flex-shrink-0 rounded-xl ss-skeleton" style={{ aspectRatio: '2/3' }} />
        <div className="flex-1 pt-40 space-y-4">
          <div className="h-9 w-2/3 ss-skeleton rounded" />
          <div className="h-4 w-1/3 ss-skeleton rounded" />
          <div className="flex gap-2 pt-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-6 w-16 ss-skeleton rounded-full" />)}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ── Rating stars display ── */
const RatingStars = ({ score }) => {
  const filled = Math.round((score / 10) * 5);
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          weight={i < filled ? "fill" : "regular"}
          className={i < filled ? 'text-[#D97706]' : 'text-[#AAAAAA]'}
        />
      ))}
    </div>
  );
};

/* ── Metadata row item ── */
const MetaItem = (props) => {
  const { icon: Icon, label, value } = props;
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={14} weight="bold" className="text-[#AAAAAA] opacity-60 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-[#AAAAAA] opacity-60 text-[10px] font-accent uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-[#F5EBE0] text-sm font-medium leading-tight font-accent">{value}</p>
      </div>
    </div>
  );
};

function AnimeDetailPage() {
  const { animeName } = useParams();
  const { userId }    = useAuth();

  const [anime, setAnime]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [animeStatus, setStatus]    = useState('none'); // 'none' | 'watching' | 'watched'
  const [listMsg, setListMsg]       = useState('');
  const [processing, setProcessing] = useState(false);
  const [rating, setRating]         = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingMsg, setRatingMsg]   = useState({ type: '', text: '' });
  const [imgError, setImgError]     = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasExistingRating, setHasExistingRating] = useState(false);

  // Scrapbook State
  const [scrapbookPhotos, setScrapbookPhotos] = useState([]);
  const [scrapbookLoading, setScrapbookLoading] = useState(false);

  /* Fetch anime */
  useEffect(() => {
    if (!animeName) return;
    setLoading(true);
    getAnimeDetails(decodeURIComponent(animeName))
      .then(d => setAnime(d))
      .catch(e => setError(e.message || 'Could not load this anime.'))
      .finally(() => setLoading(false));
  }, [animeName]);

  /* Fetch watchlist status */
  useEffect(() => {
    if (!userId || !anime?.animeId) { setStatus('none'); setIsBookmarked(false); setHasExistingRating(false); return; }
    getUserProfile(userId).then(res => {
      const { watchedAnime = [], watchingAnime = [], bookmarkedAnime = [], ratings = [] } = res.UserProfile || {};
      
      // Check watchlist status
      if (watchedAnime.some(a => a.animeId === anime.animeId))       setStatus('watched');
      else if (watchingAnime.some(a => a.animeId === anime.animeId)) setStatus('watching');
      else                                                            setStatus('none');
      
      // Check bookmark status
      const bookmarked = bookmarkedAnime.some(a => a.animeId === anime.animeId);
      setIsBookmarked(bookmarked);

      // Check rating status
      const userRating = ratings.find(r => r.animeName === anime.animeName);
      if (userRating) {
        setRating(userRating.score);
        setReviewText(userRating.review_text || '');
        setHasExistingRating(true);
      } else {
        setHasExistingRating(false);
      }
    }).catch(() => {});

    // Fetch Scrapbook Photos
    getUserScrapbook(userId).then(res => {
      if (res && res.data) {
        setScrapbookPhotos(res.data.filter(p => p.animeId === anime.animeId));
      }
    }).catch(e => console.error("Scrapbook fetch error:", e));

  }, [userId, anime?.animeId]);

  const handleList = async (type) => {
    if (!userId) { setListMsg('Log in to manage your list.'); return; }
    setProcessing(true); setListMsg('');
    try {
      if (type === 'watching') await addTowatchingList({ userId, animeId: anime.animeId });
      else                     await addTowatchedList({ userId, animeId: anime.animeId });
      setStatus(type);
      setListMsg(type === 'watching' ? 'Added to Watching ✓' : 'Marked as Completed ✓');
    } catch (e) { setListMsg(`Error: ${e.message}`); }
    finally { setProcessing(false); }
  };

  const handleRemove = async (type) => {
    if (!userId) return;
    setProcessing(true); setListMsg('');
    try {
      if (type === 'watching') await removeFromWatching({ userId, animeId: anime.animeId });
      else                     await removeFromWatched({ userId, animeId: anime.animeId });
      setStatus('none');
      setListMsg('Record purged from your archives.');
    } catch (e) { setListMsg(`Error: ${e.message}`); }
    finally { setProcessing(false); }
  };

  const handleToggleBookmark = async () => {
    if (!userId) { setListMsg('Log in to bookmark anime.'); return; }
    setProcessing(true);
    try {
      if (isBookmarked) {
        await removeFromBookmarkList({ userId, animeId: anime.animeId });
        setIsBookmarked(false);
        setListMsg('Removed from bookmarks.');
      } else {
        await addToBookmarkList({ userId, animeId: anime.animeId });
        setIsBookmarked(true);
        setListMsg('Added to bookmarks ✓');
      }
    } catch (e) {
      setListMsg(`Error: ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleRate = async (e) => {
    e.preventDefault();
    setRatingMsg({ type: '', text: '' });
    if (!userId) { setRatingMsg({ type: 'error', text: 'Log in to rate anime.' }); return; }
    
    if (rating === 0) {
      setRatingMsg({ type: 'error', text: 'Please select a star rating.' });
      return;
    }

    const finalScore = Math.round(rating);

    setProcessing(true);
    try {
      const payload = { 
        userId, 
        animeId: anime.animeId, 
        score: finalScore, 
        review_text: reviewText || 'User rated via Sensei Suggest' 
      };

      if (hasExistingRating) {
        await updateAnimeRating(payload);
        setRatingMsg({ type: 'success', text: `Review chronicles updated! Rated ${finalScore}/10` });
      } else {
        await rateAnime(payload);
        setRatingMsg({ type: 'success', text: `Review chronicles created! Rated ${finalScore}/10` });
        setHasExistingRating(true);
      }

      // Re-fetch anime details to update the reviews list and average rating!
      const updatedDetails = await getAnimeDetails(decodeURIComponent(animeName));
      setAnime(updatedDetails);
    } catch (e) {
      setRatingMsg({ type: 'error', text: e.message || 'Failed to submit chronicles.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleScrapbookUpload = async (file) => {
    if (!userId || !anime?.animeId) return;
    
    const description = window.prompt("Enter a short caption for this scene (max 180 chars):") || "";
    
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('animeId', anime.animeId);
    formData.append('description', description.substring(0, 180));
    formData.append('image', file);

    setScrapbookLoading(true);
    try {
      await uploadScrapbookImage(formData);
      const fetched = await getUserScrapbook(userId);
      setScrapbookPhotos(fetched.data.filter(p => p.animeId === anime.animeId));
    } catch (err) {
      alert(err.message);
    } finally {
      setScrapbookLoading(false);
    }
  };

  const handleScrapbookRemove = async (photoId) => {
    if (!window.confirm("Delete this scene from your scrapbook?")) return;
    setScrapbookLoading(true);
    try {
      await deleteScrapbookImage(photoId, userId, anime.animeId);
      setScrapbookPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (err) {
      alert(err.message);
    } finally {
      setScrapbookLoading(false);
    }
  };

  /* ── States ── */
  if (loading) return <SkeletonDetail />;
  if (error)   return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <WarningCircle size={40} weight="duotone" className="text-[#AAAAAA] mb-3" />
      <p className="text-[#F5EBE0] font-display font-bold text-xl mb-1">Something went wrong</p>
      <p className="text-[#AAAAAA] text-sm mb-5">{error}</p>
      <Link to="/all-anime" className="ss-btn-ghost px-4 py-2 rounded-xl text-sm" style={{ borderColor: 'rgba(186,175,184,0.15)', color: '#F5EBE0' }}>
        ← Back to Browse
      </Link>
    </div>
  );
  if (!anime) return (
    <div className="py-32 text-center text-[#AAAAAA]">Anime not found.</div>
  );

  const trailerUrl = getEmbedUrl(anime.trailer_url_base_anime);
  const genres     = anime.genres?.map(g => g.name) || [];
  const poster     = imgError ? null : anime.image_url_base_anime;

  return (
    <div className="min-h-screen">
      {/* ══════════════════════════════════════════════════
          CINEMATIC HERO — blurred poster backdrop
          ══════════════════════════════════════════════════ */}
      <div className="relative">
        {/* Blurred backdrop */}
        <div className="absolute inset-0 overflow-hidden" style={{ height: '440px' }}>
          {poster && (
            <img
              src={poster}
              alt=""
              aria-hidden
              className="w-full h-full object-cover"
              style={{ filter: 'blur(32px) brightness(0.25) saturate(1.4)', transform: 'scale(1.1)' }}
            />
          )}
          {/* Double gradient: tone it down from top and bottom */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, #0D0D0D 0%, transparent 30%, transparent 70%, #0D0D0D 100%)',
            }}
          />
          {/* Side vignette */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, #0D0D0D 0%, transparent 20%, transparent 80%, #0D0D0D 100%)' }}
          />
        </div>

        {/* ── Main content row — sits on top of the hero ── */}
        <div className="relative z-10 max-w-[1880px] mx-auto px-4 sm:px-6 pt-10 pb-8">

          {/* Back button */}
          <Link
            to="/all-anime"
            className="inline-flex items-center gap-1.5 text-[#AAAAAA] hover:text-[#F5EBE0] text-xs font-mono mb-8 transition-colors"
          >
            <CaretLeft size={14} weight="bold" /> Browse
          </Link>

          <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">

            {/* ── Poster column ── */}
            <div className="flex-shrink-0 w-full lg:w-80 xl:w-96">
              <Motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative rounded-xl overflow-hidden border border-[#AAAAAA]/20 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
                style={{ aspectRatio: '16/9' }}
              >
                {poster ? (
                  <div className="w-full h-full relative">
                    {/* Blurred Backdrop - Optimized for mobile */}
                    <img 
                      src={poster} 
                      className="hidden sm:block absolute inset-0 w-full h-full object-cover blur-3xl opacity-40 scale-125 pointer-events-none"
                      alt=""
                      aria-hidden
                    />
                    <img
                      src={poster}
                      alt={anime.animeName}
                      className="relative z-10 w-full h-full object-contain"
                      onError={() => setImgError(true)}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#0F0F0F] flex items-center justify-center">
                    <FilmSlate size={40} weight="duotone" className="text-[#AAAAAA]" />
                  </div>
                )}

                {/* Score badge */}
                {anime.rating && (
                  <div
                    className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(186,175,184,0.2)' }}
                  >
                    <Star size={12} weight="fill" className="text-[#D97706]" />
                    <span className="text-[#F5EBE0] text-xs font-mono font-semibold">{anime.rating.toFixed(1)}</span>
                  </div>
                )}

                {/* Status badge */}
                {animeStatus !== 'none' && (
                  <div
                    className="absolute bottom-2.5 left-2.5 right-2.5 py-1.5 text-center rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider"
                    style={{
                      background: animeStatus === 'watching'
                        ? 'rgba(0,0,0,0.7)'
                        : 'rgba(221,4,38,0.15)',
                      border: `1px solid ${animeStatus === 'watching' ? 'rgba(186,175,184,0.15)' : 'rgba(221,4,38,0.3)'}`,
                      color: animeStatus === 'watching' ? '#AAAAAA' : '#DD0426',
                    }}
                  >
                    {animeStatus === 'watching' ? '▶ Watching' : '✓ Completed'}
                  </div>
                )}
              </Motion.div>
            </div>

            {/* ── Info column ── */}
            <Motion.div
              className="flex-1 min-w-0 pt-0 lg:pt-12"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.06 }}
            >
              {/* Title */}
              <h1
                className="font-display font-black text-[#F5EBE0] leading-tight mb-2"
                style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', letterSpacing: '-0.02em' }}
              >
                {anime.animeName}
              </h1>

              {anime.studio && (
                <p className="text-[#AAAAAA] text-sm font-accent mb-4">{anime.studio}</p>
              )}

              {/* Genre tags */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {genres.map(g => (
                    <span
                      key={g}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold"
                      style={{
                        background: 'rgba(221,4,38,0.08)',
                        border: '1px solid rgba(221,4,38,0.18)',
                        color: '#DD0426',
                      }}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Rating stars */}
              {anime.rating && (
                <div className="flex items-center gap-2 mb-5">
                  <RatingStars score={anime.rating} />
                  <span className="text-[#AAAAAA] text-xs font-mono">{anime.rating.toFixed(1)} / 10</span>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 mb-7 pb-7 border-b border-[#AAAAAA]/10">
                <MetaItem icon={CalendarBlank} label="Released" value={
                  anime.releaseDate
                    ? new Date(anime.releaseDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
                    : null
                } />
                <MetaItem icon={Clock} label="Status" value={
                  typeof anime.is_running === 'boolean'
                    ? anime.is_running ? 'Currently Airing' : 'Finished'
                    : null
                } />
                <MetaItem icon={Users} label="Rating" value={
                  typeof anime.is_adult_rated === 'boolean'
                    ? anime.is_adult_rated ? '18+' : 'All Ages'
                    : null
                } />
                <MetaItem icon={FilmSlate} label="Studio" value={anime.studio} />
                {genres.length > 0 && (
                  <MetaItem icon={Star} label="Genres" value={`${genres.length} genres`} />
                )}
              </div>

              {/* Action buttons */}
              <AnimatePresence mode="wait">
                <Motion.div
                  key={animeStatus}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-wrap gap-2 mb-3"
                >
                  {animeStatus === 'none' && <>
                    <button
                      onClick={() => handleList('watching')}
                      disabled={processing}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                      style={{ background: 'rgba(221,4,38,0.1)', border: '1px solid rgba(221,4,38,0.25)', color: '#DD0426' }}
                    >
                      <Eye size={16} weight="bold" /> Add to Watching
                    </button>
                    <button
                      onClick={() => handleList('watched')}
                      disabled={processing}
                      className="ss-btn-primary px-4 py-2 rounded-xl text-sm"
                    >
                      <CheckCircle size={16} weight="bold" /> Mark Completed
                    </button>
                  </>}

                  {animeStatus === 'watching' && <>
                    <button
                      onClick={() => handleList('watched')}
                      disabled={processing}
                      className="ss-btn-primary px-4 py-2 rounded-xl text-sm"
                    >
                      <CheckCircle size={16} weight="bold" /> Mark Completed
                    </button>
                    <button
                      onClick={() => handleRemove('watching')}
                      disabled={processing}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                      style={{ background: 'rgba(186,175,184,0.05)', border: '1px solid rgba(186,175,184,0.15)', color: '#AAAAAA' }}
                    >
                      <MinusCircle size={16} weight="bold" /> Drop
                    </button>
                  </>}

                  {animeStatus === 'watched' && <>
                    <button
                      onClick={() => handleList('watching')}
                      disabled={processing}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                      style={{ background: 'rgba(221,4,38,0.1)', border: '1px solid rgba(221,4,38,0.25)', color: '#DD0426' }}
                    >
                      <Eye size={16} weight="bold" /> Rewatch
                    </button>
                    <button
                      onClick={() => handleRemove('watched')}
                      disabled={processing}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                      style={{ background: 'rgba(186,175,184,0.05)', border: '1px solid rgba(186,175,184,0.15)', color: '#AAAAAA' }}
                    >
                      <MinusCircle size={16} weight="bold" /> Remove
                    </button>
                  </>}

                  {/* Bookmark Button */}
                  <Motion.button
                    whileTap={{ scale: 0.92 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={handleToggleBookmark}
                    disabled={processing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    style={{ 
                        background: isBookmarked ? 'rgba(255, 255, 255, 0.1)' : 'transparent', 
                        border: `1px solid ${isBookmarked ? 'rgba(255, 255, 255, 0.3)' : 'rgba(186,175,184,0.25)'}`, 
                        color: isBookmarked ? '#F5EBE0' : '#AAAAAA' 
                    }}
                  >
                    <BookmarksSimple size={18} weight={isBookmarked ? "fill" : "bold"} className={isBookmarked ? "text-[#D97706]" : ""} />
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </Motion.button>
                </Motion.div>
              </AnimatePresence>

              {listMsg && (
                <p className={`text-xs font-mono mb-4 ${listMsg.startsWith('Error') ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                  {listMsg}
                </p>
              )}
            </Motion.div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          BODY CONTENT — synopsis, trailer, rating
          ══════════════════════════════════════════════════ */}
      <div className="max-w-[1880px] mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: synopsis + trailer ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Synopsis */}
            <section>
              <h2 className="font-display font-bold text-[#F5EBE0] text-base mb-3 flex items-center gap-2">
                <span className="w-0.5 h-4 rounded-full bg-[#DD0426] inline-block" />
                Synopsis
              </h2>
              <p className="text-[#AAAAAA] text-[14px] leading-[1.8] font-accent">
                {anime.description || 'No synopsis is available for this title.'}
              </p>
            </section>

            {/* Trailer */}
            {trailerUrl && (
              <section>
                <h2 className="font-display font-bold text-[#F5EBE0] text-base mb-3 flex items-center gap-2">
                  <span className="w-0.5 h-4 rounded-full bg-[#DD0426] inline-block" />
                  <PlayCircle size={18} weight="bold" className="text-[#DD0426]" />
                  Trailer
                </h2>
                <div
                  className="relative w-full rounded-xl overflow-hidden border border-[#AAAAAA]/15"
                  style={{ paddingBottom: '56.25%' }}
                >
                  <iframe
                    src={trailerUrl}
                    title={`${anime.animeName} Trailer`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </section>
            )}
          </div>

          {/* ── Right: details + rating form ── */}
          <div className="space-y-6">

            {/* Genre list */}
            {genres.length > 0 && (
              <div
                className="rounded-xl p-5"
                style={{ background: 'rgba(186,175,184,0.03)', border: '1px solid rgba(186,175,184,0.15)' }}
              >
                <h3 className="text-[#AAAAAA] opacity-60 text-[10px] font-mono uppercase tracking-widest mb-3">Genres</h3>
                <div className="flex flex-wrap gap-1.5">
                  {genres.map(g => (
                    <span
                      key={g}
                      className="px-2 py-0.5 rounded text-[11px] font-mono"
                      style={{ background: 'rgba(186,175,184,0.05)', border: '1px solid rgba(186,175,184,0.1)', color: '#AAAAAA' }}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}


            {/* Review Chronicle Module */}
            <section
              className="rounded-xl overflow-hidden border border-[#AAAAAA]/10"
              style={{ background: 'rgba(186,175,184,0.03)' }}
            >
              <div className="p-5 border-b border-[#AAAAAA]/10">
                <h3 className="text-[#F5EBE0] text-xs font-display flex items-center gap-2">
                  <span className="w-0.5 h-3 bg-[#DD0426]" />
                  Rating & Review
                </h3>
              </div>
              
              <div className="p-5 space-y-8 relative">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#DD0426]/5 blur-[60px] pointer-events-none" />

                {userId ? (
                  <form onSubmit={handleRate} className="space-y-8 relative z-10">
                    {/* Direct Drag Caliper Section */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <p className="text-[#AAAAAA] text-[9px] font-accent uppercase tracking-widest">Score</p>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[#DD0426] font-display text-3xl leading-none">
                            {rating ? Math.round(rating) : 0}
                          </span>
                          <span className="text-[#AAAAAA]/30 text-[9px] font-accent tracking-tighter">/ 10</span>
                        </div>
                      </div>
                      
                      {/* Caliper Track */}
                      <div className="relative h-14 bg-white/[0.02] rounded-xl border border-white/[0.05] overflow-visible">

                        {/* Number Line — centered vertically */}
                        <div className="absolute inset-0 flex items-center px-4">
                          {/* Scale baseline */}
                          <div className="absolute left-4 right-4 h-[1px] bg-white/10" />

                          {/* Numbers + ticks */}
                          <div className="relative w-full flex justify-between items-center">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                              const isSelected = Math.round(rating) === num;
                              return (
                                <div
                                  key={num}
                                  onClick={() => setRating(num)}
                                  className="flex flex-col items-center gap-1 cursor-pointer"
                                  style={{ width: '10%' }}
                                >
                                  <Motion.span
                                    animate={{
                                      scale: isSelected ? 1.4 : 1,
                                      opacity: isSelected ? 1 : 0.45,
                                      color: isSelected ? '#DD0426' : '#F5EBE0'
                                    }}
                                    transition={{ type: 'spring', damping: 20, stiffness: 1000 }}
                                    className="font-display text-[11px] leading-none"
                                  >
                                    {num}
                                  </Motion.span>
                                  <div className={`w-px ${num % 5 === 0 ? 'h-2.5 bg-[#DD0426]/50' : 'h-1.5 bg-white/20'}`} />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Lens — anchored to exact same left/right as numbers */}
                        <div className="absolute left-4 right-4 top-0 bottom-0 pointer-events-none">
                          <Motion.div
                            className="absolute top-1/2 -translate-y-1/2 border-2 border-[#DD0426] rounded-lg bg-[#DD0426]/5"
                            animate={{
                              left: rating === 0 ? `calc(5% - 1.25rem)` : `calc(5% + (90% * ${(rating - 1) / 9}) - 1.25rem)`,
                              // always visible
                              opacity: 1,
                              boxShadow: '0 0 18px rgba(221,4,38,0.25)'
                            }}
                            transition={{ type: 'spring', damping: 80, stiffness: 5000 }}
                            style={{ width: '2.5rem', height: '2.75rem' }}
                          >
                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0.5 h-3 bg-[#DD0426] rounded-full shadow-[0_0_6px_rgba(221,4,38,0.8)]" />
                            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0.5 h-3 bg-[#DD0426] rounded-full shadow-[0_0_6px_rgba(221,4,38,0.8)]" />
                          </Motion.div>
                        </div>

                        {/* Invisible drag input */}
                        <input
                          type="range" min="0" max="10" step="0.01"
                          value={rating}
                          onChange={(e) => setRating(parseFloat(e.target.value))}
                          onMouseUp={() => setRating(Math.round(rating))}
                          onTouchEnd={() => setRating(Math.round(rating))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                        />
                      </div>
                    </div>

                    {/* Review Section */}
                    <div className="space-y-3">
                      <p className="text-[#AAAAAA] text-[10px] font-accent uppercase tracking-widest">Written Review</p>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your assessment of this title..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 min-h-[160px] text-[#F5EBE0] font-hand text-lg outline-none focus:border-[#DD0426]/50 transition-all placeholder:text-[#AAAAAA]/20 resize-none"
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                      {ratingMsg.text && (
                        <p className={`text-center text-[10px] font-accent ${ratingMsg.type === 'success' ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                          {ratingMsg.text}
                        </p>
                      )}
                      <button 
                        type="submit" disabled={processing}
                        className="ss-btn-primary w-full py-3 rounded-xl text-[10px] font-black tracking-widest disabled:opacity-50"
                      >
                        {processing ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-[#AAAAAA] font-accent text-sm mb-4">Please sign in to submit a rating.</p>
                    <Link to="/login" className="ss-btn-primary px-6 py-2 rounded-xl text-[10px]">Sign In</Link>
                  </div>
                )}

                {/* Community Chronicles List */}
                {anime?.ratings && anime.ratings.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                    <p className="text-[#AAAAAA] text-[9px] font-accent uppercase tracking-widest">Community Chronicles ({anime.ratings.length})</p>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {anime.ratings.map((r, idx) => (
                        <div key={idx} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-[#AAAAAA] tracking-wider">Chronicle #{idx + 1}</span>
                            <div className="flex items-center gap-1 text-[#D97706]">
                              <Star size={12} weight="fill" />
                              <span className="font-mono text-xs font-bold">{r.score}/10</span>
                            </div>
                          </div>
                          <p className="text-xs text-[#F5EBE0] italic font-accent">
                            "{r.review_text}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Info card */}
            <div
              className="rounded-xl p-5"
              style={{ background: 'rgba(186,175,184,0.03)', border: '1px solid rgba(186,175,184,0.15)' }}
            >
              <h3 className="text-[#AAAAAA] opacity-60 text-[10px] font-mono uppercase tracking-widest mb-4">Info</h3>
              <div className="space-y-3.5">
                <MetaItem icon={CalendarBlank} label="Released" value={
                  anime.releaseDate
                    ? new Date(anime.releaseDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
                    : null
                } />
                <MetaItem icon={Clock} label="Status" value={
                  typeof anime.is_running === 'boolean'
                    ? anime.is_running ? 'Currently Airing' : 'Finished Airing'
                    : null
                } />
                <MetaItem icon={Users} label="Age Rating" value={
                  typeof anime.is_adult_rated === 'boolean'
                    ? anime.is_adult_rated ? '18+ Only' : 'All Ages'
                    : null
                } />
                <MetaItem icon={FilmSlate} label="Studio" value={anime.studio} />
              </div>
            </div>
          </div>
        </div>
      
      {/* ══════════════════════════════════════════════════
          CHRONOLOGICAL SAGA JOURNEY (SNAKE TIMELINE)
          ══════════════════════════════════════════════════ */}
      {anime.seasons && anime.seasons.length > 0 && (
        <SeasonTimeline seasons={anime.seasons} />
      )}
      </div>

      {/* ══════════════════════════════════════════════════
          SCRAPBOOK GRID (Bottom of page)
          ══════════════════════════════════════════════════ */}
      {userId && animeStatus !== 'none' && (
        <div className="max-w-[1880px] mx-auto px-4 sm:px-6">
          <ScrapbookDrawer 
            photos={scrapbookPhotos} 
            onUpload={handleScrapbookUpload} 
            onRemove={handleScrapbookRemove} 
            loading={scrapbookLoading} 
          />
        </div>
      )}
    </div>
  );
}

export default AnimeDetailPage;