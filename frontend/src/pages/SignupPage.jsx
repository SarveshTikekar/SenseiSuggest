import React, { useEffect, useState } from 'react';
import { signupUser, getCountries, getStates, getCities } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkle,
  UserCircle,
  MapPin,
  MapTrifold,
  Globe,
  ShieldCheck,
  EnvelopeSimple,
  UserPlus,
  LockSimple
} from '@phosphor-icons/react';

function SignupPage() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [country, setCountry] = useState('');
  const [states, setStates] = useState([]);
  const [state, setState] = useState('');
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState('');
  const [countries, setCountries] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getCountries();
        setCountries(data);
      } catch (err) {
        console.error("Failed to fetch countries:", err);
        setError("Failed to load countries.");
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (country) {
      const fetchStates = async () => {
        try {
          const data = await getStates(country);
          setStates(data);
          setState('');
          setCities([]);
          setCity('');
        } catch (err) {
          setStates([]);
          setError(`Failed to load states for ${country}.`);
        }
      };
      fetchStates();
    } else {
      setStates([]);
      setState('');
      setCities([]);
      setCity('');
    }
  }, [country]);

  useEffect(() => {
    if (state && country) { 
      const fetchCities = async () => {
        try {
          const data = await getCities(state, country); 
          setCities(data);
          setCity('');
        } catch (err) {
          setCities([]);
          setError(`Failed to load cities for ${state}.`);
        }
      };
      fetchCities();
    } else {
      setCities([]);
      setCity('');
    }
  }, [state, country]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!country.trim() || !state.trim() || !city.trim()) {
      setError('Please select your country, state, and city from the dropdowns.');
      return;
    }

    setLoading(true);
    try {
      const response = await signupUser({
        userName,
        email,
        password,
        country,
        city, 
        state,
      });

      setMessage(response.message || 'Account creation successful! 🌸');

      setUserName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setCountry('');
      setState('');
      setCity('');
      setStates([]);
      setCities([]);

      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to sign up. An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = `
    pl-11 appearance-none border border-[#222228] rounded-xl w-full py-3 px-4
    bg-[#0C0C0E] text-[#F0F0F5] leading-tight outline-none focus:border-[#E8385A]/40
    transition-all placeholder-[#3A3A4A] text-sm font-sans
  `;

  const disabledInputClasses = `disabled:opacity-40 disabled:cursor-not-allowed`;

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center py-12 px-4 overflow-hidden" style={{ background: '#0C0C0E' }}>
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[10%] w-[50%] h-[50%] rounded-full bg-[#E8385A]/[0.02] blur-[120px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[50%] h-[50%] rounded-full bg-[#6D28D9]/[0.015] blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-[520px] relative z-10"
      >
        {/* Header branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E8385A] to-[#C94470] mb-6 shadow-[0_8px_30px_rgba(232,56,90,0.2)]">
            <UserPlus size={32} weight="bold" className="text-white" />
          </div>
          <h2 className="text-3xl font-display font-black text-[#F0F0F5] tracking-tight mb-2">Join the Elite.</h2>
          <p className="text-[#888895] text-sm font-sans">Start your personalized anime discovery.</p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="ss-card p-8 md:p-10 border border-[#222228] bg-[#131316] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
        >
          {message && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#22C55E]/[0.08] text-[#22C55E] border border-[#22C55E]/[0.15] rounded-xl p-3.5 mb-6 text-center text-xs font-mono">
              {message}
            </motion.p>
          )}
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#EF4444]/[0.08] text-[#EF4444] border border-[#EF4444]/[0.15] rounded-xl p-3.5 mb-6 text-center text-xs font-mono">
              {error}
            </motion.p>
          )}

          <div className="space-y-5">
            {/* Identity */}
            <div className="relative group">
              <UserCircle size={20} weight="bold" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#3A3A4A] group-focus-within:text-[#E8385A] transition-colors" />
              <input type="text" id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} required className={inputClasses} placeholder="Public Username" />
            </div>
            <div className="relative group">
              <EnvelopeSimple size={20} weight="bold" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#3A3A4A] group-focus-within:text-[#E8385A] transition-colors" />
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses} placeholder="Email Courier" />
            </div>

            <div className="pt-2">
              <h3 className="text-[#F0F0F5] text-xs font-mono uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                <Globe size={14} weight="bold" className="text-[#E8385A]" />
                Location Node
              </h3>
              
              <div className="space-y-4">
                <div className="relative group">
                   <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} required className={`${inputClasses} appearance-none cursor-pointer`}>
                     <option value="" disabled>Select Country Region</option>
                     {countries.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <select id="state" value={state} onChange={(e) => setState(e.target.value)} required disabled={!country || states.length === 0} className={`${inputClasses} appearance-none cursor-pointer ${disabledInputClasses}`}>
                      <option value="" disabled>State</option>
                      {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="relative group">
                    <select id="city" value={city} onChange={(e) => setCity(e.target.value)} required disabled={!state || cities.length === 0} className={`${inputClasses} appearance-none cursor-pointer ${disabledInputClasses}`}>
                      <option value="" disabled>City</option>
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-[#F0F0F5] text-xs font-mono uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                <ShieldCheck size={14} weight="bold" className="text-[#E8385A]" />
                Security Layer
              </h3>
              <div className="space-y-4">
                <div className="relative group">
                  <LockSimple size={20} weight="bold" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#3A3A4A] group-focus-within:text-[#E8385A] transition-colors" />
                  <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClasses} placeholder="Passkey" />
                </div>
                <div className="relative group">
                  <LockSimple size={20} weight="bold" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#3A3A4A] group-focus-within:text-[#E8385A] transition-colors" />
                  <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClasses} placeholder="Verify Passkey" />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="ss-btn-primary w-full mt-10 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 group disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Initializing...' : 'Construct Account'}
          </button>
        </form>

        <p className="text-center text-[#3A3A4A] text-[13px] mt-8 font-sans">
          Already a member? <Link to="/login" className="text-[#E8385A] hover:text-[#F0A0B0] font-semibold transition-colors">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default SignupPage;