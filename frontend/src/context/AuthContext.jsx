import React, { createContext, useContext, useState, useEffect } from 'react';
// Removed loginUser and signupUser imports from AuthContext
// AuthContext should not directly call API functions for login/signup
// It manages the authentication state based on results from LoginPage/SignupPage
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    if (token && storedUserId) {
      setIsAuthenticated(true);
      setUserId(parseInt(storedUserId)); 
    }
    setLoadingAuth(false); 
  }, []);

  // This 'login' function in AuthContext now only updates state
  // It expects to be called *after* a successful API login
  const login = (id) => { // It's fine for it to take id and username
    // No API calls here
    localStorage.setItem('userId', id);
    // You might want to store the token here if not done in LoginPage
    // localStorage.setItem('token', token); 
    setIsAuthenticated(true);
    setUserId(id);
    // You might also want to store username if needed globally
  };

  // The 'register' function in AuthContext should also only update state
  // For simplicity, we'll keep it as a placeholder, as the actual API call
  // will happen in SignupPage.jsx
  const register = (id) => {
    // This function might not be strictly needed if registration doesn't auto-login
    // or if you handle post-registration logic directly in SignupPage
    console.log("AuthContext register called, user:", id);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName'); // Clear any extra bits
    setIsAuthenticated(false);
    setUserId(null);
    // Force redirect to landing to clear any remaining sensitive UI states
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, register, logout, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);