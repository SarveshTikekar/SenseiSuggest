import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { getUserProfile } from '../api';
import { motion } from 'framer-motion';
import { Sparkles, User, LogOut, LogIn, UserPlus } from 'lucide-react';

function Navbar() {
  const { isAuthenticated, userId, logout, loadingAuth } = useAuth(); 
  const [navUserProfile, setNavUserProfile] = useState(null); 
  const [loadingNavProfile, setLoadingNavProfile] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNavProfile = async () => {
      if (isAuthenticated && userId) {
        setLoadingNavProfile(true);
        try {
          const response = await getUserProfile(userId);
          setNavUserProfile(response.UserProfile); 
        } catch (err) {
          console.error("Failed to fetch user profile for Navbar:", err);
          setNavUserProfile(null); 
        } finally {
          setLoadingNavProfile(false);
        }
      } else {
        setNavUserProfile(null); 
        setLoadingNavProfile(false);
      }
    };

    fetchNavProfile();
  }, [isAuthenticated, userId]); 

  const handleProfileClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 p-4"
    >
      <div className="container mx-auto flex justify-between items-center glass-card px-6 py-3">
        {/* Logo/Home Link */}
        <Link to="/" className="flex items-center gap-2 text-kawaii-accent font-display text-2xl font-bold hover:text-kawaii-accent-dark transition duration-300">
          <motion.div whileHover={{ rotate: 20, scale: 1.2 }}>
            <Sparkles className="w-8 h-8 text-kawaii-accent" />
          </motion.div>
          Sensei Suggest
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6 font-semibold">
          <Link to="/get_recommendations" className="text-kawaii-text-dark hover:text-kawaii-accent transition duration-300 hidden sm:block">
            Recommendations
          </Link>
          <Link to="/all-anime" className="text-kawaii-text-dark hover:text-kawaii-accent transition duration-300 hidden sm:block">
            Browse Anime
          </Link>

          {/* User Authentication / Profile Section */}
          {!loadingAuth && ( 
            <>
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {loadingNavProfile ? (
                    <div className="w-10 h-10 rounded-full bg-kawaii-bg flex items-center justify-center animate-pulse border-2 border-kawaii-border" />
                  ) : (
                    navUserProfile && navUserProfile.profilePicture ? (
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        src={navUserProfile.profilePicture}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-kawaii-accent shadow-sm"
                        onClick={handleProfileClick}
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = `https://ui-avatars.com/api/?name=${navUserProfile.userName}&background=FF9EB5&color=fff&size=128`; 
                        }}
                      />
                    ) : (
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-full bg-kawaii-tertiary flex items-center justify-center text-white cursor-pointer border-2 border-kawaii-accent shadow-sm" 
                        onClick={handleProfileClick}
                        title="View Profile"
                      >
                         <User className="w-5 h-5" />
                      </motion.div>
                    )
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 bg-kawaii-error text-white rounded-full hover:bg-red-500 transition duration-300 shadow-md"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/login" className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 text-white rounded-full hover:bg-white/10 transition duration-300 backdrop-blur-md shadow-sm font-semibold">
                      <LogIn className="w-4 h-4" />
                      Login
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/signup" className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-kawaii-secondary to-kawaii-tertiary text-white rounded-full hover:opacity-90 transition duration-300 font-bold shadow-kawaii-glow border border-white/20">
                      <UserPlus className="w-4 h-4" />
                      Sign Up
                    </Link>
                  </motion.div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;