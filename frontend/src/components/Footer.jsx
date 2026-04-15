import { Link } from 'react-router-dom';
import { GithubLogo, ArrowSquareOut, Heart } from '@phosphor-icons/react';

const WordMark = ({ size = '16px' }) => (
  <span
    className="font-display font-black select-none pointer-events-none"
    style={{
      fontSize: size,
      letterSpacing: '-0.04em',
      background: 'linear-gradient(135deg, #DD0426 0%, #F5EBE0 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}
  >
    SS.
  </span>
);

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t" style={{ borderColor: 'rgba(170, 170, 170, 0.1)', background: '#0D0D0D' }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Two column layout ── */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8 mb-8">

          {/* Left — Brand + tagline */}
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2 mb-3 group">
              <WordMark size="18px" />
            </Link>
            <p className="text-[13px] leading-relaxed font-sans" style={{ color: '#AAAAAA' }}>
              An AI-powered anime recommendation engine. Built to help you find your next obsession — faster.
            </p>
          </div>

          {/* Right — Developer info */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#AAAAAA', opacity: 0.6 }}>
              Developer
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium" style={{ color: '#AAAAAA' }}>Sarvesh Tikekar</p>
              <a
                href="https://github.com/SarveshTikekar/SenseiSuggest"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[13px] font-mono transition-colors group"
                style={{ color: '#AAAAAA' }}
                onMouseEnter={e => e.currentTarget.style.color = '#DD0426'}
                onMouseLeave={e => e.currentTarget.style.color = '#AAAAAA'}
              >
                <GithubLogo size={16} weight="bold" />
                SenseiSuggest
                <ArrowSquareOut size={14} weight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px mb-6" style={{ background: 'rgba(170, 170, 170, 0.1)' }} />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] font-mono" style={{ color: '#AAAAAA' }}>
            © {year} Sensei Suggest. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-[11px] font-mono" style={{ color: '#AAAAAA' }}>
            Built with
            <Heart size={12} weight="fill" style={{ color: '#DD0426' }} />
            for anime lovers.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;