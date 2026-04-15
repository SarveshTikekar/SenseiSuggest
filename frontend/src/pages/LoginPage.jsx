import React, { useState } from 'react';
import { loginUser } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion as Motion } from 'framer-motion';
import { TelevisionSimple, LockSimple, UserCircle, SignIn } from '@phosphor-icons/react';

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
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 overflow-hidden" style={{ background: '#0D0D0D' }}>
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-[#DD0426]/[0.03] blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-[#8E1B34]/[0.02] blur-[120px]" />
      </div>

      <Motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-[400px] relative z-10"
      >
        {/* Header branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DD0426] to-[#A10A24] mb-6 shadow-[0_8px_30px_rgba(221,4,38,0.2)]">
            <TelevisionSimple size={32} weight="bold" className="text-white" />
          </div>
          <h2 className="text-3xl font-display font-black text-[#F5EBE0] tracking-tight mb-2">Welcome Back.</h2>
          <p className="text-[#AAAAAA] text-sm font-sans">Continue your anime journey with Sensei.</p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="ss-card p-8 md:p-10 border border-white/10 bg-white/[0.03] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-md"
        >
          {error && (
            <Motion.p 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="bg-[#EF4444]/[0.08] text-[#EF4444] border border-[#EF4444]/[0.15] rounded-xl p-3.5 mb-6 text-center text-xs font-mono"
            >
              {error}
            </Motion.p>
          )}

          <div className="mb-5">
            <label htmlFor="usernameOrEmail" className="block text-[#F5EBE0] text-xs font-mono uppercase tracking-widest mb-2.5 ml-1">
              Identify Yourself
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8D7F8B] group-focus-within:text-[#DD0426] transition-colors">
                <UserCircle size={20} weight="bold" />
              </div>
              <input
                type="text"
                id="usernameOrEmail"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
                className="pl-12 appearance-none border border-white/10 rounded-xl w-full py-3 px-4 bg-black/20 text-[#F5EBE0] leading-tight outline-none focus:border-[#DD0426]/40 transition-all placeholder-[#AAAAAA]/50 text-sm font-sans"
                placeholder="Username or Email"
              />
            </div>
          </div>

          <div className="mb-8">
            <label htmlFor="password" className="block text-[#F5EBE0] text-xs font-mono uppercase tracking-widest mb-2.5 ml-1">
              Secret Key
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8D7F8B] group-focus-within:text-[#DD0426] transition-colors">
                <LockSimple size={20} weight="bold" />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-12 appearance-none border border-white/10 rounded-xl w-full py-3 px-4 bg-black/20 text-[#F5EBE0] leading-tight outline-none focus:border-[#DD0426]/40 transition-all placeholder-[#AAAAAA]/50 text-sm font-sans"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="ss-btn-primary w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 group disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
               <span className="animate-pulse">Authorizing...</span>
            ) : (
              <>
                <SignIn size={18} weight="bold" className="transition-transform group-hover:translate-x-1" />
                Access Library
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[#8D7F8B] text-[13px] mt-8 font-sans">
          New to the library? <Link to="/signup" className="text-[#DD0426] hover:text-[#F5EBE0] font-semibold transition-colors">Create account</Link>
        </p>
      </Motion.div>
    </div>
  );
}

export default LoginPage;