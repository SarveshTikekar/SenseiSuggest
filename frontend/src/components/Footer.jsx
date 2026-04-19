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
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 flex justify-center">
          <p className="text-[10px] font-accent uppercase tracking-[0.2em]" style={{ color: '#AAAAAA' }}>
            © {year} Sensei Suggest. All rights reserved.
          </p>
      </div>
    </footer>
  );
}

export default Footer;