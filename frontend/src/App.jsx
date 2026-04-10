import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Footer    from './components/Footer';
import Navbar    from './components/Navbar';
import SearchModal from './components/SearchModal';

import HomePage        from './pages/HomePage';
import SignupPage      from './pages/SignupPage';
import LoginPage       from './pages/LoginPage';
import AnimeDetailPage from './pages/AnimeDetail';
import AdminPage       from './pages/AdminPage';
import BrowseAnimePage from './pages/BrowseAnime';
import RecommendationPage from './pages/Recommendations';
import UserProfilePage from './pages/UserProfile';
import { AuthProvider } from './context/AuthContext';

/* ── Page slide-up transition ── */
const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18, ease: 'easeIn' } },
};

function AnimatedRoutes({ onSearchOpen }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ flex: 1 }}
      >
        <Routes location={location}>
          <Route path="/"                        element={<HomePage onSearchOpen={onSearchOpen} />} />
          <Route path="/signup"                  element={<SignupPage />} />
          <Route path="/login"                   element={<LoginPage />} />
          <Route path="/all-anime"               element={<BrowseAnimePage />} />
          <Route path="/anime/details/:animeName" element={<AnimeDetailPage />} />
          <Route path="/admin"                   element={<AdminPage />} />
          <Route path="/get_recommendations/"    element={<RecommendationPage />} />
          <Route path="/profile/:userId"         element={<UserProfilePage />} />
          <Route path="*"                        element={
            <div className="flex items-center justify-center min-h-[50vh] text-center px-4">
              <div>
                <p className="font-display font-bold text-5xl text-[#1E2535] mb-4">404</p>
                <p className="text-[#8892A4] text-lg">This page doesn't exist.</p>
              </div>
            </div>
          } />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen" style={{ background: '#06080F' }}>
          <Navbar onSearchOpen={() => setSearchOpen(true)} />
          <main style={{ flex: 1 }}>
            <AnimatedRoutes onSearchOpen={() => setSearchOpen(true)} />
          </main>
          <Footer />

          {/* Global Cmd+K search modal */}
          <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;