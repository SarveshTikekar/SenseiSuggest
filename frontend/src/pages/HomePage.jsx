import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Star, Search } from 'lucide-react';

// Animation variants
const floatingVariants = {
  animate: {
    y: [0, -20, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

function HomePage() {
  const { userId } = useAuth();

  return (
    <div className="relative min-h-screen pb-16 overflow-hidden">
      {/* Dynamic Background Elements (Parallax illusion) */}
      <motion.div variants={floatingVariants} animate="animate" className="absolute top-20 left-10 text-kawaii-secondary opacity-50 z-0">
        <Sparkles size={64} />
      </motion.div>
      <motion.div variants={floatingVariants} animate="animate" transition={{ delay: 1, duration: 6, repeat: Infinity }} className="absolute top-60 right-20 text-kawaii-tertiary opacity-40 z-0">
        <Star size={80} fill="currentColor" />
      </motion.div>
      <motion.div variants={floatingVariants} animate="animate" transition={{ delay: 2, duration: 7, repeat: Infinity }} className="absolute bottom-40 left-1/4 text-kawaii-accent opacity-30 z-0">
        <Sparkles size={100} />
      </motion.div>

      <div className="container mx-auto relative z-10 pt-10 px-4">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold text-kawaii-accent mb-4 drop-shadow-md flex items-center justify-center gap-4">
            <Sparkles className="text-kawaii-tertiary w-10 h-10 md:w-16 md:h-16" />
            {userId ? 'Your Dashboard' : 'Explore Anime'}
            <Sparkles className="text-kawaii-tertiary w-10 h-10 md:w-16 md:h-16" />
          </h1>
          <p className="text-lg md:text-xl text-kawaii-text-dark opacity-80 max-w-2xl mx-auto font-medium">
            Discover your next obsession in a world of endless stories. 🌸
          </p>
        </motion.div>

        {/* About Project Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-card p-10 max-w-5xl mx-auto mt-8 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-kawaii-accent mb-6 drop-shadow-md">Welcome to Sensei Suggest</h2>
          <p className="text-lg md:text-xl text-kawaii-text-dark leading-relaxed mb-8 max-w-3xl mx-auto font-medium">
            An intelligent anime recommendation engine crafted with a modern, cyberpunk-inspired aesthetic. 
            We analyze watch history, community ratings, and genre preferences to curate the perfect anime lineup just for you.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
             <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-kawaii-secondary transition-all hover:-translate-y-2 duration-300 shadow-lg group">
                <div className="bg-kawaii-secondary/20 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Star className="w-10 h-10 text-kawaii-secondary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-wide">Smart Recommendations</h3>
                <p className="text-base text-kawaii-text-muted">Powered by personalized algorithms to ensure high-quality, tailored suggestions.</p>
             </div>
             <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-kawaii-tertiary transition-all hover:-translate-y-2 duration-300 shadow-lg group">
                <div className="bg-kawaii-tertiary/20 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Search className="w-10 h-10 text-kawaii-tertiary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-wide">Deep Discovery</h3>
                <p className="text-base text-kawaii-text-muted">Filter through an extensive database of genres and seasons to find hidden masterpieces.</p>
             </div>
             <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-kawaii-accent transition-all hover:-translate-y-2 duration-300 shadow-lg group">
                <div className="bg-kawaii-accent/20 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-10 h-10 text-kawaii-accent" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-wide">Premium Experience</h3>
                <p className="text-base text-kawaii-text-muted">A sleek, fast, and responsive dark-mode interface built to delight the senses.</p>
             </div>
          </div>
          
          {!userId && (
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               transition={{ delay: 0.5 }}
               className="mt-14 flex flex-col sm:flex-row justify-center gap-6"
            >
               <Link to="/signup" className="px-8 py-3 bg-gradient-to-r from-kawaii-secondary to-kawaii-tertiary text-white rounded-full hover:opacity-90 transition font-bold shadow-kawaii-glow text-lg">
                 Join the Community
               </Link>
               <Link to="/login" className="px-8 py-3 border border-white/20 bg-white/5 text-white rounded-full hover:bg-white/10 transition font-bold backdrop-blur-md text-lg">
                 Log In
               </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default HomePage;