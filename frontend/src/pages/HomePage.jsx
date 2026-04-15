import React, { useEffect, useState } from 'react';
import { useAuth }  from '../context/AuthContext';
import { Link }     from 'react-router-dom';
import { 
  motion as Motion, 
  AnimatePresence, 
  useReducedMotion, 
  useMotionValue, 
  useSpring, 
  useTransform,
  animate
} from 'framer-motion';
import { getAllAnime } from '../api';
import ichigoImage from '../assets/Landing_Page/optimized/cutout/Ichigo_cutout.webp';
import luffyImage from '../assets/Landing_Page/Luffy.png';
import tanjiroImage from '../assets/Landing_Page/optimized/cutout/Tanjiro_cutout.webp';
import gokuImage from '../assets/Landing_Page/Goku.png';
import frierenImage from '../assets/Landing_Page/Frieren.jpeg';
import momoImage from '../assets/Landing_Page/Momo.png';
import namiImage from '../assets/Landing_Page/Nami.png';
import shinobuImage from '../assets/Landing_Page/Shinobu.png';
import denjiImage from '../assets/Landing_Page/Denji.jpg';
import makimaImage from '../assets/Landing_Page/Makima.png';
import {
  TelevisionSimple, Sparkle, BookmarkSimple,
  ArrowRight, MagnifyingGlass
} from '@phosphor-icons/react';

const HERO_THEME = {
  crimson: '#DD0426',
  charcoal: '#0D0D0D',
  cream: '#F5EBE0',
  textMuted: '#AAAAAA',
};

/* ── Mini anime preview card (homepage teaser) ── */
const PreviewCard = ({ anime }) => (
  <Link
    to={`/anime/details/${encodeURIComponent(anime.animeName)}`}
    className="block flex-shrink-0 group"
    style={{ width: '130px' }}
  >
    <div style={{
      width: '180px', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden',
      background: '#1A1A1A', border: '1px solid #2A2A2A', flexShrink: 0,
      transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)', position: 'relative',
    }}
      className="group-hover:border-[#DD0426]/40 group-hover:-translate-y-1"
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
        className="font-display font-black line-clamp-1 group-hover:text-[#DD0426] transition-colors"
        style={{ fontSize: '13px', color: '#F5EBE0', letterSpacing: '-0.01em' }}
      >
        {anime.animeName}
      </p>
      <p style={{ fontSize: '10px', color: '#8D7F8B', fontWeight: 500 }}>
        Sub | Dub
      </p>
    </div>
  </Link>
);

const CURATED_HERO_IMAGES = {
  main: luffyImage,
  orbitA: ichigoImage,
  orbitB: tanjiroImage,
};

const CHARACTER_POOL = [
  { id: 'luffy', src: luffyImage, name: 'Luffy' },
  { id: 'frieren', src: frierenImage, name: 'Frieren' },
  { id: 'ichigo', src: ichigoImage, name: 'Ichigo' },
  { id: 'momo', src: momoImage, name: 'Momo' },
  { id: 'tanjiro', src: tanjiroImage, name: 'Tanjiro' },
  { id: 'nami', src: namiImage, name: 'Nami' },
  { id: 'goku', src: gokuImage, name: 'Goku' },
  { id: 'makima', src: makimaImage, name: 'Makima' },
  { id: 'denji', src: denjiImage, name: 'Denji' },
  { id: 'shinobu', src: shinobuImage, name: 'Shinobu' },
];

