import React, { useEffect, useState } from 'react';
import { signupUser, getCountries, getStates, getCities } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
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
        } catch {
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
        } catch {
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
    pl-11 appearance-none border border-white/10 rounded-xl w-full py-3 px-4
    bg-black/20 text-[#F5EBE0] leading-tight outline-none focus:border-[#DD0426]/40
    transition-all placeholder-[#AAAAAA]/50 text-sm font-sans
  `;

  const disabledInputClasses = `disabled:opacity-40 disabled:cursor-not-allowed`;

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center py-12 px-4 overflow-hidden" style={{ background: '#0D0D0D' }}>
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[10%] w-[50%] h-[50%] rounded-full bg-[#DD0426]/[0.02] blur-[120px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[50%] h-[50%] rounded-full bg-[#8E1B34]/[0.015] blur-[120px]" />
      </div>

      <Motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-[520px] relative z-10"
      >
        {/* Header branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DD0426] to-[#A10A24] mb-6 shadow-[0_8px_30px_rgba(221,4,38,0.2)]">
            <UserPlus size={32} weight="bold" className="text-white" />
          </div>
          <h2 className="text-4xl font-display text-[#F5EBE0] tracking-tight mb-2">Join the Elite.</h2>
          <p className="text-[#AAAAAA] text-[1.4rem] font-hand">Start your personalized anime discovery.</p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="ss-card p-8 md:p-10 border border-white/10 bg-white/[0.03] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-md"
        >
          {message && (
            <Motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#22C55E]/[0.08] text-[#22C55E] border border-[#22C55E]/[0.15] rounded-xl p-3.5 mb-6 text-center text-[10px] font-accent uppercase tracking-widest">
              {message}
            </Motion.p>
          )}
          {error && (
            <Motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#EF4444]/[0.08] text-[#EF4444] border border-[#EF4444]/[0.15] rounded-xl p-3.5 mb-6 text-center text-[10px] font-accent uppercase tracking-widest">
              {error}
            </Motion.p>
          )}

          <div className="space-y-5">
            {/* Identity */}
            <div className="relative group">
              <UserCircle size={20} weight="bold" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#AAAAAA] group-focus-within:text-[#DD0426] transition-colors" />
              <input type="text" id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} required className={inputClasses} placeholder="Public Username" />
            </div>
            <div className="relative group">
              <EnvelopeSimple size={20} weight="bold" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#AAAAAA] group-focus-within:text-[#DD0426] transition-colors" />
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses} placeholder="Email Courier" />
            </div>

            <div className="pt-2">
              <h3 className="text-[#F5EBE0] text-[10px] font-accent uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                <Globe size={14} weight="bold" className="text-[#DD0426]" />
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
              <h3 className="text-[#F5EBE0] text-[10px] font-accent uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                <ShieldCheck size={14} weight="bold" className="text-[#DD0426]" />
                Security Layer
              </h3>
              <div className="space-y-4">
                <div className="relative group">
                  <LockSimple size={20} weight="bold" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#AAAAAA] group-focus-within:text-[#DD0426] transition-colors" />
                  <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClasses} placeholder="Passkey" />
                </div>
                <div className="relative group">
                  <LockSimple size={20} weight="bold" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#AAAAAA] group-focus-within:text-[#DD0426] transition-colors" />
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

        <p className="text-center text-[#AAAAAA] text-[13px] mt-8 font-sans">
          Already a member? <Link to="/login" className="text-[#DD0426] hover:text-[#F5EBE0] font-semibold transition-colors">Log in</Link>
        </p>
      </Motion.div>
    </div>
  );
}

export default SignupPage;