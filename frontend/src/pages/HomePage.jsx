import React, { useEffect, useState } from 'react';
import { useAuth }  from '../context/AuthContext';
import { Link }     from 'react-router-dom';
import { motion }   from 'framer-motion';
import { getAllAnime } from '../api';
import {
  TelevisionSimple, Sparkle, BookmarkSimple,
  ArrowRight, MagnifyingGlass
} from '@phosphor-icons/react';

/* ── Wordmark logo (text-only, no generic icon) ── */
const WordMark = ({ size = '20px' }) => (
  <span
    className="font-display font-black select-none pointer-events-none"
    style={{
      fontSize: size,
      letterSpacing: '-0.04em',
      background: 'linear-gradient(135deg, #E8385A 0%, #F0A0B0 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}
  >
    SS.
  </span>
);

/* ── Mini anime preview card (homepage teaser) ── */
const PreviewCard = ({ anime }) => (
  <Link
    to={`/anime/details/${encodeURIComponent(anime.animeName)}`}
    className="block flex-shrink-0 group"
    style={{ width: '130px' }}
  >
    <div style={{
      width: '180px', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden',
      background: '#131316', border: '1px solid #222228', flexShrink: 0,
      transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)', position: 'relative',
    }}
      className="group-hover:border-[#E8385A]/40 group-hover:-translate-y-1"
    >
      {/* Blurred Backdrop */}
      <img
        src={anime.image_url_base_anime || ''}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(16px)', opacity: 0.3, transform: 'scale(1.1)' }}
        aria-hidden
      />
      <img
        src={anime.image_url_base_anime || ''}
        alt={anime.animeName}
        style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }}
        className="transition-transform duration-500 group-hover:scale-105"
        onError={e => { e.target.style.display = 'none'; }}
      />
    </div>
    <div className="mt-2 space-y-0.5">
      <p
        className="font-display font-black line-clamp-1 group-hover:text-[#E8385A] transition-colors"
        style={{ fontSize: '13px', color: '#F0F0F5', letterSpacing: '-0.01em' }}
      >
        {anime.animeName}
      </p>
      <p style={{ fontSize: '10px', color: '#3A3A4A', fontWeight: 500 }}>
        Sub | Dub
      </p>
    </div>
  </Link>
);

