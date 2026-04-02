import React, { useEffect, useState } from 'react';
import { signupUser, getCountries, getStates, getCities } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, UserPlus, MapPin, Map, Globe2, ShieldCheck, Mail, User } from 'lucide-react';

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
    pl-10 shadow-sm appearance-none border-2 border-kawaii-border rounded-xl w-full py-3 px-4
    text-kawaii-text-dark leading-tight focus:outline-none focus:border-kawaii-accent bg-anime-sub-card/50
    transition duration-200 ease-in-out font-medium placeholder-gray-400
  `;

  const disabledInputClasses = `disabled:opacity-40 disabled:bg-anime-sub-card/20 disabled:text-kawaii-text-muted disabled:cursor-not-allowed`;

  return (
    <div className="relative flex flex-grow items-center justify-center py-10 px-4 min-h-[calc(100vh-100px)] overflow-hidden">
      {/* Dynamic Background Elements */}
      <motion.div animate={{ y: [0, -30, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute pt-4 top-10 right-10 md:right-32 text-kawaii-accent opacity-30 z-0">
        <Sparkles size={120} />
      </motion.div>
      <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute bottom-10 left-10 md:left-32 text-kawaii-tertiary opacity-40 z-0">
        <Sparkles size={80} />
      </motion.div>

      <motion.form
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 90 }}
        onSubmit={handleSubmit}
        className="glass-card p-8 md:p-10 max-w-lg w-full relative z-10 border-2 border-white/60"
      >
        <div className="flex justify-center mb-6 text-kawaii-accent">
          <motion.div whileHover={{ scale: 1.2, rotate: 10 }}>
             <UserPlus size={48} />
          </motion.div>
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-kawaii-text-dark text-center mb-8">
          Join the Community 🌸
        </h2>

        {message && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-100 text-green-700 border border-green-300 rounded-lg p-4 mb-6 text-center font-bold">
            {message}
          </motion.p>
        )}
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-100 text-red-600 border border-red-300 rounded-lg p-4 mb-6 text-center font-bold">
            {error}
          </motion.p>
        )}

        <div className="grid grid-cols-1 gap-5">
          {/* Identity */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-kawaii-text-muted w-5 h-5" />
            <input type="text" id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} required className={inputClasses} placeholder="Username" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-kawaii-text-muted w-5 h-5" />
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses} placeholder="Email Address" />
          </div>

          <h3 className="text-lg font-display font-bold text-kawaii-text-dark mt-4 border-b-2 border-kawaii-border pb-2">Location Zone</h3>
          
          <div className="relative">
             <Globe2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-kawaii-text-muted w-5 h-5 z-10 pointer-events-none" />
             <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} required className={inputClasses}>
               <option value="" disabled>Select Country Region</option>
               {countries.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 text-kawaii-text-muted w-5 h-5 z-10 pointer-events-none" />
              <select id="state" value={state} onChange={(e) => setState(e.target.value)} required disabled={!country || states.length === 0} className={`${inputClasses} ${disabledInputClasses}`}>
                <option value="" disabled>Select State</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-kawaii-text-muted w-5 h-5 z-10 pointer-events-none" />
              <select id="city" value={city} onChange={(e) => setCity(e.target.value)} required disabled={!state || cities.length === 0} className={`${inputClasses} ${disabledInputClasses}`}>
                <option value="" disabled>Select City</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <h3 className="text-lg font-display font-bold text-kawaii-text-dark mt-4 border-b-2 border-kawaii-border pb-2">Security</h3>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-kawaii-text-muted w-5 h-5" />
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClasses} placeholder="Password" />
          </div>
          <div className="relative">
             <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-kawaii-text-muted w-5 h-5" />
            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClasses} placeholder="Confirm Password" />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full mt-8 bg-kawaii-accent hover:bg-kawaii-accent-dark text-white font-bold py-3 px-4 rounded-xl shadow-kawaii-soft transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </motion.button>

        <p className="text-center text-kawaii-text-muted text-sm mt-6 font-semibold">
          Already have an account? <Link to="/login" className="text-kawaii-accent hover:underline font-bold">Log In</Link>
        </p>
      </motion.form>
    </div>
  );
}

export default SignupPage;