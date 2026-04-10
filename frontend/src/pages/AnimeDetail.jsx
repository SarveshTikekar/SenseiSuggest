import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getAnimeDetails, rateAnime, getUserProfile,
  addTowatchedList, addTowatchingList, removeFromWatched, removeFromWatching
} from '../api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
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
  WarningCircle
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
  <div className="min-h-screen" style={{ background: '#0C0C0E' }}>
    {/* Hero area */}
    <div className="relative h-[420px] overflow-hidden">
      <div className="absolute inset-0 ss-skeleton opacity-40" />
    </div>
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 -mt-32 relative z-10 pb-20">
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
          className={i < filled ? 'text-[#D97706]' : 'text-[#3A3A4A]'}
        />
      ))}
    </div>
  );
};

/* ── Metadata row item ── */
const MetaItem = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={14} weight="bold" className="text-[#3A3A4A] mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-[#3A3A4A] text-[10px] font-mono uppercase tracking-wider leading-none mb-0.5">{label}</p>
        <p className="text-[#F0F0F5] text-sm font-medium leading-tight">{value}</p>
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
  const [rating, setRating]         = useState('');
  const [ratingMsg, setRatingMsg]   = useState({ type: '', text: '' });
  const [imgError, setImgError]     = useState(false);

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
    if (!userId || !anime?.animeId) { setStatus('none'); return; }
    getUserProfile(userId).then(res => {
      const { watchedAnime = [], watchingAnime = [] } = res.UserProfile || {};
      if (watchedAnime.includes(anime.animeId))       setStatus('watched');
      else if (watchingAnime.includes(anime.animeId)) setStatus('watching');
      else                                             setStatus('none');
    }).catch(() => {});
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
      setListMsg('Removed from list.');
    } catch (e) { setListMsg(`Error: ${e.message}`); }
    finally { setProcessing(false); }
  };

  const handleRate = async (e) => {
    e.preventDefault();
    setRatingMsg({ type: '', text: '' });
    if (!userId) { setRatingMsg({ type: 'error', text: 'Log in to rate anime.' }); return; }
    const score = parseInt(rating);
    if (isNaN(score) || score < 1 || score > 10) { setRatingMsg({ type: 'error', text: 'Enter a score from 1 to 10.' }); return; }
    try {
      await rateAnime({ userId, animeId: anime.animeId, score, review_text: 'User rated via Sensei Suggest' });
      setRatingMsg({ type: 'success', text: `Rated ${score}/10` });
      setRating('');
    } catch (e) {
      setRatingMsg({ type: 'error', text: e.message || 'Failed to submit.' });
    }
  };

  /* ── States ── */
  if (loading) return <SkeletonDetail />;
  if (error)   return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <WarningCircle size={40} weight="duotone" className="text-[#3A3A4A] mb-3" />
      <p className="text-[#F0F0F5] font-display font-bold text-xl mb-1">Something went wrong</p>
      <p className="text-[#888895] text-sm mb-5">{error}</p>
      <Link to="/all-anime" className="ss-btn-ghost px-4 py-2 rounded-xl text-sm">
        ← Back to Browse
      </Link>
    </div>
  );
  if (!anime) return (
    <div className="py-32 text-center text-[#888895]">Anime not found.</div>
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
              background: 'linear-gradient(to bottom, #0C0C0E 0%, transparent 30%, transparent 70%, #0C0C0E 100%)',
            }}
          />
          {/* Side vignette */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, #0C0C0E 0%, transparent 20%, transparent 80%, #0C0C0E 100%)' }}
          />
        </div>

        {/* ── Main content row — sits on top of the hero ── */}
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 pt-10 pb-8">

          {/* Back button */}
          <Link
            to="/all-anime"
            className="inline-flex items-center gap-1.5 text-[#3A3A4A] hover:text-[#888895] text-xs font-mono mb-8 transition-colors"
          >
            <CaretLeft size={14} weight="bold" /> Browse
          </Link>

          <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">

            {/* ── Poster column ── */}
            <div className="flex-shrink-0 w-full lg:w-80 xl:w-96">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative rounded-xl overflow-hidden border border-[#222228] shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
                style={{ aspectRatio: '16/9' }}
              >
                {poster ? (
                  <div className="w-full h-full relative">
                    {/* Blurred Backdrop */}
                    <img 
                      src={poster} 
                      className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-40 scale-125 pointer-events-none"
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
                  <div className="w-full h-full bg-[#1A1A20] flex items-center justify-center">
                    <FilmSlate size={40} weight="duotone" className="text-[#3A3A4A]" />
                  </div>
                )}

                {/* Score badge */}
                {anime.rating && (
                  <div
                    className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(12,12,14,0.85)', border: '1px solid #222228' }}
                  >
                    <Star size={12} weight="fill" className="text-[#D97706]" />
                    <span className="text-[#F0F0F5] text-xs font-mono font-semibold">{anime.rating.toFixed(1)}</span>
                  </div>
                )}

                {/* Status badge */}
                {animeStatus !== 'none' && (
                  <div
                    className="absolute bottom-2.5 left-2.5 right-2.5 py-1.5 text-center rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider"
                    style={{
                      background: animeStatus === 'watching'
                        ? 'rgba(12,12,14,0.9)'
                        : 'rgba(232,56,90,0.15)',
                      border: `1px solid ${animeStatus === 'watching' ? '#222228' : 'rgba(232,56,90,0.3)'}`,
                      color: animeStatus === 'watching' ? '#888895' : '#E8385A',
                    }}
                  >
                    {animeStatus === 'watching' ? '▶ Watching' : '✓ Completed'}
                  </div>
                )}
              </motion.div>
            </div>

            {/* ── Info column ── */}
            <motion.div
              className="flex-1 min-w-0 pt-0 lg:pt-12"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.06 }}
            >
              {/* Title */}
              <h1
                className="font-display font-black text-[#F0F0F5] leading-tight mb-2"
                style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', letterSpacing: '-0.02em' }}
              >
                {anime.animeName}
              </h1>

              {anime.studio && (
                <p className="text-[#888895] text-sm font-sans mb-4">{anime.studio}</p>
              )}

              {/* Genre tags */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {genres.map(g => (
                    <span
                      key={g}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold"
                      style={{
                        background: 'rgba(232,56,90,0.08)',
                        border: '1px solid rgba(232,56,90,0.18)',
                        color: '#E8385A',
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
                  <span className="text-[#888895] text-xs font-mono">{anime.rating.toFixed(1)} / 10</span>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 mb-7 pb-7 border-b border-[#222228]">
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
                <motion.div
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
                      style={{ background: 'rgba(232,56,90,0.1)', border: '1px solid rgba(232,56,90,0.25)', color: '#E8385A' }}
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
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #222228', color: '#888895' }}
                    >
                      <MinusCircle size={16} weight="bold" /> Drop
                    </button>
                  </>}

                  {animeStatus === 'watched' && <>
                    <button
                      onClick={() => handleList('watching')}
                      disabled={processing}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                      style={{ background: 'rgba(232,56,90,0.1)', border: '1px solid rgba(232,56,90,0.25)', color: '#E8385A' }}
                    >
                      <Eye size={16} weight="bold" /> Rewatch
                    </button>
                    <button
                      onClick={() => handleRemove('watched')}
                      disabled={processing}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #222228', color: '#888895' }}
                    >
                      <MinusCircle size={16} weight="bold" /> Remove
                    </button>
                  </>}
                </motion.div>
              </AnimatePresence>

              {listMsg && (
                <p className={`text-xs font-mono mb-4 ${listMsg.startsWith('Error') ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                  {listMsg}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          BODY CONTENT — synopsis, trailer, rating
          ══════════════════════════════════════════════════ */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: synopsis + trailer ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Synopsis */}
            <section>
              <h2 className="font-display font-bold text-[#F0F0F5] text-base mb-3 flex items-center gap-2">
                <span className="w-0.5 h-4 rounded-full bg-[#E8385A] inline-block" />
                Synopsis
              </h2>
              <p className="text-[#888895] text-[14px] leading-[1.8] font-sans">
                {anime.description || 'No synopsis is available for this title.'}
              </p>
            </section>

            {/* Trailer */}
            {trailerUrl && (
              <section>
                <h2 className="font-display font-bold text-[#F0F0F5] text-base mb-3 flex items-center gap-2">
                  <span className="w-0.5 h-4 rounded-full bg-[#E8385A] inline-block" />
                  <PlayCircle size={18} weight="bold" className="text-[#E8385A]" />
                  Trailer
                </h2>
                <div
                  className="relative w-full rounded-xl overflow-hidden border border-[#222228]"
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
                style={{ background: '#131316', border: '1px solid #222228' }}
              >
                <h3 className="text-[#3A3A4A] text-[10px] font-mono uppercase tracking-widest mb-3">Genres</h3>
                <div className="flex flex-wrap gap-1.5">
                  {genres.map(g => (
                    <span
                      key={g}
                      className="px-2 py-0.5 rounded text-[11px] font-mono"
                      style={{ background: '#1A1A20', border: '1px solid #222228', color: '#888895' }}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rate This Anime */}
            <div
              className="rounded-xl p-5"
              style={{ background: '#131316', border: '1px solid #222228' }}
            >
              <h3 className="text-[#3A3A4A] text-[10px] font-mono uppercase tracking-widest mb-4">Your Rating</h3>

              {ratingMsg.text && (
                <div
                  className="mb-3 px-3 py-2 rounded-lg text-xs font-mono"
                  style={{
                    background: ratingMsg.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${ratingMsg.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    color: ratingMsg.type === 'success' ? '#22C55E' : '#EF4444',
                  }}
                >
                  {ratingMsg.text}
                </div>
              )}

              {userId ? (
                <form onSubmit={handleRate} className="space-y-3">
                  {/* Star selector row */}
                  <div className="flex gap-1">
                    {[2, 4, 6, 8, 10].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRating(String(val))}
                        className="flex-1 py-2 rounded-lg text-xs font-mono transition-all"
                        style={{
                          background: parseInt(rating) >= val ? 'rgba(232,56,90,0.15)' : '#1A1A20',
                          border: `1px solid ${parseInt(rating) >= val ? 'rgba(232,56,90,0.3)' : '#222228'}`,
                          color: parseInt(rating) >= val ? '#E8385A' : '#3A3A4A',
                        }}
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number" min="1" max="10"
                      value={rating}
                      onChange={e => setRating(e.target.value)}
                      placeholder="1 – 10"
                      className="flex-1 bg-[#1A1A20] border border-[#222228] rounded-xl px-3 py-2.5 text-[#F0F0F5] text-sm text-center font-mono outline-none focus:border-[rgba(232,56,90,0.4)] transition-colors"
                    />
                    <button type="submit" className="ss-btn-primary px-4 py-2.5 rounded-xl text-sm flex-1">
                      Submit
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-[#3A3A4A] text-sm font-sans">
                  <Link to="/login" className="text-[#E8385A] hover:underline">Log in</Link> to rate this anime.
                </p>
              )}
            </div>

            {/* Info card */}
            <div
              className="rounded-xl p-5"
              style={{ background: '#131316', border: '1px solid #222228' }}
            >
              <h3 className="text-[#3A3A4A] text-[10px] font-mono uppercase tracking-widest mb-4">Info</h3>
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
      </div>
    </div>
  );
}

export default AnimeDetailPage;