function HomePage({ onSearchOpen }) {
  const { userId }        = useAuth();
  const [preview, setPreview] = useState([]);

  /* Fetch a sample of 8 anime for the library preview */
  useEffect(() => {
    getAllAnime()
      .then(list => setPreview(list.slice(0, 8)))
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: '#0C0C0E', minHeight: '100vh' }}>

      {/* Ambient — CSS only */}
      <div aria-hidden style={{
        pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 900px 600px at 50% -5%, rgba(232,56,90,0.045), transparent)',
      }} />

      <div className="relative" style={{ zIndex: 10, maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* ════════════════ HERO ════════════════ */}
        <section style={{ paddingTop: '72px', paddingBottom: '64px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Eyebrow — line + label, no pill badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ width: '28px', height: '1px', background: '#E8385A', display: 'inline-block' }} />
              <span style={{
                color: '#888895', fontSize: '10px', fontFamily: 'Space Grotesk',
                fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase'
              }}>
                Anime Discovery Engine
              </span>
            </div>

            {/* Main headline */}
            <h1
              className="font-display font-black"
              style={{
                color: '#F0F0F5', lineHeight: 1.04,
                letterSpacing: '-0.025em', marginBottom: '20px',
                fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
              }}
            >
              The Sensei knows<br />
              <span style={{
                background: 'linear-gradient(135deg, #E8385A 0%, #C94470 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                what you'll love.
              </span>
            </h1>

            <p className="font-sans" style={{ color: '#888895', fontSize: '15px', lineHeight: 1.7, maxWidth: '480px', marginBottom: '32px' }}>
              {userId
                ? "Your list is synced. The Sensei's been curating."
                : "We analyse your taste, community signals, and genre history to surface anime you'd actually finish — not just what's trending."}
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              {userId ? (
                <>
                  <Link to="/get_recommendations" className="ss-btn-primary" style={{ borderRadius: '10px', fontSize: '13px', padding: '10px 20px' }}>
                    My Recommendations <ArrowRight size={14} weight="bold" />
                  </Link>
                  <Link to="/all-anime" className="ss-btn-ghost" style={{ borderRadius: '10px', fontSize: '13px', padding: '10px 20px' }}>
                    Full Library
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup" className="ss-btn-primary" style={{ borderRadius: '10px', fontSize: '13px', padding: '10px 20px' }}>
                    Get Started <ArrowRight size={14} weight="bold" />
                  </Link>
                  <Link to="/all-anime" className="ss-btn-ghost" style={{ borderRadius: '10px', fontSize: '13px', padding: '10px 20px' }}>
                    Browse Anime
                  </Link>
                </>
              )}
              {onSearchOpen && (
                <button
                  onClick={onSearchOpen}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '9px 14px', borderRadius: '10px',
                    border: '1px solid #222228', background: '#1A1A20',
                    color: '#3A3A4A', fontSize: '12px', fontFamily: 'Space Grotesk', cursor: 'pointer',
                    transition: 'color 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#888895'; e.currentTarget.style.borderColor = '#3A3A4A'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#3A3A4A'; e.currentTarget.style.borderColor = '#222228'; }}
                >
                  <MagnifyingGlass size={16} weight="bold" />
                  Quick search
                  <kbd style={{
                    padding: '1px 5px', borderRadius: '4px',
                    background: '#0C0C0E', border: '1px solid #222228',
                    fontSize: '10px', fontFamily: 'Space Grotesk',
                  }}>⌘K</kbd>
                </button>
              )}
            </div>
          </motion.div>
        </section>

        {/* ════════════════ LIBRARY PREVIEW (Q7-A) ════════════════ */}
        {preview.length > 0 && (
          <section style={{ paddingBottom: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '2px', height: '16px', background: '#E8385A', borderRadius: '99px', display: 'inline-block' }} />
                <h2 className="font-display font-bold" style={{ color: '#F0F0F5', fontSize: '16px' }}>From the Library</h2>
              </div>
              <Link
                to="/all-anime"
                className="flex items-center gap-1 font-mono transition-colors"
                style={{ color: '#3A3A4A', fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase' }}
              >
                Explore all <ArrowRight size={11} weight="bold" />
              </Link>
            </div>

            {/* Horizontal scroll row of preview cards */}
            <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '10px' }}
              className="scrollbar-hide"
            >
              {preview.map(anime => (
                <PreviewCard key={anime.animeId} anime={anime} />
              ))}
            </div>
          </section>
        )}

        {/* ════════════════ DIVIDER ════════════════ */}
        <div style={{ height: '1px', background: '#1A1A20', marginBottom: '48px' }} />

        {/* ════════════════ FEATURES — Intentionally asymmetric ════════════════ */}
        <section style={{ paddingBottom: '80px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 className="font-display font-bold" style={{ color: '#F0F0F5', fontSize: '18px', marginBottom: '4px' }}>Built different.</h2>
            <p style={{ color: '#3A3A4A', fontSize: '11px', fontFamily: 'Space Grotesk', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Not your average watchlist. Not a recommendation spam engine.
            </p>
          </div>

          {/* Asymmetric bento — NOT a symmetric 3-col template */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'auto auto', gap: '14px' }}>

            {/* Wide card (2 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="ss-card"
              style={{ gridColumn: 'span 2', padding: '28px 32px', display: 'flex', alignItems: 'flex-start', gap: '20px' }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                background: 'rgba(232,56,90,0.1)', border: '1px solid rgba(232,56,90,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkle size={18} weight="duotone" color="#E8385A" />
              </div>
              <div>
                <h3 className="font-display font-bold" style={{ color: '#F0F0F5', fontSize: '15px', marginBottom: '8px' }}>
                  AI Recommendations
                </h3>
                <p className="font-sans" style={{ color: '#888895', fontSize: '13px', lineHeight: 1.7 }}>
                  Trained on your watch history and community signals — not just what was released this week. The more you use it, the sharper it gets.
                </p>
              </div>
            </motion.div>

            {/* Tall card (1 col, 2 rows) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="ss-card"
              style={{ gridColumn: '3', gridRow: '1 / span 2', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(109,40,217,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BookmarkSimple size={16} weight="duotone" color="#8B5CF6" />
              </div>
              <div>
                <h3 className="font-display font-bold" style={{ color: '#F0F0F5', fontSize: '15px', marginBottom: '6px' }}>Track Everything</h3>
                <p className="font-sans" style={{ color: '#888895', fontSize: '13px', lineHeight: 1.7 }}>Watching, completed, dropped. Rate it, remember it, revisit it.</p>
              </div>
              {!userId && (
                <Link
                  to="/signup"
                  className="font-mono"
                  style={{
                    marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px',
                    color: '#E8385A', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}
                >
                  Start tracking <ArrowRight size={11} weight="bold" />
                </Link>
              )}
            </motion.div>

            {/* Bottom left small card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.4 }}
              className="ss-card"
              style={{ gridColumn: 'span 2', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TelevisionSimple size={16} weight="duotone" color="#D97706" />
              </div>
              <div>
                <h3 className="font-display font-bold" style={{ color: '#F0F0F5', fontSize: '14px', marginBottom: '3px' }}>Deep Discovery</h3>
                <p className="font-sans" style={{ color: '#888895', fontSize: '12px', lineHeight: 1.6 }}>
                  Filter by genre, season, studio. Cut through thousands of titles with precision.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Mobile: stack to 1 col */}
          <style>{`@media (max-width: 640px) { .bento-grid { grid-template-columns: 1fr !important; } .bento-grid > div { grid-column: auto !important; grid-row: auto !important; } }`}</style>
        </section>

        {/* ════════════════ GUEST CTA ════════════════ */}
        {!userId && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ paddingBottom: '80px' }}
          >
            <div style={{
              padding: '32px', borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(232,56,90,0.06) 0%, rgba(109,40,217,0.07) 100%)',
              border: '1px solid rgba(232,56,90,0.1)',
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
              <div>
                <h2 className="font-display font-bold" style={{ color: '#F0F0F5', fontSize: '20px', marginBottom: '4px' }}>Start for free.</h2>
                <p className="font-sans" style={{ color: '#888895', fontSize: '13px' }}>Browse everything without signing up. Register when you're ready to track and get recommendations.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/login"  className="ss-btn-ghost"   style={{ borderRadius: '10px', fontSize: '13px', padding: '9px 18px' }}>Log In</Link>
                <Link to="/signup" className="ss-btn-primary" style={{ borderRadius: '10px', fontSize: '13px', padding: '9px 18px' }}>
                  Create Account <ArrowRight size={13} weight="bold" />
                </Link>
              </div>
            </div>
          </motion.section>
        )}

      </div>
    </div>
  );
}

export default HomePage;