const HeroCarouselPortal = ({ i, rotation, character, springX, springY }) => {
  const baseAngle = i * 72;
  const angle = useTransform(rotation, (r) => (r + baseAngle) % 360);
  
  const orbitRadius = 310;
  const rad = useTransform(angle, (a) => (a * Math.PI) / 180);
  
  const x = useTransform(rad, (r) => Math.sin(r) * orbitRadius);
  const zIndex = useTransform(rad, (r) => Math.round(Math.cos(r) * 10) + 10);
  const scale = useTransform(rad, (r) => 0.6 + (Math.cos(r) + 1) * 0.2);
  const opacity = useTransform(rad, (r) => 0.3 + (Math.cos(r) + 1) * 0.3);
  const yOffset = useTransform(rad, (r) => Math.cos(r) * 60);

  const finalX = useTransform([x, springX], ([lat, m]) => lat + (m - 960) * 0.04);
  const finalY = useTransform([yOffset, springY], ([vert, m]) => vert + (m - 540) * 0.04);

  const [visCharacter, setVisCharacter] = useState(character);
  const coinRotateY = useMotionValue(0);

  useEffect(() => {
    if (character.id !== visCharacter.id) {
      // Step 1: Fold to 90 degrees (edge-on)
      animate(coinRotateY, 90, {
        duration: 0.6,
        ease: "easeIn" 
      }).then(() => {
        // Step 2: Swap content and jump to -90 immediately
        setVisCharacter(character);
        coinRotateY.set(-90);
        
        // Step 3: Unfold to 0 degrees
        animate(coinRotateY, 0, {
          duration: 0.6,
          ease: "easeOut" 
        });
      });
    }
  }, [character.id, visCharacter.id, coinRotateY, character]);

  const MotionDiv = Motion.div;

  return (
    <MotionDiv
      className="hero-mosaic-card-wrapper"
      style={{
        left: '50%',
        top: '45%',
        x: finalX,
        y: finalY,
        zIndex,
        scale,
        opacity,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      <MotionDiv
        style={{ rotateY: coinRotateY }}
        className="hero-mosaic-card"
      >
        <MotionDiv 
          className="hero-mosaic-card-pulse"
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <div className="hero-mosaic-card-bg" />
        <img 
          src={visCharacter.src} 
          alt={visCharacter.name} 
          className="hero-mosaic-img" 
        />
      </MotionDiv>
    </MotionDiv>
  );
};

const HeroVisualCluster = ({ reduceMotion }) => {
  const [portalIndices, setPortalIndices] = useState([0, 2, 4, 6, 8]);
  
  const mouseX = useMotionValue(960);
  const mouseY = useMotionValue(540);
  const springX = useSpring(mouseX, { damping: 25, stiffness: 120 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 120 });

  const rotation = useMotionValue(0);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Continuous 17s orbit - respect user's reduced motion preference
    let controls;
    if (!reduceMotion) {
      controls = animate(rotation, 360, {
        duration: 17,
        ease: "linear",
        repeat: Infinity,
      });
    }

    // Swap characters every 8s as requested
    const interval = setInterval(() => {
      setPortalIndices(prev => prev.map(idx => (idx + 1) % CHARACTER_POOL.length));
    }, 8000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controls) controls.stop();
      clearInterval(interval);
    };
  }, [mouseX, mouseY, rotation, reduceMotion]);

  const MotionAside = Motion.aside;

  return (
    <MotionAside
      className="hero-mosaic-shell"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="hero-mosaic-container">
        {/* Preload all characters for seamless flip sync */}
        <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
          {CHARACTER_POOL.map(c => <img key={c.id} src={c.src} alt="" />)}
        </div>
        <div className="hero-mosaic-glow" />

        {[0, 1, 2, 3, 4].map((i) => (
          <HeroCarouselPortal 
            key={`portal-${i}`}
            i={i}
            rotation={rotation}
            character={CHARACTER_POOL[portalIndices[i]]}
            springX={springX}
            springY={springY}
          />
        ))}
      </div>

      <style>{`
        .hero-mosaic-shell {
          position: relative;
          height: 540px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-mosaic-container {
          position: relative;
          width: 100%;
          height: 100%;
          max-width: 700px;
        }
        .hero-mosaic-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(221,4,38,0.15) 0%, transparent 70%);
          filter: blur(40px);
          pointer-events: none;
        }
        .hero-mosaic-card-wrapper {
          position: absolute;
          pointer-events: auto;
        }
        .hero-mosaic-card {
          position: relative;
          width: clamp(180px, 24vw, 240px);
          aspect-ratio: 1 / 1;
          background: rgba(13, 13, 13, 0.4);
          border: 1px solid rgba(221, 4, 38, 0.2);
          border-radius: 50%;
          overflow: hidden;
          transform-style: preserve-3d;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(221, 4, 38, 0.1);
          cursor: pointer;
        }
        .hero-mosaic-card:hover {
          transform: scale(1.05) !important;
          border-color: rgba(221, 4, 38, 0.5);
          box-shadow: 0 15px 40px rgba(221, 4, 38, 0.25), 0 0 25px rgba(221, 4, 38, 0.2);
        }
        .hero-mosaic-card-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%, rgba(221,4,38,0.15) 0%, transparent 70%);
          pointer-events: none;
          z-index: 1;
        }
        .hero-mosaic-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          filter: saturate(1.1) contrast(1.05);
          z-index: 2;
          transition: transform 0.5s ease;
        }
        .hero-mosaic-card-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(221, 4, 38, 0.4);
          box-shadow: 0 0 20px rgba(221, 4, 38, 0.3);
          pointer-events: none;
          z-index: 3;
        }
        .hero-mosaic-card:hover .hero-mosaic-img {
          transform: scale(1.1);
        }
        @media (max-width: 1024px) {
          .hero-mosaic-shell {
            height: 400px;
            margin-top: 2rem;
          }
          .hero-mosaic-container {
            max-width: 100%;
          }
        }
        @media (max-width: 640px) {
          .hero-mosaic-card {
            width: 120px;
          }
        }
      `}</style>
    </MotionAside>
  );
};

