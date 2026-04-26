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
    style={{ width: '240px' }}
  >
    <div style={{
      width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden',
      background: '#1A1A1A', border: '1px solid #2A2A2A', flexShrink: 0,
      transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)', position: 'relative',
    }}
      className="group-hover:border-[#DD0426]/60 group-hover:-translate-y-2 shadow-2xl"
    >
      {/* Blurred Backdrop */}
      <img
        src={anime.image_url_base_anime || ''}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(20px)', opacity: 0.4, transform: 'scale(1.2)' }}
        aria-hidden
      />
      <img
        src={anime.image_url_base_anime || ''}
        alt={anime.animeName}
        style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }}
        className="transition-transform duration-700 group-hover:scale-110 p-2"
        onError={e => { e.target.style.display = 'none'; }}
      />
    </div>
    <div className="mt-4 space-y-1">
      <p
        className="font-display font-black line-clamp-1 group-hover:text-[#DD0426] transition-colors uppercase tracking-tight"
        style={{ fontSize: '14px', color: '#F5EBE0' }}
      >
        {anime.animeName}
      </p>
      <div className="flex items-center gap-2">
         <span style={{ width: '12px', height: '1px', background: '#DD0426' }} />
         <p style={{ fontSize: '9px', color: '#8D7F8B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
           Subtitled & Dubbed
         </p>
      </div>
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
    <div className="relative pb-24 min-h-[60vh] w-full" style={{ overflowX: 'clip' }}>
      <div className="relative" style={{ zIndex: 10, maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* ════════════════ HERO ════════════════ */}
        <section style={{ paddingTop: '72px', paddingBottom: '64px' }}>
          <div className="hero-main-grid" style={{ display: 'grid', gap: '28px', alignItems: 'start' }}>
            <div className="hero-text-area">
              {/* Eyebrow — line + label, no pill badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <span style={{ width: '28px', height: '1px', background: HERO_THEME.crimson, display: 'inline-block' }} />
                <span style={{
                  color: HERO_THEME.textMuted, fontSize: '10px', fontFamily: 'var(--font-accent)',
                  fontWeight: 400, letterSpacing: '0.2em', textTransform: 'uppercase'
                }}>
                  Anime Discovery Engine
                </span>
              </div>

              {/* Main headline */}
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  color: HERO_THEME.cream, lineHeight: 1.1,
                  letterSpacing: '0.02em', marginBottom: '24px',
                  fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
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

              <p style={{ 
                fontFamily: 'var(--font-sans)',
                color: HERO_THEME.textMuted, 
                fontSize: '1rem', 
                lineHeight: 1.6, 
                maxWidth: '520px', 
                marginBottom: '32px' 
              }}>
                {userId
                  ? "Your collection is synced. Personalized recommendations are ready."
                  : "We analyze your viewing history, community data, and preferences to surface content you'll genuinely enjoy."}
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
                      Search Records
                      <kbd style={{
                        padding: '1px 5px', borderRadius: '4px',
                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(170, 170, 170, 0.18)',
                        fontSize: '10px', fontFamily: 'Space Grotesk', color: HERO_THEME.cream,
                      }}>⌘K</kbd>
                    </button>
                )}
              </div>
            </div>

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

        {/* ════════════════ LIBRARY PREVIEW (MARQUEE) ════════════════ */}
        {preview.length > 0 && (
          <section style={{ paddingBottom: '100px', paddingTop: '20px' }} className="relative overflow-hidden">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '2px', height: '16px', background: HERO_THEME.crimson, borderRadius: '99px', display: 'inline-block' }} />
                <h2 className="font-display font-bold" style={{ color: HERO_THEME.cream, fontSize: '18px' }}>Library Preview</h2>
              </div>
              <Link
                to="/all-anime"
                className="flex items-center gap-1 font-mono transition-colors"
                style={{ color: HERO_THEME.textMuted, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase' }}
              >
                Explore all <ArrowRight size={11} weight="bold" />
              </Link>
            </div>

            {/* Infinite Marquee Container */}
            <div className="marquee-container relative flex overflow-hidden">
              <Motion.div 
                className="flex gap-12 whitespace-nowrap"
                animate={{ x: [0, -1500] }}
                transition={{ 
                  duration: 40, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                {[...preview, ...preview, ...preview].map((anime, idx) => (
                  <PreviewCard key={`${anime.animeId}-${idx}`} anime={anime} />
                ))}
              </Motion.div>
            </div>
            
            <style>{`
              .marquee-container::before, .marquee-container::after {
                content: "";
                position: absolute;
                top: 0;
                width: 150px;
                height: 100%;
                z-index: 2;
                pointer-events: none;
              }
              .marquee-container::before {
                left: 0;
                background: linear-gradient(to right, #0D0D0D, transparent);
              }
              .marquee-container::after {
                right: 0;
                background: linear-gradient(to left, #0D0D0D, transparent);
              }
            `}</style>
          </section>
        )}

      </div>
    </div>
  );
}

export default HomePage;
