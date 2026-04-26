import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../api';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  SquaresFour,
  UserCircle,
  SignOut,
  SignIn,
  UserPlus,
  List,
  X,
  MagnifyingGlass,
  Bell,
  Sword,
  ShieldCheck
} from '@phosphor-icons/react';
import { getPendingRequests, processFriendRequest } from '../api';

const WordMark = () => (
  <span
    className="select-none"
    style={{
      fontFamily: 'var(--font-display)',
      fontSize: '22px',
      letterSpacing: '0.05em',
      background: 'linear-gradient(135deg, #DD0426 0%, #F5EBE0 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}
  >
    SenseiSuggest
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
  const [notifications, setNotifications]   = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const fetchNotifications = async () => {
    if (!isAuthenticated || !userId) return;
    try {
      const data = await getPendingRequests(userId);
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !userId) { setNavUserProfile(null); setNotifications([]); return; }
    
    // Initial fetch
    fetchNotifications();
    
    // Profile info
    getUserProfile(userId)
      .then(r => setNavUserProfile(r.UserProfile))
      .catch(() => setNavUserProfile(null));
      
    // Periodic check for new invites
    const interval = setInterval(fetchNotifications, 30000); // 30s
    return () => clearInterval(interval);
  }, [isAuthenticated, userId]);

  useEffect(() => { setMobileOpen(false); setShowNotifDropdown(false); }, [location.pathname]);

  const handleAction = async (sender_id, action) => {
    try {
      await processFriendRequest({
        sender_id,
        receiver_id: userId,
        action
      });
      // Refresh notifications immediately
      await fetchNotifications();
    } catch (err) {
      alert("Failed to process request: " + err.message);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ── Main Navbar ── Q8-C: full-width + bottom border line */}
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-[#0D0D0D]/95 border-b border-[#AAAAAA]/10 shadow-[0_1px_15px_rgba(0,0,0,0.2)]'
            : 'bg-[#0D0D0D]/80 border-b border-[#AAAAAA]/5'
        }`}
        style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-full px-6 sm:px-10 h-14 flex items-center justify-between gap-4">

          {/* logo */}
          <Link to="/" className="flex items-center gap-1 group flex-shrink-0">
            <WordMark />
          </Link>

          {/* center links */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-accent uppercase tracking-widest transition-all duration-200 ${
                    isActive(link.to)
                      ? 'text-[#DD0426] bg-[#DD0426]/8'
                      : 'text-[#AAAAAA] hover:text-[#F5EBE0] hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                  {isActive(link.to) && (
                    <Motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg ring-1 ring-[#DD0426]/30"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* right: search + auth */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Q10-B: Cmd+K trigger */}
            <button
              onClick={onSearchOpen}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#AAAAAA]/5 border border-[#AAAAAA]/10 text-[#AAAAAA] hover:text-[#F5EBE0] hover:border-[#AAAAAA]/30 transition-all text-[11px] font-accent uppercase tracking-widest group"
            >
              <MagnifyingGlass size={14} weight="bold" />
              <span>Search</span>
              <kbd className="hidden lg:flex items-center gap-0.5 ml-1 font-sans">
                <span className="px-1 py-0.5 rounded bg-black/20 border border-[#AAAAAA]/10 text-[10px]">⌘</span>
                <span className="px-1 py-0.5 rounded bg-black/20 border border-[#AAAAAA]/10 text-[10px]">K</span>
              </kbd>
            </button>

            {!loadingAuth && (
              <>
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => navigate(`/profile/${userId}`)}
                      className="w-8 h-8 rounded-lg overflow-hidden border border-[#2A2A2A] hover:border-[#DD0426]/40 transition-colors"
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
                        <div className="w-full h-full bg-gradient-to-br from-[#DD0426] to-[#8E1B34] flex items-center justify-center">
                          <UserCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>

                    {/* Notification Bell */}
                    <div className="relative">
                      <button
                        onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                        className={`p-2 rounded-lg transition-all relative ${
                          showNotifDropdown ? 'text-[#DD0426] bg-[#DD0426]/10' : 'text-[#AAAAAA] hover:text-[#F5EBE0] hover:bg-white/5'
                        }`}
                      >
                        <Bell size={20} weight={notifications.length > 0 ? "fill" : "bold"} />
                        {notifications.length > 0 && (
                          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#DD0426] text-[9px] text-white font-black rounded-full flex items-center justify-center border-2 border-[#0D0D0D]">
                            {notifications.length}
                          </span>
                        )}
                      </button>

                      <AnimatePresence>
                        {showNotifDropdown && (
                          <Motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-80 bg-[#111111] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl"
                          >
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                              <h4 className="text-[10px] font-accent uppercase tracking-[0.2em] text-[#AAAAAA] font-black">Notifications</h4>
                              {notifications.length > 0 && <span className="text-[9px] font-accent text-[#DD0426] animate-pulse">Action Required</span>}
                            </div>
                            
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                              {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                  <div key={notif.req_id} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-start gap-3">
                                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                                        <img 
                                          src={notif.sender?.profilePicture || `https://ui-avatars.com/api/?name=${notif.sender?.userName || 'U'}&background=DD0426&color=fff`} 
                                          className="w-full h-full object-cover"
                                          alt=""
                                        />
                                      </div>
                                      <div className="flex-grow">
                                        <p className="text-[11px] text-[#F5EBE0] font-accent leading-tight">
                                          <span className="text-[#DD0426] font-black">{notif.sender?.userName}</span> has sent a friend request.
                                        </p>
                                        <p className="text-[9px] text-[#AAAAAA] mt-1 opacity-50 uppercase tracking-tighter">Incoming • 24h TTL</p>
                                        <div className="flex items-center gap-2 mt-3">
                                          <button 
                                            onClick={() => handleAction(notif.sender_id, "ACCEPT")}
                                            className="flex-grow py-1.5 bg-[#DD0426] hover:bg-[#A10A24] text-white text-[9px] font-accent uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5"
                                          >
                                            <ShieldCheck size={12} weight="bold" /> Accept
                                          </button>
                                          <button 
                                            onClick={() => handleAction(notif.sender_id, "REJECT")}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[#AAAAAA] hover:text-[#F5EBE0] text-[9px] font-accent uppercase tracking-widest rounded-lg transition-all"
                                          >
                                            Dismiss
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-10 text-center">
                                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 opacity-20">
                                    <Sword size={20} className="text-[#AAAAAA]" />
                                  </div>
                                  <p className="text-[10px] font-accent uppercase tracking-widest text-[#AAAAAA] opacity-40">No pending requests</p>
                                </div>
                              )}
                            </div>
                          </Motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button
                      onClick={logout}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-accent uppercase tracking-widest text-[#AAAAAA] hover:text-[#F5EBE0] hover:bg-white/[0.04] transition-all"
                    >
                      <SignOut size={16} weight="bold" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-accent uppercase tracking-widest text-[#AAAAAA] hover:text-[#F5EBE0] hover:bg-white/[0.04] transition-all"
                    >
                      <SignIn size={16} weight="bold" />
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-accent uppercase tracking-widest text-white bg-gradient-to-r from-[#DD0426] to-[#A10A24] hover:opacity-90 transition-opacity shadow-[0_4px_12px_rgba(221,4,38,0.3)]"
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
              className="md:hidden p-1.5 rounded-lg text-[#AAAAAA] hover:text-[#F5EBE0] hover:bg-white/[0.04] transition-all"
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
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-[#AAAAAA]/10 overflow-hidden"
            >
              <div className="max-w-screen-xl mx-auto px-4 py-3 space-y-1">
                {/* Mobile search */}
                <button
                  onClick={() => { setMobileOpen(false); onSearchOpen(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-accent uppercase tracking-widest text-[#AAAAAA] hover:text-[#F5EBE0] hover:bg-white/[0.04] transition-all text-left"
                >
                  <MagnifyingGlass size={18} weight="bold" />
                  Search anime...
                </button>

                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-accent uppercase tracking-widest transition-all ${
                        isActive(link.to) ? 'text-[#DD0426] bg-[#DD0426]/8' : 'text-[#AAAAAA] hover:text-[#F5EBE0] hover:bg-white/[0.04]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}

                <div className="pt-2 border-t border-[#AAAAAA]/10">
                  {!loadingAuth && !isAuthenticated ? (
                    <div className="flex gap-2 pt-1">
                      <Link to="/login"  className="flex-1 text-center py-2 rounded-xl text-[11px] font-accent uppercase tracking-widest text-[#AAAAAA] hover:text-[#F5EBE0] hover:bg-white/[0.04] transition-all">Login</Link>
                      <Link to="/signup" className="flex-1 text-center py-2 rounded-xl text-[11px] font-accent uppercase tracking-widest text-white bg-gradient-to-r from-[#DD0426] to-[#A10A24]">Sign Up</Link>
                    </div>
                  ) : !loadingAuth && isAuthenticated ? (
                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-accent uppercase tracking-widest text-[#AAAAAA] hover:text-[#F5EBE0] hover:bg-white/[0.04] transition-all mt-1">
                      <SignOut size={18} weight="bold" /> Logout
                    </button>
                  ) : null}
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

export default Navbar;