import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  SquaresFour,
  UserCircle,
  SignOut,
  SignIn,
  UserPlus,
  List,
  X,
  MagnifyingGlass
} from '@phosphor-icons/react';

const WordMark = () => (
  <span
    className="font-display font-black select-none"
    style={{
      fontSize: '20px',
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

const NAV_LINKS = [
  { label: 'Discover', to: '/get_recommendations', icon: Compass },
  { label: 'Browse',   to: '/all-anime',            icon: SquaresFour },
];

function Navbar({ onSearchOpen }) {
  const { isAuthenticated, userId, logout, loadingAuth } = useAuth();
  const [navUserProfile, setNavUserProfile] = useState(null);
  const [scrolled, setScrolled]             = useState(false);
  const [mobileOpen, setMobileOpen]         = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !userId) { setNavUserProfile(null); return; }
    getUserProfile(userId)
      .then(r => setNavUserProfile(r.UserProfile))
      .catch(() => setNavUserProfile(null));
  }, [isAuthenticated, userId]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ── Main Navbar ── Q8-C: full-width + bottom border line */}
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-[#06080F]/95 border-b border-[#1E2535] shadow-[0_1px_0_rgba(255,255,255,0.03)]'
            : 'bg-[#06080F]/80 border-b border-[#1E2535]/60'
        }`}
        style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* logo */}
          <Link to="/" className="flex items-center gap-1 group flex-shrink-0">
            <WordMark />
          </Link>

          {/* center links */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'text-[#E8385A] bg-[#E8385A]/8'
                    : 'text-[#8892A4] hover:text-[#EDF0F7] hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {isActive(to) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-lg ring-1 ring-[#E8385A]/30"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* right: search + auth */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Q10-B: Cmd+K trigger */}
            <button
              onClick={onSearchOpen}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161B27] border border-[#1E2535] text-[#3D4A5C] hover:text-[#8892A4] hover:border-[#3D4A5C] transition-all text-[12px] font-mono group"
            >
              <MagnifyingGlass size={14} weight="bold" />
              <span>Search</span>
              <kbd className="hidden lg:flex items-center gap-0.5 ml-1">
                <span className="px-1 py-0.5 rounded bg-[#0D1117] border border-[#1E2535] text-[10px]">⌘</span>
                <span className="px-1 py-0.5 rounded bg-[#0D1117] border border-[#1E2535] text-[10px]">K</span>
              </kbd>
            </button>

            {!loadingAuth && (
              <>
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => navigate(`/profile/${userId}`)}
                      className="w-8 h-8 rounded-lg overflow-hidden border border-[#1E2535] hover:border-[#E8385A]/40 transition-colors"
                    >
                      {navUserProfile?.profilePicture ? (
                        <img
                          src={navUserProfile.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={e => {
                            e.target.src = `https://ui-avatars.com/api/?name=${navUserProfile?.userName || 'U'}&background=E0206F&color=fff&size=128`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#E8385A] to-[#6D28D9] flex items-center justify-center">
                          <UserCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                    <button
                      onClick={logout}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#888895] hover:text-[#F0F0F5] hover:bg-white/[0.04] transition-all"
                    >
                      <SignOut size={16} weight="bold" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-[#888895] hover:text-[#F0F0F5] hover:bg-white/[0.04] transition-all"
                    >
                      <SignIn size={16} weight="bold" />
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-bold text-white bg-gradient-to-r from-[#E8385A] to-[#6D28D9] hover:opacity-90 transition-opacity shadow-[0_2px_12px_rgba(232,56,90,0.3)]"
                    >
                      <UserPlus size={16} weight="bold" />
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-1.5 rounded-lg text-[#888895] hover:text-[#F0F0F5] hover:bg-white/[0.04] transition-all"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-[#1E2535] overflow-hidden"
            >
              <div className="max-w-screen-xl mx-auto px-4 py-3 space-y-1">
                {/* Mobile search */}
                <button
                  onClick={() => { setMobileOpen(false); onSearchOpen(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#888895] hover:text-[#F0F0F5] hover:bg-white/[0.04] transition-all text-left"
                >
                  <MagnifyingGlass size={18} weight="bold" />
                  Search anime...
                </button>

                {NAV_LINKS.map(({ label, to, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive(to) ? 'text-[#E8385A] bg-[#E8385A]/8' : 'text-[#8892A4] hover:text-[#EDF0F7] hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))}

                <div className="pt-2 border-t border-[#1E2535]">
                  {!loadingAuth && !isAuthenticated ? (
                    <div className="flex gap-2 pt-1">
                      <Link to="/login"  className="flex-1 text-center py-2 rounded-xl text-sm font-medium text-[#8892A4] hover:text-[#EDF0F7] hover:bg-white/[0.04] transition-all">Login</Link>
                      <Link to="/signup" className="flex-1 text-center py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#E8385A] to-[#6D28D9]">Sign Up</Link>
                    </div>
                  ) : !loadingAuth && isAuthenticated ? (
                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#8892A4] hover:text-[#EDF0F7] hover:bg-white/[0.04] transition-all mt-1">
                      <SignOut size={18} weight="bold" /> Logout
                    </button>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

export default Navbar;