function HomePage({ onSearchOpen }) {
  const { userId }        = useAuth();
  const [preview, setPreview] = useState([]);
  const reduceMotion = useReducedMotion();

  /* Fetch a sample of 8 anime for the library preview */
  useEffect(() => {
    getAllAnime()
      .then(list => setPreview(list.slice(0, 8)))
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: '#0D0D0D', minHeight: '100vh' }}>

      {/* Ambient — CSS only */}
      <div aria-hidden style={{
        pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 900px 600px at 50% -5%, rgba(221,4,38,0.03), transparent)',
      }} />

      <div className="relative" style={{ zIndex: 10, maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* ════════════════ HERO ════════════════ */}
        <section style={{ paddingTop: '72px', paddingBottom: '64px' }}>
          <div className="hero-main-grid" style={{ display: 'grid', gap: '28px', alignItems: 'start' }}>
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Eyebrow — line + label, no pill badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <span style={{ width: '28px', height: '1px', background: HERO_THEME.crimson, display: 'inline-block' }} />
                <span style={{
                  color: HERO_THEME.textMuted, fontSize: '10px', fontFamily: 'Space Grotesk',
                  fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase'
                }}>
                  Anime Discovery Engine
                </span>
              </div>

              {/* Main headline */}
              <h1
                className="font-display font-black"
                style={{
                  color: HERO_THEME.cream, lineHeight: 1.04,
                  letterSpacing: '-0.025em', marginBottom: '20px',
                  fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
                }}
              >
                The Sensei knows<br />
                <span style={{
                  background: `linear-gradient(135deg, ${HERO_THEME.crimson} 0%, ${HERO_THEME.cream} 130%)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  what you'll love.
                </span>
              </h1>

              <p className="font-sans" style={{ color: HERO_THEME.textMuted, fontSize: '15px', lineHeight: 1.7, maxWidth: '480px', marginBottom: '32px' }}>
                {userId
                  ? "Your list is synced. The Sensei's been curating."
                  : "We analyse your taste, community signals, and genre history to surface anime you'd actually finish — not just what's trending."}
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                {userId ? (
                  <>
                    <Link
                      to="/get_recommendations"
                      className="ss-btn-primary"
                      style={{
                        borderRadius: '10px',
                        fontSize: '13px',
                        padding: '10px 20px',
                        background: `linear-gradient(135deg, ${HERO_THEME.crimson}, #A10A24)`,
                        boxShadow: '0 6px 24px rgba(221, 4, 38, 0.28)'
                      }}
                    >
                      My Recommendations <ArrowRight size={14} weight="bold" />
                    </Link>
                    <Link
                      to="/all-anime"
                      className="ss-btn-ghost"
                      style={{
                        borderRadius: '10px',
                        fontSize: '13px',
                        padding: '10px 20px',
                        color: HERO_THEME.cream,
                        borderColor: 'rgba(170, 170, 170, 0.2)',
                        background: 'rgba(170, 170, 170, 0.05)',
                      }}
                    >
                      Full Library
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="ss-btn-primary"
                      style={{
                        borderRadius: '10px',
                        fontSize: '13px',
                        padding: '10px 20px',
                        background: `linear-gradient(135deg, ${HERO_THEME.crimson}, #A10A24)`,
                        boxShadow: '0 6px 24px rgba(221, 4, 38, 0.28)',
                      }}
                    >
                      Get Started <ArrowRight size={14} weight="bold" />
                    </Link>
                    <Link
                      to="/all-anime"
                      className="ss-btn-ghost"
                      style={{
                        borderRadius: '10px',
                        fontSize: '13px',
                        padding: '10px 20px',
                        color: HERO_THEME.cream,
                        borderColor: 'rgba(170, 170, 170, 0.2)',
                        background: 'rgba(170, 170, 170, 0.05)',
                      }}
                    >
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
                        border: '1px solid rgba(170, 170, 170, 0.15)', background: 'rgba(170, 170, 170, 0.05)',
                        color: HERO_THEME.textMuted, fontSize: '12px', fontFamily: 'Space Grotesk', cursor: 'pointer',
                        transition: 'color 0.2s, border-color 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = HERO_THEME.cream; e.currentTarget.style.borderColor = 'rgba(170, 170, 170, 0.35)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = HERO_THEME.textMuted; e.currentTarget.style.borderColor = 'rgba(170, 170, 170, 0.15)'; }}
                    >
                      <MagnifyingGlass size={16} weight="bold" />
                      Quick search
                      <kbd style={{
                        padding: '1px 5px', borderRadius: '4px',
                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(170, 170, 170, 0.18)',
                        fontSize: '10px', fontFamily: 'Space Grotesk', color: HERO_THEME.cream,
                      }}>⌘K</kbd>
                    </button>
                )}
              </div>
            </Motion.div>

            <HeroVisualCluster reduceMotion={Boolean(reduceMotion)} />
          </div>
          <style>{`
            .hero-main-grid {
              grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr);
            }
            @media (max-width: 1024px) {
              .hero-main-grid { grid-template-columns: 1fr; }
            }
          `}</style>
        </section>

        {/* ════════════════ LIBRARY PREVIEW (Q7-A) ════════════════ */}
        {preview.length > 0 && (
          <section style={{ paddingBottom: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '2px', height: '16px', background: HERO_THEME.crimson, borderRadius: '99px', display: 'inline-block' }} />
                <h2 className="font-display font-bold" style={{ color: HERO_THEME.cream, fontSize: '16px' }}>From the Library</h2>
              </div>
              <Link
                to="/all-anime"
                className="flex items-center gap-1 font-mono transition-colors"
                style={{ color: HERO_THEME.textMuted, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase' }}
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
        <div style={{ height: '1px', background: 'rgba(170, 170, 170, 0.1)', marginBottom: '48px' }} />

        {/* ════════════════ FEATURES — Intentionally asymmetric ════════════════ */}
        <section style={{ paddingBottom: '80px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 className="font-display font-bold" style={{ color: HERO_THEME.cream, fontSize: '18px', marginBottom: '4px' }}>Built different.</h2>
            <p style={{ color: HERO_THEME.textMuted, fontSize: '11px', fontFamily: 'Space Grotesk', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Not your average watchlist. Not a recommendation spam engine.
            </p>
          </div>

          {/* Asymmetric bento — NOT a symmetric 3-col template */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'auto auto', gap: '14px' }}>

            {/* Wide card (2 cols) */}
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="ss-card"
              style={{ gridColumn: 'span 2', padding: '28px 32px', display: 'flex', alignItems: 'flex-start', gap: '20px' }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                background: 'rgba(221,4,38,0.1)', border: '1px solid rgba(221,4,38,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkle size={18} weight="duotone" color="#DD0426" />
              </div>
              <div>
                <h3 className="font-display font-bold" style={{ color: '#F5EBE0', fontSize: '15px', marginBottom: '8px' }}>
                  AI Recommendations
                </h3>
                <p className="font-sans" style={{ color: '#AAAAAA', fontSize: '13px', lineHeight: 1.7 }}>
                  Trained on your watch history and community signals — not just what was released this week. The more you use it, the sharper it gets.
                </p>
              </div>
            </Motion.div>

            {/* Tall card (1 col, 2 rows) */}
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="ss-card"
              style={{ gridColumn: '3', gridRow: '1 / span 2', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'rgba(142,27,52,0.1)', border: '1px solid rgba(142,27,52,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BookmarkSimple size={16} weight="duotone" color="#BE233F" />
              </div>
              <div>
                <h3 className="font-display font-bold" style={{ color: HERO_THEME.cream, fontSize: '15px', marginBottom: '6px' }}>Track Everything</h3>
                <p className="font-sans" style={{ color: HERO_THEME.textMuted, fontSize: '13px', lineHeight: 1.7 }}>Watching, completed, dropped. Rate it, remember it, revisit it.</p>
              </div>
              {!userId && (
                <Link
                  to="/signup"
                  className="font-mono"
                  style={{
                    marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px',
                    color: HERO_THEME.crimson, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}
                >
                  Start tracking <ArrowRight size={11} weight="bold" />
                </Link>
              )}
            </Motion.div>

            {/* Bottom left small card */}
            <Motion.div
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
                <h3 className="font-display font-bold" style={{ color: HERO_THEME.cream, fontSize: '14px', marginBottom: '3px' }}>Deep Discovery</h3>
                <p className="font-sans" style={{ color: HERO_THEME.textMuted, fontSize: '12px', lineHeight: 1.6 }}>
                  Filter by genre, season, studio. Cut through thousands of titles with precision.
                </p>
              </div>
            </Motion.div>
          </div>

          {/* Mobile: stack to 1 col */}
          <style>{`@media (max-width: 640px) { .bento-grid { grid-template-columns: 1fr !important; } .bento-grid > div { grid-column: auto !important; grid-row: auto !important; } }`}</style>
        </section>

        {/* ════════════════ GUEST CTA ════════════════ */}
        {!userId && (
          <Motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ paddingBottom: '80px' }}
          >
            <div style={{
              padding: '40px', borderRadius: '16px',
              background: `linear-gradient(135deg, rgba(221,4,38,0.08) 0%, rgba(42,31,45,0.6) 100%)`,
              border: '1px solid rgba(221,4,38,0.15)',
              display: 'flex', flexDirection: 'column', gap: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <div>
                <h2 className="font-display font-bold" style={{ color: HERO_THEME.cream, fontSize: '24px', marginBottom: '6px' }}>Start for free.</h2>
                <p className="font-sans" style={{ color: HERO_THEME.textMuted, fontSize: '15px', lineHeight: 1.6, maxWidth: '500px' }}>
                  Browse our massive library without signing up. Register when you're ready to track your history and get personalized recommendations.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '14px' }}>
                <Link to="/login"  className="ss-btn-ghost"   style={{ borderRadius: '10px', fontSize: '14px', padding: '10px 24px', color: HERO_THEME.cream, borderColor: 'rgba(186,175,184,0.2)' }}>Log In</Link>
                <Link to="/signup" className="ss-btn-primary" style={{ borderRadius: '10px', fontSize: '14px', padding: '10px 24px', background: `linear-gradient(135deg, ${HERO_THEME.crimson}, #A10A24)` }}>
                  Create Account <ArrowRight size={14} weight="bold" />
                </Link>
              </div>
            </div>
          </Motion.section>
        )}

      </div>
    </div>
  );
}

export default HomePage;
