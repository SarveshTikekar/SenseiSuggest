import React, { useState } from 'react';
import { loginUser } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Tv, Lock, User, LogIn } from 'lucide-react';

function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await loginUser({ userName_or_email: usernameOrEmail, password: password });
      login(response.userId, response.userName); 
      localStorage.setItem('token', response.access_token); 
      navigate('/'); 
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] overflow-hidden">
      {/* Decorative Background Elements */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }} 
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 md:left-1/4 text-kawaii-secondary opacity-40 z-0"
      >
        <Tv size={80} />
      </motion.div>
      <motion.div 
        animate={{ y: [0, 20, 0], rotate: [0, -10, 10, 0] }} 
        transition={{ duration: 7, delay: 1, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-10 md:right-1/4 text-kawaii-accent opacity-30 z-0"
      >
        <Tv size={100} />
      </motion.div>

      <motion.form 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        onSubmit={handleSubmit} 
        className="glass-card p-8 md:p-10 max-w-md w-full relative z-10 border-2 border-white/60"
      >
        <div className="flex justify-center mb-6 text-kawaii-accent">
          <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
            <Tv size={48} />
          </motion.div>
        </div>
        <h2 className="text-3xl font-display font-extrabold text-kawaii-text-dark text-center mb-8">Welcome Back!</h2>

        {error && (
          <motion.p 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="bg-red-100 text-red-600 border border-red-300 rounded-lg p-3 mb-6 text-center text-sm font-bold"
          >
            {error}
          </motion.p>
        )}

        <div className="mb-5 relative">
          <label htmlFor="usernameOrEmail" className="block text-kawaii-text-dark text-sm font-bold mb-2">
            Username or Email
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-kawaii-text-muted w-5 h-5" />
            <input
              type="text"
              id="usernameOrEmail"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
              className="pl-10 appearance-none border-2 border-kawaii-border rounded-xl w-full py-3 px-4 text-kawaii-text-dark leading-tight focus:outline-none focus:border-kawaii-accent bg-anime-sub-card/50 transition-colors placeholder-gray-400 font-medium"
              placeholder="e.g. Kirito01"
            />
          </div>
        </div>

        <div className="mb-8 relative">
          <label htmlFor="password" className="block text-kawaii-text-dark text-sm font-bold mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-kawaii-text-muted w-5 h-5" />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 appearance-none border-2 border-kawaii-border rounded-xl w-full py-3 px-4 text-kawaii-text-dark leading-tight focus:outline-none focus:border-kawaii-accent bg-anime-sub-card/50 transition-colors placeholder-gray-400 font-medium"
              placeholder="••••••••"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-kawaii-accent hover:bg-kawaii-accent-dark text-white font-bold py-3 px-4 rounded-xl focus:outline-none transition-colors shadow-kawaii-soft disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
             <span className="animate-pulse">Logging in...</span>
          ) : (
            <>
              <LogIn className="w-5 h-5" /> Login
            </>
          )}
        </motion.button>

        <p className="text-center text-kawaii-text-muted text-sm mt-6 font-semibold">
          Don't have an account? <Link to="/signup" className="text-kawaii-accent hover:text-kawaii-accent-dark transition-colors">Sign Up</Link>
        </p>
      </motion.form>
    </div>
  );
}

export default LoginPage;